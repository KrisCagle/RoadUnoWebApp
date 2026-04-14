import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Music, DollarSign, Loader2, RotateCw, Map as MapIcon, ExternalLink, BookmarkPlus, LayoutTemplate, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { logActivity } from '@/lib/activityLogger';
import { useNavigate } from 'react-router-dom';
import { GOOGLE_API_KEY } from '@/config/google';
import { loadArtistSettings } from '@/services/artistSettings';
import { useTourQuota, canUseTourAssistant } from '@/hooks/useTourQuota';
import { buildPromptFromForm, enrichVenueDescriptionsIfMissing, parseCityStateFromAddress } from '@/utils/tourAssistantHelpers';
import SignupPromptModal from '@/components/SignupPromptModal';
import VenueCard from '@/components/VenueCard';

const VENUE_TYPES = ["Dive Bar", "Club", "Theater", "Lounge", "Coffee Shop", "Festival", "Arena", "Brewery"];

// Shared module-level variable for the InfoWindow
let currentInfoWindow = null;
const initializeStreetView = (containerDiv, venue) => {
  const svService = new window.google.maps.StreetViewService();
  const position = venue._position || {
    lat: venue.lat || venue.latitude || 0,
    lng: venue.lng || venue.longitude || 0
  };
  svService.getPanorama({
    location: position,
    radius: 50
  }, (data, status) => {
    if (status === window.google.maps.StreetViewStatus.OK) {
      new window.google.maps.StreetViewPanorama(containerDiv, {
        position: data.location.latLng,
        pov: {
          heading: 0,
          pitch: 0
        },
        zoom: 1,
        addressControl: false,
        enableCloseButton: false,
        linksControl: true,
        panControl: true
      });
    } else {
      containerDiv.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #666; font-size: 14px; padding: 10px; text-align: center; box-sizing: border-box;">Street View not available here.</div>';
    }
  });
};
const openVenueInfoWindow = (marker, venue) => {
  if (currentInfoWindow) {
    currentInfoWindow.close();
  } else {
    currentInfoWindow = new window.google.maps.InfoWindow();
  }
  const container = document.createElement('div');
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '14px';
  container.style.width = '260px';
  container.style.color = '#000';
  const title = document.createElement('h3');
  title.style.fontSize = '16px';
  title.style.margin = '0 0 10px 0';
  title.style.fontWeight = 'bold';
  title.textContent = venue.name || 'Venue';
  const svContainer = document.createElement('div');
  svContainer.id = `street-view-${(venue.name || 'venue').replace(/\s+/g, '-')}`;
  svContainer.style.width = '260px';
  svContainer.style.height = '160px';
  svContainer.style.backgroundColor = '#f0f0f0';
  container.appendChild(title);
  container.appendChild(svContainer);
  currentInfoWindow.setContent(container);
  currentInfoWindow.open(marker.getMap(), marker);
  initializeStreetView(svContainer, venue);
};

const TourAssistantV2Page = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [routePlan, setRoutePlan] = useState(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedVenueTypes, setSelectedVenueTypes] = useState([]);

  // Quota Management
  const {
    remaining,
    canGenerate,
    increment
  } = useTourQuota(user?.id);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('none');
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markersRef = useRef([]);
  const placesServiceRef = useRef(null);
  const [formData, setFormData] = useState({
    artistName: '',
    genre: '',
    cities: '',
    tourDates: '',
    budget: '',
    additionalInfo: ''
  });

  // Load User Data & Templates
  useEffect(() => {
    const initSettings = async () => {
      const settings = await loadArtistSettings(user?.id);
      setFormData(prev => ({
        ...prev,
        budget: settings.default_budget || prev.budget,
        genre: settings.default_genre || prev.genre,
        additionalInfo: (prev.additionalInfo + ' ' + (settings.additional_notes || '')).trim()
      }));
    };
    if (user) {
      initSettings();
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const {
        data
      } = await supabase.from('route_templates').select('*').eq('artist_id', user.id);
      if (data) setTemplates(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTemplateSelect = templateId => {
    setSelectedTemplate(templateId);
    if (templateId === 'none') return;
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        cities: template.cities
      }));
      toast({
        title: "Template Applied",
        description: `Loaded cities from ${template.name}`
      });
    }
  };

  const handleSaveLead = async venue => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save leads.",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('venue_leads').insert({
        artist_id: user.id,
        name: venue.name,
        city: venue.city,
        website: venue.website,
        notes: `Imported from Tour Assistant.\nEmail: ${venue.email || 'N/A'}\nCapacity: ${venue.capacity || 'Unknown'}\n\n${venue.description || ''}`,
        status: 'To Contact'
      });
      if (error) throw error;
      await logActivity('added_venue_lead', `Saved ${venue.name} from Tour Assistant`);
      toast({
        title: "Lead Saved",
        description: `${venue.name} added to your leads.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVenueTypeClick = venueType => {
    setSelectedVenueTypes(prev => prev.includes(venueType) ? prev.filter(v => v !== venueType) : [...prev, venueType]);
  };

  useEffect(() => {
    if (!GOOGLE_API_KEY) {
      console.warn("Google Maps API Key missing from config");
      return;
    }
    if (window.google?.maps) {
      initMap();
      return;
    }
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    document.head.appendChild(script);
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;
    if (!window.google?.maps) {
      console.error("Google Maps SDK not loaded");
      return;
    }
    googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: {
        lat: 39.8283,
        lng: -98.5795
      },
      zoom: 4,
      styles: [{
        elementType: "geometry",
        stylers: [{
          color: "#242f3e"
        }]
      }, {
        elementType: "labels.text.stroke",
        stylers: [{
          color: "#242f3e"
        }]
      }, {
        elementType: "labels.text.fill",
        stylers: [{
          color: "#746855"
        }]
      }]
    });
    placesServiceRef.current = new window.google.maps.places.PlacesService(googleMapInstance.current);
  };

  const addMarker = (position, venue, index) => {
    if (!googleMapInstance.current) return;
    const marker = new window.google.maps.Marker({
      position,
      map: googleMapInstance.current,
      title: venue.name,
      label: {
        text: (index + 1).toString(),
        color: "white",
        fontWeight: "bold"
      },
      animation: window.google.maps.Animation.DROP
    });
    marker.addListener('click', () => {
      openVenueInfoWindow(marker, {
        ...venue,
        _position: position
      });
    });
    markersRef.current.push(marker);
  };

  const clearMap = () => {
    if (currentInfoWindow) {
      currentInfoWindow.close();
    }
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  const fetchPlaceDetails = query => {
    return new Promise(resolve => {
      if (!placesServiceRef.current) {
        resolve(null);
        return;
      }
      placesServiceRef.current.textSearch({
        query
      }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
          const place = results[0];
          placesServiceRef.current.getDetails({
            placeId: place.place_id,
            fields: ['name', 'website', 'photos', 'formatted_address', 'geometry', 'business_status']
          }, (details, ds) => {
            const final = ds === window.google.maps.places.PlacesServiceStatus.OK && details ? details : place;
            if (final.business_status === 'CLOSED_PERMANENTLY') {
              resolve(null);
              return;
            }
            resolve({
              location: final.geometry.location,
              photoUrl: final.photos?.[0]?.getUrl({
                maxWidth: 400,
                maxHeight: 300
              }),
              website: final.website,
              address: final.formatted_address
            });
          });
        } else {
          resolve(null);
        }
      });
    });
  };

  const generateTourPlan = async () => {
    if (!canUseTourAssistant(user?.id)) {
      setShowSignupModal(true);
      return;
    }
    const {
      artistName,
      genre,
      cities,
      tourDates,
      budget,
      additionalInfo
    } = formData;
    if (!artistName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Artist Name is required.",
        variant: "destructive"
      });
      return;
    }
    if (!genre?.trim()) {
      toast({
        title: "Validation Error",
        description: "Genre is required.",
        variant: "destructive"
      });
      return;
    }
    const cityList = cities.split(/[\n,]/).filter(c => c.trim().length > 0);
    if (cityList.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one target city is required.",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    setRoutePlan(null);
    clearMap();
    try {
      const artistSettings = await loadArtistSettings(user?.id);
      const formStateForPrompt = {
        artistName,
        genre,
        cities,
        dates: tourDates,
        budget,
        additionalInfo: `${additionalInfo || ''} ${selectedVenueTypes.length ? `Preferred Venues: ${selectedVenueTypes.join(', ')}` : ''}`.trim()
      };
      const userPrompt = buildPromptFromForm(formStateForPrompt).trim();
      if (!userPrompt || userPrompt.length === 0) {
        toast({
          title: "Error",
          description: "Could not build tour request. Please check your input.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      const systemMessage = `You are a helpful tour planning assistant for musicians and artists. Return ONLY JSON object with this exact schema: {"tour_name": "Str", "summary": "Str", "venues": [{"name": "Str", "city": "Str", "address": "Str", "capacity": "Str", "contact_info": "Str", "email": "Str", "description": "Str", "lat": 0, "lng": 0}]}`;
      const messages = [{
        role: 'system',
        content: systemMessage
      }, {
        role: 'user',
        content: userPrompt
      }];
      const payload = {
        prompt: userPrompt,
        messages: messages,
        artistSettings: artistSettings,
        model: 'gpt-3.5-turbo',
        venueTypes: selectedVenueTypes
      };
      const response = await fetch('https://us-central1-roaduno-api.cloudfunctions.net/tourAssistantProxyV2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (!result || result.success === false) {
        toast({
          title: "Generation Failed",
          description: result?.error || "Failed to generate tour plan. Please try again.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      const responsePayload = result.data || result;
      const rawVenues = responsePayload.venues || responsePayload.route || responsePayload.places || [];
      const tourPlanName = responsePayload.tour_name || responsePayload.tourPlan || "Generated Tour Plan";
      const tourPlanSummary = responsePayload.summary || responsePayload.description || "";
      console.log(`Proxy venues count: ${rawVenues.length}`);
      if (!Array.isArray(rawVenues) || rawVenues.length === 0) {
        toast({
          title: "No Venues Found",
          description: "Could not generate venues for this request. Please try different parameters.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      const normalizedVenues = rawVenues.map(v => {
        const parsedCityState = parseCityStateFromAddress(v.formatted_address || v.address);
        const finalCity = parsedCityState !== 'Unknown City' ? parsedCityState : v.city || 'Unknown City';
        return {
          name: v.name || '',
          city: finalCity,
          address: v.address || v.formatted_address || '',
          website: v.website || v.url || '',
          latitude: v.latitude || v.lat || 0,
          longitude: v.longitude || v.lng || 0,
          lat: v.lat || v.latitude || 0,
          lng: v.lng || v.longitude || 0,
          capacity: v.capacity || '',
          contact_info: v.contact_info || '',
          email: v.email || v.contact_email || v.contactEmail || v.contact && (v.contact.email || v.contact.contact_email || v.contact.contactEmail) || v.contact_info?.email || v.contactInfo?.email || v.booking_email || v.bookingEmail || '',
          description: v.description || v.summary || v.details || v.detail || v.about || v.overview || v.notes || (typeof v.info === 'string' ? v.info : '') || (typeof v.blurb === 'string' ? v.blurb : '') || ''
        };
      });
      const plan = {
        tour_name: tourPlanName,
        summary: tourPlanSummary,
        venues: normalizedVenues
      };
      if (!user) {
        increment();
      } else {
        await logActivity('created_route', `Generated tour route: ${plan.tour_name}`);
      }
      const bounds = new window.google.maps.LatLngBounds();
      const validLocs = [];
      const enhancedVenues = [];
      for (let i = 0; i < plan.venues.length; i++) {
        const v = plan.venues[i];
        if (i > 0) await new Promise(r => setTimeout(r, 300));
        const details = await fetchPlaceDetails(`${v.name}, ${v.city}`);
        let loc = details?.location || (v.latitude ? {
          lat: v.latitude,
          lng: v.longitude
        } : null) || (v.lat ? {
          lat: v.lat,
          lng: v.lng
        } : null);
        if (loc) {
          addMarker(loc, v, enhancedVenues.length);
          bounds.extend(loc);
          validLocs.push(loc);
          enhancedVenues.push({
            ...v,
            address: details?.address || v.address,
            photoUrl: details?.photoUrl,
            website: details?.website || v.website
          });
        } else {
          enhancedVenues.push(v);
        }
      }
      const planWithEnhancedVenues = {
        ...plan,
        venues: enhancedVenues
      };
      const enrichedPlan = await enrichVenueDescriptionsIfMissing(planWithEnhancedVenues);
      setRoutePlan(enrichedPlan);
    } catch (e) {
      console.error(e);
      toast({
        title: "Generation Failed",
        description: e.message || "Could not connect to AI service",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-orange-500/30">
      <Helmet><title>AI Tour Assistant V2 | RoadUno</title></Helmet>
      <Navigation />
      <main className="relative overflow-hidden pt-24 pb-20 min-h-[calc(100vh-80px)]">
        
        {/* Absolute Glow Background Layers */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(800px_circle_at_50%_0%,rgba(236,72,153,0.14),transparent_60%),radial-gradient(900px_circle_at_20%_30%,rgba(249,115,22,0.10),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-neutral-950/0 via-neutral-950/10 to-neutral-950/40" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Tour Assistant</h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">Plan your route, find venues, and visualize your tour on the map instantly.</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-full border border-neutral-700">
               <Zap className={`h-4 w-4 text-orange-400`} />
               <span className="text-sm font-medium text-neutral-300">
                  {user ? 'Unlimited Prompts' : `${remaining} free prompt${remaining !== 1 ? 's' : ''} remaining`}
               </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6">
            <div className="ru-card p-6 lg:sticky lg:top-24 self-start bg-gradient-to-b from-white/5 to-transparent ring-1 ring-white/5 hover:ring-orange-500/15 transition-all duration-300">
              <div className="space-y-6">
                {user && templates.length > 0 && (
                  <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-700">
                    <Label className="text-xs text-orange-400 font-bold mb-1 flex items-center gap-1"><LayoutTemplate className="h-3 w-3" /> LOAD FROM TEMPLATE</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 h-8 text-sm"><SelectValue placeholder="Select a template" /></SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                        <SelectItem value="none">None</SelectItem>
                        {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-neutral-200 font-semibold">Artist Name</Label>
                    <div className="relative">
                      <Music className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                      <Input name="artistName" value={formData.artistName} onChange={handleInputChange} className="pl-9 bg-neutral-900/50 border-neutral-700 text-white" placeholder="Band Name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-neutral-200 font-semibold">Genre</Label>
                    <Input name="genre" value={formData.genre} onChange={handleInputChange} className="bg-neutral-900/50 border-neutral-700 text-white" placeholder="e.g. Indie Rock" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-200 font-semibold">Venue Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {VENUE_TYPES.map(type => (
                      <button 
                        key={type} 
                        onClick={() => handleVenueTypeClick(type)} 
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all duration-200 ${
                          selectedVenueTypes.includes(type) 
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-400 shadow-lg' 
                            : 'border-neutral-600 bg-neutral-800/30 text-neutral-300 hover:border-orange-500/60 hover:bg-neutral-700/40 hover:-translate-y-[2px] hover:shadow-md'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-neutral-200 font-semibold">Target Cities</Label>
                    <span className="text-gray-400 text-xs">(separate cities by comma)</span>
                  </div>
                  <div className="relative">
                    <MapIcon className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                    <Textarea name="cities" value={formData.cities} onChange={handleInputChange} className="pl-9 min-h-[80px] bg-neutral-900/50 border-neutral-700 text-white" placeholder="Austin, Denver..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-neutral-200 font-semibold">Dates</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                      <Input name="tourDates" value={formData.tourDates} onChange={handleInputChange} className="pl-9 bg-neutral-900/50 border-neutral-700 text-white" placeholder="Fall 2024" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-neutral-200 font-semibold">Budget</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                      <Input name="budget" value={formData.budget} onChange={handleInputChange} className="pl-9 bg-neutral-900/50 border-neutral-700 text-white" placeholder="$5000" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-neutral-200 font-semibold">Extra Info</Label>
                    <span className="text-gray-400 text-xs">(venue cap, or specific preferences)</span>
                  </div>
                  <Textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} className="bg-neutral-900/50 border-neutral-700 h-20 text-white" placeholder="Preferences..." />
                </div>

                <Button 
                  onClick={generateTourPlan} 
                  disabled={isGenerating || !formData.artistName || !formData.cities} 
                  className={`w-full font-bold py-6 text-lg transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 active:brightness-95 disabled:opacity-75 disabled:cursor-not-allowed ${
                    !canGenerate && !user 
                      ? 'bg-neutral-700 hover:bg-neutral-700 opacity-80' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {isGenerating ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Planning...</> : !canGenerate && !user ? <><Lock className="mr-2 h-5 w-5" /> Limit Reached</> : <><RotateCw className="mr-2 h-5 w-5" /> Generate Route</>}
                </Button>
                
                {!user && (
                  <motion.div key={remaining} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-neutral-500 mt-2">
                    You have <span className="text-orange-400 font-bold">{remaining}</span> free prompts remaining.
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="ru-card h-[360px] md:h-[420px] relative overflow-hidden bg-gradient-to-b from-white/5 to-transparent ring-1 ring-white/5 hover:ring-orange-500/15 transition-all duration-300">
                <div ref={mapRef} className="w-full h-full bg-neutral-900" />
                {!GOOGLE_API_KEY && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white z-10 flex-col gap-2 p-4 text-center">
                    <span className="font-bold text-red-400">Map Configuration Missing</span>
                    <span className="text-sm">Please set VITE_GOOGLE_API_KEY in your .env.local file.</span>
                  </div>
                )}
              </div>

              {routePlan && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Venue Leads ({routePlan.venues?.length || 0})
                  </h3>
                  <div className="flex flex-col gap-4">
                    {routePlan.venues?.map((venue, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/4 to-transparent pointer-events-none z-10 rounded-xl" />
                        <VenueCard venue={venue} index={idx} onSaveLead={handleSaveLead} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <SignupPromptModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />

      </main>
      <Footer />
    </div>
  );
};

export default TourAssistantV2Page;
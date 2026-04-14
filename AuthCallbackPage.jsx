import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Music, DollarSign, Loader2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { sendChatMessage } from '@/services/aiClient';
import { loadArtistSettings } from '@/services/artistSettings';
import { useTourQuota, canUseTourAssistant } from '@/hooks/useTourQuota';
import { buildPromptFromMessages, handleProxyResponse, enrichVenueDescriptionsIfMissing } from '@/utils/tourAssistantHelpers';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SignupPromptModal from '@/components/SignupPromptModal';

const TourAssistantPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [routePlan, setRoutePlan] = useState(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  // Quota hooks
  const { remaining, canGenerate, increment } = useTourQuota(user?.id);

  const [formData, setFormData] = useState({
    artistName: '',
    genre: '',
    cities: '',
    tourDates: '',
    budget: '',
    additionalInfo: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStartOver = () => {
    setRoutePlan(null);
    setFormData({
      artistName: '',
      genre: '',
      cities: '',
      tourDates: '',
      budget: '',
      additionalInfo: ''
    });
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check Quota
    if (!canUseTourAssistant(user?.id)) {
      setShowSignupModal(true);
      return;
    }

    if (!formData.artistName || !formData.genre || !formData.cities) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in Artist Name, Genre, and Cities to generate your tour plan.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setRoutePlan(null);

    try {
      // 2. Load settings
      const settings = await loadArtistSettings(user?.id);
      
      const payloadData = {
        ...formData,
        budget: formData.budget || settings.default_budget || '',
        additionalInfo: (formData.additionalInfo + ' ' + (settings.additional_notes || '')).trim()
      };

      const syntheticMessage = `Artist: ${payloadData.artistName}. Genre: ${payloadData.genre}. Cities: ${payloadData.cities}. Dates: ${payloadData.tourDates}. Budget: ${payloadData.budget}. Info: ${payloadData.additionalInfo}`;
      const messages = [{ role: 'user', content: syntheticMessage }];
      
      const payload = {
        ...payloadData, // Keep original fields for backward compatibility if backend uses them
        messages: messages,
        prompt: buildPromptFromMessages(messages) // Add standardized prompt field
      };

      // 3. Send Request
      const rawResponse = await sendChatMessage(payload);
      
      // 4. Handle Response
      const { success, data, error } = handleProxyResponse(rawResponse);

      if (!success) {
        throw new Error(error || "The assistant could not be reached.");
      }
      
      let plan = data.plan || data.result;

      if (!plan) {
         throw new Error("The assistant's response was empty or in an unexpected format.");
      }

      // If 'plan' is an object that contains 'venues', we should normalize them here if possible
      // However, this page usually returns a text blob (Lite) or sometimes structured.
      // If it's structured, let's try to normalize.
      if (typeof plan === 'object' && Array.isArray(plan.venues)) {
          plan.venues = plan.venues.map(v => ({
              ...v,
              // Normalize Email
              email: v.email || 
                     v.contact_email || 
                     v.contactEmail || 
                     v.contact?.email || 
                     v.contact?.contact_email ||
                     v.contact?.contactEmail ||
                     v.contact_info?.email ||
                     v.contactInfo?.email ||
                     v.booking_email || 
                     v.bookingEmail || 
                     '',
              // Normalize Description
              description: v.description || 
                          v.summary || 
                          v.details || 
                          v.detail ||
                          v.about || 
                          v.overview || 
                          v.notes ||
                          (typeof v.info === 'string' ? v.info : '') ||
                          (typeof v.blurb === 'string' ? v.blurb : '') ||
                          ''
          }));

          // Enrich venue descriptions if missing using Google Places
          plan = await enrichVenueDescriptionsIfMissing(plan);
          
          // Since the Lite version displays a text blob usually, we serialize it back to string if it was an object
          // Or we update the render logic to handle object if it was object.
          // The current render logic expects text: <pre>{routePlan}</pre>
          // So if we received an object, we should probably format it as text or keep it as object and handle in render.
          
          // Let's format it as a nice string if it's an object, to maintain compatibility with the <pre> block
          if (typeof plan === 'object') {
             const venueText = plan.venues.map((v, i) => 
               `${i+1}. ${v.name} (${v.city})\n   Address: ${v.address || 'N/A'}\n   Email: ${v.email || 'N/A'}\n   Description: ${v.description || 'N/A'}\n`
             ).join('\n');
             plan = `${plan.tour_name}\n\n${plan.summary}\n\n${venueText}`;
          }
      }
      
      setRoutePlan(plan);
      
      // 5. Increment Usage if visitor
      if (!user) {
        increment();
      }

      toast({
        title: 'Tour Plan Generated! 🎉',
        description: 'Your custom routing plan is ready below.',
      });

      setTimeout(() => {
        document.getElementById('route-plan')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (error) {
      console.error('Error calling Tour Assistant API:', error);
      toast({
        title: 'Oh no! Something went wrong.',
        description: error.message || 'The tour assistant could not be reached. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Tour Assistant Lite - RoadUno</title>
        <meta name="description" content="Get a pitch-ready tour routing plan with venue leads, booking contacts, and budget tips. The tour assistant built for indie musicians." />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Navigation />

        <main className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Tour <span className="gradient-text">Assistant Lite</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">Get a pitch ready routing plan with venue leads, booking contacts, local promoters, and budget tips.</p>
              
              {!user && (
                <motion.div 
                   key={remaining}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="mt-4 bg-slate-800/60 inline-block px-4 py-1.5 rounded-full border border-slate-700 text-sm text-slate-300"
                >
                  <span className="text-orange-400 font-bold">{remaining}</span> free prompts remaining
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="artistName" className="text-lg flex items-center gap-2">
                      <Music className="h-5 w-5 text-orange-400" />
                      Artist/Band Name *
                    </Label>
                    <Input
                      id="artistName"
                      name="artistName"
                      value={formData.artistName}
                      onChange={handleInputChange}
                      placeholder="Your artist name"
                      className="bg-slate-900 border-slate-700 focus:border-pink-500 h-12 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre" className="text-lg">
                      Genre/Vibe *
                    </Label>
                    <Input
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      placeholder="e.g., Indie Rock, Folk, Electronic"
                      className="bg-slate-900 border-slate-700 focus:border-pink-500 h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cities" className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-400" />
                    Cities to Visit *
                  </Label>
                  <Textarea
                    id="cities"
                    name="cities"
                    value={formData.cities}
                    onChange={handleInputChange}
                    placeholder="e.g., Nashville, TN, Atlanta, GA, Charlotte, NC"
                    className="bg-slate-900 border-slate-700 focus:border-pink-500 min-h-[100px] text-base"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tourDates" className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-400" />
                      Tour Dates (Optional)
                    </Label>
                    <Input
                      id="tourDates"
                      name="tourDates"
                      value={formData.tourDates}
                      onChange={handleInputChange}
                      placeholder="e.g., March 15-25, 2025"
                      className="bg-slate-900 border-slate-700 focus:border-pink-500 h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-orange-400" />
                      Budget (USD, Optional)
                    </Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="e.g., 2000"
                      className="bg-slate-900 border-slate-700 focus:border-pink-500 h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo" className="text-lg">
                    Additional Info (Optional)
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    placeholder="Previous venues, target audience, support acts..."
                    className="bg-slate-900 border-slate-700 focus:border-pink-500 min-h-[100px] text-base"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Your Route...
                    </>
                  ) : (
                    'Generate Tour Plan'
                  )}
                </Button>
              </form>
            </motion.div>

            {routePlan && (
              <motion.div
                id="route-plan"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-12 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8"
              >
                <h2 className="text-3xl font-bold mb-6 gradient-text">Your Custom Tour Plan</h2>
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">
                  {routePlan}
                </pre>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(routePlan);
                      toast({
                        title: 'Copied to Clipboard! 📋',
                        description: 'Your tour plan is ready to paste anywhere.',
                      });
                    }}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    Copy Plan Text
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-700 hover:border-pink-500 hover:text-white"
                    onClick={() => {
                      toast({
                        title: '🚧 Feature Coming Soon!',
                        description: "We're working on PDF exports. Stay tuned!",
                      });
                    }}
                  >
                    Export to PDF (Coming Soon)
                  </Button>
                   <Button
                    variant="ghost"
                    onClick={handleStartOver}
                    className="hover:bg-slate-700 hover:text-white"
                  >
                    <RotateCw className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        <Footer />
        <SignupPromptModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
      </div>
    </>
  );
};

export default TourAssistantPage;
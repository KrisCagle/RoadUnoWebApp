import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Globe, Mail, ShieldCheck, ShieldQuestion, Loader2, Save, Trash2, Edit2, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { logActivity } from '@/lib/activityLogger';

const emptyFormData = { name: '', city: '', website: '', email: '', email_verified: false, status: 'To Contact', notes: '' };

const ARTIST_INFO_STORAGE_KEY = 'roaduno_outreach_artist_info';

const loadSavedArtistInfo = () => {
  try {
    const raw = localStorage.getItem(ARTIST_INFO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { name: '', genre: '', proofPoint: '' };
  } catch {
    return { name: '', genre: '', proofPoint: '' };
  }
};

const VenueLeadsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);

  // --- Outreach drafting state ---
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachLead, setOutreachLead] = useState(null);
  const [artistInfo, setArtistInfo] = useState(loadSavedArtistInfo());
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachDraft, setOutreachDraft] = useState(null); // { subject, body }
  const [outreachError, setOutreachError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('venue_leads')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        const { error } = await supabase
          .from('venue_leads')
          .update(formData)
          .eq('id', editingLead.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Lead updated successfully." });
      } else {
        const { error } = await supabase
          .from('venue_leads')
          .insert({ ...formData, artist_id: user.id });
        if (error) throw error;
        await logActivity('added_venue_lead', `Added lead: ${formData.name}`);
        toast({ title: "Success", description: "New lead added." });
      }

      setIsModalOpen(false);
      setEditingLead(null);
      setFormData(emptyFormData);
      fetchLeads();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      const { error } = await supabase.from('venue_leads').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Lead removed." });
      fetchLeads();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const openEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      city: lead.city,
      website: lead.website || '',
      email: lead.email || '',
      email_verified: lead.email_verified || false,
      status: lead.status,
      notes: lead.notes || ''
    });
    setIsModalOpen(true);
  };

  // --- Outreach drafting logic ---
  const openOutreach = (lead) => {
    setOutreachLead(lead);
    setOutreachDraft(null);
    setOutreachError('');
    setOutreachOpen(true);
  };

  const updateArtistInfo = (field, value) => {
    const updated = { ...artistInfo, [field]: value };
    setArtistInfo(updated);
    try {
      localStorage.setItem(ARTIST_INFO_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage unavailable, non-fatal, just won't persist between sessions
    }
  };

  const handleGenerateDraft = async () => {
    if (!outreachLead) return;
    if (!artistInfo.name.trim() || !artistInfo.genre.trim() || !artistInfo.proofPoint.trim()) {
      setOutreachError('Fill in your artist name, genre, and a proof point first.');
      return;
    }

    setOutreachLoading(true);
    setOutreachError('');
    setOutreachDraft(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/venue-outreach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          artist: {
            name: artistInfo.name,
            genre: artistInfo.genre,
            proofPoint: artistInfo.proofPoint,
          },
          venue: {
            name: outreachLead.name,
            city: outreachLead.city,
            email: outreachLead.email,
            detail: outreachLead.notes || '',
            requestedDate: '',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      setOutreachDraft({ subject: data.subject, body: data.body });
    } catch (error) {
      setOutreachError(error.message || 'Something went wrong generating the draft.');
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!outreachDraft) return;
    const text = `Subject: ${outreachDraft.subject}\n\n${outreachDraft.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: "destructive", title: "Copy failed", description: "Select and copy the text manually." });
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen text-paper">
      <Helmet><title>Venue Leads | RoadUno</title></Helmet>
      <Navigation />

      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Venue Leads</h1>
            <p className="text-paper-muted">Track and manage your booking outreach.</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingLead(null); setFormData(emptyFormData); }} className="bg-marquee hover:bg-marquee-hover text-asphalt font-semibold">
                <Plus className="mr-2 h-4 w-4" /> Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-asphalt-raised border-steel text-paper">
              <DialogHeader>
                <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveLead} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Venue Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-asphalt/50 border-steel" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="bg-asphalt/50 border-steel" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="bg-asphalt/50 border-steel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-asphalt-raised border-steel text-paper">
                        {['To Contact', 'Contacted', 'Booked', 'Rejected'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="bg-asphalt/50 border-steel" />
                </div>
                <div className="space-y-2">
                  <Label>Booking Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value, email_verified: false })}
                    placeholder="booking@venue.com"
                    className="bg-asphalt/50 border-steel"
                  />
                  <p className="text-xs text-paper-muted">
                    {editingLead && editingLead.email && !editingLead.email_verified
                      ? "This was AI-suggested and hasn't been confirmed. Double-check it before sending outreach."
                      : "Leave blank if unknown. AI-suggested emails are not guaranteed to be correct."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email_verified"
                    checked={formData.email_verified}
                    onCheckedChange={checked => setFormData({ ...formData, email_verified: checked === true })}
                  />
                  <Label htmlFor="email_verified" className="text-sm font-normal cursor-pointer">
                    I've confirmed this email is correct
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="bg-asphalt/50 border-steel" />
                </div>
                <Button type="submit" className="w-full bg-marquee hover:bg-marquee-hover text-asphalt font-semibold">Save Lead</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-paper-muted" />
            <Input
              placeholder="Search venues or cities..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 bg-asphalt-raised border-steel"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-asphalt-raised border-steel">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-asphalt-raised border-steel text-paper">
              <SelectItem value="All">All Statuses</SelectItem>
              {['To Contact', 'Contacted', 'Booked', 'Rejected'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-marquee" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map(lead => (
              <motion.div key={lead.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-asphalt-raised/50 border border-steel p-6 rounded-xl hover:border-marquee/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{lead.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${lead.status === 'Booked' ? 'bg-routeline/20 text-routeline' :
                      lead.status === 'Rejected' ? 'bg-taillight/20 text-taillight' :
                        'bg-steel text-paper-muted'
                    }`}>{lead.status}</span>
                </div>

                <div className="space-y-2 text-sm text-paper-muted mb-6">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {lead.city || 'No City'}</div>
                  {lead.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> <a href={lead.website} target="_blank" rel="noreferrer" className="hover:text-marquee truncate max-w-[200px]">{lead.website}</a></div>}
                  {lead.email ? (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate max-w-[180px]">{lead.email}</span>
                      {lead.email_verified ? (
                        <span title="Confirmed correct" className="flex items-center gap-1 text-routeline text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>
                      ) : (
                        <span title="AI-suggested, not confirmed" className="flex items-center gap-1 text-marquee text-xs"><ShieldQuestion className="h-3.5 w-3.5" /> Unverified</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-paper-muted italic">
                      <Mail className="h-4 w-4" /> No email on file
                    </div>
                  )}
                  {lead.notes && <p className="italic border-l-2 border-steel pl-2 mt-2">{lead.notes}</p>}
                </div>

                <div className="flex justify-between items-center gap-2 pt-4 border-t border-steel">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!lead.email}
                    onClick={() => openOutreach(lead)}
                    className="border-marquee/50 text-marquee hover:bg-marquee/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={!lead.email ? "Add an email to this lead first" : "Draft an outreach email"}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Draft Outreach
                  </Button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(lead)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(lead.id)} className="text-taillight hover:text-taillight-hover hover:bg-taillight/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredLeads.length === 0 && <p className="col-span-full text-center text-paper-muted py-12">No leads found.</p>}
          </div>
        )}
      </main>

      {/* Outreach drafting modal */}
      <Dialog open={outreachOpen} onOpenChange={setOutreachOpen}>
        <DialogContent className="bg-asphalt-raised border-steel text-paper max-w-lg">
          <DialogHeader>
            <DialogTitle>Draft Outreach {outreachLead ? `\u2013 ${outreachLead.name}` : ''}</DialogTitle>
          </DialogHeader>

          {outreachLead && !outreachLead.email_verified && (
            <p className="text-xs text-marquee bg-marquee/10 border border-marquee/30 rounded p-2">
              This venue's email is unverified. Double check {outreachLead.email} is correct before sending anything.
            </p>
          )}

          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Artist Name</Label>
                <Input value={artistInfo.name} onChange={e => updateArtistInfo('name', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="Lowlight Radio" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Genre</Label>
                <Input value={artistInfo.genre} onChange={e => updateArtistInfo('genre', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="dream-pop trio" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Proof Point</Label>
              <Input value={artistInfo.proofPoint} onChange={e => updateArtistInfo('proofPoint', e.target.value)} className="bg-asphalt/50 border-steel" placeholder="80-120 avg draw, last Southeast run" />
            </div>
            <p className="text-xs text-paper-muted">Saved in this browser so you don't have to retype it each time.</p>
          </div>

          <Button onClick={handleGenerateDraft} disabled={outreachLoading} className="w-full bg-marquee hover:bg-marquee-hover text-asphalt font-semibold mt-2">
            {outreachLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Draft</>}
          </Button>

          {outreachError && <p className="text-sm text-taillight">{outreachError}</p>}

          {outreachDraft && (
            <div className="space-y-3 mt-4 border-t border-steel pt-4">
              <div className="space-y-1">
                <Label className="text-xs">Subject</Label>
                <Input value={outreachDraft.subject} onChange={e => setOutreachDraft({ ...outreachDraft, subject: e.target.value })} className="bg-asphalt/50 border-steel" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Body</Label>
                <Textarea value={outreachDraft.body} onChange={e => setOutreachDraft({ ...outreachDraft, body: e.target.value })} className="bg-asphalt/50 border-steel min-h-[180px]" />
              </div>
              <p className="text-xs text-paper-muted">Review before sending, this is a draft, not sent automatically.</p>
              <Button onClick={handleCopy} variant="outline" className="w-full border-steel">
                {copied ? <><Check className="mr-2 h-4 w-4" /> Copied</> : <><Copy className="mr-2 h-4 w-4" /> Copy Subject + Body</>}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default VenueLeadsPage;
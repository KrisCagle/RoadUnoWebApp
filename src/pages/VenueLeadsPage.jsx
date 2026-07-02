import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Globe, Loader2, Save, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { logActivity } from '@/lib/activityLogger';

const VenueLeadsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({ name: '', city: '', website: '', status: 'To Contact', notes: '' });

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
      setFormData({ name: '', city: '', website: '', status: 'To Contact', notes: '' });
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
      status: lead.status, 
      notes: lead.notes || '' 
    });
    setIsModalOpen(true);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet><title>Venue Leads | RoadUno</title></Helmet>
      <Navigation />
      
      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Venue Leads</h1>
            <p className="text-slate-400">Track and manage your booking outreach.</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingLead(null); setFormData({ name: '', city: '', website: '', status: 'To Contact', notes: '' }); }} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" /> Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveLead} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Venue Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-950 border-slate-700" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-slate-950 border-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                      <SelectTrigger className="bg-slate-950 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-white">
                        {['To Contact', 'Contacted', 'Booked', 'Rejected'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="bg-slate-950 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-slate-950 border-slate-700" />
                </div>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Save Lead</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search venues or cities..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-800"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="All">All Statuses</SelectItem>
              {['To Contact', 'Contacted', 'Booked', 'Rejected'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map(lead => (
              <motion.div key={lead.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-orange-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{lead.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    lead.status === 'Booked' ? 'bg-green-500/20 text-green-400' :
                    lead.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-800 text-slate-300'
                  }`}>{lead.status}</span>
                </div>
                
                <div className="space-y-2 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {lead.city || 'No City'}</div>
                  {lead.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> <a href={lead.website} target="_blank" rel="noreferrer" className="hover:text-orange-400 truncate max-w-[200px]">{lead.website}</a></div>}
                  {lead.notes && <p className="italic border-l-2 border-slate-700 pl-2 mt-2">{lead.notes}</p>}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(lead)}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            ))}
            {filteredLeads.length === 0 && <p className="col-span-full text-center text-slate-500 py-12">No leads found.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VenueLeadsPage;
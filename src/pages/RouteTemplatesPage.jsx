import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Trash2, Map, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { logActivity } from '@/lib/activityLogger';

const RouteTemplatesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', cities: '', duration: '', notes: '' });

  useEffect(() => {
    if (user) fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.from('route_templates').select('*').eq('artist_id', user.id);
      if (error) throw error;
      setTemplates(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('route_templates').insert({ ...formData, artist_id: user.id });
      if (error) throw error;
      await logActivity('created_template', `Created route template: ${formData.name}`);
      toast({ title: "Success", description: "Template saved." });
      setIsModalOpen(false);
      setFormData({ name: '', cities: '', duration: '', notes: '' });
      fetchTemplates();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('route_templates').delete().eq('id', id);
      if (error) throw error;
      fetchTemplates();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet><title>Route Templates | RoadUno</title></Helmet>
      <Navigation />
      
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Route Templates</h1>
            <p className="text-slate-400">Save reusable city lists for quick routing.</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700"><Plus className="mr-2 h-4 w-4" /> New Template</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader><DialogTitle>Create Route Template</DialogTitle></DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 mt-4">
                <div className="space-y-2"><Label>Template Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-950 border-slate-700" placeholder="e.g. West Coast Run" required /></div>
                <div className="space-y-2"><Label>Cities (Comma Separated)</Label><Textarea value={formData.cities} onChange={e => setFormData({...formData, cities: e.target.value})} className="bg-slate-950 border-slate-700" placeholder="Seattle, Portland, Eugene..." required /></div>
                <div className="space-y-2"><Label>Approx. Duration</Label><Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="bg-slate-950 border-slate-700" placeholder="e.g. 10 Days" /></div>
                <div className="space-y-2"><Label>Notes</Label><Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-slate-950 border-slate-700" /></div>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Save Template</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <Loader2 className="animate-spin mx-auto text-orange-500" /> : (
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map(template => (
              <motion.div key={template.id} layout className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-orange-500/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Map className="h-4 w-4 text-orange-400" /> {template.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)} className="text-red-400 hover:bg-red-900/20 h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{template.cities}</p>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>{template.duration}</span>
                  <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
            {templates.length === 0 && <p className="col-span-full text-center text-slate-500 py-12">No templates found.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RouteTemplatesPage;
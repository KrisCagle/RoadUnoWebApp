import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Trash2, Map, Loader2, Lock, Zap } from 'lucide-react';
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
import { canAccessPlaybooks } from '@/lib/featureGates';
import { useNavigate } from 'react-router-dom';

const TourPlaybooksPage = () => {
  const { user, effectivePlan } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', notes: '' });

  const hasAccess = canAccessPlaybooks(effectivePlan);

  useEffect(() => {
    if (user && hasAccess) fetchPlaybooks();
    else setLoading(false);
  }, [user, hasAccess]);

  const fetchPlaybooks = async () => {
    try {
      const { data, error } = await supabase.from('tour_playbooks').select('*').eq('artist_id', user.id);
      if (error) throw error;
      setPlaybooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tour_playbooks').insert({ ...formData, artist_id: user.id });
      if (error) throw error;
      toast({ title: "Success", description: "Playbook created." });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', notes: '' });
      fetchPlaybooks();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('tour_playbooks').delete().eq('id', id);
      if (error) throw error;
      fetchPlaybooks();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet><title>Tour Playbooks | RoadUno</title></Helmet>
      <Navigation />
      
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
                Tour Playbooks 
                <span className="text-sm bg-purple-900/50 text-purple-400 px-2 py-1 rounded-full border border-purple-800 font-bold flex items-center gap-1"><Zap className="h-3 w-3" /> PRO</span>
            </h1>
            <p className="text-slate-400">Save strategies and route notes.</p>
          </div>
          {hasAccess && (
            <Button onClick={() => setIsModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" /> New Playbook
            </Button>
          )}

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader><DialogTitle>Create Playbook</DialogTitle></DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 mt-4">
                <div className="space-y-2"><Label>Playbook Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-950 border-slate-700" placeholder="e.g. Venue Contact Strategy" required /></div>
                <div className="space-y-2"><Label>Description</Label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-slate-950 border-slate-700" placeholder="Short summary" /></div>
                <div className="space-y-2"><Label>Detailed Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-slate-950 border-slate-700 min-h-[150px]" /></div>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Save Playbook</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!hasAccess ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <div className="bg-slate-800 p-4 rounded-full mb-4">
                    <Lock className="h-8 w-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Tour Playbooks are a Pro Feature</h2>
                <p className="text-slate-400 max-w-md mb-6">Create unlimited reusable tour strategies, venue checklists, and contact protocols with RoadUno Pro.</p>
                <Button onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-8">Upgrade to Pro</Button>
            </div>
        ) : loading ? <Loader2 className="animate-spin mx-auto text-orange-500" /> : (
          <div className="grid md:grid-cols-2 gap-4">
            {playbooks.map(pb => (
              <motion.div key={pb.id} layout className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-orange-500/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Map className="h-4 w-4 text-orange-400" /> {pb.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(pb.id)} className="text-red-400 hover:bg-red-900/20 h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <p className="text-sm text-slate-300 font-medium mb-2">{pb.description}</p>
                <p className="text-sm text-slate-400 mb-4 line-clamp-3 whitespace-pre-wrap">{pb.notes}</p>
                <div className="text-xs text-slate-500 text-right">
                  Created: {new Date(pb.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
            {playbooks.length === 0 && <p className="col-span-full text-center text-slate-500 py-12">No playbooks found. Create one to get started.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TourPlaybooksPage;
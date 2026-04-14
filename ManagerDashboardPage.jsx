import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { logActivity } from '@/lib/activityLogger';
import { canAccessFullHistory } from '@/lib/featureGates';
import { useNavigate } from 'react-router-dom';

const ShowHistoryPage = () => {
  const { user, effectivePlan } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    venue_name: '', city: '', date: '', guarantee: 0, door_split: 0, merch_sales: 0, expenses: 0, attendance: 0, notes: ''
  });

  const hasFullHistory = canAccessFullHistory(effectivePlan);

  useEffect(() => {
    if (user) fetchShows();
  }, [user, hasFullHistory]);

  const fetchShows = async () => {
    try {
      let query = supabase
        .from('shows')
        .select('*')
        .eq('artist_id', user.id)
        .order('date', { ascending: false });
      
      if (!hasFullHistory) {
        query = query.limit(1);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setShows(data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShow = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('shows').insert({ ...formData, artist_id: user.id });
      if (error) throw error;
      
      await logActivity('logged_show', `Logged show at ${formData.venue_name}`);
      toast({ title: "Success", description: "Show logged successfully." });
      setIsModalOpen(false);
      setFormData({ venue_name: '', city: '', date: '', guarantee: 0, door_split: 0, merch_sales: 0, expenses: 0, attendance: 0, notes: '' });
      fetchShows();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this show?")) return;
    try {
      const { error } = await supabase.from('shows').delete().eq('id', id);
      if (error) throw error;
      fetchShows();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet><title>Show History | RoadUno</title></Helmet>
      <Navigation />
      
      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Show History</h1>
          <Button onClick={() => setIsModalOpen(true)} className="bg-orange-600 hover:bg-orange-700"><Plus className="mr-2 h-4 w-4" /> Log Show</Button>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
              <DialogHeader><DialogTitle>Log Past Show</DialogTitle></DialogHeader>
              <form onSubmit={handleSaveShow} className="grid grid-cols-2 gap-4 mt-4">
                <div className="col-span-2"><Label>Venue</Label><Input value={formData.venue_name} onChange={e => setFormData({...formData, venue_name: e.target.value})} className="bg-slate-950 border-slate-700" required /></div>
                <div><Label>City</Label><Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-slate-950 border-slate-700" /></div>
                <div><Label>Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-slate-950 border-slate-700" required /></div>
                <div><Label>Guarantee ($)</Label><Input type="number" value={formData.guarantee} onChange={e => setFormData({...formData, guarantee: parseFloat(e.target.value)})} className="bg-slate-950 border-slate-700" /></div>
                <div><Label>Door Split ($)</Label><Input type="number" value={formData.door_split} onChange={e => setFormData({...formData, door_split: parseFloat(e.target.value)})} className="bg-slate-950 border-slate-700" /></div>
                <div><Label>Merch Sales ($)</Label><Input type="number" value={formData.merch_sales} onChange={e => setFormData({...formData, merch_sales: parseFloat(e.target.value)})} className="bg-slate-950 border-slate-700" /></div>
                <div><Label>Expenses ($)</Label><Input type="number" value={formData.expenses} onChange={e => setFormData({...formData, expenses: parseFloat(e.target.value)})} className="bg-slate-950 border-slate-700" /></div>
                <div><Label>Attendance</Label><Input type="number" value={formData.attendance} onChange={e => setFormData({...formData, attendance: parseInt(e.target.value)})} className="bg-slate-950 border-slate-700" /></div>
                <div className="col-span-2"><Label>Notes</Label><Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-slate-950 border-slate-700" /></div>
                <Button type="submit" className="col-span-2 bg-orange-600 hover:bg-orange-700">Save Show</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!hasFullHistory && shows.length > 0 && (
             <div className="mb-6 bg-slate-900/50 border border-orange-500/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-orange-400" />
                    <div>
                        <p className="font-bold text-sm text-white">History Limited</p>
                        <p className="text-xs text-slate-400">Showing your most recent show. Upgrade to Pro to see full history.</p>
                    </div>
                </div>
                <Button onClick={() => navigate('/pricing')} size="sm" variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">Upgrade</Button>
             </div>
        )}

        {loading ? <Loader2 className="animate-spin mx-auto text-orange-500" /> : (
          <div className="bg-slate-900/30 rounded-xl overflow-hidden border border-slate-800">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-sm">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Venue / City</th>
                  <th className="p-4">Attendance</th>
                  <th className="p-4">Revenue</th>
                  <th className="p-4">Net</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {shows.map(show => {
                   const revenue = (show.guarantee || 0) + (show.door_split || 0) + (show.merch_sales || 0);
                   const net = revenue - (show.expenses || 0);
                   return (
                    <tr key={show.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">{new Date(show.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="font-bold">{show.venue_name}</div>
                        <div className="text-sm text-slate-400">{show.city}</div>
                      </td>
                      <td className="p-4">{show.attendance}</td>
                      <td className="p-4 text-green-400">${revenue}</td>
                      <td className="p-4 font-bold">${net}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(show.id)} className="text-red-400 hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                   )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ShowHistoryPage;
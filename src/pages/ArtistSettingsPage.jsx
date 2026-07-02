import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Save, Loader2, Settings, Car, Calendar, DollarSign, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { logActivity } from '@/lib/activityLogger';

const ArtistSettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    max_drive_hours: '',
    preferred_days: '',
    default_budget: '',
    default_genre: '',
    additional_notes: ''
  });

  useEffect(() => {
    if (user) fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('artist_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData({
          max_drive_hours: data.max_drive_hours || '',
          preferred_days: data.preferred_days || '',
          default_budget: data.default_budget || '',
          default_genre: data.default_genre || '',
          additional_notes: data.additional_notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('artist_settings').upsert({
        user_id: user.id,
        ...formData,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      await logActivity('updated_preferences', 'Updated routing preferences');

      toast({
        title: "Settings Saved",
        description: "Your touring preferences have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet><title>Routing Preferences | RoadUno</title></Helmet>
      <Navigation />
      
      <main className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-orange-500/10 p-4 rounded-full">
              <Settings className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Routing Preferences</h1>
              <p className="text-slate-400">Set default values for the Tour Assistant.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6 bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Max Drive Hours</Label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input 
                    type="number"
                    value={formData.max_drive_hours}
                    onChange={e => setFormData({...formData, max_drive_hours: e.target.value})}
                    className="pl-9 bg-slate-950 border-slate-800"
                    placeholder="e.g. 6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default Budget</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input 
                    value={formData.default_budget}
                    onChange={e => setFormData({...formData, default_budget: e.target.value})}
                    className="pl-9 bg-slate-950 border-slate-800"
                    placeholder="e.g. $5000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Days</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  value={formData.preferred_days}
                  onChange={e => setFormData({...formData, preferred_days: e.target.value})}
                  className="pl-9 bg-slate-950 border-slate-800"
                  placeholder="e.g. Thu, Fri, Sat"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Default Genre</Label>
              <div className="relative">
                <Music className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  value={formData.default_genre}
                  onChange={e => setFormData({...formData, default_genre: e.target.value})}
                  className="pl-9 bg-slate-950 border-slate-800"
                  placeholder="e.g. Indie Folk"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes for AI</Label>
              <Textarea 
                value={formData.additional_notes}
                onChange={e => setFormData({...formData, additional_notes: e.target.value})}
                className="bg-slate-950 border-slate-800 min-h-[100px]"
                placeholder="Prefer all ages venues, vegan food nearby..."
              />
            </div>

            <Button type="submit" disabled={saving || loading} className="w-full bg-orange-600 hover:bg-orange-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Preferences
            </Button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistSettingsPage;
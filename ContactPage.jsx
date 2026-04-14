import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Save, Loader2, MapPin, Music, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const ArtistProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    stage_name: '',
    home_city: '',
    primary_genre: '',
    website: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
            stage_name: data.stage_name || '',
            home_city: data.home_city || '',
            primary_genre: data.primary_genre || '',
            website: data.website || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('artist_profiles')
        .upsert({
          id: user.id,
          ...profile,
          created_at: new Date().toISOString(), // This will be ignored on update if not specified, but safe for insert
        });

      if (error) throw error;

      toast({
        title: "Profile Saved",
        description: "Your artist profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Artist Profile - RoadUno</title>
      </Helmet>
      
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navigation />

        <main className="pt-32 pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-orange-500/10 p-4 rounded-full">
                    <User className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Artist Profile</h1>
                    <p className="text-slate-400">Manage your artist details for smarter routing.</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="stage_name">Artist / Band Name</Label>
                  <Input
                    id="stage_name"
                    name="stage_name"
                    value={profile.stage_name}
                    onChange={handleInputChange}
                    className="bg-slate-950 border-slate-800"
                    placeholder="e.g. The Night Owls"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="home_city">Home City</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                id="home_city"
                                name="home_city"
                                value={profile.home_city}
                                onChange={handleInputChange}
                                className="bg-slate-950 border-slate-800 pl-9"
                                placeholder="e.g. Austin, TX"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="primary_genre">Primary Genre</Label>
                        <div className="relative">
                            <Music className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                id="primary_genre"
                                name="primary_genre"
                                value={profile.primary_genre}
                                onChange={handleInputChange}
                                className="bg-slate-950 border-slate-800 pl-9"
                                placeholder="e.g. Indie Folk"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website / Social Link</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                        id="website"
                        name="website"
                        value={profile.website}
                        onChange={handleInputChange}
                        className="bg-slate-950 border-slate-800 pl-9"
                        placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button 
                        type="submit" 
                        disabled={saving}
                        className="bg-orange-600 hover:bg-orange-700 min-w-[150px]"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Profile
                            </>
                        )}
                    </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArtistProfilePage;
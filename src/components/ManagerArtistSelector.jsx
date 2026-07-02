import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Loader2 } from 'lucide-react';

const ManagerArtistSelector = () => {
  const { user, managedArtistId, setManagedArtistId } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagedArtists = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('manager_artists')
          .select(`
            artist_user_id,
            artist_profiles!inner(id, stage_name, home_city, primary_genre)
          `)
          .eq('manager_user_id', user.id);

        if (error) throw error;
        
        // Map data to simpler structure
        const mappedArtists = data.map(item => ({
            id: item.artist_profiles.id,
            name: item.artist_profiles.stage_name || 'Unnamed Artist',
            meta: `${item.artist_profiles.home_city || 'Unknown City'} • ${item.artist_profiles.primary_genre || 'Genre N/A'}`
        }));

        setArtists(mappedArtists);

        // Auto-select first artist if none selected and list not empty
        if (!managedArtistId && mappedArtists.length > 0) {
            setManagedArtistId(mappedArtists[0].id);
        }
      } catch (err) {
        console.error('Error fetching managed artists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagedArtists();
  }, [user, managedArtistId, setManagedArtistId]);

  if (loading) return <div className="flex items-center text-slate-400 text-sm"><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Loading artists...</div>;

  return (
    <div className="w-[240px] md:w-[300px]">
      <Select 
        value={managedArtistId || 'all'} 
        onValueChange={(val) => setManagedArtistId(val === 'all' ? null : val)}
      >
        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Select Artist" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700 text-white">
          <SelectItem value="all" className="font-semibold text-orange-400">View All / Summary</SelectItem>
          {artists.map((artist) => (
            <SelectItem key={artist.id} value={artist.id}>
              <div className="flex flex-col text-left">
                <span className="font-medium">{artist.name}</span>
                <span className="text-xs text-slate-400">{artist.meta}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ManagerArtistSelector;
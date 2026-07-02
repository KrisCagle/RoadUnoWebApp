import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const PLAN_LIMITS = {
  free: {
    routes: 3,
    shows: 30,
    playbooks: 1,
    export: false,
    advancedAnalytics: false,
    collaborators: false,
    managedArtists: 1
  },
  pro: {
    routes: Infinity,
    shows: Infinity,
    playbooks: Infinity,
    export: true,
    advancedAnalytics: true,
    collaborators: true,
    managedArtists: Infinity
  }
};

export function useSubscription() {
  const { user, effectivePlan } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ routes: 0, shows: 0, playbooks: 0, managedArtists: 0 });

  useEffect(() => {
    if (user) {
      fetchCounts();
    } else {
      setLoading(false);
      setCounts({ routes: 0, shows: 0, playbooks: 0, managedArtists: 0 });
    }
  }, [user]);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const [routes, shows, playbooks, managedArtists] = await Promise.all([
        supabase.from('tour_routes').select('id', { count: 'exact', head: true }).eq('artist_id', user.id),
        supabase.from('shows').select('id', { count: 'exact', head: true }).eq('artist_id', user.id),
        supabase.from('tour_playbooks').select('id', { count: 'exact', head: true }).eq('artist_id', user.id),
        supabase.from('manager_artists').select('id', { count: 'exact', head: true }).eq('manager_user_id', user.id)
      ]);

      setCounts({
        routes: routes.count || 0,
        shows: shows.count || 0,
        playbooks: playbooks.count || 0,
        managedArtists: managedArtists.count || 0
      });

    } catch (error) {
      console.error('Error fetching subscription counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = (feature) => {
    const limits = PLAN_LIMITS[effectivePlan || 'free'];
    const currentCount = counts[feature];
    const limit = limits[feature];
    
    if (limit === Infinity) return { allowed: true };
    if (limit === false) return { allowed: false, reason: 'upgrade_required' };
    
    return {
      allowed: currentCount < limit,
      remaining: limit - currentCount,
      isNearLimit: (limit - currentCount) <= 1,
      reason: currentCount >= limit ? 'limit_reached' : null
    };
  };

  return { plan: user ? effectivePlan : null, counts, loading, checkLimit, refresh: fetchCounts };
}
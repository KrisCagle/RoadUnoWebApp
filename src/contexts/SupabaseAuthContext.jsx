import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [effectivePlan, setEffectivePlan] = useState('anonymous');
  const [profileType, setProfileType] = useState(null);

  const fetchProfile = async (userId) => {
    try {
      console.log(`[AuthContext] Fetching profile for user ${userId}`);
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('plan, profile_type')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error);
        return { plan: 'free', profile_type: 'artist' }; // Fallback
      }

      console.log(`[AuthContext] Profile data:`, data);
      return data || { plan: 'free', profile_type: 'artist' };
    } catch (e) {
      console.error('[AuthContext] Exception fetching profile:', e);
      return { plan: 'free', profile_type: 'artist' };
    }
  };

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);
    
    if (currentUser) {
      const profileData = await fetchProfile(currentUser.id);
      setEffectivePlan(profileData.plan || 'free');
      setProfileType(profileData.profile_type || 'artist');
      // Merge plan into user object for convenience
      currentUser.plan = profileData.plan || 'free';
      currentUser.profile_type = profileData.profile_type || 'artist';
    } else {
      setEffectivePlan('anonymous');
      setProfileType(null);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        await handleSession(session);
      } catch (e) {
        console.error("[AuthContext] Error getting initial session:", e);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AuthContext] Auth state changed: ${event}`);
        await handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    effectivePlan,
    profileType,
    signUp,
    signIn,
    signOut,
  }), [user, session, loading, effectivePlan, profileType, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
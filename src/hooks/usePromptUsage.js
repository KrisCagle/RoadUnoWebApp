import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getPromptLimit } from '@/lib/featureGates';

export const usePromptUsage = () => {
  const { user, effectivePlan } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = getPromptLimit(effectivePlan);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchUsage();
  }, [user, effectivePlan]);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      if (!user || effectivePlan === 'anonymous') {
        // Anonymous: Use Local Storage
        const stored = localStorage.getItem('roaduno_anon_usage');
        setUsageCount(stored ? parseInt(stored, 10) : 0);
      } else if (effectivePlan === 'pro') {
        // Pro: Unlimited, usage tracking is secondary but we can still fetch if needed
        // For UI purposes we can just say 0 or whatever, but let's be consistent
        setUsageCount(0); // Pro users don't need to see usage anxiety
      } else {
        // Free: Use Supabase
        const currentMonth = getCurrentMonth();
        const { data, error } = await supabase
          .from('route_prompt_usage')
          .select('count')
          .eq('user_id', user.id)
          .eq('month', currentMonth)
          .maybeSingle();

        if (error) {
          console.error('Error fetching usage:', error);
        }
        
        // Handle null data using optional chaining and nullish coalescing
        setUsageCount(data?.count ?? 0);
      }
    } catch (err) {
      console.error('Error in fetchUsage:', err);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async () => {
    if (!user || effectivePlan === 'anonymous') {
      const newCount = usageCount + 1;
      localStorage.setItem('roaduno_anon_usage', newCount.toString());
      setUsageCount(newCount);
    } else {
      const currentMonth = getCurrentMonth();
      
      // Upsert logic for usage
      // First try to select
      const { data: existing, error: fetchError } = await supabase
        .from('route_prompt_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle();

      let error;
      if (fetchError) {
        error = fetchError;
        console.error('Error fetching existing usage:', fetchError);
      } else if (existing) {
        const { error: updateError } = await supabase
          .from('route_prompt_usage')
          .update({ count: (existing?.count ?? 0) + 1, updated_at: new Date() })
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('route_prompt_usage')
          .insert({
            user_id: user.id,
            month: currentMonth,
            count: 1
          });
        error = insertError;
      }

      if (error) {
        console.error('Error incrementing usage:', error);
      } else {
        setUsageCount(prev => prev + 1);
      }
    }
  };

  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - usageCount);
  const isLimited = remaining === 0;

  return {
    usageCount,
    remaining,
    isLimited,
    canUsePrompt: !isLimited,
    incrementUsage,
    limit,
    loading
  };
};
import { supabase } from '@/lib/customSupabaseClient';

export const logActivity = async (actionType, description) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_log').insert({
      user_id: user.id,
      action_type: actionType,
      description: description
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
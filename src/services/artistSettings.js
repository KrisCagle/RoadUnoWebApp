import { supabase } from '@/lib/customSupabaseClient';

export const defaultArtistSettings = {
  language: 'en',
  currency: 'USD',
  plan: 'free',
  theme: 'dark',
  notifications_enabled: true,
  max_drive_hours: 6,
  preferred_days: 'Thursday,Friday,Saturday',
  default_budget: '500',
  default_genre: 'Indie Rock',
  additional_notes: ''
};

/**
 * Safely fetches artist settings from Supabase.
 * Returns default settings if user is not authenticated, settings are missing, or API fails.
 * 
 * @param {string} userId - The ID of the authenticated user
 * @returns {Promise<Object>} - Artist settings object
 */
export const loadArtistSettings = async (userId) => {
  if (!userId) {
    return defaultArtistSettings;
  }

  try {
    const { data, error } = await supabase
      .from('artist_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching artist settings, using defaults:', error.message);
      return defaultArtistSettings;
    }

    if (!data) {
      return defaultArtistSettings;
    }

    // Merge fetched data with defaults to ensure all keys exist
    return { 
      ...defaultArtistSettings, 
      ...data,
      additional_notes: data.additional_notes || defaultArtistSettings.additional_notes
    };
  } catch (err) {
    console.error('Unexpected error in loadArtistSettings:', err);
    return defaultArtistSettings;
  }
};
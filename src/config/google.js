/**
 * Google API Configuration
 * 
 * This configuration file manages the Google API key used throughout the application.
 * The key is loaded from the environment variable VITE_GOOGLE_API_KEY.
 * 
 * USAGE:
 * import { GOOGLE_API_KEY } from '@/config/google';
 */

export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

/**
 * Validates that the Google API key is present.
 * logs a warning if missing in development environment.
 * @returns {boolean} True if key exists, false otherwise.
 */
export const validateGoogleConfig = () => {
  if (!GOOGLE_API_KEY) {
    if (import.meta.env.DEV) {
      console.warn(
        '⚠️ [RoadUno Config] Google API Key is missing!\n' +
        'Google Maps and Places features will not function correctly.\n' +
        'Please add VITE_GOOGLE_API_KEY to your .env.local file.'
      );
    }
    return false;
  }
  return true;
};

// Run validation immediately in development
validateGoogleConfig();

export default GOOGLE_API_KEY;
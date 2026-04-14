import { GOOGLE_API_KEY } from '@/config/google';

/**
 * Fetches a place description from Google Places API using findplacefromtext.
 * REST API call disabled to prevent CORS issues and reduce dependency on external endpoints.
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.name - Venue name
 * @param {string} params.city - City name
 * @param {string} [params.country] - Country name (optional)
 * @returns {Promise<string>} - Editorial summary, synthetic description, or empty string
 */
export const fetchPlaceDescription = async ({ name, city, country }) => {
  // Disabled fetch() calls to maps.googleapis.com/maps/api/place/findplacefromtext/json
  // The backend AI proxy should provide sufficient venue descriptions.
  return '';
};
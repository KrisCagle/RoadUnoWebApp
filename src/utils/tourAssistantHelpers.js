import { fetchPlaceDescription } from '@/services/googlePlaces';

/**
 * Helper to extract user messages and combine into a single prompt string.
 * This is useful for proxies that expect a 'prompt' field or for logging.
 * 
 * @param {Array} messages - Array of message objects { role, content }
 * @returns {string} - Combined prompt string
 */
export const buildPromptFromMessages = (messages = []) => {
  if (!Array.isArray(messages)) return '';
  return messages
    .filter(m => m.content)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');
};

/**
 * Builds a formatted prompt string from form state values.
 * Extracts artistName, genre, cities, dates, budget, and additionalInfo.
 * 
 * @param {Object} formState - The form data object
 * @returns {string} - Formatted multi-line string or empty string
 */
export const buildPromptFromForm = (formState) => {
  if (!formState || typeof formState !== 'object') return '';

  const fields = [
    { key: 'artistName', label: 'Artist Name' },
    { key: 'genre', label: 'Genre' },
    { key: 'cities', label: 'Cities' },
    { key: 'dates', label: 'Dates' },
    { key: 'tourDates', label: 'Dates' }, 
    { key: 'budget', label: 'Budget' },
    { key: 'additionalInfo', label: 'Additional Info' }
  ];

  const processedLabels = new Set();
  const lines = [];

  for (const field of fields) {
    const value = formState[field.key];
    if (value && typeof value === 'string' && value.trim() !== '' && !processedLabels.has(field.label)) {
      lines.push(`${field.label}: ${value.trim()}`);
      processedLabels.add(field.label);
    }
  }

  return lines.join('\n');
};

/**
 * Standardizes the response handling from the AI proxy.
 * Checks for success flags, error messages, and extracts data.
 * 
 * @param {Object} result - The raw JSON response from the proxy
 * @returns {Object} - Envelope { success: boolean, data: any, error: string }
 */
export const handleProxyResponse = (result) => {
  if (!result) {
    return { success: false, error: 'No response received from service.' };
  }

  if (typeof result.success === 'boolean') {
    if (result.success) {
      return { success: true, data: result.data || result.result || result };
    } else {
      return { success: false, error: result.error || 'Request failed.' };
    }
  }

  if (result.choices && Array.isArray(result.choices) && result.choices.length > 0) {
     return { success: true, data: result };
  }
  
  if (result.content && typeof result.content === 'string') {
      return { success: true, data: result };
  }

  if (result.error) {
    const errorMsg = typeof result.error === 'object' ? (result.error.message || JSON.stringify(result.error)) : result.error;
    return { success: false, error: errorMsg };
  }

  return { success: true, data: result };
};

/**
 * Enriches venue descriptions in the route plan using Google Places API.
 * Skips venues that already have a description.
 * 
 * @param {Object} routePlan - The route plan object containing venues array
 * @returns {Promise<Object>} - The updated route plan with enriched descriptions
 */
export const enrichVenueDescriptionsIfMissing = async (routePlan) => {
  if (!routePlan || !Array.isArray(routePlan.venues)) return routePlan;

  // Disabled REST API enrichment. Relying entirely on proxy provided descriptions.
  return routePlan;
};

/**
 * Parse city and state from a formatted address string.
 * Example: "282-284 N Cleveland St, Memphis, TN 38104, USA"
 * Returns: "Memphis, TN"
 * 
 * If parsing fails, returns the full formatted_address.
 * If formatted_address is empty/missing, returns "Unknown City".
 */
export function parseCityStateFromAddress(formatted_address) {
  if (!formatted_address || typeof formatted_address !== 'string') {
    return 'Unknown City';
  }

  const trimmed = formatted_address.trim();
  if (!trimmed) {
    return 'Unknown City';
  }

  // Split by comma to get address parts
  const parts = trimmed.split(',').map(p => p.trim());

  // We need at least 3 parts: [street, city, state+zip, country]
  // Example: ["282-284 N Cleveland St", "Memphis", "TN 38104", "USA"]
  if (parts.length < 3) {
    // Fallback: return full address if we can't parse it
    return trimmed;
  }

  // City is the second part (index 1)
  const city = parts[1];

  // State+zip is the third part (index 2)
  // Extract the first two characters (state code)
  const stateZip = parts[2];
  const state = stateZip.substring(0, 2).toUpperCase();

  // Validate state is two letters
  if (state.length === 2 && /^[A-Z]{2}$/.test(state)) {
    return `${city}, ${state}`;
  }

  // Fallback: return full address if parsing fails
  return trimmed;
}
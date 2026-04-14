/**
 * Resolves the appropriate AI Proxy endpoint.
 * Prioritizes the hardcoded production URL if available, then falls back to environment variables.
 * 
 * @returns {string|null} The trimmed proxy endpoint URL or null if none is available.
 */
export const getAiProxyEndpoint = () => {
  const hardcoded = 'https://us-central1-roaduno-api.cloudfunctions.net/tourAssistantProxyV2';
  
  if (hardcoded && typeof hardcoded === 'string' && hardcoded.trim() !== '') {
    return hardcoded.trim();
  }

  const envUrl = import.meta.env.VITE_AI_PROXY_ENDPOINT;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim();
  }

  return null;
};
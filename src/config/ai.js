import { getAiProxyEndpoint } from './aiProxy';

/**
 * AI Service Configuration
 * 
 * Manages configuration for AI/LLM features.
 * Routes all requests through a secure proxy to avoid exposing API keys on the client.
 */

export const AI_PROXY_ENDPOINT = getAiProxyEndpoint();

export const AI_CONFIG = {
  defaultModel: 'gpt-3.5-turbo',
  defaultTemperature: 0.7,
  maxRetries: 3
};

/**
 * Validates AI configuration.
 * @returns {boolean}
 */
export const validateAIConfig = () => {
  if (!getAiProxyEndpoint()) {
    if (import.meta.env.DEV) {
      console.warn(
        '⚠️ [RoadUno Config] AI Proxy Endpoint is missing!\n' +
        'AI features will not work. Please set VITE_AI_PROXY_ENDPOINT in .env.local'
      );
    }
    return false;
  }
  return true;
};

validateAIConfig();
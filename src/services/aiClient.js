import { getAiProxyEndpoint } from '@/config/aiProxy';

/**
 * Service for interacting with AI models via secure proxy.
 * NEVER calls OpenAI directly from the client.
 */
export const aiClient = {
  /**
   * General purpose function to send a message to the AI proxy.
   * Sends the provided payload via POST to the resolved proxy endpoint.
   * 
   * @param {Object} payload - The request body payload (e.g. { messages: [...], model: ..., prompt: ... })
   * @returns {Promise<Object>} - Envelope { success: boolean, data?: any, error?: string }
   */
  sendChatMessage: async (payload) => {
    const endpoint = getAiProxyEndpoint();
    
    if (!endpoint) {
      console.warn('⚠️ AI Proxy Endpoint is missing.');
      return { success: false, error: 'AI Proxy configuration missing. Please check your connection settings.' };
    }

    if (!payload.prompt || typeof payload.prompt !== 'string' || payload.prompt.trim() === '') {
      return { success: false, error: 'Prompt is required and must be a non-empty string.' };
    }

    const requestBody = {
      model: payload.model || 'gpt-3.5-turbo',
      messages: payload.messages,
      prompt: payload.prompt,
    };
    
    if (payload.artistSettings) {
      requestBody.artistSettings = payload.artistSettings;
    }

    // Debug logging (no sensitive data)
    console.log('Sending request to proxy:', {
      endpoint,
      payloadKeys: Object.keys(payload),
      promptLength: payload.prompt.length
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Proxy response status:', response.status);

      // Read as text first to handle non-JSON error pages safely
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse proxy response as JSON.');
        return { success: false, error: 'Invalid response format received from AI service.' };
      }

      if (!response.ok) {
        const errorMsg = data.error?.message || data.error || `HTTP Error ${response.status}: ${response.statusText}`;
        console.error('HTTP Error from proxy:', errorMsg);
        return { success: false, error: errorMsg };
      }

      // Check explicit success flag if provided
      if (data.success === false) {
        const proxyErrorMsg = data.error?.message || data.error || 'Proxy reported a failure.';
        console.error('Proxy Error:', proxyErrorMsg);
        return { success: false, error: proxyErrorMsg };
      }

      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Network error in sendChatMessage:', error);
      return { success: false, error: 'Network error communicating with AI service. Please try again later.' };
    }
  }
};

/**
 * Helper export for direct usage
 */
export const sendChatMessage = aiClient.sendChatMessage;

export default aiClient;
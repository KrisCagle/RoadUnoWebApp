import { useState, useEffect } from 'react';

const MAX_ANON_TOUR_PROMPTS = 3;
const ANON_TOUR_PROMPT_KEY = 'roaduno_tour_free_prompt_count';

/**
 * Gets the current usage count for anonymous visitors from localStorage.
 */
export const getAnonTourUsage = () => {
  if (typeof window === 'undefined') return 0;
  try {
    const count = parseInt(localStorage.getItem(ANON_TOUR_PROMPT_KEY) || '0', 10);
    return isNaN(count) ? 0 : count;
  } catch (e) {
    console.warn('Error reading tour quota:', e);
    return 0;
  }
};

/**
 * Increments the anonymous usage count in localStorage.
 */
export const incrementAnonTourUsage = () => {
  if (typeof window === 'undefined') return 0;
  try {
    const current = getAnonTourUsage();
    const next = current + 1;
    localStorage.setItem(ANON_TOUR_PROMPT_KEY, next.toString());
    return next;
  } catch (e) {
    console.warn('Error incrementing tour quota:', e);
    return 0;
  }
};

/**
 * Resets the anonymous usage count (useful for testing or manual resets).
 */
export const resetAnonTourUsage = () => {
   if (typeof window === 'undefined') return;
   localStorage.setItem(ANON_TOUR_PROMPT_KEY, '0');
};

/**
 * Checks if the user is allowed to use the tour assistant.
 * Logged-in users (userId provided) have unlimited access.
 * Visitors are limited to MAX_ANON_TOUR_PROMPTS.
 */
export const canUseTourAssistant = (userId) => {
  if (userId) return true; // Unlimited for logged-in users
  return getAnonTourUsage() < MAX_ANON_TOUR_PROMPTS;
};

/**
 * Returns the number of remaining prompts for the user.
 * Returns null for logged-in users (unlimited).
 */
export const getRemainingPrompts = (userId) => {
  if (userId) return null; // Unlimited
  const used = getAnonTourUsage();
  return Math.max(0, MAX_ANON_TOUR_PROMPTS - used);
};

/**
 * React hook for consuming tour quota logic in components.
 */
export const useTourQuota = (userId) => {
  const [remaining, setRemaining] = useState(getRemainingPrompts(userId));
  const [canGenerate, setCanGenerate] = useState(canUseTourAssistant(userId));

  const refreshQuota = () => {
    setRemaining(getRemainingPrompts(userId));
    setCanGenerate(canUseTourAssistant(userId));
  };

  useEffect(() => {
    refreshQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const increment = () => {
    if (!userId) {
      incrementAnonTourUsage();
      refreshQuota();
    }
  };

  return { remaining, canGenerate, increment, refreshQuota };
};
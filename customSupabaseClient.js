export const PLAN_CONFIG = {
  anonymous: {
    promptLimit: 3,
    dashboardAccess: false,
    playbooksAccess: false,
    fullHistoryAccess: false,
    fullDashboardAccess: false,
    managerAccess: false,
    multiArtistAccess: false
  },
  free: {
    promptLimit: 10,
    dashboardAccess: true,
    playbooksAccess: false,
    fullHistoryAccess: false,
    fullDashboardAccess: false,
    managerAccess: true,
    multiArtistAccess: false // Free managers see 1 artist effectively or limited view
  },
  pro: {
    promptLimit: Infinity,
    dashboardAccess: true,
    playbooksAccess: true,
    fullHistoryAccess: true,
    fullDashboardAccess: true,
    managerAccess: true,
    multiArtistAccess: true
  }
};

export const getPromptLimit = (effectivePlan) => {
  const plan = PLAN_CONFIG[effectivePlan] || PLAN_CONFIG.free;
  return plan.promptLimit;
};

export const canUsePrompt = (effectivePlan, currentUsage) => {
  const limit = getPromptLimit(effectivePlan);
  return currentUsage < limit;
};

export const canAccessDashboard = (effectivePlan) => {
  const plan = PLAN_CONFIG[effectivePlan] || PLAN_CONFIG.anonymous;
  return plan.dashboardAccess;
};

export const canAccessPlaybooks = (effectivePlan) => {
  const plan = PLAN_CONFIG[effectivePlan] || PLAN_CONFIG.anonymous;
  return plan.playbooksAccess;
};

export const canAccessFullHistory = (effectivePlan) => {
  const plan = PLAN_CONFIG[effectivePlan] || PLAN_CONFIG.anonymous;
  return plan.fullHistoryAccess;
};

export const isDashboardFull = (effectivePlan) => {
  const plan = PLAN_CONFIG[effectivePlan] || PLAN_CONFIG.anonymous;
  return plan.fullDashboardAccess;
};

// Manager Specific Gates
export const canAccessManagerDashboard = (effectivePlan) => {
    const plan = PLAN_CONFIG[effectivePlan] || PLAN_CONFIG.anonymous;
    return plan.managerAccess;
};

export const canAccessMultiArtistAnalytics = (effectivePlan) => {
    const plan = PLAN_CONFIG[effectivePlan] || PLAN_CONFIG.anonymous;
    return plan.multiArtistAccess;
};

export const canAccessVenueBreakdowns = (effectivePlan) => {
    // Usually a pro feature for deep dives
    return effectivePlan === 'pro' || effectivePlan === 'dev';
};
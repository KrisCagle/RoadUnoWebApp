import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { loadAdSense, removeAllAdElements } from '@/services/adsense';
import EPKBuilderPage from '@/pages/EPKBuilderPage';
import EPKPage from '@/pages/EPKPage';

import HomePage from '@/pages/HomePage';
import TourAssistantPage from '@/pages/TourAssistantPage';
import TourAssistantV2Page from '@/pages/TourAssistantV2Page';
import ResourcesPage from '@/pages/ResourcesPage';
import ResourceDetailPage from '@/pages/ResourceDetailPage';
import ToolsPage from '@/pages/ToolsPage';
import BreakEvenCalculatorPage from '@/pages/BreakEvenCalculatorPage';
import TourRoutingPlannerPage from '@/pages/TourRoutingPlannerPage';
import MerchProfitCalculatorPage from '@/pages/MerchProfitCalculatorPage';
import ContactPage from '@/pages/ContactPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfUsePage from '@/pages/TermsOfUsePage';
import ArtistProfilePage from '@/pages/ArtistProfilePage';
import VenueLeadsPage from '@/pages/VenueLeadsPage';
import ArtistSettingsPage from '@/pages/ArtistSettingsPage';
import ShowHistoryPage from '@/pages/ShowHistoryPage';
import RouteTemplatesPage from '@/pages/RouteTemplatesPage';
import RecentActivityPage from '@/pages/RecentActivityPage';

// New Pages
import DashboardPage from '@/pages/DashboardPage';
import AccountSecurityPage from '@/pages/AccountSecurityPage';
import PrivacyAndDataPage from '@/pages/PrivacyAndDataPage';
import TouringSafetyTipsPage from '@/pages/TouringSafetyTipsPage';
import TourRouteDetailPage from '@/pages/TourRouteDetailPage';
import PricingPage from '@/pages/PricingPage';
import TourPlaybooksPage from '@/pages/TourPlaybooksPage';
import BillingSuccessPage from '@/pages/BillingSuccessPage';
import BillingCancelledPage from '@/pages/BillingCancelledPage';
import CheckEmailPage from '@/pages/CheckEmailPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';

// Manager Pages
import ManagerDashboardPage from '@/pages/ManagerDashboardPage';
import ManagerVenueAnalyticsPage from '@/pages/ManagerVenueAnalyticsPage';
import ManagerRoutePerformancePage from '@/pages/ManagerRoutePerformancePage';
import ManagerArtistManagementPage from '@/pages/ManagerArtistManagementPage';

const ProtectedRoute = ({ children, allowedTypes = ['artist', 'manager'] }) => {
    const { user, loading, profileType } = useAuth();
    
    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
    
    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!allowedTypes.includes(profileType)) {
        // Redirect to appropriate dashboard if trying to access wrong area
        if (profileType === 'manager') return <Navigate to="/manager-dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
  const { loading: authLoading } = useAuth();
  const { plan, loading: subLoading } = useSubscription();

  useEffect(() => {
    if (authLoading || subLoading) return;

    if (plan === 'pro') {
      console.log("[AdSense] Pro user detected - enabling no-ads mode and cleaning up AdSense");
      document.body.classList.add('no-ads');
      removeAllAdElements();
    } else {
      console.log("[AdSense] Free/anonymous user - disabling no-ads mode and loading AdSense");
      document.body.classList.remove('no-ads');
      loadAdSense('ca-pub-8085610381464512').catch(err => {
        console.error('Failed to load AdSense script:', err);
      });
    }
  }, [authLoading, subLoading, plan]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tour-assistant" element={<TourAssistantPage />} />
        <Route path="/tour-assistant-v2" element={<TourAssistantV2Page />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:slug" element={<ResourceDetailPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/break-even-calculator" element={<BreakEvenCalculatorPage />} />
        <Route path="/tools/tour-routing-planner" element={<TourRoutingPlannerPage />} />
        <Route path="/tools/merch-profit-calculator" element={<MerchProfitCalculatorPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-use" element={<TermsOfUsePage />} />
        <Route path="/privacy-and-data" element={<PrivacyAndDataPage />} />
        <Route path="/touring-safety-tips" element={<TouringSafetyTipsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/billing/success" element={<BillingSuccessPage />} />
        <Route path="/billing/cancelled" element={<BillingCancelledPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/epk-builder" element={<EPKBuilderPage />} />
        <Route path="/epk/:slug" element={<EPKPage />} />
        
        
        {/* Artist Protected Routes */}
        <Route path="/dashboard" element={
            <ProtectedRoute allowedTypes={['artist']}>
                <DashboardPage />
            </ProtectedRoute>
        } />
        <Route path="/profile" element={
            <ProtectedRoute>
                <ArtistProfilePage />
            </ProtectedRoute>
        } />
        <Route path="/account-security" element={
            <ProtectedRoute>
                <AccountSecurityPage />
            </ProtectedRoute>
        } />
        <Route path="/venue-leads" element={
            <ProtectedRoute>
                <VenueLeadsPage />
            </ProtectedRoute>
        } />
        <Route path="/artist-settings" element={
            <ProtectedRoute>
                <ArtistSettingsPage />
            </ProtectedRoute>
        } />
        <Route path="/show-history" element={
            <ProtectedRoute>
                <ShowHistoryPage />
            </ProtectedRoute>
        } />
        <Route path="/route-templates" element={
            <ProtectedRoute>
                <RouteTemplatesPage />
            </ProtectedRoute>
        } />
        <Route path="/tour-playbooks" element={
            <ProtectedRoute>
                <TourPlaybooksPage />
            </ProtectedRoute>
        } />
        <Route path="/recent-activity" element={
            <ProtectedRoute>
                <RecentActivityPage />
            </ProtectedRoute>
        } />
        <Route path="/routes/:id" element={
            <ProtectedRoute>
                <TourRouteDetailPage />
            </ProtectedRoute>
        } />

        {/* Manager Protected Routes */}
        <Route path="/manager-dashboard" element={
            <ProtectedRoute allowedTypes={['manager']}>
                <ManagerDashboardPage />
            </ProtectedRoute>
        } />
        <Route path="/manager-venue-analytics" element={
            <ProtectedRoute allowedTypes={['manager']}>
                <ManagerVenueAnalyticsPage />
            </ProtectedRoute>
        } />
        <Route path="/manager-route-performance" element={
            <ProtectedRoute allowedTypes={['manager']}>
                <ManagerRoutePerformancePage />
            </ProtectedRoute>
        } />
         <Route path="/manager-artists" element={
            <ProtectedRoute allowedTypes={['manager']}>
                <ManagerArtistManagementPage />
            </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;
import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { isAdSenseLoaded } from '@/services/adsense';
import AdSlot from './AdSlot';

const AdSidebar = ({ className = "" }) => {
  const { loading: authLoading } = useAuth();
  const { plan, loading: subLoading } = useSubscription();

  if (authLoading || subLoading || plan === 'pro' || !isAdSenseLoaded()) {
    return null;
  }

  return (
    <div className={`w-full bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 ${className}`}>
        <div className="text-xs text-slate-600 text-center mb-2 uppercase tracking-widest">Advertisement</div>
        {/* Replace '1234567890' with actual ad unit ID from Google AdSense dashboard */}
        <AdSlot 
            adSlot="1234567890" 
            adFormat="vertical" 
            style={{ minHeight: '600px' }}
        />
        <div className="text-center mt-2">
            <a href="/pricing" className="text-xs text-slate-500 hover:text-orange-400 transition-colors">
                Remove ads with Pro
            </a>
        </div>
    </div>
  );
};

export default AdSidebar;
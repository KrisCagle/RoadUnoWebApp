import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { isAdSenseLoaded } from '@/services/adsense';

const AdSlot = ({ adSlot, adFormat = 'auto', style = {}, className = '', layoutKey = '' }) => {
  const { loading: authLoading } = useAuth();
  const { plan, loading: subLoading } = useSubscription();
  const adRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (authLoading || subLoading || plan === 'pro' || !isAdSenseLoaded() || initialized.current) {
      return;
    }

    if (adRef.current) {
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        }
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [authLoading, subLoading, plan]);

  if (authLoading || subLoading || plan === 'pro' || !isAdSenseLoaded()) {
    return null;
  }

  return (
    <div className={`ad-container w-full flex justify-center my-4 ${className}`} aria-label="Advertisement">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-8085610381464512"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
};

export default AdSlot;
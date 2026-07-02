let loadPromise = null;

export const isAdSenseLoaded = () => {
  return typeof window !== 'undefined' && !!window.adsbygoogle;
};

export const loadAdSense = (clientId) => {
  if (loadPromise) {
    return loadPromise;
  }

  if (isAdSenseLoaded()) {
    return Promise.resolve();
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-adsense', 'true');

    script.onload = () => {
      resolve();
    };

    script.onerror = (error) => {
      loadPromise = null;
      reject(error);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

export const removeAllAdElements = () => {
  try {
    let counts = { scripts: 0, ins: 0, autoPlaced: 0, iframes: 0, adsIframes: 0 };
    
    // Remove scripts
    document.querySelectorAll('script[data-adsense="true"], script[src*="pagead2.googlesyndication.com"]').forEach(el => {
      el.remove();
      counts.scripts++;
    });

    // Remove ins elements
    document.querySelectorAll('ins.adsbygoogle').forEach(el => {
      el.remove();
      counts.ins++;
    });

    // Remove auto placed
    document.querySelectorAll('.google-auto-placed').forEach(el => {
      el.remove();
      counts.autoPlaced++;
    });

    // Remove iframes
    document.querySelectorAll('iframe[id^="aswift_"], iframe[src*="googleads"]').forEach(el => {
      el.remove();
      counts.iframes++;
    });

    // Remove google ads iframes
    document.querySelectorAll('[id^="google_ads_iframe_"]').forEach(el => {
      el.remove();
      counts.adsIframes++;
    });

    console.log('[AdSense] Removed ad elements:', counts);
    
    // Reset load promise so it can be loaded again if needed
    loadPromise = null;
  } catch (error) {
    console.error('[AdSense] Error removing ad elements:', error);
  }
};
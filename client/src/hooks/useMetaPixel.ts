import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    fbq?: (command: string, event: string, data?: Record<string, any>) => void;
    _fbp?: string;
    _fbc?: string;
  }
}

export function useMetaPixel() {
  const getPixelData = useCallback(() => {
    // Aguardar um pouco para o pixel ser inicializado
    return new Promise<{ fbp?: string; fbc?: string }>((resolve) => {
      setTimeout(() => {
        const fbp = window._fbp;
        const fbc = window._fbc;
        
        console.log('[useMetaPixel] Captured fbp:', fbp);
        console.log('[useMetaPixel] Captured fbc:', fbc);
        
        resolve({
          fbp: fbp || undefined,
          fbc: fbc || undefined,
        });
      }, 500); // Aumentado de 100ms para 500ms para garantir que o Meta Pixel inicialize
    });
  }, []);

  const trackEvent = useCallback((eventName: string, data?: Record<string, any>) => {
    if (window.fbq) {
      window.fbq('track', eventName, data);
    }
  }, []);

  const trackLead = useCallback(() => {
    trackEvent('Lead');
  }, [trackEvent]);

  const trackPurchase = useCallback((value: number, currency: string = 'BRL') => {
    trackEvent('Purchase', {
      value,
      currency,
    });
  }, [trackEvent]);

  const trackInitiateCheckout = useCallback((value: number, currency: string = 'BRL') => {
    trackEvent('InitiateCheckout', {
      value,
      currency,
    });
  }, [trackEvent]);

  return {
    getPixelData,
    trackEvent,
    trackLead,
    trackPurchase,
    trackInitiateCheckout,
  };
}

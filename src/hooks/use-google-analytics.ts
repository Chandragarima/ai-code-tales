import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useGoogleAnalytics = () => {
  const location = useLocation();

  // Track page views when location changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-TBW3Q8RF6R', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Helper function to track custom events
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  // Helper function to track page views manually
  const trackPageView = (path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-TBW3Q8RF6R', {
        page_path: path,
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
  };
}; 
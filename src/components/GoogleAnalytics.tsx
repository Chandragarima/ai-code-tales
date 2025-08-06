import { useGoogleAnalytics } from '@/hooks/use-google-analytics';

export const GoogleAnalytics = () => {
  // This component doesn't render anything, it just initializes the hook
  useGoogleAnalytics();
  
  return null;
}; 
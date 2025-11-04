import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/tracking";

export const useAnalytics = () => {
  const trackSearch = async (systemName: string, errorCode: string, userId?: string) => {
    try {
      await (supabase as any).from("search_analytics" as any).insert({
        system_name: systemName,
        error_code: errorCode,
        user_id: userId || null,
      });
    } catch (error) {
      // Silently fail - analytics is non-critical
      console.debug("Search analytics tracking failed (non-critical):", error);
    }
    try {
      await trackEvent("search", { systemName, errorCode }, undefined, userId);
    } catch (error) {
      // Silently fail - event tracking is non-critical
      console.debug("Event tracking failed (non-critical):", error);
    }
  };

  return { trackSearch };
};

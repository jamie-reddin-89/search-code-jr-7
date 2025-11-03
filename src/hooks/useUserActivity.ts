import { useEffect, useState } from "react";
import * as React from "react";
const { useEffect, useState } = React;
import { supabase } from "@/integrations/supabase/client";
import { trackUserActivity, createUserSession } from "@/lib/userTracking";

let sessionId: string | null = null;

export function useUserActivity() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // Create a new session for this user
        const session = await createUserSession(user.id);
        if (session) {
          sessionId = session.id;
        }
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    // Track page views
    trackUserActivity(currentUser?.id || null, "page_view");

    // Cleanup on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const trackActivity = async (type: string, path?: string, meta?: any) => {
    await trackUserActivity(currentUser?.id || null, type, path, meta);
  };

  return { currentUser, trackActivity };
}

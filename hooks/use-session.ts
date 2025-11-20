"use client";

import { useState, useEffect } from "react";

/**
 * Client-side hook to fetch session data
 *
 * Uses the Better Auth client API to get current session
 * Returns userId if authenticated, undefined otherwise
 */
export function useSession() {
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Use fetch to call Better Auth session endpoint
        const response = await fetch('/api/auth/get-session', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.user?.id) {
            setUserId(Number(data.user.id));
          }
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { userId, isLoading };
}

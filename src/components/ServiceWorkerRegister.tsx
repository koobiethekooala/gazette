"use client";

import { useEffect } from "react";

/** Registers the offline service worker in production (and when SW is supported). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Avoid fighting Next.js HMR in development.
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch (error) {
        console.warn("Service worker registration failed", error);
      }
    };

    void register();
  }, []);

  return null;
}

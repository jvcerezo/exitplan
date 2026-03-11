"use client";

import { useEffect, useState } from "react";

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const updateStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

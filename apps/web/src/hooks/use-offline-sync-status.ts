"use client";

import { useEffect, useState } from "react";
import {
  getOfflineSyncEventName,
  getOfflineSyncMeta,
} from "@/lib/offline/store";
import {
  createDefaultOfflineSyncMeta,
  type OfflineSyncMeta,
} from "@/lib/offline/types";

export function useOfflineSyncStatus() {
  const [meta, setMeta] = useState<OfflineSyncMeta>(createDefaultOfflineSyncMeta());

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const nextMeta = await getOfflineSyncMeta();
      if (mounted) {
        setMeta(nextMeta);
      }
    };

    void load();

    const eventName = getOfflineSyncEventName();
    const handler = () => {
      void load();
    };

    window.addEventListener(eventName, handler);
    const interval = window.setInterval(() => {
      void load();
    }, 3000);

    return () => {
      mounted = false;
      window.removeEventListener(eventName, handler);
      window.clearInterval(interval);
    };
  }, []);

  return meta;
}

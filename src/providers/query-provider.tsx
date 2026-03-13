"use client";

import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, type ReactNode } from "react";

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Serve cached data immediately; treat it as fresh for 10 min
            staleTime: 10 * 60 * 1000,
            // Keep in memory for 24 h (matches persister maxAge)
            gcTime: 24 * 60 * 60 * 1000,
            // Don't refetch just because the window was focused
            refetchOnWindowFocus: false,
            // DO refetch stale queries once we reconnect
            refetchOnReconnect: true,
            // Only retry once; don't hammer Supabase when offline
            retry: 1,
            // Show cached data even when a fetch is in-flight or failed
            // This is the key setting that makes the app usable offline
            networkMode: "offlineFirst",
          },
          mutations: {
            // Queue mutations; don't retry automatically (we have our own queue)
            networkMode: "offlineFirst",
            retry: 0,
          },
        },
      })
  );

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage:
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      key: "EXITPLAN_OFFLINE_CACHE",
      throttleTime: 1000,
    })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Keep persisted cache for 24 hours
        maxAge: 1000 * 60 * 60 * 24,
        // Don't wipe the cache during hydration on page load — use it immediately
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === "success",
        },
      }}
    >
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  );
}

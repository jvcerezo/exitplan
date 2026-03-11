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
            staleTime: 10 * 60 * 1000, // 10 minutes — reuse cache on page nav
            gcTime: 30 * 60 * 1000, // 30 minutes — keep in memory longer
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
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
        maxAge: 1000 * 60 * 60 * 24,
      }}
    >
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </PersistQueryClientProvider>
  );
}

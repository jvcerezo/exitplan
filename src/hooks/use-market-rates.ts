import { useQuery } from "@tanstack/react-query";

interface MarketRatesResponse {
  rates: Record<string, number>;
  updated_at: string;
  source: "cache" | "api" | "stale-cache";
}

export function useMarketRates() {
  return useQuery({
    queryKey: ["market-rates"],
    queryFn: async (): Promise<MarketRatesResponse> => {
      const res = await fetch("/api/exchange-rates");
      if (!res.ok) throw new Error("Failed to fetch market rates");
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
  });
}

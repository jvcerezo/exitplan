import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DEFAULT_RATES_TO_PHP } from "@/lib/constants";
import { useMarketRates } from "@/hooks/use-market-rates";
import type { ExchangeRate } from "@/lib/types/database";

export function useExchangeRates() {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async (): Promise<ExchangeRate[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .order("from_currency", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useConvertCurrency() {
  const { data: userRates } = useExchangeRates();
  const { data: marketData } = useMarketRates();
  const marketRates = marketData?.rates;

  return function convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    if (fromCurrency === toCurrency) return amount;

    // 1. User-defined rate (exact match)
    const userRate = userRates?.find(
      (r) =>
        r.from_currency === fromCurrency && r.to_currency === toCurrency
    );
    if (userRate) return amount * userRate.rate;

    // 2. User-defined reverse rate
    const reverseRate = userRates?.find(
      (r) =>
        r.from_currency === toCurrency && r.to_currency === fromCurrency
    );
    if (reverseRate && reverseRate.rate > 0) return amount / reverseRate.rate;

    // 3. Market rates (cross-rate via PHP)
    if (marketRates) {
      const fromToPhp = marketRates[fromCurrency];
      const toToPhp = marketRates[toCurrency];
      if (fromToPhp && toToPhp) {
        return (amount * fromToPhp) / toToPhp;
      }
    }

    // 4. Hardcoded fallback
    const fromToPhp = DEFAULT_RATES_TO_PHP[fromCurrency] ?? 1;
    const toToPhp = DEFAULT_RATES_TO_PHP[toCurrency] ?? 1;
    return (amount * fromToPhp) / toToPhp;
  };
}

export function useUpsertExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      from_currency,
      to_currency,
      rate,
    }: {
      from_currency: string;
      to_currency: string;
      rate: number;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("exchange_rates").upsert(
        {
          user_id: user.id,
          from_currency,
          to_currency,
          rate,
        },
        { onConflict: "user_id,from_currency,to_currency" }
      );

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      toast.success("Exchange rate updated");
    },
    onError: (error) => {
      toast.error("Failed to update rate", { description: error.message });
    },
  });
}

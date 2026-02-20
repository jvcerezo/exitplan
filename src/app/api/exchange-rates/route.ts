import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CURRENCIES } from "@/lib/constants";

const SUPPORTED_CODES = CURRENCIES.map((c) => c.code).filter((c) => c !== "PHP");
const CACHE_HOURS = 24;

export async function GET() {
  const supabase = createAdminClient();

  // Check if we have fresh cached rates
  const { data: cached } = await supabase
    .from("market_rates")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1);

  const lastUpdate = cached?.[0]?.updated_at;
  const isFresh =
    lastUpdate &&
    Date.now() - new Date(lastUpdate).getTime() < CACHE_HOURS * 60 * 60 * 1000;

  if (isFresh && cached && cached.length > 0) {
    // Return cached rates
    const { data: allRates } = await supabase
      .from("market_rates")
      .select("*");

    const rates: Record<string, number> = { PHP: 1 };
    for (const row of allRates ?? []) {
      rates[row.currency] = Number(row.rate_to_php);
    }

    return NextResponse.json({
      rates,
      updated_at: lastUpdate,
      source: "cache",
    });
  }

  // Fetch fresh rates from ExchangeRate-API
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/PHP", {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();

    if (data.result !== "success" || !data.rates) {
      throw new Error("Invalid API response");
    }

    // API returns "1 PHP = X foreign currency"
    // We need "1 foreign currency = X PHP" (rate_to_php)
    const now = new Date().toISOString();
    const rates: Record<string, number> = { PHP: 1 };

    for (const code of SUPPORTED_CODES) {
      const apiRate = data.rates[code];
      if (apiRate && apiRate > 0) {
        const rateToPhp = 1 / apiRate;
        rates[code] = rateToPhp;

        await supabase.from("market_rates").upsert(
          {
            currency: code,
            rate_to_php: rateToPhp,
            updated_at: now,
          },
          { onConflict: "currency" }
        );
      }
    }

    return NextResponse.json({
      rates,
      updated_at: now,
      source: "api",
    });
  } catch (error) {
    // If API fails, return cached rates if any exist
    const { data: fallback } = await supabase
      .from("market_rates")
      .select("*");

    if (fallback && fallback.length > 0) {
      const rates: Record<string, number> = { PHP: 1 };
      for (const row of fallback) {
        rates[row.currency] = Number(row.rate_to_php);
      }

      return NextResponse.json({
        rates,
        updated_at: fallback[0].updated_at,
        source: "stale-cache",
      });
    }

    // No cached rates at all — return error
    return NextResponse.json(
      {
        error: "Failed to fetch exchange rates",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}

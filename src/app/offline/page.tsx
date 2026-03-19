import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Offline",
  description: "Offline fallback page for Sandalan cached routes and availability information.",
  path: "/offline",
  index: false,
});

const supportedRoutes = [
  "/home",
  "/accounts",
  "/transactions",
  "/goals",
  "/budgets",
  "/settings",
];

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-200">
            <WifiOff className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">You&apos;re offline</h1>
          <p className="text-muted-foreground">
            Sandalan can still show cached screens you&apos;ve already opened,
            but this page appears when the requested route is not available offline yet.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available offline right now</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            {supportedRoutes.map((route) => (
              <div key={route} className="rounded-lg border px-3 py-2 font-mono text-xs sm:text-sm">
                {route}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What still needs internet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Logging in, signing up, and auth callbacks</p>
            <p>- Admin pages and live operational data</p>
            <p>- Receipt uploads, OCR, and file imports</p>
            <p>- Editing or deleting existing records</p>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/home">Open cached dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try again later
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

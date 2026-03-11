import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OfflineStatusBanner } from "@/components/layout/offline-status-banner";
import { OfflineSyncRuntime } from "@/components/layout/offline-sync-runtime";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExitPlan — Financial Freedom Tracker",
  description: "Track your finances. Plan your freedom.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ServiceWorkerRegister />
          <QueryProvider>
            <OfflineSyncRuntime />
            <OfflineStatusBanner />
            {children}
          </QueryProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

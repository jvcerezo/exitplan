import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FAB } from "@/components/layout/fab";
import { AppShell } from "@/components/layout/app-shell";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | ExitPlan",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <MobileNav />
        <main className="md:pl-64">
          <div className="mx-auto max-w-5xl px-4 pt-[calc(env(safe-area-inset-top)+4.25rem)] sm:px-6 lg:px-8 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:pt-6 md:pb-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        <FAB />
      </div>
    </AppShell>
  );
}

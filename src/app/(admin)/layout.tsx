import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminBottomNav } from "@/components/layout/admin-bottom-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 pb-20 md:pb-6">
          {children}
        </div>
      </main>
      <AdminBottomNav />
    </div>
  );
}

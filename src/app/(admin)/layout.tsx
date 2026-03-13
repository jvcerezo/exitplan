import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminBottomNav } from "@/components/layout/admin-bottom-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin_user", {
    p_user_id: user.id,
  });

  if (error || !isAdmin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 pb-[calc(env(safe-area-inset-bottom)+7rem)] md:pb-6">
          {children}
        </div>
      </main>
      <AdminBottomNav />
    </div>
  );
}

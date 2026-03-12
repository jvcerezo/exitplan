import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BugReportStatus } from "@/lib/types/database";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: BugReportStatus[] = ["open", "in_progress", "resolved"];

function prettyStatus(status: BugReportStatus) {
  return status === "in_progress" ? "In Progress" : status === "open" ? "Open" : "Resolved";
}

function severityClass(severity: string) {
  switch (severity) {
    case "critical":
      return "text-black dark:text-white";
    case "high":
      return "text-amber-500";
    case "medium":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
}

async function getOpenBugReports() {
  const admin = createAdminClient();

  const { data: reports, error } = await admin
    .from("bug_reports")
    .select("id, created_at, user_id, title, description, severity, status, page_path, user_agent")
    .in("status", ["open", "in_progress"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const userIds = Array.from(new Set((reports ?? []).map((r) => r.user_id)));

  const { data: profiles } = userIds.length
    ? await admin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (reports ?? []).map((report) => {
    const profile = profileById.get(report.user_id);
    return {
      ...report,
      reporterName: profile?.full_name || "Unknown",
      reporterEmail: profile?.email || null,
    };
  });
}

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin_user", {
    p_user_id: user.id,
  });

  if (error || !isAdmin) redirect("/dashboard");

  return user.id;
}

async function updateBugStatus(formData: FormData) {
  "use server";

  const adminUserId = await assertAdmin();

  const bugId = String(formData.get("bug_id") || "").trim();
  const status = String(formData.get("status") || "") as BugReportStatus;

  if (!bugId) throw new Error("Missing bug report id");
  if (!STATUS_OPTIONS.includes(status)) throw new Error("Invalid status");

  const admin = createAdminClient();

  const isResolved = status === "resolved";

  const { error } = await admin
    .from("bug_reports")
    .update({
      status,
      resolved_at: isResolved ? new Date().toISOString() : null,
      resolved_by: isResolved ? adminUserId : null,
    })
    .eq("id", bugId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/bug-reports");
  revalidatePath("/admin");
}

export default async function AdminBugReportsPage() {
  await assertAdmin();
  const reports = await getOpenBugReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bug Reports</h1>
        <p className="text-muted-foreground">
          Open and in-progress issues reported by users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open bug reports.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="rounded-lg border border-border/60 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {report.reporterName}
                        {report.reporterEmail ? ` · ${report.reporterEmail}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {prettyStatus(report.status as BugReportStatus)}
                      </Badge>
                      <span className={`text-xs font-semibold uppercase ${severityClass(report.severity)}`}>
                        {report.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm whitespace-pre-wrap break-words">{report.description}</p>

                  <div className="text-xs text-muted-foreground grid gap-1 sm:grid-cols-2">
                    <p>
                      Submitted {new Date(report.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="truncate">Page: {report.page_path || "(not provided)"}</p>
                  </div>

                  <form action={updateBugStatus} className="flex items-center gap-2">
                    <input type="hidden" name="bug_id" value={report.id} />
                    <select
                      name="status"
                      defaultValue={report.status}
                      className="h-9 rounded-md border bg-background px-3 text-sm"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {prettyStatus(status)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      Update Status
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

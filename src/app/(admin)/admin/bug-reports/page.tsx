import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BugReportSeverity, BugReportStatus } from "@/lib/types/database";
import { requireUUID } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: BugReportStatus[] = ["open", "in_progress", "resolved"];
const SEVERITY_OPTIONS: Array<BugReportSeverity | "all"> = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
];

function prettyStatus(status: BugReportStatus) {
  return status === "in_progress" ? "In Progress" : status === "open" ? "Open" : "Resolved";
}

function prettySeverity(severity: BugReportSeverity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function severityClass(severity: string) {
  switch (severity) {
    case "critical":
      return "text-red-600";
    case "high":
      return "text-amber-600";
    case "medium":
      return "text-blue-600";
    default:
      return "text-muted-foreground";
  }
}

function statusBadgeClass(status: BugReportStatus) {
  if (status === "resolved") return "text-emerald-700";
  if (status === "in_progress") return "text-amber-700";
  return "text-red-600";
}

function getInitials(name: string) {
  const cleaned = name.trim();
  if (!cleaned) return "U";
  return cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

function firstSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

async function getBugReports() {
  const admin = createAdminClient();

  const { data: reports, error } = await admin
    .from("bug_reports")
    .select("id, created_at, user_id, title, description, severity, status, page_path, user_agent")
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

  if (error || !isAdmin) redirect("/home");

  return user.id;
}

async function updateBugStatus(formData: FormData) {
  "use server";

  const adminUserId = await assertAdmin();

  const bugId = requireUUID(String(formData.get("bug_id") || ""), "bug report id");
  const status = String(formData.get("status") || "") as BugReportStatus;
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
  const reports = await getBugReports();

  return <AdminBugReportsView reports={reports} />;
}

function AdminBugReportsView({
  reports,
}: {
  reports: Awaited<ReturnType<typeof getBugReports>>;
}) {
  const totalReports = reports.length;
  const openCount = reports.filter((report) => report.status === "open").length;
  const inProgressCount = reports.filter(
    (report) => report.status === "in_progress"
  ).length;
  const resolvedCount = reports.filter(
    (report) => report.status === "resolved"
  ).length;
  const criticalOpenCount = reports.filter(
    (report) => report.severity === "critical" && report.status !== "resolved"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bug Reports</h1>
        <p className="text-sm text-muted-foreground">
          Triage incoming issues and inspect reporter context fast.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Reports" value={totalReports} />
        <SummaryCard title="Open" value={openCount} tone="critical" />
        <SummaryCard title="In Progress" value={inProgressCount} tone="warn" />
        <SummaryCard title="Critical Open" value={criticalOpenCount} tone="critical" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bug reports yet.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="rounded-lg border border-border/60 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className={`text-[11px] ${statusBadgeClass(report.status as BugReportStatus)}`}>
                          {prettyStatus(report.status as BugReportStatus)}
                        </Badge>
                        <Badge variant="outline" className={`text-[11px] ${severityClass(report.severity)}`}>
                          {prettySeverity(report.severity as BugReportSeverity)}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="font-semibold leading-tight">{report.title}</p>
                      <p className="mt-2 text-sm whitespace-pre-wrap break-words">{report.description}</p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-md border bg-muted/20 p-2.5">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Reporter</p>
                          <div className="mt-1 flex items-start gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                              {getInitials(report.reporterName)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{report.reporterName}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {report.reporterEmail ?? "No email on profile"}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground/80">
                                ID: {report.user_id}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-md border bg-muted/20 p-2.5">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Environment</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            Page: {report.page_path || "(not provided)"}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground/80">
                            UA: {report.user_agent || "(not provided)"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <form action={updateBugStatus} className="space-y-2">
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
                          className="h-9 w-full rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                        >
                          Save
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Open</p>
              <p className="mt-1 text-lg font-semibold text-red-600">{openCount}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">In Progress</p>
              <p className="mt-1 text-lg font-semibold text-amber-600">{inProgressCount}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Resolved</p>
              <p className="mt-1 text-lg font-semibold text-emerald-600">{resolvedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone?: "warn" | "critical";
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{title}</p>
        <p
          className={`mt-1 text-xl font-bold ${
            tone === "critical"
              ? "text-red-600"
              : tone === "warn"
                ? "text-amber-600"
                : ""
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

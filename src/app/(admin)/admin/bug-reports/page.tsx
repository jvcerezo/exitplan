import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BugReportStatus } from "@/lib/types/database";
import { requireUUID } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: BugReportStatus[] = ["open", "in_progress", "resolved"];

function prettyStatus(status: BugReportStatus) {
  return status === "in_progress"
    ? "In Progress"
    : status === "open"
      ? "Open"
      : "Resolved";
}

function statusBadgeClass(status: BugReportStatus) {
  if (status === "resolved") return "bg-emerald-100 text-emerald-700";
  if (status === "in_progress") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

/** Parse feedback type from title like "[suggestion] ⭐⭐⭐ App Feedback" */
function parseFeedbackType(title: string): {
  type: "bug" | "suggestion" | "praise" | "unknown";
  rating: number;
  cleanTitle: string;
} {
  const typeMatch = title.match(/^\[(bug|suggestion|praise)\]\s*/i);
  const type = typeMatch
    ? (typeMatch[1].toLowerCase() as "bug" | "suggestion" | "praise")
    : "unknown";
  let cleaned = typeMatch ? title.slice(typeMatch[0].length) : title;

  const starMatch = cleaned.match(/^(⭐+)\s*/);
  const rating = starMatch ? starMatch[1].length : 0;
  cleaned = starMatch ? cleaned.slice(starMatch[0].length) : cleaned;

  return { type, rating, cleanTitle: cleaned || title };
}

function typeBadgeClass(type: string) {
  if (type === "bug") return "bg-red-100 text-red-700";
  if (type === "suggestion") return "bg-blue-100 text-blue-700";
  if (type === "praise") return "bg-emerald-100 text-emerald-700";
  return "bg-gray-100 text-gray-700";
}

function typeIcon(type: string) {
  if (type === "bug") return "🐛";
  if (type === "suggestion") return "💡";
  if (type === "praise") return "💜";
  return "📋";
}

function getInitials(name: string) {
  const cleaned = name.trim();
  if (!cleaned) return "U";
  return (
    cleaned
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

async function getBugReports() {
  const admin = createAdminClient();

  const { data: reports, error } = await admin
    .from("bug_reports")
    .select(
      "id, created_at, user_id, title, description, severity, status, page_path, user_agent"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const userIds = Array.from(new Set((reports ?? []).map((r) => r.user_id)));

  const { data: profiles } = userIds.length
    ? await admin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : {
        data: [] as {
          id: string;
          full_name: string | null;
          email: string | null;
        }[],
      };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (reports ?? []).map((report) => {
    const profile = profileById.get(report.user_id);
    const parsed = parseFeedbackType(report.title);
    return {
      ...report,
      reporterName: profile?.full_name || "Unknown",
      reporterEmail: profile?.email || null,
      feedbackType: parsed.type,
      rating: parsed.rating,
      cleanTitle: parsed.cleanTitle,
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

  const bugId = requireUUID(
    String(formData.get("bug_id") || ""),
    "bug report id"
  );
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

export default async function AdminBugReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await assertAdmin();
  const reports = await getBugReports();
  const params = await searchParams;
  const filterStatus = (typeof params.status === "string" ? params.status : "all") as string;
  const filterType = (typeof params.type === "string" ? params.type : "all") as string;
  const search = (typeof params.q === "string" ? params.q : "") as string;

  return (
    <AdminBugReportsView
      reports={reports}
      filterStatus={filterStatus}
      filterType={filterType}
      search={search}
    />
  );
}

function AdminBugReportsView({
  reports,
  filterStatus,
  filterType,
  search,
}: {
  reports: Awaited<ReturnType<typeof getBugReports>>;
  filterStatus: string;
  filterType: string;
  search: string;
}) {
  // Apply filters
  let filtered = reports;
  if (filterStatus !== "all") {
    filtered = filtered.filter((r) => r.status === filterStatus);
  }
  if (filterType !== "all") {
    filtered = filtered.filter((r) => r.feedbackType === filterType);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q) ||
        (r.reporterEmail ?? "").toLowerCase().includes(q)
    );
  }

  const totalReports = reports.length;
  const openCount = reports.filter((r) => r.status === "open").length;
  const inProgressCount = reports.filter(
    (r) => r.status === "in_progress"
  ).length;
  const bugCount = reports.filter((r) => r.feedbackType === "bug").length;
  const suggestionCount = reports.filter(
    (r) => r.feedbackType === "suggestion"
  ).length;
  const praiseCount = reports.filter((r) => r.feedbackType === "praise").length;
  const avgRating =
    reports.filter((r) => r.rating > 0).length > 0
      ? (
          reports
            .filter((r) => r.rating > 0)
            .reduce((sum, r) => sum + r.rating, 0) /
          reports.filter((r) => r.rating > 0).length
        ).toFixed(1)
      : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Feedback & Bug Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          User feedback, bug reports, and suggestions from the app.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total" value={totalReports} />
        <KpiCard label="Open" value={openCount} tone="critical" />
        <KpiCard label="In Progress" value={inProgressCount} tone="warn" />
        <KpiCard label="Avg Rating" value={avgRating} />
      </div>

      {/* Type breakdown */}
      <div className="grid gap-3 grid-cols-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl">🐛</p>
            <p className="text-lg font-bold text-red-600">{bugCount}</p>
            <p className="text-[11px] text-muted-foreground">Bugs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl">💡</p>
            <p className="text-lg font-bold text-blue-600">
              {suggestionCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Suggestions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl">💜</p>
            <p className="text-lg font-bold text-emerald-600">
              {praiseCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Praise</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <form method="GET" className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              name="q"
              placeholder="Search feedback..."
              defaultValue={search}
              className="h-9 rounded-md border bg-background px-3 text-sm flex-1 min-w-[200px]"
            />
            <select
              name="status"
              defaultValue={filterStatus}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              name="type"
              defaultValue={filterType}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All Types</option>
              <option value="bug">Bugs</option>
              <option value="suggestion">Suggestions</option>
              <option value="praise">Praise</option>
            </select>
            <button
              type="submit"
              className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Filter
            </button>
            {(filterStatus !== "all" ||
              filterType !== "all" ||
              search) && (
              <a
                href="/admin/bug-reports"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </a>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Reports list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length === reports.length
              ? `All Feedback (${filtered.length})`
              : `Filtered (${filtered.length} of ${reports.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No feedback matches your filters.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg border border-border/60 p-4 space-y-3"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          className={`text-[11px] ${typeBadgeClass(report.feedbackType)}`}
                        >
                          {typeIcon(report.feedbackType)}{" "}
                          {report.feedbackType === "unknown"
                            ? "Other"
                            : report.feedbackType.charAt(0).toUpperCase() +
                              report.feedbackType.slice(1)}
                        </Badge>
                        <Badge
                          className={`text-[11px] ${statusBadgeClass(report.status as BugReportStatus)}`}
                        >
                          {prettyStatus(report.status as BugReportStatus)}
                        </Badge>
                        {report.rating > 0 && (
                          <span className="text-sm">
                            {"⭐".repeat(report.rating)}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString(
                            "en-PH",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>

                      {/* Message */}
                      {report.description && (
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {report.description}
                        </p>
                      )}

                      {/* Reporter */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                          {getInitials(report.reporterName)}
                        </div>
                        <span className="text-xs font-medium">
                          {report.reporterName}
                        </span>
                        {report.reporterEmail && (
                          <span className="text-xs text-muted-foreground">
                            {report.reporterEmail}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status update */}
                    <div className="shrink-0">
                      <form action={updateBugStatus} className="space-y-1.5">
                        <input
                          type="hidden"
                          name="bug_id"
                          value={report.id}
                        />
                        <select
                          name="status"
                          defaultValue={report.status}
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {prettyStatus(status)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="h-8 w-full rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90"
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
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "warn" | "critical";
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type {
  BugReport,
  BugReportInsert,
  BugReportSeverity,
} from "@/lib/types/database";

export function useMyBugReports(limit: number = 10) {
  return useQuery({
    queryKey: ["bug-reports", "mine", limit],
    queryFn: async (): Promise<BugReport[]> => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("bug_reports")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export function useSubmitBugReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Pick<BugReportInsert, "title" | "description"> & {
        severity: BugReportSeverity;
        page_path?: string;
      }
    ) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const title = payload.title.trim();
      const description = payload.description.trim();

      if (!title) throw new Error("Title is required");
      if (!description) throw new Error("Description is required");

      const pagePath = payload.page_path?.trim() || (typeof window !== "undefined" ? window.location.pathname : null);
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;

      const { data, error } = await supabase
        .from("bug_reports")
        .insert({
          user_id: user.id,
          title,
          description,
          severity: payload.severity,
          page_path: pagePath,
          user_agent: userAgent,
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return data as BugReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bug-reports", "mine"] });
      toast.success("Bug report submitted", {
        description: "Thanks — our team can now review this in admin dashboard.",
      });
    },
    onError: (error) => {
      toast.error("Failed to submit bug report", { description: error.message });
    },
  });
}

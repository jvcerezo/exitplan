import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Profile } from "@/lib/types/database";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { full_name?: string; primary_currency?: string; has_completed_onboarding?: boolean }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Updating profile with:", updates);
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      console.log("Update response - error:", error);
      if (error) throw new Error(error.message);
      return updates;
    },
    onSuccess: (data) => {
      console.log("Update mutation success, invalidating profile query");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Don't show toast if only updating onboarding flag
      if (!data.has_completed_onboarding) {
        toast.success("Profile updated");
      }
    },
    onError: (error) => {
      console.error("Update mutation error:", error);
      toast.error("Failed to update profile", { description: error.message });
    },
  });
}

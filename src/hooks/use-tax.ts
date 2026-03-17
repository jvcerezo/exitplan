import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { TaxRecord, TaxRecordInsert } from "@/lib/types/database";

export function useTaxRecords(year?: number) {
  return useQuery({
    queryKey: ["tax-records", year ?? "all"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<TaxRecord[]> => {
      const supabase = createClient();
      let query = supabase
        .from("tax_records")
        .select("*")
        .order("year", { ascending: false })
        .order("quarter", { ascending: true });

      if (year) {
        query = query.eq("year", year);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useTaxSummary() {
  return useQuery({
    queryKey: ["tax-records", "summary"],
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient();
      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from("tax_records")
        .select("id, year, quarter, tax_due, amount_paid, status")
        .eq("year", currentYear)
        .order("quarter", { ascending: true });

      if (error) throw new Error(error.message);

      const records = data;
      const totalDue = records.reduce((sum, r) => sum + r.tax_due, 0);
      const totalPaid = records.reduce((sum, r) => sum + r.amount_paid, 0);
      const balance = totalDue - totalPaid;
      const filed = records.filter((r) => r.status !== "draft").length;

      return { records, totalDue, totalPaid, balance, filed, year: currentYear };
    },
  });
}

export function useAddTaxRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: TaxRecordInsert) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tax_records")
        .insert({ ...record, user_id: user.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-records"] });
      toast.success("Tax record saved");
    },
    onError: (error) => {
      toast.error("Failed to save tax record", { description: error.message });
    },
  });
}

export function useUpdateTaxRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaxRecordInsert> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tax_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-records"] });
      toast.success("Tax record updated");
    },
    onError: (error) => {
      toast.error("Failed to update tax record", { description: error.message });
    },
  });
}

export function useDeleteTaxRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("tax_records").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-records"] });
      toast.success("Tax record deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete tax record", { description: error.message });
    },
  });
}

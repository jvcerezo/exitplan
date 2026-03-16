import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TaxRecord, TaxRecordInsert } from "@exitplan/core";

export function useTaxRecords(year?: number) {
  return useQuery({
    queryKey: ["tax-records", year ?? "all"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<TaxRecord[]> => {
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
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from("tax_records")
        .select("*")
        .eq("year", currentYear)
        .order("quarter", { ascending: true });

      if (error) throw new Error(error.message);

      const records = data as TaxRecord[];
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
    },
  });
}

export function useUpdateTaxRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaxRecordInsert> & { id: string }) => {
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
    },
  });
}

export function useDeleteTaxRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tax_records").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-records"] });
    },
  });
}

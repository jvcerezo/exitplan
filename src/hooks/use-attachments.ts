import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      file,
    }: {
      transactionId: string;
      file: File;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${transactionId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { error: updateError } = await supabase
        .from("transactions")
        .update({ attachment_path: path })
        .eq("id", transactionId);

      if (updateError) throw new Error(updateError.message);
      return path;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Receipt uploaded");
    },
    onError: (error) => {
      toast.error("Failed to upload receipt", { description: error.message });
    },
  });
}

export function useAttachmentUrl(path: string | null) {
  if (!path) return null;
  const supabase = createClient();
  const { data } = supabase.storage.from("receipts").getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      path,
    }: {
      transactionId: string;
      path: string;
    }) => {
      const supabase = createClient();

      const { error: storageError } = await supabase.storage
        .from("receipts")
        .remove([path]);

      if (storageError) throw new Error(storageError.message);

      const { error: updateError } = await supabase
        .from("transactions")
        .update({ attachment_path: null })
        .eq("id", transactionId);

      if (updateError) throw new Error(updateError.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Receipt removed");
    },
    onError: (error) => {
      toast.error("Failed to remove receipt", { description: error.message });
    },
  });
}

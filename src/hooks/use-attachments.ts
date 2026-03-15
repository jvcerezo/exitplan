import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineMutation } from "@/lib/offline/store";
import { createOfflineId, isBrowserOffline } from "@/lib/offline/utils";
import { toast } from "sonner";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }

      const [, base64] = result.split(",");
      if (!base64) {
        reject(new Error("Failed to encode file"));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

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
      if (isBrowserOffline()) {
        const fileBase64 = await fileToBase64(file);

        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "uploadAttachment",
          payload: {
            transactionId,
            fileName: file.name,
            contentType: file.type,
            fileBase64,
          },
        });

        return "queued-offline";
      }

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
      toast.success(isBrowserOffline() ? "Receipt upload saved offline" : "Receipt uploaded");
    },
    onError: (error) => {
      toast.error("Failed to upload receipt", { description: error.message });
    },
  });
}

export function useAttachmentUrl(path: string | null) {
  const { data } = useQuery({
    queryKey: ["receipt-url", path],
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!path) {
        return null;
      }

      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("receipts")
        .createSignedUrl(path, 60 * 10);

      if (error) {
        throw new Error(error.message);
      }

      return data.signedUrl;
    },
  });

  return data ?? null;
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
      if (isBrowserOffline()) {
        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "updateTransaction",
          payload: {
            id: transactionId,
            attachment_path: null,
          },
        });
        return;
      }

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
      toast.success(isBrowserOffline() ? "Receipt remove saved offline" : "Receipt removed");
    },
    onError: (error) => {
      toast.error("Failed to remove receipt", { description: error.message });
    },
  });
}

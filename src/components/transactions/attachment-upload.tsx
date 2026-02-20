"use client";

import { useRef } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadAttachment } from "@/hooks/use-attachments";

interface AttachmentUploadProps {
  transactionId: string;
}

export function AttachmentUpload({ transactionId }: AttachmentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAttachment();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB max
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB.");
      return;
    }

    upload.mutate({ transactionId, file });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
        aria-label="Attach receipt"
      >
        {upload.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Paperclip className="h-3.5 w-3.5" />
        )}
      </Button>
    </>
  );
}

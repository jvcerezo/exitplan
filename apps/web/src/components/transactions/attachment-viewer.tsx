"use client";

import { useState } from "react";
import { Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAttachmentUrl, useDeleteAttachment } from "@/hooks/use-attachments";

interface AttachmentViewerProps {
  transactionId: string;
  path: string;
}

export function AttachmentViewer({
  transactionId,
  path,
}: AttachmentViewerProps) {
  const [open, setOpen] = useState(false);
  const url = useAttachmentUrl(path);
  const deleteAttachment = useDeleteAttachment();
  const isPdf = path.toLowerCase().endsWith(".pdf");

  function handleDelete() {
    deleteAttachment.mutate(
      { transactionId, path },
      { onSuccess: () => setOpen(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-primary"
          aria-label="View receipt"
        >
          <Paperclip className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {url && (
            isPdf ? (
              <iframe
                src={url}
                className="w-full h-[400px] rounded border"
                title="Receipt PDF"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt="Receipt"
                className="w-full rounded border object-contain max-h-[400px]"
              />
            )
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteAttachment.isPending}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            {deleteAttachment.isPending ? "Removing..." : "Remove Receipt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

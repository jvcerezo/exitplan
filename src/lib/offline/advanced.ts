import { createOfflineId } from "@/lib/offline/utils";
import { enqueueOfflineMutation } from "@/lib/offline/store";

export async function queueOfflineAttachmentUpload(transactionId: string, pathHint?: string) {
  return enqueueOfflineMutation({
    id: createOfflineId("mutation"),
    type: "uploadAttachment",
    payload: {
      transactionId,
      pathHint,
    },
  });
}

export async function queueOfflineImport(count: number) {
  return enqueueOfflineMutation({
    id: createOfflineId("mutation"),
    type: "importTransactions",
    payload: { count },
  });
}

export async function queueOfflineReceiptOcr(fileName: string) {
  return enqueueOfflineMutation({
    id: createOfflineId("mutation"),
    type: "runReceiptOcr",
    payload: { fileName },
  });
}

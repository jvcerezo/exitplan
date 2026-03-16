import { createOfflineId } from "@/lib/offline/utils";
import { enqueueOfflineMutation } from "@/lib/offline/store";
import type { TransactionInsert } from "@/lib/types/database";

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

export async function queueOfflineImport(transactions: TransactionInsert[]) {
  return enqueueOfflineMutation({
    id: createOfflineId("mutation"),
    type: "importTransactions",
    payload: {
      transactions: transactions.map((transaction) => ({
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        currency: transaction.currency,
        account_id: transaction.account_id ?? null,
        transfer_id: transaction.transfer_id ?? null,
        tags: transaction.tags ?? null,
        attachment_path: transaction.attachment_path ?? null,
        split_group_id: transaction.split_group_id ?? null,
      })),
    },
  });
}

export async function queueOfflineReceiptOcr({
  fileName,
  contentType,
  fileBase64,
}: {
  fileName: string;
  contentType?: string;
  fileBase64?: string;
}) {
  return enqueueOfflineMutation({
    id: createOfflineId("mutation"),
    type: "runReceiptOcr",
    payload: { fileName, contentType, fileBase64 },
  });
}

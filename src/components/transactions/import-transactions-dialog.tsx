"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImportTransactions } from "@/hooks/use-transactions";
import { useAccounts, useAddAccount } from "@/hooks/use-accounts";
import { CURRENCIES, ACCOUNT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── CSV parsing ───────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim()); current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  raw = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y.length === 2 ? `20${y}` : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const dmy = raw.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const p = new Date(raw);
  return isNaN(p.getTime()) ? null : p.toISOString().split("T")[0];
}

function parseAmount(raw: string): number | null {
  if (!raw || raw.trim() === "" || raw.trim() === "-") return null;
  const val = parseFloat(raw.replace(/[,\s₱$A€£]/g, "").trim());
  return isNaN(val) ? null : val;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ["jollibee","mcdo","mcdonald","kfc","chowking","restaurant","food","cafe","coffee","grab food","foodpanda","grocery","supermarket","savemore","pizza","burger"],
  transportation: ["grab","angkas","mrt","lrt","bus","train","taxi","uber","transport","parking","toll","gas","gasoline","petron","shell"],
  housing: ["rent","electric","water bill","meralco","maynilad","manila water","condo","utilities"],
  entertainment: ["netflix","spotify","youtube","steam","cinema","movie","shopee","lazada"],
  healthcare: ["hospital","clinic","doctor","medicine","pharmacy","mercury","watsons","dental"],
  education: ["tuition","school","books","course","training"],
  salary: ["salary","payroll","wages"],
  freelance: ["freelance","invoice"],
  investment: ["interest","dividend","stocks"],
};

function guessCategory(description: string): string {
  const lower = description.toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((kw) => lower.includes(kw))) return cat;
  }
  return "other";
}

interface ParsedRow {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  skip: boolean;
}

async function extractPDFText(file: File): Promise<string> {
  const [{ getDocument }, arrayBuffer] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    file.arrayBuffer(),
  ]);

  const pdf = await getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    disableAutoFetch: true,
    disableStream: true,
    disableRange: true,
  }).promise;

  const pages: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n");
}

function normalizeDescription(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/^(transaction|description|details)\s*[:\-]?/i, "")
    .trim();
}

function parseGCashPDF(text: string): ParsedRow[] {
  const rawLines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const lines = rawLines.filter(
    (line) =>
      !/^(gcash|transaction history|running balance|balance|reference|ref no|page \d+)/i.test(line)
  );

  const dateAtStart =
    /^(\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\s+(.*)$/;
  const amountAnywhere = /([+-]?\s*₱?\s*[\d,]+(?:\.\d{1,2})?)(?!.*[+-]?\s*₱?\s*[\d,]+(?:\.\d{1,2})?)/;

  const result: ParsedRow[] = [];
  let pendingDate: string | null = null;
  let pendingDescription = "";

  const inferSign = (description: string) => {
    const lower = description.toLowerCase();
    if (/(cash in|received|receive money|refund|interest|deposit)/.test(lower)) return 1;
    if (/(send money|cash out|payment|paid|transfer to|withdraw)/.test(lower)) return -1;
    return null;
  };

  const pushRow = (date: string, description: string, rawAmount: string) => {
    const parsedDate = parseDate(date);
    const parsedAmount = parseAmount(rawAmount.replace("₱", ""));
    if (!parsedDate || parsedAmount === null) return;

    const hasNegative = /-/.test(rawAmount);
    const hasPositive = /\+/.test(rawAmount);
    const signByDesc = inferSign(description);

    let signedAmount = Math.abs(parsedAmount);
    if (hasNegative) signedAmount = -Math.abs(parsedAmount);
    else if (hasPositive) signedAmount = Math.abs(parsedAmount);
    else if (signByDesc === -1) signedAmount = -Math.abs(parsedAmount);
    else signedAmount = Math.abs(parsedAmount);

    const cleanDescription = normalizeDescription(description || "Imported GCash transaction");
    result.push({
      id: result.length,
      date: parsedDate,
      description: cleanDescription || "Imported GCash transaction",
      amount: signedAmount,
      category: guessCategory(cleanDescription),
      skip: false,
    });
  };

  for (const line of lines) {
    const dateMatch = line.match(dateAtStart);

    if (dateMatch) {
      const [, datePart, rest] = dateMatch;
      const amountMatch = rest.match(amountAnywhere);

      if (amountMatch) {
        const amountRaw = amountMatch[1];
        const desc = rest.replace(amountRaw, "").trim();
        pushRow(datePart, desc, amountRaw);
        pendingDate = null;
        pendingDescription = "";
      } else {
        pendingDate = datePart;
        pendingDescription = rest.trim();
      }
      continue;
    }

    if (pendingDate) {
      const amountMatch = line.match(amountAnywhere);
      if (amountMatch) {
        pushRow(pendingDate, pendingDescription || line.replace(amountMatch[1], "").trim(), amountMatch[1]);
        pendingDate = null;
        pendingDescription = "";
      } else {
        pendingDescription = `${pendingDescription} ${line}`.trim();
      }
    }
  }

  return result;
}

function parseFile(text: string): ParsedRow[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const rows = lines.slice(1).map(parseCSVLine);

  const find = (...kws: string[]) => {
    for (const kw of kws) {
      const i = headers.findIndex((h) => h.includes(kw));
      if (i !== -1) return i;
    }
    return -1;
  };

  const dateIdx = find("date", "trans date", "posting", "value date");
  const descIdx = find("description","details","memo","narration","particulars","reference","payee","particular");
  const amountIdx = find("amount","transaction amount");
  const debitIdx = find("debit","withdrawal","dr ");
  const creditIdx = find("credit","deposit","cr ");

  if (dateIdx === -1) return [];

  const result: ParsedRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const date = parseDate(row[dateIdx] ?? "");
    if (!date) continue;

    let amount: number | null = null;
    if (amountIdx !== -1) {
      amount = parseAmount(row[amountIdx] ?? "");
    } else {
      const debit = debitIdx !== -1 ? parseAmount(row[debitIdx] ?? "") : null;
      const credit = creditIdx !== -1 ? parseAmount(row[creditIdx] ?? "") : null;
      if (credit && credit > 0) amount = credit;
      else if (debit && debit > 0) amount = -debit;
    }
    if (amount === null) continue;

    const description = (descIdx !== -1 ? row[descIdx] : "") || "Imported transaction";
    result.push({ id: i, date, description, amount, category: guessCategory(description), skip: false });
  }
  return result;
}

// ── Inline new-account form ───────────────────────────────────────────────────

interface NewAccountFormProps {
  currency: string;
  onCreated: (accountId: string) => void;
  onCancel?: () => void;
}

function NewAccountForm({ currency, onCreated, onCancel }: NewAccountFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"cash" | "bank" | "e-wallet" | "credit-card">("bank");
  const addAccount = useAddAccount();

  async function handleCreate() {
    if (!name.trim()) return;
    const result = await addAccount.mutateAsync({ name: name.trim(), type, currency });
    onCreated(result.id);
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <p className="text-xs font-medium text-muted-foreground">New account</p>

      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="Account name"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
      />

      <div className="flex flex-wrap gap-1.5">
        {ACCOUNT_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              type === t.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          className="flex-1 gap-1.5"
          disabled={!name.trim() || addAccount.isPending}
          onClick={handleCreate}
        >
          <Check className="h-3.5 w-3.5" />
          {addAccount.isPending ? "Creating..." : "Create & select"}
        </Button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ImportTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportTransactionsDialog({ open, onOpenChange }: ImportTransactionsDialogProps) {
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [accountId, setAccountId] = useState("");
  const [currency, setCurrency] = useState("PHP");
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState(false);
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const { data: accounts } = useAccounts();
  const importMutation = useImportTransactions();
  const activeAccounts = accounts ?? [];
  const mustCreateAccount = step === "preview" && accounts !== undefined && activeAccounts.length === 0;
  const showAccountCreation = showNewAccountForm || mustCreateAccount;

  function resetDialogState() {
    setStep("upload");
    setFileName("");
    setRows([]);
    setParseError(false);
    setShowNewAccountForm(false);
  }

  async function handleFile(file: File) {
    setParseError(false);
    setFileName(file.name);

    try {
      const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      let parsed: ParsedRow[] = [];

      if (isPDF) {
        const text = await extractPDFText(file);
        parsed = parseGCashPDF(text);
      } else {
        const text = await file.text();
        parsed = parseFile(text);
      }

      if (parsed.length === 0) {
        setParseError(true);
        return;
      }

      setRows(parsed);
      if (activeAccounts[0]) {
        setCurrency(activeAccounts[0].currency);
        setAccountId(activeAccounts[0].id);
      }
      setStep("preview");
    } catch {
      setParseError(true);
      toast.error("Could not parse this file", {
        description: "Try a CSV export if the PDF format is unsupported.",
      });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  function toggleSkip(id: number) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, skip: !r.skip } : r));
  }

  async function handleImport() {
    const toImport = rows.filter((r) => !r.skip).map((r) => ({
      amount: r.amount,
      category: r.category,
      description: r.description,
      date: r.date,
      currency,
      account_id: accountId || null,
    }));
    await importMutation.mutateAsync(toImport);
    onOpenChange(false);
  }

  function handleAccountSelect(value: string) {
    if (value === "__new__") {
      setShowNewAccountForm(true);
    } else {
      setAccountId(value);
      setShowNewAccountForm(false);
    }
  }

  function handleAccountCreated(newAccountId: string) {
    setAccountId(newAccountId);
    setShowNewAccountForm(false);
    // Sync currency to the new account's currency
    const newAccount = accounts?.find((a) => a.id === newAccountId);
    if (newAccount) setCurrency(newAccount.currency);
  }

  const selectedCount = rows.filter((r) => !r.skip).length;
  const selectedAccount = activeAccounts.find((a) => a.id === accountId);

  // ── Upload step ───────────────────────────────────────────────────────────

  if (step === "upload") {
    return (
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          onOpenChange(nextOpen);
          if (!nextOpen) resetDialogState();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import transactions</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : parseError
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              {parseError ? (
                <AlertCircle className="h-8 w-8 text-destructive" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <div className="text-center">
                {parseError ? (
                  <>
                    <p className="text-sm font-medium text-destructive">
                      Couldn&apos;t read &ldquo;{fileName}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Make sure the file contains recognizable Date and Amount entries
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">Drop your CSV or PDF file here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  </>
                )}
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />

            <p className="text-xs text-muted-foreground text-center">
              Works with bank CSV exports and GCash PDF/CSV transaction history
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Preview step ──────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetDialogState();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview & import</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Import into account</p>
              {selectedAccount && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Currency</p>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-7 text-xs w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {!showAccountCreation ? (
              <Select value={accountId || "__none__"} onValueChange={handleAccountSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">No accounts yet</div>
                  )}
                  {activeAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      <span>{a.name}</span>
                      <span className="ml-1.5 text-muted-foreground capitalize">{a.type}</span>
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">
                    <span className="flex items-center gap-1.5 text-primary">
                      <Plus className="h-3.5 w-3.5" />
                      New account...
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : null}

            {showAccountCreation && (
              <NewAccountForm
                currency={currency}
                onCreated={handleAccountCreated}
                onCancel={!mustCreateAccount && activeAccounts.length > 0 ? () => setShowNewAccountForm(false) : undefined}
              />
            )}
          </div>

          {/* File info + row counts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedCount}</span> of {rows.length} selected
              </span>
              <button type="button" className="text-primary hover:underline"
                onClick={() => setRows((r) => r.map((x) => ({ ...x, skip: false })))}>
                All
              </button>
              <button type="button" className="text-primary hover:underline"
                onClick={() => setRows((r) => r.map((x) => ({ ...x, skip: true })))}>
                None
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-y-auto max-h-64">
              <table className="text-xs w-full">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-24">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground w-28">Amount</th>
                    <th className="px-3 py-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}
                      className={cn(
                        "border-t transition-colors",
                        row.skip ? "opacity-35" : "hover:bg-muted/30"
                      )}
                    >
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{row.date}</td>
                      <td className="px-3 py-2">
                        <p className="truncate max-w-[260px]">{row.description}</p>
                        <p className="text-muted-foreground capitalize">{row.category}</p>
                      </td>
                      <td className={cn(
                        "px-3 py-2 text-right font-medium whitespace-nowrap",
                        row.amount >= 0 ? "text-emerald-500" : "text-foreground"
                      )}>
                        {row.amount >= 0 ? "+" : ""}{row.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => toggleSkip(row.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors rounded p-0.5">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={selectedCount === 0 || importMutation.isPending || showAccountCreation}
              onClick={handleImport}
            >
              {importMutation.isPending
                ? "Importing..."
                : `Import ${selectedCount} transaction${selectedCount !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

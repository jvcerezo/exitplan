import { TaxCalculator } from "@/components/adulting/tax-calculator";
import { TaxHistory } from "@/components/adulting/tax-history";
import { ReceiptText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TaxesPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Tools
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
            <ReceiptText className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BIR Tax Tracker</h1>
            <p className="text-sm text-muted-foreground">
              TRAIN Law income tax — graduated rates &amp; 8% flat option
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          "0% up to ₱250,000",
          "15% on next ₱150k",
          "20% on next ₱400k",
          "25% on next ₱1.2M",
          "30% on next ₱6M",
          "35% above ₱8M",
        ].map((label) => (
          <span
            key={label}
            className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      <TaxCalculator />
      <TaxHistory />
    </div>
  );
}

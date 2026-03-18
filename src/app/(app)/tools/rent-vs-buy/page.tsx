import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { RentVsBuyCalculator } from "@/components/tools/rent-vs-buy-calculator";

export default function RentVsBuyPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Tools
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <Home className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rent vs Buy</h1>
            <p className="text-sm text-muted-foreground">
              Should you keep renting or buy a home with a Pag-IBIG loan? Compare the numbers.
            </p>
          </div>
        </div>
      </div>
      <RentVsBuyCalculator />
    </div>
  );
}

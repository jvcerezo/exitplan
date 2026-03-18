import Link from "next/link";
import { ArrowLeft, PiggyBank } from "lucide-react";
import { RetirementProjection } from "@/components/tools/retirement-projection";

export default function RetirementProjectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Tools
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
            <PiggyBank className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Retirement Projection</h1>
            <p className="text-sm text-muted-foreground">
              See if your SSS pension + savings will be enough — and what to do if they&apos;re not.
            </p>
          </div>
        </div>
      </div>
      <RetirementProjection />
    </div>
  );
}

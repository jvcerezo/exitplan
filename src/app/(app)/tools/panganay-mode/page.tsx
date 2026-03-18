import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { FamilyDashboard } from "@/components/tools/panganay-mode/family-dashboard";

export default function PanganayModePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Tools
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10">
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Panganay Mode</h1>
            <p className="text-sm text-muted-foreground">
              Track family support separately from personal spending. Set boundaries without guilt.
            </p>
          </div>
        </div>
      </div>
      <FamilyDashboard />
    </div>
  );
}

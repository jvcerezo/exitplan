import { FamilyDashboard } from "@/components/tools/panganay-mode/family-dashboard";

export default function PanganayModePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panganay Mode</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track family support separately from personal spending. Set boundaries without guilt.
        </p>
      </div>
      <FamilyDashboard />
    </div>
  );
}

import { RetirementProjection } from "@/components/tools/retirement-projection";

export default function RetirementProjectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Retirement Projection</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          See if your SSS pension + savings will be enough — and what to do if they&apos;re not.
        </p>
      </div>
      <RetirementProjection />
    </div>
  );
}

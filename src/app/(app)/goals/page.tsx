import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { GoalsOverview } from "@/components/goals/goals-overview";
import { GoalsList } from "@/components/goals/goals-list";

export default function GoalsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Set targets and track your progress to freedom
          </p>
        </div>
        <div className="hidden sm:block">
          <AddGoalDialog />
        </div>
      </div>

      {/* Overview cards */}
      <GoalsOverview />

      {/* Goals list */}
      <GoalsList />
    </div>
  );
}

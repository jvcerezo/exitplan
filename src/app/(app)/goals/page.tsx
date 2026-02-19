import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { GoalsOverview } from "@/components/goals/goals-overview";
import { GoalsList } from "@/components/goals/goals-list";

export const dynamic = "force-dynamic";

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Set targets and track your progress to freedom
          </p>
        </div>
        <AddGoalDialog />
      </div>

      {/* Overview cards */}
      <GoalsOverview />

      {/* Goals list */}
      <GoalsList />
    </div>
  );
}

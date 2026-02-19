"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateGoal } from "@/hooks/use-goals";
import { GOAL_CATEGORIES } from "@/lib/constants";
import type { Goal } from "@/lib/types/database";

export function EditGoalDialog({ goal }: { goal: Goal }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(goal.category);
  const updateGoal = useUpdateGoal();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await updateGoal.mutateAsync({
      id: goal.id,
      name: formData.get("name") as string,
      target_amount: parseFloat(formData.get("target_amount") as string),
      current_amount: parseFloat(formData.get("current_amount") as string),
      deadline: (formData.get("deadline") as string) || null,
      category,
    });

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-goal-name">Goal Name</Label>
            <Input
              id="edit-goal-name"
              name="name"
              defaultValue={goal.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-target">Target Amount</Label>
              <Input
                id="edit-target"
                name="target_amount"
                type="number"
                step="0.01"
                min="1"
                defaultValue={goal.target_amount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-current">Saved So Far</Label>
              <Input
                id="edit-current"
                name="current_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={goal.current_amount}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-deadline">Deadline (optional)</Label>
            <Input
              id="edit-deadline"
              name="deadline"
              type="date"
              defaultValue={goal.deadline ?? ""}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateGoal.isPending}
          >
            {updateGoal.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

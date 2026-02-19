"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useAddGoal } from "@/hooks/use-goals";
import { GOAL_CATEGORIES } from "@/lib/constants";

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const addGoal = useAddGoal();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await addGoal.mutateAsync({
      name: formData.get("name") as string,
      target_amount: parseFloat(formData.get("target_amount") as string),
      current_amount: parseFloat(
        (formData.get("current_amount") as string) || "0"
      ),
      deadline: (formData.get("deadline") as string) || null,
      category,
    });

    setOpen(false);
    setCategory("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input
              id="goal-name"
              name="name"
              placeholder="e.g., Emergency Fund"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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
              <Label htmlFor="target_amount">Target Amount</Label>
              <Input
                id="target_amount"
                name="target_amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="₱0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_amount">Saved So Far</Label>
              <Input
                id="current_amount"
                name="current_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                placeholder="₱0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input id="deadline" name="deadline" type="date" />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={addGoal.isPending}
          >
            {addGoal.isPending ? "Creating..." : "Create Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

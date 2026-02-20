"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUndoDelete } from "@/hooks/use-undo-delete";

const QUERY_KEYS = [["goals"]];

export function DeleteGoalDialog({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const undoDelete = useUndoDelete("goals", QUERY_KEYS);

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="text-muted-foreground hover:text-destructive"
      aria-label="Delete goal"
      onClick={() => undoDelete(id, name)}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

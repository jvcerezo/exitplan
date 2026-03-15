"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUndoDelete } from "@/hooks/use-undo-delete";

const QUERY_KEYS = [
  ["goals"],
  ["goals", "summary"],
  ["accounts"],
  ["transactions"],
  ["safe-to-spend"],
  ["emergency-fund"],
  ["health-score"],
  ["transactions", "summary"],
];

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
      size="icon-sm"
      className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      aria-label="Delete goal"
      onClick={() => undoDelete(id, name)}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

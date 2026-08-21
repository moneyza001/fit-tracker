"use client";

import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkoutTemplateExerciseRow } from "@/types";

interface WorkoutTemplateExerciseColumnsOptions {
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  lastIndex: number;
}

export function getWorkoutTemplateExerciseColumns({
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  lastIndex,
}: WorkoutTemplateExerciseColumnsOptions): LegacyColumnDef<
  WorkoutTemplateExerciseRow,
  unknown
>[] {
  return [
    {
      id: "order",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Move ${row.original.exerciseId.name} up`}
            disabled={row.index === 0}
            onClick={() => onMoveUp(row.index)}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Move ${row.original.exerciseId.name} down`}
            disabled={row.index === lastIndex}
            onClick={() => onMoveDown(row.index)}
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "exerciseId",
      header: "Exercise",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{row.original.exerciseId.name}</span>
          <Badge variant="outline">{row.original.exerciseId.muscleGroup}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "targetSets",
      header: "Sets",
      cell: ({ row }) => row.original.targetSets,
    },
    {
      accessorKey: "targetReps",
      header: "Reps",
      cell: ({ row }) => row.original.targetReps,
    },
    {
      accessorKey: "targetWeight",
      header: "Weight",
      cell: ({ row }) => `${row.original.targetWeight} kg`,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${row.original.exerciseId.name}`}
            onClick={() => onEdit(row.index)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${row.original.exerciseId.name}`}
            onClick={() => onDelete(row.index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}

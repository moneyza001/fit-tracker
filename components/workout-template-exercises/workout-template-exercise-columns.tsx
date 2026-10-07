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
            aria-label={`เลื่อน ${row.original.exerciseId.name} ขึ้น`}
            disabled={row.index === 0}
            onClick={() => onMoveUp(row.index)}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`เลื่อน ${row.original.exerciseId.name} ลง`}
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
      header: "ท่าออกกำลังกาย",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{row.original.exerciseId.name}</span>
          <Badge variant="outline">{row.original.exerciseId.muscleGroup}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "targetSets",
      header: "เซ็ต",
      cell: ({ row }) => row.original.targetSets,
    },
    {
      accessorKey: "targetReps",
      header: "ครั้ง",
      cell: ({ row }) => row.original.targetReps,
    },
    {
      accessorKey: "targetWeight",
      header: "น้ำหนัก",
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
            aria-label={`แก้ไข ${row.original.exerciseId.name}`}
            onClick={() => onEdit(row.index)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`ลบ ${row.original.exerciseId.name}`}
            onClick={() => onDelete(row.index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}

"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ExerciseRow } from "@/types";
import { EQUIPMENT_LABELS, EXERCISE_TYPE_LABELS, MUSCLE_GROUP_LABELS } from "@/lib/exercise-labels";

interface ExerciseColumnsOptions {
  onEdit: (exercise: ExerciseRow) => void;
  onDelete: (exercise: ExerciseRow) => void;
}

export function getExerciseColumns({
  onEdit,
  onDelete,
}: ExerciseColumnsOptions): LegacyColumnDef<ExerciseRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "ชื่อ",
      cell: ({ row }) => (
        <Link
          href={`/exercises/${row.original._id}`}
          className="font-medium underline-offset-2 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "muscleGroup",
      header: "กลุ่มกล้ามเนื้อ",
      cell: ({ row }) => (
        <Badge variant="outline">{MUSCLE_GROUP_LABELS[row.original.muscleGroup]}</Badge>
      ),
    },
    {
      accessorKey: "equipment",
      header: "อุปกรณ์",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {EQUIPMENT_LABELS[row.original.equipment]}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "ประเภท",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {EXERCISE_TYPE_LABELS[row.original.type]}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`แก้ไข ${row.original.name}`}
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`ลบ ${row.original.name}`}
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}

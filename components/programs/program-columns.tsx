"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProgramRow } from "@/types";

interface ProgramColumnsOptions {
  onEdit: (program: ProgramRow) => void;
  onDelete: (program: ProgramRow) => void;
}

export function getProgramColumns({
  onEdit,
  onDelete,
}: ProgramColumnsOptions): LegacyColumnDef<ProgramRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "ชื่อ",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "คำอธิบาย",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description || "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "สถานะ",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
          {row.original.status === "active" ? "ใช้งานอยู่" : "เก็บถาวร"}
        </Badge>
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

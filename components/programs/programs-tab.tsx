"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { apiRequest } from "@/lib/api-client";
import type { ProgramRow } from "@/types";
import { ProgramForm } from "./program-form";
import { getProgramColumns } from "./program-columns";

interface ProgramsTabProps {
  programs: ProgramRow[];
  onProgramsChange: (programs: ProgramRow[]) => void;
}

export function ProgramsTab({ programs, onProgramsChange }: ProgramsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramRow | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<ProgramRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<ProgramRow[]>("/api/programs");
      onProgramsChange(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "โหลดโปรแกรมไม่สำเร็จ"
      );
    } finally {
      setIsLoading(false);
    }
  }, [onProgramsChange]);

  function handleAdd() {
    setEditingProgram(null);
    setFormOpen(true);
  }

  function handleEdit(program: ProgramRow) {
    setEditingProgram(program);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingProgram) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/api/programs/${deletingProgram._id}`, {
        method: "DELETE",
      });
      toast.success("ลบโปรแกรมแล้ว");
      setDeletingProgram(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ลบโปรแกรมไม่สำเร็จ"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = getProgramColumns({
    onEdit: handleEdit,
    onDelete: setDeletingProgram,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          เพิ่มโปรแกรม
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={programs}
        isLoading={isLoading}
        emptyMessage="ยังไม่มีโปรแกรม สร้างโปรแกรมแรกเพื่อเริ่มต้น"
      />
      <ProgramForm
        open={formOpen}
        onOpenChange={setFormOpen}
        program={editingProgram}
        onSuccess={refetch}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingProgram)}
        onOpenChange={(open) => !open && setDeletingProgram(null)}
        title="ลบโปรแกรมนี้หรือไม่?"
        description={`การลบนี้จะลบ "${deletingProgram?.name}" และแผนการฝึกทั้งหมดอย่างถาวร`}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

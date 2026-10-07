"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { apiRequest } from "@/lib/api-client";
import type { WorkoutTemplateRow } from "@/types";
import { WorkoutTemplateForm } from "./workout-template-form";
import { getWorkoutTemplateColumns } from "./workout-template-columns";

interface WorkoutTemplatesTabProps {
  initialWorkoutTemplates: WorkoutTemplateRow[];
}

export function WorkoutTemplatesTab({
  initialWorkoutTemplates,
}: WorkoutTemplatesTabProps) {
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplateRow[]>(
    initialWorkoutTemplates
  );
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplateRow | null>(
    null
  );
  const [deletingTemplate, setDeletingTemplate] = useState<WorkoutTemplateRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const templates = await apiRequest<WorkoutTemplateRow[]>(
        "/api/workout-templates"
      );
      setWorkoutTemplates(templates);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "โหลดเทมเพลตไม่สำเร็จ"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleAdd() {
    setEditingTemplate(null);
    setFormOpen(true);
  }

  function handleEdit(workoutTemplate: WorkoutTemplateRow) {
    setEditingTemplate(workoutTemplate);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingTemplate) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/api/workout-templates/${deletingTemplate._id}`, {
        method: "DELETE",
      });
      toast.success("ลบเทมเพลตแล้ว");
      setDeletingTemplate(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ลบเทมเพลตไม่สำเร็จ"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = getWorkoutTemplateColumns({
    onEdit: handleEdit,
    onDelete: setDeletingTemplate,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          เพิ่มเทมเพลต
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={workoutTemplates}
        isLoading={isLoading}
        emptyMessage="ยังไม่มีเทมเพลตเวิร์คเอาท์"
      />
      <WorkoutTemplateForm
        open={formOpen}
        onOpenChange={setFormOpen}
        workoutTemplate={editingTemplate}
        onSuccess={refetch}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingTemplate)}
        onOpenChange={(open) => !open && setDeletingTemplate(null)}
        title="ลบเทมเพลตนี้?"
        description={`การดำเนินการนี้จะลบ "${deletingTemplate?.name}" อย่างถาวร`}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

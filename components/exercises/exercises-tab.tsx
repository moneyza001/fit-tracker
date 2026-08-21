"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { apiRequest } from "@/lib/api-client";
import type { ExerciseRow } from "@/types";
import { ExerciseForm } from "./exercise-form";
import { getExerciseColumns } from "./exercise-columns";

export function ExercisesTab({
  initialExercises,
}: {
  initialExercises: ExerciseRow[];
}) {
  const [exercises, setExercises] = useState<ExerciseRow[]>(initialExercises);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseRow | null>(
    null
  );
  const [deletingExercise, setDeletingExercise] = useState<ExerciseRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<ExerciseRow[]>("/api/exercises");
      setExercises(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load exercises"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleAdd() {
    setEditingExercise(null);
    setFormOpen(true);
  }

  function handleEdit(exercise: ExerciseRow) {
    setEditingExercise(exercise);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingExercise) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/api/exercises/${deletingExercise._id}`, {
        method: "DELETE",
      });
      toast.success("Exercise deleted");
      setDeletingExercise(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete exercise"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = getExerciseColumns({
    onEdit: handleEdit,
    onDelete: setDeletingExercise,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          Add Exercise
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={exercises}
        isLoading={isLoading}
        emptyMessage="No exercises yet. Add one to build your library."
      />
      <ExerciseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        exercise={editingExercise}
        onSuccess={refetch}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingExercise)}
        onOpenChange={(open) => !open && setDeletingExercise(null)}
        title="Delete exercise?"
        description={`This will permanently delete "${deletingExercise?.name}" from your exercise library.`}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

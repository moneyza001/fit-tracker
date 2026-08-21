"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { apiRequest } from "@/lib/api-client";
import type { ExerciseRow, WorkoutPlanExerciseRow } from "@/types";
import { WorkoutPlanExerciseForm } from "./workout-plan-exercise-form";
import { getWorkoutPlanExerciseColumns } from "./workout-plan-exercise-columns";

interface WorkoutPlanExercisesTabProps {
  workoutPlanId: string;
  initialPlanExercises: WorkoutPlanExerciseRow[];
  exercises: ExerciseRow[];
}

export function WorkoutPlanExercisesTab({
  workoutPlanId,
  initialPlanExercises,
  exercises,
}: WorkoutPlanExercisesTabProps) {
  const [planExercises, setPlanExercises] = useState<WorkoutPlanExerciseRow[]>(
    initialPlanExercises
  );
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkoutPlanExerciseRow | null>(
    null
  );
  const [deletingItem, setDeletingItem] = useState<WorkoutPlanExerciseRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await apiRequest<WorkoutPlanExerciseRow[]>(
        `/api/workout-plan-exercises?workoutPlanId=${workoutPlanId}`
      );
      setPlanExercises(items);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load exercises"
      );
    } finally {
      setIsLoading(false);
    }
  }, [workoutPlanId]);

  function handleAdd() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function handleEdit(item: WorkoutPlanExerciseRow) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/api/workout-plan-exercises/${deletingItem._id}`, {
        method: "DELETE",
      });
      toast.success("Exercise removed");
      setDeletingItem(null);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove exercise"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleMove(item: WorkoutPlanExerciseRow, direction: "up" | "down") {
    const index = planExercises.findIndex((pe) => pe._id === item._id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= planExercises.length) return;
    const other = planExercises[swapIndex];

    setIsLoading(true);
    try {
      await Promise.all([
        apiRequest(`/api/workout-plan-exercises/${item._id}`, {
          method: "PATCH",
          body: JSON.stringify({ order: other.order }),
        }),
        apiRequest(`/api/workout-plan-exercises/${other._id}`, {
          method: "PATCH",
          body: JSON.stringify({ order: item.order }),
        }),
      ]);
      refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reorder"
      );
      setIsLoading(false);
    }
  }

  const nextOrder =
    planExercises.length > 0
      ? Math.max(...planExercises.map((pe) => pe.order)) + 1
      : 0;

  const columns = getWorkoutPlanExerciseColumns({
    onEdit: handleEdit,
    onDelete: setDeletingItem,
    onMoveUp: (item) => handleMove(item, "up"),
    onMoveDown: (item) => handleMove(item, "down"),
    isFirst: (item) => planExercises[0]?._id === item._id,
    isLast: (item) => planExercises[planExercises.length - 1]?._id === item._id,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} disabled={exercises.length === 0}>
          <Plus className="size-4" />
          Add Exercise
        </Button>
      </div>
      {exercises.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Create an exercise first before adding it to this plan.
        </p>
      )}
      <DataTable
        columns={columns}
        data={planExercises}
        isLoading={isLoading}
        emptyMessage="No exercises in this plan yet."
      />
      <WorkoutPlanExerciseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        planExercise={editingItem}
        workoutPlanId={workoutPlanId}
        exercises={exercises}
        nextOrder={nextOrder}
        onSuccess={refetch}
      />
      <ConfirmDeleteDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title="Remove exercise from plan?"
        description={`This will remove "${deletingItem?.exerciseId.name}" from this workout plan.`}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

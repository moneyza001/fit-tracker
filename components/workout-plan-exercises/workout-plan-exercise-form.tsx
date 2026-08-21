"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { workoutPlanExerciseSchema } from "@/lib/validations";
import { apiRequest } from "@/lib/api-client";
import type { ExerciseRow, WorkoutPlanExerciseRow } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const formSchema = workoutPlanExerciseSchema.pick({
  exerciseId: true,
  targetSets: true,
  targetReps: true,
  targetWeight: true,
});
type FormInput = z.infer<typeof formSchema>;

interface WorkoutPlanExerciseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planExercise?: WorkoutPlanExerciseRow | null;
  workoutPlanId: string;
  exercises: ExerciseRow[];
  nextOrder: number;
  onSuccess: () => void;
}

function buildEmptyValues(): FormInput {
  return { exerciseId: "", targetSets: 3, targetReps: 10, targetWeight: 0 };
}

export function WorkoutPlanExerciseForm({
  open,
  onOpenChange,
  planExercise,
  workoutPlanId,
  exercises,
  nextOrder,
  onSuccess,
}: WorkoutPlanExerciseFormProps) {
  const isEdit = Boolean(planExercise);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: buildEmptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      planExercise
        ? {
            exerciseId: planExercise.exerciseId._id,
            targetSets: planExercise.targetSets,
            targetReps: planExercise.targetReps,
            targetWeight: planExercise.targetWeight,
          }
        : buildEmptyValues()
    );
  }, [open, planExercise, form]);

  async function onSubmit(values: FormInput) {
    try {
      if (isEdit && planExercise) {
        await apiRequest(`/api/workout-plan-exercises/${planExercise._id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        toast.success("Exercise updated");
      } else {
        await apiRequest("/api/workout-plan-exercises", {
          method: "POST",
          body: JSON.stringify({ ...values, workoutPlanId, order: nextOrder }),
        });
        toast.success("Exercise added");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="exerciseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise</FormLabel>
                  <Select
                    items={exercises.map((exercise) => ({
                      value: exercise._id,
                      label: exercise.name,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an exercise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {exercises.map((exercise) => (
                        <SelectItem key={exercise._id} value={exercise._id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetSets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Sets</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetReps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Reps</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {isEdit ? "Save changes" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

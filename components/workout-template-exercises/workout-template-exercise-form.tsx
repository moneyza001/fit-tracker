"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workoutTemplateExerciseSchema } from "@/lib/validations";
import type { ExerciseRow, WorkoutTemplateExerciseRow } from "@/types";
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

type FormInput = {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
};

interface WorkoutTemplateExerciseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: WorkoutTemplateExerciseRow | null;
  exercises: ExerciseRow[];
  isSubmitting: boolean;
  onSubmit: (values: FormInput) => void;
}

function buildEmptyValues(): FormInput {
  return { exerciseId: "", targetSets: 3, targetReps: 10, targetWeight: 0 };
}

export function WorkoutTemplateExerciseForm({
  open,
  onOpenChange,
  entry,
  exercises,
  isSubmitting,
  onSubmit,
}: WorkoutTemplateExerciseFormProps) {
  const isEdit = Boolean(entry);

  const form = useForm<FormInput>({
    resolver: zodResolver(workoutTemplateExerciseSchema),
    defaultValues: buildEmptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      entry
        ? {
            exerciseId: entry.exerciseId._id,
            targetSets: entry.targetSets,
            targetReps: entry.targetReps,
            targetWeight: entry.targetWeight,
          }
        : buildEmptyValues()
    );
  }, [open, entry, form]);

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
              <Button type="submit" disabled={isSubmitting}>
                {isEdit ? "Save changes" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

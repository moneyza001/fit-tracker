import { z } from "zod";
import { objectIdSchema } from "./common";

export const workoutTemplateExerciseSchema = z.object({
  exerciseId: objectIdSchema,
  targetSets: z.number().int().min(1),
  targetReps: z.number().int().min(1),
  targetWeight: z.number().min(0),
});

export const workoutTemplateSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  exercises: z.array(workoutTemplateExerciseSchema).default([]),
});

export const workoutTemplateUpdateSchema = workoutTemplateSchema
  .omit({ userId: true })
  .partial();

export type WorkoutTemplateExerciseInput = z.infer<
  typeof workoutTemplateExerciseSchema
>;
export type WorkoutTemplateInput = z.infer<typeof workoutTemplateSchema>;
export type WorkoutTemplateUpdateInput = z.infer<
  typeof workoutTemplateUpdateSchema
>;

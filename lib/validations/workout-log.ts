import { z } from "zod";
import { WORKOUT_LOG_STATUSES } from "@/types";
import { objectIdSchema } from "./common";

export const workoutSetSchema = z.object({
  set: z.coerce.number().int().min(1),
  reps: z.coerce.number().int().min(0),
  weight: z.coerce.number().min(0),
  duration: z.coerce.number().min(0).optional(),
  rpe: z.coerce.number().min(0).max(10).optional(),
  rir: z.coerce.number().min(0).max(10).optional(),
});

export const workoutLogExerciseSchema = z.object({
  exerciseId: objectIdSchema,
  sets: z.array(workoutSetSchema),
  note: z.string().trim().max(500).optional(),
});

export const workoutLogSchema = z.object({
  userId: z.string().min(1),
  workoutPlanId: objectIdSchema,
  date: z.coerce.date(),
  exercises: z.array(workoutLogExerciseSchema).default([]),
  status: z.enum(WORKOUT_LOG_STATUSES).default("in_progress"),
});

export const workoutLogUpdateSchema = workoutLogSchema
  .omit({ userId: true, workoutPlanId: true, status: true })
  .partial();

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>;
export type WorkoutLogExerciseInput = z.infer<typeof workoutLogExerciseSchema>;
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
export type WorkoutLogUpdateInput = z.infer<typeof workoutLogUpdateSchema>;

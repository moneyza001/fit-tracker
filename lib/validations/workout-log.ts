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

const workoutLogBaseSchema = z.object({
  workoutPlanId: objectIdSchema.optional(),
  workoutTemplateId: objectIdSchema.optional(),
  date: z.coerce.date(),
  exercises: z.array(workoutLogExerciseSchema).default([]),
  status: z.enum(WORKOUT_LOG_STATUSES).default("in_progress"),
  overallNote: z.string().trim().max(1000).optional(),
});

export const workoutLogSchema = workoutLogBaseSchema.refine(
  (data) => Boolean(data.workoutPlanId) || Boolean(data.workoutTemplateId),
  {
    message: "ต้องระบุ workoutPlanId หรือ workoutTemplateId อย่างใดอย่างหนึ่ง",
    path: ["workoutPlanId"],
  }
);

export const workoutLogUpdateSchema = workoutLogBaseSchema
  .omit({ workoutPlanId: true, workoutTemplateId: true, status: true })
  .partial();

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>;
export type WorkoutLogExerciseInput = z.infer<typeof workoutLogExerciseSchema>;
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
export type WorkoutLogUpdateInput = z.infer<typeof workoutLogUpdateSchema>;

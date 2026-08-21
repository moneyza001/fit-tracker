import { z } from "zod";
import { objectIdSchema } from "./common";

export const workoutPlanExerciseSchema = z.object({
  workoutPlanId: objectIdSchema,
  exerciseId: objectIdSchema,
  order: z.number().int().min(0),
  targetSets: z.number().int().min(1),
  targetReps: z.number().int().min(1),
  targetWeight: z.number().min(0),
});

export type WorkoutPlanExerciseInput = z.infer<
  typeof workoutPlanExerciseSchema
>;

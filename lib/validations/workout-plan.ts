import { z } from "zod";
import { objectIdSchema } from "./common";

export const workoutPlanSchema = z.object({
  programId: objectIdSchema,
  name: z.string().trim().min(1, "Name is required").max(100),
  day: z.number().int().min(1),
  description: z.string().trim().max(500).optional(),
});

export type WorkoutPlanInput = z.infer<typeof workoutPlanSchema>;

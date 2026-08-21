import { z } from "zod";
import { MUSCLE_GROUPS, EQUIPMENT_TYPES, EXERCISE_TYPES } from "@/types";

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  equipment: z.enum(EQUIPMENT_TYPES),
  type: z.enum(EXERCISE_TYPES),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;

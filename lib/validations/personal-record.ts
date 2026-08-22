import { z } from "zod";
import { objectIdSchema } from "./common";

export const personalRecordSchema = z.object({
  exerciseId: objectIdSchema,
  weight: z.coerce.number().min(0),
  reps: z.coerce.number().int().min(0),
  estimated1RM: z.coerce.number().min(0),
  achievedAt: z.coerce.date(),
  workoutLogId: objectIdSchema,
});

export type PersonalRecordInput = z.infer<typeof personalRecordSchema>;

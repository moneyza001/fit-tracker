import { z } from "zod";

export const bodyWeightSchema = z.object({
  userId: z.string().min(1),
  date: z.coerce.date(),
  weight: z.coerce.number().min(0),
  note: z.string().trim().max(500).optional(),
});

export type BodyWeightInput = z.infer<typeof bodyWeightSchema>;

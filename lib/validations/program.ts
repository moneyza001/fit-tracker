import { z } from "zod";
import { PROGRAM_STATUSES } from "@/types";

export const programSchema = z.object({
  name: z.string().trim().min(1, "กรุณาระบุชื่อ").max(100),
  description: z.string().trim().max(500).optional(),
  status: z.enum(PROGRAM_STATUSES).default("active"),
});

export type ProgramInput = z.infer<typeof programSchema>;
export type ProgramFormInput = z.input<typeof programSchema>;

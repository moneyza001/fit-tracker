import { Schema, model, models, type Document, type Model } from "mongoose";
import { PROGRAM_STATUSES, type ProgramStatus } from "@/types";

export interface IProgram extends Document {
  userId: string;
  name: string;
  description?: string;
  status: ProgramStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: PROGRAM_STATUSES,
      default: "active",
      required: true,
    },
  },
  { timestamps: true }
);

export const Program: Model<IProgram> =
  models.Program ?? model<IProgram>("Program", ProgramSchema);

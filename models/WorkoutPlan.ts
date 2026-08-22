import {
  Schema,
  model,
  models,
  Types,
  type Document,
  type Model,
} from "mongoose";

export interface IWorkoutPlan extends Document {
  userId: string;
  programId: Types.ObjectId;
  name: string;
  day: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    userId: { type: String, required: true, index: true },
    programId: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    day: { type: Number, required: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const WorkoutPlan: Model<IWorkoutPlan> =
  models.WorkoutPlan ?? model<IWorkoutPlan>("WorkoutPlan", WorkoutPlanSchema);

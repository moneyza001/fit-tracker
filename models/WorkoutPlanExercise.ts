import {
  Schema,
  model,
  models,
  Types,
  type Document,
  type Model,
} from "mongoose";

export interface IWorkoutPlanExercise extends Document {
  userId: string;
  workoutPlanId: Types.ObjectId;
  exerciseId: Types.ObjectId;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutPlanExerciseSchema = new Schema<IWorkoutPlanExercise>(
  {
    userId: { type: String, required: true, index: true },
    workoutPlanId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      required: true,
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    order: { type: Number, required: true },
    targetSets: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    targetWeight: { type: Number, required: true },
  },
  { timestamps: true }
);

export const WorkoutPlanExercise: Model<IWorkoutPlanExercise> =
  models.WorkoutPlanExercise ??
  model<IWorkoutPlanExercise>("WorkoutPlanExercise", WorkoutPlanExerciseSchema);

import {
  Schema,
  model,
  models,
  Types,
  type Document,
  type Model,
} from "mongoose";
import { WORKOUT_LOG_STATUSES, type WorkoutLogStatus } from "@/types";

export interface IWorkoutSet {
  set: number;
  reps: number;
  weight: number;
  duration?: number;
  rpe?: number;
  rir?: number;
}

export interface IWorkoutLogExercise {
  exerciseId: Types.ObjectId;
  sets: IWorkoutSet[];
  note?: string;
}

export interface IWorkoutLog extends Document {
  userId: string;
  workoutPlanId?: Types.ObjectId;
  workoutTemplateId?: Types.ObjectId;
  date: Date;
  exercises: IWorkoutLogExercise[];
  status: WorkoutLogStatus;
  overallNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSetSchema = new Schema<IWorkoutSet>(
  {
    set: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
    duration: { type: Number },
    rpe: { type: Number, min: 0, max: 10 },
    rir: { type: Number, min: 0, max: 10 },
  },
  { _id: false }
);

const WorkoutLogExerciseSchema = new Schema<IWorkoutLogExercise>(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    sets: { type: [WorkoutSetSchema], required: true, default: [] },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: { type: String, required: true, index: true },
    workoutPlanId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutPlan",
    },
    workoutTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutTemplate",
    },
    date: { type: Date, required: true },
    exercises: { type: [WorkoutLogExerciseSchema], required: true, default: [] },
    status: {
      type: String,
      enum: WORKOUT_LOG_STATUSES,
      default: "in_progress",
      required: true,
    },
    overallNote: { type: String, trim: true },
  },
  { timestamps: true }
);

export const WorkoutLog: Model<IWorkoutLog> =
  models.WorkoutLog ?? model<IWorkoutLog>("WorkoutLog", WorkoutLogSchema);

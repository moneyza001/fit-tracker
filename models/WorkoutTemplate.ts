import {
  Schema,
  model,
  models,
  Types,
  type Document,
  type Model,
} from "mongoose";

export interface IWorkoutTemplateExercise {
  exerciseId: Types.ObjectId;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
}

export interface IWorkoutTemplate extends Document {
  userId: string;
  name: string;
  description?: string;
  exercises: IWorkoutTemplateExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutTemplateExerciseSchema = new Schema<IWorkoutTemplateExercise>(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    targetSets: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    targetWeight: { type: Number, required: true },
  },
  { _id: false }
);

const WorkoutTemplateSchema = new Schema<IWorkoutTemplate>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    exercises: {
      type: [WorkoutTemplateExerciseSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

export const WorkoutTemplate: Model<IWorkoutTemplate> =
  models.WorkoutTemplate ??
  model<IWorkoutTemplate>("WorkoutTemplate", WorkoutTemplateSchema);

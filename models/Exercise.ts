import { Schema, model, models, type Document, type Model } from "mongoose";
import {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  EXERCISE_TYPES,
  type MuscleGroup,
  type Equipment,
  type ExerciseType,
} from "@/types";

export interface IExercise extends Document {
  userId: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  type: ExerciseType;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    muscleGroup: { type: String, enum: MUSCLE_GROUPS, required: true },
    equipment: { type: String, enum: EQUIPMENT_TYPES, required: true },
    type: { type: String, enum: EXERCISE_TYPES, required: true },
  },
  { timestamps: true }
);

export const Exercise: Model<IExercise> =
  models.Exercise ?? model<IExercise>("Exercise", ExerciseSchema);

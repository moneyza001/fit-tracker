import {
  Schema,
  model,
  models,
  Types,
  type Document,
  type Model,
} from "mongoose";

export interface IPersonalRecord extends Document {
  userId: string;
  exerciseId: Types.ObjectId;
  weight: number;
  reps: number;
  estimated1RM: number;
  achievedAt: Date;
  workoutLogId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalRecordSchema = new Schema<IPersonalRecord>(
  {
    userId: { type: String, required: true, index: true },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
    estimated1RM: { type: Number, required: true },
    achievedAt: { type: Date, required: true },
    workoutLogId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutLog",
      required: true,
    },
  },
  { timestamps: true }
);

export const PersonalRecord: Model<IPersonalRecord> =
  models.PersonalRecord ??
  model<IPersonalRecord>("PersonalRecord", PersonalRecordSchema);

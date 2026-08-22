import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IBodyWeight extends Document {
  userId: string;
  date: Date;
  weight: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BodyWeightSchema = new Schema<IBodyWeight>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    weight: { type: Number, required: true },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

export const BodyWeight: Model<IBodyWeight> =
  models.BodyWeight ?? model<IBodyWeight>("BodyWeight", BodyWeightSchema);

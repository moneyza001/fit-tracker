import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: { type: String },
    name: { type: String, trim: true },
    image: { type: String },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  models.User ?? model<IUser>("User", UserSchema);

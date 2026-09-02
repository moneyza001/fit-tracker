import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { signupSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { seedDefaultExercises } from "@/lib/seed-exercises";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const parsed = signupSchema.parse(await request.json());
    const { email, password } = parsed;
    const name = parsed.name || undefined;

    const existing = await User.findOne({ email });
    if (existing?.passwordHash) {
      return apiError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      existing.passwordHash = passwordHash;
      if (name) existing.name = name;
      await existing.save();
    } else {
      const created = await User.create({ email, passwordHash, name });
      await seedDefaultExercises(created._id.toString());
    }

    return apiSuccess({ email }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

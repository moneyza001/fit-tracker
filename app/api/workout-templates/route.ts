import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutTemplate } from "@/models";
import { workoutTemplateSchema } from "@/lib/validations";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const workoutTemplates = await WorkoutTemplate.find({ userId })
      .sort({ name: 1 })
      .populate("exercises.exerciseId");
    return apiSuccess(workoutTemplates);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const body = workoutTemplateSchema.parse(await request.json());
    const workoutTemplate = await WorkoutTemplate.create({ ...body, userId });
    return apiSuccess(workoutTemplate, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

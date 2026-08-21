import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutTemplate } from "@/models";
import { workoutTemplateSchema } from "@/lib/validations";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = request.nextUrl.searchParams.get("userId");
    const filter = userId ? { userId } : {};

    const workoutTemplates = await WorkoutTemplate.find(filter)
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

    const body = workoutTemplateSchema.parse(await request.json());
    const workoutTemplate = await WorkoutTemplate.create(body);
    return apiSuccess(workoutTemplate, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

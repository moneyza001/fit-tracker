import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutPlanExercise } from "@/models";
import { workoutPlanExerciseSchema } from "@/lib/validations";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const workoutPlanId = request.nextUrl.searchParams.get("workoutPlanId");
    const filter = workoutPlanId ? { workoutPlanId, userId } : { userId };

    const workoutPlanExercises = await WorkoutPlanExercise.find(filter)
      .sort({ order: 1 })
      .populate("exerciseId");
    return apiSuccess(workoutPlanExercises);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const body = workoutPlanExerciseSchema.parse(await request.json());
    const workoutPlanExercise = await WorkoutPlanExercise.create({
      ...body,
      userId,
    });
    return apiSuccess(workoutPlanExercise, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

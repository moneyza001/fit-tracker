import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutPlanExercise } from "@/models";
import { workoutPlanExerciseSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const workoutPlanExercise = await WorkoutPlanExercise.findOne({
      _id: id,
      userId,
    }).populate("exerciseId");
    if (!workoutPlanExercise) {
      return apiError("Workout plan exercise not found", 404);
    }

    return apiSuccess(workoutPlanExercise);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const body = workoutPlanExerciseSchema.partial().parse(await request.json());
    const workoutPlanExercise = await WorkoutPlanExercise.findOneAndUpdate(
      { _id: id, userId },
      body,
      { new: true, runValidators: true }
    );
    if (!workoutPlanExercise) {
      return apiError("Workout plan exercise not found", 404);
    }

    return apiSuccess(workoutPlanExercise);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const workoutPlanExercise = await WorkoutPlanExercise.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!workoutPlanExercise) {
      return apiError("Workout plan exercise not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

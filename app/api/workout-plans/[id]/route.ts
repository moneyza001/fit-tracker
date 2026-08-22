import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutPlan, WorkoutPlanExercise } from "@/models";
import { workoutPlanSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const workoutPlan = await WorkoutPlan.findOne({ _id: id, userId });
    if (!workoutPlan) {
      return apiError("Workout plan not found", 404);
    }

    return apiSuccess(workoutPlan);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const body = workoutPlanSchema.partial().parse(await request.json());
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: id, userId },
      body,
      { new: true, runValidators: true }
    );
    if (!workoutPlan) {
      return apiError("Workout plan not found", 404);
    }

    return apiSuccess(workoutPlan);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const workoutPlan = await WorkoutPlan.findOneAndDelete({ _id: id, userId });
    if (!workoutPlan) {
      return apiError("Workout plan not found", 404);
    }

    await WorkoutPlanExercise.deleteMany({ workoutPlanId: id, userId });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

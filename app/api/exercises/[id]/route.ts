import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Exercise, WorkoutPlanExercise } from "@/models";
import { exerciseSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const exercise = await Exercise.findOne({ _id: id, userId });
    if (!exercise) {
      return apiError("Exercise not found", 404);
    }

    return apiSuccess(exercise);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const body = exerciseSchema.partial().parse(await request.json());
    const exercise = await Exercise.findOneAndUpdate({ _id: id, userId }, body, {
      new: true,
      runValidators: true,
    });
    if (!exercise) {
      return apiError("Exercise not found", 404);
    }

    return apiSuccess(exercise);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const inUse = await WorkoutPlanExercise.exists({ exerciseId: id, userId });
    if (inUse) {
      return apiError(
        "Cannot delete an exercise that is still used in a workout plan",
        409
      );
    }

    const exercise = await Exercise.findOneAndDelete({ _id: id, userId });
    if (!exercise) {
      return apiError("Exercise not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

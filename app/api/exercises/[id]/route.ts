import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Exercise, WorkoutPlanExercise } from "@/models";
import { exerciseSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const exercise = await Exercise.findById(id);
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
    const { id } = await params;

    const body = exerciseSchema.partial().parse(await request.json());
    const exercise = await Exercise.findByIdAndUpdate(id, body, {
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
    const { id } = await params;

    const inUse = await WorkoutPlanExercise.exists({ exerciseId: id });
    if (inUse) {
      return apiError(
        "Cannot delete an exercise that is still used in a workout plan",
        409
      );
    }

    const exercise = await Exercise.findByIdAndDelete(id);
    if (!exercise) {
      return apiError("Exercise not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

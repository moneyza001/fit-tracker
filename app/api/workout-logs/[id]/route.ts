import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutLog } from "@/models";
import { workoutLogUpdateSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const workoutLog = await WorkoutLog.findOne({ _id: id, userId });
    if (!workoutLog) {
      return apiError("Workout log not found", 404);
    }

    return apiSuccess(workoutLog);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const body = workoutLogUpdateSchema.parse(await request.json());

    const existing = await WorkoutLog.findOne({ _id: id, userId });
    if (!existing) {
      return apiError("Workout log not found", 404);
    }
    if (existing.status === "completed") {
      return apiError("Cannot edit a completed workout log", 409);
    }

    const workoutLog = await WorkoutLog.findOneAndUpdate({ _id: id, userId }, body, {
      new: true,
      runValidators: true,
    });

    return apiSuccess(workoutLog);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const workoutLog = await WorkoutLog.findOneAndDelete({ _id: id, userId });
    if (!workoutLog) {
      return apiError("Workout log not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

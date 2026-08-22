import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutTemplate } from "@/models";
import { workoutTemplateUpdateSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const workoutTemplate = await WorkoutTemplate.findOne({
      _id: id,
      userId,
    }).populate("exercises.exerciseId");
    if (!workoutTemplate) {
      return apiError("Workout template not found", 404);
    }

    return apiSuccess(workoutTemplate);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const body = workoutTemplateUpdateSchema.parse(await request.json());
    const workoutTemplate = await WorkoutTemplate.findOneAndUpdate(
      { _id: id, userId },
      body,
      { new: true, runValidators: true }
    ).populate("exercises.exerciseId");
    if (!workoutTemplate) {
      return apiError("Workout template not found", 404);
    }

    return apiSuccess(workoutTemplate);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const workoutTemplate = await WorkoutTemplate.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!workoutTemplate) {
      return apiError("Workout template not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

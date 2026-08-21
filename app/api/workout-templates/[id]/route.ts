import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutTemplate } from "@/models";
import { workoutTemplateUpdateSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const workoutTemplate = await WorkoutTemplate.findById(id).populate(
      "exercises.exerciseId"
    );
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
    const { id } = await params;

    const body = workoutTemplateUpdateSchema.parse(await request.json());
    const workoutTemplate = await WorkoutTemplate.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("exercises.exerciseId");
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
    const { id } = await params;

    const workoutTemplate = await WorkoutTemplate.findByIdAndDelete(id);
    if (!workoutTemplate) {
      return apiError("Workout template not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Program, WorkoutPlan, WorkoutPlanExercise } from "@/models";
import { programSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const program = await Program.findOne({ _id: id, userId });
    if (!program) {
      return apiError("Program not found", 404);
    }

    return apiSuccess(program);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const body = programSchema.partial().parse(await request.json());
    const program = await Program.findOneAndUpdate({ _id: id, userId }, body, {
      new: true,
      runValidators: true,
    });
    if (!program) {
      return apiError("Program not found", 404);
    }

    return apiSuccess(program);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();
    const { id } = await params;

    const program = await Program.findOneAndDelete({ _id: id, userId });
    if (!program) {
      return apiError("Program not found", 404);
    }

    const workoutPlans = await WorkoutPlan.find(
      { programId: id, userId },
      { _id: 1 }
    );
    const workoutPlanIds = workoutPlans.map((plan) => plan._id);
    await WorkoutPlanExercise.deleteMany({
      workoutPlanId: { $in: workoutPlanIds },
      userId,
    });
    await WorkoutPlan.deleteMany({ programId: id, userId });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

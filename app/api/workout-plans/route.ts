import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutPlan } from "@/models";
import { workoutPlanSchema } from "@/lib/validations";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const programId = request.nextUrl.searchParams.get("programId");
    const filter = programId ? { programId } : {};

    const workoutPlans = await WorkoutPlan.find(filter).sort({ day: 1 });
    return apiSuccess(workoutPlans);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = workoutPlanSchema.parse(await request.json());
    const workoutPlan = await WorkoutPlan.create(body);
    return apiSuccess(workoutPlan, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

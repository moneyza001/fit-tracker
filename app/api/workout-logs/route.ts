import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutLog } from "@/models";
import { workoutLogSchema } from "@/lib/validations";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";
import { WORKOUT_LOG_STATUSES } from "@/types";
import type { QueryFilter } from "mongoose";
import type { IWorkoutLog } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const params = request.nextUrl.searchParams;
    const workoutPlanId = params.get("workoutPlanId");
    const status = params.get("status");
    const from = params.get("from");
    const to = params.get("to");

    const filter: QueryFilter<IWorkoutLog> = { userId };
    if (workoutPlanId) filter.workoutPlanId = workoutPlanId;
    if (status && WORKOUT_LOG_STATUSES.includes(status as (typeof WORKOUT_LOG_STATUSES)[number])) {
      filter.status = status as (typeof WORKOUT_LOG_STATUSES)[number];
    }
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const workoutLogs = await WorkoutLog.find(filter).sort({ date: -1 });
    return apiSuccess(workoutLogs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const body = workoutLogSchema.parse(await request.json());
    const workoutLog = await WorkoutLog.create({ ...body, userId });
    return apiSuccess(workoutLog, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

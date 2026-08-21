import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkoutLog } from "@/models";
import { detectAndRecordPRs } from "@/lib/detect-prs";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const existing = await WorkoutLog.findById(id);
    if (!existing) {
      return apiError("Workout log not found", 404);
    }
    if (existing.status === "completed") {
      return apiError("Workout log is already completed", 409);
    }

    existing.status = "completed";
    await existing.save();

    const newPRs = await detectAndRecordPRs(existing);

    return apiSuccess({ log: existing, newPRs });
  } catch (error) {
    return handleApiError(error);
  }
}

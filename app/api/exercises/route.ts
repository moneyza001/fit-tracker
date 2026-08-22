import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Exercise } from "@/models";
import { exerciseSchema } from "@/lib/validations";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const muscleGroup = request.nextUrl.searchParams.get("muscleGroup");
    const equipment = request.nextUrl.searchParams.get("equipment");

    const filter: Record<string, string> = { userId };
    if (muscleGroup && MUSCLE_GROUPS.includes(muscleGroup as (typeof MUSCLE_GROUPS)[number])) {
      filter.muscleGroup = muscleGroup;
    }
    if (equipment && EQUIPMENT_TYPES.includes(equipment as (typeof EQUIPMENT_TYPES)[number])) {
      filter.equipment = equipment;
    }

    const exercises = await Exercise.find(filter).sort({ name: 1 });
    return apiSuccess(exercises);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const body = exerciseSchema.parse(await request.json());
    const exercise = await Exercise.create({ ...body, userId });
    return apiSuccess(exercise, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

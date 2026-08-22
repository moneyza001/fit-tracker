import { NextRequest } from "next/server";
import type { QueryFilter } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Program, type IProgram } from "@/models";
import { programSchema } from "@/lib/validations";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";
import { PROGRAM_STATUSES } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const status = request.nextUrl.searchParams.get("status");
    const filter: QueryFilter<IProgram> = { userId };
    if (status && PROGRAM_STATUSES.includes(status as (typeof PROGRAM_STATUSES)[number])) {
      filter.status = status as (typeof PROGRAM_STATUSES)[number];
    }

    const programs = await Program.find(filter).sort({ createdAt: -1 });
    return apiSuccess(programs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const body = programSchema.parse(await request.json());
    const program = await Program.create({ ...body, userId });
    return apiSuccess(program, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

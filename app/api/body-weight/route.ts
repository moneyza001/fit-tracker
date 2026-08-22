import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BodyWeight } from "@/models";
import { bodyWeightSchema } from "@/lib/validations";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-guard";

export async function GET() {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const bodyWeights = await BodyWeight.find({ userId }).sort({ date: 1 });
    return apiSuccess(bodyWeights);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const userId = await requireUserId();

    const body = bodyWeightSchema.parse(await request.json());
    const bodyWeight = await BodyWeight.create({ ...body, userId });
    return apiSuccess(bodyWeight, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

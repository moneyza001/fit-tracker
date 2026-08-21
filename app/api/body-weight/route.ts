import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BodyWeight } from "@/models";
import { bodyWeightSchema } from "@/lib/validations";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = request.nextUrl.searchParams.get("userId");
    const filter = userId ? { userId } : {};

    const bodyWeights = await BodyWeight.find(filter).sort({ date: 1 });
    return apiSuccess(bodyWeights);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = bodyWeightSchema.parse(await request.json());
    const bodyWeight = await BodyWeight.create(body);
    return apiSuccess(bodyWeight, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BodyWeight } from "@/models";
import { bodyWeightSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const bodyWeight = await BodyWeight.findById(id);
    if (!bodyWeight) {
      return apiError("Body weight entry not found", 404);
    }

    return apiSuccess(bodyWeight);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const body = bodyWeightSchema.partial().parse(await request.json());
    const bodyWeight = await BodyWeight.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!bodyWeight) {
      return apiError("Body weight entry not found", 404);
    }

    return apiSuccess(bodyWeight);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const bodyWeight = await BodyWeight.findByIdAndDelete(id);
    if (!bodyWeight) {
      return apiError("Body weight entry not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}

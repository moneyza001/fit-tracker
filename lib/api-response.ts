import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Error as MongooseError } from "mongoose";
import type { ApiResponse } from "@/types";
import { UnauthorizedError } from "@/lib/auth-guard";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function apiError(error: string, status = 400) {
  return NextResponse.json<ApiResponse<never>>({ success: false, error }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return apiError("Unauthorized", 401);
  }
  if (error instanceof ZodError) {
    return apiError(error.issues.map((issue) => issue.message).join(", "), 422);
  }
  if (error instanceof MongooseError.CastError) {
    return apiError("Invalid id", 400);
  }
  if (error instanceof MongooseError.ValidationError) {
    return apiError(error.message, 422);
  }
  if (error instanceof SyntaxError) {
    return apiError("Invalid JSON body", 400);
  }

  console.error(error);
  return apiError("Internal server error", 500);
}

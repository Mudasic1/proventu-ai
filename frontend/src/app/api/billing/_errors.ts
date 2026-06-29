import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "@/lib/errors/app-error";

export function billingApiError(error: unknown) {
  if (error instanceof AppError) {
    const status =
      error.code === "AUTH_REQUIRED"
        ? 401
        : error.code === "FORBIDDEN"
          ? 403
          : error.code === "NOT_FOUND"
            ? 404
            : error.code === "VALIDATION_ERROR"
              ? 400
              : 500;

    return NextResponse.json({ error: error.message }, { status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid billing request.", fieldErrors: error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  console.error("Unexpected billing API error", error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}

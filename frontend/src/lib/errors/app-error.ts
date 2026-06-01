export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialActionState: ActionState = { status: "idle" };

export function toActionError(error: unknown): ActionState {
  if (error instanceof AppError) {
    return { status: "error", message: error.message };
  }

  console.error("Unexpected application error", error);
  return {
    status: "error",
    message: "Something went wrong. Please try again.",
  };
}

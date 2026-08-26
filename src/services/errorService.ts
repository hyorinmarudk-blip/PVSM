import {
  writeFrontendLog,
} from "./frontendLoggingService";

export interface AppError {
  message: string;
  context?: string;
  details?: string;
}

export function normalizeError(
  error: unknown,
  context?: string,
): AppError {
  if (error instanceof Error) {
    return {
      message: error.message,
      context,
      details: error.stack,
    };
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    try {
      return {
        message: JSON.stringify(error),
        context,
      };
    } catch {
      // fall through
    }
  }

  return {
    message: String(error),
    context,
  };
}

export function logFrontendError(
  error: AppError,
) {
  console.error(
    "[PVSM Frontend Error]",
    error,
  );

  void writeFrontendLog({
    level: "error",
    message: error.message,
    context: error.context,
    details: error.details,
  });
}
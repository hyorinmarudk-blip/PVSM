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
}
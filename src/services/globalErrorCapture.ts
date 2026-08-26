import {
  logFrontendError,
  normalizeError,
} from "./errorService";

let initialized = false;

export function initializeGlobalErrorCapture() {
  if (initialized) {
    return;
  }

  initialized = true;

  window.addEventListener(
    "error",
    (event) => {
      const error =
        event.error ??
        new Error(event.message);

      logFrontendError(
        normalizeError(
          error,
          [
            "Global window error",
            event.filename
              ? `File: ${event.filename}`
              : "",
            event.lineno
              ? `Line: ${event.lineno}`
              : "",
            event.colno
              ? `Column: ${event.colno}`
              : "",
          ]
            .filter(Boolean)
            .join(" | "),
        ),
      );
    },
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      logFrontendError(
        normalizeError(
          event.reason,
          "Unhandled Promise Rejection",
        ),
      );
    },
  );
}
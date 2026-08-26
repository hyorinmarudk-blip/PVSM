import { invoke } from "@tauri-apps/api/core";

export interface FrontendLogPayload {
  level: "error" | "warn" | "info";
  message: string;
  context?: string;
  details?: string;
}

export async function writeFrontendLog(
  payload: FrontendLogPayload,
) {
  try {
    await invoke("write_frontend_log", {
      payload,
    });
  } catch (error) {
    console.error(
      "[PVSM logging failure]",
      error,
      payload,
    );
  }
}
import { GenerationStatus } from "../types";
import { env } from "../config/env";

export function emitAssignmentStatus(
  assignmentId: string,
  status: GenerationStatus,
  error?: string
): void {
  const url = `http://127.0.0.1:${env.port}/api/assignments/${assignmentId}/status`;

  // propagate status update to the API Server via a lightweight local HTTP POST
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, error }),
  }).catch((err) => {
    console.error(
      `[Worker Socket Link] Failed to propagate status update to API server:`,
      err.message || err
    );
  });
}

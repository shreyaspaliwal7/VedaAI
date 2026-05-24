import {
  AssignmentApiResponse,
  CreateAssignmentPayload,
} from "@/types";

/** Same-origin Next.js API routes by default; set NEXT_PUBLIC_API_URL for direct backend access */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function formatApiError(
  data: Record<string, unknown>,
  status: number
): string {
  if (typeof data.error === "string") {
    return data.error;
  }
  if (data.details && typeof data.details === "object") {
    const fieldErrors = Object.entries(
      data.details as Record<string, string[] | string>
    ).flatMap(([field, messages]) => {
      const list = Array.isArray(messages) ? messages : [messages];
      return list.map((msg) => `${field}: ${msg}`);
    });
    if (fieldErrors.length > 0) {
      return fieldErrors.join(" ");
    }
  }
  return `Request failed with status ${status}`;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(formatApiError(data, res.status), res.status, data.details);
  }
  return data as T;
}

export async function createAssignment(
  payload: CreateAssignmentPayload
): Promise<{ assignmentId: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

export async function fetchAssignment(
  id: string
): Promise<AssignmentApiResponse> {
  const res = await fetch(`${API_BASE}/api/assignments/${id}`, {
    cache: "no-store",
  });
  return parseResponse(res);
}

export async function regenerateAssignment(
  id: string,
  additionalInfo?: string
): Promise<{ assignmentId: string; status: string; publishStatus: "draft" | "published" }> {
  const res = await fetch(`${API_BASE}/api/assignments/${id}/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ additionalInfo }),
  });
  return parseResponse(res);
}

export async function publishAssignment(
  id: string
): Promise<{ assignmentId: string; status: string; publishStatus: "published" }> {
  const res = await fetch(`${API_BASE}/api/assignments/${id}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return parseResponse(res);
}

/** Socket.io server URL (Express backend). Empty when using dev API-only mode. */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

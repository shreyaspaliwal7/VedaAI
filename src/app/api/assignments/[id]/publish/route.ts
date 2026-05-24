import { NextRequest, NextResponse } from "next/server";
import { devPublishAssignment } from "@/lib/devAssignmentStore";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

type RouteContext = { params: Promise<{ id: string }> };

async function proxyPublish(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/assignments/${id}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    return await proxyPublish(id);
  } catch {
    // Fall back to dev store if backend is down
    const result = devPublishAssignment(id);
    if (!result) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
    return NextResponse.json(result, { status: 202 });
  }
}

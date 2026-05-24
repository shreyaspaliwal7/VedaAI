import { NextRequest, NextResponse } from "next/server";
import { devRegenerateAssignment } from "@/lib/devAssignmentStore";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

type RouteContext = { params: Promise<{ id: string }> };

async function proxyRegenerate(id: string, additionalInfo?: string) {
  const res = await fetch(`${BACKEND_URL}/api/assignments/${id}/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ additionalInfo }),
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  let body: { additionalInfo?: string } = {};
  
  try {
    body = await req.json();
  } catch {}

  try {
    return await proxyRegenerate(id, body.additionalInfo);
  } catch {
    // Fall back to dev store if backend is down
    const result = devRegenerateAssignment(id, body.additionalInfo);
    if (!result) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
    return NextResponse.json(result, { status: 202 });
  }
}

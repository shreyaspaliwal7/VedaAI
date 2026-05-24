import { NextRequest, NextResponse } from "next/server";
import { CreateAssignmentPayload } from "@/types";
import { devCreateAssignment } from "@/lib/devAssignmentStore";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

async function proxyCreate(body: CreateAssignmentPayload) {
  const res = await fetch(`${BACKEND_URL}/api/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  let body: CreateAssignmentPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return await proxyCreate(body);
  } catch {
    try {
      const result = devCreateAssignment(body);
      return NextResponse.json(result, { status: 202 });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not create assignment";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }
}

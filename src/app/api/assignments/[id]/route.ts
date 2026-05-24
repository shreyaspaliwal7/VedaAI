// src/app/api/assignments/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { devGetAssignment } from "@/lib/devAssignmentStore";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

// 1. Change RouteContext to type params as a Promise
type RouteContext = { params: Promise<{ id: string }> };

async function proxyGet(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/assignments/${id}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  // 2. Await the params promise before accessing 'id'
  const { id } = await params;

  try {
    const proxied = await proxyGet(id);
    if (proxied.status !== 404) {
      return proxied;
    }
  } catch {
    // fall through to dev store if the backend is offline
  }

  const record = devGetAssignment(id);
  if (!record) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }
  return NextResponse.json(record);
}
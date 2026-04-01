import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
  const body = await request.formData();
  const res = await fetch(`${BACKEND_URL}/api/preview`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Backend preview failed" },
      { status: res.status },
    );
  }

  const blob = await res.blob();
  const manifest = res.headers.get("X-Manifest");

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      ...(manifest ? { "X-Manifest": manifest } : {}),
    },
  });
}

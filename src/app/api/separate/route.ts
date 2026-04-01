import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
  const body = await request.formData();
  const res = await fetch(`${BACKEND_URL}/api/separate`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Backend separation failed" },
      { status: res.status },
    );
  }

  const blob = await res.blob();

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=woodblock-plates.zip",
    },
  });
}

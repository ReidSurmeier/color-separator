import { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.formData();

  const backendRes = await fetch(`${BACKEND}/api/preview-stream`, {
    method: "POST",
    body,
    // @ts-expect-error - duplex needed for streaming request
    duplex: "half",
  });

  if (!backendRes.ok) {
    return new Response(backendRes.statusText, { status: backendRes.status });
  }

  // Stream the SSE response through without buffering
  return new Response(backendRes.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

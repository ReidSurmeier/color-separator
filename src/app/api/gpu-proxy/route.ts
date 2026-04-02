/**
 * GPU Proxy — Routes requests to RunPod Serverless endpoint.
 * 
 * This route handler intercepts /api/gpu-proxy requests from the frontend,
 * converts them to RunPod serverless format, submits the job, and polls
 * for completion.
 * 
 * The RunPod API key never leaves the server.
 */
import { NextRequest, NextResponse } from "next/server";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY || "";
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID || "";
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || "";

export async function POST(request: NextRequest) {
  // Auth check
  if (BACKEND_API_KEY) {
    const key = request.headers.get("X-API-Key");
    if (key !== BACKEND_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    return NextResponse.json(
      { error: "GPU backend not configured. Set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert image to base64
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    // Build RunPod job input
    const jobInput: Record<string, unknown> = {
      image: imageBase64,
      version: formData.get("version") || "v20",
      plates: parseInt(formData.get("plates") as string) || 4,
      dust: parseInt(formData.get("dust") as string) || 5,
      action: formData.get("action") || "preview",
      upscale: formData.get("upscale") === "true",
      chroma_boost: parseFloat(formData.get("chroma_boost") as string) || 1.3,
      shadow_threshold: parseInt(formData.get("shadow_threshold") as string) || 8,
      highlight_threshold: parseInt(formData.get("highlight_threshold") as string) || 95,
      median_size: parseInt(formData.get("median_size") as string) || 3,
    };

    // Submit job to RunPod (synchronous — waits up to 300s)
    const runResponse = await fetch(
      `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/runsync`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RUNPOD_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: jobInput }),
        signal: AbortSignal.timeout(300_000), // 5 minute timeout
      }
    );

    const result = await runResponse.json();

    if (result.status === "COMPLETED" && result.output) {
      const output = result.output;

      if (output.error) {
        return NextResponse.json({ error: output.error }, { status: 500 });
      }

      // For preview action: return the composite image as PNG
      if (output.composite) {
        const imageBytes = Buffer.from(output.composite, "base64");
        return new NextResponse(imageBytes, {
          headers: {
            "Content-Type": "image/png",
            "X-Manifest": JSON.stringify(output.manifest || {}),
            "X-GPU-Time": String(output.time_seconds || 0),
            "X-GPU-Mode": "serverless",
          },
        });
      }

      // For separate action: return the ZIP
      if (output.zip) {
        const zipBytes = Buffer.from(output.zip, "base64");
        return new NextResponse(zipBytes, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": "attachment; filename=separation.zip",
            "X-GPU-Time": String(output.time_seconds || 0),
          },
        });
      }

      return NextResponse.json(output);
    }

    // Job failed or timed out
    if (result.status === "FAILED") {
      return NextResponse.json(
        { error: result.error || "GPU job failed", detail: result },
        { status: 500 }
      );
    }

    // Still in queue (shouldn't happen with runsync, but handle it)
    if (result.status === "IN_QUEUE" || result.status === "IN_PROGRESS") {
      return NextResponse.json(
        { error: "GPU job timed out. Try again — worker may be cold starting.", jobId: result.id },
        { status: 504 }
      );
    }

    return NextResponse.json({ error: "Unexpected response", detail: result }, { status: 500 });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

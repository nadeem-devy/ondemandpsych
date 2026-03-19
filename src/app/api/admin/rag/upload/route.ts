import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const DO_RAG_URL = process.env.DO_RAG_URL || "http://167.99.229.148:8585";
const DO_API_TOKEN = process.env.DO_API_TOKEN || "sk-test-12345-abcdef-67890-ghijkl-mnopqr-stuvwx-yz1234";

export const maxDuration = 300; // 5 min for large files

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });

  try {
    const resp = await fetch(`${DO_RAG_URL}/api/chat/ingest/status/${jobId}`, {
      headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
    });
    if (!resp.ok) return NextResponse.json({ error: "Failed to get job status" }, { status: resp.status });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to check job status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const category = (formData.get("category") as string) || "general";

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Build multipart form for DO ingestion endpoint
    // DO expects: category name as key, files as values
    const doFormData = new FormData();
    for (const file of files) {
      doFormData.append(category, file);
    }

    const resp = await fetch(`${DO_RAG_URL}/api/chat/ingest/process-files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
      body: doFormData,
    });

    if (!resp.ok) {
      const error = await resp.text();
      return NextResponse.json({ error: `RAG service error: ${error}` }, { status: resp.status });
    }

    const data = await resp.json();

    // If job_id returned, poll for completion
    if (data.job_id) {
      // Return job info immediately — frontend can poll for status
      return NextResponse.json({
        total: files.length,
        jobId: data.job_id,
        status: data.status,
        message: "Files submitted for processing",
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

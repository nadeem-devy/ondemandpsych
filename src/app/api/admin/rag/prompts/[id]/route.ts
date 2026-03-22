import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const DO_RAG_URL = process.env.DO_RAG_URL || "https://chat.ondemandpsych.com";
const DO_API_TOKEN = process.env.DO_API_TOKEN || "sk-test-12345-abcdef-67890-ghijkl-mnopqr-stuvwx-yz1234";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const resp = await fetch(`${DO_RAG_URL}/api/admin/prompts/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
  });

  if (!resp.ok) return NextResponse.json({ error: "Prompt not found" }, { status: resp.status });
  const data = await resp.json();

  return NextResponse.json({
    id: data.name,
    name: data.name,
    systemPrompt: data.content,
    temperature: 0.1,
    model: "gpt-4.1",
    isActive: true,
    createdAt: new Date().toISOString(),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // If systemPrompt provided, update the prompt file on DO
  if (body.systemPrompt) {
    const resp = await fetch(`${DO_RAG_URL}/api/admin/prompts/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${DO_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: body.systemPrompt }),
    });

    if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  }

  return NextResponse.json({
    id,
    name: body.name || id,
    systemPrompt: body.systemPrompt || "",
    temperature: body.temperature || 0.1,
    model: body.model || "gpt-4.1",
    isActive: body.isActive ?? true,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // DO prompts are files — we don't support deleting them from the dashboard
  // as they're critical to the RAG pipeline
  return NextResponse.json({ error: "Cannot delete system prompts — they are part of the RAG pipeline" }, { status: 400 });
}

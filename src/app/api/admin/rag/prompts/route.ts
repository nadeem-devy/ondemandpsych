import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const DO_RAG_URL = process.env.DO_RAG_URL || "http://167.99.229.148:8585";
const DO_API_TOKEN = process.env.DO_API_TOKEN || "sk-test-12345-abcdef-67890-ghijkl-mnopqr-stuvwx-yz1234";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resp = await fetch(`${DO_RAG_URL}/api/admin/prompts`, {
    headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  const data = await resp.json();

  // Transform DO prompts to match frontend expectations
  const prompts = (data.prompts || []).map((p: any) => ({
    id: p.name, // use name as ID since DO prompts are file-based
    name: p.name,
    systemPrompt: p.preview || "",
    temperature: 0.1,
    model: "gpt-4.1",
    isActive: true,
    createdAt: new Date().toISOString(),
    size: p.size,
  }));

  return NextResponse.json(prompts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, systemPrompt } = await req.json();
  if (!name || !systemPrompt) return NextResponse.json({ error: "Name and system prompt required" }, { status: 400 });

  const resp = await fetch(`${DO_RAG_URL}/api/admin/prompts/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${DO_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content: systemPrompt }),
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  return NextResponse.json(await resp.json());
}

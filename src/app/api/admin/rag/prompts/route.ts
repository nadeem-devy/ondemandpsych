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
  return NextResponse.json(data.prompts || []);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, content } = await req.json();
  if (!name || !content) return NextResponse.json({ error: "Name and content required" }, { status: 400 });

  // Create or update prompt file on DO
  const resp = await fetch(`${DO_RAG_URL}/api/admin/prompts/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${DO_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  return NextResponse.json(await resp.json());
}

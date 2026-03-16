import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const DO_RAG_URL = process.env.DO_RAG_URL || "http://167.99.229.148:8585";
const DO_API_TOKEN = process.env.DO_API_TOKEN || "sk-test-12345-abcdef-67890-ghijkl-mnopqr-stuvwx-yz1234";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const category = req.nextUrl.searchParams.get("category") || "";
  const url = `${DO_RAG_URL}/api/admin/documents${category ? `?category=${category}` : ""}`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  const data = await resp.json();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, category } = await req.json();
  if (!fileName) return NextResponse.json({ error: "Missing fileName" }, { status: 400 });

  const url = `${DO_RAG_URL}/api/admin/documents/${encodeURIComponent(fileName)}${category ? `?category=${category}` : ""}`;
  const resp = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  const data = await resp.json();
  return NextResponse.json(data);
}

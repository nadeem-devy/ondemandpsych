import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const DO_RAG_URL = process.env.DO_RAG_URL || "http://167.99.229.148:8585";
const DO_API_TOKEN = process.env.DO_API_TOKEN || "sk-test-12345-abcdef-67890-ghijkl-mnopqr-stuvwx-yz1234";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const qs = new URLSearchParams();
  if (params.get("file_name")) qs.set("file_name", params.get("file_name")!);
  if (params.get("documentId")) qs.set("file_name", params.get("documentId")!);
  if (params.get("category")) qs.set("category", params.get("category")!);
  qs.set("offset", String((parseInt(params.get("page") || "1") - 1) * parseInt(params.get("limit") || "20")));
  qs.set("limit", params.get("limit") || "20");

  const resp = await fetch(`${DO_RAG_URL}/api/admin/chunks?${qs}`, {
    headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  const data = await resp.json();

  return NextResponse.json({
    chunks: data.chunks,
    total: data.total,
    page: parseInt(params.get("page") || "1"),
    totalPages: Math.ceil(data.total / parseInt(params.get("limit") || "20")),
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, content } = await req.json();
  if (!id || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const resp = await fetch(`${DO_RAG_URL}/api/admin/chunks/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${DO_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  return NextResponse.json(await resp.json());
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const resp = await fetch(`${DO_RAG_URL}/api/admin/chunks/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  return NextResponse.json(await resp.json());
}

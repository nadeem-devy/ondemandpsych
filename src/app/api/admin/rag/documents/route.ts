import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const DO_RAG_URL = process.env.DO_RAG_URL || "http://167.99.229.148:8585";
const DO_API_TOKEN = process.env.DO_API_TOKEN || "sk-test-12345-abcdef-67890-ghijkl-mnopqr-stuvwx-yz1234";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const category = params.get("category") || "";
  const page = parseInt(params.get("page") || "1");
  const limit = parseInt(params.get("limit") || "50");
  const offset = (page - 1) * limit;

  const qs = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (category) qs.set("category", category);

  const resp = await fetch(`${DO_RAG_URL}/api/admin/documents?${qs}`, {
    headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  const data = await resp.json();

  // Transform DO format to match frontend expectations
  const documents = (data.documents || []).map((doc: any, i: number) => ({
    id: `do-${offset + i}-${doc.file_name}`,
    title: doc.file_name,
    fileType: doc.file_name.split(".").pop() || "docx",
    fileUrl: doc.source || "",
    fileSize: 0,
    category: doc.category,
    tags: null,
    status: "indexed",
    pageCount: null,
    error: null,
    createdAt: new Date().toISOString(),
    _count: { chunks: doc.chunk_count },
  }));

  return NextResponse.json({
    documents,
    total: data.total || 0,
    totalChunks: data.total_chunks || 0,
    page,
    totalPages: Math.ceil((data.total || 0) / limit),
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const fileName = id.replace(/^do-\d+-/, "");
  const url = `${DO_RAG_URL}/api/admin/documents/${encodeURIComponent(fileName)}`;
  const resp = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
  });

  if (!resp.ok) return NextResponse.json({ error: "RAG service error" }, { status: resp.status });
  return NextResponse.json({ success: true });
}

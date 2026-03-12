import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processDocument } from "@/lib/rag";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import { parseOffice } from "officeparser";

export const maxDuration = 300; // 5 min for large files

const ALLOWED_TYPES = ["txt", "md", "csv", "pdf", "docx", "doc", "pptx", "ppt", "xlsx"];

/**
 * Extract text content from various file types.
 */
async function extractText(buffer: Buffer, ext: string): Promise<string> {
  if (ext === "txt" || ext === "md" || ext === "csv") {
    return buffer.toString("utf-8");
  }

  if (ext === "pdf") {
    const pdf = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await pdf.getText();
    await pdf.destroy();
    return result.text;
  }

  if (["docx", "doc", "pptx", "ppt", "xlsx"].includes(ext)) {
    const result = await parseOffice(buffer);
    return String(result);
  }

  return "";
}

// Single file upload
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const files = formData.getAll("file") as File[];
  const title = (formData.get("title") as string) || "";
  const category = (formData.get("category") as string) || null;
  const tags = (formData.get("tags") as string) || null;
  const videoUrl = (formData.get("videoUrl") as string) || null;
  const videoTitle = (formData.get("videoTitle") as string) || null;
  const videoTranscript = (formData.get("videoTranscript") as string) || null;

  // Handle video URL + transcript upload (no file)
  if (videoUrl && videoTranscript) {
    const doc = await prisma.ragDocument.create({
      data: {
        title: videoTitle || videoUrl,
        fileType: "video",
        fileUrl: videoUrl,
        fileSize: 0,
        category: category || "Videos",
        tags,
        status: "pending",
      },
    });

    try {
      const result = await processDocument(doc.id, videoTranscript);
      return NextResponse.json({ ...doc, ...result });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Processing failed", docId: doc.id },
        { status: 500 }
      );
    }
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "rag");
  await mkdir(uploadDir, { recursive: true });

  const results: { name: string; status: string; chunks?: number; error?: string }[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "txt";

    if (!ALLOWED_TYPES.includes(ext)) {
      results.push({ name: file.name, status: "skipped", error: `Unsupported type: .${ext}` });
      continue;
    }

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const doc = await prisma.ragDocument.create({
      data: {
        title: (files.length === 1 && title) ? title : file.name.replace(/\.[^.]+$/, ""),
        fileType: ext,
        fileUrl: `/uploads/rag/${fileName}`,
        fileSize: file.size,
        category,
        tags,
        status: "pending",
      },
    });

    try {
      const text = await extractText(buffer, ext);

      if (!text || text.trim().length < 10) {
        await prisma.ragDocument.update({
          where: { id: doc.id },
          data: { status: "failed", error: "Could not extract meaningful text from file" },
        });
        results.push({ name: file.name, status: "failed", error: "No text extracted" });
        continue;
      }

      const result = await processDocument(doc.id, text);
      results.push({ name: file.name, status: "indexed", chunks: result.chunksCreated });
    } catch (error) {
      results.push({
        name: file.name,
        status: "failed",
        error: error instanceof Error ? error.message : "Processing failed",
      });
    }
  }

  return NextResponse.json({
    total: files.length,
    indexed: results.filter((r) => r.status === "indexed").length,
    failed: results.filter((r) => r.status === "failed").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    results,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processDocument } from "@/lib/rag";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "";
  const category = (formData.get("category") as string) || null;
  const tags = (formData.get("tags") as string) || null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
  const allowedTypes = ["txt", "md", "csv", "pdf", "docx"];
  if (!allowedTypes.includes(ext)) {
    return NextResponse.json(
      { error: `Unsupported file type: .${ext}. Allowed: ${allowedTypes.join(", ")}` },
      { status: 400 }
    );
  }

  // Save file to /public/uploads/rag/
  const uploadDir = path.join(process.cwd(), "public", "uploads", "rag");
  await mkdir(uploadDir, { recursive: true });
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(uploadDir, fileName);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  // Create document record
  const doc = await prisma.ragDocument.create({
    data: {
      title: title || file.name,
      fileType: ext,
      fileUrl: `/uploads/rag/${fileName}`,
      fileSize: file.size,
      category,
      tags,
      status: "pending",
    },
  });

  // Extract text based on file type
  let text = "";
  if (ext === "txt" || ext === "md" || ext === "csv") {
    text = Buffer.from(bytes).toString("utf-8");
  } else {
    // For PDF/DOCX, store as pending — user needs to provide text or we need a parser
    // For now, try to read as UTF-8 text
    text = Buffer.from(bytes).toString("utf-8");
    // If it looks like binary, mark as needing manual text input
    if (text.includes("\x00") || text.includes("\ufffd")) {
      await prisma.ragDocument.update({
        where: { id: doc.id },
        data: {
          status: "pending",
          error: "Binary file detected. Please paste the text content manually or install a PDF parser.",
        },
      });
      return NextResponse.json({
        ...doc,
        message: "File uploaded but text extraction is not available for this file type. Please provide text content manually.",
      });
    }
  }

  // Process: chunk + embed
  try {
    const result = await processDocument(doc.id, text);
    return NextResponse.json({ ...doc, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed", docId: doc.id },
      { status: 500 }
    );
  }
}

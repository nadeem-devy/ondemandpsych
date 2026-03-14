import { NextRequest, NextResponse } from "next/server";
import { getCopilotUser } from "@/lib/copilot-auth";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export async function POST(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const supported = ["pdf", "docx", "pptx", "ppt", "txt"];
  if (!supported.includes(ext)) {
    return NextResponse.json({ error: `Unsupported file type: .${ext}. Supported: PDF, DOCX, PPTX, TXT` }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (ext === "txt") {
      text = buffer.toString("utf-8");
    } else if (ext === "pdf") {
      const { getDocumentProxy, extractText: pdfExtract } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const result = await pdfExtract(pdf, { mergePages: true });
      text = result.text;
    } else if (ext === "docx" || ext === "pptx" || ext === "ppt") {
      const { parseOffice } = await import("officeparser");
      const tmpPath = path.join(tmpdir(), `extract-${Date.now()}.${ext}`);
      await writeFile(tmpPath, buffer);
      const result = await parseOffice(tmpPath);
      text = String(result);
      await unlink(tmpPath).catch(() => {});
    }

    // Trim and limit text length
    text = text.trim();
    const charLimit = 30000;
    if (text.length > charLimit) {
      text = text.slice(0, charLimit) + "\n\n[... Document truncated at 30,000 characters ...]";
    }

    return NextResponse.json({
      text,
      fileName: file.name,
      fileSize: file.size,
      charCount: text.length,
    });
  } catch (error) {
    console.error("Document extraction error:", error);
    return NextResponse.json({ error: "Failed to extract text from document" }, { status: 500 });
  }
}

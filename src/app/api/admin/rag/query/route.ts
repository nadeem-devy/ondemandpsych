import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ragQuery } from "@/lib/rag";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query } = await req.json();
  if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

  try {
    const result = await ragQuery(query, session.user?.email ?? undefined);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query failed" },
      { status: 500 }
    );
  }
}

// app/api/elysian-lex/ingest/route.ts
import { processPdf } from "@/lib/elysian-lex/rag";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    const sessionId = formData.get("sessionId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "No Session ID provided" }, { status: 400 });
    }

    const result = await processPdf(file, sessionId);

    return NextResponse.json({
      success: true,
      stats: result
    });
  } catch (error: any) {
    console.error("Ingest Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

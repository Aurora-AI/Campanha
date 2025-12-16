import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.ADMIN_TOKEN || ""}`;

    if (!process.env.ADMIN_TOKEN) {
      return unauthorized();
    }
    if (auth !== expected) {
      return unauthorized();
    }

    const snapshot = await req.json();

    if (!snapshot?.publishedAt || !snapshot?.version || !snapshot?.data) {
      return NextResponse.json(
        { error: "Invalid snapshot: expected { publishedAt, version, data }" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const blob = await put("calceleve/latest.json", JSON.stringify(snapshot), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json(
      { success: true, url: blob.url },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Erro ao publicar snapshot:", error);
    return NextResponse.json(
      { error: "Erro ao publicar atualização" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

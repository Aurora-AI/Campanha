import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    // Validar Authorization
    const authHeader = req.headers.get("authorization");
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
      return NextResponse.json(
        { error: "Server misconfigured: ADMIN_TOKEN not set" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json(
        { error: "Token inválido. Publicação não autorizada." },
        { status: 401 }
      );
    }

    // Ler body JSON
    const snapshot = await req.json();

    if (!snapshot || typeof snapshot !== "object") {
      return NextResponse.json(
        { error: "Snapshot inválido" },
        { status: 400 }
      );
    }

    // Adicionar publishedAt se não existir
    if (!snapshot.publishedAt) {
      snapshot.publishedAt = new Date().toISOString();
    }

    // Publicar no Blob (sempre sobrescreve latest.json)
    const blob = await put("calceleve/latest.json", JSON.stringify(snapshot), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      publishedAt: snapshot.publishedAt,
    });
  } catch (error) {
    console.error("Erro ao publicar snapshot:", error);
    return NextResponse.json(
      { error: "Erro ao publicar atualização" },
      { status: 500 }
    );
  }
}

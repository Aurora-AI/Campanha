import { NextResponse } from "next/server";
import { head } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Verificar se latest.json existe
    let blobUrl: string;
    
    try {
      const headResult = await head("calceleve/latest.json");
      blobUrl = headResult.url;
    } catch (error) {
      // Blob não existe
      return new NextResponse(null, { status: 204 });
    }

    // Buscar o conteúdo
    const response = await fetch(blobUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return new NextResponse(null, { status: 204 });
    }

    const snapshot = await response.json();

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar latest:", error);
    return NextResponse.json(
      { error: "Erro ao carregar última versão" },
      { status: 500 }
    );
  }
}

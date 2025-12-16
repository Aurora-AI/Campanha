import { NextResponse } from "next/server";
import { head } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const meta = await head("campanha-data.json");
    if (!meta?.url) {
      return new NextResponse("Dados não encontrados", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const url = new URL(meta.url);
    url.searchParams.set("t", String(Date.now()));

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return new NextResponse("Dados não encontrados", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const json = await res.json();
    return NextResponse.json(json, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return new NextResponse("Dados não encontrados", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

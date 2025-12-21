import { NextResponse } from "next/server";
import { signAdminCookie } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    type LoginPayload = { username?: string; password?: string };
    const body = (await req.json().catch(() => ({}))) as LoginPayload;
    const username = body.username ?? "";
    const password = body.password ?? "";

    const expectedUser = process.env.ADMIN_USER ?? "";
    const expectedPass = process.env.ADMIN_PASSWORD ?? "";
    const secret = process.env.ADMIN_AUTH_SECRET ?? "";

    if (!expectedUser || !expectedPass || !secret) {
      return NextResponse.json(
        {
          ok: false,
          error: "ENV ausente: ADMIN_USER / ADMIN_PASSWORD / ADMIN_AUTH_SECRET",
        },
        { status: 500 }
      );
    }

    if (username !== expectedUser || password !== expectedPass) {
      return NextResponse.json(
        { ok: false, error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const token = await signAdminCookie(String(username), 7);

    const res = NextResponse.json({ ok: true });
    res.cookies.set("mycelium_admin", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (e: unknown) {
    console.error("ADMIN LOGIN ERROR:", e instanceof Error ? e.message : "unknown_error");
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Erro interno." },
      { status: 500 }
    );
  }
}

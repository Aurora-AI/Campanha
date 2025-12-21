import { NextResponse } from "next/server";
import { signAdminCookie } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json().catch(() => ({
      username: "",
      password: "",
    }));

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
  } catch (e: any) {
    console.error("ADMIN LOGIN ERROR:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Erro interno." },
      { status: 500 }
    );
  }
}

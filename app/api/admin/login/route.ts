import { NextResponse } from "next/server";
import { signAdminCookie } from "@/lib/admin/auth";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";

  let username = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    username = String(body?.username ?? "");
    password = String(body?.password ?? "");
  } else {
    const form = await req.formData();
    username = String(form.get("username") ?? "");
    password = String(form.get("password") ?? "");
  }

  const expectedUser = process.env.ADMIN_USER ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";

  if (!expectedUser || !expectedPass) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_USER/ADMIN_PASSWORD não configurados." },
      { status: 500 }
    );
  }

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });
  }

  const token = await signAdminCookie(username, 7);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("mycelium_admin", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return res;
}

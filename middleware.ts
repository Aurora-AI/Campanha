import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminCookie } from "@/lib/admin/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const cookie = req.cookies.get("mycelium_admin")?.value;
    const ok = cookie ? await verifyAdminCookie(cookie) : false;

    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

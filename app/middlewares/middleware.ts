import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    try {
      verifyJwt(token);
    } catch {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  if (pathname === "/auth" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};

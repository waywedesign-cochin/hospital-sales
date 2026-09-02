import { NextRequest, NextResponse } from "next/server";

// A simple utility to decode JWT payload without verification for Edge runtime
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function proxy(req: NextRequest) {
  // 👈 CHANGED: middleware -> proxy
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const rootDashboardPaths = [
    "/dashboard",
    "/activity-logs",
    "/appointments",
    "/architecture",
    "/doctors",
    "/enquiries",
    "/messaging",
    "/patients",
    "/profile",
    "/settings",
    "/users",
  ];

  const isSlugRoute = rootDashboardPaths.some(
    (p) =>
      pathname.includes(p) &&
      pathname.match(new RegExp(`^\\/([^\\/]+)${p}(\\/.*)?$`)),
  );

  if (isSlugRoute) {
    const slugInUrl = pathname.split("/")[1];

    if (!token) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    try {
      const decoded = decodeJwtPayload(token);
      if (!decoded) throw new Error("Invalid token");

      if (decoded.organizationSlug && decoded.organizationSlug !== slugInUrl) {
        return NextResponse.redirect(
          new URL(`/${decoded.organizationSlug}/dashboard`, req.url),
        );
      }
    } catch {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  if (pathname === "/auth" && token) {
    try {
      const decoded = decodeJwtPayload(token);
      if (decoded && decoded.organizationSlug) {
        return NextResponse.redirect(
          new URL(`/${decoded.organizationSlug}/dashboard`, req.url),
        );
      }
    } catch {
      // invalid token, let them stay on /auth
    }
  }

  const isRootDashboardPath = rootDashboardPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isRootDashboardPath) {
    if (token) {
      try {
        const decoded = decodeJwtPayload(token);
        if (decoded && decoded.organizationSlug) {
          const redirectUrl = new URL(
            `/${decoded.organizationSlug}${pathname}`,
            req.url,
          );
          redirectUrl.search = req.nextUrl.search;
          return NextResponse.redirect(redirectUrl);
        }
      } catch {}
    }
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

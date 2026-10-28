import { auth } from "@/lib/auth/server";
import { loginPathFor } from "@/lib/auth/next-path";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  // Keep the exact account page the visitor asked for (e.g. /account/saved);
  // anything not on the allowlist falls back to /account.
  const loginUrl = loginPathFor(isAdmin ? "/admin" : pathname);
  return auth.middleware({ loginUrl })(request);
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};

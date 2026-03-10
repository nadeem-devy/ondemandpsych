import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyCopilotToken } from "@/lib/copilot-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes — use NextAuth
  if (pathname.startsWith("/admin")) {
    const session = await auth();
    const isLoginPage = pathname === "/admin/login";
    const isLoggedIn = !!session?.user;

    if (!isLoginPage && !isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (isLoginPage && isLoggedIn) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Copilot routes — use JWT cookie
  if (pathname.startsWith("/copilot") && !pathname.startsWith("/copilot/login") && !pathname.startsWith("/copilot/register") && !pathname.startsWith("/copilot/forgot-password")) {
    const token = req.cookies.get("copilot-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/copilot/login", req.url));
    }
    const user = await verifyCopilotToken(token);
    if (!user) {
      return NextResponse.redirect(new URL("/copilot/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/copilot/:path*"],
};

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyCopilotToken } from "@/lib/copilot-auth";

function isCopilotSubdomain(req: NextRequest): boolean {
  const host = req.headers.get("host") || "";
  return host.startsWith("copilot.");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Subdomain routing: copilot.ondemandpsych.com → /copilot/*
  if (isCopilotSubdomain(req)) {
    // Skip if already an API route, _next, or static asset
    if (pathname.startsWith("/api/") || pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
      // Allow /api/copilot/* and /api/public/* through as-is
      return NextResponse.next();
    }

    // Root of subdomain → /copilot/login (or /copilot/chat if authed)
    if (pathname === "/" || pathname === "") {
      const token = req.cookies.get("copilot-token")?.value;
      if (token) {
        const user = await verifyCopilotToken(token);
        if (user) {
          return NextResponse.rewrite(new URL("/copilot/chat", req.url));
        }
      }
      return NextResponse.rewrite(new URL("/copilot/login", req.url));
    }

    // If path doesn't start with /copilot, rewrite to /copilot/...
    if (!pathname.startsWith("/copilot")) {
      const rewrittenUrl = new URL(`/copilot${pathname}`, req.url);
      rewrittenUrl.search = req.nextUrl.search;

      // Auth check for protected copilot routes
      const copilotPath = `/copilot${pathname}`;
      if (!copilotPath.startsWith("/copilot/login") && !copilotPath.startsWith("/copilot/register") && !copilotPath.startsWith("/copilot/forgot-password")) {
        const token = req.cookies.get("copilot-token")?.value;
        if (!token) {
          return NextResponse.rewrite(new URL("/copilot/login", req.url));
        }
        const user = await verifyCopilotToken(token);
        if (!user) {
          return NextResponse.rewrite(new URL("/copilot/login", req.url));
        }
      }

      return NextResponse.rewrite(rewrittenUrl);
    }

    // Path already starts with /copilot — fall through to normal copilot auth below
  }

  // Redirect /copilot/* on main domain to copilot subdomain
  if (!isCopilotSubdomain(req) && pathname.startsWith("/copilot")) {
    const host = req.headers.get("host") || "";
    // Only redirect in production (when we have a real domain, not localhost)
    if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      const subPath = pathname.replace(/^\/copilot/, "") || "/";
      const subdomainUrl = new URL(`https://copilot.${host.replace(/^www\./, "")}${subPath}`);
      subdomainUrl.search = req.nextUrl.search;
      return NextResponse.redirect(subdomainUrl);
    }
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

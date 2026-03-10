import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCopilotToken, setCopilotCookie } from "@/lib/copilot-auth";
import { logAudit } from "@/lib/audit";
import { lifecycle } from "@/lib/email";

/**
 * OAuth callback handler.
 * In production, use next-auth providers or implement OAuth flow.
 * This endpoint handles the final step: creating/linking the user.
 *
 * SETUP:
 * 1. Add to .env:
 *    GOOGLE_CLIENT_ID=...
 *    GOOGLE_CLIENT_SECRET=...
 *    FACEBOOK_APP_ID=...
 *    FACEBOOK_APP_SECRET=...
 * 2. Configure OAuth redirect URIs in Google/Facebook console
 * 3. Install: npm install google-auth-library (for Google)
 */

// POST — handle OAuth user creation/linking
export async function POST(req: NextRequest) {
  try {
    const { provider, email, name, providerId, avatar } = await req.json();

    if (!provider || !email || !name) {
      return NextResponse.json({ error: "provider, email, name required" }, { status: 400 });
    }

    // Check if user exists
    let user = await prisma.clientUser.findUnique({ where: { email } });

    if (user) {
      // Existing user — check if suspended
      if (user.status !== "active") {
        return NextResponse.json({ error: `Account is ${user.status}` }, { status: 403 });
      }
      if (user.deletedAt) {
        return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
      }

      // Update last login
      await prisma.clientUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), ...(avatar && !user.avatar && { avatar }) },
      });

      await logAudit({
        actorId: user.id,
        actorEmail: email,
        actorType: "client",
        action: `oauth.login.${provider}`,
      });
    } else {
      // New user via OAuth
      user = await prisma.clientUser.create({
        data: {
          email,
          name,
          password: "", // OAuth users don't have a password
          avatar: avatar || null,
          emailVerified: true, // OAuth emails are pre-verified
          lastLoginAt: new Date(),
        },
      });

      await lifecycle.welcome(user.email, user.name);
      await lifecycle.trialStarted(user.email, user.name, String(user.trialMessageLimit));

      await logAudit({
        actorId: user.id,
        actorEmail: email,
        actorType: "client",
        action: `oauth.register.${provider}`,
        details: { provider, providerId },
      });
    }

    const token = await createCopilotToken({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    });
    await setCopilotCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    });
  } catch (err) {
    console.error("OAuth error:", err);
    return NextResponse.json({ error: "OAuth failed" }, { status: 500 });
  }
}

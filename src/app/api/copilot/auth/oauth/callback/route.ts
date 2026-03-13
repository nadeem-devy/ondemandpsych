import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCopilotToken, setCopilotCookie } from "@/lib/copilot-auth";
import { logAudit } from "@/lib/audit";
import { lifecycle } from "@/lib/email";

interface OAuthUser {
  email: string;
  name: string;
  avatar?: string;
  providerId: string;
}

// --- Token exchange configs ---

async function exchangeGoogle(code: string, redirectUri: string): Promise<OAuthUser> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenRes.json();
  if (tokens.error) throw new Error(tokens.error_description || tokens.error);

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await userRes.json();

  return {
    email: profile.email,
    name: profile.name,
    avatar: profile.picture,
    providerId: profile.id,
  };
}

async function exchangeLinkedIn(code: string, redirectUri: string): Promise<OAuthUser> {
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenRes.json();
  if (tokens.error) throw new Error(tokens.error_description || tokens.error);

  const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await userRes.json();

  return {
    email: profile.email,
    name: profile.name,
    avatar: profile.picture,
    providerId: profile.sub,
  };
}

async function exchangeFacebook(code: string, redirectUri: string): Promise<OAuthUser> {
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        code,
        client_id: process.env.FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        redirect_uri: redirectUri,
      })
  );
  const tokens = await tokenRes.json();
  if (tokens.error) throw new Error(tokens.error?.message || "Facebook token exchange failed");

  const userRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokens.access_token}`
  );
  const profile = await userRes.json();

  return {
    email: profile.email,
    name: profile.name,
    avatar: profile.picture?.data?.url,
    providerId: profile.id,
  };
}

const exchangers: Record<string, (code: string, redirectUri: string) => Promise<OAuthUser>> = {
  google: exchangeGoogle,
  linkedin: exchangeLinkedIn,
  facebook: exchangeFacebook,
};

// --- Callback handler ---

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");
  const origin = req.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/copilot/login?error=${encodeURIComponent(error)}`);
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(`${origin}/copilot/login?error=Missing+authorization+code`);
  }

  let provider: string;
  try {
    const state = JSON.parse(Buffer.from(stateParam, "base64url").toString());
    provider = state.provider;
  } catch {
    return NextResponse.redirect(`${origin}/copilot/login?error=Invalid+state`);
  }

  const exchanger = exchangers[provider];
  if (!exchanger) {
    return NextResponse.redirect(`${origin}/copilot/login?error=Unsupported+provider`);
  }

  try {
    const redirectUri = `${origin}/api/copilot/auth/oauth/callback`;
    const oauthUser = await exchanger(code, redirectUri);

    if (!oauthUser.email) {
      return NextResponse.redirect(
        `${origin}/copilot/login?error=${encodeURIComponent("No email returned from " + provider + ". Please use an account with an email address.")}`
      );
    }

    // Check if user exists
    let user = await prisma.clientUser.findUnique({ where: { email: oauthUser.email } });

    if (user) {
      if (user.status !== "active") {
        return NextResponse.redirect(
          `${origin}/copilot/login?error=${encodeURIComponent("Account is " + user.status)}`
        );
      }
      if (user.deletedAt) {
        return NextResponse.redirect(`${origin}/copilot/login?error=Account+deactivated`);
      }

      await prisma.clientUser.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          ...(oauthUser.avatar && !user.avatar && { avatar: oauthUser.avatar }),
        },
      });

      await logAudit({
        actorId: user.id,
        actorEmail: oauthUser.email,
        actorType: "client",
        action: `oauth.login.${provider}`,
      });
    } else {
      // New user via OAuth
      user = await prisma.clientUser.create({
        data: {
          email: oauthUser.email,
          name: oauthUser.name,
          password: "", // OAuth users don't have a password
          avatar: oauthUser.avatar || null,
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });

      await lifecycle.welcome(user.email, user.name);
      await lifecycle.trialStarted(user.email, user.name, String(user.trialMessageLimit));

      await logAudit({
        actorId: user.id,
        actorEmail: oauthUser.email,
        actorType: "client",
        action: `oauth.register.${provider}`,
        details: { provider, providerId: oauthUser.providerId },
      });
    }

    const token = await createCopilotToken({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    });
    await setCopilotCookie(token);

    return NextResponse.redirect(`${origin}/copilot/chat`);
  } catch (err) {
    console.error(`OAuth ${provider} callback error:`, err);
    return NextResponse.redirect(
      `${origin}/copilot/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`
    );
  }
}

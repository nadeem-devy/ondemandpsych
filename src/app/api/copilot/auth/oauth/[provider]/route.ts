import { NextRequest, NextResponse } from "next/server";

const PROVIDERS: Record<string, {
  authUrl: string;
  clientIdEnv: string;
  scopes: string;
}> = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    scopes: "openid email profile",
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    scopes: "openid profile email",
  },
  facebook: {
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    clientIdEnv: "FACEBOOK_APP_ID",
    scopes: "email public_profile",
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const config = PROVIDERS[provider];

  if (!config) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const clientId = process.env[config.clientIdEnv];
  if (!clientId) {
    return NextResponse.json({ error: `${provider} OAuth not configured` }, { status: 500 });
  }

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/copilot/auth/oauth/callback`;

  const state = Buffer.from(JSON.stringify({ provider })).toString("base64url");

  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scopes,
    state,
  });

  // Google-specific: prompt account selection
  if (provider === "google") {
    authParams.set("access_type", "offline");
    authParams.set("prompt", "select_account");
  }

  return NextResponse.redirect(`${config.authUrl}?${authParams.toString()}`);
}

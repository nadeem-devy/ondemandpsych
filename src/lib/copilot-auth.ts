import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "copilot-secret-key-change-me"
);
const COOKIE_NAME = "copilot-token";

export interface CopilotUser {
  id: string;
  email: string;
  name: string;
  plan: string;
}

export async function createCopilotToken(user: CopilotUser): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, name: user.name, plan: user.plan })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyCopilotToken(token: string): Promise<CopilotUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      plan: payload.plan as string,
    };
  } catch {
    return null;
  }
}

export async function getCopilotUser(): Promise<CopilotUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCopilotToken(token);
}

export async function getCopilotUserFull() {
  const user = await getCopilotUser();
  if (!user) return null;
  return prisma.clientUser.findUnique({ where: { id: user.id } });
}

export async function setCopilotCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearCopilotCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

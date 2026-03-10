import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// All available admin permissions
export const ALL_PERMISSIONS = [
  "dashboard",
  "users",
  "support",
  "audit",
  "plans",
  "billing",
  "content",
  "settings",
  "email_templates",
  "ip_allowlist",
  "sessions",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

/**
 * Check if the current admin has a specific permission.
 * Superadmins have all permissions.
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, permissions: true, isActive: true },
  });

  if (!user || !user.isActive) return false;
  if (user.role === "superadmin") return true;

  if (!user.permissions) return false;
  try {
    const perms: string[] = JSON.parse(user.permissions);
    return perms.includes(permission);
  } catch {
    return false;
  }
}

/**
 * Get all permissions for the current admin.
 */
export async function getPermissions(): Promise<Permission[]> {
  const session = await auth();
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, permissions: true, isActive: true },
  });

  if (!user || !user.isActive) return [];
  if (user.role === "superadmin") return [...ALL_PERMISSIONS];

  if (!user.permissions) return [];
  try {
    return JSON.parse(user.permissions) as Permission[];
  } catch {
    return [];
  }
}

import { prisma } from "@/lib/prisma";

interface AuditEntry {
  actorId: string;
  actorEmail: string;
  actorType: "admin" | "client";
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        actorEmail: entry.actorEmail,
        actorType: entry.actorType,
        action: entry.action,
        targetType: entry.targetType || null,
        targetId: entry.targetId || null,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

import { prisma } from "@/lib/prisma";

interface TrialCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  reason?: string;
}

/**
 * Check if a user can send a message based on their plan/trial status.
 * Free users get 10 messages (configurable per user).
 * Paid users have unlimited messages (or plan-based limits).
 */
export async function checkTrialLimit(userId: string): Promise<TrialCheckResult> {
  const user = await prisma.clientUser.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, remaining: 0, limit: 0, used: 0, reason: "User not found" };

  // Suspended or deactivated users can't send messages
  if (user.status !== "active") {
    return { allowed: false, remaining: 0, limit: user.trialMessageLimit, used: user.trialMessageCount, reason: "Account is " + user.status };
  }

  // Paid plans — allow (could add plan-specific limits later)
  if (user.plan !== "free") {
    return { allowed: true, remaining: -1, limit: -1, used: user.trialMessageCount };
  }

  // Free plan — enforce trial limit
  if (user.trialMessageCount >= user.trialMessageLimit) {
    return {
      allowed: false,
      remaining: 0,
      limit: user.trialMessageLimit,
      used: user.trialMessageCount,
      reason: `Trial limit reached (${user.trialMessageLimit} messages). Please upgrade your plan.`,
    };
  }

  return {
    allowed: true,
    remaining: user.trialMessageLimit - user.trialMessageCount,
    limit: user.trialMessageLimit,
    used: user.trialMessageCount,
  };
}

/**
 * Increment the trial message count for a user.
 */
export async function incrementTrialCount(userId: string): Promise<void> {
  await prisma.clientUser.update({
    where: { id: userId },
    data: { trialMessageCount: { increment: 1 } },
  });
}

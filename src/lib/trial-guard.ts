import { prisma } from "@/lib/prisma";

interface TrialCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  reason?: string;
  plan?: string;
}

/**
 * Plan-based category access mapping.
 * Each plan includes all categories from lower tiers plus its own.
 */
const BASIC_CATEGORIES = [
  "appsanddevices",
  "treatmentprotocol",
  "medication",
  "sideeffects",
  "labmonitoring",
  "tapering",
  "diagnosis",
  "patienteducation",
  "psychotherapy",
  "mentalstatusexam",
  "assessment",
  "ratingscales",
  "erdisposition",
  "questions",
  "teachingpoints",
  "references",
  "generalinformation",
  "dietaryandherbals",
  "links",
];

const ADVANCED_CATEGORIES = [
  ...BASIC_CATEGORIES,
  "billingandcoding",
  "complexcases",
  "documentation",
  "druginteractions",
  "guidelines",
  "letters",
  "nofdaapproved",
  "preauthorization",
  "riskassessment",
  "somaticorinvasiveinterventions",
  "functionalimpairmentanddisabilitysupport",
  "ethicalandlegal",
  "settings",
];

const PREMIUM_CATEGORIES = [
  ...ADVANCED_CATEGORIES,
  "drugseekingbehavior",
  "miscellaneousquestions",
  "summary",
  "finalrecommendation",
];

/**
 * Get allowed categories for a plan.
 */
export function getAllowedCategories(plan: string): string[] | null {
  switch (plan) {
    case "basic":
      return BASIC_CATEGORIES;
    case "advanced":
      return ADVANCED_CATEGORIES;
    case "premium":
      return null; // null = all categories allowed
    case "free":
      return BASIC_CATEGORIES; // free users get basic categories during trial
    default:
      return BASIC_CATEGORIES;
  }
}

/**
 * Check if a user can send a message based on their plan/trial status.
 * Free users get limited messages.
 * Paid users with cancelled/past_due subscriptions are treated as free.
 */
export async function checkTrialLimit(userId: string): Promise<TrialCheckResult> {
  const user = await prisma.clientUser.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, remaining: 0, limit: 0, used: 0, reason: "User not found" };

  // Suspended or deactivated users can't send messages
  if (user.status !== "active") {
    return { allowed: false, remaining: 0, limit: user.trialMessageLimit, used: user.trialMessageCount, reason: "Account is " + user.status };
  }

  // Determine effective plan — cancelled subscriptions revert to free
  let effectivePlan = user.plan;
  if (user.plan !== "free" && (user.subscriptionStatus === "cancelled" || user.subscriptionStatus === "past_due")) {
    effectivePlan = "free";
  }

  // Paid plans with active subscription — allow unlimited
  if (effectivePlan !== "free") {
    return { allowed: true, remaining: -1, limit: -1, used: user.trialMessageCount, plan: effectivePlan };
  }

  // Free plan — enforce trial limit
  if (user.trialMessageCount >= user.trialMessageLimit) {
    return {
      allowed: false,
      remaining: 0,
      limit: user.trialMessageLimit,
      used: user.trialMessageCount,
      reason: `Trial limit reached (${user.trialMessageLimit} messages). Please upgrade your plan.`,
      plan: "free",
    };
  }

  return {
    allowed: true,
    remaining: user.trialMessageLimit - user.trialMessageCount,
    limit: user.trialMessageLimit,
    used: user.trialMessageCount,
    plan: "free",
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

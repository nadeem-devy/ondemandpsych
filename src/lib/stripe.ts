import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { lifecycle } from "@/lib/email";

/**
 * Stripe integration utilities.
 *
 * SETUP REQUIRED:
 * 1. Install stripe: npm install stripe
 * 2. Add to .env:
 *    STRIPE_SECRET_KEY=sk_test_...
 *    STRIPE_WEBHOOK_SECRET=whsec_...
 *    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
 * 3. Create products/prices in Stripe Dashboard
 * 4. Map Stripe price IDs to plan names below
 */

// Map Stripe price IDs to internal plan names
const PRICE_TO_PLAN: Record<string, string> = {
  "price_1SUlcJCuglc1gqdzqw0rgRhC": "basic",
  "price_1SUlcJCuglc1gqdzSfXMx0Yt": "basic",
  "price_1SUlcFCuglc1gqdzvu0Ud3mD": "advanced",
  "price_1SUlcFCuglc1gqdzTFcM6P7G": "advanced",
  "price_1SUlc9Cuglc1gqdzZUk4vxnX": "premium",
  "price_1SUlc9Cuglc1gqdzjBleSN7r": "premium",
};

const PLAN_TO_PRICE: Record<string, { monthly: string; yearly: string }> = {
  basic: { monthly: "price_1SUlcJCuglc1gqdzqw0rgRhC", yearly: "price_1SUlcJCuglc1gqdzSfXMx0Yt" },
  advanced: { monthly: "price_1SUlcFCuglc1gqdzvu0Ud3mD", yearly: "price_1SUlcFCuglc1gqdzTFcM6P7G" },
  premium: { monthly: "price_1SUlc9Cuglc1gqdzZUk4vxnX", yearly: "price_1SUlc9Cuglc1gqdzjBleSN7r" },
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn("STRIPE_SECRET_KEY not configured");
    return null;
  }
  // Dynamic import to avoid errors when stripe isn't installed
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require("stripe");
    return new Stripe(key, { apiVersion: "2024-12-18.acacia" });
  } catch {
    console.warn("Stripe package not installed. Run: npm install stripe");
    return null;
  }
}

/**
 * Create a Stripe checkout session for a plan upgrade.
 */
export async function createCheckoutSession(params: {
  userId: string;
  email: string;
  planName: string;
  interval: "monthly" | "yearly";
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  if (!stripe) return { error: "Stripe not configured" };

  const priceConfig = PLAN_TO_PRICE[params.planName];
  if (!priceConfig) return { error: "Invalid plan" };

  const priceId = priceConfig[params.interval];

  // Get or create Stripe customer
  let user = await prisma.clientUser.findUnique({ where: { id: params.userId } });
  if (!user) return { error: "User not found" };

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: params.email,
      metadata: { userId: params.userId },
    });
    customerId = customer.id;
    await prisma.clientUser.update({
      where: { id: params.userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { userId: params.userId, planName: params.planName },
  });

  return { url: session.url, sessionId: session.id };
}

/**
 * Handle Stripe webhook events.
 */
export async function handleWebhookEvent(event: {
  type: string;
  data: { object: Record<string, unknown> };
}) {
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const userId = (obj.metadata as Record<string, string>)?.userId;
      const planName = (obj.metadata as Record<string, string>)?.planName;
      const subId = obj.subscription as string;
      const customerId = obj.customer as string;

      if (userId && planName) {
        const user = await prisma.clientUser.update({
          where: { id: userId },
          data: {
            plan: planName,
            subscriptionStatus: "active",
            stripeCustomerId: customerId,
            stripeSubId: subId,
          },
        });

        await prisma.transaction.create({
          data: {
            userId,
            type: "subscription",
            amount: (obj.amount_total as number || 0) / 100,
            status: "completed",
            planName,
            stripePaymentId: obj.payment_intent as string,
            description: `Subscribed to ${planName} plan`,
          },
        });

        await logAudit({
          actorId: userId,
          actorEmail: user.email,
          actorType: "client",
          action: "subscription.created",
          targetType: "ClientUser",
          targetId: userId,
          details: { plan: planName },
        });

        await lifecycle.subscriptionCreated(user.email, user.name, planName);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const customerId = obj.customer as string;
      const user = await prisma.clientUser.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (user) {
        await prisma.clientUser.update({
          where: { id: user.id },
          data: { subscriptionStatus: "active" },
        });

        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: "subscription",
            amount: (obj.amount_paid as number || 0) / 100,
            status: "completed",
            planName: user.plan,
            stripePaymentId: obj.payment_intent as string,
            description: `Payment for ${user.plan} plan`,
          },
        });

        await lifecycle.subscriptionRenewed(user.email, user.name, user.plan);
      }
      break;
    }

    case "invoice.payment_failed": {
      const customerId = obj.customer as string;
      const user = await prisma.clientUser.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (user) {
        await prisma.clientUser.update({
          where: { id: user.id },
          data: { subscriptionStatus: "past_due" },
        });

        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: "subscription",
            amount: (obj.amount_due as number || 0) / 100,
            status: "failed",
            planName: user.plan,
            description: "Payment failed",
          },
        });

        await lifecycle.paymentFailed(user.email, user.name, `$${((obj.amount_due as number || 0) / 100).toFixed(2)}`);

        await logAudit({
          actorId: "system",
          actorEmail: "system",
          actorType: "admin",
          action: "payment.failed",
          targetType: "ClientUser",
          targetId: user.id,
          details: { email: user.email, amount: obj.amount_due },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const customerId = obj.customer as string;
      const user = await prisma.clientUser.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (user) {
        await prisma.clientUser.update({
          where: { id: user.id },
          data: { plan: "free", subscriptionStatus: "cancelled", stripeSubId: null },
        });

        await lifecycle.subscriptionCancelled(user.email, user.name);

        await logAudit({
          actorId: "system",
          actorEmail: "system",
          actorType: "admin",
          action: "subscription.cancelled",
          targetType: "ClientUser",
          targetId: user.id,
          details: { email: user.email },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const customerId = obj.customer as string;
      const status = obj.status as string;
      const user = await prisma.clientUser.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (user) {
        const items = obj.items as { data?: Array<{ price?: { id: string } }> };
        const priceId = items?.data?.[0]?.price?.id;
        const newPlan = priceId ? PRICE_TO_PLAN[priceId] : undefined;

        await prisma.clientUser.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: status === "active" ? "active" : status === "past_due" ? "past_due" : "cancelled",
            ...(newPlan && { plan: newPlan }),
          },
        });
      }
      break;
    }
  }
}

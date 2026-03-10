import { prisma } from "@/lib/prisma";

/**
 * Email sending utility.
 * In production, replace the sendEmail function body with your email provider
 * (SendGrid, Resend, AWS SES, etc.)
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email. Currently logs to console.
 * Replace with actual email service in production.
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // TODO: Replace with actual email service (SendGrid, Resend, AWS SES)
    console.log("📧 EMAIL SENT (dev mode):");
    console.log(`  To: ${params.to}`);
    console.log(`  Subject: ${params.subject}`);
    console.log(`  Body length: ${params.html.length} chars`);
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

/**
 * Send a templated email by slug, replacing {{variables}}.
 */
export async function sendTemplateEmail(
  slug: string,
  to: string,
  variables: Record<string, string>
): Promise<boolean> {
  const template = await prisma.emailTemplate.findUnique({
    where: { slug },
  });

  if (!template || !template.isActive) {
    console.warn(`Email template "${slug}" not found or inactive`);
    return false;
  }

  let subject = template.subject;
  let body = template.body;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  }

  return sendEmail({ to, subject, html: body });
}

/**
 * Send lifecycle emails.
 */
export const lifecycle = {
  async welcome(email: string, name: string) {
    return sendTemplateEmail("welcome", email, { name, email });
  },

  async passwordReset(email: string, name: string, otp: string) {
    return sendTemplateEmail("password_reset", email, { name, otp });
  },

  async otpVerification(email: string, name: string, otp: string) {
    return sendTemplateEmail("otp_verification", email, { name, otp });
  },

  async trialStarted(email: string, name: string, limit: string) {
    return sendTemplateEmail("trial_started", email, { name, limit });
  },

  async trialEnding(email: string, name: string, remaining: string) {
    return sendTemplateEmail("trial_ending", email, { name, remaining });
  },

  async trialEnded(email: string, name: string) {
    return sendTemplateEmail("trial_ended", email, { name });
  },

  async subscriptionCreated(email: string, name: string, plan: string) {
    return sendTemplateEmail("subscription_created", email, { name, plan });
  },

  async subscriptionRenewed(email: string, name: string, plan: string) {
    return sendTemplateEmail("subscription_renewed", email, { name, plan });
  },

  async subscriptionPastDue(email: string, name: string) {
    return sendTemplateEmail("subscription_past_due", email, { name });
  },

  async subscriptionCancelled(email: string, name: string) {
    return sendTemplateEmail("subscription_cancelled", email, { name });
  },

  async paymentFailed(email: string, name: string, amount: string) {
    return sendTemplateEmail("payment_failed", email, { name, amount });
  },

  async invoiceReceipt(email: string, name: string, amount: string, date: string) {
    return sendTemplateEmail("invoice_receipt", email, { name, amount, date });
  },
};

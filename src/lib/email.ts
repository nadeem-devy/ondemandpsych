import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY not set — email not sent");
      return false;
    }

    await sgMail.send({
      to: params.to,
      from: {
        email: process.env.MAIL_FROM_ADDRESS || "support@mtppsychiatry.com",
        name: process.env.MAIL_FROM_NAME || "OnDemandPsych",
      },
      subject: params.subject,
      html: params.html,
    });

    console.log(`Email sent to ${params.to}: ${params.subject}`);
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

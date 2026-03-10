import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  { slug: "welcome", name: "Welcome Email", subject: "Welcome to OnDemandPsych, {{name}}!", body: "<h1>Welcome, {{name}}!</h1><p>Thank you for joining OnDemandPsych Clinical Co-Pilot. You now have access to our AI-powered psychiatric clinical decision support tools.</p><p>Your trial includes {{limit}} free messages to explore the platform.</p>" },
  { slug: "password_reset", name: "Password Reset", subject: "Password Reset — OnDemandPsych", body: "<h1>Password Reset</h1><p>Hi {{name}},</p><p>Your password has been reset. Your new temporary password is: <strong>{{otp}}</strong></p><p>Please log in and change your password immediately.</p>" },
  { slug: "otp_verification", name: "OTP Verification", subject: "Your Verification Code — {{otp}}", body: "<h1>Verification Code</h1><p>Hi {{name}},</p><p>Your verification code is: <strong>{{otp}}</strong></p><p>This code expires in 10 minutes.</p>" },
  { slug: "trial_started", name: "Trial Started", subject: "Your Free Trial Has Started!", body: "<h1>Trial Activated</h1><p>Hi {{name}},</p><p>Your free trial of {{limit}} messages has been activated. Explore our clinical co-pilot features and upgrade anytime.</p>" },
  { slug: "trial_ending", name: "Trial Ending", subject: "Your Trial is Ending Soon", body: "<h1>Trial Ending Soon</h1><p>Hi {{name}},</p><p>You have {{remaining}} messages remaining in your free trial. Upgrade now to continue using OnDemandPsych.</p>" },
  { slug: "trial_ended", name: "Trial Ended", subject: "Your Free Trial Has Ended", body: "<h1>Trial Complete</h1><p>Hi {{name}},</p><p>Your free trial has ended. Upgrade to a paid plan to continue using OnDemandPsych Clinical Co-Pilot.</p>" },
  { slug: "subscription_created", name: "Subscription Created", subject: "Welcome to {{plan}} Plan!", body: "<h1>Subscription Confirmed</h1><p>Hi {{name}},</p><p>You've been upgraded to the <strong>{{plan}}</strong> plan. Thank you for choosing OnDemandPsych!</p>" },
  { slug: "subscription_renewed", name: "Subscription Renewed", subject: "Subscription Renewed — {{plan}}", body: "<p>Hi {{name}},</p><p>Your {{plan}} subscription has been renewed successfully.</p>" },
  { slug: "subscription_past_due", name: "Subscription Past Due", subject: "Payment Issue — Action Required", body: "<h1>Payment Issue</h1><p>Hi {{name}},</p><p>We were unable to process your subscription payment. Please update your payment method to avoid service interruption.</p>" },
  { slug: "subscription_cancelled", name: "Subscription Cancelled", subject: "Subscription Cancelled", body: "<p>Hi {{name}},</p><p>Your subscription has been cancelled. You can resubscribe anytime.</p>" },
  { slug: "payment_failed", name: "Payment Failed", subject: "Payment Failed — {{amount}}", body: "<h1>Payment Failed</h1><p>Hi {{name}},</p><p>Your payment of {{amount}} has failed. Please update your payment method.</p>" },
  { slug: "invoice_receipt", name: "Invoice Receipt", subject: "Receipt — {{amount}} on {{date}}", body: "<p>Hi {{name}},</p><p>Your payment of {{amount}} on {{date}} has been processed. Thank you!</p>" },
];

async function main() {
  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }
  console.log(`Seeded ${templates.length} email templates`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

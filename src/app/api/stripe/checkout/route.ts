import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { getCopilotUser } from "@/lib/copilot-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCopilotUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planName, interval } = await req.json();

    if (!planName || !interval) {
      return NextResponse.json({ error: "planName and interval required" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://ondemandpsych.com";

    const result = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      planName,
      interval,
      successUrl: `${origin}/copilot/chat?upgraded=true`,
      cancelUrl: `${origin}/copilot/subscription?cancelled=true`,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveDetectedSubscriptions } from "@/lib/classification/subscriptions";
import { getSubscriptionSpend } from "@/lib/analytics/engine";

export async function GET() {
  const data = await getSubscriptionSpend();
  return NextResponse.json(data);
}

export async function POST() {
  try {
    const detected = await saveDetectedSubscriptions();
    return NextResponse.json({ message: "Detection complete", detected });
  } catch (error) {
    console.error("Subscription detection error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Detection failed" },
      { status: 500 }
    );
  }
}

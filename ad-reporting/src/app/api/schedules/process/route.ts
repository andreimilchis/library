import { NextRequest, NextResponse } from "next/server";
import { SchedulerService } from "@/services/scheduler";

// This endpoint is meant to be called by a cron job
// e.g., via Vercel Cron, Railway Cron, or external service
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scheduler = new SchedulerService();
    const result = await scheduler.processScheduledReports();

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

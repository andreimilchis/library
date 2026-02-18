import { NextRequest, NextResponse } from "next/server";
import { SchedulerService } from "@/services/scheduler";

async function processSchedules(request: NextRequest) {
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

// Vercel Cron sends GET requests
export async function GET(request: NextRequest) {
  return processSchedules(request);
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return processSchedules(request);
}

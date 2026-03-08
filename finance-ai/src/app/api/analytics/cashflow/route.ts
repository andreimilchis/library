import { NextRequest, NextResponse } from "next/server";
import { getDailySpend, getMonthlyTrend } from "@/lib/analytics/engine";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const view = searchParams.get("view") || "daily";

  if (view === "monthly") {
    const months = parseInt(searchParams.get("months") || "12");
    const data = await getMonthlyTrend(months);
    return NextResponse.json({ view: "monthly", data });
  }

  const days = parseInt(searchParams.get("days") || "30");
  const data = await getDailySpend(days);
  return NextResponse.json({ view: "daily", data });
}

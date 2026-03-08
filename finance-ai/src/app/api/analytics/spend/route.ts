import { NextRequest, NextResponse } from "next/server";
import { getFinancialOverview, getSpendByCategory, getDailySpend, getMonthlyTrend, getTopMerchants } from "@/lib/analytics/engine";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "overview";
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

  switch (type) {
    case "overview":
      return NextResponse.json(await getFinancialOverview(from, to));
    case "categories":
      return NextResponse.json(await getSpendByCategory(from, to));
    case "daily":
      return NextResponse.json(await getDailySpend(parseInt(searchParams.get("days") || "30")));
    case "monthly":
      return NextResponse.json(await getMonthlyTrend(parseInt(searchParams.get("months") || "6")));
    case "merchants":
      return NextResponse.json(await getTopMerchants(parseInt(searchParams.get("limit") || "10"), from, to));
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSpendByCategory } from "@/lib/analytics/engine";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

  const categories = await getSpendByCategory(from, to);
  return NextResponse.json({ categories });
}

import { requireAuth } from "@/lib/auth";
import { DataSyncService } from "@/services/data-sync";
import { AdPlatform } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);

    const clientId = searchParams.get("clientId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const platform = searchParams.get("platform") as AdPlatform | null;
    const groupBy =
      (searchParams.get("groupBy") as "day" | "campaign" | "platform") || "day";

    if (!clientId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "clientId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const syncService = new DataSyncService();
    const metrics = await syncService.getAggregatedMetrics(
      clientId,
      new Date(startDate),
      new Date(endDate),
      platform || undefined,
      groupBy
    );

    return NextResponse.json({ metrics });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

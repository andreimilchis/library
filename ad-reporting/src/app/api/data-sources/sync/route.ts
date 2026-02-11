import { requireAuth } from "@/lib/auth";
import { DataSyncService } from "@/services/data-sync";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { dataSourceId, clientId, startDate, endDate } = body;

    const syncService = new DataSyncService();

    if (clientId) {
      const results = await syncService.syncAllClientSources(
        clientId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      return NextResponse.json({ results });
    }

    if (dataSourceId) {
      const result = await syncService.syncDataSource(
        dataSourceId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "dataSourceId or clientId required" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      client: { agencyId: session.agencyId! },
    };

    if (clientId) {
      where.clientId = clientId;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        _count: { select: { widgets: true, deliveryLogs: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Verify client ownership
    const client = await prisma.client.findFirst({
      where: { id: body.clientId, agencyId: session.agencyId! },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        title: body.title,
        description: body.description,
        clientId: body.clientId,
        dateRangeStart: new Date(body.dateRangeStart),
        dateRangeEnd: new Date(body.dateRangeEnd),
        compareStart: body.compareStart
          ? new Date(body.compareStart)
          : undefined,
        compareEnd: body.compareEnd ? new Date(body.compareEnd) : undefined,
        templateId: body.templateId,
        createdById: session.id,
      },
    });

    // Create widgets if provided
    if (body.widgets && Array.isArray(body.widgets)) {
      await prisma.reportWidget.createMany({
        data: body.widgets.map(
          (
            w: {
              type: string;
              title?: string;
              metrics?: string[];
              chartType?: string;
              position?: number;
              width?: number;
              height?: number;
              config?: Record<string, unknown>;
              dataSourceId?: string;
            },
            index: number
          ) => ({
            reportId: report.id,
            type: w.type,
            title: w.title,
            metrics: w.metrics || [],
            chartType: w.chartType,
            position: w.position || index,
            width: w.width || 12,
            height: w.height || 300,
            config: w.config,
            dataSourceId: w.dataSourceId,
          })
        ),
      });
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

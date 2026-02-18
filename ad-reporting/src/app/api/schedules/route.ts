import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { SchedulerService } from "@/services/scheduler";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireAuth();

    const schedules = await prisma.schedule.findMany({
      where: { client: { agencyId: session.agencyId! } },
      include: {
        client: { select: { id: true, name: true, email: true } },
        _count: { select: { deliveryLogs: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ schedules });
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

    const schedulerService = new SchedulerService();
    const nextRunAt = schedulerService.calculateNextRun({
      frequency: body.frequency,
      dayOfWeek: body.dayOfWeek ?? null,
      dayOfMonth: body.dayOfMonth ?? null,
      hour: body.hour ?? 9,
      minute: body.minute ?? 0,
    });

    const schedule = await prisma.schedule.create({
      data: {
        name: body.name,
        frequency: body.frequency,
        dayOfWeek: body.dayOfWeek,
        dayOfMonth: body.dayOfMonth,
        hour: body.hour || 9,
        minute: body.minute || 0,
        timezone: body.timezone || "Europe/Bucharest",
        clientId: body.clientId,
        createdById: session.id,
        templateId: body.templateId,
        recipients: body.recipients || [client.email],
        dateRangeType: body.dateRangeType || "LAST_7_DAYS",
        nextRunAt,
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

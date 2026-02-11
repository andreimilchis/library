import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireAuth();

    const clients = await prisma.client.findMany({
      where: { agencyId: session.agencyId! },
      include: {
        dataSources: {
          select: {
            id: true,
            platform: true,
            accountName: true,
            isActive: true,
            lastSyncAt: true,
          },
        },
        _count: {
          select: { reports: true, schedules: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ clients });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const client = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        companyName: body.companyName,
        website: body.website,
        industry: body.industry || "E-commerce",
        notes: body.notes,
        agencyId: session.agencyId!,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

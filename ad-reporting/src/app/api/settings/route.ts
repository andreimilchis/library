import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireAuth();

    if (!session.agencyId) {
      return NextResponse.json({ error: "No agency" }, { status: 404 });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: session.agencyId },
    });

    return NextResponse.json({ agency });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!session.agencyId || !["OWNER", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const agency = await prisma.agency.update({
      where: { id: session.agencyId },
      data: {
        name: body.name,
        logoUrl: body.logoUrl,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        customDomain: body.customDomain,
        emailFromName: body.emailFromName,
        emailFromAddress: body.emailFromAddress,
        smtpHost: body.smtpHost,
        smtpPort: body.smtpPort,
        smtpUser: body.smtpUser,
        smtpPass: body.smtpPass,
      },
    });

    return NextResponse.json({ agency });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

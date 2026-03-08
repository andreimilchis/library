import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";

  const alerts = await prisma.alert.findMany({
    where: unreadOnly ? { isRead: false } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ alerts });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, isRead } = body;

  if (id === "all") {
    await prisma.alert.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  } else if (id) {
    await prisma.alert.update({
      where: { id },
      data: { isRead: isRead ?? true },
    });
  }

  return NextResponse.json({ message: "Updated" });
}

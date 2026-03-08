import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

// POST /api/documents/[id]/remind - Send reminder to pending signers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: {
      id,
      userId: session.user.id,
      status: "PENDING",
    },
    include: {
      signers: {
        where: { status: "PENDING" },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const senderName = session.user.name || "NETkyu";

  for (const signer of document.signers) {
    try {
      await sendReminderEmail(
        signer.name,
        signer.email,
        document.name,
        signer.signingToken,
        senderName
      );

      await prisma.documentAuditLog.create({
        data: {
          documentId: document.id,
          signerId: signer.id,
          action: "Reminder sent",
          details: `Reminder email sent to ${signer.email}`,
        },
      });
    } catch (error) {
      console.error(`Failed to send reminder to ${signer.email}:`, error);
    }
  }

  return NextResponse.json({ sent: document.signers.length });
}

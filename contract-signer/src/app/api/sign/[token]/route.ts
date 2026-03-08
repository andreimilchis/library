import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCompletionEmail } from "@/lib/email";

// GET /api/sign/[token] - Get signing data for a token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const signer = await prisma.documentSigner.findUnique({
    where: { signingToken: token },
    include: {
      document: {
        select: {
          id: true,
          name: true,
          originalPdfUrl: true,
        },
      },
      fields: {
        select: {
          id: true,
          type: true,
          page: true,
          posX: true,
          posY: true,
          width: true,
          height: true,
          value: true,
          required: true,
          placeholder: true,
        },
      },
    },
  });

  if (!signer) {
    return NextResponse.json(
      { error: "Invalid signing link" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    document: signer.document,
    signer: {
      id: signer.id,
      name: signer.name,
      email: signer.email,
      status: signer.status,
    },
    fields: signer.fields,
  });
}

// POST /api/sign/[token] - Submit signatures
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const { fieldValues } = body as { fieldValues: Record<string, string> };

  const signer = await prisma.documentSigner.findUnique({
    where: { signingToken: token },
    include: {
      document: {
        include: {
          user: { select: { name: true, email: true } },
          signers: true,
        },
      },
      fields: true,
    },
  });

  if (!signer) {
    return NextResponse.json(
      { error: "Invalid signing link" },
      { status: 404 }
    );
  }

  if (signer.status === "SIGNED") {
    return NextResponse.json(
      { error: "Already signed" },
      { status: 400 }
    );
  }

  // Get IP address
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  // Update field values
  for (const field of signer.fields) {
    const value = fieldValues[field.id];
    if (value) {
      await prisma.documentField.update({
        where: { id: field.id },
        data: { value },
      });
    }
  }

  // Mark signer as signed
  await prisma.documentSigner.update({
    where: { id: signer.id },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signerIp: ip,
    },
  });

  // Create audit log
  await prisma.documentAuditLog.create({
    data: {
      documentId: signer.document.id,
      signerId: signer.id,
      action: "Document signed",
      details: `${signer.name} (${signer.email}) signed the document`,
      ipAddress: ip,
      userAgent,
    },
  });

  // Check if all signers have signed
  const allSigners = signer.document.signers;
  const otherPending = allSigners.filter(
    (s) => s.id !== signer.id && s.status === "PENDING"
  );

  if (otherPending.length === 0) {
    // All signers have signed - mark document as completed
    await prisma.document.update({
      where: { id: signer.document.id },
      data: { status: "COMPLETED" },
    });

    await prisma.documentAuditLog.create({
      data: {
        documentId: signer.document.id,
        action: "Document completed",
        details: "All signers have signed the document",
      },
    });

    // Notify the sender
    try {
      await sendCompletionEmail(
        signer.document.user.email,
        signer.document.user.name,
        signer.document.name,
        signer.document.id
      );
    } catch (error) {
      console.error("Failed to send completion email:", error);
    }
  }

  return NextResponse.json({ success: true });
}

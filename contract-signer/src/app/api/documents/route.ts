import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { sendSigningEmail } from "@/lib/email";

// GET /api/documents - List all documents for the current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    include: {
      signers: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

// POST /api/documents - Create a new document and send for signing
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const message = (formData.get("message") as string) || null;
  const signersJson = formData.get("signers") as string;
  const fieldsJson = formData.get("fields") as string;

  if (!file || !name || !signersJson || !fieldsJson) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const signers = JSON.parse(signersJson) as {
    id: string;
    name: string;
    email: string;
    isSelf?: boolean;
  }[];
  const fields = JSON.parse(fieldsJson) as {
    id: string;
    type: string;
    signerId: string;
    page: number;
    posX: number;
    posY: number;
    width: number;
    height: number;
    value?: string;
  }[];

  // Upload file
  const buffer = Buffer.from(await file.arrayBuffer());
  const pdfUrl = await uploadFile(buffer, file.name);

  // Create document with signers and fields
  const document = await prisma.document.create({
    data: {
      name,
      status: "PENDING",
      originalPdfUrl: pdfUrl,
      message,
      userId: session.user.id,
      signers: {
        create: signers.map((s, i) => ({
          name: s.name,
          email: s.email,
          order: i,
          // Self-signer is immediately SIGNED
          status: s.isSelf ? "SIGNED" : "PENDING",
          signedAt: s.isSelf ? new Date() : undefined,
        })),
      },
    },
    include: {
      signers: true,
    },
  });

  // Create mapping from client-side signer IDs to database signer IDs
  // Sort DB signers by order to match the input array (Prisma include doesn't guarantee order)
  const sortedDbSigners = [...document.signers].sort((a, b) => a.order - b.order);
  const signerIdMap = new Map<string, string>();
  signers.forEach((clientSigner, i) => {
    signerIdMap.set(clientSigner.id, sortedDbSigners[i].id);
  });

  // Create fields with correct signer IDs and pre-filled values for self-signer
  if (fields.length > 0) {
    await prisma.documentField.createMany({
      data: fields.map((f) => {
        const clientSigner = signers.find((s) => s.id === f.signerId);
        return {
          documentId: document.id,
          signerId: signerIdMap.get(f.signerId) || document.signers[0].id,
          type: f.type as "SIGNATURE" | "INITIALS" | "DATE_SIGNED" | "FULL_NAME" | "EMAIL" | "COMPANY" | "TITLE" | "TEXT",
          page: f.page,
          posX: f.posX,
          posY: f.posY,
          width: f.width,
          height: f.height,
          // Pre-fill value for self-signer fields
          value: clientSigner?.isSelf ? (f.value || null) : null,
        };
      }),
    });
  }

  // Create audit log
  await prisma.documentAuditLog.create({
    data: {
      documentId: document.id,
      action: "Document created",
      details: `Sent to ${signers.length} signer(s) for signature`,
    },
  });

  // Handle self-signer audit log
  const selfSigner = signers.find((s) => s.isSelf);
  if (selfSigner) {
    const dbSelfSigner = document.signers.find(
      (s) => s.id === signerIdMap.get(selfSigner.id)
    );
    if (dbSelfSigner) {
      await prisma.documentAuditLog.create({
        data: {
          documentId: document.id,
          signerId: dbSelfSigner.id,
          action: "Document signed",
          details: `${selfSigner.name} (sender) signed the document`,
        },
      });
    }
  }

  // Send signing emails (skip self-signer)
  const senderName = session.user.name || "NETkyu";
  for (let i = 0; i < signers.length; i++) {
    const clientSigner = signers[i];
    const dbSigner = sortedDbSigners[i];

    // Skip sending email to self-signer
    if (clientSigner.isSelf) continue;

    try {
      await sendSigningEmail(
        dbSigner.name,
        dbSigner.email,
        name,
        dbSigner.signingToken,
        senderName,
        message || undefined
      );

      await prisma.documentAuditLog.create({
        data: {
          documentId: document.id,
          signerId: dbSigner.id,
          action: "Signing email sent",
          details: `Email sent to ${dbSigner.email}`,
        },
      });
    } catch (error) {
      console.error(`Failed to send email to ${dbSigner.email}:`, error);
      await prisma.documentAuditLog.create({
        data: {
          documentId: document.id,
          signerId: dbSigner.id,
          action: "Email delivery failed",
          details: `Failed to send email to ${dbSigner.email}`,
        },
      });
    }
  }

  // Check if all signers are already signed (e.g., only self-signer)
  const pendingSigners = document.signers.filter((s) => s.status === "PENDING");
  if (pendingSigners.length === 0) {
    // All signed - complete document
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "COMPLETED" },
    });

    await prisma.documentAuditLog.create({
      data: {
        documentId: document.id,
        action: "Document completed",
        details: "All signers have signed the document",
      },
    });

    // Generate signed PDF
    try {
      const { generateSignedPdf } = await import("@/lib/pdf-generator");
      await generateSignedPdf(document.id);
    } catch (error) {
      console.error("Failed to generate signed PDF:", error);
    }
  }

  return NextResponse.json({ id: document.id });
}

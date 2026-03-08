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
          status: "PENDING",
        })),
      },
    },
    include: {
      signers: true,
    },
  });

  // Create mapping from client-side signer IDs to database signer IDs
  const signerIdMap = new Map<string, string>();
  signers.forEach((clientSigner, i) => {
    signerIdMap.set(clientSigner.id, document.signers[i].id);
  });

  // Create fields with correct signer IDs
  if (fields.length > 0) {
    await prisma.documentField.createMany({
      data: fields.map((f) => ({
        documentId: document.id,
        signerId: signerIdMap.get(f.signerId) || document.signers[0].id,
        type: f.type as "SIGNATURE" | "INITIALS" | "DATE_SIGNED" | "FULL_NAME" | "EMAIL" | "COMPANY" | "TITLE" | "TEXT",
        page: f.page,
        posX: f.posX,
        posY: f.posY,
        width: f.width,
        height: f.height,
      })),
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

  // Send signing emails
  const senderName = session.user.name || "NETkyu";
  for (const signer of document.signers) {
    try {
      await sendSigningEmail(
        signer.name,
        signer.email,
        name,
        signer.signingToken,
        senderName,
        message || undefined
      );

      await prisma.documentAuditLog.create({
        data: {
          documentId: document.id,
          signerId: signer.id,
          action: "Signing email sent",
          details: `Email sent to ${signer.email}`,
        },
      });
    } catch (error) {
      console.error(`Failed to send email to ${signer.email}:`, error);
      await prisma.documentAuditLog.create({
        data: {
          documentId: document.id,
          signerId: signer.id,
          action: "Email delivery failed",
          details: `Failed to send email to ${signer.email}`,
        },
      });
    }
  }

  return NextResponse.json({ id: document.id });
}

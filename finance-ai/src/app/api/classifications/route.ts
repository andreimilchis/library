import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { classifyPendingTransactions } from "@/lib/classification/engine";

export async function GET() {
  const pendingCount = await prisma.transaction.count({
    where: { classificationStatus: "PENDING" },
  });
  const needsReviewCount = await prisma.transaction.count({
    where: { classificationStatus: "NEEDS_REVIEW" },
  });
  const classifiedCount = await prisma.transaction.count({
    where: { classificationStatus: "CLASSIFIED" },
  });

  return NextResponse.json({
    pending: pendingCount,
    needsReview: needsReviewCount,
    classified: classifiedCount,
    total: pendingCount + needsReviewCount + classifiedCount,
  });
}

export async function POST() {
  try {
    const classified = await classifyPendingTransactions();
    return NextResponse.json({ message: "Classification complete", classified });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Classification failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { transactionId, categoryId } = body;

  if (!transactionId || !categoryId) {
    return NextResponse.json({ error: "transactionId and categoryId required" }, { status: 400 });
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      categoryId,
      classificationStatus: "MANUAL",
    },
  });

  return NextResponse.json({ message: "Classification updated" });
}

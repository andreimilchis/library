import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncAccounts } from "@/lib/revolut/sync";

export async function GET() {
  const accounts = await prisma.account.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ accounts });
}

export async function POST() {
  try {
    const synced = await syncAccounts();
    return NextResponse.json({ message: "Accounts synced", synced });
  } catch (error) {
    console.error("Account sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}

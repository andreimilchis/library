import { NextResponse } from "next/server";
import { generateInsights } from "@/lib/ai/agent";

export async function GET() {
  try {
    const insights = await generateInsights();
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate insights" },
      { status: 500 }
    );
  }
}

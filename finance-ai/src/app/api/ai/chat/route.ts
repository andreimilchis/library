import { NextRequest, NextResponse } from "next/server";
import { chat, type AIMessage } from "@/lib/ai/agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, message } = body as { messages: AIMessage[]; message: string };

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await chat(messages || [], message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI chat failed" },
      { status: 500 }
    );
  }
}

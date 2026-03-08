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
    // Return a user-friendly response instead of error status
    // so the frontend can always display something useful
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("AI chat error details:", errorMessage);
    return NextResponse.json({
      response: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
    });
  }
}

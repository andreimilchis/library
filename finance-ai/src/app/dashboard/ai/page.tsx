"use client";

import { AIChat } from "@/components/dashboard/ai-chat";

export default function AIAgentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Financial Agent</h1>
        <p className="text-muted-foreground">
          Ask questions about your finances and get intelligent insights
        </p>
      </div>

      <AIChat />
    </div>
  );
}

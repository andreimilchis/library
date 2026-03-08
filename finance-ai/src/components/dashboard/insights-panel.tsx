"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export function InsightsPanel() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/insights")
      .then((res) => res.json())
      .then((data) => {
        setInsights(data.insights || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <CardTitle>AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Analyzing your finances...</p>
        ) : insights.length > 0 ? (
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {insight}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No insights available yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

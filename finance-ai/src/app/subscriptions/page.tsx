"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, RefreshCw } from "lucide-react";

interface Subscription {
  id: string;
  merchantName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  monthlyEquivalent: number;
}

export default function SubscriptionsPage() {
  const [data, setData] = useState<{
    totalMonthly: number;
    totalYearly: number;
    subscriptions: Subscription[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  const fetchData = async () => {
    const res = await fetch("/api/subscriptions");
    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDetect = async () => {
    setDetecting(true);
    await fetch("/api/subscriptions", { method: "POST" });
    setDetecting(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">Track your recurring payments</p>
        </div>
        <Button onClick={handleDetect} disabled={detecting}>
          <RefreshCw className={`h-4 w-4 mr-2 ${detecting ? "animate-spin" : ""}`} />
          {detecting ? "Detecting..." : "Detect Subscriptions"}
        </Button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="rounded-lg p-3 bg-purple-50">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(data.totalMonthly)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="rounded-lg p-3 bg-indigo-50">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yearly Total</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(data.totalYearly)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {data.subscriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Merchant</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Billing Cycle</th>
                        <th className="pb-3 font-medium">Monthly Equivalent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b border-border/50 text-sm">
                          <td className="py-3 font-medium">{sub.merchantName}</td>
                          <td className="py-3">
                            {formatCurrency(sub.amount, sub.currency)}
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">{sub.billingCycle}</Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {formatCurrency(sub.monthlyEquivalent)}/mo
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No subscriptions detected yet. Click &quot;Detect Subscriptions&quot; to scan.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

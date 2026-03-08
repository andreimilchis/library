"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from "lucide-react";

interface OverviewCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  transactionCount: number;
}

export function OverviewCards({
  totalIncome,
  totalExpenses,
  netCashflow,
  transactionCount,
}: OverviewCardsProps) {
  const cards = [
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Net Cashflow",
      value: formatCurrency(netCashflow),
      icon: Wallet,
      color: netCashflow >= 0 ? "text-green-600" : "text-red-600",
      bg: netCashflow >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "Transactions",
      value: transactionCount.toString(),
      icon: ArrowLeftRight,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="flex items-center gap-4">
            <div className={`rounded-lg p-3 ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

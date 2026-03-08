"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { SpendPieChart } from "@/components/charts/spend-pie-chart";
import { CashflowChart } from "@/components/charts/cashflow-chart";

interface OverviewData {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  transactionCount: number;
}

interface CategoryData {
  categoryName: string;
  total: number;
  percentage: number;
}

interface CashflowData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [cashflow, setCashflow] = useState<CashflowData[]>([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/spend?type=overview").then((r) => r.json()),
      fetch("/api/analytics/spend?type=categories").then((r) => r.json()),
      fetch("/api/analytics/spend?type=monthly").then((r) => r.json()),
      fetch("/api/revolut/transactions?limit=10").then((r) => r.json()),
    ])
      .then(([overviewData, categoryData, cashflowData, txData]) => {
        setOverview(overviewData);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setCashflow(Array.isArray(cashflowData) ? cashflowData : []);
        setTransactions(txData.transactions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your financial overview at a glance</p>
      </div>

      <OverviewCards
        totalIncome={overview?.totalIncome || 0}
        totalExpenses={overview?.totalExpenses || 0}
        netCashflow={overview?.netCashflow || 0}
        transactionCount={overview?.transactionCount || 0}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <SpendPieChart data={categories} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                No spending data available yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Cashflow</CardTitle>
          </CardHeader>
          <CardContent>
            {cashflow.length > 0 ? (
              <CashflowChart data={cashflow} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                No cashflow data available yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <InsightsPanel />

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <TransactionTable transactions={transactions} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions yet. Connect your Revolut account to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

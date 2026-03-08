"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { RefreshCw, Search, Download } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "25" });
    if (search) params.set("search", search);
    if (direction) params.set("direction", direction);

    const res = await fetch(`/api/revolut/transactions?${params}`);
    const data = await res.json();
    setTransactions(data.transactions || []);
    setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    setLoading(false);
  }, [search, direction]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSync = async () => {
    setSyncing(true);
    await fetch("/api/revolut/transactions", { method: "POST" });
    setSyncing(false);
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            {pagination.total} total transactions
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync from Revolut"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by merchant or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={direction === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setDirection("")}
              >
                All
              </Button>
              <Button
                variant={direction === "EXPENSE" ? "default" : "outline"}
                size="sm"
                onClick={() => setDirection("EXPENSE")}
              >
                Expenses
              </Button>
              <Button
                variant={direction === "INCOME" ? "default" : "outline"}
                size="sm"
                onClick={() => setDirection("INCOME")}
              >
                Income
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : transactions.length > 0 ? (
            <>
              <TransactionTable transactions={transactions} />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchTransactions(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchTransactions(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No transactions found. Connect Revolut and sync your data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

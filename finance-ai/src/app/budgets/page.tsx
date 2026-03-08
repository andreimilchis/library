"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Target, Trash2 } from "lucide-react";

interface BudgetStatus {
  budgetId: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isExceeded: boolean;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  currency: string;
  period: string;
  categoryId: string | null;
}

export default function BudgetsPage() {
  const [statuses, setStatuses] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", amount: "", period: "MONTHLY" });

  const fetchData = async () => {
    const res = await fetch("/api/budgets");
    const data = await res.json();
    setStatuses(data.statuses || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ name: "", amount: "", period: "MONTHLY" });
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Set spending limits and track progress</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input
                  placeholder="e.g., Software Budget"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="w-40">
                <label className="text-sm font-medium mb-1 block">Amount (RON)</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="w-40">
                <label className="text-sm font-medium mb-1 block">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {statuses.map((budget) => (
          <Card key={budget.budgetId}>
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${budget.isExceeded ? "bg-red-50" : "bg-green-50"}`}>
                    <Target className={`h-4 w-4 ${budget.isExceeded ? "text-red-600" : "text-green-600"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{budget.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={budget.isExceeded ? "destructive" : "success"}>
                    {budget.percentUsed.toFixed(0)}%
                  </Badge>
                  <button
                    onClick={() => handleDelete(budget.budgetId)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    budget.isExceeded ? "bg-red-500" : budget.percentUsed > 80 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                />
              </div>
              {budget.isExceeded && (
                <p className="text-xs text-red-600 mt-2">
                  Over budget by {formatCurrency(Math.abs(budget.remaining))}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && statuses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No budgets yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create budgets to track your spending limits
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

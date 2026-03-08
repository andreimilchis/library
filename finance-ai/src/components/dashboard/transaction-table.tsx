"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  merchantName: string | null;
  amount: number;
  currency: string;
  direction: "INCOME" | "EXPENSE";
  transactionDate: string;
  description: string | null;
  category: { name: string } | null;
  classificationStatus: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="pb-3 font-medium">Merchant</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-border/50 text-sm">
              <td className="py-3">
                <div>
                  <p className="font-medium">{tx.merchantName || "Unknown"}</p>
                  {tx.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {tx.description}
                    </p>
                  )}
                </div>
              </td>
              <td className="py-3">
                <span
                  className={
                    tx.direction === "INCOME" ? "text-green-600 font-medium" : "text-red-600 font-medium"
                  }
                >
                  {tx.direction === "INCOME" ? "+" : "-"}
                  {formatCurrency(tx.amount, tx.currency)}
                </span>
              </td>
              <td className="py-3 text-muted-foreground">
                {formatDate(tx.transactionDate)}
              </td>
              <td className="py-3">
                {tx.category ? (
                  <Badge variant="default">{tx.category.name}</Badge>
                ) : (
                  <Badge variant="outline">Uncategorized</Badge>
                )}
              </td>
              <td className="py-3">
                <Badge
                  variant={
                    tx.classificationStatus === "CLASSIFIED"
                      ? "success"
                      : tx.classificationStatus === "NEEDS_REVIEW"
                        ? "warning"
                        : "outline"
                  }
                >
                  {tx.classificationStatus}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

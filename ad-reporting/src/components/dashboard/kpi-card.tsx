"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function KpiCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  color = "blue",
}: KpiCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              {
                "bg-blue-50 text-blue-600": color === "blue",
                "bg-green-50 text-green-600": color === "green",
                "bg-purple-50 text-purple-600": color === "purple",
                "bg-orange-50 text-orange-600": color === "orange",
                "bg-red-50 text-red-600": color === "red",
                "bg-teal-50 text-teal-600": color === "teal",
              }
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive && <TrendingUp className="w-4 h-4 text-green-600" />}
          {isNegative && <TrendingDown className="w-4 h-4 text-red-600" />}
          {isNeutral && <Minus className="w-4 h-4 text-gray-400" />}
          <span
            className={cn("text-sm font-medium", {
              "text-green-600": isPositive,
              "text-red-600": isNegative,
              "text-gray-500": isNeutral,
            })}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-gray-400 ml-1">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

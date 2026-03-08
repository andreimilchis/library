"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SpendPieChartProps {
  data: Array<{
    categoryName: string;
    total: number;
    percentage: number;
  }>;
}

const COLORS = [
  "#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

export function SpendPieChart({ data }: SpendPieChartProps) {
  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: Math.round(item.total * 100) / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `${value.toFixed(2)} RON`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

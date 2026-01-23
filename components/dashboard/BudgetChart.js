// components/dashboard/BudgetChart.jsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/constants";

export default function BudgetChart({
  data = [],
  totalSpent = 0,
  totalBudget = 0,
  currency = "USD",
}) {
  // Check if we have valid data with actual values
  const hasValidData =
    data.length > 0 && data.some((item) => (item.value || item.spent || 0) > 0);

  // If no spending data, show budget distribution instead
  let chartData;
  let COLORS;

  if (hasValidData) {
    // Show actual spending
    chartData = data.map((item) => ({
      name: item.name,
      value: item.value || item.spent || 0,
      color: item.color,
    }));
    COLORS = data.map((item) => item.color || "#6B7280");
  } else if (data.length > 0) {
    // No spending yet, show budget limits distribution
    chartData = data.map((item) => ({
      name: item.name,
      value: item.max || item.max_amount || 100,
      color: item.color,
    }));
    COLORS = data.map((item) => item.color || "#6B7280");
  } else {
    // No data at all, show placeholder
    chartData = [{ name: "No Budget", value: 1, color: "#E5E7EB" }];
    COLORS = ["#E5E7EB"];
  }

  // Format the amounts using the formatCurrency function
  const formattedSpent = formatCurrency(totalSpent, currency);
  const formattedLimit = formatCurrency(totalBudget, currency);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "200px",
        height: "200px",
        margin: "0 auto",
      }}
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            innerRadius="75%"
            outerRadius="100%"
            paddingAngle={5}
            dataKey="value"
            cornerRadius={10}
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          {/* Center Text */}
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan
              x="50%"
              dy="-0.3em"
              fontSize="26"
              fontWeight="700"
              style={{ fill: "var(--color-foreground)" }}
            >
              {formattedSpent}
            </tspan>
            <tspan
              x="50%"
              dy="2em"
              fontSize="12"
              style={{ fill: "var(--color-text)" }}
            >
              of {formattedLimit} limit
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

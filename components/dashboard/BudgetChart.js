// components/dashboard/BudgetChart.jsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

  // Use actual values - don't fall back to fake numbers
  const spent = totalSpent;
  const limit = totalBudget;

  // Get currency symbol
  const getSymbol = (curr) => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      AFN: "؋",
      IRR: "﷼",
    };
    return symbols[curr] || "$";
  };

  const symbol = getSymbol(currency);

  return (
    <div style={{ width: "100%", maxWidth: "400px", height: "300px" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            innerRadius="70%"
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
              fontSize="35"
              fontWeight="700"
              style={{ fill: "var(--color-foreground)" }}
            >
              {symbol}
              {spent.toFixed(1)}
            </tspan>
            <tspan
              x="50%"
              dy="2em"
              fontSize="14"
              style={{ fill: "var(--color-text)" }}
            >
              of {symbol}
              {limit.toFixed(1)} limit
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

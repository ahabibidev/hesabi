"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function BudgetChart() {
  const data = [
    { name: "Savings", value: 600 },
    { name: "Concert Ticket", value: 200 },
    { name: "Laptop", value: 100 },
    { name: "Mobile", value: 50 },
  ];

  const COLORS = ["#104e64", "skyblue", "darkorange", "#721378"];

  const spent = 192.0;
  const limit = 975.0;

  return (
    <div style={{ width: "100%", maxWidth: "400px", height: "300px" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={5}
            dataKey="value"
            cornerRadius={10}
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
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
              ${spent.toFixed(1)}
            </tspan>
            <tspan
              x="50%"
              dy="2em"
              fontSize="14"
              style={{ fill: "var(--color-text)" }}
            >
              of ${limit.toFixed(1)} limit
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BudgetChart() {
  const data = [
    { name: "Savings", value: 600 },
    { name: "Concert Ticket", value: 200 },
    { name: "Laptop", value: 100 },
    { name: "Mobile", value: 50 },
  ];

  // Colors for each slice
  const COLORS = ["#104e64", "skyblue", "darkorange", "#721378 "];

  return (
    <div style={{ width: "100%", maxWidth: "300px", height: "300px" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={5}
            dataKey="value"
            cornerRadius={10}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

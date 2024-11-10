import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FundGraph = ({ graphData }) => {
  if (!graphData) return null;

  const reversedHistory = [...graphData.history].reverse();
  const trendIsPositive =
    reversedHistory[0][1] < reversedHistory[reversedHistory.length - 1][1];

  const data = reversedHistory.map(([date, value]) => ({
    date,
    value: Number(value.toFixed(2)),
  }));

  const lineColor = trendIsPositive ? "rgb(0,178,135)" : "rgb(240,125,100)";

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, " ");
  };

  return (
    <div className="bg-white rounded-lg p-5 shadow-lg mb-5">
      <div className="w-full" style={{ height: 350 }}>
        <ResponsiveContainer height="100%" width="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <XAxis dataKey="date" hide tick={{ fontWeight: "bold" }} />
            <YAxis
              hide={false}
              domain={["auto", "auto"]}
              tick={{ fontWeight: "bold" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #ccc",
                padding: "5px 10px",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
              formatter={(value) => [value, "NAV"]}
              labelFormatter={(label) => `Date : ${formatDate(label)}`}
              cursor={{
                stroke: "#666",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              coordinate={{ x: 0, y: 0 }}
              offset={0}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FundGraph;

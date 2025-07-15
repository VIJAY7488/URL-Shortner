import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted))",
  chart: [
    "hsl(262, 83%, 58%)", // purple
    "hsl(213, 93%, 68%)", // blue
    "hsl(142, 76%, 47%)", // green
    "hsl(346, 87%, 43%)", // red
    "hsl(47, 96%, 53%)", // yellow
    "hsl(280, 100%, 70%)", // pink
  ],
};

const AnalyticsCharts = () => {
  return (
    <div className="space-y-6">
      {/* Clicks Over Time */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Clicks Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;

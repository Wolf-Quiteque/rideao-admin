"use client";

// Wrappers Recharts com o estilo RideAO.
// Cores de marca ajustadas para contraste em gráficos (validadas):
//   âmbar #C77414 · verde-azulado #0E8A6C · azul #2563EB

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const CHART_COLORS = {
  amber: "#C77414",
  teal: "#0E8A6C",
  blue: "#2563EB",
};

const AXIS = { fontSize: 11, fill: "#6B7280" };
const GRID = { stroke: "#E5E7EB", strokeDasharray: "3 3", vertical: false };

function tooltipStyle() {
  return {
    contentStyle: {
      borderRadius: 10,
      border: "1px solid #E5E7EB",
      fontSize: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    cursor: { fill: "rgba(26,26,46,0.05)" },
  };
}

export function SimpleBarChart({ data, xKey, yKey, color = CHART_COLORS.amber, formatValue, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid {...GRID} />
        <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={56} tickFormatter={formatValue} />
        <Tooltip {...tooltipStyle()} formatter={(v) => [formatValue ? formatValue(v) : v]} />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleLineChart({ data, xKey, yKey, color = CHART_COLORS.teal, formatValue, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={64} tickFormatter={formatValue} />
        <Tooltip {...tooltipStyle()} formatter={(v) => [formatValue ? formatValue(v) : v]} />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-4">
      <p className="font-heading text-sm font-bold text-primary">{title}</p>
      {subtitle ? <p className="text-xs text-gray-400">{subtitle}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

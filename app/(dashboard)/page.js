"use client";

import { useMemo } from "react";
import { ChartCard, CHART_COLORS, SimpleBarChart, SimpleLineChart } from "@/components/charts/Charts";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatNumber, formatTime, shortId } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

const ACTIVE = ["requested", "searching", "accepted", "arrived", "in_progress"];

export default function DashboardPage() {
  const data = useAdminStore();

  const stats = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

    const today = data.rides.filter((r) => new Date(r.requested_at) >= startOfDay);
    const completed = data.rides.filter((r) => r.status === "completed");
    const revenueToday = today
      .filter((r) => r.status === "completed")
      .reduce((s, r) => s + Number(r.final_fare || 0), 0);
    const finished = data.rides.filter((r) => ["completed", "cancelled"].includes(r.status));
    const completionRate = finished.length
      ? Math.round((completed.length / finished.length) * 100)
      : 100;
    const newUsers = [...data.riders, ...data.drivers].filter(
      (u) => new Date(u.created_at) >= sevenDaysAgo
    ).length;

    // séries por dia (últimos 14 dias)
    const perDay = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const next = new Date(day.getTime() + 86400000);
      const rides = data.rides.filter((r) => {
        const d = new Date(r.requested_at);
        return d >= day && d < next;
      });
      perDay.push({
        label: `${day.getDate()}/${day.getMonth() + 1}`,
        corridas: rides.length,
        receita: rides
          .filter((r) => r.status === "completed")
          .reduce((s, r) => s + Number(r.final_fare || 0), 0),
      });
    }

    const recent = [...data.rides]
      .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at))
      .slice(0, 8);

    return {
      ridesToday: today.length,
      activeNow: data.rides.filter((r) => ACTIVE.includes(r.status)).length,
      driversOnline: data.drivers.filter((d) => d.is_online).length,
      revenueToday,
      newUsers,
      completionRate,
      perDay,
      recent,
    };
  }, [data]);

  if (!data || !stats) {
    return <p className="text-sm text-gray-400">A carregar dados…</p>;
  }

  const riderName = (id) => data.riders.find((r) => r.id === id)?.full_name || "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Corridas hoje" value={formatNumber(stats.ridesToday)} />
        <StatCard label="Corridas ativas" value={formatNumber(stats.activeNow)} hint="agora" />
        <StatCard label="Motoristas online" value={formatNumber(stats.driversOnline)} />
        <StatCard label="Receita hoje" value={formatCurrency(stats.revenueToday)} accent />
        <StatCard label="Novos utilizadores" value={formatNumber(stats.newUsers)} hint="últimos 7 dias" />
        <StatCard label="Taxa de conclusão" value={`${stats.completionRate}%`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Corridas por dia" subtitle="Últimos 14 dias">
          <SimpleBarChart data={stats.perDay} xKey="label" yKey="corridas" color={CHART_COLORS.amber} />
        </ChartCard>
        <ChartCard title="Receita por dia" subtitle="Últimos 14 dias (Kz)">
          <SimpleLineChart
            data={stats.perDay}
            xKey="label"
            yKey="receita"
            color={CHART_COLORS.teal}
            formatValue={(v) => formatNumber(v)}
          />
        </ChartCard>
      </div>

      <div className="rounded-xl border border-gray-200 bg-surface p-4">
        <p className="font-heading text-sm font-bold text-primary">Atividade recente</p>
        <div className="mt-3 divide-y divide-gray-100">
          {stats.recent.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="w-14 text-xs text-gray-400">{formatTime(r.requested_at)}</span>
              <span className="w-20 font-mono text-xs text-gray-500">#{shortId(r.id)}</span>
              <span className="min-w-0 flex-1 truncate text-gray-700">
                {riderName(r.rider_id)} · {r.pickup_address} → {r.dropoff_address}
              </span>
              <StatusBadge status={r.status} />
              <span className="w-24 text-right font-semibold text-primary">
                {formatCurrency(r.final_fare || r.estimated_fare)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

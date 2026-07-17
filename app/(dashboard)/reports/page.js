"use client";

import { useMemo } from "react";
import { ChartCard, CHART_COLORS, SimpleBarChart } from "@/components/charts/Charts";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function downloadCsv(filename, header, rows) {
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const data = useAdminStore();

  const reports = useMemo(() => {
    if (!data) return null;
    const completed = data.rides.filter((r) => r.status === "completed");

    const byWeekday = WEEKDAYS.map((label, i) => ({
      label,
      corridas: data.rides.filter((r) => new Date(r.requested_at).getDay() === i).length,
    }));

    const byHour = Array.from({ length: 24 }, (_, h) => ({
      label: `${h}h`,
      corridas: data.rides.filter((r) => new Date(r.requested_at).getHours() === h).length,
    })).filter((x, i) => i >= 5 && i <= 22);

    const topDrivers = [...data.drivers]
      .filter((d) => d.is_verified)
      .sort((a, b) => b.total_earnings - a.total_earnings)
      .slice(0, 5);

    const byMonth = new Map();
    for (const r of completed) {
      const d = new Date(r.completed_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      byMonth.set(key, (byMonth.get(key) || 0) + Number(r.final_fare || 0));
    }
    const monthly = [...byMonth.entries()]
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, value]) => {
        const [, m] = key.split("-");
        return { label: MONTH_LABELS[Number(m)], receita: value };
      });

    return { byWeekday, byHour, topDrivers, monthly, completed };
  }, [data]);

  if (!data || !reports) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  const exportRides = () =>
    downloadCsv(
      "rideao-corridas.csv",
      ["id", "estado", "passageiro", "motorista", "origem", "destino", "km", "min", "tarifa", "solicitada"],
      data.rides.map((r) => [
        r.id,
        r.status,
        data.riders.find((x) => x.id === r.rider_id)?.full_name || "",
        data.drivers.find((x) => x.id === r.driver_id)?.full_name || "",
        r.pickup_address,
        r.dropoff_address,
        r.distance_km,
        r.duration_min,
        r.final_fare || r.estimated_fare,
        r.requested_at,
      ])
    );

  const exportDrivers = () =>
    downloadCsv(
      "rideao-motoristas.csv",
      ["nome", "telefone", "veiculo", "matricula", "corridas", "ganhos", "avaliacao"],
      data.drivers.map((d) => [
        d.full_name,
        d.phone,
        `${d.vehicle_make} ${d.vehicle_model}`,
        d.vehicle_plate,
        d.total_rides,
        d.total_earnings,
        d.rating,
      ])
    );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={exportRides} className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-surface-alt">
          ⬇ Exportar corridas (CSV)
        </button>
        <button onClick={exportDrivers} className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-surface-alt">
          ⬇ Exportar motoristas (CSV)
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Corridas por dia da semana" subtitle="Últimos 30 dias">
          <SimpleBarChart data={reports.byWeekday} xKey="label" yKey="corridas" color={CHART_COLORS.amber} />
        </ChartCard>
        <ChartCard title="Horas de pico" subtitle="Corridas por hora do dia">
          <SimpleBarChart data={reports.byHour} xKey="label" yKey="corridas" color={CHART_COLORS.blue} />
        </ChartCard>
        <ChartCard title="Receita mensal" subtitle="Corridas concluídas (Kz)">
          <SimpleBarChart data={reports.monthly} xKey="label" yKey="receita" color={CHART_COLORS.teal} formatValue={(v) => formatNumber(v)} />
        </ChartCard>
        <div className="rounded-xl border border-gray-200 bg-surface p-4">
          <p className="font-heading text-sm font-bold text-primary">Top motoristas</p>
          <p className="text-xs text-gray-400">Por ganhos totais</p>
          <div className="mt-3 space-y-2.5">
            {reports.topDrivers.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="w-5 text-center font-heading text-sm font-bold text-gray-400">{i + 1}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {d.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-primary">{d.full_name}</p>
                  <p className="text-xs text-gray-400">{formatNumber(d.total_rides)} corridas · ⭐ {Number(d.rating).toFixed(1)}</p>
                </div>
                <span className="text-sm font-bold text-success">{formatCurrency(d.total_earnings)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

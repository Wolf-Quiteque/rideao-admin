"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDateTime, RIDE_STATUS, shortId } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

export default function RidesPage() {
  const router = useRouter();
  const data = useAdminStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const nameOf = (id) =>
      data.riders.find((r) => r.id === id)?.full_name ||
      data.drivers.find((d) => d.id === id)?.full_name ||
      "—";
    return data.rides
      .map((r) => ({
        ...r,
        rider_name: nameOf(r.rider_id),
        driver_name: r.driver_id ? nameOf(r.driver_id) : "—",
      }))
      .filter((r) => (statusFilter === "all" ? true : r.status === statusFilter))
      .filter((r) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          r.rider_name.toLowerCase().includes(q) ||
          r.driver_name.toLowerCase().includes(q) ||
          (r.pickup_address || "").toLowerCase().includes(q) ||
          (r.dropoff_address || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at));
  }, [data, statusFilter, search]);

  if (!data) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  const columns = [
    { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-gray-500">#{shortId(r.id)}</span> },
    { key: "requested_at", label: "Data/hora", sortable: true, render: (r) => formatDateTime(r.requested_at) },
    { key: "rider_name", label: "Passageiro", sortable: true },
    { key: "driver_name", label: "Motorista", sortable: true },
    {
      key: "route",
      label: "Origem → destino",
      render: (r) => (
        <span className="block max-w-64 truncate">
          {r.pickup_address} → {r.dropoff_address}
        </span>
      ),
    },
    { key: "status", label: "Estado", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "fare",
      label: "Tarifa",
      sortable: true,
      sortValue: (r) => Number(r.final_fare || r.estimated_fare || 0),
      render: (r) => <span className="font-semibold">{formatCurrency(r.final_fare || r.estimated_fare)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Procurar por nome ou endereço…"
          className="w-72 rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todos os estados</option>
          {Object.entries(RIDE_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-gray-400">{rows.length} corridas</span>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        onRowClick={(r) => router.push(`/rides/${r.id}`)}
        emptyMessage="Nenhuma corrida encontrada."
      />
    </div>
  );
}

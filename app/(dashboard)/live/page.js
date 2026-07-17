"use client";

// O showpiece da demo: mapa de Luanda com motoristas a mover-se ao vivo,
// lista lateral de corridas ativas e drawer de detalhe.

import { useMemo, useState } from "react";
import { LiveMap } from "@/components/LiveMap";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatTime, shortId } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

const ACTIVE = ["requested", "searching", "accepted", "arrived", "in_progress"];

export default function LiveOpsPage() {
  const data = useAdminStore();
  const [selectedId, setSelectedId] = useState(null);

  const activeRides = useMemo(
    () => (data ? data.rides.filter((r) => ACTIVE.includes(r.status)) : []),
    [data]
  );

  if (!data) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  const selected = activeRides.find((r) => r.id === selectedId) || null;
  const driversOnline = data.drivers.filter((d) => d.is_online).length;
  const riderName = (id) => data.riders.find((r) => r.id === id)?.full_name || "—";
  const driver = selected ? data.drivers.find((d) => d.id === selected.driver_id) : null;

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4">
      <div className="relative min-w-0 flex-1">
        <LiveMap
          drivers={data.drivers}
          activeRides={activeRides}
          selectedRideId={selectedId}
          onSelectRide={(r) => setSelectedId(r.id)}
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow">
            🚗 {driversOnline} motoristas online
          </span>
          <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-primary shadow">
            🚕 {activeRides.length} corridas ativas
          </span>
        </div>
        <div className="absolute bottom-3 left-3 rounded-lg bg-surface/95 px-3 py-2 text-[11px] text-gray-500 shadow">
          <span className="mr-3"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-accent align-middle" />Motorista</span>
          <span className="mr-3"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-success align-middle" />Recolha</span>
          <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-danger align-middle" />Destino</span>
        </div>
      </div>

      <aside className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto">
        <p className="font-heading text-sm font-bold text-primary">Corridas ativas</p>
        {activeRides.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-surface p-4 text-sm text-gray-400">
            Sem corridas ativas neste momento.
          </p>
        )}
        {activeRides.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              r.id === selectedId
                ? "border-accent bg-warning-bg"
                : "border-gray-200 bg-surface hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">#{shortId(r.id)}</span>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1.5 truncate text-sm font-medium text-primary">
              {r.pickup_address} → {r.dropoff_address}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {riderName(r.rider_id)} · {formatCurrency(r.estimated_fare)}
            </p>
          </button>
        ))}

        {selected && (
          <div className="rounded-xl border border-gray-200 bg-surface p-4">
            <p className="font-heading text-sm font-bold text-primary">Detalhe #{shortId(selected.id)}</p>
            <dl className="mt-2 space-y-1.5 text-xs text-gray-600">
              <Row k="Passageiro" v={riderName(selected.rider_id)} />
              <Row k="Motorista" v={driver ? `${driver.full_name} · ${driver.vehicle_plate}` : "—"} />
              <Row k="Solicitada" v={formatTime(selected.requested_at)} />
              <Row k="Aceite" v={formatTime(selected.accepted_at)} />
              <Row k="Chegou" v={formatTime(selected.arrived_at)} />
              <Row k="Iniciada" v={formatTime(selected.started_at)} />
              <Row k="Tarifa" v={formatCurrency(selected.estimated_fare)} />
              <Row k="Distância" v={`${selected.distance_km} km`} />
            </dl>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-400">{k}</dt>
      <dd className="text-right font-medium text-gray-700">{v}</dd>
    </div>
  );
}

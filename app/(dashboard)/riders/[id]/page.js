"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { setUserActive } from "@/lib/actions";
import { formatCurrency, formatDate, formatDateTime, formatNumber, shortId } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

export default function RiderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const data = useAdminStore();
  const [confirmToggle, setConfirmToggle] = useState(false);

  if (!data) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  const rider = data.riders.find((r) => String(r.id) === String(id));
  if (!rider) {
    return (
      <div className="text-sm text-gray-500">
        Passageiro não encontrado.{" "}
        <button className="text-info underline" onClick={() => router.push("/riders")}>
          Voltar
        </button>
      </div>
    );
  }

  const rides = data.rides
    .filter((r) => r.rider_id === rider.id)
    .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at));
  const completed = rides.filter((r) => r.status === "completed");
  const totalSpent = completed.reduce((s, r) => s + Number(r.final_fare || 0), 0);

  const columns = [
    { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-gray-500">#{shortId(r.id)}</span> },
    { key: "requested_at", label: "Data", sortable: true, render: (r) => formatDateTime(r.requested_at) },
    { key: "route", label: "Percurso", render: (r) => <span className="block max-w-72 truncate">{r.pickup_address} → {r.dropoff_address}</span> },
    { key: "status", label: "Estado", render: (r) => <StatusBadge status={r.status} /> },
    { key: "fare", label: "Tarifa", sortable: true, sortValue: (r) => Number(r.final_fare || 0), render: (r) => formatCurrency(r.final_fare || r.estimated_fare) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/riders")} className="rounded-lg border border-gray-200 bg-surface px-3 py-1.5 text-sm text-gray-600 hover:bg-surface-alt">
          ‹ Passageiros
        </button>
        <h2 className="font-heading text-lg font-bold text-primary">{rider.full_name}</h2>
        {!rider.is_active && (
          <span className="rounded-full bg-danger-bg px-2 py-0.5 text-xs font-semibold text-danger">Desativada</span>
        )}
        <button
          onClick={() => setConfirmToggle(true)}
          className={`ml-auto rounded-lg px-3 py-1.5 text-sm font-semibold ${
            rider.is_active ? "bg-danger text-white hover:bg-danger/90" : "bg-secondary text-white hover:bg-secondary/90"
          }`}
        >
          {rider.is_active ? "Desativar conta" : "Reativar conta"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Corridas" value={formatNumber(rides.length)} />
        <Stat label="Total gasto" value={formatCurrency(totalSpent)} />
        <Stat label="Avaliação" value={`⭐ ${Number(rider.rating).toFixed(1)}`} />
        <Stat label="Registado" value={formatDate(rider.created_at)} />
      </div>

      <div>
        <p className="mb-2 font-heading text-sm font-bold text-primary">Histórico de corridas</p>
        <DataTable columns={columns} rows={rides} onRowClick={(r) => router.push(`/rides/${r.id}`)} emptyMessage="Sem corridas." />
      </div>

      <ConfirmDialog
        open={confirmToggle}
        title={rider.is_active ? `Desativar ${rider.full_name}?` : `Reativar ${rider.full_name}?`}
        message={
          rider.is_active
            ? "O passageiro deixará de poder iniciar sessão e pedir corridas."
            : "O passageiro voltará a poder usar a plataforma."
        }
        confirmLabel={rider.is_active ? "Desativar" : "Reativar"}
        danger={rider.is_active}
        onConfirm={async () => {
          await setUserActive(rider.id, !rider.is_active);
          setConfirmToggle(false);
        }}
        onClose={() => setConfirmToggle(false)}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold text-primary">{value}</p>
    </div>
  );
}

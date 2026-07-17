"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import { OnlineDot, StatusBadge } from "@/components/StatusBadge";
import { setUserActive } from "@/lib/actions";
import { formatCurrency, formatDate, formatDateTime, formatNumber, shortId } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

export default function DriverDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const data = useAdminStore();
  const [confirmToggle, setConfirmToggle] = useState(false);

  if (!data) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  const driver = data.drivers.find((d) => String(d.id) === String(id));
  if (!driver) {
    return (
      <div className="text-sm text-gray-500">
        Motorista não encontrado.{" "}
        <button className="text-info underline" onClick={() => router.push("/drivers")}>
          Voltar
        </button>
      </div>
    );
  }

  const rides = data.rides
    .filter((r) => r.driver_id === driver.id)
    .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at));

  const columns = [
    { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-gray-500">#{shortId(r.id)}</span> },
    { key: "requested_at", label: "Data", sortable: true, render: (r) => formatDateTime(r.requested_at) },
    { key: "route", label: "Percurso", render: (r) => <span className="block max-w-72 truncate">{r.pickup_address} → {r.dropoff_address}</span> },
    { key: "status", label: "Estado", render: (r) => <StatusBadge status={r.status} /> },
    { key: "fare", label: "Tarifa", sortValue: (r) => Number(r.final_fare || 0), sortable: true, render: (r) => formatCurrency(r.final_fare || r.estimated_fare) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/drivers")} className="rounded-lg border border-gray-200 bg-surface px-3 py-1.5 text-sm text-gray-600 hover:bg-surface-alt">
          ‹ Motoristas
        </button>
        <h2 className="font-heading text-lg font-bold text-primary">{driver.full_name}</h2>
        <OnlineDot online={driver.is_online} />
        {driver.is_verified && <span className="text-sm text-success">Verificado ✓</span>}
        <button
          onClick={() => setConfirmToggle(true)}
          className={`ml-auto rounded-lg px-3 py-1.5 text-sm font-semibold ${
            driver.is_active ? "bg-danger text-white hover:bg-danger/90" : "bg-secondary text-white hover:bg-secondary/90"
          }`}
        >
          {driver.is_active ? "Desativar conta" : "Reativar conta"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <InfoCard title="Perfil">
          <Field k="Telefone" v={driver.phone} />
          <Field k="Email" v={driver.email} />
          <Field k="Registado" v={formatDate(driver.created_at)} />
          <Field k="Avaliação" v={`⭐ ${Number(driver.rating).toFixed(1)}`} />
          <Field k="Conta" v={driver.is_active ? "Ativa" : "Desativada"} />
        </InfoCard>
        <InfoCard title="Veículo">
          <Field k="Modelo" v={`${driver.vehicle_make} ${driver.vehicle_model}`} />
          <Field k="Ano" v={driver.vehicle_year} />
          <Field k="Cor" v={driver.vehicle_color} />
          <Field k="Matrícula" v={driver.vehicle_plate} />
          <Field k="Carta" v={driver.license_number} />
        </InfoCard>
        <InfoCard title="Desempenho">
          <Field k="Corridas" v={formatNumber(driver.total_rides)} />
          <Field k="Ganhos totais" v={formatCurrency(driver.total_earnings)} />
          <Field k="Estado" v={driver.is_online ? "Online" : "Offline"} />
        </InfoCard>
        <InfoCard title="Verificação">
          <Field k="Estado" v={driver.verification_status === "approved" ? "Aprovado" : driver.verification_status === "rejected" ? "Rejeitado" : "Pendente"} />
          {driver.verification_notes && <Field k="Notas" v={driver.verification_notes} />}
        </InfoCard>
      </div>

      <div>
        <p className="mb-2 font-heading text-sm font-bold text-primary">Histórico de corridas ({rides.length})</p>
        <DataTable columns={columns} rows={rides} onRowClick={(r) => router.push(`/rides/${r.id}`)} emptyMessage="Sem corridas." />
      </div>

      <ConfirmDialog
        open={confirmToggle}
        title={driver.is_active ? `Desativar ${driver.full_name}?` : `Reativar ${driver.full_name}?`}
        message={
          driver.is_active
            ? "O motorista deixará de poder iniciar sessão e receber corridas."
            : "O motorista voltará a poder trabalhar na plataforma."
        }
        confirmLabel={driver.is_active ? "Desativar" : "Reativar"}
        danger={driver.is_active}
        onConfirm={async () => {
          await setUserActive(driver.id, !driver.is_active);
          setConfirmToggle(false);
        }}
        onClose={() => setConfirmToggle(false)}
      />
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-4">
      <p className="font-heading text-sm font-bold text-primary">{title}</p>
      <dl className="mt-2 space-y-1.5 text-xs">{children}</dl>
    </div>
  );
}

function Field({ k, v }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-400">{k}</dt>
      <dd className="text-right font-medium text-gray-700">{v ?? "—"}</dd>
    </div>
  );
}

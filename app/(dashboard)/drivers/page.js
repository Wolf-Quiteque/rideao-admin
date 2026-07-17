"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import { OnlineDot } from "@/components/StatusBadge";
import { approveDriver, rejectDriver } from "@/lib/actions";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

export default function DriversPage() {
  const router = useRouter();
  const data = useAdminStore();
  const [tab, setTab] = useState("pending");
  const [rejecting, setRejecting] = useState(null);

  const pending = useMemo(
    () => (data ? data.drivers.filter((d) => d.verification_status === "pending") : []),
    [data]
  );

  if (!data) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  const columns = [
    { key: "full_name", label: "Nome", sortable: true, render: (d) => <span className="font-medium">{d.full_name}</span> },
    { key: "vehicle", label: "Veículo", render: (d) => `${d.vehicle_make} ${d.vehicle_model}` },
    { key: "vehicle_plate", label: "Matrícula" },
    { key: "is_online", label: "Estado", sortable: true, sortValue: (d) => (d.is_online ? 1 : 0), render: (d) => <OnlineDot online={d.is_online} /> },
    { key: "rating", label: "Avaliação", sortable: true, render: (d) => `⭐ ${Number(d.rating).toFixed(1)}` },
    { key: "total_rides", label: "Corridas", sortable: true, render: (d) => formatNumber(d.total_rides) },
    { key: "total_earnings", label: "Ganhos totais", sortable: true, render: (d) => <span className="font-semibold text-success">{formatCurrency(d.total_earnings)}</span> },
    {
      key: "verified",
      label: "Verificado",
      render: (d) =>
        d.is_verified ? (
          <span className="text-success">✓</span>
        ) : (
          <span className="text-xs text-gray-400">{d.verification_status === "rejected" ? "Rejeitado" : "Pendente"}</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-surface-alt p-1 w-fit">
        <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>
          Pendentes {pending.length > 0 && <span className="ml-1 rounded-full bg-accent px-1.5 text-xs font-bold text-primary">{pending.length}</span>}
        </TabButton>
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          Todos ({data.drivers.length})
        </TabButton>
      </div>

      {tab === "pending" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pending.length === 0 && (
            <p className="rounded-xl border border-gray-200 bg-surface p-6 text-sm text-gray-400">
              Fila de verificação vazia — nenhum motorista pendente. 🎉
            </p>
          )}
          {pending.map((d) => (
            <div key={d.id} className="rounded-xl border border-gray-200 bg-surface p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {d.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <p className="font-semibold text-primary">{d.full_name}</p>
                  <p className="text-xs text-gray-400">{d.phone} · {d.email}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg bg-surface-alt p-3 text-xs">
                <Field k="Veículo" v={`${d.vehicle_make} ${d.vehicle_model} (${d.vehicle_year})`} />
                <Field k="Matrícula" v={d.vehicle_plate} />
                <Field k="Cor" v={d.vehicle_color} />
                <Field k="Carta" v={d.license_number} />
              </dl>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => approveDriver(d.id)}
                  className="flex-1 rounded-lg bg-secondary py-2 text-sm font-bold text-white hover:bg-secondary/90"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => setRejecting(d)}
                  className="flex-1 rounded-lg border border-danger py-2 text-sm font-semibold text-danger hover:bg-danger-bg"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={data.drivers}
          onRowClick={(d) => router.push(`/drivers/${d.id}`)}
        />
      )}

      <ConfirmDialog
        open={!!rejecting}
        title={`Rejeitar ${rejecting?.full_name}?`}
        message="O motorista verá o motivo da rejeição e poderá corrigir os dados."
        confirmLabel="Rejeitar"
        danger
        withReason
        reasonPlaceholder="Motivo da rejeição (ex.: documento ilegível)…"
        onConfirm={async (notes) => {
          await rejectDriver(rejecting.id, notes);
          setRejecting(null);
        }}
        onClose={() => setRejecting(null)}
      />
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium ${
        active ? "bg-surface text-primary shadow-sm" : "text-gray-500 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ k, v }) {
  return (
    <div>
      <dt className="text-gray-400">{k}</dt>
      <dd className="font-medium text-gray-700">{v || "—"}</dd>
    </div>
  );
}

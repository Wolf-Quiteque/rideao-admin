"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { cancelRide } from "@/lib/actions";
import { formatCurrency, formatDateTime, shortId } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

const TIMELINE = [
  ["requested_at", "Solicitada"],
  ["accepted_at", "Aceite pelo motorista"],
  ["arrived_at", "Motorista chegou"],
  ["started_at", "Viagem iniciada"],
  ["completed_at", "Concluída"],
  ["cancelled_at", "Cancelada"],
];

export default function RideDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const data = useAdminStore();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!data) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  const ride = data.rides.find((r) => String(r.id) === String(id));
  if (!ride) {
    return (
      <div className="text-sm text-gray-500">
        Corrida não encontrada.{" "}
        <button className="text-info underline" onClick={() => router.push("/rides")}>
          Voltar às corridas
        </button>
      </div>
    );
  }

  const rider = data.riders.find((r) => r.id === ride.rider_id);
  const driver = data.drivers.find((d) => d.id === ride.driver_id);
  const cancellable = !["completed", "cancelled"].includes(ride.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/rides")}
          className="rounded-lg border border-gray-200 bg-surface px-3 py-1.5 text-sm text-gray-600 hover:bg-surface-alt"
        >
          ‹ Corridas
        </button>
        <h2 className="font-heading text-lg font-bold text-primary">Corrida #{shortId(ride.id)}</h2>
        <StatusBadge status={ride.status} />
        {cancellable && (
          <button
            onClick={() => setConfirmCancel(true)}
            className="ml-auto rounded-lg bg-danger px-3 py-1.5 text-sm font-semibold text-white hover:bg-danger/90"
          >
            Cancelar corrida
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-surface p-4">
            <p className="font-heading text-sm font-bold text-primary">Percurso</p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                {ride.pickup_address}
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                {ride.dropoff_address}
              </p>
              <p className="pt-1 text-xs text-gray-400">
                {ride.distance_km} km · {Math.round(ride.duration_min)} min ·{" "}
                {ride.vehicle_type === "xl" ? "RideAO XL" : ride.vehicle_type === "conforto" ? "Conforto" : "Económico"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-surface p-4">
            <p className="font-heading text-sm font-bold text-primary">Linha temporal</p>
            <ol className="mt-3 space-y-2.5">
              {TIMELINE.filter(([key]) => ride[key]).map(([key, label]) => (
                <li key={key} className="flex items-center gap-3 text-sm">
                  <span className={`h-2 w-2 rounded-full ${key === "cancelled_at" ? "bg-danger" : "bg-secondary"}`} />
                  <span className="w-44 text-gray-700">{label}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(ride[key])}</span>
                </li>
              ))}
            </ol>
            {ride.status === "cancelled" && (
              <p className="mt-3 rounded-lg bg-danger-bg p-2.5 text-xs text-danger">
                Cancelada por: {ride.cancelled_by === "admin" ? "administração" : ride.cancelled_by === "driver" ? "motorista" : "passageiro"}
                {ride.cancellation_reason ? ` · ${ride.cancellation_reason}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <PartyCard title="Passageiro" person={rider} />
          <PartyCard title="Motorista" person={driver} extra={driver ? `${driver.vehicle_make} ${driver.vehicle_model} · ${driver.vehicle_plate}` : null} />
          <div className="rounded-xl border border-gray-200 bg-surface p-4">
            <p className="font-heading text-sm font-bold text-primary">Pagamento</p>
            <p className="mt-2 font-heading text-2xl font-bold text-primary">
              {formatCurrency(ride.final_fare || ride.estimated_fare)}
            </p>
            <p className="text-xs text-gray-400">
              Multicaixa Express · {ride.status === "completed" ? "pago (mock)" : "estimativa"}
            </p>
            {ride.rating_for_driver && (
              <p className="mt-2 text-xs text-gray-500">
                Avaliação do motorista: {"★".repeat(ride.rating_for_driver)}{"☆".repeat(5 - ride.rating_for_driver)}
              </p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar corrida?"
        message="A corrida será marcada como cancelada pela administração e registada no audit log."
        confirmLabel="Cancelar corrida"
        danger
        withReason
        reasonPlaceholder="Motivo do cancelamento…"
        onConfirm={async (reason) => {
          await cancelRide(ride.id, reason);
          setConfirmCancel(false);
        }}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}

function PartyCard({ title, person, extra }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-4">
      <p className="font-heading text-sm font-bold text-primary">{title}</p>
      {person ? (
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
            {person.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-primary">{person.full_name}</p>
            <p className="text-xs text-gray-400">
              ⭐ {Number(person.rating).toFixed(1)} · {person.phone}
            </p>
            {extra ? <p className="text-xs text-gray-400">{extra}</p> : null}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-400">Não atribuído</p>
      )}
    </div>
  );
}

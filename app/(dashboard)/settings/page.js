"use client";

import { getAdminSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

const ACTION_LABELS = {
  driver_approved: { label: "Motorista aprovado", color: "text-success" },
  driver_rejected: { label: "Motorista rejeitado", color: "text-danger" },
  user_deactivated: { label: "Conta desativada", color: "text-danger" },
  user_reactivated: { label: "Conta reativada", color: "text-success" },
  ride_cancelled: { label: "Corrida cancelada", color: "text-danger" },
  pricing_updated: { label: "Preços atualizados", color: "text-info" },
};

export default function SettingsPage() {
  const data = useAdminStore();
  const session = getAdminSession();

  if (!data) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-xl border border-gray-200 bg-surface p-5">
        <p className="font-heading text-sm font-bold text-primary">Conta de administrador</p>
        <div className="mt-3 flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-heading text-lg font-bold text-primary">
            {(session?.name || "A")[0]}
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">{session?.name}</p>
            <p className="text-xs text-gray-400">{session?.email}</p>
          </div>
          <button
            className="ml-auto rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-surface-alt"
            title={isDemoMode ? "Indisponível em modo demo" : "Alterar palavra-passe"}
          >
            Alterar palavra-passe
          </button>
        </div>
        {isDemoMode && (
          <p className="mt-3 rounded-lg bg-info-bg p-2.5 text-xs text-gray-600">
            Em modo demo a gestão da conta está desativada. Ligue o Supabase para ativar.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-surface p-5">
        <p className="font-heading text-sm font-bold text-primary">Registo de auditoria</p>
        <p className="text-xs text-gray-400">Quem fez o quê e quando — todas as ações de administração.</p>
        <div className="mt-3 divide-y divide-gray-100">
          {data.adminActions.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">Sem ações registadas.</p>
          )}
          {data.adminActions.map((a) => {
            const cfg = ACTION_LABELS[a.action] || { label: a.action, color: "text-gray-600" };
            return (
              <div key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="w-36 shrink-0 text-xs text-gray-400">{formatDateTime(a.created_at)}</span>
                <span className={`w-44 shrink-0 font-medium ${cfg.color}`}>{cfg.label}</span>
                <span className="min-w-0 flex-1 truncate text-gray-600">{a.target_label || a.target_id || "—"}</span>
                <span className="shrink-0 text-xs text-gray-400">{a.admin_name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

// Configuração de tarifas — o formulário grava no pricing_config partilhado;
// os apps móveis leem esta tabela, por isso as alterações aplicam-se logo.

import { useEffect, useState } from "react";
import { savePricing } from "@/lib/actions";
import { estimateFare, formatCurrency, formatDateTime } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

const FIELDS = [
  { key: "base_fare", label: "Tarifa base (Kz)", step: 50 },
  { key: "rate_per_km", label: "Preço por km (Kz)", step: 10 },
  { key: "rate_per_min", label: "Preço por minuto (Kz)", step: 5 },
  { key: "conforto_multiplier", label: "Multiplicador Conforto", step: 0.1 },
  { key: "xl_multiplier", label: "Multiplicador XL", step: 0.1 },
];

const EXAMPLE = { km: 6, min: 15 };

export default function PricingPage() {
  const data = useAdminStore();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !form) setForm({ ...data.pricing });
  }, [data]);

  if (!data || !form) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  const update = (key) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: Number(e.target.value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePricing({
        base_fare: form.base_fare,
        rate_per_km: form.rate_per_km,
        rate_per_min: form.rate_per_min,
        conforto_multiplier: form.conforto_multiplier,
        xl_multiplier: form.xl_multiplier,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const preview = (type) => formatCurrency(estimateFare(EXAMPLE.km, EXAMPLE.min, form, type));

  return (
    <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-surface p-5">
        <p className="font-heading text-sm font-bold text-primary">Parâmetros de tarifa</p>
        <p className="mt-0.5 text-xs text-gray-400">
          Última atualização: {formatDateTime(data.pricing.updated_at)}
        </p>
        <div className="mt-4 space-y-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="text-xs font-semibold text-gray-600">{f.label}</span>
              <input
                type="number"
                step={f.step}
                min={0}
                value={form[f.key]}
                onChange={update(f.key)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-accent py-2.5 text-sm font-bold text-primary hover:bg-accent/90 disabled:opacity-60"
        >
          {saving ? "A guardar…" : "Guardar alterações"}
        </button>
        {saved && (
          <p className="mt-2 text-center text-xs font-medium text-success">
            ✓ Guardado — os apps usam já os novos valores.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-surface p-5">
          <p className="font-heading text-sm font-bold text-primary">Pré-visualização ao vivo</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Exemplo: viagem de {EXAMPLE.km} km / {EXAMPLE.min} min
          </p>
          <div className="mt-4 space-y-2.5">
            <PreviewRow icon="🚗" name="Económico" value={preview("economico")} />
            <PreviewRow icon="🚙" name="Conforto" value={preview("conforto")} />
            <PreviewRow icon="🚐" name="RideAO XL" value={preview("xl")} />
          </div>
        </div>
        <div className="rounded-xl bg-info-bg p-4 text-xs leading-relaxed text-gray-600">
          💡 <span className="font-semibold">Momento de demo:</span> altere o preço por km com o
          app cliente aberto no ecrã de confirmação — a estimativa muda ao instante, sem
          redeploy.
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ icon, name, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-alt px-3 py-2.5">
      <span className="text-sm text-gray-700">
        <span className="mr-2">{icon}</span>
        {name}
      </span>
      <span className="font-heading text-base font-bold text-primary">{value}</span>
    </div>
  );
}

// Formatação pt-AO: "1.250 Kz", datas e horas

export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  return Math.round(Number(value)).toLocaleString("pt-AO").replace(/\s/g, ".");
}

export function formatCurrency(value) {
  return `${formatNumber(value)} Kz`;
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function formatDateTime(dateLike) {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(dateLike) {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(dateLike) {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function shortId(id) {
  return String(id).slice(0, 8).toUpperCase();
}

// Estados de corrida → etiqueta PT + classes de cor (spec §3.5)
export const RIDE_STATUS = {
  requested: { label: "Solicitada", className: "bg-info-bg text-info" },
  searching: { label: "A procurar", className: "bg-warning-bg text-[#B87409]" },
  accepted: { label: "Aceite", className: "bg-info-bg text-info" },
  arrived: { label: "Motorista chegou", className: "bg-info-bg text-info" },
  in_progress: { label: "Em viagem", className: "bg-warning-bg text-[#B87409]" },
  completed: { label: "Concluída", className: "bg-success-bg text-success" },
  cancelled: { label: "Cancelada", className: "bg-danger-bg text-danger" },
};

export function estimateFare(distanceKm, durationMin, config, vehicleType = "economico") {
  const base =
    config.base_fare + distanceKm * config.rate_per_km + durationMin * config.rate_per_min;
  const multiplier =
    vehicleType === "conforto" ? config.conforto_multiplier :
    vehicleType === "xl" ? config.xl_multiplier : 1;
  return Math.round(base * multiplier);
}

import { RIDE_STATUS } from "@/lib/format";

export function StatusBadge({ status, label }) {
  const cfg = RIDE_STATUS[status] || { label: status, className: "bg-surface-alt text-gray-500" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {label || cfg.label}
    </span>
  );
}

export function OnlineDot({ online }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
      <span className={`h-2 w-2 rounded-full ${online ? "bg-success" : "bg-gray-300"}`} />
      {online ? "Online" : "Offline"}
    </span>
  );
}

export function StatCard({ label, value, hint, accent = false }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 font-heading text-2xl font-bold ${accent ? "text-success" : "text-primary"}`}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

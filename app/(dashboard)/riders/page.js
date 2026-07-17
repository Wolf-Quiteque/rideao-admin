"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useAdminStore } from "@/lib/useAdminStore";

export default function RidersPage() {
  const router = useRouter();
  const data = useAdminStore();

  const rows = useMemo(() => {
    if (!data) return [];
    return data.riders.map((rider) => {
      const rides = data.rides.filter((r) => r.rider_id === rider.id);
      const completed = rides.filter((r) => r.status === "completed");
      return {
        ...rider,
        rides_count: rides.length,
        total_spent: completed.reduce((s, r) => s + Number(r.final_fare || 0), 0),
      };
    });
  }, [data]);

  if (!data) return <p className="text-sm text-gray-400">A carregar dados…</p>;

  const columns = [
    { key: "full_name", label: "Nome", sortable: true, render: (r) => <span className="font-medium">{r.full_name}</span> },
    { key: "phone", label: "Telefone" },
    { key: "rides_count", label: "Corridas", sortable: true, render: (r) => formatNumber(r.rides_count) },
    { key: "total_spent", label: "Total gasto", sortable: true, render: (r) => <span className="font-semibold">{formatCurrency(r.total_spent)}</span> },
    { key: "rating", label: "Avaliação", sortable: true, render: (r) => `⭐ ${Number(r.rating).toFixed(1)}` },
    { key: "created_at", label: "Registado em", sortable: true, render: (r) => formatDate(r.created_at) },
    {
      key: "is_active",
      label: "Estado",
      sortable: true,
      sortValue: (r) => (r.is_active ? 1 : 0),
      render: (r) =>
        r.is_active ? (
          <span className="rounded-full bg-success-bg px-2 py-0.5 text-xs font-semibold text-success">Ativa</span>
        ) : (
          <span className="rounded-full bg-danger-bg px-2 py-0.5 text-xs font-semibold text-danger">Desativada</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      onRowClick={(r) => router.push(`/riders/${r.id}`)}
      emptyMessage="Sem passageiros."
    />
  );
}

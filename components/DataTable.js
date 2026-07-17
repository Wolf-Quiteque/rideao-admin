"use client";

// Tabela simples com ordenação e paginação client-side.
// columns: [{ key, label, sortable, render(row), sortValue(row) }]

import { useMemo, useState } from "react";

const PAGE_SIZE = 12;

export function DataTable({ columns, rows, onRowClick, emptyMessage = "Sem registos." }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    const val = col?.sortValue || ((r) => r[sortKey]);
    return [...rows].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * sortDir;
    });
  }, [rows, sortKey, sortDir, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = sorted.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) setSortDir((d) => -d);
    else {
      setSortKey(col.key);
      setSortDir(1);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-surface-alt text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col)}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
                    col.sortable ? "cursor-pointer select-none hover:text-primary" : ""
                  }`}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir > 0 ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-gray-100 last:border-0 ${
                  onRowClick ? "cursor-pointer hover:bg-surface-alt" : ""
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          <span>
            {sorted.length} registos · página {current + 1} de {pages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40"
            >
              ‹ Anterior
            </button>
            <button
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
              className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40"
            >
              Seguinte ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

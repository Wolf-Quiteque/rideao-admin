"use client";

import { useState } from "react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  danger = false,
  withReason = false,
  reasonPlaceholder = "Motivo…",
  onConfirm,
  onClose,
}) {
  const [reason, setReason] = useState("");
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-primary">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        {withReason && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            rows={3}
            className="mt-3 w-full rounded-lg border border-gray-200 p-2.5 text-sm outline-none focus:border-accent"
          />
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-surface-alt"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              danger ? "bg-danger hover:bg-danger/90" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

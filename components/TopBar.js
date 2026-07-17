"use client";

import { useRouter } from "next/navigation";
import { adminLogout, getAdminSession } from "@/lib/auth";
import { isDemoMode } from "@/lib/config";

export function TopBar({ title }) {
  const router = useRouter();
  const session = getAdminSession();

  const handleLogout = async () => {
    await adminLogout();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-surface px-6 py-3">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-lg font-bold text-primary">{title}</h1>
        {isDemoMode && (
          <span className="rounded-full bg-info-bg px-2.5 py-0.5 text-xs font-semibold text-info">
            Modo demo
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-primary">{session?.name || "Admin"}</p>
          <p className="text-xs text-gray-400">{session?.email}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-semibold text-primary">
          {(session?.name || "A")[0]}
        </div>
        <button
          onClick={handleLogout}
          className="ml-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-surface-alt"
        >
          Sair
        </button>
      </div>
    </header>
  );
}

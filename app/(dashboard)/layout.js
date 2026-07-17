"use client";

// Shell do painel: Sidebar + TopBar + gate de sessão de admin.

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { getAdminSession } from "@/lib/auth";

const TITLES = [
  ["/live", "Mapa ao vivo"],
  ["/rides", "Corridas"],
  ["/drivers", "Motoristas"],
  ["/riders", "Passageiros"],
  ["/pricing", "Configuração de preços"],
  ["/reports", "Relatórios"],
  ["/settings", "Definições"],
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAdminSession()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <p className="text-sm text-gray-400">A carregar…</p>
      </div>
    );
  }

  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] || "Dashboard";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

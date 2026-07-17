"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/live", label: "Mapa ao vivo", icon: "🗺️" },
  { href: "/rides", label: "Corridas", icon: "🚕" },
  { href: "/drivers", label: "Motoristas", icon: "🪪" },
  { href: "/riders", label: "Passageiros", icon: "👥" },
  { href: "/pricing", label: "Preços", icon: "💰" },
  { href: "/reports", label: "Relatórios", icon: "📈" },
  { href: "/settings", label: "Definições", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-primary text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-heading text-lg font-bold text-primary">
          R
        </span>
        <div>
          <p className="font-heading text-base font-bold leading-tight">RideAO</p>
          <p className="text-[11px] text-white/50">Centro de operações</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(item.href)
                ? "bg-white/10 font-semibold text-accent"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="px-5 py-4 text-[11px] text-white/40">v1.0.0 · Luanda, Angola</p>
    </aside>
  );
}

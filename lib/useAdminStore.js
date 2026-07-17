"use client";

// Hook único de dados do painel. Em demo lê o demoDb (simulação ao vivo);
// com Supabase carrega as tabelas e subscreve Realtime (rides, driver_details).

import { useEffect, useState } from "react";
import { isDemoMode } from "./config";
import { demoDb } from "./demoDb";
import { supabase } from "./supabaseClient";

async function fetchSupabaseSnapshot() {
  const [profilesRes, detailsRes, ridesRes, pricingRes, actionsRes] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("driver_details").select("*"),
    supabase.from("rides").select("*").order("requested_at", { ascending: false }).limit(500),
    supabase.from("pricing_config").select("*").eq("id", 1).single(),
    supabase.from("admin_actions").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  const profiles = profilesRes.data || [];
  const details = detailsRes.data || [];
  const drivers = profiles
    .filter((p) => p.role === "driver")
    .map((p) => ({ ...p, ...(details.find((d) => d.id === p.id) || {}) }));
  const riders = profiles.filter((p) => p.role === "rider");
  return {
    riders,
    drivers,
    rides: ridesRes.data || [],
    pricing: pricingRes.data || {},
    adminActions: (actionsRes.data || []).map((a) => ({
      ...a,
      admin_name: "Admin",
      target_label: a.target_id,
    })),
    version: Date.now(),
  };
}

export function useAdminStore() {
  const [data, setData] = useState(isDemoMode ? demoDb.getSnapshot() : null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemoMode) {
      setData(demoDb.getSnapshot());
      return demoDb.subscribe(setData);
    }
    let cancelled = false;
    const refresh = () =>
      fetchSupabaseSnapshot().then(
        (snap) => !cancelled && setData(snap),
        (err) => {
          // Sem isto, qualquer falha (sessão inválida, RLS, rede) deixava o
          // painel preso em "A carregar dados…" para sempre, sem pista alguma.
          console.error("useAdminStore: falha ao carregar dados", err);
          if (!cancelled) setError(err.message || String(err));
        }
      );
    refresh();
    const channel = supabase
      .channel("admin-ops")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "driver_details" }, refresh)
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return data; // null enquanto carrega (modo Supabase)
}

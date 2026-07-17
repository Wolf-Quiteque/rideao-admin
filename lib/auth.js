"use client";

// Sessão de admin. Demo: credenciais locais + localStorage.
// Supabase: auth por email/palavra-passe + verificação role === 'admin'.

import { isDemoMode } from "./config";
import { supabase } from "./supabaseClient";

const SESSION_KEY = "rideao.admin.session";
const DEMO_ADMIN = { email: "admin@rideao.ao", password: "rideao123", name: "Administrador RideAO" };

export async function adminLogin(email, password) {
  if (isDemoMode) {
    if (
      email.trim().toLowerCase() !== DEMO_ADMIN.email ||
      password !== DEMO_ADMIN.password
    ) {
      throw new Error("Credenciais inválidas. Em demo: admin@rideao.ao / rideao123");
    }
    const session = { email: DEMO_ADMIN.email, name: DEMO_ADMIN.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Credenciais inválidas.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.user.id)
    .single();
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("Esta conta não tem acesso de administrador.");
  }
  const session = { email, name: profile.full_name, id: data.user.id };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getAdminSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function adminLogout() {
  if (!isDemoMode && supabase) await supabase.auth.signOut();
  localStorage.removeItem(SESSION_KEY);
}

"use client";

// Mutações de admin. Demo: direto no demoDb. Supabase: route handlers
// (service role no servidor) que também registam em admin_actions.

import { getAdminSession } from "./auth";
import { isDemoMode } from "./config";
import { demoDb } from "./demoDb";

async function post(path, body) {
  const session = getAdminSession();
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, adminId: session?.id || null }),
  });
  if (!res.ok) throw new Error("A operação falhou.");
  return res.json();
}

export async function approveDriver(driverId) {
  if (isDemoMode) return demoDb.approveDriver(driverId);
  return post("/api/drivers/approve", { driverId });
}

export async function rejectDriver(driverId, notes) {
  if (isDemoMode) return demoDb.rejectDriver(driverId, notes);
  return post("/api/drivers/reject", { driverId, notes });
}

export async function setUserActive(userId, isActive) {
  if (isDemoMode) return demoDb.setUserActive(userId, isActive);
  return post("/api/users/set-active", { userId, isActive });
}

export async function cancelRide(rideId, reason) {
  if (isDemoMode) return demoDb.cancelRide(rideId, reason);
  return post("/api/rides/cancel", { rideId, reason });
}

export async function savePricing(config) {
  if (isDemoMode) return demoDb.savePricing(config);
  return post("/api/pricing/save", { config });
}

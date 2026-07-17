// Base de dados DEMO com simulação ao vivo (sem Supabase).
// Gera 30 dias de histórico determinístico + corridas ativas que progridem
// e motoristas que se movem no mapa, com um tick de 2,5 s no browser.

import { estimateFare } from "./format";

// ─── gerador determinístico ────────────────────────────────────────────
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260703);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

export const PLACES = [
  { name: "Maianga, Luanda", lat: -8.8383, lng: 13.2344 },
  { name: "Ingombota, Luanda", lat: -8.8137, lng: 13.2302 },
  { name: "Marginal de Luanda", lat: -8.8147, lng: 13.2302 },
  { name: "Ilha do Cabo", lat: -8.7789, lng: 13.2432 },
  { name: "Mutamba, Luanda", lat: -8.826, lng: 13.244 },
  { name: "Alvalade, Luanda", lat: -8.8583, lng: 13.2312 },
  { name: "Aeroporto 4 de Fevereiro", lat: -8.8477, lng: 13.2921 },
  { name: "Belas Shopping", lat: -8.9046, lng: 13.1893 },
  { name: "Kilamba Kiaxi", lat: -8.8891, lng: 13.2723 },
  { name: "Miramar, Luanda", lat: -8.8065, lng: 13.2437 },
  { name: "Rangel, Luanda", lat: -8.8291, lng: 13.2657 },
  { name: "Talatona", lat: -8.9153, lng: 13.1846 },
];

const DEFAULT_PRICING = {
  base_fare: 500,
  rate_per_km: 150,
  rate_per_min: 20,
  conforto_multiplier: 1.4,
  xl_multiplier: 1.9,
  updated_at: new Date().toISOString(),
};

const RIDER_NAMES = [
  "Márcio Quissanga", "Luena Fernandes", "Domingas Neto", "Kiluanje Manuel",
  "Esperança Van-Dúnem", "Adilson Cabral", "Teresa Bumba", "Nelson dos Santos",
];

const DRIVER_SEED = [
  { name: "João Baptista", make: "Toyota", model: "Corolla", plate: "LD-43-18-HA", color: "Branco", year: 2019, online: true, verified: true },
  { name: "Ana Domingos", make: "Hyundai", model: "Accent", plate: "LD-77-22-GB", color: "Cinzento", year: 2021, online: true, verified: true },
  { name: "Pedro Cassoma", make: "Kia", model: "Sportage", plate: "LD-15-90-FC", color: "Preto", year: 2020, online: true, verified: true },
  { name: "Manuel Kussema", make: "Nissan", model: "Almera", plate: "LD-02-33-EB", color: "Azul", year: 2017, online: false, verified: true },
  { name: "Carlos Miguel", make: "Suzuki", model: "Swift", plate: "LD-88-45-JD", color: "Vermelho", year: 2018, online: false, verified: false },
  { name: "Isabel Tchikola", make: "Toyota", model: "Yaris", plate: "LD-61-07-KA", color: "Branco", year: 2022, online: false, verified: false },
];

const VEHICLE_TYPES = ["economico", "economico", "economico", "conforto", "xl"];
const CANCEL_REASONS = ["Passageiro não apareceu", "Mudança de planos", "Tempo de espera longo"];

function daysAgoIso(days, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function jitter(v, amt) {
  return v + (rand() - 0.5) * amt;
}

// ─── construção do estado inicial ──────────────────────────────────────
function buildState() {
  const riders = RIDER_NAMES.map((full_name, i) => ({
    id: `rider-${i + 1}`,
    full_name,
    phone: `+244 9${23 + i}0 ${100 + i * 37} ${200 + i * 53}`.slice(0, 16),
    email: `${full_name.split(" ")[0].toLowerCase()}@email.ao`,
    role: "rider",
    rating: Math.round((4.5 + rand() * 0.5) * 10) / 10,
    is_active: true,
    created_at: daysAgoIso(20 + Math.floor(rand() * 60), 10, 0).toISOString(),
  }));

  const drivers = DRIVER_SEED.map((d, i) => {
    const spot = PLACES[i % PLACES.length];
    return {
      id: `driver-${i + 1}`,
      full_name: d.name,
      phone: `+244 9${34 + i}5 ${300 + i * 41} ${400 + i * 29}`.slice(0, 16),
      email: `${d.name.split(" ")[0].toLowerCase()}.driver@email.ao`,
      role: "driver",
      rating: Math.round((4.4 + rand() * 0.6) * 10) / 10,
      is_active: true,
      created_at: daysAgoIso(30 + Math.floor(rand() * 90), 9, 0).toISOString(),
      vehicle_make: d.make,
      vehicle_model: d.model,
      vehicle_plate: d.plate,
      vehicle_color: d.color,
      vehicle_year: d.year,
      license_number: `CA-${100000 + i * 8121}`,
      is_online: d.online,
      is_verified: d.verified,
      verification_status: d.verified ? "approved" : "pending",
      verification_notes: null,
      current_lat: jitter(spot.lat, 0.01),
      current_lng: jitter(spot.lng, 0.01),
      heading: Math.floor(rand() * 360),
      last_location_update: new Date().toISOString(),
      total_rides: 0,
      total_earnings: 0,
    };
  });

  const verifiedDrivers = drivers.filter((d) => d.is_verified);
  const rides = [];
  let seq = 0;

  // 30 dias de histórico
  for (let day = 29; day >= 0; day--) {
    const count = 3 + Math.floor(rand() * 5); // 3–7 corridas/dia
    for (let i = 0; i < count; i++) {
      const from = pick(PLACES);
      let to = pick(PLACES);
      while (to === from) to = pick(PLACES);
      const km = Math.round((2 + rand() * 12) * 10) / 10;
      const min = Math.round(km * (2 + rand()));
      const vehicle_type = pick(VEHICLE_TYPES);
      const fare = estimateFare(km, min, DEFAULT_PRICING, vehicle_type);
      const requested = daysAgoIso(day, 6 + Math.floor(rand() * 16), Math.floor(rand() * 60));
      const cancelled = rand() < 0.08;
      const driver = pick(verifiedDrivers);
      const ride = {
        id: `ride-${++seq}`,
        rider_id: pick(riders).id,
        driver_id: cancelled && rand() < 0.5 ? null : driver.id,
        status: cancelled ? "cancelled" : "completed",
        vehicle_type,
        pickup_lat: jitter(from.lat, 0.004),
        pickup_lng: jitter(from.lng, 0.004),
        pickup_address: from.name,
        dropoff_lat: jitter(to.lat, 0.004),
        dropoff_lng: jitter(to.lng, 0.004),
        dropoff_address: to.name,
        estimated_fare: fare,
        final_fare: cancelled ? null : fare,
        distance_km: km,
        duration_min: min,
        requested_at: requested.toISOString(),
        accepted_at: cancelled ? null : new Date(requested.getTime() + 120000).toISOString(),
        arrived_at: cancelled ? null : new Date(requested.getTime() + 420000).toISOString(),
        started_at: cancelled ? null : new Date(requested.getTime() + 540000).toISOString(),
        completed_at: cancelled ? null : new Date(requested.getTime() + (9 + min) * 60000).toISOString(),
        cancelled_at: cancelled ? new Date(requested.getTime() + 300000).toISOString() : null,
        cancelled_by: cancelled ? (rand() < 0.6 ? "rider" : "driver") : null,
        cancellation_reason: cancelled ? pick(CANCEL_REASONS) : null,
        rating_for_driver: cancelled ? null : 4 + Math.round(rand()),
        payment_method: "multicaixa_express",
      };
      rides.push(ride);
      if (ride.status === "completed" && ride.driver_id) {
        const drv = drivers.find((x) => x.id === ride.driver_id);
        drv.total_rides += 1;
        drv.total_earnings += fare;
      }
    }
  }

  const adminActions = [
    { id: "act-1", admin_name: "Administrador RideAO", action: "driver_approved", target_type: "profile", target_label: "Manuel Kussema", created_at: daysAgoIso(6, 11, 24).toISOString() },
    { id: "act-2", admin_name: "Administrador RideAO", action: "pricing_updated", target_type: "pricing", target_label: "Preço por km: 140 → 150 Kz", created_at: daysAgoIso(4, 9, 10).toISOString() },
    { id: "act-3", admin_name: "Administrador RideAO", action: "driver_approved", target_type: "profile", target_label: "Pedro Cassoma", created_at: daysAgoIso(12, 15, 42).toISOString() },
  ];

  return {
    pricing: { ...DEFAULT_PRICING },
    riders,
    drivers,
    rides,
    adminActions,
    version: 0,
  };
}

// ─── loja + simulação ao vivo ──────────────────────────────────────────
let state = buildState();
const listeners = new Set();
let ticker = null;
let liveSeq = 1000;

function emit() {
  state = { ...state, version: state.version + 1 };
  listeners.forEach((fn) => fn(state));
}

function log(action, target_type, target_label) {
  state.adminActions = [
    {
      id: `act-${Date.now()}`,
      admin_name: "Administrador RideAO",
      action,
      target_type,
      target_label,
      created_at: new Date().toISOString(),
    },
    ...state.adminActions,
  ];
}

function moveToward(driver, targetLat, targetLng, step = 0.0016) {
  const dLat = targetLat - driver.current_lat;
  const dLng = targetLng - driver.current_lng;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  if (dist < step) {
    driver.current_lat = targetLat;
    driver.current_lng = targetLng;
    return true;
  }
  driver.current_lat += (dLat / dist) * step;
  driver.current_lng += (dLng / dist) * step;
  driver.heading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;
  driver.last_location_update = new Date().toISOString();
  return false;
}

function spawnLiveRide() {
  const freeDrivers = state.drivers.filter(
    (d) =>
      d.is_online &&
      d.is_verified &&
      !state.rides.some(
        (r) => r.driver_id === d.id && ["accepted", "arrived", "in_progress"].includes(r.status)
      )
  );
  if (freeDrivers.length === 0) return;
  const driver = freeDrivers[Math.floor(Math.random() * freeDrivers.length)];
  const from = PLACES[Math.floor(Math.random() * PLACES.length)];
  let to = PLACES[Math.floor(Math.random() * PLACES.length)];
  while (to === from) to = PLACES[Math.floor(Math.random() * PLACES.length)];
  const km = Math.round((2 + Math.random() * 10) * 10) / 10;
  const min = Math.round(km * 2.4);
  const vehicle_type = VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];
  const fare = estimateFare(km, min, state.pricing, vehicle_type);
  const rider = state.riders[Math.floor(Math.random() * state.riders.length)];
  state.rides = [
    {
      id: `ride-live-${++liveSeq}`,
      rider_id: rider.id,
      driver_id: driver.id,
      status: "accepted",
      vehicle_type,
      pickup_lat: from.lat + (Math.random() - 0.5) * 0.006,
      pickup_lng: from.lng + (Math.random() - 0.5) * 0.006,
      pickup_address: from.name,
      dropoff_lat: to.lat + (Math.random() - 0.5) * 0.006,
      dropoff_lng: to.lng + (Math.random() - 0.5) * 0.006,
      dropoff_address: to.name,
      estimated_fare: fare,
      final_fare: null,
      distance_km: km,
      duration_min: min,
      requested_at: new Date(Date.now() - 60000).toISOString(),
      accepted_at: new Date().toISOString(),
      arrived_at: null,
      started_at: null,
      completed_at: null,
      cancelled_at: null,
      cancelled_by: null,
      cancellation_reason: null,
      rating_for_driver: null,
      payment_method: "multicaixa_express",
    },
    ...state.rides,
  ];
}

function tick() {
  const active = state.rides.filter((r) =>
    ["accepted", "arrived", "in_progress"].includes(r.status)
  );

  // motoristas em corrida movem-se para o alvo; livres deambulam
  for (const driver of state.drivers) {
    if (!driver.is_online) continue;
    const ride = active.find((r) => r.driver_id === driver.id);
    if (ride) {
      if (ride.status === "accepted") {
        const arrived = moveToward(driver, ride.pickup_lat, ride.pickup_lng);
        if (arrived) {
          ride.status = "arrived";
          ride.arrived_at = new Date().toISOString();
        }
      } else if (ride.status === "arrived") {
        if (Math.random() < 0.35) {
          ride.status = "in_progress";
          ride.started_at = new Date().toISOString();
        }
      } else if (ride.status === "in_progress") {
        const done = moveToward(driver, ride.dropoff_lat, ride.dropoff_lng);
        if (done) {
          ride.status = "completed";
          ride.completed_at = new Date().toISOString();
          ride.final_fare = ride.estimated_fare;
          ride.rating_for_driver = 4 + Math.round(Math.random());
          driver.total_rides += 1;
          driver.total_earnings += ride.final_fare;
        }
      }
    } else {
      // deambular suavemente por Luanda
      driver.current_lat = Math.min(-8.76, Math.max(-8.93, driver.current_lat + (Math.random() - 0.5) * 0.0012));
      driver.current_lng = Math.min(13.31, Math.max(13.16, driver.current_lng + (Math.random() - 0.5) * 0.0012));
      driver.heading = (driver.heading + (Math.random() - 0.5) * 40 + 360) % 360;
      driver.last_location_update = new Date().toISOString();
    }
  }

  // manter 1–3 corridas ativas para o mapa parecer vivo
  const activeCount = state.rides.filter((r) =>
    ["accepted", "arrived", "in_progress"].includes(r.status)
  ).length;
  if (activeCount < 3 && Math.random() < 0.18) spawnLiveRide();

  emit();
}

function ensureTicker() {
  if (typeof window === "undefined") return;
  if (!ticker) {
    // arranque: garantir algumas corridas ativas imediatamente
    if (!state.rides.some((r) => ["accepted", "arrived", "in_progress"].includes(r.status))) {
      spawnLiveRide();
      spawnLiveRide();
    }
    ticker = setInterval(tick, 2500);
  }
}

// ─── API pública ───────────────────────────────────────────────────────
export const demoDb = {
  getSnapshot: () => state,

  subscribe(listener) {
    listeners.add(listener);
    ensureTicker();
    return () => listeners.delete(listener);
  },

  approveDriver(id) {
    const d = state.drivers.find((x) => x.id === id);
    if (!d) return;
    d.is_verified = true;
    d.verification_status = "approved";
    d.verification_notes = null;
    log("driver_approved", "profile", d.full_name);
    emit();
  },

  rejectDriver(id, notes) {
    const d = state.drivers.find((x) => x.id === id);
    if (!d) return;
    d.is_verified = false;
    d.verification_status = "rejected";
    d.verification_notes = notes || null;
    log("driver_rejected", "profile", d.full_name);
    emit();
  },

  setUserActive(id, isActive) {
    const u = state.riders.find((x) => x.id === id) || state.drivers.find((x) => x.id === id);
    if (!u) return;
    u.is_active = isActive;
    log(isActive ? "user_reactivated" : "user_deactivated", "profile", u.full_name);
    emit();
  },

  cancelRide(id, reason) {
    const r = state.rides.find((x) => x.id === id);
    if (!r || ["completed", "cancelled"].includes(r.status)) return;
    r.status = "cancelled";
    r.cancelled_at = new Date().toISOString();
    r.cancelled_by = "admin";
    r.cancellation_reason = reason || "Cancelada pela operação";
    log("ride_cancelled", "ride", `Corrida ${String(r.id).slice(0, 8)}`);
    emit();
  },

  savePricing(cfg) {
    state.pricing = { ...state.pricing, ...cfg, updated_at: new Date().toISOString() };
    log("pricing_updated", "pricing", `Base ${cfg.base_fare} · km ${cfg.rate_per_km} · min ${cfg.rate_per_min}`);
    emit();
  },
};

"use client";

// Mapa de operações ao vivo — SVG próprio com projeção de coordenadas reais
// de Luanda (sem token Mapbox). Motoristas âmbar rodados pelo heading,
// recolhas verdes, destinos vermelhos, linha para corridas em curso.

const BOUNDS = { minLat: -8.945, maxLat: -8.755, minLng: 13.14, maxLng: 13.325 };
const W = 1000;
const H = 700;

function project(lat, lng) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x, y };
}

export function LiveMap({ drivers, activeRides, selectedRideId, onSelectRide }) {
  const onlineDrivers = drivers.filter((d) => d.is_online);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full rounded-xl border border-gray-200 bg-[#EDEAE0]"
      role="img"
      aria-label="Mapa de operações de Luanda"
    >
      {/* baía de Luanda (noroeste) */}
      <path d={`M 0 0 L ${W * 0.34} 0 Q ${W * 0.2} ${H * 0.18} ${W * 0.05} ${H * 0.3} L 0 ${H * 0.32} Z`} fill="#BFDBF7" />
      <path d={`M ${W * 0.34} 0 Q ${W * 0.42} ${H * 0.09} ${W * 0.36} ${H * 0.16}`} fill="none" stroke="#BFDBF7" strokeWidth="14" />

      {/* malha urbana decorativa */}
      {[0.14, 0.28, 0.42, 0.56, 0.7, 0.84].map((t, i) => (
        <line key={`h${i}`} x1="0" y1={H * t} x2={W} y2={H * t} stroke="#FFFFFF" strokeWidth={i % 2 ? 3 : 6} opacity="0.8" />
      ))}
      {[0.12, 0.26, 0.4, 0.54, 0.68, 0.82, 0.94].map((t, i) => (
        <line key={`v${i}`} x1={W * t} y1="0" x2={W * t} y2={H} stroke="#FFFFFF" strokeWidth={i % 2 ? 3 : 6} opacity="0.8" />
      ))}
      <line x1="0" y1={H * 0.35} x2={W} y2={H * 0.62} stroke="#FFFFFF" strokeWidth="8" opacity="0.9" />

      {/* corridas ativas: linha recolha→destino + pontos */}
      {activeRides.map((r) => {
        const p = project(r.pickup_lat, r.pickup_lng);
        const d = project(r.dropoff_lat, r.dropoff_lng);
        const selected = r.id === selectedRideId;
        return (
          <g key={r.id} onClick={() => onSelectRide && onSelectRide(r)} className="cursor-pointer">
            {r.status === "in_progress" && (
              <line x1={p.x} y1={p.y} x2={d.x} y2={d.y} stroke="#1A1A2E" strokeWidth={selected ? 5 : 3} strokeDasharray="10 7" opacity="0.55" />
            )}
            <circle cx={p.x} cy={p.y} r={selected ? 13 : 9} fill="#16C79A" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx={d.x} cy={d.y} r={selected ? 13 : 9} fill="#E63946" stroke="#FFFFFF" strokeWidth="3" />
          </g>
        );
      })}

      {/* motoristas online (âmbar, rodados pelo heading) */}
      {onlineDrivers.map((drv) => {
        const p = project(drv.current_lat, drv.current_lng);
        return (
          <g key={drv.id} transform={`translate(${p.x} ${p.y}) rotate(${drv.heading || 0})`}>
            <circle r="14" fill="#FFA630" stroke="#FFFFFF" strokeWidth="3.5" />
            <path d="M 0 -7 L 5 5 L 0 2 L -5 5 Z" fill="#1A1A2E" />
          </g>
        );
      })}
    </svg>
  );
}

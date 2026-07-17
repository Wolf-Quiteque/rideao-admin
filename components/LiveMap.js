"use client";

// Mapa de operações ao vivo — Google Maps real (antes era um SVG próprio
// desenhado à mão). Motoristas âmbar rodados pelo heading, recolhas verdes,
// destinos vermelhos, linha para corridas em curso — mesma linguagem visual
// de antes, agora sobre ruas e geografia reais de Luanda.

import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { Fragment, useMemo } from "react";
import { GOOGLE_MAPS_KEY } from "@/lib/config";

const LUANDA_CENTER = { lat: -8.8383, lng: 13.2344 };

const CONTAINER_STYLE = { width: "100%", height: "100%" };

// Estilo claro e discreto — combina com o resto do painel (fundo #FAFAFA,
// superfícies brancas) em vez do estilo escuro usado nas apps móveis.
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#EDEAE0" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6B7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#BFDBF7" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#E5E7EB" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#FFA630" }, { weight: 0.6 }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#E4E0D2" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#D1D5DB" }] },
];

export function LiveMap({ drivers, activeRides, selectedRideId, onSelectRide }) {
  const { isLoaded } = useJsApiLoader({
    id: "rideao-admin-map",
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  const onlineDrivers = useMemo(() => drivers.filter((d) => d.is_online), [drivers]);

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-gray-200 bg-surface-alt text-sm text-gray-400">
        Falta NEXT_PUBLIC_GOOGLE_MAPS_KEY no .env.local
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-gray-200 bg-surface-alt text-sm text-gray-400">
        A carregar mapa…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={CONTAINER_STYLE}
      center={LUANDA_CENTER}
      zoom={12}
      options={{
        styles: MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
      }}
    >
      {activeRides.map((r) => {
        const selected = r.id === selectedRideId;
        const pickup = { lat: r.pickup_lat, lng: r.pickup_lng };
        const dropoff = { lat: r.dropoff_lat, lng: r.dropoff_lng };
        return (
          <Fragment key={r.id}>
            {r.status === "in_progress" && (
              <Polyline
                path={[pickup, dropoff]}
                options={{
                  strokeColor: "#1A1A2E",
                  strokeOpacity: 0.55,
                  strokeWeight: selected ? 4 : 2.5,
                }}
              />
            )}
            <Marker
              position={pickup}
              onClick={() => onSelectRide && onSelectRide(r)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: selected ? 9 : 7,
                fillColor: "#16C79A",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2.5,
              }}
              zIndex={selected ? 20 : 5}
            />
            <Marker
              position={dropoff}
              onClick={() => onSelectRide && onSelectRide(r)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: selected ? 9 : 7,
                fillColor: "#E63946",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2.5,
              }}
              zIndex={selected ? 20 : 5}
            />
          </Fragment>
        );
      })}

      {onlineDrivers.map((drv) => (
        <Marker
          key={drv.id}
          position={{ lat: drv.current_lat, lng: drv.current_lng }}
          icon={{
            path: "M 0 -8 L 6 6 L 0 3 L -6 6 Z",
            rotation: drv.heading || 0,
            scale: 1.6,
            fillColor: "#FFA630",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            anchor: new window.google.maps.Point(0, 0),
          }}
          zIndex={10}
        />
      ))}
    </GoogleMap>
  );
}

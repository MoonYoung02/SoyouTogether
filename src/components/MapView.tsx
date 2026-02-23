"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import { calcProgress, formatPercent } from "@/lib/format";
import type { Property } from "@/lib/types";

interface MapViewProps {
  properties: Property[];
  selectedId?: string;
  onSelect: (propertyId: string) => void;
  className?: string;
  mapClassName?: string;
}

function FitToBounds({ properties, selectedId }: { properties: Property[]; selectedId?: string }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) {
      return;
    }

    const selected = properties.find((property) => property.id === selectedId);
    if (selected && typeof selected.lat === "number" && typeof selected.lng === "number") {
      map.flyTo([selected.lat, selected.lng], 12, { duration: 0.4 });
      return;
    }

    const bounds: LatLngBoundsExpression = properties
      .filter((property) => typeof property.lat === "number" && typeof property.lng === "number")
      .map((property) => [property.lat as number, property.lng as number]);

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] });
      return;
    }

    if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    }
  }, [map, properties, selectedId]);

  return null;
}

export function MapView({ properties, selectedId, onSelect, className, mapClassName }: MapViewProps) {
const first = properties.find(
  (property) => typeof property.lat === "number" && typeof property.lng === "number"
);

const center: [number, number] =
  first && typeof first.lat === "number" && typeof first.lng === "number"
    ? [first.lat, first.lng]
    : [37.5665, 126.978];

  return (
    <div className={className ?? "overflow-hidden rounded border border-slate-300 bg-white"}>
      <MapContainer
        center={center}
        zoom={11}
        className={mapClassName ?? "h-[380px] w-full sm:h-[460px]"}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToBounds properties={properties} selectedId={selectedId} />

        {properties.map((property) => {
          if (typeof property.lat !== "number" || typeof property.lng !== "number") {
            return null;
          }

          const selected = selectedId === property.id;
          const progress = calcProgress(property.reservedAmount, property.targetPrice);

          return (
            <CircleMarker
              key={property.id}
              center={[property.lat, property.lng]}
              pathOptions={{
                color: selected ? "#0f172a" : "#475569",
                fillColor: selected ? "#0f172a" : "#94a3b8",
                fillOpacity: 0.85,
                weight: selected ? 2 : 1
              }}
              radius={selected ? 11 : 8}
              eventHandlers={{
                click: () => onSelect(property.id)
              }}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">{property.name}</p>
                  <p>{property.address}</p>
                  <p>수익률 {formatPercent(property.predictedYield)}</p>
                  <p>진행률 {formatPercent(progress)}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

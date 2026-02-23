import type { Property } from "@/lib/types";

interface MapMockProps {
  properties: Property[];
  selected?: Property;
}

export function MapMock({ properties, selected }: MapMockProps) {
  return (
    <div className="rounded border border-slate-300 bg-white p-4">
      <p className="text-sm font-medium">지도(목업)</p>
      <p className="mt-1 text-xs text-slate-600">외부 지도 SDK 대신 위치 텍스트/핀 목록으로 표시합니다.</p>
      <div className="mt-3 min-h-72 rounded border border-dashed border-slate-300 bg-slate-50 p-3">
        <div className="grid gap-2 text-xs">
          {properties.map((property) => {
            const isSelected = selected?.id === property.id;
            return (
              <div
                className={`rounded border px-2 py-1 ${
                  isSelected ? "border-slate-900 bg-white" : "border-slate-300"
                }`}
                key={property.id}
              >
                <p>{property.name}</p>
                <p className="text-slate-600">
                  ({property.lat?.toFixed(3)}, {property.lng?.toFixed(3)})
                </p>
              </div>
            );
          })}
        </div>
      </div>
      {selected ? (
        <p className="mt-2 text-xs text-slate-700">선택 매물: {selected.name}</p>
      ) : (
        <p className="mt-2 text-xs text-slate-700">오른쪽 리스트에서 매물을 선택하세요.</p>
      )}
    </div>
  );
}

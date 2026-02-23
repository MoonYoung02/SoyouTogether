"use client";

import { useEffect, useRef, useState } from "react";
import type { Property } from "@/lib/types";
import { calcProgress, formatPercent } from "@/lib/format";

interface KakaoMapViewProps {
  appKey: string;
  properties: Property[];
  selectedId?: string;
  onSelect: (propertyId: string) => void;
  onLoadError?: (message: string) => void;
  className?: string;
  mapClassName?: string;
}

interface MarkerEntry {
  propertyId: string;
  marker: any;
}

const SCRIPT_ID = "kakao-map-sdk";
const SCRIPT_TIMEOUT_MS = 8000;

type KakaoLoadErrorCode =
  | "SCRIPT_BLOCKED"
  | "SCRIPT_TIMEOUT"
  | "SDK_UNAVAILABLE"
  | "MAP_INIT_FAILED"
  | "UNKNOWN";

class KakaoLoadError extends Error {
  code: KakaoLoadErrorCode;

  constructor(code: KakaoLoadErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function parseLoadError(error: unknown, host: string) {
  if (error instanceof KakaoLoadError) {
    if (error.code === "SCRIPT_BLOCKED") {
      return {
        title: "카카오 스크립트 차단 가능성",
        description: "브라우저 차단 기능(광고 차단, Shields, 보안 확장) 때문에 SDK를 가져오지 못했습니다.",
        hints: [
          `현재 접속 주소(${host})에서 브라우저 차단 기능을 끄고 새로고침하세요.`,
          "회사/학교 네트워크라면 외부 스크립트 차단 정책이 있는지 확인하세요."
        ]
      };
    }

    if (error.code === "SCRIPT_TIMEOUT") {
      return {
        title: "카카오 SDK 로딩 시간 초과",
        description: "카카오 지도 스크립트 응답이 제한 시간 내 도착하지 않았습니다.",
        hints: [
          "네트워크 상태를 확인하고 새로고침하세요.",
          "VPN/프록시 사용 중이면 끄고 다시 시도하세요."
        ]
      };
    }

    if (error.code === "SDK_UNAVAILABLE") {
      return {
        title: "카카오 SDK 객체 초기화 실패",
        description: "스크립트는 로드됐지만 `window.kakao.maps`가 준비되지 않았습니다.",
        hints: [
          "NEXT_PUBLIC_KAKAO_MAP_KEY 값이 JavaScript 키인지 확인하세요.",
          `Kakao Developers > 플랫폼(Web)에 ${host} 도메인이 등록되어 있는지 확인하세요.`
        ]
      };
    }

    if (error.code === "MAP_INIT_FAILED") {
      return {
        title: "카카오 지도 인스턴스 생성 실패",
        description: "지도 객체 생성 단계에서 오류가 발생했습니다.",
        hints: [
          "브라우저 콘솔 에러의 `appkey`, `domain` 문구를 확인하세요.",
          "도메인 등록 후 개발 서버를 재시작하고 새로고침하세요."
        ]
      };
    }
  }

  return {
    title: "카카오 지도 로딩 실패",
    description: error instanceof Error ? error.message : "알 수 없는 오류",
    hints: [
      "키가 `.env.local`에 설정되어 있는지 확인하세요.",
      `Kakao Developers 플랫폼(Web)에 ${host}가 등록되어 있는지 확인하세요.`
    ]
  };
}

function loadKakaoScript(appKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new KakaoLoadError("UNKNOWN", "window is not available"));
      return;
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve());
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (!existing.src.includes("libraries=clusterer")) {
        existing.remove();
      } else {
        existing.addEventListener("load", () => {
          if (!window.kakao?.maps) {
            reject(new KakaoLoadError("SDK_UNAVAILABLE", "kakao maps object unavailable after script load"));
            return;
          }
          window.kakao.maps.load(() => resolve());
        });
        existing.addEventListener("error", () =>
          reject(new KakaoLoadError("SCRIPT_BLOCKED", "failed to load kakao map sdk script"))
        );
        return;
      }
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=clusterer`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new KakaoLoadError("SDK_UNAVAILABLE", "kakao maps object unavailable after script load"));
        return;
      }
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () =>
      reject(new KakaoLoadError("SCRIPT_BLOCKED", "failed to load kakao map sdk script"));
    document.head.appendChild(script);

    window.setTimeout(() => {
      if (!window.kakao?.maps) {
        reject(new KakaoLoadError("SCRIPT_TIMEOUT", "kakao map sdk load timeout"));
      }
    }, SCRIPT_TIMEOUT_MS);
  });
}

export function KakaoMapView({
  appKey,
  properties,
  selectedId,
  onSelect,
  onLoadError,
  className,
  mapClassName
}: KakaoMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const onLoadErrorRef = useRef<typeof onLoadError>(onLoadError);
  const clustererRef = useRef<any>(null);
  const markersRef = useRef<MarkerEntry[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<{
    title: string;
    description: string;
    hints: string[];
  } | null>(null);

  useEffect(() => {
    onLoadErrorRef.current = onLoadError;
  }, [onLoadError]);

  useEffect(() => {
    let mounted = true;

    loadKakaoScript(appKey)
      .then(() => {
        if (!mounted || !containerRef.current) {
          return;
        }
        if (!window.kakao?.maps) {
          throw new KakaoLoadError("SDK_UNAVAILABLE", "kakao maps object unavailable");
        }
        try {
          const center = new window.kakao.maps.LatLng(37.5665, 126.978);
          mapRef.current = new window.kakao.maps.Map(containerRef.current, {
            center,
            level: 9
          });
          const mapTypeControl = new window.kakao.maps.MapTypeControl();
          mapRef.current.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
          const zoomControl = new window.kakao.maps.ZoomControl();
          mapRef.current.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
          clustererRef.current = new window.kakao.maps.MarkerClusterer({
            map: mapRef.current,
            averageCenter: true,
            minLevel: 7,
            styles: [
              {
                width: "40px",
                height: "40px",
                background: "#2f6cf6",
                borderRadius: "9999px",
                color: "#ffffff",
                textAlign: "center",
                fontWeight: "700",
                lineHeight: "40px",
                border: "1px solid #1e4dd8",
                boxShadow: "0 2px 6px rgba(16, 24, 40, 0.2)"
              }
            ]
          });
          setMapReady(true);
        } catch (error) {
          throw new KakaoLoadError(
            "MAP_INIT_FAILED",
            error instanceof Error ? error.message : "map init failed"
          );
        }

        infoWindowRef.current = new window.kakao.maps.InfoWindow({ zIndex: 3 });
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return;
        }
        const host = window.location.origin;
        const parsed = parseLoadError(error, host);
        setLoadError(parsed);
        onLoadErrorRef.current?.(`${parsed.title}: ${parsed.description}`);
      });

    return () => {
      mounted = false;
      clustererRef.current?.clear();
      clustererRef.current = null;
      markersRef.current.forEach((entry) => {
        entry.marker.setMap(null);
      });
      markersRef.current = [];
      infoWindowRef.current = null;
      mapRef.current = null;
      setMapReady(false);
    };
  }, [appKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps || !mapReady) {
      return;
    }

    clustererRef.current?.clear();
    markersRef.current.forEach((entry) => {
      entry.marker.setMap(null);
    });
    markersRef.current = [];

    const withCoords = properties.filter(
      (property) => typeof property.lat === "number" && typeof property.lng === "number"
    );

    const bounds = new window.kakao.maps.LatLngBounds();

    withCoords.forEach((property) => {
      const position = new window.kakao.maps.LatLng(property.lat, property.lng);
      const marker = new window.kakao.maps.Marker({
        position
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        onSelect(property.id);
      });

      markersRef.current.push({ propertyId: property.id, marker });
      bounds.extend(position);
    });

    if (markersRef.current.length > 0) {
      clustererRef.current?.addMarkers(markersRef.current.map((entry) => entry.marker));
    }

    if (withCoords.length > 1 && !selectedId) {
      map.setBounds(bounds);
      if (map.getLevel() < 8) {
        map.setLevel(8);
      }
    } else if (withCoords.length === 1) {
      map.setCenter(new window.kakao.maps.LatLng(withCoords[0].lat, withCoords[0].lng));
      map.setLevel(selectedId ? 3 : 6);
    }
  }, [mapReady, onSelect, properties, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !infoWindow || !window.kakao?.maps || !mapReady) {
      return;
    }

    markersRef.current.forEach((entry) => {
      entry.marker.setZIndex(entry.propertyId === selectedId ? 10 : 1);
    });

    const selectedProperty = properties.find((property) => property.id === selectedId);
    const selectedMarker = markersRef.current.find((entry) => entry.propertyId === selectedId)?.marker;

    if (!selectedProperty || !selectedMarker || typeof selectedProperty.lat !== "number" || typeof selectedProperty.lng !== "number") {
      infoWindow.close();
      return;
    }

    const progress = calcProgress(selectedProperty.reservedAmount, selectedProperty.targetPrice);

    infoWindow.setContent(
      `<div style="padding:8px 10px; font-size:12px; line-height:1.45; min-width:180px;">
        <div style="font-weight:600; margin-bottom:3px;">${selectedProperty.name}</div>
        <div>${selectedProperty.address}</div>
        <div>수익률 ${formatPercent(selectedProperty.predictedYield)}</div>
        <div>진행률 ${formatPercent(progress)}</div>
      </div>`
    );

    infoWindow.open(map, selectedMarker);

    const focusPosition = new window.kakao.maps.LatLng(selectedProperty.lat, selectedProperty.lng);
    const currentLevel = map.getLevel();
    const targetLevel = 3;

    if (currentLevel > targetLevel) {
      map.setLevel(targetLevel, { animate: true });
    }
    map.panTo(focusPosition);
  }, [mapReady, properties, selectedId]);

  return (
    <div className={className ?? "surface-card relative overflow-hidden"}>
      {loadError ? (
        <div className="h-full min-h-[520px] p-4 text-sm text-slate-700">
          <p className="font-medium">{loadError.title}</p>
          <p className="mt-2 text-slate-600">{loadError.description}</p>
          <div className="mt-3 space-y-1 text-xs text-slate-600">
            {loadError.hints.map((hint) => (
              <p key={hint}>- {hint}</p>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className={mapClassName ?? "h-[520px] w-full"} ref={containerRef} />
        </>
      )}
    </div>
  );
}

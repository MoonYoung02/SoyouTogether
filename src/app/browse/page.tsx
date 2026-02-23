"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReservationPanel } from "@/components/ReservationPanel";
import { formatPercent, formatWon } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Property } from "@/lib/types";
import { statusLabel } from "@/lib/workflow";

const MapView = dynamic(
  () => import("@/components/MapView").then((module) => module.MapView),
  { ssr: false }
);
const KakaoMapView = dynamic(
  () => import("@/components/KakaoMapView").then((module) => module.KakaoMapView),
  { ssr: false }
);

function includesRegion(address: string, region: string) {
  if (region === "전체") {
    return true;
  }
  return address.includes(region);
}

function PropertyListItem({
  property,
  selected,
  onSelect
}: {
  property: Property;
  selected: boolean;
  onSelect: () => void;
}) {
  const progress = Math.min(100, (property.reservedAmount / Math.max(property.targetPrice, 1)) * 100);

  return (
    <button
      className={`w-full border-b border-slate-200 px-4 py-4 text-left transition ${
        selected ? "bg-blue-50" : "bg-white hover:bg-slate-50"
      }`}
      type="button"
      onClick={onSelect}
    >
      <div className="flex gap-3">
        <div className="h-24 w-24 shrink-0 rounded-md border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-semibold tracking-tight text-slate-900">{property.name}</p>
          <p className="mt-1 truncate text-sm text-slate-500">{property.address}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
            <span>{property.type}</span>
            <span>위험 {property.riskGrade}</span>
            <span>수익률 {formatPercent(property.predictedYield)}</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600">
            단계 {statusLabel[property.status]} · 참여자 {property.voterCount.toLocaleString("ko-KR")}명
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-1.5 rounded-full bg-[#4163f4]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            사전예약금 {formatWon(property.reservedAmount)} / 목표 {formatWon(property.targetPrice)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{property.stageNote ?? "단계 안내가 곧 업데이트됩니다."}</p>
        </div>
      </div>
    </button>
  );
}

export default function BrowsePage() {
  const { properties, user, createReservation } = useStore();
  const [region, setRegion] = useState("전체");
  const [assetType, setAssetType] = useState("전체");
  const [risk, setRisk] = useState("전체");
  const [minYield, setMinYield] = useState(0);
  const [kakaoFailed, setKakaoFailed] = useState(false);
  const [kakaoFailReason, setKakaoFailReason] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");
  const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const passRegion = includesRegion(property.address, region);
      const passType = assetType === "전체" ? true : property.type === assetType;
      const passRisk = risk === "전체" ? true : property.riskGrade === risk;
      const passYield = property.predictedYield >= minYield;
      return passRegion && passType && passRisk && passYield;
    });
  }, [assetType, minYield, properties, region, risk]);

  const selected: Property | undefined = filtered.find((item) => item.id === selectedId);

  const handleKakaoLoadError = useCallback((message: string) => {
    setKakaoFailed(true);
    setKakaoFailReason(message);
  }, []);

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId("");
      return;
    }
    if (!selectedId) {
      return;
    }
    const stillVisible = filtered.some((property) => property.id === selectedId);
    if (!stillVisible) {
      setSelectedId("");
    }
  }, [filtered, selectedId]);

  return (
    <div className="flex h-full flex-col bg-[#f5f6f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4 px-4 py-3 lg:px-5">
          <Link className="text-4xl font-black tracking-tight text-[#3868f7]" href="/">
            같이 소유해요
          </Link>
          <div className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-400">
            지역, 지하철, 대학, 단지, 매물번호
          </div>
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-700 lg:flex">
            <button className="text-[#3151ea]" type="button">지도</button>
            <button type="button">관심목록</button>
            <Link href="/admin">수요 대시보드</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-200 px-4 py-2 lg:px-5">
          <select
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            value={assetType}
            onChange={(event) => setAssetType(event.target.value)}
          >
            <option>전체</option>
            <option>오피스</option>
            <option>상가</option>
            <option>주거</option>
            <option>물류</option>
            <option>기타</option>
          </select>
          <select
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option>전체</option>
            <option>서울</option>
            <option>경기</option>
            <option>부산</option>
            <option>인천</option>
            <option>대전</option>
          </select>
          <select
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            value={risk}
            onChange={(event) => setRisk(event.target.value)}
          >
            <option>전체</option>
            <option>LOW</option>
            <option>MID</option>
            <option>HIGH</option>
          </select>
          <label className="ml-1 flex items-center gap-2 text-xs text-slate-600">
            최소 수익률 {minYield.toFixed(1)}%
            <input
              className="w-28"
              type="range"
              min={0}
              max={12}
              step={0.1}
              value={minYield}
              onChange={(event) => setMinYield(Number(event.target.value))}
            />
          </label>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="h-full w-full shrink-0 border-r border-slate-200 bg-white md:w-[360px] lg:w-[430px]">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">매물</p>
              <p className="mt-2 text-xs text-slate-500">
                총 {filtered.length}개 표시 {kakaoFailed && kakaoFailReason ? `| 지도 오류: ${kakaoFailReason}` : ""}
              </p>
              <p className="mt-1 text-xs text-slate-500">사전예약금은 수요 확인 단계 금액으로, 공모 단계에서 실제 참여가 확정됩니다.</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="p-4 text-sm text-slate-600">조건에 맞는 매물이 없습니다.</p>
              ) : (
                filtered.map((property) => (
                  <PropertyListItem
                    key={property.id}
                    property={property}
                    selected={property.id === selected?.id}
                    onSelect={() => setSelectedId(property.id)}
                  />
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="relative min-w-0 flex-1">
          {filtered.length > 0 ? (
            kakaoMapKey && !kakaoFailed ? (
              <KakaoMapView
                appKey={kakaoMapKey}
                properties={filtered}
                selectedId={selected?.id}
                onSelect={setSelectedId}
                onLoadError={handleKakaoLoadError}
                className="h-full rounded-none border-0"
                mapClassName="h-full w-full"
              />
            ) : (
              <MapView
                properties={filtered}
                selectedId={selected?.id}
                onSelect={setSelectedId}
                className="h-full rounded-none border-0"
                mapClassName="h-full w-full"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">지도에 표시할 매물이 없습니다.</div>
          )}
        </section>
      </div>

      {selected ? (
        <div className="fixed bottom-4 right-4 z-20 w-[340px] max-w-[calc(100vw-24px)] lg:bottom-6 lg:right-6">
          <ReservationPanel
            property={selected}
            reservationLimit={user.reservationLimit}
            onReserve={(amount) => createReservation(selected.id, amount)}
          />
        </div>
      ) : null}
    </div>
  );
}

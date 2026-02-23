"use client";

import Link from "next/link";
import { formatPercent, formatWon } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  computeDemandKpi,
  computeFunnelMetrics,
  computePriorityBoard,
  computeRegionSummaries
} from "@/lib/analytics";
import { statusLabel } from "@/lib/workflow";

function ratioLabel(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function AdminPage() {
  const state = useStore();
  const kpi = computeDemandKpi(state);
  const regions = computeRegionSummaries(state);
  const priorities = computePriorityBoard(state);
  const funnel = computeFunnelMetrics(state);

  const maxRegionHotness = Math.max(1, ...regions.map((region) => region.hotnessScore));
  const funnelMax = Math.max(1, funnel.votingOpen, funnel.votingMet, funnel.publicOffer, funnel.tradable);

  return (
    <div className="space-y-4">
      <section className="surface-card p-5">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">수요 데이터 운영 대시보드</h1>
        <p className="mt-1 text-sm text-slate-600">
          사전예약금 기반 수요를 분석해 매입/공모 우선순위를 결정합니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="soft-pill">사전예약금은 수요 확인 단계 금액</span>
          <span className="soft-pill">공모 단계에서 실제 참여 확정</span>
          <Link className="soft-pill" href="/browse">지도로 돌아가기</Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="surface-card p-4">
          <p className="text-xs text-slate-500">총 사전예약금</p>
          <p className="mt-1 text-xl font-semibold">{formatWon(kpi.totalIntent)}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs text-slate-500">활성 참여자</p>
          <p className="mt-1 text-xl font-semibold">{kpi.uniqueParticipants.toLocaleString("ko-KR")}명</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs text-slate-500">목표 달성 매물</p>
          <p className="mt-1 text-xl font-semibold">{kpi.votingMetCount}건</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs text-slate-500">공모 성사율</p>
          <p className="mt-1 text-xl font-semibold">{ratioLabel(kpi.offerSuccessRate)}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs text-slate-500">이행 전환율</p>
          <p className="mt-1 text-xl font-semibold">{ratioLabel(kpi.fulfillmentRate)}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">지역 수요 지수</h2>
          <div className="mt-3 space-y-3">
            {regions.map((region) => (
              <div key={region.regionCode}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <p>{region.regionCode}</p>
                  <p>
                    매물 {region.propertyCount}개 · 참여자 {region.uniqueParticipants.toLocaleString("ko-KR")}명
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#3654ea] to-[#6282ff]"
                    style={{ width: `${Math.min(100, (region.hotnessScore / maxRegionHotness) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">사전예약금 {formatWon(region.intentTotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">전환 퍼널</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "사전예약 진행", value: funnel.votingOpen },
              { label: "목표 달성", value: funnel.votingMet },
              { label: "공모 진행", value: funnel.publicOffer },
              { label: "거래 가능", value: funnel.tradable }
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <p>{item.label}</p>
                  <p>{item.value}건</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-[#3e5bf2]"
                    style={{ width: `${Math.min(100, (item.value / funnelMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">매입 우선순위 보드</h2>
        <p className="mt-1 text-xs text-slate-500">
          우선순위 점수 = 달성률(60) + 최근 7일 성장률(30) + 참여 분산도(10)
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="px-2 py-2">매물</th>
                <th className="px-2 py-2">단계</th>
                <th className="px-2 py-2">달성률</th>
                <th className="px-2 py-2">7일 성장률</th>
                <th className="px-2 py-2">상위5 집중도</th>
                <th className="px-2 py-2">우선순위</th>
              </tr>
            </thead>
            <tbody>
              {priorities.slice(0, 12).map((row) => (
                <tr className="border-t border-slate-200" key={row.property.id}>
                  <td className="px-2 py-2">
                    <p className="font-medium text-slate-900">{row.property.name}</p>
                    <p className="text-xs text-slate-500">{row.property.address}</p>
                  </td>
                  <td className="px-2 py-2 text-xs text-slate-700">{statusLabel[row.property.status]}</td>
                  <td className="px-2 py-2 text-xs text-slate-700">{formatPercent(row.coverage * 100)}</td>
                  <td className="px-2 py-2 text-xs text-slate-700">{formatPercent(row.growth7d * 100)}</td>
                  <td className="px-2 py-2 text-xs text-slate-700">{formatPercent(row.concentrationTop5 * 100)}</td>
                  <td className="px-2 py-2 font-semibold text-slate-900">{row.priorityScore.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

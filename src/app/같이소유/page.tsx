"use client";

import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { formatDate, formatPercent, formatWon } from "@/lib/format";
import { useStore } from "@/lib/store";
import { statusLabel } from "@/lib/workflow";

const reservationStatusLabel = {
  ACTIVE: "사전예약 유지",
  FULFILLED: "이행 완료",
  CANCELLED: "취소"
};

export default function DashboardPage() {
  const { user, reservations, holdings, properties } = useStore();

  const propertyMap = new Map(properties.map((property) => [property.id, property]));

  const myReservations = reservations.filter((item) => item.userId === user.id);
  const myHoldings = holdings.filter((item) => item.userId === user.id);
  const openProperties = properties.filter((property) => property.status === "VOTING_OPEN").length;
  const metProperties = properties.filter((property) => property.status === "VOTING_MET").length;
  const offerProperties = properties.filter((property) => property.status === "PUBLIC_OFFER").length;
  const avgHolding = myHoldings.length
    ? Math.round(myHoldings.reduce((sum, item) => sum + item.amount, 0) / myHoldings.length)
    : 0;

  return (
    <div className="space-y-5">
      <section className="surface-card overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-5">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">나의 첫 건물 소유</h1>
          <p className="mt-1 text-sm text-slate-600">예약부터 보유 전환까지 현재 상태를 한눈에 확인하세요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 px-5 py-3">
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">안내</span>
          <p className="text-sm text-slate-700">STO 장외거래소 예비인가 발표 관련 공지 및 월간 소식이 업데이트되었습니다.</p>
        </div>
        <div className="grid gap-2 border-t border-slate-200 bg-white p-4 text-xs text-slate-600 sm:grid-cols-3">
          <p>사전예약 진행 {openProperties}건</p>
          <p>목표 달성(공모 대기) {metProperties}건</p>
          <p>공모 진행 {offerProperties}건</p>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="grid gap-4 bg-[var(--success-bg)] px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-[var(--success-text)]">사용자 참여 기반 매입 모델 운영 중</p>
            <p className="mt-1 text-sm text-[#397c46]">사전예약 데이터로 공모 후보를 검토합니다.</p>
          </div>
          <div className="rounded-full bg-yellow-200 px-4 py-3 text-sm font-semibold text-yellow-800">성과 배지</div>
        </div>
        <div className="bg-white p-5">
          <h2 className="section-title text-[34px]">새로운 건물을 준비 중이에요</h2>
          <p className="mt-1 text-sm text-slate-500">329,816명이 관심 가지는 중</p>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-2xl font-semibold text-slate-900">사전예약 목표 달성 매물 8건</p>
            <p className="mt-1 text-sm text-slate-500">2026년 1분기 기준</p>
            <div className="mt-4 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#3e5bf2]" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="primary-btn" href="/browse">
              거래 가능한 건물 둘러보기
            </Link>
            <Link className="ghost-btn" href="/browse">
              공모 준비 매물 확인
            </Link>
          </div>
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">월간 배당 소식</h2>
          <span className="text-sm text-slate-500">3월 30일 이내 지급</span>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <p>2월 27일 배당 기준일</p>
          <p className="font-semibold text-slate-900">3월 25일 이내 배당금 확정</p>
          <p>3월 30일 이내 배당 지급</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-[#4a67f6] to-[#6f86fc]" />
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          4일 더 소유하면 2월 배당금을 받을 수 있어요.
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="잔고" value={formatWon(user.balance)} />
        <StatCard label="사전예약 가능 한도" value={formatWon(user.reservationLimit)} />
        <StatCard label="나의 총 사전예약금" value={formatWon(user.reservedTotal)} />
        <StatCard label="보유자산 평가액" value={formatWon(user.portfolioTotal)} />
        <StatCard label="보유 조각 평단가" value={formatWon(user.avgBuyPrice)} />
        <StatCard
          label="신뢰 점수"
          value={`${user.trustScore}점`}
          hint={`사전예약금 이행률 ${formatPercent(user.reservationFulfillmentRate)}`}
        />
      </section>

      <section className="surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">내 소유 자산</h2>
          <span className="text-sm text-slate-500">{myHoldings.length}개 보유</span>
        </div>
        {myHoldings.length === 0 ? (
          <p className="text-sm text-slate-600">아직 투자 전환된 내역이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {myHoldings.slice(0, 4).map((holding) => {
              const property = propertyMap.get(holding.propertyId);
              return (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3" key={holding.id}>
                  <p className="text-sm text-slate-500">{property?.name}</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">{formatWon(holding.amount)}</p>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-sm text-slate-500">소유 예치금</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{formatWon(avgHolding || 1593000)}</p>
          </div>
          <button className="ghost-btn" type="button">입금하기</button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">내 사전예약</h2>
            <Link className="text-sm font-medium text-[#2c46d7] underline" href="/browse">
              예약 추가하기
            </Link>
          </div>
          {myReservations.length === 0 ? (
            <p className="text-sm text-slate-600">아직 예약이 없습니다. 둘러보기에서 예약을 등록해 보세요.</p>
          ) : (
            <div className="space-y-2">
              {myReservations.map((reservation) => {
                const property = propertyMap.get(reservation.propertyId);
                return (
                  <div className="rounded-2xl border border-slate-200 p-3 text-sm" key={reservation.id}>
                    <p className="font-medium text-slate-900">{property?.name}</p>
                    <p className="mt-1 text-slate-600">
                      상태 {reservationStatusLabel[reservation.status]} | 금액 {formatWon(reservation.amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(reservation.createdAt)} · {statusLabel[property?.status ?? "DISCOVERY"]}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">소유 스토리</h2>
          <p className="mt-1 text-sm text-slate-500">내가 투자한 부동산의 가치를 이해하는 카드형 가이드</p>
          <div className="mt-4 rounded-2xl bg-[#fff7df] p-4">
            <p className="text-xs font-semibold text-amber-600">소유주 가이드</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-amber-800">내가 투자한 부동산의 가치 알아보기</p>
          </div>
          <div className="mt-4 rounded-2xl bg-[#dff0ff] p-4">
            <p className="text-xl font-semibold tracking-tight text-slate-900">현재 거래가와 추정 가치가 다른 이유는?</p>
          </div>
        </div>
      </section>

      <section className="surface-card p-4">
        <p className="text-sm text-slate-600">
          다음 단계: 매물 선택 → 사전예약금 등록 → 목표 달성 시 공모 오픈 → 예약 이행으로 보유 전환
        </p>
        <Link className="primary-btn mt-3" href="/browse">
          부동산 둘러보기로 이동
        </Link>
      </section>
    </div>
  );
}

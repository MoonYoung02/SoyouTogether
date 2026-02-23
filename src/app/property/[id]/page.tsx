"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ProgressBar } from "@/components/ProgressBar";
import { ReservationPanel } from "@/components/ReservationPanel";
import { calcProgress, formatDate, formatPercent, formatWon } from "@/lib/format";
import { useStore } from "@/lib/store";
import { canFulfill, canOpenOffer, canReserve, statusDescription, statusLabel } from "@/lib/workflow";

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    user,
    reservations,
    getPropertyById,
    createReservation,
    openPublicOffer,
    fulfillReservation,
    getMyActiveReservationByProperty
  } = useStore();

  const property = getPropertyById(params.id);

  const recentReservations = useMemo(
    () => reservations.filter((item) => item.propertyId === params.id).slice(0, 5),
    [params.id, reservations]
  );

  if (!property) {
    return (
      <section className="surface-card p-4">
        <p className="text-sm">존재하지 않는 매물입니다.</p>
        <Link className="mt-2 inline-block text-sm font-medium text-[#2c46d7] underline" href="/browse">
          둘러보기로 돌아가기
        </Link>
      </section>
    );
  }

  const progress = calcProgress(property.reservedAmount, property.targetPrice);
  const canOpenPublic = property.reservedAmount >= property.targetPrice && canOpenOffer(property.status);
  const myActiveReservation = getMyActiveReservationByProperty(property.id);

  const expectedAllocation = myActiveReservation
    ? Math.round(
        myActiveReservation.amount * Math.min(1, property.targetPrice / Math.max(property.reservedAmount, 1))
      )
    : 0;

  return (
    <div className="space-y-4">
      <section className="surface-card overflow-hidden">
        <div className="bg-gradient-to-r from-[#3e5bf2] to-[#5572f7] px-5 py-4 text-white">
          <p className="text-sm text-blue-100">매물 상세</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{property.name}</h1>
          <p className="mt-1 text-sm text-blue-100">{property.address}</p>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-600">
            유형 {property.type} | 예상수익률 {formatPercent(property.predictedYield)} | 위험도 {property.riskGrade}
          </p>
          <p className="mt-1 text-sm text-slate-600">참여자 {property.voterCount.toLocaleString("ko-KR")}명</p>
          <p className="mt-1 text-xs text-slate-500">{property.stageNote ?? statusDescription[property.status]}</p>
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">상태: {statusLabel[property.status]}</p>
          {canOpenPublic ? <span className="soft-pill border-[#2137b5] text-[#2137b5]">공모 오픈 가능</span> : null}
        </div>
        <p className="text-sm text-slate-700">
          사전예약금 총액 {formatWon(property.reservedAmount)} / 목표금액 {formatWon(property.targetPrice)}
        </p>
        <div className="mt-2">
          <ProgressBar value={progress} />
        </div>
      </section>

      {canReserve(property.status) ? (
        <ReservationPanel
          property={property}
          reservationLimit={user.reservationLimit}
          onReserve={(amount) => createReservation(property.id, amount)}
        />
      ) : null}

      <section className="surface-card p-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">액션</h2>
        <p className="mt-1 text-sm text-slate-600">상태에 맞는 버튼으로 다음 단계를 실행할 수 있습니다.</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {canReserve(property.status) ? (
            <Link className="ghost-btn" href="/browse">
              사전예약금 등록하기
            </Link>
          ) : null}

          {canOpenPublic ? (
            <button
              className="primary-btn"
              type="button"
              onClick={() => openPublicOffer(property.id)}
            >
              공모 오픈
            </button>
          ) : null}

          {canFulfill(property.status) && myActiveReservation ? (
            <button
              className="primary-btn"
              type="button"
              onClick={() => fulfillReservation(myActiveReservation.id)}
            >
              예약 이행(투자 전환)
            </button>
          ) : null}
        </div>

        {canFulfill(property.status) && myActiveReservation ? (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <p>내 사전예약금: {formatWon(myActiveReservation.amount)}</p>
            <p>공모 배정 예상(목업): {formatWon(expectedAllocation)}</p>
          </div>
        ) : null}
      </section>

      <section className="surface-card p-5">
        <h2 className="mb-3 text-xl font-semibold tracking-tight text-slate-900">최근 예약 목록</h2>
        {recentReservations.length === 0 ? (
          <p className="text-sm text-slate-600">아직 예약이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {recentReservations.map((reservation) => (
              <div className="rounded-2xl border border-slate-200 p-3 text-sm" key={reservation.id}>
                <p className="font-medium text-slate-900">
                  예약자 {reservation.userId} | 상태 {reservation.status}
                </p>
                <p className="text-slate-600">
                  금액 {formatWon(reservation.amount)} | 생성일 {formatDate(reservation.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

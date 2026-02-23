"use client";

import { useMemo, useState } from "react";
import { formatWon } from "@/lib/format";
import type { Property } from "@/lib/types";
import { canReserve, statusDescription, statusLabel } from "@/lib/workflow";

interface ReservationPanelProps {
  property: Property;
  reservationLimit: number;
  onReserve: (amount: number) => { ok: boolean; message: string };
}

export function ReservationPanel({ property, reservationLimit, onReserve }: ReservationPanelProps) {
  const [amountInput, setAmountInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const amount = useMemo(() => Number(amountInput || 0), [amountInput]);

  const reservable = canReserve(property.status);

  const submit = () => {
    if (!reservable) {
      setMessage(`현재 단계(${statusLabel[property.status]})에서는 사전예약금을 등록할 수 없습니다.`);
      return;
    }
    const result = onReserve(amount);
    setMessage(result.message);
    if (result.ok) {
      setAmountInput("");
    }
  };

  return (
    <div className="surface-card p-5">
      <p className="text-lg font-semibold tracking-tight text-slate-900">사전예약금 등록</p>
      <p className="mt-1 text-sm text-slate-700">{property.name}</p>
      <p className="mt-1 text-xs text-slate-500">내 사전예약 가능 한도 {formatWon(reservationLimit)}</p>
      <p className="mt-1 text-xs text-slate-500">현재 단계: {statusLabel[property.status]} · {statusDescription[property.status]}</p>
      <label className="mt-4 block text-sm font-medium text-slate-700">사전예약금 금액</label>
      <input
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
        type="number"
        min={0}
        value={amountInput}
        onChange={(event) => setAmountInput(event.target.value)}
        placeholder="예: 5000000"
        disabled={!reservable}
      />
      <button
        className="primary-btn mt-4 w-full"
        type="button"
        onClick={submit}
        disabled={!reservable}
      >
        사전예약금 등록하기
      </button>
      {message ? <p className="mt-2 text-xs text-slate-700">{message}</p> : null}
    </div>
  );
}

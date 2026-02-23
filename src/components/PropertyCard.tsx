import Link from "next/link";
import { calcProgress, formatPercent, formatWon } from "@/lib/format";
import type { Property } from "@/lib/types";
import { statusDescription, statusLabel } from "@/lib/workflow";
import { ProgressBar } from "@/components/ProgressBar";

interface PropertyCardProps {
  property: Property;
  selected?: boolean;
  onSelect?: () => void;
}

export function PropertyCard({ property, selected, onSelect }: PropertyCardProps) {
  const progress = calcProgress(property.reservedAmount, property.targetPrice);
  const canOpen = property.status === "VOTING_MET";

  const classes = `surface-card p-4 transition ${
    selected ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"
  }`;

  const content = (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold tracking-tight">{property.name}</p>
          <p className="text-xs text-slate-500">{property.address}</p>
        </div>
        <span className="soft-pill">{statusLabel[property.status]}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
        <p>유형: {property.type}</p>
        <p>위험도: {property.riskGrade}</p>
        <p>목표금액: {formatWon(property.targetPrice)}</p>
        <p>사전예약금: {formatWon(property.reservedAmount)}</p>
      </div>
      <p className="mt-2 text-xs text-slate-500">{property.stageNote ?? statusDescription[property.status]}</p>
      <p className="mt-1 text-xs text-slate-500">참여자 {property.voterCount.toLocaleString("ko-KR")}명</p>
      <div className="mt-2">
        <ProgressBar value={progress} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <p className="font-medium text-slate-700">예상수익률 {formatPercent(property.predictedYield)}</p>
        <div className="flex items-center gap-2">
          {canOpen ? <span className="rounded-full border border-[#2137b5] px-2 py-0.5 text-[#2137b5]">공모 가능</span> : null}
          <Link className="font-medium text-[#2c46d7] underline" href={`/property/${property.id}`}>
            상세
          </Link>
        </div>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button className={`${classes} w-full text-left`} type="button" onClick={onSelect}>
        {content}
      </button>
    );
  }

  return (
    <div className={classes}>{content}</div>
  );
}

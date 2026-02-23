import { formatPercent } from "@/lib/format";

interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-[#304be1] to-[#5a77f8]"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-600">진행률: {formatPercent(value)}</p>
    </div>
  );
}

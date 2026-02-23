export function formatWon(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(Math.round(value))}원`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR");
}

export function calcProgress(current: number, target: number) {
  if (target <= 0) {
    return 0;
  }
  return (current / target) * 100;
}

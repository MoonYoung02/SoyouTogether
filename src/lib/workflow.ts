import type { PropertyStatus } from "@/lib/types";

export const statusLabel: Record<PropertyStatus, string> = {
  DISCOVERY: "검토중",
  VOTING_OPEN: "사전예약 진행",
  VOTING_MET: "목표 달성",
  PUBLIC_OFFER: "공모 진행",
  TRADABLE: "거래 가능",
  CLOSED: "종료"
};

export const statusDescription: Record<PropertyStatus, string> = {
  DISCOVERY: "조건부 계약 검토 단계로, 사전예약 오픈 전입니다.",
  VOTING_OPEN: "사전예약금을 등록해 수요를 모으는 단계입니다.",
  VOTING_MET: "사전예약금 목표 달성. 공모 오픈 대기 상태입니다.",
  PUBLIC_OFFER: "공모가 진행 중이며 예약 이행(투자 전환)이 가능합니다.",
  TRADABLE: "공모/배정 완료 후 거래 가능한 상태입니다.",
  CLOSED: "종료된 매물입니다."
};

export function canReserve(status: PropertyStatus) {
  return status === "VOTING_OPEN";
}

export function canOpenOffer(status: PropertyStatus) {
  return status === "VOTING_MET";
}

export function canFulfill(status: PropertyStatus) {
  return status === "PUBLIC_OFFER";
}

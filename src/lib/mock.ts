import type { AppState, Property } from "@/lib/types";

const user = {
  id: "u1",
  name: "홍길동",
  balance: 35000000,
  reservationLimit: 10000000,
  reservedTotal: 0,
  portfolioTotal: 8200000,
  avgBuyPrice: 104000,
  trustScore: 62,
  reservationFulfillmentRate: 0
};

type Seed = {
  name: string;
  address: string;
  type: Property["type"];
  targetPrice: number;
  reserveRatio: number;
  predictedYield: number;
  riskGrade: Property["riskGrade"];
  status?: Property["status"];
  voterCount?: number;
  stageNote?: string;
  lat: number;
  lng: number;
};

const seeds: Seed[] = [
  { name: "서울 강남 오피스 A", address: "서울 강남구 테헤란로 123", type: "오피스", targetPrice: 12000000000, reserveRatio: 0.55, predictedYield: 7.2, riskGrade: "MID", status: "VOTING_OPEN", voterCount: 142, stageNote: "사전예약금 모집 중", lat: 37.503, lng: 127.044 },
  { name: "서울 강남 오피스 B", address: "서울 강남구 역삼로 311", type: "오피스", targetPrice: 9800000000, reserveRatio: 0.42, predictedYield: 6.8, riskGrade: "MID", status: "DISCOVERY", voterCount: 34, stageNote: "조건부 계약 검토 단계", lat: 37.499, lng: 127.036 },
  { name: "성수 상가 A", address: "서울 성동구 성수이로 45", type: "상가", targetPrice: 5300000000, reserveRatio: 0.4, predictedYield: 8.1, riskGrade: "MID", status: "VOTING_OPEN", voterCount: 89, stageNote: "사전예약금 모집 중", lat: 37.545, lng: 127.057 },
  { name: "성수 상가 B", address: "서울 성동구 연무장길 78", type: "상가", targetPrice: 6100000000, reserveRatio: 0.63, predictedYield: 8.5, riskGrade: "MID", status: "VOTING_MET", voterCount: 176, stageNote: "목표 달성, 공모 오픈 대기", lat: 37.544, lng: 127.052 },
  { name: "마포 복합 상업시설", address: "서울 마포구 양화로 131", type: "상가", targetPrice: 8400000000, reserveRatio: 0.71, predictedYield: 7.9, riskGrade: "MID", status: "VOTING_MET", voterCount: 211, stageNote: "내부 매입 심사 진행", lat: 37.555, lng: 126.923 },
  { name: "여의도 오피스 타워", address: "서울 영등포구 국제금융로 10", type: "오피스", targetPrice: 11400000000, reserveRatio: 0.67, predictedYield: 6.9, riskGrade: "LOW", status: "VOTING_OPEN", voterCount: 120, stageNote: "사전예약금 모집 중", lat: 37.525, lng: 126.926 },
  { name: "용산 업무시설", address: "서울 용산구 한강대로 95", type: "오피스", targetPrice: 7600000000, reserveRatio: 0.33, predictedYield: 7.1, riskGrade: "MID", lat: 37.531, lng: 126.965 },
  { name: "종로 도심 리테일", address: "서울 종로구 종로 112", type: "상가", targetPrice: 5800000000, reserveRatio: 0.88, predictedYield: 8.2, riskGrade: "MID", lat: 37.57, lng: 126.992 },
  { name: "을지로 오피스", address: "서울 중구 을지로 220", type: "오피스", targetPrice: 6900000000, reserveRatio: 0.53, predictedYield: 7.3, riskGrade: "MID", lat: 37.565, lng: 126.997 },
  { name: "서초 주거 리츠", address: "서울 서초구 서초대로 260", type: "주거", targetPrice: 9100000000, reserveRatio: 0.47, predictedYield: 5.9, riskGrade: "LOW", lat: 37.493, lng: 127.014 },
  { name: "송파 주거 단지", address: "서울 송파구 올림픽로 300", type: "주거", targetPrice: 10500000000, reserveRatio: 0.61, predictedYield: 5.7, riskGrade: "LOW", lat: 37.513, lng: 127.102 },
  { name: "잠실 상가", address: "서울 송파구 올림픽로 145", type: "상가", targetPrice: 6600000000, reserveRatio: 0.59, predictedYield: 7.8, riskGrade: "MID", lat: 37.511, lng: 127.09 },
  { name: "강동 업무복합", address: "서울 강동구 천호대로 1005", type: "오피스", targetPrice: 7100000000, reserveRatio: 0.36, predictedYield: 7.4, riskGrade: "MID", lat: 37.539, lng: 127.123 },
  { name: "마곡 오피스 A", address: "서울 강서구 마곡중앙로 76", type: "오피스", targetPrice: 7200000000, reserveRatio: 0.35, predictedYield: 7.0, riskGrade: "MID", lat: 37.56, lng: 126.83 },
  { name: "마곡 오피스 B", address: "서울 강서구 공항대로 209", type: "오피스", targetPrice: 6800000000, reserveRatio: 0.48, predictedYield: 7.2, riskGrade: "MID", lat: 37.559, lng: 126.842 },
  { name: "노원 주거 타운", address: "서울 노원구 동일로 1405", type: "주거", targetPrice: 5400000000, reserveRatio: 0.52, predictedYield: 5.5, riskGrade: "LOW", lat: 37.654, lng: 127.061 },
  { name: "수유 상권 상가", address: "서울 강북구 도봉로 358", type: "상가", targetPrice: 5000000000, reserveRatio: 0.44, predictedYield: 8.0, riskGrade: "MID", lat: 37.637, lng: 127.025 },
  { name: "광화문 프라임 오피스", address: "서울 종로구 세종대로 149", type: "오피스", targetPrice: 11900000000, reserveRatio: 1.12, predictedYield: 6.6, riskGrade: "LOW", status: "PUBLIC_OFFER", voterCount: 296, stageNote: "공모 진행 중", lat: 37.571, lng: 126.976 },
  { name: "분당 오피스 A", address: "경기 성남시 분당구 황새울로 12", type: "오피스", targetPrice: 6800000000, reserveRatio: 0.91, predictedYield: 6.4, riskGrade: "LOW", lat: 37.378, lng: 127.112 },
  { name: "분당 오피스 B", address: "경기 성남시 분당구 판교역로 166", type: "오피스", targetPrice: 8700000000, reserveRatio: 0.62, predictedYield: 6.7, riskGrade: "LOW", lat: 37.395, lng: 127.111 },
  { name: "판교 테크 오피스", address: "경기 성남시 분당구 대왕판교로 660", type: "오피스", targetPrice: 11100000000, reserveRatio: 0.58, predictedYield: 7.1, riskGrade: "MID", lat: 37.401, lng: 127.108 },
  { name: "광교 주거", address: "경기 수원시 영통구 광교로 18", type: "주거", targetPrice: 5900000000, reserveRatio: 0.7, predictedYield: 5.8, riskGrade: "LOW", lat: 37.287, lng: 127.054 },
  { name: "수원 영통 상가", address: "경기 수원시 영통구 봉영로 1612", type: "상가", targetPrice: 5500000000, reserveRatio: 0.39, predictedYield: 8.3, riskGrade: "MID", lat: 37.252, lng: 127.07 },
  { name: "용인 물류센터", address: "경기 용인시 처인구 백암로 77", type: "물류", targetPrice: 9600000000, reserveRatio: 0.46, predictedYield: 8.8, riskGrade: "MID", lat: 37.152, lng: 127.388 },
  { name: "의정부 주거", address: "경기 의정부시 시민로 80", type: "주거", targetPrice: 5200000000, reserveRatio: 0.56, predictedYield: 5.6, riskGrade: "LOW", lat: 37.738, lng: 127.047 },
  { name: "고양 상가", address: "경기 고양시 일산동구 중앙로 1283", type: "상가", targetPrice: 6200000000, reserveRatio: 0.41, predictedYield: 7.7, riskGrade: "MID", lat: 37.658, lng: 126.77 },
  { name: "부천 오피스", address: "경기 부천시 길주로 180", type: "오피스", targetPrice: 6000000000, reserveRatio: 0.37, predictedYield: 7.0, riskGrade: "MID", lat: 37.503, lng: 126.766 },
  { name: "인천 물류 A", address: "인천 연수구 송도과학로 18", type: "물류", targetPrice: 9500000000, reserveRatio: 0.6, predictedYield: 8.7, riskGrade: "MID", lat: 37.388, lng: 126.643 },
  { name: "인천 물류 B", address: "인천 중구 축항대로 296", type: "물류", targetPrice: 8800000000, reserveRatio: 0.49, predictedYield: 8.4, riskGrade: "MID", lat: 37.462, lng: 126.627 },
  { name: "송도 상업시설", address: "인천 연수구 컨벤시아대로 165", type: "상가", targetPrice: 5600000000, reserveRatio: 0.65, predictedYield: 7.6, riskGrade: "MID", lat: 37.391, lng: 126.637 },
  { name: "김포 물류 허브", address: "경기 김포시 양촌읍 황금로 109", type: "물류", targetPrice: 10400000000, reserveRatio: 0.43, predictedYield: 8.9, riskGrade: "HIGH", lat: 37.644, lng: 126.67 },
  { name: "하남 복합상업", address: "경기 하남시 미사강변중앙로 220", type: "상가", targetPrice: 6700000000, reserveRatio: 0.51, predictedYield: 7.5, riskGrade: "MID", lat: 37.566, lng: 127.194 },
  { name: "안양 주거", address: "경기 안양시 동안구 시민대로 230", type: "주거", targetPrice: 5300000000, reserveRatio: 0.54, predictedYield: 5.4, riskGrade: "LOW", lat: 37.392, lng: 126.953 },
  { name: "과천 오피스", address: "경기 과천시 별양상가로 2", type: "오피스", targetPrice: 7800000000, reserveRatio: 0.57, predictedYield: 6.5, riskGrade: "LOW", lat: 37.429, lng: 126.988 },
  { name: "대전 둔산 상가", address: "대전 서구 둔산로 28", type: "상가", targetPrice: 5000000000, reserveRatio: 0.7, predictedYield: 7.9, riskGrade: "MID", status: "TRADABLE", voterCount: 204, stageNote: "배정 완료, 거래 가능", lat: 36.35, lng: 127.378 },
  { name: "부산 해운대 생활형 숙박", address: "부산 해운대구 해운대로 512", type: "기타", targetPrice: 7600000000, reserveRatio: 0.4, predictedYield: 9.4, riskGrade: "HIGH", status: "DISCOVERY", voterCount: 22, stageNote: "매입 검토중", lat: 35.163, lng: 129.163 }
];

const properties: Property[] = seeds.map((seed, index) => ({
  id: `p${index + 1}`,
  name: seed.name,
  address: seed.address,
  type: seed.type,
  targetPrice: seed.targetPrice,
  reservedAmount: Math.round(seed.targetPrice * seed.reserveRatio),
  predictedYield: seed.predictedYield,
  riskGrade: seed.riskGrade,
  status: seed.status ?? "VOTING_OPEN",
  voterCount: seed.voterCount ?? Math.max(12, Math.round(seed.reserveRatio * 220)),
  stageNote: seed.stageNote,
  lat: seed.lat,
  lng: seed.lng
}));

export const initialState: AppState = {
  user,
  properties,
  reservations: [],
  holdings: [],
  demandEvents: []
};

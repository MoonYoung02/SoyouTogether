export type PropertyType = "오피스" | "상가" | "주거" | "물류" | "기타";
export type RiskGrade = "LOW" | "MID" | "HIGH";

export type PropertyStatus =
  | "DISCOVERY"
  | "VOTING_OPEN"
  | "VOTING_MET"
  | "PUBLIC_OFFER"
  | "TRADABLE"
  | "CLOSED";

export type ReservationStatus = "ACTIVE" | "FULFILLED" | "CANCELLED";
export type DemandEventType = "CREATE" | "UPDATE" | "CANCEL" | "FULFILL" | "STAGE_CHANGE";

export interface User {
  id: string;
  name: string;
  balance: number;
  reservationLimit: number;
  reservedTotal: number;
  portfolioTotal: number;
  avgBuyPrice: number;
  trustScore: number;
  reservationFulfillmentRate: number;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  targetPrice: number;
  reservedAmount: number;
  predictedYield: number;
  riskGrade: RiskGrade;
  status: PropertyStatus;
  voterCount: number;
  stageNote?: string;
  image?: string;
  lat?: number;
  lng?: number;
}

export interface Reservation {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  createdAt: string;
  status: ReservationStatus;
}

export interface Holding {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  avgPrice: number;
  createdAt: string;
}

export interface DemandEvent {
  id: string;
  userId: string;
  propertyId: string;
  regionCode: string;
  eventType: DemandEventType;
  intentAmount: number;
  statusBefore?: PropertyStatus;
  statusAfter?: PropertyStatus;
  createdAt: string;
  sessionId: string;
  channel: "web" | "app";
}

export interface AppState {
  user: User;
  properties: Property[];
  reservations: Reservation[];
  holdings: Holding[];
  demandEvents: DemandEvent[];
}

export interface ReservationResult {
  ok: boolean;
  message: string;
}

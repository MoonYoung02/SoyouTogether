"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { initialState } from "@/lib/mock";
import { loadState, saveState } from "@/lib/storage";
import { canFulfill, canOpenOffer, canReserve } from "@/lib/workflow";
import type { AppState, DemandEvent, Holding, Reservation, ReservationResult } from "@/lib/types";

interface AppStore extends AppState {
  createReservation: (propertyId: string, amount: number) => ReservationResult;
  openPublicOffer: (propertyId: string) => ReservationResult;
  fulfillReservation: (reservationId: string) => ReservationResult;
  getPropertyById: (propertyId: string) => AppState["properties"][number] | undefined;
  getMyActiveReservationByProperty: (propertyId: string) => Reservation | undefined;
  toast: string | null;
  clearToast: () => void;
}

const StoreContext = createContext<AppStore | null>(null);

function getFulfillmentRate(reservations: Reservation[]) {
  if (reservations.length === 0) {
    return 0;
  }
  const fulfilled = reservations.filter((reservation) => reservation.status === "FULFILLED").length;
  return Math.round((fulfilled / reservations.length) * 100);
}

function weightedAvgPrice(holdings: Holding[]) {
  if (holdings.length === 0) {
    return 0;
  }

  const totalAmount = holdings.reduce((sum, holding) => sum + holding.amount, 0);
  if (totalAmount === 0) {
    return 0;
  }

  const weightedSum = holdings.reduce(
    (sum, holding) => sum + holding.amount * holding.avgPrice,
    0
  );

  return Math.round(weightedSum / totalAmount);
}

function regionFromAddress(address: string) {
  const token = address.split(" ")[0] ?? "기타";
  return `KR-${token}`;
}

function createDemandEvent(params: {
  userId: string;
  propertyId: string;
  address: string;
  eventType: DemandEvent["eventType"];
  intentAmount: number;
  statusBefore?: DemandEvent["statusBefore"];
  statusAfter?: DemandEvent["statusAfter"];
  sessionId: string;
}): DemandEvent {
  return {
    id: `de-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: params.userId,
    propertyId: params.propertyId,
    regionCode: regionFromAddress(params.address),
    eventType: params.eventType,
    intentAmount: params.intentAmount,
    statusBefore: params.statusBefore,
    statusAfter: params.statusAfter,
    createdAt: new Date().toISOString(),
    sessionId: params.sessionId,
    channel: "web"
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const sessionIdRef = useRef(`s-${Date.now().toString(36)}`);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setState(saved);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveState(state);
  }, [state, hydrated]);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(null);
    }, 2600);
  }, []);

  const createReservation = useCallback(
    (propertyId: string, amount: number): ReservationResult => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, message: "유효한 예약 금액을 입력해 주세요." };
      }

      if (amount > state.user.reservationLimit) {
        return {
          ok: false,
          message: "사전예약 가능 한도를 초과했습니다. 한도 내 금액으로 다시 입력해 주세요."
        };
      }

      const property = state.properties.find((item) => item.id === propertyId);
      if (!property) {
        return { ok: false, message: "매물을 찾을 수 없습니다." };
      }
      if (!canReserve(property.status)) {
        return { ok: false, message: "현재 단계에서는 사전예약금 등록이 불가능합니다." };
      }

      const reservation: Reservation = {
        id: `r-${Date.now()}`,
        userId: state.user.id,
        propertyId,
        amount,
        createdAt: new Date().toISOString(),
        status: "ACTIVE"
      };

      setState((prev) => {
        const nextProperties = prev.properties.map((item) => {
          if (item.id !== propertyId) {
            return item;
          }
          const nextReserved = item.reservedAmount + amount;
          const nextStatus: AppState["properties"][number]["status"] = nextReserved >= item.targetPrice ? "VOTING_MET" : item.status;

          return {
            ...item,
            reservedAmount: nextReserved,
            voterCount: item.voterCount + 1,
            status: nextStatus
          };
        });
        const prevProperty = prev.properties.find((item) => item.id === propertyId);
        const afterProperty = nextProperties.find((item) => item.id === propertyId);
        const nextEvents = [...prev.demandEvents];

        if (prevProperty && afterProperty) {
          nextEvents.unshift(
            createDemandEvent({
              userId: prev.user.id,
              propertyId,
              address: prevProperty.address,
              eventType: "CREATE",
              intentAmount: amount,
              statusBefore: prevProperty.status,
              statusAfter: afterProperty.status,
              sessionId: sessionIdRef.current
            })
          );

          if (prevProperty.status !== afterProperty.status) {
            nextEvents.unshift(
              createDemandEvent({
                userId: prev.user.id,
                propertyId,
                address: prevProperty.address,
                eventType: "STAGE_CHANGE",
                intentAmount: 0,
                statusBefore: prevProperty.status,
                statusAfter: afterProperty.status,
                sessionId: sessionIdRef.current
              })
            );
          }
        }

        return {
          ...prev,
          user: {
            ...prev.user,
            reservedTotal: prev.user.reservedTotal + amount
          },
          properties: nextProperties,
          reservations: [reservation, ...prev.reservations],
          demandEvents: nextEvents
        };
      });

      const message = property.reservedAmount + amount >= property.targetPrice
        ? "사전예약금이 등록되었습니다. 목표금액 달성으로 공모 오픈 대기 상태로 전환됩니다."
        : "사전예약금이 등록되었습니다.";

      showToast(message);
      return { ok: true, message };
    },
    [state.properties, state.user.id, state.user.reservationLimit, showToast]
  );

  const openPublicOffer = useCallback(
    (propertyId: string): ReservationResult => {
      const property = state.properties.find((item) => item.id === propertyId);
      if (!property) {
        return { ok: false, message: "매물을 찾을 수 없습니다." };
      }

      if (property.reservedAmount < property.targetPrice) {
        return { ok: false, message: "목표금액 미달로 공모를 오픈할 수 없습니다." };
      }
      if (!canOpenOffer(property.status)) {
        return { ok: false, message: "현재 단계에서는 공모를 오픈할 수 없습니다." };
      }

setState((prev): AppState => {
  const before = prev.properties.find((item) => item.id === propertyId);
  const nextProperties: AppState["properties"] = prev.properties.map((item) =>
    item.id === propertyId ? { ...item, status: "PUBLIC_OFFER" as const } : item
  );
  const after = nextProperties.find((item) => item.id === propertyId);
  const nextEvents = [...prev.demandEvents];

  if (before && after) {
    nextEvents.unshift(
      createDemandEvent({
        userId: prev.user.id,
        propertyId,
        address: before.address,
        eventType: "STAGE_CHANGE",
        intentAmount: 0,
        statusBefore: before.status,
        statusAfter: after.status,
        sessionId: sessionIdRef.current
      })
    );
  }

  return {
    ...prev,
    properties: nextProperties,
    demandEvents: nextEvents
  };
});

      showToast("공모가 오픈되었습니다.");
      return { ok: true, message: "공모가 오픈되었습니다." };
    },
    [state.properties, showToast]
  );

  const fulfillReservation = useCallback(
    (reservationId: string): ReservationResult => {
      const reservation = state.reservations.find((item) => item.id === reservationId);
      if (!reservation) {
        return { ok: false, message: "예약을 찾을 수 없습니다." };
      }

      if (reservation.status !== "ACTIVE") {
        return { ok: false, message: "이미 처리된 예약입니다." };
      }

      const property = state.properties.find((item) => item.id === reservation.propertyId);
      if (!property) {
        return { ok: false, message: "매물을 찾을 수 없습니다." };
      }
      if (!canFulfill(property.status)) {
        return { ok: false, message: "현재 단계에서는 예약 이행이 불가능합니다." };
      }

      const newHolding: Holding = {
        id: `h-${Date.now()}`,
        userId: state.user.id,
        propertyId: reservation.propertyId,
        amount: reservation.amount,
        avgPrice: Math.round(property.targetPrice / 100000),
        createdAt: new Date().toISOString()
      };

      setState((prev) => {
        const nextReservations = prev.reservations.map((item) =>
          item.id === reservationId ? { ...item, status: "FULFILLED" as const } : item
        );

        const nextHoldings = [newHolding, ...prev.holdings];

        const nextRate = getFulfillmentRate(nextReservations);
        const beforeProperty = prev.properties.find((item) => item.id === reservation.propertyId);
        const hasActiveAfter = nextReservations.some(
          (entry) => entry.propertyId === reservation.propertyId && entry.status === "ACTIVE"
        );
        const nextPropertyStatus: AppState["properties"][number]["status"] =
  hasActiveAfter ? beforeProperty?.status ?? "PUBLIC_OFFER" : "TRADABLE";

        return {
          ...prev,
          user: {
            ...prev.user,
            trustScore: Math.min(100, prev.user.trustScore + 10),
            reservationFulfillmentRate: nextRate,
            reservationLimit: prev.user.reservationLimit + Math.round(reservation.amount * 0.2),
            balance: Math.max(0, prev.user.balance - reservation.amount),
            reservedTotal: Math.max(0, prev.user.reservedTotal - reservation.amount),
            portfolioTotal: prev.user.portfolioTotal + reservation.amount,
            avgBuyPrice: weightedAvgPrice(nextHoldings)
          },
          reservations: nextReservations,
          holdings: nextHoldings,
          properties: prev.properties.map((item) => {
            if (item.id !== reservation.propertyId) {
              return item;
            }
            return {
              ...item,
              status: nextPropertyStatus ?? item.status
            };
          }),
          demandEvents: [
            createDemandEvent({
              userId: prev.user.id,
              propertyId: reservation.propertyId,
              address: property.address,
              eventType: "FULFILL",
              intentAmount: reservation.amount,
              statusBefore: beforeProperty?.status,
              statusAfter: nextPropertyStatus,
              sessionId: sessionIdRef.current
            }),
            ...prev.demandEvents
          ]
        };
      });

      showToast("예약 이행이 완료되어 보유 자산으로 전환되었습니다.");
      return { ok: true, message: "예약 이행 완료" };
    },
    [state.properties, state.reservations, state.user.id, showToast]
  );

  const getPropertyById = useCallback(
    (propertyId: string) => state.properties.find((item) => item.id === propertyId),
    [state.properties]
  );

  const getMyActiveReservationByProperty = useCallback(
    (propertyId: string) =>
      state.reservations.find(
        (item) =>
          item.userId === state.user.id &&
          item.propertyId === propertyId &&
          item.status === "ACTIVE"
      ),
    [state.reservations, state.user.id]
  );

  const value = useMemo<AppStore>(
    () => ({
      ...state,
      createReservation,
      openPublicOffer,
      fulfillReservation,
      getPropertyById,
      getMyActiveReservationByProperty,
      toast,
      clearToast
    }),
    [
      clearToast,
      createReservation,
      fulfillReservation,
      getMyActiveReservationByProperty,
      getPropertyById,
      openPublicOffer,
      state,
      toast
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}

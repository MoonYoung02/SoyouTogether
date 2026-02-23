import type { AppState, DemandEvent, Property, PropertyStatus } from "@/lib/types";

export interface DemandKpi {
  totalIntent: number;
  uniqueParticipants: number;
  votingMetCount: number;
  offerSuccessRate: number;
  fulfillmentRate: number;
}

export interface RegionSummary {
  regionCode: string;
  propertyCount: number;
  intentTotal: number;
  uniqueParticipants: number;
  hotnessScore: number;
}

export interface PropertyPriority {
  property: Property;
  coverage: number;
  growth7d: number;
  concentrationTop5: number;
  priorityScore: number;
}

export interface FunnelMetrics {
  votingOpen: number;
  votingMet: number;
  publicOffer: number;
  tradable: number;
}

function uniqueParticipants(events: DemandEvent[]) {
  return new Set(events.map((event) => event.userId)).size;
}

function byStatus(properties: Property[], status: PropertyStatus) {
  return properties.filter((property) => property.status === status);
}

function recentEvents(events: DemandEvent[], days: number) {
  const now = Date.now();
  const threshold = now - days * 24 * 60 * 60 * 1000;
  return events.filter((event) => new Date(event.createdAt).getTime() >= threshold);
}

function top5Concentration(events: DemandEvent[], propertyId: string) {
  const amountsByUser = new Map<string, number>();
  events
    .filter((event) => event.propertyId === propertyId && event.eventType === "CREATE")
    .forEach((event) => {
      amountsByUser.set(event.userId, (amountsByUser.get(event.userId) ?? 0) + event.intentAmount);
    });

  const totals = Array.from(amountsByUser.values()).sort((a, b) => b - a);
  const all = totals.reduce((sum, value) => sum + value, 0);
  if (all === 0) {
    return 0;
  }
  const top5 = totals.slice(0, 5).reduce((sum, value) => sum + value, 0);
  return top5 / all;
}

export function computeDemandKpi(state: AppState): DemandKpi {
  const totalIntent = state.properties.reduce((sum, property) => sum + property.reservedAmount, 0);
  const met = byStatus(state.properties, "VOTING_MET").length;
  const publicOffers = byStatus(state.properties, "PUBLIC_OFFER").length;
  const tradable = byStatus(state.properties, "TRADABLE").length;
  const fulfilled = state.reservations.filter((reservation) => reservation.status === "FULFILLED");
  const fulfilledAmount = fulfilled.reduce((sum, reservation) => sum + reservation.amount, 0);
  const activeAmount = state.reservations.reduce((sum, reservation) => sum + reservation.amount, 0);

  return {
    totalIntent,
    uniqueParticipants: uniqueParticipants(state.demandEvents),
    votingMetCount: met,
    offerSuccessRate: publicOffers === 0 ? 0 : tradable / publicOffers,
    fulfillmentRate: activeAmount === 0 ? 0 : fulfilledAmount / activeAmount
  };
}

export function computeRegionSummaries(state: AppState): RegionSummary[] {
  const map = new Map<string, RegionSummary>();

  state.properties.forEach((property) => {
    const regionCode = `KR-${property.address.split(" ")[0] ?? "기타"}`;
    const current = map.get(regionCode) ?? {
      regionCode,
      propertyCount: 0,
      intentTotal: 0,
      uniqueParticipants: 0,
      hotnessScore: 0
    };

    current.propertyCount += 1;
    current.intentTotal += property.reservedAmount;
    map.set(regionCode, current);
  });

  Array.from(map.values()).forEach((item) => {
    const users = new Set(
      state.demandEvents
        .filter((event) => event.regionCode === item.regionCode)
        .map((event) => event.userId)
    );
    item.uniqueParticipants = users.size;
    item.hotnessScore =
      item.propertyCount === 0
        ? 0
        : (item.intentTotal * 0.7 + item.uniqueParticipants * 10000000 * 0.3) / item.propertyCount;
  });

  return Array.from(map.values()).sort((a, b) => b.hotnessScore - a.hotnessScore);
}

export function computeFunnelMetrics(state: AppState): FunnelMetrics {
  return {
    votingOpen: byStatus(state.properties, "VOTING_OPEN").length,
    votingMet: byStatus(state.properties, "VOTING_MET").length,
    publicOffer: byStatus(state.properties, "PUBLIC_OFFER").length,
    tradable: byStatus(state.properties, "TRADABLE").length
  };
}

export function computePriorityBoard(state: AppState): PropertyPriority[] {
  const events7d = recentEvents(state.demandEvents, 7);

  return state.properties
    .map((property) => {
      const coverage = property.targetPrice === 0 ? 0 : property.reservedAmount / property.targetPrice;
      const weekIntent = events7d
        .filter((event) => event.propertyId === property.id && event.eventType === "CREATE")
        .reduce((sum, event) => sum + event.intentAmount, 0);
      const growth7d = property.reservedAmount === 0 ? 0 : weekIntent / property.reservedAmount;
      const concentrationTop5 = top5Concentration(state.demandEvents, property.id);
      const priorityScore = coverage * 60 + growth7d * 30 + (1 - concentrationTop5) * 10;

      return {
        property,
        coverage,
        growth7d,
        concentrationTop5,
        priorityScore
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

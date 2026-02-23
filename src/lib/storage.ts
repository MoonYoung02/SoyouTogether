import type { AppState } from "@/lib/types";

const STORAGE_KEY = "co-ownership-wireframe-v3";

export function loadState(): AppState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed.user || !parsed.properties) {
      return null;
    }
    return {
      user: parsed.user,
      properties: parsed.properties ?? [],
      reservations: parsed.reservations ?? [],
      holdings: parsed.holdings ?? [],
      demandEvents: parsed.demandEvents ?? []
    };
  } catch {
    return null;
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}

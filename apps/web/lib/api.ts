import type {
  AlertEvent,
  AssetAnalysisPayload,
  DashboardPayload,
  ExplorePayload,
  PortfolioPayload,
  ProfileUpdatePayload,
  RecommendationSnapshot,
  WatchlistPayload,
} from "@investment-research/contracts";

import {
  alertsMock,
  assetDetailMock,
  dashboardMock,
  exploreMock,
  portfolioMock,
  profileMock,
  watchlistMock,
} from "@/lib/mock-data";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function requestOrFallback<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "demo-user",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getDashboard(): Promise<DashboardPayload> {
  return requestOrFallback("/api/v1/dashboard", dashboardMock);
}

export async function getExplore(assetClass?: string): Promise<ExplorePayload> {
  const query = assetClass ? `?asset_class=${assetClass}` : "";
  return requestOrFallback(`/api/v1/explore${query}`, exploreMock);
}

export async function getAssetDetail(assetId: string): Promise<AssetAnalysisPayload> {
  const fallback =
    assetId === assetDetailMock.asset.asset_id
      ? assetDetailMock
      : {
          ...assetDetailMock,
          asset: dashboardMock.top_ideas.find((item) => item.asset_id === assetId) ?? dashboardMock.top_ideas[0],
        };
  return requestOrFallback(`/api/v1/assets/${assetId}`, fallback);
}

export async function getWatchlist(): Promise<WatchlistPayload> {
  return requestOrFallback("/api/v1/watchlist", { items: watchlistMock });
}

export async function addWatchlist(assetId: string): Promise<void> {
  await requestOrFallback("/api/v1/watchlist", { ok: true }, {
    method: "POST",
    body: JSON.stringify({ asset_id: assetId }),
  });
}

export async function removeWatchlist(assetId: string): Promise<void> {
  await requestOrFallback(`/api/v1/watchlist/${assetId}`, { ok: true }, { method: "DELETE" });
}

export async function getPortfolio(): Promise<PortfolioPayload> {
  return requestOrFallback("/api/v1/portfolio", { positions: portfolioMock });
}

export async function updatePortfolio(positions: PortfolioPayload["positions"]): Promise<PortfolioPayload> {
  return requestOrFallback("/api/v1/portfolio", { positions }, {
    method: "PUT",
    body: JSON.stringify({ positions }),
  });
}

export async function getAlerts(): Promise<{ items: AlertEvent[] }> {
  return requestOrFallback("/api/v1/alerts", { items: alertsMock });
}

export async function markAlertRead(alertId: string): Promise<void> {
  await requestOrFallback(`/api/v1/alerts/${alertId}/read`, { ok: true }, { method: "POST" });
}

export async function getProfile() {
  return requestOrFallback("/api/v1/profile", profileMock);
}

export async function updateProfile(payload: ProfileUpdatePayload) {
  return requestOrFallback("/api/v1/profile", payload, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function findIdeaById(assetId: string): RecommendationSnapshot | undefined {
  return dashboardMock.top_ideas.find((idea) => idea.asset_id === assetId);
}


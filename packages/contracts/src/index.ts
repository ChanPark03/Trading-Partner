export type AssetClass = "stock" | "etf" | "crypto";
export type RecommendationLabel = "매수" | "관망" | "회피";

export interface PriceRange {
  low: number;
  high: number;
  basis: string;
}

export interface RiskFlag {
  title: string;
  severity: "low" | "medium" | "high";
  detail: string;
}

export interface SignalValue {
  id: string;
  label: string;
  value: number;
  sentiment: "bullish" | "neutral" | "bearish";
  description: string;
}

export interface RecommendationSnapshot {
  asset_id: string;
  symbol: string;
  name: string;
  asset_class: AssetClass;
  recommendation_label: RecommendationLabel;
  confidence: number;
  holding_window: string;
  current_price: number;
  change_percent_24h: number;
  target_range: PriceRange;
  stop_range: PriceRange;
  invalidation_condition: string;
  key_drivers: string[];
  risk_flags: RiskFlag[];
  signals: SignalValue[];
  as_of: string;
  tradingview_symbol: string;
  explanation: string;
  score: number;
}

export interface AlertEvent {
  id: string;
  asset_id: string;
  title: string;
  detail: string;
  level: "info" | "warning" | "critical";
  is_read: boolean;
  created_at: string;
}

export interface WatchlistItem {
  asset_id: string;
  added_at: string;
}

export interface PortfolioPosition {
  asset_id: string;
  quantity: number;
  average_cost: number;
  note?: string | null;
}

export interface UserProfile {
  user_id: string;
  email: string;
  risk_tolerance: "conservative" | "balanced" | "aggressive";
  time_horizon: "swing" | "position" | "hybrid";
  preferred_asset_classes: AssetClass[];
  locale: string;
  completed_onboarding: boolean;
}

export interface DashboardPayload {
  generated_at: string;
  market_context: {
    summary: string;
    breadth: string;
    volatility_regime: string;
    leaders: string[];
  };
  top_ideas: RecommendationSnapshot[];
  alerts_preview: AlertEvent[];
  filters: {
    asset_classes: AssetClass[];
    recommendation_labels: RecommendationLabel[];
  };
}

export interface AssetAnalysisPayload {
  asset: RecommendationSnapshot;
  market_snapshot: {
    day_high: number;
    day_low: number;
    volume: number;
    previous_close: number;
  };
  technical_summary: string[];
  risk_summary: string[];
}

export interface ExplorePayload {
  items: RecommendationSnapshot[];
  total: number;
  page: number;
  page_size: number;
}

export interface WatchlistPayload {
  items: WatchlistItem[];
}

export interface PortfolioPayload {
  positions: PortfolioPosition[];
}

export interface ProfileUpdatePayload {
  email: string;
  risk_tolerance: UserProfile["risk_tolerance"];
  time_horizon: UserProfile["time_horizon"];
  preferred_asset_classes: AssetClass[];
  locale: string;
}

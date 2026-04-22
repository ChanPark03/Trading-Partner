from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, Field


AssetClass = Literal["stock", "etf", "crypto"]
RecommendationLabel = Literal["매수", "관망", "회피"]
RiskSeverity = Literal["low", "medium", "high"]
AlertLevel = Literal["info", "warning", "critical"]
SignalSentiment = Literal["bullish", "neutral", "bearish"]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PriceRange(BaseModel):
    low: float
    high: float
    basis: str


class RiskFlag(BaseModel):
    title: str
    severity: RiskSeverity
    detail: str


class SignalValue(BaseModel):
    id: str
    label: str
    value: float
    sentiment: SignalSentiment
    description: str


class CanonicalMarketSnapshot(BaseModel):
    asset_id: str
    symbol: str
    name: str
    asset_class: AssetClass
    current_price: float
    previous_close: float
    day_high: float
    day_low: float
    volume: float
    change_percent_24h: float
    volatility: float = Field(ge=0.0)
    tradingview_symbol: str


class CanonicalDerivativesSignal(BaseModel):
    symbol: str
    mark_price: float
    index_price: float
    funding_rate: float
    open_interest: float
    basis_points: float


class RecommendationSnapshot(BaseModel):
    asset_id: str
    symbol: str
    name: str
    asset_class: AssetClass
    recommendation_label: RecommendationLabel
    confidence: int = Field(ge=0, le=100)
    holding_window: str
    current_price: float
    change_percent_24h: float
    target_range: PriceRange
    stop_range: PriceRange
    invalidation_condition: str
    key_drivers: list[str]
    risk_flags: list[RiskFlag]
    signals: list[SignalValue]
    as_of: datetime
    tradingview_symbol: str
    explanation: str
    score: float = Field(ge=0.0, le=100.0)


class AlertEvent(BaseModel):
    id: str
    asset_id: str
    title: str
    detail: str
    level: AlertLevel
    is_read: bool
    created_at: datetime


class WatchlistItem(BaseModel):
    asset_id: str
    added_at: datetime


class PortfolioPosition(BaseModel):
    asset_id: str
    quantity: float
    average_cost: float
    note: Optional[str] = None


class UserProfile(BaseModel):
    user_id: str
    email: str
    risk_tolerance: Literal["conservative", "balanced", "aggressive"]
    time_horizon: Literal["swing", "position", "hybrid"]
    preferred_asset_classes: list[AssetClass]
    locale: str = "ko-KR"
    completed_onboarding: bool = True


class DashboardPayload(BaseModel):
    generated_at: datetime
    market_context: dict
    top_ideas: list[RecommendationSnapshot]
    alerts_preview: list[AlertEvent]
    filters: dict


class AssetAnalysisPayload(BaseModel):
    asset: RecommendationSnapshot
    market_snapshot: dict
    technical_summary: list[str]
    risk_summary: list[str]


class ExplorePayload(BaseModel):
    items: list[RecommendationSnapshot]
    total: int
    page: int
    page_size: int


class WatchlistPayload(BaseModel):
    items: list[WatchlistItem]


class PortfolioPayload(BaseModel):
    positions: list[PortfolioPosition]


class ProfileUpdatePayload(BaseModel):
    email: str = "demo@example.com"
    risk_tolerance: Literal["conservative", "balanced", "aggressive"]
    time_horizon: Literal["swing", "position", "hybrid"]
    preferred_asset_classes: list[AssetClass]
    locale: str = "ko-KR"


class WatchlistCreatePayload(BaseModel):
    asset_id: str


class PortfolioUpdatePayload(BaseModel):
    positions: list[PortfolioPosition]


from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from app.bootstrap import bootstrap_demo_state, recompute_recommendations
from app.models.contracts import (
    AssetAnalysisPayload,
    DashboardPayload,
    ExplorePayload,
    PortfolioPayload,
    PortfolioUpdatePayload,
    ProfileUpdatePayload,
    RecommendationSnapshot,
    WatchlistCreatePayload,
    WatchlistPayload,
)
from app.repository import Database
from app.services.recommendations import build_market_context, personalize_rankings


router = APIRouter(prefix="/api/v1")
db = Database()
bootstrap_demo_state(db)


def get_user_id(x_user_id: Optional[str] = Header(default="demo-user")) -> str:
    return x_user_id or "demo-user"


def _personalized_recommendations(user_id: str) -> list[RecommendationSnapshot]:
    profile = db.ensure_demo_profile(user_id)
    watchlist = db.get_watchlist(user_id)
    portfolio = db.get_portfolio(user_id)
    recommendations = db.list_recommendations()
    return personalize_rankings(
        recommendations,
        preferred_asset_classes=profile.preferred_asset_classes,
        watched_asset_ids={item.asset_id for item in watchlist},
        held_asset_ids={item.asset_id for item in portfolio},
    )


@router.get("/dashboard", response_model=DashboardPayload)
def get_dashboard(user_id: str = Depends(get_user_id)) -> DashboardPayload:
    recommendations = _personalized_recommendations(user_id)
    alerts = db.list_alerts(user_id)
    return DashboardPayload(
        generated_at=recommendations[0].as_of if recommendations else datetime.now(timezone.utc),
        market_context=build_market_context(recommendations),
        top_ideas=recommendations[:5],
        alerts_preview=alerts[:5],
        filters={
            "asset_classes": ["stock", "etf", "crypto"],
            "recommendation_labels": ["매수", "관망", "회피"],
        },
    )


@router.get("/assets/{asset_id}", response_model=AssetAnalysisPayload)
def get_asset_analysis(asset_id: str, user_id: str = Depends(get_user_id)) -> AssetAnalysisPayload:
    recommendation = db.get_recommendation(asset_id)
    if recommendation is None:
        raise HTTPException(status_code=404, detail="Asset not found")

    return AssetAnalysisPayload(
        asset=recommendation,
        market_snapshot={
            "day_high": recommendation.target_range.high,
            "day_low": recommendation.stop_range.low,
            "volume": 0 if recommendation.asset_class == "crypto" else 1,
            "previous_close": recommendation.current_price / max(0.01, 1 + recommendation.change_percent_24h / 100),
        },
        technical_summary=[signal.description for signal in recommendation.signals[:3]],
        risk_summary=[flag.detail for flag in recommendation.risk_flags],
    )


@router.get("/explore", response_model=ExplorePayload)
def get_explore(
    asset_class: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    user_id: str = Depends(get_user_id),
) -> ExplorePayload:
    recommendations = _personalized_recommendations(user_id)
    if asset_class:
        recommendations = [item for item in recommendations if item.asset_class == asset_class]
    if search:
        needle = search.lower()
        recommendations = [
            item
            for item in recommendations
            if needle in item.symbol.lower() or needle in item.name.lower()
        ]
    total = len(recommendations)
    start = (page - 1) * page_size
    end = start + page_size
    return ExplorePayload(items=recommendations[start:end], total=total, page=page, page_size=page_size)


@router.get("/alerts")
def get_alerts(user_id: str = Depends(get_user_id)):
    return {"items": [alert.model_dump(mode="json") for alert in db.list_alerts(user_id)]}


@router.post("/alerts/{alert_id}/read")
def mark_alert_read(alert_id: str, user_id: str = Depends(get_user_id)):
    db.mark_alert_read(user_id, alert_id)
    return {"ok": True}


@router.get("/watchlist", response_model=WatchlistPayload)
def get_watchlist(user_id: str = Depends(get_user_id)) -> WatchlistPayload:
    return WatchlistPayload(items=db.get_watchlist(user_id))


@router.post("/watchlist")
def add_watchlist_item(payload: WatchlistCreatePayload, user_id: str = Depends(get_user_id)):
    db.add_watchlist_item(user_id, payload.asset_id)
    recommendation = db.get_recommendation(payload.asset_id)
    if recommendation:
        db.create_alert(
            user_id,
            payload.asset_id,
            f"{recommendation.symbol} 관심종목 추가",
            f"{recommendation.symbol}이 관심종목에 추가되었습니다. 현재 상태는 {recommendation.recommendation_label}입니다.",
        )
    return {"ok": True}


@router.delete("/watchlist/{asset_id}")
def delete_watchlist_item(asset_id: str, user_id: str = Depends(get_user_id)):
    db.remove_watchlist_item(user_id, asset_id)
    return {"ok": True}


@router.get("/portfolio", response_model=PortfolioPayload)
def get_portfolio(user_id: str = Depends(get_user_id)) -> PortfolioPayload:
    return PortfolioPayload(positions=db.get_portfolio(user_id))


@router.put("/portfolio", response_model=PortfolioPayload)
def replace_portfolio(payload: PortfolioUpdatePayload, user_id: str = Depends(get_user_id)) -> PortfolioPayload:
    positions = db.replace_portfolio(user_id, payload.positions)
    return PortfolioPayload(positions=positions)


@router.get("/profile")
def get_profile(user_id: str = Depends(get_user_id)):
    return db.ensure_demo_profile(user_id).model_dump(mode="json")


@router.put("/profile")
def update_profile(payload: ProfileUpdatePayload, user_id: str = Depends(get_user_id)):
    return db.update_profile(user_id, payload).model_dump(mode="json")


@router.post("/internal/recompute")
def recompute():
    provider_name = recompute_recommendations(db)
    return {"ok": True, "provider": provider_name}

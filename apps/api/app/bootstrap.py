from typing import Optional

from app.models.contracts import MarketSnapshot, RecommendationSnapshot
from app.repository import Database
from app.services.explanations import ExplanationProvider, get_explanation_provider
from app.services.providers import MarketDataProvider, SeedMarketDataProvider, get_market_data_provider
from app.services.recommendations import build_recommendation_snapshot


def _resolve_fundamental_bias(symbol: str, fundamental_bias: dict[str, float]) -> float:
    return fundamental_bias.get(symbol, fundamental_bias.get(symbol.replace("/USD", ""), 0.5))


def _to_market_snapshot(snapshot) -> MarketSnapshot:
    return MarketSnapshot(**snapshot.model_dump())


def _recommendation_rank(label: str) -> int:
    return {"회피": 0, "관망": 1, "매수": 2}.get(label, 1)


def _create_recompute_alerts(
    db: Database,
    previous: dict[str, RecommendationSnapshot],
    current: list[RecommendationSnapshot],
) -> None:
    for recommendation in current:
        watched_users = db.get_user_ids_for_asset(recommendation.asset_id)
        previous_recommendation = previous.get(recommendation.asset_id)
        downgraded = (
            previous_recommendation is not None
            and _recommendation_rank(recommendation.recommendation_label)
            < _recommendation_rank(previous_recommendation.recommendation_label)
        )
        high_risk = any(flag.severity == "high" for flag in recommendation.risk_flags)

        if not watched_users or not (downgraded or high_risk):
            continue

        for user_id in watched_users:
            if downgraded:
                db.create_alert(
                    user_id,
                    recommendation.asset_id,
                    f"{recommendation.symbol} 추천 등급 하향",
                    f"{previous_recommendation.recommendation_label}에서 {recommendation.recommendation_label}로 바뀌었습니다. 무효화 조건과 손절 구간을 재확인하세요.",
                    level="warning",
                    dedupe_key=f"downgrade:{recommendation.asset_id}:{recommendation.recommendation_label}:{recommendation.as_of.date()}",
                )
            if high_risk:
                db.create_alert(
                    user_id,
                    recommendation.asset_id,
                    f"{recommendation.symbol} 리스크 확대",
                    "고위험 플래그가 감지되었습니다. 포지션 크기와 손절 기준을 다시 점검하세요.",
                    level="critical",
                    dedupe_key=f"high-risk:{recommendation.asset_id}:{recommendation.as_of.date()}",
                )


def recompute_recommendations(
    db: Database,
    market_data_provider: Optional[MarketDataProvider] = None,
    explanation_provider: Optional[ExplanationProvider] = None,
) -> str:
    resolved_provider = market_data_provider or get_market_data_provider()
    resolved_explainer = explanation_provider or get_explanation_provider()

    try:
        inputs = resolved_provider.load_inputs()
    except Exception:
        resolved_provider = SeedMarketDataProvider()
        inputs = resolved_provider.load_inputs()

    previous = {item.asset_id: item for item in db.list_recommendations()}
    snapshots = []
    market_snapshots = []
    for market_snapshot in inputs.snapshots:
        recommendation = build_recommendation_snapshot(
            snapshot=market_snapshot,
            derivatives=inputs.derivatives.get(market_snapshot.symbol),
            fundamental_bias=_resolve_fundamental_bias(market_snapshot.symbol, inputs.fundamental_bias),
            explanation_provider=resolved_explainer,
        )
        snapshots.append(recommendation)
        market_snapshots.append(_to_market_snapshot(market_snapshot))
    db.save_market_snapshots(market_snapshots)
    db.save_recommendations(snapshots)
    _create_recompute_alerts(db, previous, snapshots)
    return resolved_provider.provider_name


def recompute_seed_recommendations(db: Database) -> str:
    return recompute_recommendations(
        db,
        market_data_provider=SeedMarketDataProvider(),
        explanation_provider=get_explanation_provider(),
    )


def bootstrap_demo_state(db: Database) -> None:
    db.ensure_demo_profile()
    if not db.list_recommendations() or not db.list_market_snapshots():
        recompute_recommendations(db)
    if not db.list_alerts("demo-user"):
        db.create_alert(
            "demo-user",
            "crypto-btc",
            "BTC 추천 강도 유지",
            "비트코인 구조가 매수 관점으로 유지되고 있습니다. 손절 구간 이탈 여부를 함께 확인하세요.",
        )
        db.create_alert(
            "demo-user",
            "stock-aapl",
            "AAPL 모멘텀 둔화",
            "애플은 단기 낙폭이 커 관망 비중이 커졌습니다.",
            level="warning",
        )

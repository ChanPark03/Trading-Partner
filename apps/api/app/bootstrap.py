from typing import Optional

from app.repository import Database
from app.services.explanations import ExplanationProvider, get_explanation_provider
from app.services.providers import MarketDataProvider, SeedMarketDataProvider, get_market_data_provider
from app.services.recommendations import build_recommendation_snapshot


def _resolve_fundamental_bias(symbol: str, fundamental_bias: dict[str, float]) -> float:
    return fundamental_bias.get(symbol, fundamental_bias.get(symbol.replace("/USD", ""), 0.5))


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

    snapshots = []
    for market_snapshot in inputs.snapshots:
        recommendation = build_recommendation_snapshot(
            snapshot=market_snapshot,
            derivatives=inputs.derivatives.get(market_snapshot.symbol),
            fundamental_bias=_resolve_fundamental_bias(market_snapshot.symbol, inputs.fundamental_bias),
            explanation_provider=resolved_explainer,
        )
        snapshots.append(recommendation)
    db.save_recommendations(snapshots)
    return resolved_provider.provider_name


def recompute_seed_recommendations(db: Database) -> str:
    return recompute_recommendations(
        db,
        market_data_provider=SeedMarketDataProvider(),
        explanation_provider=get_explanation_provider(),
    )


def bootstrap_demo_state(db: Database) -> None:
    db.ensure_demo_profile()
    if not db.list_recommendations():
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

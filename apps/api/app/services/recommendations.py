from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from app.models.contracts import (
    CanonicalDerivativesSignal,
    CanonicalMarketSnapshot,
    PriceRange,
    RecommendationSnapshot,
    RiskFlag,
    SignalValue,
)
from app.services.explanations import ExplanationProvider, get_explanation_provider


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _sentiment(value: float) -> str:
    if value >= 0.62:
        return "bullish"
    if value <= 0.38:
        return "bearish"
    return "neutral"


def _describe_signal(label: str, sentiment: str) -> str:
    descriptions = {
        ("추세", "bullish"): "상승 추세가 유지되며 추세 추종 진입이 유효합니다.",
        ("추세", "neutral"): "추세 우위가 뚜렷하지 않아 추가 확인이 필요합니다.",
        ("추세", "bearish"): "추세가 약해 보수적으로 접근해야 합니다.",
        ("변동성", "bullish"): "변동성이 통제 가능한 수준이라 리스크 관리가 수월합니다.",
        ("변동성", "neutral"): "변동성이 중립 수준이라 포지션 크기 조절이 중요합니다.",
        ("변동성", "bearish"): "변동성이 높아 손절 관리가 매우 중요합니다.",
        ("거래량", "bullish"): "거래량이 방향성을 지지합니다.",
        ("거래량", "neutral"): "거래량 확증이 부족합니다.",
        ("거래량", "bearish"): "거래량이 약해 신호 신뢰도가 낮습니다.",
        ("기초체력", "bullish"): "기초 체력/상대강도가 우수합니다.",
        ("기초체력", "neutral"): "펀더멘털 우위가 제한적입니다.",
        ("기초체력", "bearish"): "기초 체력 신호가 약합니다.",
        ("파생심리", "bullish"): "파생시장 포지셔닝이 과열 없이 우호적입니다.",
        ("파생심리", "neutral"): "파생시장 심리가 중립적입니다.",
        ("파생심리", "bearish"): "파생시장 과열 또는 왜곡 신호가 있습니다.",
    }
    return descriptions[(label, sentiment)]


def _round_range(low: float, high: float) -> PriceRange:
    return PriceRange(low=round(low, 2), high=round(high, 2), basis="score+volatility")


def build_recommendation_snapshot(
    snapshot: CanonicalMarketSnapshot,
    derivatives: Optional[CanonicalDerivativesSignal],
    fundamental_bias: float,
    explanation_provider: Optional[ExplanationProvider] = None,
) -> RecommendationSnapshot:
    trend_signal = _clamp(0.5 + (snapshot.change_percent_24h / 8.0), 0.0, 1.0)
    volatility_signal = _clamp(1.0 - snapshot.volatility * 10.0, 0.0, 1.0)
    volume_signal = _clamp(0.48 + min(snapshot.volume, 5_000_000) / 10_000_000, 0.0, 1.0)
    base_signals = [
        ("trend", "추세", trend_signal),
        ("volatility", "변동성", volatility_signal),
        ("volume", "거래량", volume_signal),
        ("fundamental", "기초체력", _clamp(fundamental_bias, 0.0, 1.0)),
    ]

    derivatives_signal = 0.5
    if derivatives is not None:
        funding_penalty = min(abs(derivatives.funding_rate) * 2500.0, 0.25)
        basis_penalty = min(abs(derivatives.basis_points) / 40.0, 0.2)
        derivatives_signal = _clamp(0.74 - funding_penalty - basis_penalty, 0.0, 1.0)
        base_signals.append(("derivatives", "파생심리", derivatives_signal))

    weighted_score = (
        trend_signal * 0.32
        + volatility_signal * 0.18
        + volume_signal * 0.18
        + _clamp(fundamental_bias, 0.0, 1.0) * 0.20
        + derivatives_signal * 0.12
    ) * 100.0

    score = round(weighted_score, 1)
    confidence = int(_clamp(score + (12.0 if snapshot.asset_class != "crypto" else 6.0), 35.0, 95.0))
    buy_threshold = 64 if snapshot.asset_class == "crypto" else 70
    watch_threshold = 48 if snapshot.asset_class == "crypto" else 50

    if score >= buy_threshold:
        label = "매수"
    elif score >= watch_threshold:
        label = "관망"
    else:
        label = "회피"

    upside = snapshot.current_price * (0.025 + score / 500.0 + snapshot.volatility * 0.6)
    downside = snapshot.current_price * (0.018 + (1.0 - _clamp(score / 100.0, 0.0, 1.0)) / 20.0 + snapshot.volatility * 0.4)
    target_range = _round_range(snapshot.current_price + upside * 0.7, snapshot.current_price + upside)
    stop_range = _round_range(snapshot.current_price - downside, snapshot.current_price - downside * 0.72)

    signals = [
        SignalValue(
            id=signal_id,
            label=label_text,
            value=round(value, 2),
            sentiment=_sentiment(value),
            description=_describe_signal(label_text, _sentiment(value)),
        )
        for signal_id, label_text, value in base_signals
    ]

    risk_flags: list[RiskFlag] = []
    if snapshot.volatility >= 0.04:
        risk_flags.append(
            RiskFlag(
                title="변동성 확대",
                severity="high" if snapshot.asset_class == "crypto" else "medium",
                detail="최근 가격 진폭이 커 손절 구간을 넓게 보거나 비중을 줄이는 편이 좋습니다.",
            )
        )
    if derivatives and abs(derivatives.funding_rate) > 0.0001:
        risk_flags.append(
            RiskFlag(
                title="파생 과열 경고",
                severity="medium",
                detail="펀딩비가 높아 단기 과열 반납 가능성을 함께 봐야 합니다.",
            )
        )
    if snapshot.change_percent_24h < -2.0:
        risk_flags.append(
            RiskFlag(
                title="단기 모멘텀 약화",
                severity="medium",
                detail="직전 종가 대비 낙폭이 커 즉시 추격보다는 구조 확인이 필요합니다.",
            )
        )
    if not risk_flags:
        risk_flags.append(
            RiskFlag(
                title="리스크 관리 필요",
                severity="low",
                detail="추천이 긍정적이더라도 포지션 크기와 손절 기준은 사전에 고정해야 합니다.",
            )
        )

    driver_rank = sorted(signals, key=lambda item: item.value, reverse=True)
    key_drivers = [item.description for item in driver_rank[:3]]
    invalidation_condition = (
        f"가격이 {stop_range.low:.2f} 아래로 밀리고 추세 신호가 약화되면 현재 시나리오는 무효입니다."
    )
    holding_window = "4시간-10일" if snapshot.asset_class == "crypto" else "3일-6주"
    provider = explanation_provider or get_explanation_provider()
    explanation = provider.build_summary(
        snapshot=snapshot,
        recommendation_label=label,
        target_low=target_range.low,
        target_high=target_range.high,
        stop_low=stop_range.low,
        stop_high=stop_range.high,
        key_drivers=key_drivers,
        invalidation_condition=invalidation_condition,
    )

    return RecommendationSnapshot(
        asset_id=snapshot.asset_id,
        symbol=snapshot.symbol,
        name=snapshot.name,
        asset_class=snapshot.asset_class,
        recommendation_label=label,
        confidence=confidence,
        holding_window=holding_window,
        current_price=snapshot.current_price,
        change_percent_24h=round(snapshot.change_percent_24h, 2),
        target_range=target_range,
        stop_range=stop_range,
        invalidation_condition=invalidation_condition,
        key_drivers=key_drivers,
        risk_flags=risk_flags,
        signals=signals,
        as_of=datetime.now(timezone.utc),
        tradingview_symbol=snapshot.tradingview_symbol,
        explanation=explanation,
        score=score,
    )


def build_market_context(recommendations: list[RecommendationSnapshot]) -> dict:
    leaders = [rec.symbol for rec in sorted(recommendations, key=lambda item: item.score, reverse=True)[:3]]
    avg_score = sum(rec.score for rec in recommendations) / len(recommendations)
    volatility_regime = "상승 추세 우위" if avg_score >= 65 else "혼조"
    return {
        "summary": "미국주식은 선택적 강세, 코인은 구조적 모멘텀이 우세한 장세입니다.",
        "breadth": "상위 감시 우주 기준 매수 시그널 우세",
        "volatility_regime": volatility_regime,
        "leaders": leaders,
    }


def personalize_rankings(
    recommendations: list[RecommendationSnapshot],
    preferred_asset_classes: list[str],
    watched_asset_ids: set[str],
    held_asset_ids: set[str],
) -> list[RecommendationSnapshot]:
    preferred_class_boost = 24.0 if len(preferred_asset_classes) == 1 else 10.0

    def sort_key(rec: RecommendationSnapshot) -> tuple[float, float]:
        boost = 0.0
        if rec.asset_class in preferred_asset_classes:
            boost += preferred_class_boost
        if rec.asset_id in watched_asset_ids:
            boost += 4.0
        if rec.asset_id in held_asset_ids:
            boost += 3.0
        return rec.score + boost, rec.change_percent_24h

    return sorted(recommendations, key=sort_key, reverse=True)

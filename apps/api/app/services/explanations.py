from __future__ import annotations

from typing import Protocol

from app.config import get_explanation_settings
from app.models.contracts import CanonicalMarketSnapshot


class ExplanationProvider(Protocol):
    provider_name: str

    def build_summary(
        self,
        snapshot: CanonicalMarketSnapshot,
        recommendation_label: str,
        target_low: float,
        target_high: float,
        stop_low: float,
        stop_high: float,
        key_drivers: list[str],
        invalidation_condition: str,
    ) -> str:
        ...


class TemplateExplanationProvider:
    provider_name = "template"

    def build_summary(
        self,
        snapshot: CanonicalMarketSnapshot,
        recommendation_label: str,
        target_low: float,
        target_high: float,
        stop_low: float,
        stop_high: float,
        key_drivers: list[str],
        invalidation_condition: str,
    ) -> str:
        driver_summary = " / ".join(key_drivers[:2]) if key_drivers else "구조 재확인이 필요합니다."
        return (
            f"{snapshot.name}은 현재 {recommendation_label} 관점입니다. "
            f"핵심 배경은 {driver_summary} "
            f"목표 구간은 {target_low:.2f}~{target_high:.2f}, "
            f"손절 구간은 {stop_low:.2f}~{stop_high:.2f}입니다. "
            f"무효화 조건은 {invalidation_condition}입니다."
        )


def get_explanation_provider() -> ExplanationProvider:
    settings = get_explanation_settings()
    # The template provider is the safe default until a fully grounded LLM
    # provider is wired behind the same interface.
    if settings.llm_ready:
        return TemplateExplanationProvider()
    return TemplateExplanationProvider()

from app.models.contracts import CanonicalMarketSnapshot
from app.services.explanations import TemplateExplanationProvider


def test_template_explanation_provider_mentions_label_and_ranges():
    provider = TemplateExplanationProvider()
    snapshot = CanonicalMarketSnapshot(
        asset_id="stock-aapl",
        symbol="AAPL",
        name="Apple Inc.",
        asset_class="stock",
        current_price=200.0,
        previous_close=195.0,
        day_high=201.0,
        day_low=193.5,
        volume=1200,
        change_percent_24h=2.56,
        volatility=0.02,
        tradingview_symbol="NASDAQ:AAPL",
    )

    explanation = provider.build_summary(
        snapshot=snapshot,
        recommendation_label="매수",
        target_low=210.0,
        target_high=214.0,
        stop_low=191.0,
        stop_high=194.0,
        key_drivers=["상승 추세가 유지됩니다.", "기초 체력 신호가 우수합니다."],
        invalidation_condition="191 아래 이탈 시 무효",
    )

    assert "매수" in explanation
    assert "210.00~214.00" in explanation
    assert "191 아래 이탈 시 무효" in explanation

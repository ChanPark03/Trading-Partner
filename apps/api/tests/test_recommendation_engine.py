from app.models.contracts import CanonicalMarketSnapshot, CanonicalDerivativesSignal
from app.services.recommendations import build_recommendation_snapshot


def test_build_recommendation_snapshot_for_crypto_creates_buy_setup():
    snapshot = CanonicalMarketSnapshot(
        asset_id="crypto-btc",
        symbol="BTC/USD",
        name="Bitcoin",
        asset_class="crypto",
        current_price=78235.09,
        previous_close=76348.00,
        day_high=78545.89,
        day_low=76146.44,
        volume=0.725,
        change_percent_24h=2.47,
        volatility=0.032,
        tradingview_symbol="BINANCE:BTCUSDT",
    )
    derivatives = CanonicalDerivativesSignal(
        symbol="BTCUSDT",
        mark_price=78179.70,
        index_price=78218.49,
        funding_rate=0.00001432,
        open_interest=100935.915,
        basis_points=-4.959,
    )

    recommendation = build_recommendation_snapshot(
        snapshot=snapshot,
        derivatives=derivatives,
        fundamental_bias=0.55,
    )

    assert recommendation.asset_id == "crypto-btc"
    assert recommendation.recommendation_label == "매수"
    assert recommendation.target_range.low > recommendation.current_price
    assert recommendation.stop_range.high < recommendation.current_price
    assert recommendation.confidence >= 70
    assert recommendation.tradingview_symbol == "BINANCE:BTCUSDT"
    assert recommendation.key_drivers


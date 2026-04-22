from app.services.market_data import normalize_alpaca_snapshot, normalize_binance_market_signal


def test_normalize_alpaca_snapshot_converts_stock_fixture():
    payload = {
        "symbol": "AAPL",
        "daily_bar": {
            "open": 271.61,
            "high": 272.80,
            "low": 265.42,
            "close": 266.16,
            "volume": 1267584.0,
        },
        "previous_daily_bar": {
            "close": 273.06,
        },
    }

    snapshot = normalize_alpaca_snapshot(payload, asset_class="stock", name="Apple Inc.")

    assert snapshot.asset_id == "stock-aapl"
    assert snapshot.symbol == "AAPL"
    assert snapshot.asset_class == "stock"
    assert snapshot.current_price == 266.16
    assert snapshot.previous_close == 273.06
    assert round(snapshot.change_percent_24h, 2) == -2.53


def test_normalize_binance_market_signal_converts_derivatives_fixture():
    payload = {
        "symbol": "BTCUSDT",
        "mark_price": "78179.70",
        "index_price": "78218.49",
        "funding_rate": "0.00001432",
        "open_interest": "100935.915",
    }

    signal = normalize_binance_market_signal(payload)

    assert signal.symbol == "BTCUSDT"
    assert round(signal.funding_rate, 8) == 0.00001432
    assert signal.open_interest == 100935.915
    assert round(signal.basis_points, 3) == round((78179.70 - 78218.49) / 78218.49 * 10000, 3)


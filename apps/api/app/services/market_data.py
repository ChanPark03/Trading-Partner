from app.models.contracts import CanonicalDerivativesSignal, CanonicalMarketSnapshot


def _pct_change(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0
    return ((current - previous) / previous) * 100.0


def _pick(payload: dict, *keys: str) -> float:
    for key in keys:
        if key in payload and payload[key] is not None:
            return float(payload[key])
    raise KeyError(f"Missing required keys: {', '.join(keys)}")


def normalize_alpaca_snapshot(payload: dict, asset_class: str, name: str) -> CanonicalMarketSnapshot:
    symbol = payload["symbol"]
    daily_bar = payload["daily_bar"]
    previous_daily_bar = payload["previous_daily_bar"]
    current_price = _pick(daily_bar, "close", "c")
    previous_close = _pick(previous_daily_bar, "close", "c")
    prefix = "etf" if asset_class == "etf" else asset_class
    exchange = "AMEX" if asset_class == "etf" else "NASDAQ"
    day_high = _pick(daily_bar, "high", "h")
    day_low = _pick(daily_bar, "low", "l")
    volume = _pick(daily_bar, "volume", "v")

    return CanonicalMarketSnapshot(
        asset_id=f"{prefix}-{symbol.lower()}",
        symbol=symbol,
        name=name,
        asset_class=asset_class,
        current_price=current_price,
        previous_close=previous_close,
        day_high=day_high,
        day_low=day_low,
        volume=volume,
        change_percent_24h=round(_pct_change(current_price, previous_close), 2),
        volatility=round((day_high - day_low) / current_price, 4),
        tradingview_symbol=f"{exchange}:{symbol}",
    )


def normalize_binance_market_signal(payload: dict) -> CanonicalDerivativesSignal:
    mark_price = float(payload["mark_price"])
    index_price = float(payload["index_price"])
    basis_points = 0.0
    if index_price:
        basis_points = ((mark_price - index_price) / index_price) * 10000.0

    return CanonicalDerivativesSignal(
        symbol=payload["symbol"],
        mark_price=mark_price,
        index_price=index_price,
        funding_rate=float(payload["funding_rate"]),
        open_interest=float(payload["open_interest"]),
        basis_points=round(basis_points, 3),
    )

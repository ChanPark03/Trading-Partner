from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Protocol

import httpx

from app.config import MarketDataSettings, get_market_data_settings
from app.data_seed import FUNDAMENTAL_BIAS, SEED_DERIVATIVES, SEED_MARKET_SNAPSHOTS
from app.models.contracts import CanonicalDerivativesSignal, CanonicalMarketSnapshot
from app.services.market_data import normalize_alpaca_snapshot, normalize_binance_market_signal


@dataclass(frozen=True)
class RecommendationInputs:
    snapshots: list[CanonicalMarketSnapshot]
    derivatives: dict[str, CanonicalDerivativesSignal]
    fundamental_bias: dict[str, float]


class MarketDataProvider(Protocol):
    provider_name: str

    def load_inputs(self) -> RecommendationInputs:
        ...


class SeedMarketDataProvider:
    provider_name = "seed"

    def load_inputs(self) -> RecommendationInputs:
        return RecommendationInputs(
            snapshots=list(SEED_MARKET_SNAPSHOTS),
            derivatives=dict(SEED_DERIVATIVES),
            fundamental_bias=dict(FUNDAMENTAL_BIAS),
        )


class LiveMarketDataProvider:
    provider_name = "alpaca+binance"

    def __init__(self, settings: Optional[MarketDataSettings] = None):
        self.settings = settings or get_market_data_settings()

    def load_inputs(self) -> RecommendationInputs:
        if not self.settings.live_data_ready:
            raise ValueError("Live market data requires Alpaca credentials.")

        with httpx.Client(timeout=self.settings.request_timeout_seconds) as client:
            equity_snapshots = self._load_alpaca_snapshots(client)
            crypto_snapshots = self._load_binance_spot_snapshots(client)
            live_derivatives = self._load_binance_derivatives(client)

        live_snapshots = {snapshot.asset_id: snapshot for snapshot in [*equity_snapshots, *crypto_snapshots]}
        snapshots = [live_snapshots.get(seed_snapshot.asset_id, seed_snapshot) for seed_snapshot in SEED_MARKET_SNAPSHOTS]
        derivatives = dict(SEED_DERIVATIVES)
        derivatives.update(live_derivatives)

        return RecommendationInputs(
            snapshots=snapshots,
            derivatives=derivatives,
            fundamental_bias=dict(FUNDAMENTAL_BIAS),
        )

    def _load_alpaca_snapshots(self, client: httpx.Client) -> list[CanonicalMarketSnapshot]:
        universe = [snapshot for snapshot in SEED_MARKET_SNAPSHOTS if snapshot.asset_class != "crypto"]
        symbols = ",".join(snapshot.symbol for snapshot in universe)
        response = client.get(
            f"{self.settings.alpaca_base_url}/v2/stocks/snapshots",
            params={"symbols": symbols},
            headers={
                "APCA-API-KEY-ID": self.settings.alpaca_api_key,
                "APCA-API-SECRET-KEY": self.settings.alpaca_api_secret,
            },
        )
        response.raise_for_status()
        payload = response.json().get("snapshots", {})

        snapshots: list[CanonicalMarketSnapshot] = []
        for seed_snapshot in universe:
            raw_snapshot = payload.get(seed_snapshot.symbol)
            if raw_snapshot is None:
                continue
            snapshots.append(
                normalize_alpaca_snapshot(
                    payload=self._coerce_alpaca_payload(seed_snapshot.symbol, raw_snapshot),
                    asset_class=seed_snapshot.asset_class,
                    name=seed_snapshot.name,
                )
            )
        return snapshots

    def _load_binance_spot_snapshots(self, client: httpx.Client) -> list[CanonicalMarketSnapshot]:
        snapshots: list[CanonicalMarketSnapshot] = []
        for seed_snapshot in [item for item in SEED_MARKET_SNAPSHOTS if item.asset_class == "crypto"]:
            binance_symbol = seed_snapshot.tradingview_symbol.split(":")[-1]
            response = client.get(
                f"{self.settings.binance_spot_base_url}/api/v3/ticker/24hr",
                params={"symbol": binance_symbol},
            )
            response.raise_for_status()
            payload = response.json()

            current_price = float(payload["lastPrice"])
            day_high = float(payload["highPrice"])
            day_low = float(payload["lowPrice"])
            change_percent_24h = float(payload["priceChangePercent"])
            previous_close = current_price / max(0.01, 1 + change_percent_24h / 100)

            snapshots.append(
                CanonicalMarketSnapshot(
                    asset_id=seed_snapshot.asset_id,
                    symbol=seed_snapshot.symbol,
                    name=seed_snapshot.name,
                    asset_class=seed_snapshot.asset_class,
                    current_price=current_price,
                    previous_close=round(previous_close, 2),
                    day_high=day_high,
                    day_low=day_low,
                    volume=float(payload.get("quoteVolume") or payload.get("volume") or 0.0),
                    change_percent_24h=round(change_percent_24h, 2),
                    volatility=round((day_high - day_low) / current_price, 4),
                    tradingview_symbol=seed_snapshot.tradingview_symbol,
                )
            )
        return snapshots

    def _load_binance_derivatives(self, client: httpx.Client) -> dict[str, CanonicalDerivativesSignal]:
        derivatives: dict[str, CanonicalDerivativesSignal] = {}
        for seed_snapshot in [item for item in SEED_MARKET_SNAPSHOTS if item.asset_class == "crypto"]:
            binance_symbol = seed_snapshot.tradingview_symbol.split(":")[-1]
            premium_response = client.get(
                f"{self.settings.binance_futures_base_url}/fapi/v1/premiumIndex",
                params={"symbol": binance_symbol},
            )
            premium_response.raise_for_status()
            premium_payload = premium_response.json()

            open_interest_response = client.get(
                f"{self.settings.binance_futures_base_url}/fapi/v1/openInterest",
                params={"symbol": binance_symbol},
            )
            open_interest_response.raise_for_status()
            open_interest_payload = open_interest_response.json()

            derivatives[seed_snapshot.symbol] = normalize_binance_market_signal(
                {
                    "symbol": binance_symbol,
                    "mark_price": premium_payload["markPrice"],
                    "index_price": premium_payload["indexPrice"],
                    "funding_rate": premium_payload["lastFundingRate"],
                    "open_interest": open_interest_payload["openInterest"],
                }
            )
        return derivatives

    def _coerce_alpaca_payload(self, symbol: str, payload: dict) -> dict:
        daily_bar = payload.get("dailyBar") or payload.get("daily_bar") or {}
        previous_daily_bar = (
            payload.get("prevDailyBar")
            or payload.get("previousDailyBar")
            or payload.get("previous_daily_bar")
            or {}
        )
        return {
            "symbol": symbol,
            "daily_bar": {
                "close": daily_bar.get("close", daily_bar.get("c")),
                "high": daily_bar.get("high", daily_bar.get("h")),
                "low": daily_bar.get("low", daily_bar.get("l")),
                "volume": daily_bar.get("volume", daily_bar.get("v")),
            },
            "previous_daily_bar": {
                "close": previous_daily_bar.get("close", previous_daily_bar.get("c")),
                "high": previous_daily_bar.get("high", previous_daily_bar.get("h")),
                "low": previous_daily_bar.get("low", previous_daily_bar.get("l")),
                "volume": previous_daily_bar.get("volume", previous_daily_bar.get("v")),
            },
        }


def get_market_data_provider(settings: Optional[MarketDataSettings] = None) -> MarketDataProvider:
    resolved_settings = settings or get_market_data_settings()
    if resolved_settings.live_data_ready:
        return LiveMarketDataProvider(resolved_settings)
    return SeedMarketDataProvider()

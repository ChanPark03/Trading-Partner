from app.services.providers import SeedMarketDataProvider, get_market_data_provider


def test_provider_defaults_to_seed_when_live_env_missing(monkeypatch):
    monkeypatch.delenv("ALPACA_API_KEY", raising=False)
    monkeypatch.delenv("ALPACA_API_SECRET", raising=False)

    provider = get_market_data_provider()

    assert isinstance(provider, SeedMarketDataProvider)


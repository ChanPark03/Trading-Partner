from fastapi.testclient import TestClient

from app.main import app


def test_dashboard_endpoint_returns_ranked_ideas():
    client = TestClient(app)

    response = client.get("/api/v1/dashboard")

    assert response.status_code == 200
    payload = response.json()
    assert payload["top_ideas"]
    assert payload["filters"]["asset_classes"] == ["stock", "etf", "crypto"]


def test_explore_filters_and_sort_metadata():
    client = TestClient(app)

    response = client.get("/api/v1/explore?asset_class=crypto&label=매수&trend_state=bullish&min_score=60&sort=change_desc")

    assert response.status_code == 200
    payload = response.json()
    assert payload["items"]
    assert payload["sort"]["sort"] == "change_desc"
    assert payload["applied_filters"]["asset_class"] == "crypto"
    assert all(item["asset_class"] == "crypto" for item in payload["items"])
    assert all(item["recommendation_label"] == "매수" for item in payload["items"])


def test_asset_detail_returns_real_market_snapshot():
    client = TestClient(app)

    response = client.get("/api/v1/assets/crypto-btc")

    assert response.status_code == 200
    payload = response.json()
    assert payload["market_snapshot"]["asset_id"] == "crypto-btc"
    assert payload["market_snapshot"]["day_high"] == 78545.89
    assert payload["market_snapshot"]["tradingview_symbol"] == "BINANCE:BTCUSDT"


def test_watchlist_round_trip_for_demo_user():
    client = TestClient(app)

    create = client.post("/api/v1/watchlist", json={"asset_id": "crypto-btc"})
    assert create.status_code == 200

    fetch = client.get("/api/v1/watchlist")
    assert fetch.status_code == 200
    payload = fetch.json()

    assert any(item["asset_id"] == "crypto-btc" for item in payload["items"])

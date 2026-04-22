from fastapi.testclient import TestClient

from app.main import app


def test_dashboard_endpoint_returns_ranked_ideas():
    client = TestClient(app)

    response = client.get("/api/v1/dashboard")

    assert response.status_code == 200
    payload = response.json()
    assert payload["top_ideas"]
    assert payload["filters"]["asset_classes"] == ["stock", "etf", "crypto"]


def test_watchlist_round_trip_for_demo_user():
    client = TestClient(app)

    create = client.post("/api/v1/watchlist", json={"asset_id": "crypto-btc"})
    assert create.status_code == 200

    fetch = client.get("/api/v1/watchlist")
    assert fetch.status_code == 200
    payload = fetch.json()

    assert any(item["asset_id"] == "crypto-btc" for item in payload["items"])

from fastapi.testclient import TestClient

from app.main import app


def test_recompute_creates_user_scoped_high_risk_alert_for_watched_asset():
    client = TestClient(app)
    headers = {"x-user-id": "risk-alert-user"}

    watch = client.post("/api/v1/watchlist", json={"asset_id": "crypto-sol"}, headers=headers)
    assert watch.status_code == 200

    recompute = client.post("/api/v1/internal/recompute", headers=headers)
    assert recompute.status_code == 200

    alerts = client.get("/api/v1/alerts", headers=headers)
    assert alerts.status_code == 200
    titles = [item["title"] for item in alerts.json()["items"]]
    assert any("SOL/USD 리스크 확대" == title for title in titles)

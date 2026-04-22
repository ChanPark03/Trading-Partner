from fastapi.testclient import TestClient

from app.main import app


def test_profile_preference_reorders_dashboard():
    client = TestClient(app)

    response = client.put(
        "/api/v1/profile",
        json={
            "email": "demo@example.com",
            "risk_tolerance": "aggressive",
            "time_horizon": "hybrid",
            "preferred_asset_classes": ["crypto"],
            "locale": "ko-KR",
        },
    )
    assert response.status_code == 200

    dashboard = client.get("/api/v1/dashboard")
    assert dashboard.status_code == 200
    payload = dashboard.json()

    assert payload["top_ideas"][0]["asset_class"] == "crypto"


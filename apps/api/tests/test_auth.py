import base64
import hashlib
import hmac
import json
import time

from fastapi.testclient import TestClient

from app.main import app


def _segment(payload: dict) -> str:
    raw = json.dumps(payload, separators=(",", ":")).encode()
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


def _token(secret: str, sub: str) -> str:
    header = _segment({"alg": "HS256", "typ": "JWT"})
    payload = _segment({"sub": sub, "exp": int(time.time()) + 600})
    signature = hmac.new(secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    return f"{header}.{payload}.{base64.urlsafe_b64encode(signature).rstrip(b'=').decode()}"


def test_supabase_jwt_subject_is_used_as_user_id(monkeypatch):
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "test-secret")
    client = TestClient(app)

    response = client.get(
        "/api/v1/profile",
        headers={"Authorization": f"Bearer {_token('test-secret', 'supabase-user-1')}"},
    )

    assert response.status_code == 200
    assert response.json()["user_id"] == "supabase-user-1"


def test_demo_header_fallback_scopes_user_when_supabase_secret_missing(monkeypatch):
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)
    client = TestClient(app)

    response = client.get("/api/v1/profile", headers={"x-user-id": "local-user-1"})

    assert response.status_code == 200
    assert response.json()["user_id"] == "local-user-1"

from __future__ import annotations

import base64
import hashlib
import hmac
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from fastapi import Header, HTTPException

from app.config import get_auth_settings


@dataclass(frozen=True)
class AuthContext:
    user_id: str
    mode: str


def _decode_base64url(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def _decode_supabase_jwt(token: str, secret: str) -> dict:
    try:
        header_segment, payload_segment, signature_segment = token.split(".")
        header = json.loads(_decode_base64url(header_segment))
        payload = json.loads(_decode_base64url(payload_segment))
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid bearer token") from exc

    if header.get("alg") != "HS256":
        raise HTTPException(status_code=401, detail="Unsupported token algorithm")

    signed_payload = f"{header_segment}.{payload_segment}".encode()
    expected = hmac.new(secret.encode(), signed_payload, hashlib.sha256).digest()
    actual = _decode_base64url(signature_segment)
    if not hmac.compare_digest(expected, actual):
        raise HTTPException(status_code=401, detail="Invalid bearer token signature")

    exp = payload.get("exp")
    if exp is not None and datetime.fromtimestamp(float(exp), timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Expired bearer token")

    if not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Token is missing subject")

    return payload


def get_auth_context(
    authorization: Optional[str] = Header(default=None),
    x_user_id: Optional[str] = Header(default="demo-user"),
) -> AuthContext:
    settings = get_auth_settings()
    if settings.supabase_ready and authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            raise HTTPException(status_code=401, detail="Expected bearer token")
        payload = _decode_supabase_jwt(token, settings.supabase_jwt_secret)
        return AuthContext(user_id=payload["sub"], mode="supabase")

    return AuthContext(user_id=x_user_id or "demo-user", mode="demo")

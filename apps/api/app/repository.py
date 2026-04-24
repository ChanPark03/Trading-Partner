from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator, Optional, Protocol
from uuid import uuid4

from app.config import DATABASE_URL, DEFAULT_DB_PATH
from app.models.contracts import (
    AlertEvent,
    MarketSnapshot,
    PortfolioPosition,
    ProfileUpdatePayload,
    RecommendationSnapshot,
    UserProfile,
    WatchlistItem,
)


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Database:
    def __init__(self, path: Optional[str] = None):
        self.path = path or str(DEFAULT_DB_PATH)
        self._ensure_tables()

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
            connection.commit()
        finally:
            connection.close()

    def _ensure_tables(self) -> None:
        with self.connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS profiles (
                    user_id TEXT PRIMARY KEY,
                    email TEXT NOT NULL,
                    risk_tolerance TEXT NOT NULL,
                    time_horizon TEXT NOT NULL,
                    preferred_asset_classes TEXT NOT NULL,
                    locale TEXT NOT NULL,
                    completed_onboarding INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS watchlist (
                    user_id TEXT NOT NULL,
                    asset_id TEXT NOT NULL,
                    added_at TEXT NOT NULL,
                    PRIMARY KEY (user_id, asset_id)
                );
                CREATE TABLE IF NOT EXISTS portfolio (
                    user_id TEXT NOT NULL,
                    asset_id TEXT NOT NULL,
                    quantity REAL NOT NULL,
                    average_cost REAL NOT NULL,
                    note TEXT,
                    PRIMARY KEY (user_id, asset_id)
                );
                CREATE TABLE IF NOT EXISTS alerts (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    asset_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    detail TEXT NOT NULL,
                    level TEXT NOT NULL,
                    is_read INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    dedupe_key TEXT
                );
                CREATE TABLE IF NOT EXISTS recommendations (
                    asset_id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    as_of TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS market_snapshots (
                    asset_id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    as_of TEXT NOT NULL
                );
                """
            )
            alert_columns = {
                row["name"]
                for row in conn.execute("PRAGMA table_info(alerts)").fetchall()
            }
            if "dedupe_key" not in alert_columns:
                conn.execute("ALTER TABLE alerts ADD COLUMN dedupe_key TEXT")

    def ensure_demo_profile(self, user_id: str = "demo-user") -> UserProfile:
        profile = self.get_profile(user_id)
        if profile:
            return profile
        default_profile = UserProfile(
            user_id=user_id,
            email="demo@example.com",
            risk_tolerance="balanced",
            time_horizon="hybrid",
            preferred_asset_classes=["stock", "etf", "crypto"],
            locale="ko-KR",
            completed_onboarding=True,
        )
        self.update_profile(user_id, ProfileUpdatePayload(**default_profile.model_dump(exclude={"user_id", "completed_onboarding"})))
        return self.get_profile(user_id)  # type: ignore[return-value]

    def get_profile(self, user_id: str) -> Optional[UserProfile]:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM profiles WHERE user_id = ?", (user_id,)).fetchone()
        if row is None:
            return None
        return UserProfile(
            user_id=row["user_id"],
            email=row["email"],
            risk_tolerance=row["risk_tolerance"],
            time_horizon=row["time_horizon"],
            preferred_asset_classes=json.loads(row["preferred_asset_classes"]),
            locale=row["locale"],
            completed_onboarding=bool(row["completed_onboarding"]),
        )

    def update_profile(self, user_id: str, payload: ProfileUpdatePayload) -> UserProfile:
        with self.connect() as conn:
            conn.execute(
                """
                INSERT INTO profiles (
                    user_id, email, risk_tolerance, time_horizon, preferred_asset_classes, locale, completed_onboarding
                ) VALUES (?, ?, ?, ?, ?, ?, 1)
                ON CONFLICT(user_id) DO UPDATE SET
                    email = excluded.email,
                    risk_tolerance = excluded.risk_tolerance,
                    time_horizon = excluded.time_horizon,
                    preferred_asset_classes = excluded.preferred_asset_classes,
                    locale = excluded.locale,
                    completed_onboarding = 1
                """,
                (
                    user_id,
                    payload.email,
                    payload.risk_tolerance,
                    payload.time_horizon,
                    json.dumps(payload.preferred_asset_classes),
                    payload.locale,
                ),
            )
        return self.get_profile(user_id)  # type: ignore[return-value]

    def get_watchlist(self, user_id: str) -> list[WatchlistItem]:
        with self.connect() as conn:
            rows = conn.execute(
                "SELECT asset_id, added_at FROM watchlist WHERE user_id = ? ORDER BY added_at DESC",
                (user_id,),
            ).fetchall()
        return [
            WatchlistItem(asset_id=row["asset_id"], added_at=datetime.fromisoformat(row["added_at"]))
            for row in rows
        ]

    def add_watchlist_item(self, user_id: str, asset_id: str) -> None:
        with self.connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO watchlist (user_id, asset_id, added_at)
                VALUES (?, ?, ?)
                """,
                (user_id, asset_id, _utcnow_iso()),
            )

    def remove_watchlist_item(self, user_id: str, asset_id: str) -> None:
        with self.connect() as conn:
            conn.execute("DELETE FROM watchlist WHERE user_id = ? AND asset_id = ?", (user_id, asset_id))

    def get_portfolio(self, user_id: str) -> list[PortfolioPosition]:
        with self.connect() as conn:
            rows = conn.execute(
                "SELECT asset_id, quantity, average_cost, note FROM portfolio WHERE user_id = ? ORDER BY asset_id",
                (user_id,),
            ).fetchall()
        return [
            PortfolioPosition(
                asset_id=row["asset_id"],
                quantity=row["quantity"],
                average_cost=row["average_cost"],
                note=row["note"],
            )
            for row in rows
        ]

    def replace_portfolio(self, user_id: str, positions: list[PortfolioPosition]) -> list[PortfolioPosition]:
        with self.connect() as conn:
            conn.execute("DELETE FROM portfolio WHERE user_id = ?", (user_id,))
            conn.executemany(
                """
                INSERT INTO portfolio (user_id, asset_id, quantity, average_cost, note)
                VALUES (?, ?, ?, ?, ?)
                """,
                [(user_id, position.asset_id, position.quantity, position.average_cost, position.note) for position in positions],
            )
        return self.get_portfolio(user_id)

    def list_alerts(self, user_id: str) -> list[AlertEvent]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT id, asset_id, title, detail, level, is_read, created_at
                FROM alerts
                WHERE user_id = ?
                ORDER BY created_at DESC
                """,
                (user_id,),
            ).fetchall()
        return [
            AlertEvent(
                id=row["id"],
                asset_id=row["asset_id"],
                title=row["title"],
                detail=row["detail"],
                level=row["level"],
                is_read=bool(row["is_read"]),
                created_at=datetime.fromisoformat(row["created_at"]),
            )
            for row in rows
        ]

    def create_alert(
        self,
        user_id: str,
        asset_id: str,
        title: str,
        detail: str,
        level: str = "info",
        dedupe_key: Optional[str] = None,
    ) -> None:
        with self.connect() as conn:
            if dedupe_key:
                existing = conn.execute(
                    "SELECT id FROM alerts WHERE user_id = ? AND dedupe_key = ?",
                    (user_id, dedupe_key),
                ).fetchone()
                if existing is not None:
                    return
            conn.execute(
                """
                INSERT INTO alerts (id, user_id, asset_id, title, detail, level, is_read, created_at, dedupe_key)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
                """,
                (str(uuid4()), user_id, asset_id, title, detail, level, _utcnow_iso(), dedupe_key),
            )

    def mark_alert_read(self, user_id: str, alert_id: str) -> None:
        with self.connect() as conn:
            conn.execute("UPDATE alerts SET is_read = 1 WHERE user_id = ? AND id = ?", (user_id, alert_id))

    def save_recommendations(self, snapshots: list[RecommendationSnapshot]) -> None:
        with self.connect() as conn:
            conn.executemany(
                """
                INSERT INTO recommendations (asset_id, payload, as_of)
                VALUES (?, ?, ?)
                ON CONFLICT(asset_id) DO UPDATE SET
                    payload = excluded.payload,
                    as_of = excluded.as_of
                """,
                [
                    (
                        snapshot.asset_id,
                        snapshot.model_dump_json(),
                        snapshot.as_of.isoformat(),
                    )
                    for snapshot in snapshots
                ],
            )

    def list_recommendations(self) -> list[RecommendationSnapshot]:
        with self.connect() as conn:
            rows = conn.execute("SELECT payload FROM recommendations").fetchall()
        return [RecommendationSnapshot.model_validate_json(row["payload"]) for row in rows]

    def get_recommendation(self, asset_id: str) -> Optional[RecommendationSnapshot]:
        with self.connect() as conn:
            row = conn.execute("SELECT payload FROM recommendations WHERE asset_id = ?", (asset_id,)).fetchone()
        if row is None:
            return None
        return RecommendationSnapshot.model_validate_json(row["payload"])

    def save_market_snapshots(self, snapshots: list[MarketSnapshot]) -> None:
        with self.connect() as conn:
            conn.executemany(
                """
                INSERT INTO market_snapshots (asset_id, payload, as_of)
                VALUES (?, ?, ?)
                ON CONFLICT(asset_id) DO UPDATE SET
                    payload = excluded.payload,
                    as_of = excluded.as_of
                """,
                [
                    (
                        snapshot.asset_id,
                        snapshot.model_dump_json(),
                        snapshot.as_of.isoformat(),
                    )
                    for snapshot in snapshots
                ],
            )

    def list_market_snapshots(self) -> list[MarketSnapshot]:
        with self.connect() as conn:
            rows = conn.execute("SELECT payload FROM market_snapshots").fetchall()
        return [MarketSnapshot.model_validate_json(row["payload"]) for row in rows]

    def get_market_snapshot(self, asset_id: str) -> Optional[MarketSnapshot]:
        with self.connect() as conn:
            row = conn.execute("SELECT payload FROM market_snapshots WHERE asset_id = ?", (asset_id,)).fetchone()
        if row is None:
            return None
        return MarketSnapshot.model_validate_json(row["payload"])

    def get_user_ids_for_asset(self, asset_id: str) -> list[str]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT user_id FROM watchlist WHERE asset_id = ?
                UNION
                SELECT user_id FROM portfolio WHERE asset_id = ?
                """,
                (asset_id, asset_id),
            ).fetchall()
        return [row["user_id"] for row in rows]


class RepositoryProtocol(Protocol):
    def ensure_demo_profile(self, user_id: str = "demo-user") -> UserProfile:
        ...

    def list_recommendations(self) -> list[RecommendationSnapshot]:
        ...

    def get_recommendation(self, asset_id: str) -> Optional[RecommendationSnapshot]:
        ...

    def get_market_snapshot(self, asset_id: str) -> Optional[MarketSnapshot]:
        ...


def get_storage_mode(database_url: str = DATABASE_URL) -> str:
    if database_url.startswith(("postgres://", "postgresql://")):
        return "postgres-ready"
    return "sqlite"


def create_repository() -> Database:
    # Postgres uses the same repository protocol next, but SQLite stays the
    # executable local default until migrations are introduced.
    return Database()

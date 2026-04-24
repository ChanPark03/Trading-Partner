import os
from dataclasses import dataclass
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)


def _resolve_sqlite_path(database_url: str) -> Path:
    if not database_url.startswith("sqlite:///"):
        return DATA_DIR / "research_assistant.db"

    raw_path = database_url.replace("sqlite:///", "", 1)
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        candidate = ROOT_DIR / raw_path.lstrip("./")
    return candidate


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/research_assistant.db")
DEFAULT_DB_PATH = _resolve_sqlite_path(DATABASE_URL)
DEFAULT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)


@dataclass(frozen=True)
class MarketDataSettings:
    alpaca_api_key: str = ""
    alpaca_api_secret: str = ""
    alpaca_base_url: str = "https://data.alpaca.markets"
    binance_spot_base_url: str = "https://api.binance.com"
    binance_futures_base_url: str = "https://fapi.binance.com"
    request_timeout_seconds: float = 8.0

    @property
    def live_data_ready(self) -> bool:
        return bool(self.alpaca_api_key and self.alpaca_api_secret)


@dataclass(frozen=True)
class ExplanationSettings:
    provider: str = "template"
    openai_api_key: str = ""
    openai_model: str = "gpt-5.4-mini"

    @property
    def llm_ready(self) -> bool:
        return self.provider not in {"mock", "template"} and bool(self.openai_api_key)


@dataclass(frozen=True)
class AuthSettings:
    supabase_jwt_secret: str = ""

    @property
    def supabase_ready(self) -> bool:
        return bool(self.supabase_jwt_secret)


def get_market_data_settings() -> MarketDataSettings:
    return MarketDataSettings(
        alpaca_api_key=os.getenv("ALPACA_API_KEY", ""),
        alpaca_api_secret=os.getenv("ALPACA_API_SECRET", ""),
        alpaca_base_url=os.getenv("ALPACA_BASE_URL", "https://data.alpaca.markets"),
        binance_spot_base_url=os.getenv("BINANCE_SPOT_BASE_URL", "https://api.binance.com"),
        binance_futures_base_url=os.getenv("BINANCE_FUTURES_BASE_URL", "https://fapi.binance.com"),
        request_timeout_seconds=float(os.getenv("MARKET_DATA_TIMEOUT_SECONDS", "8")),
    )


def get_explanation_settings() -> ExplanationSettings:
    return ExplanationSettings(
        provider=os.getenv("LLM_PROVIDER", "template"),
        openai_api_key=os.getenv("OPENAI_API_KEY", ""),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-5.4-mini"),
    )


def get_auth_settings() -> AuthSettings:
    return AuthSettings(supabase_jwt_secret=os.getenv("SUPABASE_JWT_SECRET", ""))

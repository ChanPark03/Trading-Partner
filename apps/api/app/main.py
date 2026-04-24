from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.config import get_auth_settings
from app.repository import get_storage_mode
from app.services.explanations import get_explanation_provider
from app.services.providers import get_market_data_provider


app = FastAPI(
    title="Investment Research API",
    version="0.1.0",
    description="API for the Korean-first investment research assistant",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/healthz")
def healthcheck():
    return {
        "status": "ok",
        "market_data_provider": get_market_data_provider().provider_name,
        "explanation_provider": get_explanation_provider().provider_name,
        "auth_mode": "supabase-ready" if get_auth_settings().supabase_ready else "demo",
        "storage_mode": get_storage_mode(),
    }

from app.bootstrap import recompute_recommendations
from app.repository import Database


def run_worker() -> dict:
    db = Database()
    provider_name = recompute_recommendations(db)
    return {
        "market_data_provider": provider_name,
        "stocks_etfs_snapshot_refresh": "5m during market hours",
        "stocks_etfs_recompute": "60m during regular session + post close",
        "crypto_snapshot_refresh": "1m",
        "crypto_fast_recompute": "15m",
        "crypto_structural_recompute": "00/04/08/12/16/20 UTC",
    }


if __name__ == "__main__":
    result = run_worker()
    print(result)

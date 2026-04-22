SCHEDULE_POLICY = {
    "stocks_etfs": {
        "snapshot_refresh": "*/5 13-21 * * 1-5",
        "recommendation_refresh": "0 14-21 * * 1-5",
        "post_close_refresh": "15 22 * * 1-5",
    },
    "crypto": {
        "snapshot_refresh": "*/1 * * * *",
        "fast_recompute": "*/15 * * * *",
        "structural_recompute": "0 */4 * * *",
    },
}


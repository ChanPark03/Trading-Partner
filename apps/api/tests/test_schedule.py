from app.schedule import SCHEDULE_POLICY


def test_schedule_policy_contains_intraday_cadence():
    assert SCHEDULE_POLICY["stocks_etfs"]["snapshot_refresh"] == "*/5 13-21 * * 1-5"
    assert SCHEDULE_POLICY["crypto"]["fast_recompute"] == "*/15 * * * *"
    assert SCHEDULE_POLICY["crypto"]["structural_recompute"] == "0 */4 * * *"


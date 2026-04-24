# Trading Partner Architecture

## Runtime

- `apps/web`: Next.js App Router frontend
- `apps/api`: FastAPI API plus recompute worker
- `packages/contracts`: shared TypeScript response contracts

## Data Flow

1. Curated asset universe is loaded from a `MarketDataProvider`.
2. Seed mode works offline by default; live mode hydrates US assets from Alpaca and crypto spot/derivatives context from Binance.
3. External payloads are normalized into canonical market models before scoring.
4. Recommendation engine computes signals, risk gates, price targets, stop ranges, and invalidation rules.
5. `ExplanationProvider` synthesizes Korean copy from structured recommendation facts only.
6. Worker stores both raw `MarketSnapshot` payloads and fresh recommendation snapshots.
7. API reads global snapshots and applies user-specific ranking boosts from profile, watchlist, and manual holdings without mutating raw facts.
8. Frontend renders dense analyst-workspace pages with TradingView widgets and adjacent recommendation/risk panels.

## Auth and Storage

- Production target: Supabase Auth + Postgres
- Local fallback in this repo: demo session + SQLite
- `Authorization: Bearer` with `SUPABASE_JWT_SECRET` uses the JWT `sub` as `user_id`
- Without Supabase JWT settings, API keeps the `x-user-id` / demo fallback
- Repository factory reports a Postgres-ready storage mode, while SQLite remains the executable MVP backend until migrations are added
- Health endpoint reports current market-data, explanation, auth, and storage runtime modes

## Explore and Alerts

- `GET /api/v1/explore` supports asset class, recommendation label, score, volatility, volume, trend state, personalization, and sort filters.
- Recompute stores market snapshots and can create user-scoped alert events for watched or held assets when high-risk flags appear or recommendation labels downgrade.

## UI Verification

- UI verification uses the installed Playwright CLI skill.
- Artifacts should be captured under `output/playwright/` for desktop, tablet, and mobile viewports.

## Refresh Policy

- US stocks / ETFs
  - snapshot refresh every 5 minutes during market hours
  - recommendation recompute every 60 minutes during regular session
  - post-close recompute once after close
- Crypto
  - snapshot refresh every 1 minute
  - fast recompute every 15 minutes
  - structural recompute every 4 hours

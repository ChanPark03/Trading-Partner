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
6. Worker stores fresh recommendation snapshots.
7. API reads global snapshots and applies user-specific ranking boosts from profile, watchlist, and manual holdings.
8. Frontend renders recommendation cards and TradingView widgets side-by-side.

## Auth and Storage

- Production target: Supabase Auth + Postgres
- Local fallback in this repo: demo session + SQLite
- Health endpoint reports current market-data and explanation runtime modes

## Refresh Policy

- US stocks / ETFs
  - snapshot refresh every 5 minutes during market hours
  - recommendation recompute every 60 minutes during regular session
  - post-close recompute once after close
- Crypto
  - snapshot refresh every 1 minute
  - fast recompute every 15 minutes
  - structural recompute every 4 hours

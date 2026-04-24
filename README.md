# Investment Research SaaS v1

Korean-first investment research assistant for US stocks, US ETFs, and major crypto assets. The product is positioned as a research assistant, not a brokerage or auto-trading system.

The app gives users explainable recommendations such as `매수`, `관망`, and `회피`, with confidence, target range, stop range, invalidation condition, key drivers, risk flags, and TradingView chart context.

## Current Status

- Next.js + TypeScript web app with Korean-first authenticated SaaS shell.
- FastAPI + Python `api/v1` backend with seed recommendation engine.
- SQLite demo repository by default, with a repository factory ready for `DATABASE_URL` mode branching.
- Supabase-compatible auth skeleton: `Authorization: Bearer` + `SUPABASE_JWT_SECRET` maps JWT `sub` to the user id, while local demo mode falls back to `x-user-id` or `demo-user`.
- Market data abstraction for seed data, Alpaca, and Binance enrichment.
- Stored normalized `MarketSnapshot` records are returned separately from personalized recommendation ranking.
- TradingView widget shell is used for chart visualization; recommendation logic stays in our own engine.
- Dense analyst-workspace UI with compact cards, filters, segmented watchlist/portfolio workspace, alert inbox actions, and `lucide-react` icons.

## Workspace Layout

```text
apps/
  api/      FastAPI app, seed data, repository, recommendation engine, worker
  web/      Next.js app routes, UI components, API client, tests
packages/
  contracts/ Shared TypeScript contracts and sample payloads
docs/
  architecture.md Architecture notes and v1 boundaries
```

## Local Development

This repo is designed to run with mock/seed data by default, so the UI and API work without live market-data or auth credentials.

### Install

```bash
python3 -m pip install -e 'apps/api[dev]'
npm install
```

### Optional Env Files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Default local values:

- API: `http://127.0.0.1:8000`
- Web: `http://localhost:3000`
- Web env key: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

### Run Preview Servers

Terminal 1:

```bash
cd apps/api
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Terminal 2:

```bash
npm run dev:web
```

Open:

```text
http://localhost:3000/app
```

## Runtime Modes

- Market data defaults to seed fixtures and can switch to Alpaca + Binance HTTP providers when credentials are present.
- Recommendations are recomputed from normalized market facts, signal packs, risk gates, scoring, target/stop generation, and grounded explanation synthesis.
- Personalization changes ranking order and alert priority, but does not mutate raw market facts.
- Explanations default to a deterministic template provider; LLM provider configuration is reserved for production handoff.
- Auth defaults to demo scoping and supports Supabase-style JWT validation when `SUPABASE_JWT_SECRET` is set.
- Storage defaults to local SQLite. Postgres migration is intentionally deferred, but the repository factory keeps the switch point explicit.

## Product Surfaces

- `/sign-in`: public auth entry.
- `/onboarding`: preference capture for risk profile and asset interests.
- `/app`: dashboard with market context, ranked ideas, quick filters, TradingView market overview, and alert preview.
- `/app/explore`: server-backed universe filtering and sorting.
- `/app/assets/[assetId]`: TradingView chart shell plus recommendation, target/stop, invalidation, signal, risk, and market snapshot panels.
- `/app/watchlist`: segmented watchlist and manual portfolio workspace with curated asset selectors.
- `/app/alerts`: in-app alert inbox with read-state API action.
- `/app/settings`: profile and preference workspace.

## API v1

Base URL:

```text
http://127.0.0.1:8000/api/v1
```

Core endpoints:

- `GET /dashboard`
- `GET /assets/{asset_id}`
- `GET /explore`
- `GET /alerts`
- `POST /alerts/{id}/read`
- `GET /watchlist`
- `POST /watchlist`
- `DELETE /watchlist/{asset_id}`
- `GET /portfolio`
- `PUT /portfolio`
- `GET /profile`
- `PUT /profile`
- `POST /internal/recompute`

Explore query parameters:

```text
asset_class
label
search
min_score
max_volatility
min_volume
trend_state
personalized
sort
page
page_size
```

Supported sort values:

```text
score_desc
score_asc
change_desc
confidence_desc
volume_desc
symbol_asc
```

## Verification

Run the main checks:

```bash
npm run test:api
npm run test:web
npm run lint:web
npm run build:web
```

Latest local verification:

- API tests: `14 passed`
- Web component tests: `3 passed`
- Web lint: passed
- Next production build: passed

## Browser Verification

Use the installed Playwright skill wrapper for manual browser checks:

```bash
export PWCLI="$HOME/.codex/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" open http://localhost:3000/app
"$PWCLI" snapshot
"$PWCLI" screenshot
```

The wrapper writes artifacts under `.playwright-cli/`. Copy useful screenshots into `output/playwright/` when keeping visual evidence locally. Both `.playwright-cli/` and `output/playwright/` are ignored by git.

Recommended visual routes:

- `http://localhost:3000/sign-in`
- `http://localhost:3000/onboarding`
- `http://localhost:3000/app`
- `http://localhost:3000/app/explore`
- `http://localhost:3000/app/assets/crypto-btc`
- `http://localhost:3000/app/watchlist`
- `http://localhost:3000/app/alerts`

TradingView iframe internals depend on external network availability. For local acceptance, verify the widget shell, symbol text, and adjacent recommendation metadata.

## V1 Boundaries

Included:

- US stocks
- US ETFs
- Major crypto assets
- TradingView widget visualization
- Manual watchlist and portfolio entry
- In-app alerts
- Supabase/Postgres connection skeletons

Deferred:

- Broker connection
- Auto-trading
- Korean stocks and Korean ETFs
- Paid billing
- Push/email notifications
- Direct custom overlays inside TradingView
- Full-market scanning

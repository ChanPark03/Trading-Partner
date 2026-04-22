# Investment Research SaaS v1

Korean-first research assistant for US stocks, US ETFs, and major crypto assets.

## Workspace Layout

- `apps/web`: Next.js frontend
- `apps/api`: FastAPI backend and worker
- `packages/contracts`: shared TypeScript contracts and example payloads

## Local Development

This repo is designed to run with mock/seed data by default so the UI and API
remain functional without external market-data or auth credentials.

### Runtime Modes

- Market data: defaults to seed fixtures, automatically switches to the
  `Alpaca + Binance` HTTP provider when Alpaca credentials are present.
- Explanations: defaults to a grounded template provider fed only by computed
  recommendation facts.
- Auth: frontend is demo-first in this workspace, with Supabase env vars reserved
  for production handoff.

### Quick Start

```bash
python3 -m pip install -e 'apps/api[dev]'
npm install
python3 -m pytest apps/api/tests -q
npm run test:web
```

Planned production integrations:

- Supabase Auth + Postgres
- Alpaca market data for US equities / ETFs
- Binance market structure data for crypto
- TradingView widgets for charts and market context

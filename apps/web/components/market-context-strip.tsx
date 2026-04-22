import type { DashboardPayload } from "@investment-research/contracts";


export function MarketContextStrip({ marketContext }: { marketContext: DashboardPayload["market_context"] }) {
  return (
    <section className="dashboard-card market-strip">
      <div>
        <div className="eyebrow">market context</div>
        <h2 className="section-title" style={{ marginTop: 14 }}>{marketContext.summary}</h2>
        <p className="muted">{marketContext.breadth}</p>
      </div>
      <div className="market-pillars">
        <div className="market-pillar">
          <div className="mini-label">변동성 레짐</div>
          <div className="mini-value">{marketContext.volatility_regime}</div>
        </div>
        <div className="market-pillar">
          <div className="mini-label">상위 리더</div>
          <div className="mini-value">{marketContext.leaders.join(" · ")}</div>
        </div>
      </div>
    </section>
  );
}


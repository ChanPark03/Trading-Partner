import type { DashboardPayload } from "@investment-research/contracts";
import { Activity, Gauge, RadioTower } from "lucide-react";


export function MarketContextStrip({ marketContext }: { marketContext: DashboardPayload["market_context"] }) {
  return (
    <section className="dashboard-card market-strip">
      <div>
        <div className="eyebrow"><RadioTower size={13} /> MARKET CONTEXT</div>
        <h2 className="section-title" style={{ marginTop: 14 }}>{marketContext.summary}</h2>
        <p className="muted">{marketContext.breadth}</p>
      </div>
      <div className="market-pillars">
        <div className="market-pillar">
          <div className="mini-label icon-label"><Gauge size={13} /> 변동성 레짐</div>
          <div className="mini-value">{marketContext.volatility_regime}</div>
        </div>
        <div className="market-pillar">
          <div className="mini-label icon-label"><Activity size={13} /> 상위 리더</div>
          <div className="mini-value">{marketContext.leaders.join(" · ")}</div>
        </div>
      </div>
    </section>
  );
}

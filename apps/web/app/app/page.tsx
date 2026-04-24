import Link from "next/link";
import { Filter, ListFilter } from "lucide-react";

import { AlertsPanel } from "@/components/alerts-panel";
import { AppShell } from "@/components/app-shell";
import { MarketContextStrip } from "@/components/market-context-strip";
import { RecommendationCard } from "@/components/recommendation-card";
import { TradingViewMarketOverview } from "@/components/tradingview-market-overview";
import { getDashboard } from "@/lib/api";


export default async function DashboardPage() {
  const dashboard = await getDashboard();

  return (
    <AppShell title="대시보드" activePath="/app">
      <div className="dashboard-layout">
        <div className="main-column">
          <MarketContextStrip marketContext={dashboard.market_context} />

          <section className="dashboard-card">
            <div className="section-toolbar">
              <div>
                <div className="eyebrow"><ListFilter size={13} /> RANKED IDEAS</div>
                <h2 className="section-title">오늘의 상위 추천 자산</h2>
                <p className="muted">개인화는 정렬 우선순위에만 반영되고, 원시 분석 결과는 바뀌지 않습니다.</p>
              </div>
              <div className="filter-chip-row">
                <Link className="filter-chip" href="/app/explore"><Filter size={13} /> 전체</Link>
                <Link className="filter-chip" href="/app/explore?asset_class=stock">주식</Link>
                <Link className="filter-chip" href="/app/explore?asset_class=etf">ETF</Link>
                <Link className="filter-chip" href="/app/explore?asset_class=crypto">코인</Link>
                <Link className="filter-chip" href="/app/explore?label=매수">매수</Link>
              </div>
            </div>
            <div className="idea-grid">
              {dashboard.top_ideas.map((idea) => (
                <Link key={idea.asset_id} href={`/app/assets/${idea.asset_id}`}>
                  <RecommendationCard idea={idea} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="side-column">
          <AlertsPanel alerts={dashboard.alerts_preview} />
          <TradingViewMarketOverview />
        </div>
      </div>
    </AppShell>
  );
}

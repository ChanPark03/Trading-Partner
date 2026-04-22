import Link from "next/link";

import { RecommendationCard } from "@/components/recommendation-card";
import { dashboardMock } from "@/lib/mock-data";


export default function LandingPage() {
  return (
    <main className="landing page-shell">
      <div className="landing-grid">
        <section className="hero-card">
          <div className="eyebrow">premium analyst desk</div>
          <h1 className="hero-title">설명 가능한 투자 추천을 한 화면에.</h1>
          <p className="hero-copy">
            Trading Partner는 미국주식, 미국 ETF, 주요 코인을 분석해 한국어로 이해하기 쉬운
            추천 상태, 목표 구간, 손절 구간, 무효화 조건을 제시하는 리서치 어시스턴트입니다.
          </p>
          <div className="cta-row">
            <Link href="/sign-in" className="primary-button">데모 시작</Link>
            <Link href="/app" className="secondary-button">앱 보기</Link>
          </div>
          <div className="metric-grid">
            <div className="metric">
              <div className="metric-label">자산 범위</div>
              <div className="metric-value">US Stocks + ETFs + Crypto</div>
            </div>
            <div className="metric">
              <div className="metric-label">차트 엔진</div>
              <div className="metric-value">TradingView Widgets</div>
            </div>
            <div className="metric">
              <div className="metric-label">추천 형태</div>
              <div className="metric-value">매수 / 관망 / 회피</div>
            </div>
            <div className="metric">
              <div className="metric-label">엔진 철학</div>
              <div className="metric-value">퀀트 우선 하이브리드</div>
            </div>
          </div>
        </section>

        <section className="panel-card">
          <div className="section-head">
            <div className="eyebrow">today&apos;s ideas</div>
            <h2 className="section-title">추천 대시보드 미리보기</h2>
          </div>
          <div className="idea-grid">
            {dashboardMock.top_ideas.slice(0, 2).map((idea) => (
              <RecommendationCard key={idea.asset_id} idea={idea} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { RecommendationCard } from "@/components/recommendation-card";
import { getExplore } from "@/lib/api";


export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const payload = await getExplore({
    asset_class: params.asset_class,
    label: params.label,
    search: params.search,
    min_score: params.min_score,
    max_volatility: params.max_volatility,
    min_volume: params.min_volume,
    trend_state: params.trend_state,
    sort: params.sort,
    personalized: params.personalized ?? true,
  });

  return (
    <AppShell title="탐색" activePath="/app/explore">
      <section className="dashboard-card">
        <div className="section-toolbar">
          <div>
            <div className="eyebrow"><SlidersHorizontal size={13} /> UNIVERSE FILTERS</div>
            <h2 className="section-title">큐레이션된 감시 우주</h2>
            <p className="muted">점수, 변동성, 거래량, 추세 상태로 추천 후보를 좁힙니다.</p>
          </div>
          <Link className="ghost-button" href="/app/explore">필터 초기화</Link>
        </div>
        <form className="filter-grid" action="/app/explore">
          <div className="field">
            <label htmlFor="search"><Search size={13} /> 검색</label>
            <input id="search" name="search" defaultValue={params.search ?? ""} placeholder="AAPL, Bitcoin..." />
          </div>
          <div className="field">
            <label htmlFor="asset_class">자산군</label>
            <select id="asset_class" name="asset_class" defaultValue={params.asset_class ?? ""}>
              <option value="">전체</option>
              <option value="stock">주식</option>
              <option value="etf">ETF</option>
              <option value="crypto">코인</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="label">추천</label>
            <select id="label" name="label" defaultValue={params.label ?? ""}>
              <option value="">전체</option>
              <option value="매수">매수</option>
              <option value="관망">관망</option>
              <option value="회피">회피</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="trend_state">추세</label>
            <select id="trend_state" name="trend_state" defaultValue={params.trend_state ?? ""}>
              <option value="">전체</option>
              <option value="bullish">bullish</option>
              <option value="neutral">neutral</option>
              <option value="bearish">bearish</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="min_score">최소 점수</label>
            <input id="min_score" name="min_score" type="number" min="0" max="100" defaultValue={params.min_score ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="max_volatility">최대 변동성</label>
            <input id="max_volatility" name="max_volatility" type="number" min="0" step="0.001" defaultValue={params.max_volatility ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="sort">정렬</label>
            <select id="sort" name="sort" defaultValue={params.sort ?? "score_desc"}>
              <option value="score_desc">점수 높은순</option>
              <option value="score_asc">점수 낮은순</option>
              <option value="change_desc">상승률 높은순</option>
              <option value="confidence_desc">신뢰도 높은순</option>
              <option value="volume_desc">거래량 높은순</option>
              <option value="symbol_asc">심볼순</option>
            </select>
          </div>
          <input type="hidden" name="personalized" value="true" />
          <button className="primary-button" type="submit">필터 적용</button>
        </form>
      </section>

      <section className="dashboard-card">
        <div className="table-summary">
          <span>{payload.total}개 결과</span>
          <span>{payload.sort.sort}</span>
        </div>
        <div className="idea-grid">
          {payload.items.map((idea) => (
            <Link key={idea.asset_id} href={`/app/assets/${idea.asset_id}`}>
              <RecommendationCard idea={idea} />
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

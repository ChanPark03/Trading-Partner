import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { RecommendationCard } from "@/components/recommendation-card";
import { getExplore } from "@/lib/api";


export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ asset_class?: string }>;
}) {
  const params = await searchParams;
  const payload = await getExplore(params.asset_class);

  return (
    <AppShell title="탐색" activePath="/app/explore">
      <section className="dashboard-card">
        <div className="section-head">
          <div className="eyebrow">universe</div>
          <h2 className="section-title">큐레이션된 감시 우주</h2>
          <p className="muted">미국주식, 대표 ETF, 주요 코인을 자산군 기준으로 훑어볼 수 있습니다.</p>
        </div>
        <div className="badge-row">
          <Link className="ghost-button" href="/app/explore">전체</Link>
          <Link className="ghost-button" href="/app/explore?asset_class=stock">주식</Link>
          <Link className="ghost-button" href="/app/explore?asset_class=etf">ETF</Link>
          <Link className="ghost-button" href="/app/explore?asset_class=crypto">코인</Link>
        </div>
      </section>

      <section className="dashboard-card">
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


import { AppShell } from "@/components/app-shell";
import { TradingViewWidget } from "@/components/tradingview-widget";
import { getAssetDetail } from "@/lib/api";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/format";


export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const detail = await getAssetDetail(assetId);
  const asset = detail.asset;

  return (
    <AppShell title={`${asset.name} 분석`} activePath="/app">
      <div className="two-column">
        <TradingViewWidget symbol={asset.tradingview_symbol} interval={asset.asset_class === "crypto" ? "240" : "D"} />

        <aside className="detail-sidebar">
          <section className="detail-card">
            <div className="badge-row">
              <span className={`badge ${asset.recommendation_label === "매수" ? "buy" : asset.recommendation_label === "관망" ? "watch" : "avoid"}`}>
                {asset.recommendation_label}
              </span>
              <span className="badge">{asset.asset_class.toUpperCase()}</span>
            </div>
            <h2 className="section-title" style={{ marginTop: 12 }}>{asset.symbol}</h2>
            <p className="muted">{formatDateTime(asset.as_of)} 기준 · {formatPercent(asset.change_percent_24h)}</p>

            <div className="range-grid" style={{ marginTop: 16 }}>
              <div className="mini-panel">
                <div className="mini-label">현재가</div>
                <div className="mini-value">{formatCurrency(asset.current_price, asset.asset_class)}</div>
              </div>
              <div className="mini-panel">
                <div className="mini-label">신뢰도</div>
                <div className="mini-value">{asset.confidence}</div>
              </div>
              <div className="mini-panel">
                <div className="mini-label">목표 구간</div>
                <div className="mini-value">
                  {formatCurrency(asset.target_range.low, asset.asset_class)} - {formatCurrency(asset.target_range.high, asset.asset_class)}
                </div>
              </div>
              <div className="mini-panel warning">
                <div className="mini-label">손절 구간</div>
                <div className="mini-value">
                  {formatCurrency(asset.stop_range.low, asset.asset_class)} - {formatCurrency(asset.stop_range.high, asset.asset_class)}
                </div>
              </div>
            </div>
            <p className="muted" style={{ marginTop: 18 }}>{asset.explanation}</p>
            <p className="muted">{asset.invalidation_condition}</p>
          </section>

          <section className="detail-card">
            <div className="section-head">
              <div className="eyebrow">risk</div>
              <h2 className="section-title">리스크 경고</h2>
            </div>
            <ul className="list-reset">
              {asset.risk_flags.map((flag) => (
                <li key={flag.title} className="list-item">
                  <div className="badge-row">
                    <span className="badge">{flag.severity.toUpperCase()}</span>
                  </div>
                  <div style={{ fontWeight: 700 }}>{flag.title}</div>
                  <div className="muted">{flag.detail}</div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <div className="two-column">
        <section className="detail-card">
          <div className="section-head">
            <div className="eyebrow">signals</div>
            <h2 className="section-title">신호 분해</h2>
          </div>
          <ul className="list-reset">
            {asset.signals.map((signal) => (
              <li key={signal.id} className="list-item">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{signal.label}</div>
                    <div className="muted">{signal.description}</div>
                  </div>
                  <div className="badge">{signal.value}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-card">
          <div className="section-head">
            <div className="eyebrow">summary</div>
            <h2 className="section-title">기술·리스크 브리핑</h2>
          </div>
          <ul className="list-reset">
            {detail.technical_summary.map((item) => (
              <li key={item} className="list-item">{item}</li>
            ))}
          </ul>
          <h3 className="section-title" style={{ marginTop: 24 }}>리스크 체크</h3>
          <ul className="list-reset">
            {detail.risk_summary.map((item) => (
              <li key={item} className="list-item">{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}


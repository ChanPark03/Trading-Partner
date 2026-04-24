import { AppShell } from "@/components/app-shell";
import { TradingViewWidget } from "@/components/tradingview-widget";
import { getAssetDetail } from "@/lib/api";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/format";
import { Activity, ShieldAlert, Target, TriangleAlert } from "lucide-react";


export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const detail = await getAssetDetail(assetId);
  const asset = detail.asset;
  const snapshot = detail.market_snapshot;

  return (
    <AppShell title={`${asset.name} 분석`} activePath="/app">
      <div className="asset-workspace">
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

            <div className="stat-grid" style={{ marginTop: 16 }}>
              <div className="mini-panel">
                <div className="mini-label">현재가</div>
                <div className="mini-value">{formatCurrency(asset.current_price, asset.asset_class)}</div>
              </div>
              <div className="mini-panel">
                <div className="mini-label">신뢰도</div>
                <div className="mini-value">{asset.confidence}</div>
              </div>
              <div className="mini-panel">
                <div className="mini-label icon-label"><Target size={13} /> 목표 구간</div>
                <div className="mini-value">
                  {formatCurrency(asset.target_range.low, asset.asset_class)} - {formatCurrency(asset.target_range.high, asset.asset_class)}
                </div>
              </div>
              <div className="mini-panel warning">
                <div className="mini-label icon-label"><TriangleAlert size={13} /> 손절 구간</div>
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
              <div className="eyebrow"><ShieldAlert size={13} /> RISK</div>
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

      <div className="detail-grid">
        <section className="detail-card">
          <div className="section-head">
            <div className="eyebrow"><Activity size={13} /> MARKET SNAPSHOT</div>
            <h2 className="section-title">원시 시장 데이터</h2>
          </div>
          <div className="data-table">
            <div className="table-row">
              <div>고가</div>
              <div>{formatCurrency(snapshot.day_high, snapshot.asset_class)}</div>
              <div>저가</div>
              <div>{formatCurrency(snapshot.day_low, snapshot.asset_class)}</div>
            </div>
            <div className="table-row">
              <div>전일 종가</div>
              <div>{formatCurrency(snapshot.previous_close, snapshot.asset_class)}</div>
              <div>거래량</div>
              <div>{snapshot.volume.toLocaleString("ko-KR")}</div>
            </div>
            <div className="table-row">
              <div>변동성</div>
              <div>{(snapshot.volatility * 100).toFixed(2)}%</div>
              <div>TradingView</div>
              <div>{snapshot.tradingview_symbol}</div>
            </div>
          </div>
        </section>

        <section className="detail-card">
          <div className="section-head">
            <div className="eyebrow">SIGNALS</div>
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
            <div className="eyebrow">BRIEFING</div>
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

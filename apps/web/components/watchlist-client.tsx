"use client";

import { useState } from "react";
import type { PortfolioPosition, RecommendationSnapshot, WatchlistItem } from "@investment-research/contracts";
import { Plus, Trash2, WalletCards } from "lucide-react";

import { addWatchlist, removeWatchlist, updatePortfolio } from "@/lib/api";
import { formatCurrency } from "@/lib/format";


export function WatchlistClient({
  initialWatchlist,
  initialPortfolio,
  universe,
}: {
  initialWatchlist: WatchlistItem[];
  initialPortfolio: PortfolioPosition[];
  universe: RecommendationSnapshot[];
}) {
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [assetId, setAssetId] = useState(universe[0]?.asset_id ?? "crypto-btc");
  const [quantity, setQuantity] = useState("1");
  const [averageCost, setAverageCost] = useState("100");
  const [activeTab, setActiveTab] = useState<"watchlist" | "portfolio">("watchlist");

  async function onAddWatchlist() {
    await addWatchlist(assetId);
    setWatchlist([{ asset_id: assetId, added_at: new Date().toISOString() }, ...watchlist]);
  }

  async function onRemove(assetToRemove: string) {
    await removeWatchlist(assetToRemove);
    setWatchlist(watchlist.filter((item) => item.asset_id !== assetToRemove));
  }

  async function onPortfolioSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Number(quantity) <= 0 || Number(averageCost) <= 0) return;
    const nextPortfolio = [
      ...portfolio.filter((item) => item.asset_id !== assetId),
      {
        asset_id: assetId,
        quantity: Number(quantity),
        average_cost: Number(averageCost),
      } as PortfolioPosition,
    ];
    const response = await updatePortfolio(nextPortfolio);
    setPortfolio(response.positions);
  }

  return (
    <div className="workspace-stack">
      <div className="segmented-control">
        <button className={activeTab === "watchlist" ? "active" : ""} type="button" onClick={() => setActiveTab("watchlist")}>관심종목</button>
        <button className={activeTab === "portfolio" ? "active" : ""} type="button" onClick={() => setActiveTab("portfolio")}>보유 포지션</button>
      </div>

      {activeTab === "watchlist" && (
      <section className="dashboard-card">
        <div className="section-head">
          <div className="eyebrow">WATCHLIST</div>
          <h2 className="section-title">관심 자산 관리</h2>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="watchlist-asset">자산 ID</label>
            <select id="watchlist-asset" value={assetId} onChange={(event) => setAssetId(event.target.value)}>
              {universe.map((asset) => (
                <option key={asset.asset_id} value={asset.asset_id}>
                  {asset.symbol} · {asset.name}
                </option>
              ))}
            </select>
          </div>
          <button className="primary-button" type="button" onClick={onAddWatchlist}>
            <Plus size={16} /> 관심종목 추가
          </button>
        </div>
        <ul className="list-reset" style={{ marginTop: 20 }}>
          {watchlist.map((item) => (
            <li key={item.asset_id} className="asset-row">
              <div>
                <div className="row-title">{item.asset_id}</div>
                <div className="muted">{new Date(item.added_at).toLocaleString("ko-KR")}</div>
              </div>
              <button className="icon-button" type="button" onClick={() => onRemove(item.asset_id)} title="삭제">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>
      )}

      {activeTab === "portfolio" && (
      <section className="dashboard-card">
        <div className="section-head">
          <div className="eyebrow"><WalletCards size={13} /> PORTFOLIO</div>
          <h2 className="section-title">수동 포지션 입력</h2>
        </div>
        <form className="form-grid three-up" onSubmit={onPortfolioSubmit}>
          <div className="field">
            <label htmlFor="portfolio-asset">자산</label>
            <select id="portfolio-asset" value={assetId} onChange={(event) => setAssetId(event.target.value)}>
              {universe.map((asset) => (
                <option key={asset.asset_id} value={asset.asset_id}>
                  {asset.symbol} · {asset.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="portfolio-quantity">수량</label>
            <input id="portfolio-quantity" type="number" min="0" step="0.0001" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="portfolio-average">평균 단가</label>
            <input id="portfolio-average" type="number" min="0" step="0.01" value={averageCost} onChange={(event) => setAverageCost(event.target.value)} />
          </div>
          <button className="primary-button" type="submit">
            <Plus size={16} /> 저장
          </button>
        </form>

        <div className="data-table" style={{ marginTop: 18 }}>
          <div className="table-row table-head">
            <div>자산</div>
            <div>수량</div>
            <div>평단</div>
            <div>메모</div>
          </div>
          {portfolio.map((position) => (
            <div key={position.asset_id} className="table-row">
              <div className="row-title">{position.asset_id}</div>
              <div>{position.quantity}</div>
              <div>{formatCurrency(position.average_cost)}</div>
              <div>{position.note ?? "-"}</div>
            </div>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}

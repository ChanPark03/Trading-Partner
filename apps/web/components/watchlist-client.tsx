"use client";

import { useState } from "react";
import type { PortfolioPosition, WatchlistItem } from "@investment-research/contracts";

import { addWatchlist, removeWatchlist, updatePortfolio } from "@/lib/api";


export function WatchlistClient({
  initialWatchlist,
  initialPortfolio,
}: {
  initialWatchlist: WatchlistItem[];
  initialPortfolio: PortfolioPosition[];
}) {
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [assetId, setAssetId] = useState("crypto-btc");
  const [quantity, setQuantity] = useState("1");
  const [averageCost, setAverageCost] = useState("100");

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
    <div className="watch-grid">
      <section className="dashboard-card">
        <div className="section-head">
          <div className="eyebrow">watchlist</div>
          <h2 className="section-title">관심 자산 관리</h2>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="watchlist-asset">자산 ID</label>
            <input id="watchlist-asset" value={assetId} onChange={(event) => setAssetId(event.target.value)} />
          </div>
          <button className="primary-button" type="button" onClick={onAddWatchlist}>
            관심종목 추가
          </button>
        </div>
        <ul className="list-reset" style={{ marginTop: 20 }}>
          {watchlist.map((item) => (
            <li key={item.asset_id} className="list-item">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.asset_id}</div>
                  <div className="muted">{new Date(item.added_at).toLocaleString("ko-KR")}</div>
                </div>
                <button className="ghost-button" type="button" onClick={() => onRemove(item.asset_id)}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-card">
        <div className="section-head">
          <div className="eyebrow">portfolio</div>
          <h2 className="section-title">수동 포지션 입력</h2>
        </div>
        <form className="form-grid" onSubmit={onPortfolioSubmit}>
          <div className="field">
            <label htmlFor="portfolio-asset">자산 ID</label>
            <input id="portfolio-asset" value={assetId} onChange={(event) => setAssetId(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="portfolio-quantity">수량</label>
            <input id="portfolio-quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="portfolio-average">평균 단가</label>
            <input id="portfolio-average" value={averageCost} onChange={(event) => setAverageCost(event.target.value)} />
          </div>
          <button className="primary-button" type="submit">
            포트폴리오 저장
          </button>
        </form>

        <div className="table-grid" style={{ marginTop: 18 }}>
          {portfolio.map((position) => (
            <div key={position.asset_id} className="table-row">
              <div style={{ fontWeight: 700 }}>{position.asset_id}</div>
              <div>{position.quantity}</div>
              <div>{position.average_cost}</div>
              <div>{position.note ?? "-"}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


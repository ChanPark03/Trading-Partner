import React from "react";
import type { RecommendationSnapshot } from "@investment-research/contracts";
import { ArrowUpRight, Target, TriangleAlert } from "lucide-react";

import { formatCurrency, formatPercent, formatDateTime } from "@/lib/format";


function badgeClass(label: RecommendationSnapshot["recommendation_label"]) {
  if (label === "매수") return "badge buy";
  if (label === "관망") return "badge watch";
  return "badge avoid";
}


export function RecommendationCard({ idea }: { idea: RecommendationSnapshot }) {
  return (
    <article className="recommendation-card">
      <div className="recommendation-head">
        <div className="badge-row">
          <span className={badgeClass(idea.recommendation_label)}>{idea.recommendation_label}</span>
          <span className="badge">{idea.asset_class.toUpperCase()}</span>
          <span className="badge neutral">Score {idea.score.toFixed(1)}</span>
        </div>
        <div className="card-title-row">
          <div>
            <div className="recommendation-title">{idea.name}</div>
            <div className="recommendation-subtitle">
              {idea.symbol} · {formatDateTime(idea.as_of)}
            </div>
          </div>
          <ArrowUpRight size={18} />
        </div>
      </div>

      <div className="stat-grid">
        <div className="mini-panel">
          <div className="mini-label">현재가</div>
          <div className="mini-value">{formatCurrency(idea.current_price, idea.asset_class)}</div>
          <div className="muted">{formatPercent(idea.change_percent_24h)}</div>
        </div>
        <div className="mini-panel">
          <div className="mini-label">신뢰도</div>
          <div className="mini-value">{idea.confidence}/100</div>
          <div className="muted">{idea.holding_window}</div>
        </div>
      </div>

      <div className="range-grid">
        <div className="mini-panel">
          <div className="mini-label icon-label"><Target size={13} /> 목표</div>
          <div className="mini-value">
            {formatCurrency(idea.target_range.low, idea.asset_class)} - {formatCurrency(idea.target_range.high, idea.asset_class)}
          </div>
        </div>
        <div className="mini-panel warning">
          <div className="mini-label icon-label"><TriangleAlert size={13} /> 손절</div>
          <div className="mini-value">
            {formatCurrency(idea.stop_range.low, idea.asset_class)} - {formatCurrency(idea.stop_range.high, idea.asset_class)}
          </div>
        </div>
      </div>

      <div className="brief-line">{idea.explanation}</div>
    </article>
  );
}

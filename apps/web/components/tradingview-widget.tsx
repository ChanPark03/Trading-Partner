"use client";

import { useEffect, useRef } from "react";


export function TradingViewWidget({
  symbol,
  interval = "D",
}: {
  symbol: string;
  interval?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "kr",
      hide_top_toolbar: false,
      allow_symbol_change: true,
      withdateranges: true,
      details: false,
      hotlist: false,
      calendar: false,
      studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
      backgroundColor: "#FFFFFF",
      gridColor: "rgba(24, 35, 45, 0.08)",
    });
    container.appendChild(script);
  }, [symbol, interval]);

  return (
    <section className="detail-card tradingview-shell">
      <div className="section-head">
        <div className="eyebrow">TradingView</div>
        <h2 className="section-title">차트 분석 · {symbol}</h2>
      </div>
      <div className="tv-frame">
        <div ref={containerRef} style={{ height: "100%" }} />
        <noscript>
          <div className="tv-fallback">TradingView 위젯을 보려면 JavaScript가 필요합니다.</div>
        </noscript>
      </div>
    </section>
  );
}

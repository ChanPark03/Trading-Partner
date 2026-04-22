"use client";

import { useEffect, useRef } from "react";


export function TradingViewMarketOverview() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "light",
      dateRange: "12M",
      showChart: true,
      locale: "kr",
      width: "100%",
      height: 420,
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: false,
      tabs: [
        {
          title: "US",
          symbols: [
            { s: "NASDAQ:AAPL", d: "Apple" },
            { s: "NASDAQ:NVDA", d: "NVIDIA" },
            { s: "AMEX:SPY", d: "SPY" },
            { s: "AMEX:GLD", d: "Gold" }
          ]
        },
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
            { s: "BINANCE:ETHUSDT", d: "Ethereum" },
            { s: "BINANCE:SOLUSDT", d: "Solana" }
          ]
        }
      ]
    });
    container.appendChild(script);
  }, []);

  return (
    <section className="dashboard-card">
      <div className="section-head">
        <div className="eyebrow">TradingView</div>
        <h2 className="section-title">시장 개요</h2>
      </div>
      <div className="tv-frame" style={{ minHeight: 420 }}>
        <div ref={containerRef} style={{ height: "100%" }} />
      </div>
    </section>
  );
}


import React from "react";
import Link from "next/link";
import { clsx } from "clsx";


const navItems = [
  { href: "/app", label: "대시보드" },
  { href: "/app/explore", label: "탐색" },
  { href: "/app/watchlist", label: "관심/포트폴리오" },
  { href: "/app/alerts", label: "알림" },
  { href: "/app/settings", label: "설정" },
];


export function AppShell({
  children,
  title,
  activePath = "/app",
}: {
  children: React.ReactNode;
  title: string;
  activePath?: string;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar hero-card">
        <div className="brand-block">
          <div className="eyebrow">research assistant</div>
          <div className="brand-title">Trading Partner</div>
          <div className="brand-subtitle">Korean-first analyst desk for US stocks, ETFs, and crypto.</div>
        </div>

        <nav className="nav-list" aria-label="Primary Navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx("nav-link", activePath === item.href && "active")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="panel-card" style={{ marginTop: 20 }}>
          <div className="mini-label">오늘의 운영 원칙</div>
          <div className="muted" style={{ marginTop: 10 }}>
            TradingView는 시각화, 자체 엔진은 추천 판단을 담당합니다. 추천은 근거와 리스크 경고를 함께 보여줍니다.
          </div>
        </div>
      </aside>

      <main className="content-shell">
        <header className="topbar hero-card">
          <div>
            <div className="eyebrow">premium analyst desk</div>
            <h1 className="topbar-title">{title}</h1>
          </div>
          <div className="badge buy">Demo Session</div>
        </header>
        <div className="content-body">{children}</div>
      </main>
    </div>
  );
}

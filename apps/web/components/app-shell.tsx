import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Bell, ChartCandlestick, Compass, LayoutDashboard, Settings, ShieldCheck, WalletCards } from "lucide-react";


const navItems = [
  { href: "/app", label: "대시보드", icon: LayoutDashboard },
  { href: "/app/explore", label: "탐색", icon: Compass },
  { href: "/app/watchlist", label: "관심/포트폴리오", icon: WalletCards },
  { href: "/app/alerts", label: "알림", icon: Bell },
  { href: "/app/settings", label: "설정", icon: Settings },
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
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark"><ChartCandlestick size={18} /> TP</div>
          <div>
            <div className="brand-title">Trading Partner</div>
            <div className="brand-subtitle">리서치 전용 분석 데스크</div>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx("nav-link", activePath === item.href && "active")}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-note">
          <ShieldCheck size={16} />
          <span>리서치 보조 도구입니다. 주문 실행과 자동매매는 포함하지 않습니다.</span>
        </div>
      </aside>

      <main className="content-shell">
        <header className="topbar">
          <div>
            <div className="eyebrow">ANALYST WORKSPACE</div>
            <h1 className="topbar-title">{title}</h1>
          </div>
          <div className="topbar-actions">
            <span className="status-dot" />
            <span>Demo Session</span>
          </div>
        </header>
        <div className="content-body">{children}</div>
      </main>
    </div>
  );
}

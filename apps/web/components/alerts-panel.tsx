import type { AlertEvent } from "@investment-research/contracts";

import { formatDateTime } from "@/lib/format";


export function AlertsPanel({ alerts }: { alerts: AlertEvent[] }) {
  return (
    <section className="dashboard-card">
      <div className="section-head">
        <div className="eyebrow">inbox</div>
        <h2 className="section-title">최근 알림</h2>
      </div>

      <ul className="list-reset">
        {alerts.map((alert) => (
          <li key={alert.id} className="list-item">
            <div className="badge-row" style={{ marginBottom: 8 }}>
              <span className="badge">{alert.level.toUpperCase()}</span>
              {!alert.is_read && <span className="badge watch">NEW</span>}
            </div>
            <div style={{ fontWeight: 700 }}>{alert.title}</div>
            <div className="muted">{alert.detail}</div>
            <div className="muted" style={{ marginTop: 6 }}>{formatDateTime(alert.created_at)}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}


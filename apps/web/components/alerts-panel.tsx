"use client";

import type { AlertEvent } from "@investment-research/contracts";
import { CheckCheck, CircleAlert, MailOpen } from "lucide-react";
import React, { useState } from "react";

import { markAlertRead } from "@/lib/api";
import { formatDateTime } from "@/lib/format";


export function AlertsPanel({ alerts }: { alerts: AlertEvent[] }) {
  const [items, setItems] = useState(alerts);

  async function onMarkRead(alertId: string) {
    await markAlertRead(alertId);
    setItems((current) => current.map((item) => item.id === alertId ? { ...item, is_read: true } : item));
  }

  return (
    <section className="dashboard-card">
      <div className="section-head">
        <div className="eyebrow"><MailOpen size={13} /> INBOX</div>
        <h2 className="section-title">최근 알림</h2>
      </div>

      <ul className="list-reset">
        {items.map((alert) => (
          <li key={alert.id} className="alert-row">
            <div className="alert-icon">
              <CircleAlert size={17} />
            </div>
            <div>
              <div className="badge-row">
                <span className={`badge ${alert.level === "critical" ? "avoid" : alert.level === "warning" ? "watch" : "neutral"}`}>{alert.level.toUpperCase()}</span>
                {!alert.is_read && <span className="badge buy">NEW</span>}
              </div>
              <div className="row-title">{alert.title}</div>
              <div className="muted">{alert.detail}</div>
              <div className="muted compact-time">{formatDateTime(alert.created_at)}</div>
            </div>
            <button className="icon-button" type="button" onClick={() => onMarkRead(alert.id)} disabled={alert.is_read} title="읽음 처리">
              <CheckCheck size={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

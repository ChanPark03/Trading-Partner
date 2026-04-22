"use client";

import { useState } from "react";
import type { UserProfile } from "@investment-research/contracts";

import { updateProfile } from "@/lib/api";
import { parsePreferredAssetClasses } from "@/lib/profile";


export function SettingsForm({ profile }: { profile: UserProfile }) {
  const [riskTolerance, setRiskTolerance] = useState(profile.risk_tolerance);
  const [timeHorizon, setTimeHorizon] = useState(profile.time_horizon);
  const [assetClasses, setAssetClasses] = useState(profile.preferred_asset_classes.join(", "));
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateProfile({
      email: profile.email,
      risk_tolerance: riskTolerance,
      time_horizon: timeHorizon,
      preferred_asset_classes: parsePreferredAssetClasses(assetClasses),
      locale: profile.locale,
    });
    setMessage("설정이 저장되었습니다. 추천 정렬 우선순위에 반영됩니다.");
  }

  return (
    <form className="dashboard-card form-grid" onSubmit={handleSubmit}>
      <div className="section-head">
        <div className="eyebrow">preferences</div>
        <h2 className="section-title">개인화 설정</h2>
      </div>
      <div className="field">
        <label htmlFor="risk">위험 성향</label>
        <select id="risk" value={riskTolerance} onChange={(event) => setRiskTolerance(event.target.value as UserProfile["risk_tolerance"])}>
          <option value="conservative">보수형</option>
          <option value="balanced">균형형</option>
          <option value="aggressive">공격형</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="horizon">투자 시간축</label>
        <select id="horizon" value={timeHorizon} onChange={(event) => setTimeHorizon(event.target.value as UserProfile["time_horizon"])}>
          <option value="swing">스윙</option>
          <option value="position">포지션</option>
          <option value="hybrid">혼합형</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="asset-classes">선호 자산군</label>
        <input id="asset-classes" value={assetClasses} onChange={(event) => setAssetClasses(event.target.value)} />
      </div>
      <button className="primary-button" type="submit">설정 저장</button>
      {message && <div className="muted">{message}</div>}
    </form>
  );
}

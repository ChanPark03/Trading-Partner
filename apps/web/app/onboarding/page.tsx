"use client";

import type { UserProfile } from "@investment-research/contracts";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateProfile } from "@/lib/api";
import { parsePreferredAssetClasses } from "@/lib/profile";


export default function OnboardingPage() {
  const router = useRouter();
  const [risk, setRisk] = useState<UserProfile["risk_tolerance"]>("balanced");
  const [horizon, setHorizon] = useState<UserProfile["time_horizon"]>("hybrid");
  const [assets, setAssets] = useState("stock, crypto");
  const [isSaving, setIsSaving] = useState(false);

  async function completeOnboarding() {
    setIsSaving(true);

    let email = "demo@example.com";
    if (typeof window !== "undefined") {
      email = window.localStorage.getItem("trading-partner-email") ?? email;
      window.localStorage.setItem(
        "trading-partner-profile",
        JSON.stringify({
          email,
          risk,
          horizon,
          assets,
        }),
      );
    }

    await updateProfile({
      email,
      risk_tolerance: risk,
      time_horizon: horizon,
      preferred_asset_classes: parsePreferredAssetClasses(assets),
      locale: "ko-KR",
    });

    router.push("/app");
  }

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <div className="eyebrow">onboarding</div>
        <h1 className="section-title" style={{ marginTop: 18 }}>추천 우선순위를 맞춰볼게요.</h1>
        <div className="form-grid" style={{ marginTop: 22 }}>
          <div className="field">
            <label htmlFor="risk">위험 성향</label>
            <select id="risk" value={risk} onChange={(event) => setRisk(event.target.value as UserProfile["risk_tolerance"])}>
              <option value="conservative">보수형</option>
              <option value="balanced">균형형</option>
              <option value="aggressive">공격형</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="horizon">투자 기간</label>
            <select id="horizon" value={horizon} onChange={(event) => setHorizon(event.target.value as UserProfile["time_horizon"])}>
              <option value="swing">스윙</option>
              <option value="position">포지션</option>
              <option value="hybrid">혼합형</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="assets">선호 자산군</label>
            <input id="assets" value={assets} onChange={(event) => setAssets(event.target.value)} />
          </div>
          <button className="primary-button" type="button" onClick={completeOnboarding} disabled={isSaving}>
            {isSaving ? "저장 중..." : "대시보드로 이동"}
          </button>
        </div>
      </section>
    </main>
  );
}

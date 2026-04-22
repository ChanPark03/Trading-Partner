import { AppShell } from "@/components/app-shell";
import { SettingsForm } from "@/components/settings-form";
import { getProfile } from "@/lib/api";


export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <AppShell title="설정" activePath="/app/settings">
      <section className="settings-grid">
        <SettingsForm profile={profile} />
        <div className="dashboard-card">
          <div className="section-head">
            <div className="eyebrow">integration notes</div>
            <h2 className="section-title">운영 연결 상태</h2>
          </div>
          <ul className="list-reset">
            <li className="list-item">Auth: Supabase 연결 전에는 데모 세션으로 동작합니다.</li>
            <li className="list-item">Data: API가 없을 경우 seed/mock payload로 폴백합니다.</li>
            <li className="list-item">Charts: TradingView 위젯을 중심으로 사용하고, 추천 근거는 별도 패널에 노출합니다.</li>
          </ul>
        </div>
      </section>
    </AppShell>
  );
}

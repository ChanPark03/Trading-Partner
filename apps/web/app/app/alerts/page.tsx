import { AlertsPanel } from "@/components/alerts-panel";
import { AppShell } from "@/components/app-shell";
import { getAlerts } from "@/lib/api";


export default async function AlertsPage() {
  const alerts = await getAlerts();

  return (
    <AppShell title="알림" activePath="/app/alerts">
      <AlertsPanel alerts={alerts.items} />
    </AppShell>
  );
}


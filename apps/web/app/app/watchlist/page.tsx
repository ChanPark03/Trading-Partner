import { AppShell } from "@/components/app-shell";
import { WatchlistClient } from "@/components/watchlist-client";
import { getExplore, getPortfolio, getWatchlist } from "@/lib/api";


export default async function WatchlistPage() {
  const watchlist = await getWatchlist();
  const portfolio = await getPortfolio();
  const universe = await getExplore({ page_size: 50, personalized: false });

  return (
    <AppShell title="관심/포트폴리오" activePath="/app/watchlist">
      <WatchlistClient initialWatchlist={watchlist.items} initialPortfolio={portfolio.positions} universe={universe.items} />
    </AppShell>
  );
}

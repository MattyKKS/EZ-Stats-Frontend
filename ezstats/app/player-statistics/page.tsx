import Header from "@/components/Header";

export default function PlayerStatisticsPage() {
  return (
    <div className="min-h-screen bg-bg-secondary p-5">
      <Header title="Player Statistics" description="Per-player performance across matches" />

      <div className="bg-white rounded-xl border border-border flex flex-col items-center justify-center py-16">
        <p className="text-sm font-medium text-text-secondary">No player statistics yet</p>
        <p className="text-xs text-text-muted mt-1">Upload match footage to start tracking player stats</p>
      </div>
    </div>
  );
}

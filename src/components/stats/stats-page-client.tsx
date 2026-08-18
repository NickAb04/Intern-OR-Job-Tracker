"use client";

import { StatsDashboard } from "@/components/stats/stats-dashboard";

export function StatsPageClient() {
  return (
    <div className="flex flex-1 flex-col px-4 py-6 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
        <p className="text-sm text-muted-foreground">
          Analytics and insights about your application journey.
        </p>
      </div>
      <StatsDashboard />
    </div>
  );
}

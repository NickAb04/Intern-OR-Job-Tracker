import type { Metadata } from "next";
import { StatsPageClient } from "@/components/stats/stats-page-client";

export const metadata: Metadata = {
  title: "Stats | JobTracker",
  description:
    "View analytics and insights about your job and internship applications.",
};

export default function StatsPage() {
  return <StatsPageClient />;
}

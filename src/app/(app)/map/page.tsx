import type { Metadata } from "next";
import { MapPageClient } from "@/components/map/map-page-client";

export const metadata: Metadata = {
  title: "Map | JobTracker",
  description: "View your job and internship applications on the map.",
};

export default function MapPage() {
  return <MapPageClient />;
}

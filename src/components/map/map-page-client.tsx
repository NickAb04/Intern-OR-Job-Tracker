"use client";

import { useRef, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { type Map as MapLibreMap } from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/map/map-view";
import { FloatingList } from "@/components/map/floating-list";
import { ApplicationSidebar } from "@/components/sidebar/application-sidebar";
import { CreateApplicationDialog } from "@/components/applications/create-application-dialog";
import { useApplications } from "@/lib/queries/use-applications";
import { useUIStore } from "@/lib/stores/ui-store";
import type { Application } from "@/lib/types";

export function MapPageClient() {
  const { data: applications = [] } = useApplications(false);
  const { isAddingPin, setIsAddingPin } = useUIStore();
  const mapInstanceRef = useRef<MapLibreMap | null>(null);

  const handleMapReady = useCallback((map: MapLibreMap) => {
    mapInstanceRef.current = map;
  }, []);

  const handleFlyTo = useCallback((app: Application) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [app.longitude, app.latitude],
      zoom: Math.max(map.getZoom(), 13),
      duration: 800,
    });
  }, []);

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* Map */}
      <MapView applications={applications} onMapReady={handleMapReady} />

      {/* Map controls overlay */}
      <div className="absolute left-4 top-4 z-30 flex flex-col gap-2">
        {isAddingPin ? (
          <Button
            id="cancel-add-pin"
            variant="destructive"
            size="sm"
            className="shadow-lg"
            onClick={() => setIsAddingPin(false)}
          >
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
        ) : (
          <Button
            id="add-pin-mode"
            size="sm"
            className="shadow-lg"
            onClick={() => setIsAddingPin(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Drop Pin
          </Button>
        )}

        {isAddingPin && (
          <p className="rounded-md bg-background/90 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm">
            Click anywhere on the map to place a pin
          </p>
        )}
      </div>

      {/* Floating application list */}
      <FloatingList applications={applications} onFlyTo={handleFlyTo} />

      {/* Application sidebar */}
      <ApplicationSidebar />

      {/* Create dialog (triggered from map click, no visible trigger button) */}
      <CreateApplicationDialog showTrigger={false} />
    </div>
  );
}

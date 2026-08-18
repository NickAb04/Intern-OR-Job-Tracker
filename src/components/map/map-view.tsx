"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Map,
  NavigationControl,
  Popup,
  LngLatBounds,
  type GeoJSONSource,
  type ExpressionSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { useUIStore } from "@/lib/stores/ui-store";
import { MAP_DEFAULTS, STATUS_CONFIG } from "@/lib/constants";
import type { Application, ApplicationStatus } from "@/lib/types";

interface MapViewProps {
  applications: Application[];
  onMapReady?: (map: Map) => void;
}

// Build a match expression for pin colors based on status
function buildColorExpression(): ExpressionSpecification {
  const entries: unknown[] = ["match", ["get", "status"]];
  for (const [status, config] of Object.entries(STATUS_CONFIG)) {
    entries.push(status);
    entries.push(config.pinColor);
  }
  entries.push("#64748b"); // fallback
  return entries as ExpressionSpecification;
}

export function MapView({ applications, onMapReady }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const { resolvedTheme } = useTheme();

  const {
    isAddingPin,
    setIsAddingPin,
    setPendingPin,
    setCreateDialogOpen,
    openSidebar,
  } = useUIStore();

  const isAddingPinRef = useRef(isAddingPin);
  useEffect(() => {
    isAddingPinRef.current = isAddingPin;
  }, [isAddingPin]);

  // Convert applications to GeoJSON
  const toGeoJSON = useCallback(
    (apps: Application[]): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: apps
        .filter((a) => !a.archived)
        .map((app) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [app.longitude, app.latitude],
          },
          properties: {
            id: app.id,
            company_name: app.company_name,
            job_role: app.job_role,
            status: app.current_status,
            pinColor:
              STATUS_CONFIG[app.current_status as ApplicationStatus]
                ?.pinColor ?? "#64748b",
          },
        })),
    }),
    []
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const style =
      resolvedTheme === "dark"
        ? MAP_DEFAULTS.styles.dark
        : MAP_DEFAULTS.styles.light;

    const map = new Map({
      container: mapContainerRef.current,
      style,
      center: [MAP_DEFAULTS.center.lng, MAP_DEFAULTS.center.lat],
      zoom: MAP_DEFAULTS.zoom,
    });

    map.addControl(new NavigationControl(), "bottom-right");

    map.on("load", () => {
      // Add source with clustering
      map.addSource("applications", {
        type: "geojson",
        data: toGeoJSON(applications),
        cluster: true,
        clusterRadius: MAP_DEFAULTS.cluster.radius,
        clusterMaxZoom: MAP_DEFAULTS.cluster.maxZoom,
      });

      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "applications",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            MAP_DEFAULTS.cluster.colors[0].color,
            MAP_DEFAULTS.cluster.colors[1].count,
            MAP_DEFAULTS.cluster.colors[1].color,
            MAP_DEFAULTS.cluster.colors[2].count,
            MAP_DEFAULTS.cluster.colors[2].color,
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            MAP_DEFAULTS.cluster.colors[0].radius,
            MAP_DEFAULTS.cluster.colors[1].count,
            MAP_DEFAULTS.cluster.colors[1].radius,
            MAP_DEFAULTS.cluster.colors[2].count,
            MAP_DEFAULTS.cluster.colors[2].radius,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.85,
        },
      });

      // Cluster count label
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "applications",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 13,
          "text-font": ["Noto Sans Regular"],
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      // Individual pins
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "applications",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": buildColorExpression(),
          "circle-radius": 8,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Click on cluster → zoom in
      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("applications");
        if (source && "getClusterExpansionZoom" in source) {
          const zoom = await (
            source as GeoJSONSource
          ).getClusterExpansionZoom(clusterId);
          map.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [
              number,
              number,
            ],
            zoom,
          });
        }
      });

      // Click on pin → open sidebar
      map.on("click", "unclustered-point", (e) => {
        if (isAddingPinRef.current) return; // Don't open sidebar in add mode
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point"],
        });
        if (!features.length) return;
        const appId = features[0].properties?.id;
        if (appId) openSidebar(appId);
      });

      // Hover effects
      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = isAddingPinRef.current
          ? "crosshair"
          : "";
      });
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = isAddingPinRef.current
          ? "crosshair"
          : "";
      });

      // Hover popup on individual pins
      map.on("mouseenter", "unclustered-point", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point"],
        });
        if (!features.length) return;
        const props = features[0].properties;
        const coords = (features[0].geometry as GeoJSON.Point).coordinates;

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          className: "pin-popup",
        })
          .setLngLat(coords as [number, number])
          .setHTML(
            `<div style="font-family:var(--font-sans);font-size:13px;line-height:1.4;">
              <strong>${props?.company_name}</strong><br/>
              <span style="color:#6b7280">${props?.job_role}</span>
            </div>`
          )
          .addTo(map);
      });

      map.on("mouseleave", "unclustered-point", () => {
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      });

      // Click on empty map → add pin (if in add mode)
      map.on("click", (e) => {
        if (!isAddingPinRef.current) return;
        // Check if click was on a feature
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point", "clusters"],
        });
        if (features.length > 0) return;

        setPendingPin({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
        setCreateDialogOpen(true);
        setIsAddingPin(false);
      });
    });

    // Notify parent the map is ready
    map.once("load", () => onMapReady?.(map));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    const newStyle =
      resolvedTheme === "dark"
        ? MAP_DEFAULTS.styles.dark
        : MAP_DEFAULTS.styles.light;

    // Save current view state
    const center = map.getCenter();
    const zoom = map.getZoom();

    map.setStyle(newStyle);

    map.once("style.load", () => {
      map.setCenter(center);
      map.setZoom(zoom);

      // Re-add source and layers after style change
      if (!map.getSource("applications")) {
        map.addSource("applications", {
          type: "geojson",
          data: toGeoJSON(applications),
          cluster: true,
          clusterRadius: MAP_DEFAULTS.cluster.radius,
          clusterMaxZoom: MAP_DEFAULTS.cluster.maxZoom,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "applications",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              MAP_DEFAULTS.cluster.colors[0].color,
              MAP_DEFAULTS.cluster.colors[1].count,
              MAP_DEFAULTS.cluster.colors[1].color,
              MAP_DEFAULTS.cluster.colors[2].count,
              MAP_DEFAULTS.cluster.colors[2].color,
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              MAP_DEFAULTS.cluster.colors[0].radius,
              MAP_DEFAULTS.cluster.colors[1].count,
              MAP_DEFAULTS.cluster.colors[1].radius,
              MAP_DEFAULTS.cluster.colors[2].count,
              MAP_DEFAULTS.cluster.colors[2].radius,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.85,
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "applications",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 13,
            "text-font": ["Noto Sans Regular"],
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "applications",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": buildColorExpression(),
            "circle-radius": 8,
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#ffffff",
          },
        });
      }
    });
  }, [resolvedTheme, applications, toGeoJSON]);

  // Update GeoJSON data when applications change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    const source = map.getSource("applications") as GeoJSONSource;
    if (source) {
      source.setData(toGeoJSON(applications));
    }

    // Fit bounds to pins if there are any
    const nonArchived = applications.filter((a) => !a.archived);
    if (nonArchived.length > 0) {
      const bounds = new LngLatBounds();
      nonArchived.forEach((app) => {
        bounds.extend([app.longitude, app.latitude]);
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 500 });
      }
    }
  }, [applications, toGeoJSON]);

  // Update cursor when add-pin mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = isAddingPin ? "crosshair" : "";
  }, [isAddingPin]);

  return (
    <div
      ref={mapContainerRef}
      id="map-container"
      className="h-full w-full"
    />
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  X,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/applications/status-badge";
import { useUIStore } from "@/lib/stores/ui-store";
import { APPLICATION_TYPE_LABELS } from "@/lib/constants";
import type { Application } from "@/lib/types";

interface FloatingListProps {
  applications: Application[];
  onFlyTo?: (app: Application) => void;
}

function daysElapsed(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

export function FloatingList({ applications, onFlyTo }: FloatingListProps) {
  const {
    floatingListCollapsed,
    toggleFloatingList,
    openSidebar,
  } = useUIStore();

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return applications;
    const q = search.toLowerCase();
    return applications.filter(
      (app) =>
        app.company_name.toLowerCase().includes(q) ||
        app.job_role.toLowerCase().includes(q) ||
        (app.location_label && app.location_label.toLowerCase().includes(q))
    );
  }, [applications, search]);

  const handleCardClick = (app: Application) => {
    openSidebar(app.id);
    onFlyTo?.(app);
  };

  return (
    <div className="absolute bottom-4 left-4 z-30 flex w-80 max-w-[calc(100vw-2rem)] flex-col sm:w-96">
      {/* Header */}
      <button
        id="floating-list-toggle"
        onClick={toggleFloatingList}
        className="flex items-center justify-between rounded-t-lg border border-b-0 bg-background/95 px-4 py-2.5 text-left shadow-lg backdrop-blur-md transition-colors hover:bg-accent/50"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            Applications
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {applications.length}
          </span>
        </span>
        {floatingListCollapsed ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Body */}
      <AnimatePresence>
        {!floatingListCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden rounded-b-lg border bg-background/95 shadow-lg backdrop-blur-md"
          >
            {/* Search */}
            <div className="border-b px-3 py-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="floating-list-search"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-7 pr-7 text-xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                  {search
                    ? "No applications match your search."
                    : "No applications yet. Drop a pin on the map!"}
                </div>
              ) : (
                <ul className="divide-y">
                  {filtered.map((app) => (
                    <li key={app.id}>
                      <button
                        className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
                        onClick={() => handleCardClick(app)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {app.company_name}
                            </span>
                            {app.job_posting_url && (
                              <a
                                href={app.job_posting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {app.job_role}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {APPLICATION_TYPE_LABELS[app.application_type]}
                            </span>
                            {app.location_label && (
                              <>
                                <span className="text-[10px] text-muted-foreground">
                                  •
                                </span>
                                <span className="truncate text-[10px] text-muted-foreground">
                                  {app.location_label}
                                </span>
                              </>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              •
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {daysElapsed(app.updated_at)}d
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 pt-0.5">
                          <StatusBadge
                            status={app.current_status}
                            showDot={false}
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

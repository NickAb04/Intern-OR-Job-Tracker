"use client";

import { X, ExternalLink, Archive, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/applications/status-badge";
import { useUIStore } from "@/lib/stores/ui-store";
import {
  useApplication,
  useStatusHistory,
  useUpdateStatus,
  useArchiveApplication,
} from "@/lib/queries/use-applications";
import {
  STATUS_OPTIONS,
  STATUS_CONFIG,
  APPLICATION_TYPE_LABELS,
  APPLIED_VIA_LABELS,
} from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";

function daysElapsed(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

export function ApplicationSidebar() {
  const { sidebarOpen, selectedApplicationId, closeSidebar } = useUIStore();
  const { data: application } = useApplication(selectedApplicationId ?? "");
  const { data: history = [] } = useStatusHistory(
    selectedApplicationId ?? ""
  );
  const updateStatusMutation = useUpdateStatus();
  const archiveMutation = useArchiveApplication();

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!application || newStatus === application.current_status) return;
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: application.id,
        newStatus,
      });
      toast.success("Status updated", {
        description: `${application.company_name} → ${STATUS_CONFIG[newStatus].label}`,
      });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleArchive = async () => {
    if (!application) return;
    try {
      await archiveMutation.mutateAsync(application.id);
      toast.success("Application archived");
      closeSidebar();
    } catch {
      toast.error("Failed to archive");
    }
  };

  // Compute days elapsed from most recent status history row
  const latestHistoryDate =
    history.length > 0 ? history[0].changed_at : application?.updated_at;

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
          className="absolute right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l bg-background shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Application Details</h2>
            <button
              id="close-sidebar"
              onClick={closeSidebar}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {application ? (
            <div className="flex flex-1 flex-col overflow-y-auto">
              {/* Company + Role */}
              <div className="px-4 pt-4 pb-3">
                <h3 className="text-lg font-semibold leading-tight">
                  {application.company_name}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {application.job_role}
                </p>
                {application.location_label && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    📍 {application.location_label}
                  </p>
                )}
              </div>

              <Separator />

              {/* Status changer */}
              <div className="px-4 py-3">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <Select
                  value={application.current_status}
                  onValueChange={(v) =>
                    handleStatusChange(v as ApplicationStatus)
                  }
                >
                  <SelectTrigger id="sidebar-status-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${STATUS_CONFIG[s].dotColor}`}
                          />
                          {STATUS_CONFIG[s].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Type
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {APPLICATION_TYPE_LABELS[application.application_type]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Applied via
                  </p>
                  <p className="mt-1 text-sm">
                    {APPLIED_VIA_LABELS[application.applied_via]}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Date applied
                  </p>
                  <p className="mt-1 text-sm">
                    {new Date(application.date_applied).toLocaleDateString(
                      "en-MY",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Days elapsed
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    {latestHistoryDate ? daysElapsed(latestHistoryDate) : "—"}d
                  </p>
                </div>
              </div>

              {/* Job URL */}
              {application.job_posting_url && (
                <>
                  <Separator />
                  <div className="px-4 py-3">
                    <a
                      href={application.job_posting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View job posting
                    </a>
                  </div>
                </>
              )}

              {/* Notes */}
              {application.notes && (
                <>
                  <Separator />
                  <div className="px-4 py-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Notes
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {application.notes}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Status History */}
              <div className="px-4 py-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Status History
                </p>
                <div className="flex flex-col gap-2">
                  {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No history yet.
                    </p>
                  ) : (
                    history.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <StatusBadge status={row.status} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(row.changed_at).toLocaleDateString(
                            "en-MY",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto border-t px-4 py-3">
                <Button
                  id="sidebar-archive"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleArchive}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

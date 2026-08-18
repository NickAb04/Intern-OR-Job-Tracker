"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateApplication } from "@/lib/queries/use-applications";
import { useUIStore } from "@/lib/stores/ui-store";
import {
  STATUS_OPTIONS,
  STATUS_CONFIG,
  APPLICATION_TYPE_OPTIONS,
  APPLIED_VIA_OPTIONS,
  MAP_DEFAULTS,
} from "@/lib/constants";
import type {
  ApplicationStatus,
  ApplicationType,
  AppliedVia,
} from "@/lib/types";

interface CreateApplicationDialogProps {
  /** If true, renders its own trigger button. If false, controlled via useUIStore. */
  showTrigger?: boolean;
}

export function CreateApplicationDialog({
  showTrigger = true,
}: CreateApplicationDialogProps) {
  const createMutation = useCreateApplication();
  const {
    createDialogOpen,
    setCreateDialogOpen,
    pendingPin,
    setPendingPin,
  } = useUIStore();

  const [localOpen, setLocalOpen] = useState(false);
  // Use store state if no trigger, local state if trigger is shown
  const isOpen = showTrigger ? localOpen : createDialogOpen;
  const setIsOpen = showTrigger ? setLocalOpen : setCreateDialogOpen;

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [applicationType, setApplicationType] =
    useState<ApplicationType>("internship");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [appliedVia, setAppliedVia] = useState<AppliedVia>("other");
  const [dateApplied, setDateApplied] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [locationLabel, setLocationLabel] = useState("");
  const [jobPostingUrl, setJobPostingUrl] = useState("");
  const [notes, setNotes] = useState("");

  // Pre-fill coordinates display when opening from map click
  const lat = pendingPin?.latitude ?? MAP_DEFAULTS.center.lat;
  const lng = pendingPin?.longitude ?? MAP_DEFAULTS.center.lng;

  const resetForm = () => {
    setCompanyName("");
    setJobRole("");
    setApplicationType("internship");
    setStatus("applied");
    setAppliedVia("other");
    setDateApplied(new Date().toISOString().split("T")[0]);
    setLocationLabel("");
    setJobPostingUrl("");
    setNotes("");
  };

  // Reset form and pending pin when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setPendingPin(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        company_name: companyName,
        job_role: jobRole,
        application_type: applicationType,
        current_status: status,
        applied_via: appliedVia,
        date_applied: dateApplied,
        latitude: lat,
        longitude: lng,
        location_label: locationLabel,
        job_posting_url: jobPostingUrl || undefined,
        notes: notes || undefined,
      });

      toast.success("Application added", {
        description: `${companyName} — ${jobRole}`,
      });

      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to add application", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const dialogContent = (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>New Application</DialogTitle>
        <DialogDescription>
          {pendingPin
            ? `Pin placed at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
            : "Track a new job or internship application."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
        {/* Company + Role */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="company-name">Company *</Label>
            <Input
              id="company-name"
              placeholder="e.g. Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="job-role">Role *</Label>
            <Input
              id="job-role"
              placeholder="e.g. Software Engineer Intern"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Type + Status + Applied Via */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label>Type *</Label>
            <Select
              value={applicationType}
              onValueChange={(v) => setApplicationType(v as ApplicationType)}
            >
              <SelectTrigger id="application-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Status *</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ApplicationStatus)}
            >
              <SelectTrigger id="status-select">
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
          <div className="flex flex-col gap-2">
            <Label>Applied via *</Label>
            <Select
              value={appliedVia}
              onValueChange={(v) => setAppliedVia(v as AppliedVia)}
            >
              <SelectTrigger id="applied-via-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLIED_VIA_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date + Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="date-applied">Date Applied *</Label>
            <Input
              id="date-applied"
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location-label">Location</Label>
            <Input
              id="location-label"
              placeholder="e.g. Kuala Lumpur"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
            />
          </div>
        </div>

        {/* Job URL */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-url">Job Posting URL</Label>
          <Input
            id="job-url"
            type="url"
            placeholder="https://..."
            value={jobPostingUrl}
            onChange={(e) => setJobPostingUrl(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Interview prep, recruiter name, gut feelings..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            id="submit-application"
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Application
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  if (showTrigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
          id="add-application-trigger"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  // Controlled mode (from map click) — no trigger button
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {dialogContent}
    </Dialog>
  );
}

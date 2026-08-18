"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  Archive,
  ArchiveRestore,
  Trash2,
  ExternalLink,
  Download,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "./status-badge";
import {
  useApplications,
  useArchiveApplication,
  useRestoreApplication,
  useDeleteApplication,
  useUpdateStatus,
} from "@/lib/queries/use-applications";
import {
  APPLICATION_TYPE_LABELS,
  APPLIED_VIA_LABELS,
  STATUS_OPTIONS,
  STATUS_CONFIG,
} from "@/lib/constants";
import type { Application, ApplicationStatus } from "@/lib/types";

type SortKey = "company_name" | "date_applied" | "current_status" | "updated_at";
type SortDir = "asc" | "desc";

function daysElapsed(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function exportToCSV(applications: Application[]) {
  const headers = [
    "Company",
    "Role",
    "Type",
    "Status",
    "Applied Via",
    "Date Applied",
    "Location",
    "Job URL",
    "Notes",
  ];

  const rows = applications.map((app) => [
    app.company_name,
    app.job_role,
    APPLICATION_TYPE_LABELS[app.application_type],
    STATUS_CONFIG[app.current_status].label,
    APPLIED_VIA_LABELS[app.applied_via],
    app.date_applied,
    app.location_label || "",
    app.job_posting_url || "",
    (app.notes || "").replace(/"/g, '""'),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `applications_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported");
}

export function ApplicationsTable() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: applications = [], isLoading } =
    useApplications(showArchived);

  const archiveMutation = useArchiveApplication();
  const restoreMutation = useRestoreApplication();
  const deleteMutation = useDeleteApplication();
  const updateStatusMutation = useUpdateStatus();

  // Search & filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = applications;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (app) =>
          app.company_name.toLowerCase().includes(q) ||
          app.job_role.toLowerCase().includes(q) ||
          (app.location_label && app.location_label.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((app) => app.current_status === statusFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "company_name") {
        cmp = a.company_name.localeCompare(b.company_name);
      } else if (sortKey === "date_applied") {
        cmp =
          new Date(a.date_applied).getTime() -
          new Date(b.date_applied).getTime();
      } else if (sortKey === "current_status") {
        cmp = a.current_status.localeCompare(b.current_status);
      } else {
        cmp =
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [applications, search, statusFilter, sortKey, sortDir]);

  const handleArchive = async (app: Application) => {
    try {
      await archiveMutation.mutateAsync(app.id);
      toast.success("Application archived", {
        description: `${app.company_name} — ${app.job_role}`,
      });
    } catch {
      toast.error("Failed to archive application");
    }
  };

  const handleRestore = async (app: Application) => {
    try {
      await restoreMutation.mutateAsync(app.id);
      toast.success("Application restored", {
        description: `${app.company_name} — ${app.job_role}`,
      });
    } catch {
      toast.error("Failed to restore application");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Application deleted permanently");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete application");
    }
  };

  const handleStatusChange = async (
    app: Application,
    newStatus: ApplicationStatus
  ) => {
    if (newStatus === app.current_status) return;
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: app.id,
        newStatus,
      });
      toast.success("Status updated", {
        description: `${app.company_name} → ${STATUS_CONFIG[newStatus].label}`,
      });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const SortButton = ({
    label,
    sortKeyValue,
  }: {
    label: string;
    sortKeyValue: SortKey;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium"
      onClick={() => toggleSort(sortKeyValue)}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Active / Archived tabs */}
        <Tabs
          value={showArchived ? "archived" : "active"}
          onValueChange={(v) => setShowArchived(v === "archived")}
        >
          <TabsList>
            <TabsTrigger value="active" id="tab-active">
              Active
            </TabsTrigger>
            <TabsTrigger value="archived" id="tab-archived">
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search-applications"
            placeholder="Search company, role, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as ApplicationStatus | "all")
          }
        >
          <SelectTrigger id="filter-status" className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
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

        {/* CSV export */}
        <Tooltip>
          <TooltipTrigger
            id="export-csv"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Export CSV</span>
          </TooltipTrigger>
          <TooltipContent>Export to CSV</TooltipContent>
        </Tooltip>

        {/* Count */}
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} application{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton label="Company" sortKeyValue="company_name" />
              </TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead>
                <SortButton label="Status" sortKeyValue="current_status" />
              </TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden lg:table-cell">Via</TableHead>
              <TableHead>
                <SortButton label="Applied" sortKeyValue="date_applied" />
              </TableHead>
              <TableHead className="hidden sm:table-cell">Days</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <p className="text-muted-foreground">
                    {search || statusFilter !== "all"
                      ? "No applications match your filters."
                      : showArchived
                        ? "No archived applications."
                        : "No applications yet. Add one to get started!"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <div>
                      {app.company_name}
                      {app.location_label && (
                        <p className="text-xs text-muted-foreground">
                          {app.location_label}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <span className="max-w-[200px] truncate">
                        {app.job_role}
                      </span>
                      {app.job_posting_url && (
                        <a
                          href={app.job_posting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {showArchived ? (
                      <StatusBadge status={app.current_status} />
                    ) : (
                      <Select
                        value={app.current_status}
                        onValueChange={(v) =>
                          handleStatusChange(
                            app,
                            v as ApplicationStatus
                          )
                        }
                      >
                        <SelectTrigger className="h-7 w-auto border-0 bg-transparent px-0 shadow-none focus:ring-0">
                          <StatusBadge status={app.current_status} />
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
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs font-normal">
                      {APPLICATION_TYPE_LABELS[app.application_type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {APPLIED_VIA_LABELS[app.applied_via]}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(app.date_applied).toLocaleDateString("en-MY", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {daysElapsed(app.updated_at)}d
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {showArchived ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                              onClick={() => handleRestore(app)}
                            >
                              <ArchiveRestore className="h-4 w-4" />
                              <span className="sr-only">Restore</span>
                            </TooltipTrigger>
                            <TooltipContent>Restore</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteTarget(app)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </TooltipTrigger>
                            <TooltipContent>Delete permanently</TooltipContent>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            onClick={() => handleArchive(app)}
                          >
                            <Archive className="h-4 w-4" />
                            <span className="sr-only">Archive</span>
                          </TooltipTrigger>
                          <TooltipContent>Archive</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete application?</DialogTitle>
            <DialogDescription>
              This will permanently delete the application for{" "}
              <strong>
                {deleteTarget?.company_name} — {deleteTarget?.job_role}
              </strong>{" "}
              and all its status history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              id="confirm-delete"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

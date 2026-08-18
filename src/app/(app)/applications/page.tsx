import type { Metadata } from "next";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { CreateApplicationDialog } from "@/components/applications/create-application-dialog";

export const metadata: Metadata = {
  title: "Applications | JobTracker",
  description:
    "View, filter, and sort all your job and internship applications.",
};

export default function ApplicationsPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-6 md:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage all your job and internship applications.
          </p>
        </div>
        <CreateApplicationDialog />
      </div>

      {/* Table */}
      <ApplicationsTable />
    </div>
  );
}

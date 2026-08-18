"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
  StatusHistoryRow,
  ApplicationStatus,
} from "@/lib/types";

// ── Read operations ──────────────────────────────────────────

export async function getApplications(
  showArchived = false
): Promise<Application[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("archived", showArchived)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Application[]) ?? [];
}

export async function getApplication(id: string): Promise<Application | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw new Error(error.message);
  }
  return data as Application;
}

export async function getStatusHistory(
  applicationId: string
): Promise<StatusHistoryRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("status_history")
    .select("*")
    .eq("application_id", applicationId)
    .order("changed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as StatusHistoryRow[]) ?? [];
}

// ── Create ───────────────────────────────────────────────────

export async function createApplication(
  input: CreateApplicationInput
): Promise<Application> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      company_name: input.company_name,
      job_role: input.job_role,
      application_type: input.application_type,
      current_status: input.current_status,
      applied_via: input.applied_via,
      date_applied: input.date_applied,
      latitude: input.latitude,
      longitude: input.longitude,
      location_label: input.location_label,
      job_posting_url: input.job_posting_url || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Application;
}

// ── Update ───────────────────────────────────────────────────

export async function updateApplication(
  input: UpdateApplicationInput
): Promise<Application> {
  const supabase = await createClient();

  const { id, ...fields } = input;

  // Clean undefined values
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }

  const { data, error } = await supabase
    .from("applications")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Application;
}

// ── Status change ────────────────────────────────────────────
// The database trigger automatically inserts a StatusHistory row
// when current_status changes, so we only need to update the application.

export async function updateStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  note?: string
): Promise<Application> {
  const supabase = await createClient();

  // Update the application's current_status (trigger handles history)
  const { data, error } = await supabase
    .from("applications")
    .update({ current_status: newStatus })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // If a note was provided, update the most recent history row with it
  if (note) {
    const { data: historyRows } = await supabase
      .from("status_history")
      .select("id")
      .eq("application_id", applicationId)
      .order("changed_at", { ascending: false })
      .limit(1);

    if (historyRows && historyRows.length > 0) {
      await supabase
        .from("status_history")
        .update({ note })
        .eq("id", historyRows[0].id);
    }
  }

  return data as Application;
}

// ── Archive / Restore / Delete ───────────────────────────────

export async function archiveApplication(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("applications")
    .update({ archived: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function restoreApplication(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("applications")
    .update({ archived: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteApplication(id: string): Promise<void> {
  const supabase = await createClient();

  // Safety: only delete archived applications
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("archived", true);

  if (error) throw new Error(error.message);
}

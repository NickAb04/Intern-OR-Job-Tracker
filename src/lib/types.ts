// Database types — mirrors the Supabase schema defined in supabase/schema.sql

export type ApplicationType = "internship" | "full_time" | "contract" | "part_time";

export type ApplicationStatus =
  | "kiv"
  | "applied"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"
  | "ghosted"
  | "withdrawn";

export type AppliedVia =
  | "email"
  | "jobstreet"
  | "linkedin"
  | "company_website"
  | "referral"
  | "other";

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  job_role: string;
  application_type: ApplicationType;
  current_status: ApplicationStatus;
  applied_via: AppliedVia;
  date_applied: string; // ISO date string (YYYY-MM-DD)
  latitude: number;
  longitude: number;
  location_label: string;
  job_posting_url: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusHistoryRow {
  id: string;
  application_id: string;
  status: ApplicationStatus;
  changed_at: string;
  note: string | null;
}

// Form input types (for creation / editing)
export interface CreateApplicationInput {
  company_name: string;
  job_role: string;
  application_type: ApplicationType;
  current_status: ApplicationStatus;
  applied_via: AppliedVia;
  date_applied: string;
  latitude: number;
  longitude: number;
  location_label: string;
  job_posting_url?: string;
  notes?: string;
}

export interface UpdateApplicationInput {
  id: string;
  company_name?: string;
  job_role?: string;
  application_type?: ApplicationType;
  current_status?: ApplicationStatus;
  applied_via?: AppliedVia;
  date_applied?: string;
  latitude?: number;
  longitude?: number;
  location_label?: string;
  job_posting_url?: string | null;
  notes?: string | null;
}

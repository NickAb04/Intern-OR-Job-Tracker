import type { ApplicationStatus, ApplicationType, AppliedVia } from "./types";

// ── Status configuration ─────────────────────────────────────
// Keep consistent everywhere: pins, badges, table rows, tooltips (see docs/DESIGN.md)

export interface StatusConfig {
  label: string;
  color: string;           // Tailwind bg class
  textColor: string;       // Tailwind text class
  dotColor: string;        // Tailwind bg class for dot indicator
  pinColor: string;        // Hex color for map pins
  tooltip: string;
}

export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  kiv: {
    label: "KIV",
    color: "bg-slate-100 dark:bg-slate-800",
    textColor: "text-slate-700 dark:text-slate-300",
    dotColor: "bg-slate-500",
    pinColor: "#64748b",
    tooltip:
      "Company has acknowledged your application but hasn't progressed or rejected it — you're on hold.",
  },
  applied: {
    label: "Applied",
    color: "bg-blue-100 dark:bg-blue-900/40",
    textColor: "text-blue-700 dark:text-blue-300",
    dotColor: "bg-blue-500",
    pinColor: "#3b82f6",
    tooltip: "Application submitted; awaiting a response from the company.",
  },
  interview: {
    label: "Interview",
    color: "bg-amber-100 dark:bg-amber-900/40",
    textColor: "text-amber-700 dark:text-amber-300",
    dotColor: "bg-amber-500",
    pinColor: "#f59e0b",
    tooltip: "You've been invited to interview (any round).",
  },
  offer: {
    label: "Offer",
    color: "bg-violet-100 dark:bg-violet-900/40",
    textColor: "text-violet-700 dark:text-violet-300",
    dotColor: "bg-violet-500",
    pinColor: "#8b5cf6",
    tooltip:
      "Company has extended a job offer, pending your decision.",
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 dark:bg-green-900/40",
    textColor: "text-green-700 dark:text-green-300",
    dotColor: "bg-green-500",
    pinColor: "#22c55e",
    tooltip: "You accepted the offer — process complete.",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 dark:bg-red-900/40",
    textColor: "text-red-700 dark:text-red-300",
    dotColor: "bg-red-500",
    pinColor: "#ef4444",
    tooltip: "Company explicitly declined your application.",
  },
  ghosted: {
    label: "Ghosted",
    color: "bg-stone-100 dark:bg-stone-800",
    textColor: "text-stone-600 dark:text-stone-400",
    dotColor: "bg-stone-400",
    pinColor: "#a8a29e",
    tooltip:
      "No response for an extended period despite the process being ongoing.",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "bg-neutral-100 dark:bg-neutral-800",
    textColor: "text-neutral-500 dark:text-neutral-400",
    dotColor: "bg-neutral-400",
    pinColor: "#a3a3a3",
    tooltip: "You pulled out of the process yourself.",
  },
};

// Ordered list for dropdowns (logical workflow order)
export const STATUS_OPTIONS: ApplicationStatus[] = [
  "applied",
  "kiv",
  "interview",
  "offer",
  "accepted",
  "rejected",
  "ghosted",
  "withdrawn",
];

// ── Application type configuration ───────────────────────────

export interface AppTypeConfig {
  label: string;
  value: ApplicationType;
}

export const APPLICATION_TYPE_OPTIONS: AppTypeConfig[] = [
  { label: "Internship", value: "internship" },
  { label: "Full-time", value: "full_time" },
  { label: "Contract", value: "contract" },
  { label: "Part-time", value: "part_time" },
];

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  internship: "Internship",
  full_time: "Full-time",
  contract: "Contract",
  part_time: "Part-time",
};

// ── Applied via configuration ────────────────────────────────

export interface AppliedViaConfig {
  label: string;
  value: AppliedVia;
}

export const APPLIED_VIA_OPTIONS: AppliedViaConfig[] = [
  { label: "Email", value: "email" },
  { label: "JobStreet", value: "jobstreet" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Company Website", value: "company_website" },
  { label: "Referral", value: "referral" },
  { label: "Other", value: "other" },
];

export const APPLIED_VIA_LABELS: Record<AppliedVia, string> = {
  email: "Email",
  jobstreet: "JobStreet",
  linkedin: "LinkedIn",
  company_website: "Company Website",
  referral: "Referral",
  other: "Other",
};

// ── Map defaults (Malaysia-scoped, see docs/DESIGN.md) ───────

export const MAP_DEFAULTS = {
  center: { lat: 3.139, lng: 101.6869 } as const,
  zoom: 10,
  styles: {
    light: "https://tiles.openfreemap.org/styles/positron",
    dark: "https://tiles.openfreemap.org/styles/dark",
  },
  cluster: {
    radius: 50,
    maxZoom: 14,
    colors: [
      { count: 0, color: "#64748b", radius: 18 },
      { count: 10, color: "#3b82f6", radius: 22 },
      { count: 25, color: "#8b5cf6", radius: 28 },
    ],
  },
};

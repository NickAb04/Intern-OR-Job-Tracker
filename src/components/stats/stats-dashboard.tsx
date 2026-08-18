"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Briefcase,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApplications } from "@/lib/queries/use-applications";
import {
  STATUS_CONFIG,
  STATUS_OPTIONS,
  APPLICATION_TYPE_LABELS,
  APPLIED_VIA_LABELS,
} from "@/lib/constants";
import type {
  Application,
  ApplicationStatus,
  ApplicationType,
  AppliedVia,
} from "@/lib/types";

// ── Metric cards ─────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ${iconColor}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-[10px] text-muted-foreground/70">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Custom tooltip ───────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      {label && (
        <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Utilities ────────────────────────────────────────────────

function computeStats(apps: Application[]) {
  const total = apps.length;
  const active = apps.filter((a) => !a.archived).length;
  const archived = apps.filter((a) => a.archived).length;

  // Status counts
  const statusCounts: Record<ApplicationStatus, number> = {} as Record<
    ApplicationStatus,
    number
  >;
  for (const s of STATUS_OPTIONS) statusCounts[s] = 0;
  for (const app of apps) statusCounts[app.current_status]++;

  // Response rate = (interview + offer + accepted + rejected) / total
  const responded =
    statusCounts.interview +
    statusCounts.offer +
    statusCounts.accepted +
    statusCounts.rejected;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  // Acceptance rate = accepted / total
  const acceptanceRate =
    total > 0 ? Math.round((statusCounts.accepted / total) * 100) : 0;

  // Average days since last update (non-archived)
  const nonArchived = apps.filter((a) => !a.archived);
  const avgDays =
    nonArchived.length > 0
      ? Math.round(
          nonArchived.reduce((sum, app) => {
            const d = Math.floor(
              (Date.now() - new Date(app.updated_at).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return sum + d;
          }, 0) / nonArchived.length
        )
      : 0;

  // Type breakdown
  const typeCounts: Record<ApplicationType, number> = {
    internship: 0,
    full_time: 0,
    contract: 0,
    part_time: 0,
  };
  for (const app of apps) typeCounts[app.application_type]++;

  // Applied via breakdown
  const viaCounts: Record<AppliedVia, number> = {
    email: 0,
    jobstreet: 0,
    linkedin: 0,
    company_website: 0,
    referral: 0,
    other: 0,
  };
  for (const app of apps) viaCounts[app.applied_via]++;

  // Timeline: applications per month
  const monthMap = new Map<string, number>();
  for (const app of apps) {
    const d = new Date(app.date_applied);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  }
  const timeline = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const [y, m] = month.split("-");
      const label = new Date(+y, +m - 1).toLocaleDateString("en-MY", {
        month: "short",
        year: "2-digit",
      });
      return { month: label, applications: count };
    });

  return {
    total,
    active,
    archived,
    statusCounts,
    responseRate,
    acceptanceRate,
    avgDays,
    typeCounts,
    viaCounts,
    timeline,
  };
}

// ── Main component ───────────────────────────────────────────

export function StatsDashboard() {
  const { data: allApps = [] } = useApplications(false);
  const { data: archivedApps = [] } = useApplications(true);

  const allApplications = useMemo(
    () => [...allApps, ...archivedApps],
    [allApps, archivedApps]
  );

  const stats = useMemo(() => computeStats(allApplications), [allApplications]);

  // Pie chart data
  const statusData = useMemo(
    () =>
      STATUS_OPTIONS.filter((s) => stats.statusCounts[s] > 0).map((s) => ({
        name: STATUS_CONFIG[s].label,
        value: stats.statusCounts[s],
        color: STATUS_CONFIG[s].pinColor,
      })),
    [stats]
  );

  // Bar chart data (applied via)
  const viaData = useMemo(
    () =>
      (Object.entries(stats.viaCounts) as [AppliedVia, number][])
        .filter(([, count]) => count > 0)
        .map(([via, count]) => ({
          name: APPLIED_VIA_LABELS[via],
          count,
        }))
        .sort((a, b) => b.count - a.count),
    [stats]
  );

  // Type breakdown for display
  const typeData = useMemo(
    () =>
      (Object.entries(stats.typeCounts) as [ApplicationType, number][])
        .filter(([, count]) => count > 0)
        .map(([type, count]) => ({
          name: APPLICATION_TYPE_LABELS[type],
          count,
        }))
        .sort((a, b) => b.count - a.count),
    [stats]
  );

  if (allApplications.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">No data yet</h2>
          <p className="mt-1 text-muted-foreground">
            Add some applications to see your stats dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Applications"
          value={stats.total}
          subtitle={`${stats.active} active · ${stats.archived} archived`}
          icon={Briefcase}
        />
        <MetricCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          subtitle="Interview + Offer + Accepted + Rejected"
          icon={TrendingUp}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Acceptance Rate"
          value={`${stats.acceptanceRate}%`}
          subtitle={`${stats.statusCounts.accepted} accepted`}
          icon={stats.acceptanceRate > 0 ? CheckCircle2 : Target}
          iconColor={
            stats.acceptanceRate > 0 ? "text-green-500" : "text-violet-500"
          }
        />
        <MetricCard
          title="Avg. Days Since Update"
          value={`${stats.avgDays}d`}
          subtitle="Active applications only"
          icon={Clock}
          iconColor="text-amber-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status breakdown donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status Breakdown</CardTitle>
            <CardDescription>
              Distribution across all {stats.total} applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<ChartTooltip />}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-1 flex-col gap-1.5">
                {statusData.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground">
                        {entry.name}
                      </span>
                    </span>
                    <span className="font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline area chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Application Timeline</CardTitle>
            <CardDescription>Applications submitted per month</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.timeline}>
                  <defs>
                    <linearGradient
                      id="colorApps"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    width={30}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorApps)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Not enough data for timeline.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applied via bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Applied Via</CardTitle>
            <CardDescription>
              Channels used to submit applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={viaData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    width={100}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    name="Applications"
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No data yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Application type breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Application Types</CardTitle>
            <CardDescription>
              Breakdown by job type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 pt-2">
              {typeData.map((item) => {
                const pct = Math.round((item.count / stats.total) * 100);
                return (
                  <div key={item.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">
                        {item.count}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {typeData.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No data yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejection insights */}
      {stats.statusCounts.rejected > 0 && (
        <Card className="border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="h-4 w-4 text-destructive" />
              Rejection Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You&apos;ve received{" "}
              <span className="font-medium text-foreground">
                {stats.statusCounts.rejected}
              </span>{" "}
              rejection{stats.statusCounts.rejected !== 1 ? "s" : ""} out of{" "}
              <span className="font-medium text-foreground">{stats.total}</span>{" "}
              total applications (
              {Math.round(
                (stats.statusCounts.rejected / stats.total) * 100
              )}
              %). {stats.statusCounts.ghosted > 0 && (
                <>
                  An additional{" "}
                  <span className="font-medium text-foreground">
                    {stats.statusCounts.ghosted}
                  </span>{" "}
                  application{stats.statusCounts.ghosted !== 1 ? "s" : ""}{" "}
                  appear to have been ghosted.
                </>
              )}
              {" "}Keep going — the numbers are in your favor!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

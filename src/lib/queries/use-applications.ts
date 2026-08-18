"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplications,
  getApplication,
  getStatusHistory,
  createApplication,
  updateApplication,
  updateStatus,
  archiveApplication,
  restoreApplication,
  deleteApplication,
} from "@/lib/actions/applications";
import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationStatus,
} from "@/lib/types";

// ── Query keys ───────────────────────────────────────────────

export const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: (archived: boolean) =>
    [...applicationKeys.lists(), { archived }] as const,
  details: () => [...applicationKeys.all, "detail"] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  history: (id: string) =>
    [...applicationKeys.all, "history", id] as const,
};

// ── Queries ──────────────────────────────────────────────────

export function useApplications(showArchived = false) {
  return useQuery<Application[]>({
    queryKey: applicationKeys.list(showArchived),
    queryFn: () => getApplications(showArchived),
  });
}

export function useApplication(id: string) {
  return useQuery<Application | null>({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplication(id),
    enabled: !!id,
  });
}

export function useStatusHistory(applicationId: string) {
  return useQuery({
    queryKey: applicationKeys.history(applicationId),
    queryFn: () => getStatusHistory(applicationId),
    enabled: !!applicationId,
  });
}

// ── Mutations ────────────────────────────────────────────────

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateApplicationInput) => createApplication(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateApplicationInput) => updateApplication(input),
    onSuccess: (data: Application) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(data.id),
      });
    },
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      newStatus,
      note,
    }: {
      applicationId: string;
      newStatus: ApplicationStatus;
      note?: string;
    }) => updateStatus(applicationId, newStatus, note),
    onSuccess: (data: Application) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.history(data.id),
      });
    },
  });
}

export function useArchiveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useRestoreApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

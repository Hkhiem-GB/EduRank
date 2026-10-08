import { apiClient } from "./client";
import {
  ICompetitionCriteria,
  CompetitionRecordFormData,
  CompetitionRecordSummary,
} from "@/types";

export async function getCriteriaApi(params?: { targetType?: string; activeOnly?: boolean }) {
  const query = new URLSearchParams();
  if (params?.targetType) query.set("targetType", params.targetType);
  if (params?.activeOnly !== undefined) query.set("activeOnly", String(params.activeOnly));

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiClient<ICompetitionCriteria[]>(`/api/competition/criteria${qs}`);
}

export async function createCriteriaApi(data: Partial<ICompetitionCriteria>) {
  return apiClient<ICompetitionCriteria>("/api/competition/criteria", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function recordCompetitionScoreApi(data: CompetitionRecordFormData) {
  return apiClient("/api/competition/record", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelCompetitionRecordApi(id: string) {
  return apiClient(`/api/competition/record/${id}/cancel`, {
    method: "POST",
  });
}

export async function getRecentCompetitionRecordsApi(limit = 10) {
  return apiClient<CompetitionRecordSummary[]>(`/api/competition/recent?limit=${limit}`);
}

export async function getCompetitionRecordsApi(params?: { classId?: string; studentId?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.classId) query.set("classId", params.classId);
  if (params?.studentId) query.set("studentId", params.studentId);
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiClient<{
    classRecords: any[];
    studentRecords: any[];
  }>(`/api/competition/record${qs}`);
}

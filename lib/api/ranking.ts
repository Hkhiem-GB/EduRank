import { apiClient } from "./client";
import { ClassRankingItem, StudentRankingItem } from "@/types";

export async function getClassRankingsApi(params?: { grade?: number }) {
  const query = new URLSearchParams();
  if (params?.grade) query.set("grade", String(params.grade));

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiClient<ClassRankingItem[]>(`/api/ranking/classes${qs}`);
}

export async function getStudentRankingsApi(params?: { classId?: string; grade?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.classId) query.set("classId", params.classId);
  if (params?.grade) query.set("grade", String(params.grade));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiClient<StudentRankingItem[]>(`/api/ranking/students${qs}`);
}

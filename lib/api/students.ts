import { apiClient } from "./client";
import { StudentTableItem } from "@/types";

export interface GetStudentsParams {
  classId?: string;
  grade?: number;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getStudentsApi(params?: GetStudentsParams) {
  const query = new URLSearchParams();
  if (params?.classId) query.set("classId", params.classId);
  if (params?.grade) query.set("grade", String(params.grade));
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiClient<StudentTableItem[]>(`/api/students${qs}`);
}

export async function getStudentByIdApi(id: string) {
  return apiClient(`/api/students/${id}`);
}

export async function createStudentApi(data: any) {
  return apiClient("/api/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStudentApi(id: string, data: any) {
  return apiClient(`/api/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteStudentApi(id: string) {
  return apiClient(`/api/students/${id}`, {
    method: "DELETE",
  });
}

import { apiClient } from "./client";
import { IClass } from "@/types";

export async function getClassesApi(params?: { grade?: number; status?: string }) {
  const query = new URLSearchParams();
  if (params?.grade) query.set("grade", String(params.grade));
  if (params?.status) query.set("status", params.status);

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiClient<IClass[]>(`/api/classes${qs}`);
}

export async function getClassByIdApi(id: string) {
  return apiClient<IClass>(`/api/classes/${id}`);
}

export async function createClassApi(data: Partial<IClass>) {
  return apiClient<IClass>("/api/classes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateClassApi(id: string, data: Partial<IClass>) {
  return apiClient<IClass>(`/api/classes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteClassApi(id: string) {
  return apiClient(`/api/classes/${id}`, {
    method: "DELETE",
  });
}

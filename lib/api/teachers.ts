import { apiClient } from "./client";
import { ITeacher } from "@/types";

export interface GetTeachersParams {
  department?: string;
  status?: string;
}

export async function getTeachersApi(params?: GetTeachersParams) {
  const query = new URLSearchParams();
  if (params?.department) query.set("department", params.department);
  if (params?.status) query.set("status", params.status);

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiClient<ITeacher[]>(`/api/teachers${qs}`);
}

export async function getTeacherByIdApi(id: string) {
  return apiClient<{ teacher: ITeacher; assignedClasses: any[] }>(`/api/teachers/${id}`);
}

export async function createTeacherApi(data: Partial<ITeacher>) {
  return apiClient<ITeacher>("/api/teachers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTeacherApi(id: string, data: Partial<ITeacher>) {
  return apiClient<ITeacher>(`/api/teachers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTeacherApi(id: string) {
  return apiClient(`/api/teachers/${id}`, {
    method: "DELETE",
  });
}

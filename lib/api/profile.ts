import { apiClient } from "./client";

export async function getProfileApi() {
  return apiClient<{
    user: any;
    teacher: any;
    student: any;
  }>("/api/profile", {
    method: "GET",
  });
}

export async function updateProfileApi(data: any) {
  return apiClient("/api/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changePasswordApi(data: { oldPassword: string; newPassword: string }) {
  return apiClient("/api/profile/password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function uploadAvatarApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<{ avatarUrl: string }>("/api/profile/avatar", {
    method: "POST",
    body: formData,
  });
}

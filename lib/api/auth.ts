import { apiClient } from "./client";
import { UserRole } from "@/types";

export interface LoginParams {
  accountCode: string;
  password: string;
  role?: UserRole;
}

export async function loginApi(params: LoginParams) {
  return apiClient<{
    user: any;
    token: string;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getMeApi() {
  return apiClient<{ user: any }>("/api/auth/me", {
    method: "GET",
  });
}

export async function logoutApi() {
  return apiClient("/api/auth/logout", {
    method: "POST",
  });
}

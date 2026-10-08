import { apiClient } from "./client";
import { IAuditLog } from "@/types";

export interface GetAuditLogsParams {
  action?: string;
  targetType?: string;
  page?: number;
  limit?: number;
}

export async function getAuditLogsApi(params?: GetAuditLogsParams) {
  const query = new URLSearchParams();
  if (params?.action) query.set("action", params.action);
  if (params?.targetType) query.set("targetType", params.targetType);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : "";
  return apiClient<IAuditLog[]>(`/api/audit-logs${qs}`);
}

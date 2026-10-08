/**
 * Base HTTP fetch wrapper with error handling and credentials support
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // If body is FormData, don't set Content-Type header so the browser sets boundary
  if (options.body instanceof FormData) {
    delete (defaultHeaders as any)["Content-Type"];
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include", // send cookies
  };

  try {
    const res = await fetch(endpoint, config);
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: result.message || `Lỗi máy chủ (${res.status})`,
        ...result,
      };
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Không thể kết nối đến máy chủ.",
    };
  }
}

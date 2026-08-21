import type { ApiResponse } from "@/types";

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  const json = (await response.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error);
  }

  return json.data;
}

import { Platform } from "react-native";

function getApiBase(): string {
  if (Platform.OS === "web") {
    return "";
  }
  return process.env["EXPO_PUBLIC_API_URL"] ?? "";
}

export const API_BASE = getApiBase();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const body = await res.json().catch(() => ({ error: "Unknown error" })) as Record<string, unknown>;

  if (!res.ok) {
    const msg = (body["error"] as string) ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  return body as T;
}

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  // Attach JWT token if available
  const token = await AsyncStorage.getItem("ridhi_token").catch(() => null);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers ?? {}) as Record<string, string>,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    headers,
    ...options,
  });

  const body = await res.json().catch(() => ({ error: "Unknown error" })) as Record<string, unknown>;

  if (!res.ok) {
    const msg = (body["error"] as string) ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  return body as T;
}

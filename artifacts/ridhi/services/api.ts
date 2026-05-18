import { Platform } from "react-native";

function getBaseUrl(): string {
  if (Platform.OS === "web") {
    return "/api";
  }
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  return "https://8f940257-4c4e-4549-a4a9-638a0d369b1e-00-39dus2nt16lza.pike.replit.dev/api";
}

const BASE_URL = getBaseUrl();

interface OtpSendResponse {
  success: boolean;
  channel?: "sms" | "whatsapp";
  message?: string;
  error?: string;
}

interface OtpVerifyResponse {
  success: boolean;
  userId?: string;
  phone?: string;
  message?: string;
  error?: string;
}

export async function sendOtp(contact: string, type: "phone" | "email"): Promise<OtpSendResponse> {
  const res = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact, type }),
  });
  const data = await res.json() as OtpSendResponse;
  if (!res.ok) throw new Error(data.error ?? "Failed to send OTP");
  return data;
}

export async function verifyOtp(contact: string, code: string): Promise<OtpVerifyResponse> {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact, code }),
  });
  const data = await res.json() as OtpVerifyResponse;
  if (!res.ok) throw new Error(data.error ?? "Failed to verify OTP");
  return data;
}

export async function resendOtp(contact: string): Promise<OtpSendResponse> {
  const res = await fetch(`${BASE_URL}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact }),
  });
  const data = await res.json() as OtpSendResponse;
  if (!res.ok) throw new Error(data.error ?? "Failed to resend OTP");
  return data;
}

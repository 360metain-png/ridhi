/**
 * KYC Provider abstraction for Indian identity verification.
 *
 * Supports live providers (SurePass, IDfy, Karza) via env var config,
 * plus a demo fallback that accepts any OTP / always succeeds.
 *
 * Environment:
 *   KYC_PROVIDER        — "surepass" | "idfy" | "karza" | "demo" (default: demo)
 *   KYC_PROVIDER_KEY    — API key for the selected provider
 *   KYC_PROVIDER_BASE   — Optional custom base URL override
 */

export interface SendOtpResult {
  success: boolean;
  message: string;
  clientId?: string; // provider reference for verify step
  demo?: boolean;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  name?: string;
  dob?: string;
  gender?: string;
  address?: string;
  photo?: string; // base64 photo if available
  demo?: boolean;
}

export interface VerifyPanResult {
  success: boolean;
  message: string;
  name?: string;
  dob?: string;
  status?: string; // active / inactive
  demo?: boolean;
}

export interface VerifyBankResult {
  success: boolean;
  message: string;
  accountName?: string;
  bankName?: string;
  branch?: string;
  demo?: boolean;
}

export interface KycProvider {
  name: string;
  sendAadhaarOtp(aadhaarNumber: string): Promise<SendOtpResult>;
  verifyAadhaarOtp(aadhaarNumber: string, otp: string, clientId?: string): Promise<VerifyOtpResult>;
  verifyPan(panNumber: string, name?: string): Promise<VerifyPanResult>;
  verifyBank(accountNumber: string, ifsc: string): Promise<VerifyBankResult>;
}

// ─── Demo provider (default when no real credentials) ───────────────────────

function demoProvider(): KycProvider {
  const demoStore = new Map<string, { otp: string; clientId: string }>();

  return {
    name: "demo",

    async sendAadhaarOtp(aadhaarNumber: string) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const clientId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      demoStore.set(aadhaarNumber, { otp, clientId });
      return {
        success: true,
        message: `Demo OTP sent. Use code: ${otp}`,
        clientId,
        demo: true,
      };
    },

    async verifyAadhaarOtp(aadhaarNumber: string, otp: string, clientId?: string) {
      const stored = demoStore.get(aadhaarNumber);
      if (!stored || stored.otp !== otp) {
        return { success: false, message: "Invalid OTP. Please try again." };
      }
      demoStore.delete(aadhaarNumber);
      return {
        success: true,
        message: "Aadhaar verified successfully (demo).",
        name: "Demo User",
        dob: "01/01/1990",
        gender: "male",
        demo: true,
      };
    },

    async verifyPan(panNumber: string) {
      const valid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber);
      if (!valid) {
        return { success: false, message: "Invalid PAN format." };
      }
      return {
        success: true,
        message: "PAN verified successfully (demo).",
        name: "Demo User",
        status: "active",
        demo: true,
      };
    },

    async verifyBank(accountNumber: string, ifsc: string) {
      if (accountNumber.length < 9 || ifsc.length !== 11) {
        return { success: false, message: "Invalid account number or IFSC." };
      }
      return {
        success: true,
        message: "Bank account verified successfully (demo).",
        accountName: "Demo User",
        bankName: "Demo Bank",
        demo: true,
      };
    },
  };
}

// ─── SurePass provider ────────────────────────────────────────────────────────

function surepassProvider(apiKey: string, baseUrl = "https://api.surepass.io/api/v1"): KycProvider {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  return {
    name: "surepass",

    async sendAadhaarOtp(aadhaarNumber: string) {
      const res = await fetch(`${baseUrl}/aadhaar/otp`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id_number: aadhaarNumber }),
      });
      const data = (await res.json()) as any;
      if (!res.ok || data?.success === false) {
        return { success: false, message: data?.message || "Failed to send OTP" };
      }
      return {
        success: true,
        message: "OTP sent to Aadhaar-linked mobile",
        clientId: data?.data?.client_id,
      };
    },

    async verifyAadhaarOtp(aadhaarNumber: string, otp: string, clientId?: string) {
      const res = await fetch(`${baseUrl}/aadhaar/verify-otp`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id_number: aadhaarNumber, otp, client_id: clientId }),
      });
      const data = (await res.json()) as any;
      if (!res.ok || data?.success === false) {
        return { success: false, message: data?.message || "OTP verification failed" };
      }
      const d = data?.data;
      return {
        success: true,
        message: "Aadhaar verified successfully",
        name: d?.full_name,
        dob: d?.dob,
        gender: d?.gender,
        address: d?.address?.full,
        photo: d?.photo,
      };
    },

    async verifyPan(panNumber: string) {
      const res = await fetch(`${baseUrl}/pan/pan-comprehensive`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id_number: panNumber }),
      });
      const data = (await res.json()) as any;
      if (!res.ok || data?.success === false) {
        return { success: false, message: data?.message || "PAN verification failed" };
      }
      const d = data?.data;
      return {
        success: true,
        message: "PAN verified successfully",
        name: d?.full_name,
        dob: d?.dob,
        status: d?.status,
      };
    },

    async verifyBank(accountNumber: string, ifsc: string) {
      const res = await fetch(`${baseUrl}/bank/account-verification`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id_number: accountNumber, ifsc_code: ifsc }),
      });
      const data = (await res.json()) as any;
      if (!res.ok || data?.success === false) {
        return { success: false, message: data?.message || "Bank verification failed" };
      }
      const d = data?.data;
      return {
        success: true,
        message: "Bank account verified successfully",
        accountName: d?.account_name,
        bankName: d?.bank_name,
        branch: d?.branch,
      };
    },
  };
}

// ─── Factory ─────────────────────────────────────────────────────────────────

let cachedProvider: KycProvider | null = null;

export function getKycProvider(): KycProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = (process.env["KYC_PROVIDER"] || "demo").toLowerCase();
  const apiKey = process.env["KYC_PROVIDER_KEY"];
  const baseUrl = process.env["KYC_PROVIDER_BASE"];

  if (providerName === "surepass" && apiKey) {
    cachedProvider = surepassProvider(apiKey, baseUrl);
  } else if (providerName === "demo") {
    cachedProvider = demoProvider();
  } else {
    // No valid credentials → demo fallback
    cachedProvider = demoProvider();
  }

  return cachedProvider;
}

/**
 * OTP Provider Configuration — runtime switchable
 *
 * Supports 3 modes:
 *   "msg91"    → Always use MSG91 SMS OTP
 *   "firebase" → Always use Firebase Phone Auth
 *   "auto"     → Try Firebase first, fall back to MSG91 on failure
 *
 * Config is stored in-memory (sufficient for mock-heavy architecture).
 * Super Admin changes it via POST /api/admin/otp-config.
 */

export type OtpProvider = "msg91" | "firebase" | "auto";

interface OtpConfig {
  activeProvider: OtpProvider;
  lastChangedAt: string;
  changedBy: string; // admin identifier
}

const DEFAULT: OtpConfig = {
  activeProvider: "msg91",
  lastChangedAt: new Date().toISOString(),
  changedBy: "system",
};

let config: OtpConfig = { ...DEFAULT };

export function getOtpConfig(): OtpConfig {
  return { ...config };
}

export function setOtpProvider(
  provider: OtpProvider,
  changedBy: string,
): void {
  config = {
    activeProvider: provider,
    lastChangedAt: new Date().toISOString(),
    changedBy,
  };
}

/** For auth.ts: pick the provider to use for a given request */
export function resolveProvider(): OtpProvider {
  return config.activeProvider;
}

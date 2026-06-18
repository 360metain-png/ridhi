/**
 * AES-256 Encryption for Sensitive Data
 *
 * Encrypts KYC fields (Aadhaar, PAN, bank account) before storing in DB.
 * Uses AES-256-GCM for authenticated encryption.
 *
 * WARNING: The ENCRYPTION_KEY must be 32 bytes (64 hex chars).
 * In production, set a strong random key via env var.
 */

import crypto from "crypto";
import { logger } from "./logger";

const ENCRYPTION_KEY = process.env["ENCRYPTION_KEY"]
  ? Buffer.from(process.env["ENCRYPTION_KEY"], "hex")
  : crypto.randomBytes(32); // fallback for dev (changes on restart!)

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Warn if using the random fallback key
if (!process.env["ENCRYPTION_KEY"]) {
  logger.warn(
    "ENCRYPTION_KEY not set — using random key (data will be lost on restart!). Set a 64-char hex string."
  );
}

// Validate key length
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error(
    `ENCRYPTION_KEY must be 32 bytes (64 hex chars). Got ${ENCRYPTION_KEY.length} bytes.`
  );
}

// ── Encrypt ───────────────────────────────────────────────────────────────────

export function encrypt(text: string | null | undefined): string | null {
  if (!text || text.trim() === "") return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Store: iv + authTag + encrypted
  return iv.toString("hex") + authTag.toString("hex") + encrypted;
}

// ── Decrypt ───────────────────────────────────────────────────────────────────

export function decrypt(encryptedData: string | null | undefined): string | null {
  if (!encryptedData || encryptedData.length < IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2) {
    return null;
  }

  try {
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), "hex");
    const authTag = Buffer.from(
      encryptedData.slice(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2),
      "hex"
    );
    const encrypted = encryptedData.slice(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    logger.error({ err: (err as Error).message }, "Decryption failed");
    return null;
  }
}

// ── Encrypt Object Fields ────────────────────────────────────────────────────

export function encryptKycFields(data: {
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankName?: string | null;
  bankHolderName?: string | null;
}): {
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankName?: string | null;
  bankHolderName?: string | null;
} {
  return {
    aadhaarNumber: encrypt(data.aadhaarNumber),
    panNumber: encrypt(data.panNumber),
    bankAccountNumber: encrypt(data.bankAccountNumber),
    bankIfsc: encrypt(data.bankIfsc),
    bankName: encrypt(data.bankName),
    bankHolderName: encrypt(data.bankHolderName),
  };
}

// ── Decrypt Object Fields ────────────────────────────────────────────────────

export function decryptKycFields(data: {
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankName?: string | null;
  bankHolderName?: string | null;
}): {
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankName?: string | null;
  bankHolderName?: string | null;
} {
  return {
    aadhaarNumber: decrypt(data.aadhaarNumber),
    panNumber: decrypt(data.panNumber),
    bankAccountNumber: decrypt(data.bankAccountNumber),
    bankIfsc: decrypt(data.bankIfsc),
    bankName: decrypt(data.bankName),
    bankHolderName: decrypt(data.bankHolderName),
  };
}

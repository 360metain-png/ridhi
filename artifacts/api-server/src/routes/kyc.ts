import { Router } from "express";
import { db } from "@workspace/db";
import { kycRecords } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getKycProvider } from "../lib/kycProvider";

const router = Router();
const provider = getKycProvider();

// In-memory OTP session store: aadhaarNumber → { clientId, otpSentAt }
const otpSessions = new Map<string, { clientId?: string; otpSentAt: number }>();

function maskAadhaar(digits: string): string {
  return `XXXX XXXX ${digits.slice(-4)}`;
}

function normalizeAadhaar(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 12);
}

// ── POST /api/kyc/aadhaar/send-otp ───────────────────────────────────────────────────────────────────
router.post("/kyc/aadhaar/send-otp", async (req, res) => {
  const { aadhaarNumber } = req.body as { aadhaarNumber?: string };
  const digits = normalizeAadhaar(aadhaarNumber || "");

  if (digits.length !== 12) {
    res.status(400).json({ success: false, error: "Aadhaar number must be 12 digits" });
    return;
  }

  try {
    const result = await provider.sendAadhaarOtp(digits);
    if (result.success) {
      otpSessions.set(digits, { clientId: result.clientId, otpSentAt: Date.now() });
      req.log.info({ aadhaar: maskAadhaar(digits), provider: provider.name }, "Aadhaar OTP sent");
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Aadhaar OTP send failed");
    res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
  }
});

// ── POST /api/kyc/aadhaar/verify-otp ───────────────────────────────────────────────────────────────────
router.post("/kyc/aadhaar/verify-otp", async (req, res) => {
  const { aadhaarNumber, otp } = req.body as { aadhaarNumber?: string; otp?: string };
  const digits = normalizeAadhaar(aadhaarNumber || "");

  if (digits.length !== 12 || !otp || otp.length !== 6) {
    res.status(400).json({ success: false, error: "Invalid Aadhaar number or OTP" });
    return;
  }

  const session = otpSessions.get(digits);
  if (!session) {
    res.status(400).json({ success: false, error: "OTP session expired. Please request a new OTP." });
    return;
  }

  try {
    const result = await provider.verifyAadhaarOtp(digits, otp, session.clientId);
    if (result.success) {
      otpSessions.delete(digits);
      req.log.info({ aadhaar: maskAadhaar(digits), provider: provider.name }, "Aadhaar OTP verified");
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Aadhaar OTP verify failed");
    res.status(500).json({ success: false, message: "Verification failed. Please try again." });
  }
});

// ── POST /api/kyc/pan/verify ──────────────────────────────────────────────────────────────────────────────────
router.post("/kyc/pan/verify", async (req, res) => {
  const { panNumber, name } = req.body as { panNumber?: string; name?: string };
  if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
    res.status(400).json({ success: false, error: "Invalid PAN format" });
    return;
  }

  try {
    const result = await provider.verifyPan(panNumber.toUpperCase(), name);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "PAN verify failed");
    res.status(500).json({ success: false, message: "PAN verification failed" });
  }
});

// ── POST /api/kyc/bank/verify ──────────────────────────────────────────────────────────────────────────────────
router.post("/kyc/bank/verify", async (req, res) => {
  const { accountNumber, ifsc } = req.body as { accountNumber?: string; ifsc?: string };
  if (!accountNumber || accountNumber.length < 9 || !ifsc || ifsc.length !== 11) {
    res.status(400).json({ success: false, error: "Invalid account number or IFSC" });
    return;
  }

  try {
    const result = await provider.verifyBank(accountNumber, ifsc.toUpperCase());
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Bank verify failed");
    res.status(500).json({ success: false, message: "Bank verification failed" });
  }
});

// ── POST /api/kyc/submit ────────────────────────────────────────────────────────────────────────────────────────
router.post("/kyc/submit", async (req, res) => {
  const {
    userId,
    aadhaarNumber,
    aadhaarVerified,
    panNumber,
    panVerified,
    bankAccountNumber,
    bankIfsc,
    bankName,
    bankHolderName,
    bankVerified,
  } = req.body as any;

  if (!userId) {
    res.status(400).json({ success: false, error: "userId is required" });
    return;
  }

  try {
    const existing = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);

    const now = new Date();
    const record = {
      userId,
      aadhaarNumber: aadhaarNumber ? maskAadhaar(normalizeAadhaar(aadhaarNumber)) : undefined,
      aadhaarVerified: aadhaarVerified || false,
      aadhaarVerifiedAt: aadhaarVerified ? now : undefined,
      panNumber: panNumber ? panNumber.toUpperCase() : undefined,
      panVerified: panVerified || false,
      panVerifiedAt: panVerified ? now : undefined,
      bankAccountNumber: bankAccountNumber || undefined,
      bankIfsc: bankIfsc ? bankIfsc.toUpperCase() : undefined,
      bankName: bankName || undefined,
      bankHolderName: bankHolderName || undefined,
      bankVerified: bankVerified || false,
      bankVerifiedAt: bankVerified ? now : undefined,
      status: (aadhaarVerified && panVerified && bankVerified) ? "approved" : "pending",
      submittedAt: now,
      updatedAt: now,
    };

    if (existing.length > 0) {
      await db.update(kycRecords).set(record).where(eq(kycRecords.userId, userId));
    } else {
      await db.insert(kycRecords).values(record as any);
    }

    req.log.info({ userId, status: record.status }, "KYC submitted");
    res.json({ success: true, status: record.status, message: "KYC submitted successfully" });
  } catch (err) {
    req.log.error({ err }, "KYC submit failed");
    res.status(500).json({ success: false, message: "Failed to save KYC record" });
  }
});

// ── GET /api/kyc/status/:userId ───────────────────────────────────────────────────────────────────────────────────────────
router.get("/kyc/status/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const rows = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);
    if (rows.length === 0) {
      res.json({
        success: true,
        kyc: {
          status: "not_started",
          aadhaarVerified: false,
          panVerified: false,
          bankVerified: false,
        },
      });
      return;
    }
    const k = rows[0];
    res.json({
      success: true,
      kyc: {
        status: k.status,
        aadhaarVerified: k.aadhaarVerified,
        panVerified: k.panVerified,
        bankVerified: k.bankVerified,
        aadhaarNumber: k.aadhaarNumber,
        panNumber: k.panNumber,
        bankName: k.bankName,
        bankIfsc: k.bankIfsc,
        submittedAt: k.submittedAt,
        reviewedAt: k.reviewedAt,
        rejectionReason: k.rejectionReason,
      },
    });
  } catch (err) {
    req.log.error({ err }, "KYC status fetch failed");
    res.status(500).json({ success: false, message: "Failed to fetch KYC status" });
  }
});

export default router;

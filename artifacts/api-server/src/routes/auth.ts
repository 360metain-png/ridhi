import { Router } from "express";
import { verifyFirebaseIdToken } from "../lib/firebaseAdmin";
import { resolveProvider } from "../lib/otpConfig";

const router = Router();

const MSG91_AUTH_KEY    = process.env["MSG91_AUTH_KEY"];
const MSG91_TEMPLATE_ID = process.env["MSG91_OTP_TEMPLATE_ID"];
const PURE_DEMO_MODE    = !MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID;

// In-memory OTP store: { mobile/email → { otp, expiresAt } }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalisePhone(contact: string): string {
  const digits = contact.replace(/\D/g, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
}

// ── MSG91 helpers ──────────────────────────────────────────────────────────────

async function msg91Send(mobile: string): Promise<{ success: boolean; message: string }> {
  const body = {
    template_id: MSG91_TEMPLATE_ID,
    mobile,
    otp_length: 6,
    otp_expiry: 10,
  };

  const res = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: MSG91_AUTH_KEY!,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { type: string; message: string };
  return { success: data.type === "success", message: data.message };
}

async function msg91Verify(
  mobile: string,
  otp: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch("https://control.msg91.com/api/v5/otp/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: MSG91_AUTH_KEY!,
    },
    body: JSON.stringify({ mobile, otp }),
  });

  const data = (await res.json()) as { type: string; message: string };
  return { success: data.type === "success", message: data.message };
}

async function msg91Resend(mobile: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch("https://control.msg91.com/api/v5/otp/retry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: MSG91_AUTH_KEY!,
    },
    body: JSON.stringify({ mobile, retrytype: "text" }),
  });

  const data = (await res.json()) as { type: string; message: string };
  return { success: data.type === "success", message: data.message };
}

/** Store a local demo OTP and return the response payload */
function fallbackOtp(
  contact: string,
  log: (msg: string, obj?: object) => void,
): { success: true; demo: true; otp: string; message: string } {
  const otp = generateOtp();
  otpStore.set(contact, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
  log(`[DEMO OTP] contact=${contact} otp=${otp} — use this code on the OTP screen`);
  return { success: true, demo: true, otp, message: "OTP generated (demo mode)" };
}

// ── GET /api/auth/otp-provider ────────────────────────────────────────────────
// Tells the mobile app which OTP provider is currently active
router.get("/auth/otp-provider", (_req, res) => {
  const provider = resolveProvider();
  res.json({ provider, firebaseConfigured: !!process.env["GOOGLE_APPLICATION_CREDENTIALS"] });
});

// ── POST /api/auth/send-otp ────────────────────────────────────────────────────
router.post("/auth/send-otp", async (req, res) => {
  const { contact, type } = req.body as { contact: string; type: "phone" | "email" };

  if (!contact || !type) {
    res.status(400).json({ success: false, error: "contact and type are required" });
    return;
  }

  const provider = resolveProvider();

  // Email OTP always falls back to local demo (no SMS provider needed)
  if (type === "email") {
    const payload = fallbackOtp(contact, (msg) => req.log.info(msg));
    res.json(payload);
    return;
  }

  // Pure demo mode (no credentials at all)
  if (PURE_DEMO_MODE && provider === "msg91") {
    const payload = fallbackOtp(contact, (msg) => req.log.info(msg));
    res.json(payload);
    return;
  }

  // Firebase provider: tell client to use Firebase client SDK
  if (provider === "firebase") {
    res.json({
      success: true,
      provider: "firebase",
      message: "Use Firebase Phone Auth client SDK to send OTP",
    });
    return;
  }

  // MSG91 provider (or auto-fallback): send via MSG91
  try {
    const mobile = normalisePhone(contact);
    const result = await msg91Send(mobile);

    if (result.success) {
      req.log.info({ mobile, provider }, "OTP sent via MSG91");
      res.json({ success: true, provider: "msg91", message: "OTP sent to your mobile number" });
      return;
    }

    // MSG91 rejected → fall back to demo OTP (graceful degradation)
    req.log.warn({ contact, msg91: result.message }, "MSG91 send failed — falling back to demo OTP");
    const payload = fallbackOtp(contact, (msg) => req.log.warn(msg));
    res.json({ ...payload, provider: "demo" });
  } catch (err) {
    req.log.error({ err }, "send-otp network error — falling back to demo OTP");
    const payload = fallbackOtp(contact, (msg) => req.log.warn(msg));
    res.json({ ...payload, provider: "demo" });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post("/auth/verify-otp", async (req, res) => {
  const { contact, type, otp } = req.body as {
    contact: string;
    type: "phone" | "email";
    otp: string;
  };

  if (!contact || !type || !otp) {
    res.status(400).json({ success: false, error: "contact, type and otp are required" });
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    res.status(400).json({ success: false, error: "OTP must be a 6-digit number" });
    return;
  }

  // Always check local store first (covers demo mode and MSG91 fallbacks)
  const stored = otpStore.get(contact);
  if (stored) {
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(contact);
      res.status(400).json({ success: false, error: "OTP has expired. Please request a new one." });
      return;
    }
    if (stored.otp !== otp) {
      res.status(400).json({ success: false, error: "Incorrect OTP. Please try again." });
      return;
    }
    otpStore.delete(contact);
    req.log.info({ contact }, "OTP verified (local store)");
    res.json({ success: true, message: "OTP verified" });
    return;
  }

  // No local OTP stored — try MSG91 for live phone verification
  if (!PURE_DEMO_MODE && type === "phone") {
    try {
      const mobile = normalisePhone(contact);
      const result = await msg91Verify(mobile, otp);
      if (result.success) {
        req.log.info({ mobile }, "Phone OTP verified via MSG91");
        res.json({ success: true, message: "OTP verified" });
        return;
      }
      res.status(400).json({ success: false, error: "Incorrect OTP. Please try again." });
      return;
    } catch (err) {
      req.log.error({ err }, "verify-otp error");
      res.status(502).json({ success: false, error: "Verification failed. Please try again." });
      return;
    }
  }

  res.status(400).json({ success: false, error: "OTP expired or not found. Please request a new one." });
});

// ── POST /api/auth/firebase-verify ──────────────────────────────────────────────
// Client sends Firebase ID token after signInWithPhoneNumber succeeds.
// Backend verifies it with Firebase Admin SDK.
router.post("/auth/firebase-verify", async (req, res) => {
  const { idToken, contact } = req.body as { idToken: string; contact: string };

  if (!idToken) {
    res.status(400).json({ success: false, error: "idToken is required" });
    return;
  }

  const result = await verifyFirebaseIdToken(idToken);

  if (!result.ok) {
    req.log.warn({ contact, error: result.error }, "Firebase token verification failed");
    res.status(400).json({ success: false, error: result.error || "Invalid Firebase token" });
    return;
  }

  // Validate the phone number matches the contact
  const normalisedContact = normalisePhone(contact || "");
  const normalisedPhone = result.phone ? normalisePhone(result.phone) : "";
  if (normalisedContact && normalisedPhone && normalisedContact !== normalisedPhone) {
    req.log.warn({ contact, phone: result.phone }, "Firebase phone number mismatch");
    res.status(400).json({ success: false, error: "Phone number mismatch" });
    return;
  }

  req.log.info({ contact, uid: result.uid }, "Firebase OTP verified");
  res.json({ success: true, provider: "firebase", uid: result.uid, message: "OTP verified via Firebase" });
});

// ── POST /api/auth/resend-otp ─────────────────────────────────────────────────
router.post("/auth/resend-otp", async (req, res) => {
  const { contact, type } = req.body as { contact: string; type: "phone" | "email" };

  if (!contact || !type) {
    res.status(400).json({ success: false, error: "contact and type are required" });
    return;
  }

  if (PURE_DEMO_MODE || type === "email") {
    const payload = fallbackOtp(contact, (msg) => req.log.info(msg));
    res.json(payload);
    return;
  }

  try {
    const mobile = normalisePhone(contact);
    const result = await msg91Resend(mobile);

    if (result.success) {
      req.log.info({ mobile }, "OTP resent via MSG91");
      res.json({ success: true, message: "OTP resent to your mobile number" });
      return;
    }

    // MSG91 resend failed — fall back
    req.log.warn({ contact, msg91: result.message }, "MSG91 resend failed — falling back to demo OTP");
    const payload = fallbackOtp(contact, (msg) => req.log.warn(msg));
    res.json(payload);
  } catch (err) {
    req.log.error({ err }, "resend-otp error");
    const payload = fallbackOtp(contact, (msg) => req.log.warn(msg));
    res.json(payload);
  }
});

export default router;

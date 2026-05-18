import { Router } from "express";

const router = Router();

const MSG91_AUTH_KEY    = process.env["MSG91_AUTH_KEY"];
const MSG91_TEMPLATE_ID = process.env["MSG91_OTP_TEMPLATE_ID"];
const DEMO_MODE         = !MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID;

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

// ── POST /api/auth/send-otp ────────────────────────────────────────────────────
router.post("/auth/send-otp", async (req, res) => {
  const { contact, type } = req.body as { contact: string; type: "phone" | "email" };

  if (!contact || !type) {
    res.status(400).json({ success: false, error: "contact and type are required" });
    return;
  }

  if (DEMO_MODE) {
    // Demo mode: store a fixed OTP server-side, accept any 6-digit code on verify
    const otp = generateOtp();
    otpStore.set(contact, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    req.log.info({ contact, type, otp }, "DEMO MODE — OTP generated (check logs)");
    res.json({ success: true, demo: true, message: "OTP sent (demo mode)" });
    return;
  }

  try {
    if (type === "phone") {
      const mobile = normalisePhone(contact);
      const result = await msg91Send(mobile);
      if (!result.success) {
        req.log.warn({ contact, result }, "MSG91 send OTP failed");
        res.status(502).json({ success: false, error: result.message });
        return;
      }
      req.log.info({ mobile }, "OTP sent via MSG91");
      res.json({ success: true, message: "OTP sent to your mobile number" });
    } else {
      // Email: generate & store; send via email service (extend later)
      const otp = generateOtp();
      otpStore.set(contact, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
      req.log.info({ contact, otp }, "Email OTP generated — wire up email provider to deliver");
      res.json({ success: true, message: "OTP sent to your email address" });
    }
  } catch (err) {
    req.log.error({ err }, "send-otp error");
    res.status(502).json({ success: false, error: "Failed to send OTP. Please try again." });
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

  try {
    if (DEMO_MODE) {
      // Demo mode: verify against stored OTP
      const stored = otpStore.get(contact);
      if (!stored) {
        res.status(400).json({ success: false, error: "OTP expired or not found. Please request a new one." });
        return;
      }
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
      req.log.info({ contact }, "DEMO MODE — OTP verified successfully");
      res.json({ success: true, message: "OTP verified" });
      return;
    }

    if (type === "phone") {
      const mobile = normalisePhone(contact);
      const result = await msg91Verify(mobile, otp);
      if (!result.success) {
        req.log.warn({ mobile, result }, "MSG91 verify OTP failed");
        res.status(400).json({ success: false, error: "Incorrect OTP. Please try again." });
        return;
      }
      req.log.info({ mobile }, "Phone OTP verified via MSG91");
      res.json({ success: true, message: "OTP verified" });
    } else {
      // Email: check in-memory store
      const stored = otpStore.get(contact);
      if (!stored) {
        res.status(400).json({ success: false, error: "OTP expired or not found. Please request a new one." });
        return;
      }
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
      req.log.info({ contact }, "Email OTP verified");
      res.json({ success: true, message: "OTP verified" });
    }
  } catch (err) {
    req.log.error({ err }, "verify-otp error");
    res.status(502).json({ success: false, error: "Verification failed. Please try again." });
  }
});

// ── POST /api/auth/resend-otp ─────────────────────────────────────────────────
router.post("/auth/resend-otp", async (req, res) => {
  const { contact, type } = req.body as { contact: string; type: "phone" | "email" };

  if (!contact || !type) {
    res.status(400).json({ success: false, error: "contact and type are required" });
    return;
  }

  try {
    if (DEMO_MODE || type === "email") {
      const otp = generateOtp();
      otpStore.set(contact, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
      req.log.info({ contact, type, otp }, "OTP resent (demo/email)");
      res.json({ success: true, message: "OTP resent" });
      return;
    }

    const mobile = normalisePhone(contact);
    const result = await msg91Resend(mobile);
    if (!result.success) {
      req.log.warn({ mobile, result }, "MSG91 resend OTP failed");
      res.status(502).json({ success: false, error: result.message });
      return;
    }
    req.log.info({ mobile }, "OTP resent via MSG91");
    res.json({ success: true, message: "OTP resent to your mobile number" });
  } catch (err) {
    req.log.error({ err }, "resend-otp error");
    res.status(502).json({ success: false, error: "Failed to resend OTP. Please try again." });
  }
});

export default router;

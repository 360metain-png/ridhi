import { Router, type IRouter } from "express";
import twilio from "twilio";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not configured");
  return twilio(sid, token);
}

function getFromNumber(): string {
  const num = process.env.TWILIO_PHONE_NUMBER;
  if (!num) throw new Error("TWILIO_PHONE_NUMBER not configured");
  return num;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

async function sendSms(to: string, code: string): Promise<boolean> {
  try {
    const client = getClient();
    const from = getFromNumber();
    await client.messages.create({
      body: `Your Ridhi OTP is ${code}. Valid for 10 minutes. Do not share with anyone.`,
      from,
      to,
    });
    return true;
  } catch (err) {
    logger.error({ err, to }, "SMS send failed");
    return false;
  }
}

async function sendWhatsApp(to: string, code: string): Promise<boolean> {
  try {
    const client = getClient();
    const from = getFromNumber();
    await client.messages.create({
      body: `Your Ridhi OTP is *${code}*. Valid for 10 minutes. Do not share with anyone. 🔐`,
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
    });
    return true;
  } catch (err) {
    logger.error({ err, to }, "WhatsApp send failed");
    return false;
  }
}

router.post("/auth/send-otp", async (req, res) => {
  const { contact, type } = req.body as { contact: string; type: "phone" | "email" };

  if (!contact || !type) {
    res.status(400).json({ success: false, error: "contact and type are required" });
    return;
  }

  if (type === "email") {
    res.status(400).json({ success: false, error: "Email OTP not yet supported. Use phone." });
    return;
  }

  const phone = normalizePhone(contact);
  const code = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(phone, { code, expiresAt, attempts: 0 });

  req.log.info({ phone }, "Sending OTP");

  let sent = false;
  let channel: "sms" | "whatsapp" | null = null;

  sent = await sendWhatsApp(phone, code);
  if (sent) {
    channel = "whatsapp";
  } else {
    sent = await sendSms(phone, code);
    if (sent) channel = "sms";
  }

  if (!sent) {
    otpStore.delete(phone);
    res.status(502).json({ success: false, error: "Failed to send OTP. Please try again." });
    return;
  }

  req.log.info({ phone, channel }, "OTP sent");
  res.json({ success: true, channel, message: `OTP sent via ${channel}` });
});

router.post("/auth/verify-otp", (req, res) => {
  const { contact, code } = req.body as { contact: string; code: string };

  if (!contact || !code) {
    res.status(400).json({ success: false, error: "contact and code are required" });
    return;
  }

  const phone = normalizePhone(contact);
  const record = otpStore.get(phone);

  if (!record) {
    res.status(400).json({ success: false, error: "No OTP found. Please request a new one." });
    return;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    res.status(400).json({ success: false, error: "OTP has expired. Please request a new one." });
    return;
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(phone);
    res.status(429).json({ success: false, error: "Too many attempts. Please request a new OTP." });
    return;
  }

  if (record.code !== code.trim()) {
    const remaining = 5 - record.attempts;
    res
      .status(400)
      .json({ success: false, error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` });
    return;
  }

  otpStore.delete(phone);

  const userId = `user_${phone.replace(/\D/g, "")}_${Date.now()}`;
  req.log.info({ phone }, "OTP verified successfully");

  res.json({ success: true, userId, phone, message: "OTP verified successfully" });
});

router.post("/auth/resend-otp", async (req, res) => {
  const { contact } = req.body as { contact: string };

  if (!contact) {
    res.status(400).json({ success: false, error: "contact is required" });
    return;
  }

  const phone = normalizePhone(contact);
  const existing = otpStore.get(phone);
  if (existing && Date.now() - (existing.expiresAt - 10 * 60 * 1000) < 60 * 1000) {
    res.status(429).json({ success: false, error: "Please wait at least 1 minute before resending." });
    return;
  }

  const code = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(phone, { code, expiresAt, attempts: 0 });

  let sent = await sendWhatsApp(phone, code);
  let channel: "sms" | "whatsapp" | null = sent ? "whatsapp" : null;
  if (!sent) {
    sent = await sendSms(phone, code);
    if (sent) channel = "sms";
  }

  if (!sent) {
    otpStore.delete(phone);
    res.status(502).json({ success: false, error: "Failed to resend OTP. Please try again." });
    return;
  }

  res.json({ success: true, channel, message: "OTP resent successfully" });
});

export default router;

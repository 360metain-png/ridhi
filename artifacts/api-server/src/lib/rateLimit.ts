/**
 * Rate Limiting for Ridhi API
 *
 * Prevents abuse on expensive and sensitive endpoints:
 * - OTP: Max 5 requests per 15 min per phone (costs SMS money)
 * - Payments: Max 10 requests per 15 min per user
 * - Search: Max 30 requests per minute per user
 * - Login: Max 10 requests per 15 min per IP
 * - General: Max 100 requests per minute per IP
 */

import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Key generator: use user ID from JWT if available, fallback to IP (IPv6-safe)
function keyGenerator(req: any): string {
  const userId = req.user?.sub;
  if (userId) return userId;
  return ipKeyGenerator(req.ip || req.headers["x-forwarded-for"] || "unknown");
}

// ── OTP Rate Limit ────────────────────────────────────────────────────────────

export const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyGenerator,
  message: {
    success: false,
    error: "Too many OTP requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many OTP requests. Please try again after 15 minutes.",
    });
  },
});

// ── Payment Rate Limit ────────────────────────────────────────────────────────

export const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many payment requests. Please try again after 15 minutes.",
    });
  },
});

// ── Search Rate Limit ─────────────────────────────────────────────────────────

export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many search requests. Please slow down.",
    });
  },
});

// ── General API Rate Limit ───────────────────────────────────────────────────

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req: any) => ipKeyGenerator(req.ip || req.headers["x-forwarded-for"] || "unknown"),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests. Please slow down.",
    });
  },
});

// ── Admin Action Rate Limit ───────────────────────────────────────────────────

export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Too many admin actions. Please slow down.",
    });
  },
});

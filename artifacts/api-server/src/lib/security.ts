/**
 * Security Hardening for Ridhi API Server
 *
 * Multi-layer protection for admin/super-admin endpoints:
 * 1. Helmet security headers (CSP, HSTS, X-Frame-Options, etc.)
 * 2. Admin route-specific hardening (anti-reconnaissance, anti-crawl)
 * 3. IP-based access control (if ADMIN_ALLOWLIST_IPS is configured)
 * 4. User-agent bot detection (blocks crawlers, scrapers, AI bots)
 */

import { type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import { logger } from "./logger";

// ── Configuration ───────────────────────────────────────────────────────────

const ADMIN_ALLOWLIST_IPS = (process.env["ADMIN_ALLOWLIST_IPS"] || "")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

// Blocked user-agents (crawlers, scrapers, bots that ignore robots.txt)
const BLOCKED_USER_AGENTS = [
  // AI / LLM crawlers
  "gptbot", "chatgpt-user", "google-extended", "anthropic-ai",
  "claudebot", "claude-web", "perplexitybot", "cohere-ai",
  "diffbot", "amazonbot", "bytespider", "ccbot",
  "omgilibot", "facebookbot", "imagesiftbot", "dataforseobot",
  "petalbot", "ahrefsbot", "semrushbot", "mj12bot", "dotbot",
  "oai-searchbot",
  // Generic scrapers
  "scrapy", "scraping", "curl", "wget", "python-requests",
  "libwww", "java", "httpunit", "httpclient", "go-http-client",
  "node", "axios", "postman", "insomnia",
  // SEO audit tools
  "screaming", "sitebulb", "deepcrawl", "botify", "onpage",
];

// ── 1. Base Helmet Security Headers ──────────────────────────────────────────

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // SPA needs inline scripts
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow static assets from CDN
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

// ── 2. Admin-Specific Security Headers ──────────────────────────────────────

export function adminSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent browser from caching admin responses
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  // Strict permission policy for admin panel
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), bluetooth=(), display-capture=(), encrypted-media=(), fullscreen=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), web-share=(), xr-spatial-tracking=()"
  );

  // Anti-reconnaissance: no browser features, no autocomplete
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // HTTP-level robots blocking (applies to ALL responses including images, CSS, JS)
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, noimageindex, nosnippet");

  // Prevent prefetching / preloading of admin pages
  res.setHeader("X-DNS-Prefetch-Control", "off");

  // Mask server identity
  res.removeHeader("X-Powered-By");

  next();
}

// ── 3. Bot & Crawler Detection ──────────────────────────────────────────────

export function blockBots(req: Request, res: Response, next: NextFunction) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const path = req.path || req.url || "";

  // Only block bots on admin routes
  if (!path.startsWith("/api/admin") && !path.startsWith("/admins")) {
    return next();
  }

  const isBlocked = BLOCKED_USER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));

  if (isBlocked) {
    logger.warn({
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      path,
    }, "Blocked bot from admin route");

    res.status(403).json({
      error: "Forbidden",
      message: "Automated access is not permitted on this endpoint.",
    });
    return;
  }

  next();
}

// ── 4. IP-Based Access Control ─────────────────────────────────────────────

export function adminIpAllowlist(req: Request, res: Response, next: NextFunction) {
  // If no allowlist is configured, allow all (admin JWT still required)
  if (ADMIN_ALLOWLIST_IPS.length === 0) {
    return next();
  }

  const path = req.path || req.url || "";
  if (!path.startsWith("/api/admin")) {
    return next();
  }

  // Get client IP (handle proxies)
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    req.connection.remoteAddress ||
    "unknown";

  const isAllowed = ADMIN_ALLOWLIST_IPS.some((allowed) => {
    if (allowed.includes("/")) {
      // CIDR notation (e.g., 192.168.1.0/24)
      return isIpInCidr(clientIp, allowed);
    }
    return clientIp === allowed;
  });

  if (!isAllowed) {
    logger.warn({
      ip: clientIp,
      path,
      allowedIps: ADMIN_ALLOWLIST_IPS,
    }, "Admin access denied: IP not in allowlist");

    res.status(403).json({
      error: "Forbidden",
      message: "Admin access is restricted to authorized IP addresses.",
    });
    return;
  }

  next();
}

// Simple CIDR check (supports IPv4 only)
function isIpInCidr(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split("/");
  const mask = parseInt(bits, 10);
  if (isNaN(mask) || mask < 0 || mask > 32) return false;

  const ipInt = ipToInt(ip);
  const rangeInt = ipToInt(range);
  const maskInt = -1 << (32 - mask);

  return (ipInt & maskInt) === (rangeInt & maskInt);
}

function ipToInt(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

// ── 5. Anti-Reconnaissance (404 for admin endpoints without auth) ───────────

export function adminAntiReconnaissance(req: Request, res: Response, next: NextFunction) {
  const path = req.path || req.url || "";

  // Only for admin API endpoints
  if (!path.startsWith("/api/admin")) {
    return next();
  }

  // If the request is unauthenticated (no Bearer token), return 404 instead of 401
  // This prevents attackers from knowing admin endpoints exist
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Log the attempt but return 404
    logger.warn({
      ip: req.ip,
      path,
      userAgent: req.headers["user-agent"],
    }, "Admin endpoint probe without auth — returning 404");

    res.status(404).json({ error: "Not found" });
    return;
  }

  next();
}

// ── 6. Combined Admin Protection Middleware ───────────────────────────────────

export function protectAdminRoutes(req: Request, res: Response, next: NextFunction) {
  const path = req.path || req.url || "";

  // Only apply to admin routes
  if (!path.startsWith("/api/admin")) {
    return next();
  }

  // Chain the protections
  blockBots(req, res, (err?: any) => {
    if (err) return next(err);
    adminIpAllowlist(req, res, (err2?: any) => {
      if (err2) return next(err2);
      adminAntiReconnaissance(req, res, (err3?: any) => {
        if (err3) return next(err3);
        adminSecurityHeaders(req, res, next);
      });
    });
  });
}

// ── 7. Static Admin Panel Security (for /admins/* served by web server) ───

export function staticAdminSecurity(req: Request, res: Response, next: NextFunction) {
  const path = req.path || req.url || "";

  if (!path.startsWith("/admins")) {
    return next();
  }

  // Block bots
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const isBlocked = BLOCKED_USER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
  if (isBlocked) {
    res.status(403).send("Forbidden");
    return;
  }

  // Apply security headers
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  next();
}

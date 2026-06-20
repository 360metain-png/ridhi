import { Router } from "express";
import { logger } from "../lib/logger";
import { apiRateLimit } from "../lib/rateLimit";

const router = Router();

/**
 * Content moderation endpoint
 * POST /api/moderate
 *
 * In production, this would call OpenAI, Gemini, or a dedicated
 * moderation service (like Perspective API). For now, it does
 * server-side pattern matching with logging.
 */

type ModerationCategory = "hate" | "harassment" | "spam" | "misinformation" | "violence" | "sexual" | "copyright" | "drugs" | "safe";

interface ModerationResult {
  category: ModerationCategory;
  severity: "low" | "medium" | "high" | "critical";
  flagged: boolean;
  reasons: string[];
  confidence: number;
  suggestion?: string;
}

const PATTERNS: Record<ModerationCategory, RegExp[]> = {
  hate: [
    /\b(terrorist|jihadi|kafir|infidel|mullah|pandit|brahmin|thakur|dalit|chamar|bhangi|jaat|yadav|maratha|baniya|cheater)\b/gi,
    /\b(muslim.*terror|hindu.*terror|sikh.*terror|christian.*terror)\b/gi,
  ],
  harassment: [
    /\b(fuck|bitch|bastard|chutiya|madarchod|bhosdi|randi|loda|gandu|behenchod|lavde|chut|lund|gaand)\b/gi,
    /\b(slut|whore|rape|molest|harass|blackmail|threaten)\b/gi,
  ],
  spam: [
    /\b(click here|earn money|work from home|100% guaranteed|no investment|limited time|act now)\b/gi,
    /\b(whatsapp me|dm me|call this number|contact me)\b/gi,
  ],
  misinformation: [
    /\b(cure cancer|miracle cure|doctors don't want|cure diabetes|vaccine.*harm)\b/gi,
  ],
  violence: [
    /\b(kill|murder|attack|bomb|blast|weapon|gun|knife|acid|suicide)\b/gi,
  ],
  sexual: [
    /\b(nude|naked|porn|sex|xxx|adult|escort|call girl|hooker)\b/gi,
  ],
  copyright: [
    /\b(full movie|full song|album|pirated|torrent|download link)\b/gi,
  ],
  drugs: [
    /\b(weed|marijuana|cocaine|heroin|meth|mdma|ecstasy|dealer|supply)\b/gi,
  ],
  safe: [],
};

const SEVERITY: Record<ModerationCategory, "low" | "medium" | "high" | "critical"> = {
  hate: "critical", harassment: "high", spam: "low", misinformation: "medium",
  violence: "critical", sexual: "high", copyright: "medium", drugs: "high", safe: "low",
};

const SUGGESTIONS: Record<ModerationCategory, string> = {
  hate: "Your content contains language that could be hurtful.",
  harassment: "This language may harass or offend others.",
  spam: "This looks like promotional spam.",
  misinformation: "This content may contain unverified claims.",
  violence: "Violent content is not allowed.",
  sexual: "Sexual or explicit content is not permitted.",
  copyright: "Please ensure you have rights to share this content.",
  drugs: "Drug-related content is not allowed.",
  safe: "",
};

function moderate(text: string): ModerationResult {
  const lower = text.toLowerCase();
  const reasons: string[] = [];
  let maxCat: ModerationCategory = "safe";
  let matchCount = 0;

  for (const [cat, patterns] of Object.entries(PATTERNS)) {
    if (cat === "safe") continue;
    const category = cat as ModerationCategory;
    for (const re of patterns) {
      const matches = lower.match(re);
      if (matches && matches.length > 0) {
        matchCount += matches.length;
        reasons.push(`Found ${matches.length} ${category} match(es)`);
        if (SEVERITY[category] > SEVERITY[maxCat] || maxCat === "safe") {
          maxCat = category;
        }
      }
    }
  }

  const flagged = matchCount > 0;
  const confidence = flagged ? Math.max(0.3, Math.min(0.95, 0.3 + matchCount * 0.15)) : 0;

  return {
    category: maxCat,
    severity: SEVERITY[maxCat],
    flagged,
    reasons: reasons.slice(0, 3),
    confidence: Math.round(confidence * 100) / 100,
    suggestion: flagged ? SUGGESTIONS[maxCat] : undefined,
  };
}

router.post("/moderate", apiRateLimit, (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text : "";
  if (!text || text.length > 5000) {
    res.status(400).json({ success: false, error: "Text required, max 5000 chars" });
    return;
  }

  const result = moderate(text);
  logger.info({ category: result.category, severity: result.severity, flagged: result.flagged }, "Content moderation check");

  res.json({ success: true, result });
});

export default router;

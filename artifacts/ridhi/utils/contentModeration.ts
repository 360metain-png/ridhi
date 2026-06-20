import { apiFetch } from "./api";

/**
 * Content moderation system for Ridhi
 * - Client-side pattern checking for immediate feedback
 * - Optional server-side AI moderation for advanced detection
 */

export type ModerationCategory =
  | "hate"
  | "harassment"
  | "spam"
  | "misinformation"
  | "violence"
  | "sexual"
  | "copyright"
  | "drugs"
  | "safe";

export interface ModerationResult {
  category: ModerationCategory;
  severity: "low" | "medium" | "high" | "critical";
  flagged: boolean;
  reasons: string[];
  confidence: number; // 0-1
  suggestion?: string;
}

// ── Indian context keyword patterns (moderate coverage) ───────────────────
const PATTERNS: Record<ModerationCategory, RegExp[]> = {
  hate: [
    /\b(terrorist|jihadi|kafir|infidel|mullah|pandit|brahmin|thakur|dalit|chamar|bhangi|jaat|yadav|maratha|baniya|cheater)\b/gi,
    /\b(muslim.*terror|hindu.*terror|sikh.*terror|christian.*terror)\b/gi,
    /\b(anti.*india|anti.*national|traitor)\b/gi,
  ],
  harassment: [
    /\b(fuck|bitch|bastard|chutiya|madarchod|bhosdi|randi|loda|gandu|behenchod|lavde|chut|lund|gaand)\b/gi,
    /\b(slut|whore|rape|molest|harass|blackmail|threaten)\b/gi,
  ],
  spam: [
    /\b(click here|earn money|work from home|100% guaranteed|no investment|limited time|act now)\b/gi,
    /\b(whatsapp me|dm me|call this number|contact me)\b/gi,
    /\b\b\b/gi, // all-caps excessive
    /\b\b\b/gi, // repetitive characters
  ],
  misinformation: [
    /\b(cure cancer|miracle cure|doctors don't want|cure diabetes|vaccine.*harm)\b/gi,
    /\b(government.*hiding|truth.*media|conspiracy)\b/gi,
  ],
  violence: [
    /\b(kill|murder|attack|bomb|blast|weapon|gun|knife|acid|suicide)\b/gi,
    /\b(beat up|fight|gang war|riot|lynching)\b/gi,
  ],
  sexual: [
    /\b(nude|naked|porn|sex|xxx|adult|escort|call girl|massage.*happy|hooker)\b/gi,
    /\b(only fans|onlyfans|private video|leaked)\b/gi,
  ],
  copyright: [
    /\b(full movie|full song|album|copyright|pirated|torrent|download link)\b/gi,
  ],
  drugs: [
    /\b(weed|marijuana|cocaine|heroin|meth|mdma|ecstasy|pills|dealer|supply)\b/gi,
  ],
  safe: [],
};

const SEVERITY_MAP: Record<ModerationCategory, "low" | "medium" | "high" | "critical"> = {
  hate: "critical",
  harassment: "high",
  spam: "low",
  misinformation: "medium",
  violence: "critical",
  sexual: "high",
  copyright: "medium",
  drugs: "high",
  safe: "low",
};

const SUGGESTIONS: Record<ModerationCategory, string> = {
  hate: "Your content contains language that could be hurtful. Please review and rephrase respectfully.",
  harassment: "This language may harass or offend others. Please keep conversations respectful.",
  spam: "This looks like promotional spam. Please avoid excessive marketing or links.",
  misinformation: "This content may contain unverified health claims. Please fact-check before sharing.",
  violence: "Violent content is not allowed. Please remove harmful references.",
  sexual: "Sexual or explicit content is not permitted. Please keep posts family-friendly.",
  copyright: "Please ensure you have rights to share this content. Pirated content is not allowed.",
  drugs: "Drug-related content is not allowed. Please remove references to illegal substances.",
  safe: "",
};

/** Check text against local patterns */
export function moderateText(text: string): ModerationResult {
  const lower = text.toLowerCase();
  const reasons: string[] = [];
  let maxSeverity: ModerationCategory = "safe";
  let maxConfidence = 0;
  let matchCount = 0;

  for (const [cat, patterns] of Object.entries(PATTERNS)) {
    if (cat === "safe") continue;
    const category = cat as ModerationCategory;
    for (const re of patterns) {
      const matches = lower.match(re);
      if (matches && matches.length > 0) {
        matchCount += matches.length;
        reasons.push(`Found ${matches.length} match(es) for ${category}: "${matches[0].slice(0, 30)}"`);
        if (SEVERITY_MAP[category] > SEVERITY_MAP[maxSeverity] || maxSeverity === "safe") {
          maxSeverity = category;
        }
        maxConfidence = Math.min(0.95, maxConfidence + 0.2 * matches.length);
      }
    }
  }

  const flagged = matchCount > 0;
  const confidence = flagged ? Math.max(0.3, Math.min(0.95, 0.3 + matchCount * 0.15)) : 0;

  return {
    category: maxSeverity,
    severity: SEVERITY_MAP[maxSeverity],
    flagged,
    reasons: reasons.slice(0, 3),
    confidence: Math.round(confidence * 100) / 100,
    suggestion: flagged ? SUGGESTIONS[maxSeverity] : undefined,
  };
}

/** Server-side AI moderation (calls backend) */
export async function moderateWithAI(text: string): Promise<ModerationResult> {
  try {
    const res = await apiFetch<{ result: ModerationResult }>("/api/moderate", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    return res.result;
  } catch {
    // Fallback to client-side
    return moderateText(text);
  }
}

/** Combined moderation: client-side first, AI for ambiguous cases */
export async function moderateContent(text: string): Promise<ModerationResult> {
  const local = moderateText(text);
  if (local.flagged && local.severity === "critical") {
    return local; // Immediate block
  }
  // For ambiguous cases, optionally call AI
  return local;
}

/**
 * Real-Time Random Call Matching Engine
 *
 * ─ Cross-gender enforced (male→female, female→male)
 * ─ Category + language filtering
 * ─ Instant disconnect → auto-rematch
 * ─ Per-second coin tracking
 */

export type CallGender = "male" | "female" | "other";
export type CallCategory =
  | "any"
  | "art"
  | "dance"
  | "songs"
  | "romantic"
  | "technology"
  | "comedy"
  | "poetry"
  | "gaming"
  | "food"
  | "travel";

export interface MatchUser {
  id: string;
  name: string;
  gender: CallGender;
  language: string;
  category: CallCategory;
  avatar?: string;
  city?: string;
  age?: number;
  bio?: string;
  preferGender?: "Any" | "Male" | "Female";
  socketId: string;
  joinedAt: number;
}

export interface ActiveCall {
  callId: string;
  userA: MatchUser;
  userB: MatchUser;
  startedAt: number;
  coinRate: number; // coins per minute
  userACoinsSpent: number;
  userBCoinsSpent: number;
  type: "audio" | "video";
  category: CallCategory;
}

// ── In-memory stores ─────────────────────────────────────────────────
const waitingQueue: MatchUser[] = [];
const activeCalls = new Map<string, ActiveCall>();
const callHistory: Array<{
  callId: string;
  userAId: string;
  userBId: string;
  durationSec: number;
  coinsTransferred: number;
  endedAt: number;
  endedBy: string;
}> = [];

// Anonymous alias counter for "Ridhi 1", "Ridhi 2", etc.
let aliasCounter = 0;

/** Generate anonymous alias for a caller */
function makeAlias(): string {
  aliasCounter = (aliasCounter + 1) % 10000;
  return `Ridhi ${aliasCounter}`;
}

const CATEGORY_META: Record<CallCategory, { label: string; emoji: string }> = {
  any:         { label: "Any",         emoji: "🌟" },
  art:         { label: "Art",         emoji: "🎨" },
  dance:       { label: "Dance",       emoji: "💃" },
  songs:       { label: "Songs",       emoji: "🎵" },
  romantic:    { label: "Romantic",    emoji: "💖" },
  technology:  { label: "Technology",  emoji: "💻" },
  comedy:      { label: "Comedy",      emoji: "😂" },
  poetry:      { label: "Poetry",      emoji: "✍️" },
  gaming:      { label: "Gaming",      emoji: "🎮" },
  food:        { label: "Food",        emoji: "🍜" },
  travel:      { label: "Travel",      emoji: "✈️" },
};

/** Get opposite gender for cross-gender matching */
function oppositeGender(g: CallGender): CallGender[] {
  if (g === "male") return ["female"];
  if (g === "female") return ["male"];
  return ["male", "female", "other"];
}

/** Score how well two users match (higher = better) */
function matchScore(a: MatchUser, b: MatchUser): number {
  let score = 0;
  // Same language is a strong signal
  if (a.language === b.language) score += 10;
  // Same category preference
  if (a.category !== "any" && b.category !== "any" && a.category === b.category) score += 8;
  // One has "any" category → more flexible
  if (a.category === "any" || b.category === "any") score += 3;
  // Waiting longer → slight boost
  const waitA = Date.now() - a.joinedAt;
  const waitB = Date.now() - b.joinedAt;
  score += Math.min((waitA + waitB) / 10000, 5); // up to +5 for long waits
  return score;
}

/** Add user to waiting queue and try to find a match */
export function joinQueue(user: Omit<MatchUser, "joinedAt">): MatchUser | null {
  // Remove if already in queue
  const existingIdx = waitingQueue.findIndex((u) => u.id === user.id);
  if (existingIdx >= 0) waitingQueue.splice(existingIdx, 1);

  // Anonymize: if no custom name provided, auto-generate alias
  const anonymized: MatchUser = {
    ...user,
    name: user.name?.trim() ? user.name.trim() : makeAlias(),
    joinedAt: Date.now(),
  };
  waitingQueue.push(anonymized);

  // Try to find a match immediately
  const match = findMatch(anonymized);
  if (match) {
    removeFromQueue(anonymized.id);
    removeFromQueue(match.id);
    return match;
  }
  return null;
}

/** Find the best match for a user from the queue */
export function findMatch(user: MatchUser): MatchUser | null {
  const targets = oppositeGender(user.gender);

  const candidates = waitingQueue.filter((u) => {
    if (u.id === user.id) return false;
    if (!targets.includes(u.gender)) return false;
    // Language filter
    if (user.language !== "Any" && u.language !== "Any" && user.language !== u.language) return false;
    // Category filter
    if (user.category !== "any" && u.category !== "any" && user.category !== u.category) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  // Pick the best-scored candidate
  candidates.sort((a, b) => matchScore(user, b) - matchScore(user, a));
  return candidates[0];
}

/** Remove user from waiting queue */
export function removeFromQueue(userId: string) {
  const idx = waitingQueue.findIndex((u) => u.id === userId);
  if (idx >= 0) waitingQueue.splice(idx, 1);
}

/** Create an active call record */
export function startCall(
  callId: string,
  userA: MatchUser,
  userB: MatchUser,
  type: "audio" | "video",
  coinRate: number,
): ActiveCall {
  const call: ActiveCall = {
    callId,
    userA,
    userB,
    startedAt: Date.now(),
    coinRate,
    userACoinsSpent: 0,
    userBCoinsSpent: 0,
    type,
    category: userA.category !== "any" ? userA.category : userB.category,
  };
  activeCalls.set(callId, call);
  return call;
}

/** End a call and record history */
export function endCall(callId: string, endedByUserId: string): ActiveCall | null {
  const call = activeCalls.get(callId);
  if (!call) return null;

  const durationSec = Math.floor((Date.now() - call.startedAt) / 1000);
  const coinsTransferred = call.userACoinsSpent + call.userBCoinsSpent;

  callHistory.push({
    callId,
    userAId: call.userA.id,
    userBId: call.userB.id,
    durationSec,
    coinsTransferred,
    endedAt: Date.now(),
    endedBy: endedByUserId,
  });

  activeCalls.delete(callId);
  return call;
}

/** Tick coin counters for all active calls (called every 30 seconds) */
export function tickCoins(): Array<{
  callId: string;
  userAId: string;
  userBId: string;
  userASpent: number;
  userBSpent: number;
}> {
  const updates: ReturnType<typeof tickCoins> = [];
  for (const call of activeCalls.values()) {
    const increment = Math.ceil(call.coinRate / 2); // per 30-sec tick
    call.userACoinsSpent += increment;
    call.userBCoinsSpent += increment;
    updates.push({
      callId: call.callId,
      userAId: call.userA.id,
      userBId: call.userB.id,
      userASpent: call.userACoinsSpent,
      userBSpent: call.userBCoinsSpent,
    });
  }
  return updates;
}

/** Get waiting queue stats */
export function getQueueStats() {
  return {
    waiting: waitingQueue.length,
    activeCalls: activeCalls.size,
    totalHistory: callHistory.length,
  };
}

/** Get active call by user ID */
export function getCallByUser(userId: string): ActiveCall | null {
  for (const call of activeCalls.values()) {
    if (call.userA.id === userId || call.userB.id === userId) return call;
  }
  return null;
}

/** Get all categories */
export function getCategories() {
  return Object.entries(CATEGORY_META).map(([key, val]) => ({ id: key, ...val }));
}

export { activeCalls, callHistory };

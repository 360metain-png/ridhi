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
  acceptAudio?: boolean;
  acceptVideo?: boolean;
  socketId: string;
  joinedAt: number;
}

export interface ActiveCall {
  callId: string;
  userA: MatchUser;
  userB: MatchUser;
  startedAt: number;
  coinRate: number; // coins per minute (server-authoritative)
  userACoinsSpent: number; // display-only: shown to client for UI ticker
  userBCoinsSpent: number; // display-only: shown to client for UI ticker
  userADeducted: number;   // authoritative: actual coins deducted from wallet
  userBDeducted: number;   // authoritative: actual coins deducted from wallet
  finalized: boolean;      // guards against double-settle on disconnect+close race
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

// Debt ledger: records unpaid coins when settlement fails at call end
const callDebt: Array<{
  callId: string;
  userId: string;
  owedCoins: number;
  recordedAt: number;
  reason: string;
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
export function joinQueue(user: Omit<MatchUser, "joinedAt">, callType: "audio" | "video" = "audio"): MatchUser | null {
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
  const match = findMatch(anonymized, callType);
  if (match) {
    removeFromQueue(anonymized.id);
    removeFromQueue(match.id);
    return match;
  }
  return null;
}

/** Find the best match for a user from the queue */
export function findMatch(user: MatchUser, callType: "audio" | "video" = "audio"): MatchUser | null {
  const targets = oppositeGender(user.gender);

  const candidates = waitingQueue.filter((u) => {
    if (u.id === user.id) return false;
    if (!targets.includes(u.gender)) return false;
    // Host call type preferences — skip host if they don't accept this call type
    if (callType === "audio" && u.acceptAudio === false) return false;
    if (callType === "video" && u.acceptVideo === false) return false;
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

const AUDIO_RATE = 10;
const VIDEO_RATE = 25;

/** Resolve coin rate server-side; never trust client payload */
function resolveCoinRate(type: "audio" | "video"): number {
  return type === "audio" ? AUDIO_RATE : VIDEO_RATE;
}

/**
 * Deduct coins from user for call charges.
 * Returns { success, newBalance } or { success: false, error }.
 * Uses atomic conditional SQL to prevent double-spend.
 */
export async function deductCoinsFromUser(
  userId: string,
  amount: number,
): Promise<{ success: true; newBalance: number } | { success: false; error: string }> {
  if (amount === 0) return { success: true, newBalance: 0 }; // no-op
  if (amount < 0) {
    // Refund: add coins back unconditionally
    try {
      const { db } = await import("@workspace/db");
      const { users } = await import("@workspace/db");
      const { eq, sql } = await import("drizzle-orm");
      const result = await db.update(users)
        .set({ coins: sql`${users.coins} - ${amount}` })
        .where(eq(users.phone, userId))
        .returning({ coins: users.coins });
      if (result.length === 0) return { success: false, error: "User not found" };
      return { success: true, newBalance: result[0].coins };
    } catch {
      return { success: false, error: "Database error" };
    }
  }
  try {
    const { db } = await import("@workspace/db");
    const { users } = await import("@workspace/db");
    const { eq, and, gte, sql } = await import("drizzle-orm");
    const result = await db.update(users)
      .set({ coins: sql`${users.coins} - ${amount}` })
      .where(and(eq(users.phone, userId), gte(users.coins, amount)))
      .returning({ coins: users.coins });
    if (result.length === 0) {
      // Check if user exists or just insufficient
      const [user] = await db.select({ coins: users.coins }).from(users).where(eq(users.phone, userId));
      if (!user) return { success: false, error: "User not found" };
      return { success: false, error: "Insufficient coins" };
    }
    return { success: true, newBalance: result[0].coins };
  } catch {
    return { success: false, error: "Database error" };
  }
}

/** Create an active call record. coinRate is server-authoritative, never from client. */
export function startCall(
  callId: string,
  userA: MatchUser,
  userB: MatchUser,
  type: "audio" | "video",
  _legacyCoinRate?: number, // deprecated: ignored; server resolves from type
): ActiveCall {
  const coinRate = resolveCoinRate(type);
  const call: ActiveCall = {
    callId,
    userA,
    userB,
    startedAt: Date.now(),
    coinRate,
    userACoinsSpent: 0,
    userBCoinsSpent: 0,
    userADeducted: 0,
    userBDeducted: 0,
    finalized: false,
    type,
    category: userA.category !== "any" ? userA.category : userB.category,
  };
  activeCalls.set(callId, call);
  return call;
}

/** Pre-deduct coins at call start. Sequential with rollback on pair failure. */
export async function startCallWithDeduct(
  callId: string,
  userA: MatchUser,
  userB: MatchUser,
  type: "audio" | "video",
): Promise<{ call: ActiveCall; ok: true } | { ok: false; error: string }> {
  const rate = resolveCoinRate(type);
  const upfront = Math.max(rate, 5); // deduct 1 minute worth upfront

  // Deduct sequentially: if A fails, call cannot start. If B fails, refund A.
  const aDeduction = await deductCoinsFromUser(userA.id, upfront);
  if (!aDeduction.success) {
    return { ok: false, error: `User A failed: ${aDeduction.error}` };
  }
  const bDeduction = await deductCoinsFromUser(userB.id, upfront);
  if (!bDeduction.success) {
    // Refund A so they are not charged for a cancelled call
    await deductCoinsFromUser(userA.id, -upfront).catch(() => {});
    return { ok: false, error: `User B failed: ${bDeduction.error}` };
  }

  const call = startCall(callId, userA, userB, type);
  call.userACoinsSpent = upfront;
  call.userBCoinsSpent = upfront;
  call.userADeducted = upfront;
  call.userBDeducted = upfront;
  return { call, ok: true };
}

/**
 * Reconcile billing at call end.
 * Single source of truth: totalDue = ceil(durationSec / 60) * coinRate.
 * - If userDeducted < totalDue: charge the shortfall (debt if fails).
 * - If userDeducted > totalDue: refund the over-deduction atomically.
 * - If equal: no-op.
 */
export async function settleCall(callId: string): Promise<{ settledA: number; settledB: number } | null> {
  const call = activeCalls.get(callId);
  if (!call) return null;

  const durationSec = Math.max(1, Math.floor((Date.now() - call.startedAt) / 1000));
  const durationMin = Math.ceil(durationSec / 60);
  const totalDue = durationMin * call.coinRate;

  async function reconcileUser(userId: string, deducted: number): Promise<number> {
    const delta = totalDue - deducted; // positive = owe more; negative = over-charged
    if (delta === 0) return deducted;
    const result = await deductCoinsFromUser(userId, delta); // negative delta = refund
    if (result.success) return deducted + delta; // = totalDue
    // delta > 0 means charge failed (insufficient balance at end): record debt
    if (delta > 0) {
      callDebt.push({ callId, userId, owedCoins: delta, recordedAt: Date.now(), reason: "error" in result ? result.error : "settlement_failed" });
    }
    // delta < 0 means refund failed: log but don't penalise user (rare DB error)
    return deducted; // unchanged — keep the over-deducted amount as-is
  }

  const [finalA, finalB] = await Promise.all([
    reconcileUser(call.userA.id, call.userADeducted),
    reconcileUser(call.userB.id, call.userBDeducted),
  ]);
  call.userADeducted = finalA;
  call.userBDeducted = finalB;
  return { settledA: finalA, settledB: finalB };
}

/**
 * Idempotent call teardown: settle then end.
 * Ensures only one path settles a call, preventing double-deduction
 * on the disconnect+close race.
 */
export async function finalizeCall(callId: string, endedByUserId: string): Promise<ActiveCall | null> {
  const call = activeCalls.get(callId);
  if (!call) return null;
  if (call.finalized) return null; // already settled/ended by another path
  call.finalized = true;

  // Settle first so endCall() sees the final deducted totals
  await settleCall(callId);
  return endCall(callId, endedByUserId);
}

/** End a call and record history */
export function endCall(callId: string, endedByUserId: string): ActiveCall | null {
  const call = activeCalls.get(callId);
  if (!call) return null;

  const durationSec = Math.floor((Date.now() - call.startedAt) / 1000);
  const coinsTransferred = call.userADeducted + call.userBDeducted;

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

/**
 * Charge coins for all active calls (called every 30 seconds).
 * Deducts real wallet coins per tick; terminates calls with insufficient balance.
 * Returns UI ticker updates and a list of calls forcibly terminated due to low balance.
 */
export async function tickAndChargeCoins(): Promise<{
  updates: Array<{ callId: string; userAId: string; userBId: string; userASpent: number; userBSpent: number }>;
  terminated: Array<{ callId: string; endedBy: "insufficient_balance"; userAId: string; userBId: string; userASocketId: string; userBSocketId: string }>;
}> {
  const updates: Array<{ callId: string; userAId: string; userBId: string; userASpent: number; userBSpent: number }> = [];
  const terminated: Array<{ callId: string; endedBy: "insufficient_balance"; userAId: string; userBId: string; userASocketId: string; userBSocketId: string }> = [];

  const calls = Array.from(activeCalls.values()).filter((c) => !c.finalized);
  await Promise.all(
    calls.map(async (call) => {
      const increment = Math.ceil(call.coinRate / 2); // half a minute worth per 30s tick
      const [aResult, bResult] = await Promise.all([
        deductCoinsFromUser(call.userA.id, increment),
        deductCoinsFromUser(call.userB.id, increment),
      ]);

      // Update display-only counters unconditionally (UI stays responsive)
      call.userACoinsSpent += increment;
      call.userBCoinsSpent += increment;

      if (aResult.success) {
        call.userADeducted += increment;
      }
      if (bResult.success) {
        call.userBDeducted += increment;
      }

      const aFailed = !aResult.success;
      const bFailed = !bResult.success;

      if (aFailed || bFailed) {
        // At least one user ran out — terminate via finalizeCall so
        // settleCall() reconciliation (refund/shortfall) always runs first.
        // Capture identifiers before finalizeCall removes call from activeCalls.
        const { callId: cid, userA, userB } = call;
        // finalizeCall is idempotent; if already finalized by another path, it's a no-op.
        await finalizeCall(cid, "system_balance_cutoff");
        terminated.push({
          callId: cid,
          endedBy: "insufficient_balance",
          userAId: userA.id,
          userBId: userB.id,
          userASocketId: userA.socketId,
          userBSocketId: userB.socketId,
        });
        return; // skip UI update for this call — it's being terminated
      }

      updates.push({
        callId: call.callId,
        userAId: call.userA.id,
        userBId: call.userB.id,
        userASpent: call.userACoinsSpent,
        userBSpent: call.userBCoinsSpent,
      });
    })
  );

  return { updates, terminated };
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

export { activeCalls, callHistory, callDebt };

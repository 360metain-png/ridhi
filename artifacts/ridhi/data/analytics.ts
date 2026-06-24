import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Event Types ──
export type ScreenName =
  | "home" | "reels" | "voice_reels" | "match" | "chat" | "profile" | "user_profile" | "explore"
  | "live" | "audio_room" | "random_call" | "chatroom" | "story" | "friend_requests"
  | "create_post" | "settings" | "wallet" | "notifications" | "creator_dashboard"
  | "subscriptions" | "communities" | "report_history" | "scheduled_content"
  | "podcasts" | "vibe_stars" | "music_library" | "lead_form" | "gaming"
  | "pk_battle" | "duet" | "stitch" | "leaderboard" | "missions"
  | "creator_tools"
  | "coin_store" | "ads_manager" | "chatrooms" | "group_chat"
  | "story_viewer" | "about" | "help_support" | "withdraw"
  | "creator_marketplace" | "agent_dashboard" | "host_dashboard"
  | "ai_assistant" | "brand_post_deal" | "brand_register" | "call_persona"
  | "host_profile" | "kyc" | "my_gifts" | "referral" | "privacy_policy"
  | "terms" | "not_found" | "onboarding" | "login" | "otp" | "profile_setup";

export type EventType =
  | "session_start" | "session_end"
  | "screen_view" | "screen_exit"
  | "content_like" | "content_unlike" | "content_share" | "content_comment" | "content_save"
  | "post_create" | "reel_create" | "story_create" | "live_start" | "live_join"
  | "match_swipe_right" | "match_swipe_left" | "match_super_like" | "match_message"
  | "chat_send" | "chat_voice" | "chat_image" | "chat_gif" | "dm_open" | "dm_send"
  | "coin_recharge" | "coin_spent" | "subscription_purchase" | "withdrawal"
  | "follow" | "unfollow" | "block" | "report" | "gift_send"
  | "search" | "hashtag_click" | "community_join" | "community_leave"
  | "ad_impression" | "ad_click" | "ad_conversion";

export type ContentType = "post" | "reel" | "voice_reel" | "story" | "live" | "audio" | "chat" | "profile" | "user" | "community" | "ad" | "search" | "hashtag" | "post_download";

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  timestamp: string;
  userId: string;
  screen?: ScreenName;
  contentId?: string;
  contentType?: ContentType;
  targetUserId?: string;
  metadata?: Record<string, any>;
  durationMs?: number;
  coins?: number;
  sessionId: string;
}

export interface SessionData {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  screens: ScreenVisit[];
  events: AnalyticsEvent[];
  deviceInfo: {
    platform: string;
    os?: string;
    appVersion?: string;
  };
}

export interface ScreenVisit {
  screen: ScreenName;
  enteredAt: string;
  exitedAt?: string;
  durationMs?: number;
  events: number;
}

export interface DailySummary {
  date: string;
  userId: string;
  totalSessions: number;
  totalDurationMs: number;
  screenVisits: Record<ScreenName, number>;
  eventCounts: Partial<Record<EventType, number>>;
  topContentIds: string[];
}

const STORAGE_KEY = "ridhi_analytics_events";
const SESSION_KEY = "ridhi_analytics_session";
const SUMMARY_KEY = "ridhi_analytics_summary";

// ── Helpers ──
function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(2, 6);
}

function now(): string {
  return new Date().toISOString();
}

// ── Session Management ──
export async function startSession(userId: string): Promise<SessionData> {
  const session: SessionData = {
    id: generateId(),
    userId,
    startTime: now(),
    screens: [],
    events: [],
    deviceInfo: {
      platform: typeof navigator !== "undefined" ? "web" : "native",
    },
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  trackEventInternal({
    type: "session_start",
    userId,
    sessionId: session.id,
  });
  return session;
}

export async function endSession(userId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return;
  const session: SessionData = JSON.parse(raw);
  session.endTime = now();
  session.durationMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();

  // Close any open screen
  const lastScreen = session.screens[session.screens.length - 1];
  if (lastScreen && !lastScreen.exitedAt) {
    lastScreen.exitedAt = now();
    lastScreen.durationMs = new Date(lastScreen.exitedAt).getTime() - new Date(lastScreen.enteredAt).getTime();
  }

  // Save session to events
  await appendEvent({
    type: "session_end",
    userId,
    sessionId: session.id,
    durationMs: session.durationMs,
  });

  await AsyncStorage.removeItem(SESSION_KEY);
  await flushEvents();
}

// ── Screen Tracking ──
export async function trackScreenEnter(screen: ScreenName, userId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return;
  const session: SessionData = JSON.parse(raw);

  // Close previous screen
  const lastScreen = session.screens[session.screens.length - 1];
  if (lastScreen && !lastScreen.exitedAt) {
    lastScreen.exitedAt = now();
    lastScreen.durationMs = new Date(lastScreen.exitedAt).getTime() - new Date(lastScreen.enteredAt).getTime();
  }

  session.screens.push({
    screen,
    enteredAt: now(),
    events: 0,
  });

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

  trackEventInternal({
    type: "screen_view",
    userId,
    screen,
    sessionId: session.id,
  });
}

export async function trackScreenExit(screen: ScreenName, userId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return;
  const session: SessionData = JSON.parse(raw);

  const visit = session.screens.find(s => s.screen === screen && !s.exitedAt);
  if (visit) {
    visit.exitedAt = now();
    visit.durationMs = new Date(visit.exitedAt).getTime() - new Date(visit.enteredAt).getTime();
  }

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

  trackEventInternal({
    type: "screen_exit",
    userId,
    screen,
    sessionId: session.id,
    durationMs: visit?.durationMs,
  });
}

// ── Event Tracking ──
export async function trackEvent(params: Omit<AnalyticsEvent, "id" | "timestamp">): Promise<void> {
  trackEventInternal(params);
}

async function trackEventInternal(params: Omit<AnalyticsEvent, "id" | "timestamp">): Promise<void> {
  const event: AnalyticsEvent = {
    id: generateId(),
    timestamp: now(),
    ...params,
  };

  // Update session events count
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (raw) {
    const session: SessionData = JSON.parse(raw);
    session.events.push(event);
    const lastScreen = session.screens[session.screens.length - 1];
    if (lastScreen && !lastScreen.exitedAt) {
      lastScreen.events++;
    }
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  await appendEvent(event);
}

async function appendEvent(event: Omit<AnalyticsEvent, "id" | "timestamp"> | AnalyticsEvent): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
  events.push("id" in event ? event : { ...event, id: generateId(), timestamp: now() } as AnalyticsEvent);
  // Keep last 500 events
  if (events.length > 500) events.splice(0, events.length - 500);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// ── Content Interactions ──
export async function trackLike(contentId: string, contentType: ContentType, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "content_like", userId, contentId, contentType, sessionId });
}

export async function trackUnlike(contentId: string, contentType: ContentType, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "content_unlike", userId, contentId, contentType, sessionId });
}

export async function trackShare(contentId: string, contentType: ContentType, userId: string, sessionId: string, platform?: string): Promise<void> {
  await trackEvent({ type: "content_share", userId, contentId, contentType, sessionId, metadata: { platform } });
}

export async function trackComment(contentId: string, contentType: ContentType, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "content_comment", userId, contentId, contentType, sessionId });
}

export async function trackSave(contentId: string, contentType: ContentType, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "content_save", userId, contentId, contentType, sessionId });
}

// ── Social Interactions ──
export async function trackFollow(targetUserId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "follow", userId, targetUserId, contentType: "user", sessionId });
}

export async function trackUnfollow(targetUserId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "unfollow", userId, targetUserId, contentType: "user", sessionId });
}

export async function trackBlock(targetUserId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "block", userId, targetUserId, contentType: "user", sessionId });
}

export async function trackReport(targetUserId: string, contentId: string, contentType: ContentType, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "report", userId, targetUserId, contentId, contentType, sessionId });
}

// ── Monetization ──
export async function trackCoinRecharge(amount: number, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "coin_recharge", userId, coins: amount, sessionId });
}

export async function trackCoinSpent(amount: number, contentId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "coin_spent", userId, coins: amount, contentId, sessionId });
}

export async function trackSubscriptionPurchase(tier: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "subscription_purchase", userId, sessionId, metadata: { tier } });
}

export async function trackGiftSend(targetUserId: string, giftId: string, cost: number, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "gift_send", userId, targetUserId, sessionId, coins: cost, metadata: { giftId } });
}

// ── Dating ──
export async function trackMatchSwipe(direction: "right" | "left" | "super", targetUserId: string, userId: string, sessionId: string): Promise<void> {
  const type = direction === "right" ? "match_swipe_right" : direction === "left" ? "match_swipe_left" : "match_super_like";
  await trackEvent({ type, userId, targetUserId, contentType: "user", sessionId });
}

export async function trackMatchMessage(targetUserId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "match_message", userId, targetUserId, contentType: "user", sessionId });
}

// ── Chat ──
export async function trackDmOpen(targetUserId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "dm_open", userId, targetUserId, contentType: "user", sessionId });
}

export async function trackDmSend(targetUserId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "dm_send", userId, targetUserId, contentType: "user", sessionId });
}

export async function trackChatSend(type: "text" | "voice" | "image" | "gif" | "sticker", userId: string, sessionId: string): Promise<void> {
  const eventType = type === "text" ? "chat_send" : type === "voice" ? "chat_voice" : type === "image" ? "chat_image" : "chat_gif";
  await trackEvent({ type: eventType, userId, sessionId });
}

// ── Search ──
export async function trackSearch(query: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "search", userId, sessionId, metadata: { query } });
}

export async function trackHashtagClick(tag: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "hashtag_click", userId, sessionId, metadata: { tag } });
}

// ── Community ──
export async function trackCommunityJoin(communityId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "community_join", userId, contentId: communityId, contentType: "community", sessionId });
}

export async function trackCommunityLeave(communityId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type: "community_leave", userId, contentId: communityId, contentType: "community", sessionId });
}

// ── Content Creation ──
export async function trackContentCreate(type: "post" | "reel" | "story" | "live", userId: string, sessionId: string): Promise<void> {
  const eventType = type === "post" ? "post_create" : type === "reel" ? "reel_create" : type === "story" ? "story_create" : "live_start";
  await trackEvent({ type: eventType, userId, sessionId });
}

// ── Ad Events ──
export async function trackAdEvent(type: "ad_impression" | "ad_click" | "ad_conversion", adId: string, userId: string, sessionId: string): Promise<void> {
  await trackEvent({ type, userId, contentId: adId, contentType: "ad", sessionId });
}

// ── Retrieval ──
export async function getEvents(): Promise<AnalyticsEvent[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getCurrentSession(): Promise<SessionData | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function getDailySummary(userId: string, date?: string): Promise<DailySummary | null> {
  const raw = await AsyncStorage.getItem(SUMMARY_KEY);
  const summaries: DailySummary[] = raw ? JSON.parse(raw) : [];
  const targetDate = date || new Date().toISOString().split("T")[0];
  return summaries.find(s => s.userId === userId && s.date === targetDate) || null;
}

export async function clearEvents(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  await AsyncStorage.removeItem(SESSION_KEY);
  await AsyncStorage.removeItem(SUMMARY_KEY);
}

export async function flushEvents(): Promise<AnalyticsEvent[]> {
  const events = await getEvents();
  // In production, this would send to the backend
  // For now, just return the events
  return events;
}

// ── Batch export for admin ──
export async function exportAnalytics(): Promise<{
  events: AnalyticsEvent[];
  session: SessionData | null;
  deviceInfo: { platform: string };
}> {
  const [events, session] = await Promise.all([
    getEvents(),
    getCurrentSession(),
  ]);
  return {
    events,
    session,
    deviceInfo: { platform: typeof navigator !== "undefined" ? "web" : "native" },
  };
}

// ============================================================
// User Behavior Analytics Mock Data
// Realistic session, screen, content, and feature usage data
// for 30 users across 30 days
// ============================================================

export type UserBehaviorAnalytics = {
  userId: string;
  userName: string;
  totalSessions: number;
  totalDurationMinutes: number;
  avgSessionMinutes: number;
  engagementScore: number; // 0-100
  lastActive: string;
  screenVisits: Record<string, ScreenVisitData>;
  contentInteractions: ContentInteractionData;
  featureUsage: Record<string, number>;
  retention: Record<string, boolean>; // last 7 days
  dailyActivity: DailyActivity[];
  deviceInfo: { platform: string; os?: string };
  datingActivity: DatingActivityData;
  commerceActivity: CommerceActivityData;
  chatActivity: ChatActivityData;
};

export type ScreenVisitData = {
  visits: number;
  totalTimeSec: number;
  avgTimeSec: number;
};

export type ContentInteractionData = {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  postsCreated: number;
  reelsWatched: number;
  storiesViewed: number;
  pollsVoted: number;
  liveJoined: number;
  giftsSent: number;
  giftsReceived: number;
};

export type DailyActivity = {
  date: string;
  sessions: number;
  durationMinutes: number;
  events: number;
  likes: number;
  comments: number;
  shares: number;
  posts: number;
  reels: number;
  matches: number;
  chats: number;
  coinsEarned: number;
  coinsSpent: number;
  adsWatched: number;
};

export type DatingActivityData = {
  profilesViewed: number;
  rightSwipes: number;
  leftSwipes: number;
  superLikes: number;
  matches: number;
  messagesSent: number;
  callsMade: number;
  callsReceived: number;
  callDurationMinutes: number;
  blocks: number;
  reports: number;
};

export type CommerceActivityData = {
  coinRecharges: number;
  rechargeAmount: number;
  subscriptions: string[];
  giftsSent: number;
  giftsValue: number;
  withdrawals: number;
  withdrawalAmount: number;
  adCampaigns: number;
  adSpend: number;
  boosts: number;
  chatUnlocks: number;
};

export type ChatActivityData = {
  messagesSent: number;
  messagesReceived: number;
  conversations: number;
  voiceMessages: number;
  imagesSent: number;
  gifsSent: number;
  activeConversations: number;
  avgResponseTimeSec: number;
};

export type CohortData = {
  cohortDate: string;
  users: number;
  day0: number;
  day1: number;
  day3: number;
  day7: number;
  day14: number;
  day30: number;
};

export type FunnelData = {
  stage: string;
  users: number;
  conversionRate: number; // from previous stage
};

export type FeatureUsageData = {
  feature: string;
  activeUsers: number;
  totalEvents: number;
  avgPerUser: number;
  trend: number; // percent change
};

// ── Generate realistic mock data for 30 users ──

const SCREENS = [
  "home", "reels", "match", "chat", "profile", "explore",
  "live", "audio_room", "random_call", "chatroom", "story",
  "create_post", "settings", "wallet", "notifications", "creator_dashboard",
  "subscriptions", "communities", "report_history", "scheduled_content",
];

const FEATURES = [
  "search", "explore", "community_join", "community_leave", "community_post",
  "live_join", "live_comment", "live_gift", "live_share", "creator_dashboard",
  "wallet_open", "coin_recharge", "ad_watch", "ad_skip", "ad_complete",
  "subscription_open", "subscription_purchase", "settings_open", "language_change",
  "theme_change", "profile_boost", "chat_unlock", "gift_send", "hashtag_click",
];

const USER_NAMES = [
  "Aarav Sharma", "Diya Patel", "Vihaan Singh", "Aditi Rao", "Arjun Gupta",
  "Ananya Reddy", "Sai Kumar", "Priya Das", "Krishna Iyer", "Riya Desai",
  "Kavya Nair", "Rahul Tiwari", "Natasha Roy", "Pooja Verma", "Ishaan Mehta",
  "Meera K", "Rohit K", "Amit J", "Sneha B", "Dev P",
  "Rajesh M", "Lakshmi S", "Farhan A", "Zara K", "Nikhil G",
  "Trisha R", "Vivek N", "Sonal T", "Deepak H", "Anjali K",
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(daysAgo: number): string {
  const d = new Date(Date.now() - rand(0, daysAgo) * 86400000);
  return d.toISOString().split("T")[0];
}

function generateScreenVisits(engagementLevel: "low" | "medium" | "high" | "power"): Record<string, ScreenVisitData> {
  const baseVisits = engagementLevel === "power" ? 500 : engagementLevel === "high" ? 300 : engagementLevel === "medium" ? 150 : 50;
  const result: Record<string, ScreenVisitData> = {};
  const screens = SCREENS.filter(() => Math.random() > 0.3);
  for (const screen of screens) {
    const visits = rand(Math.floor(baseVisits * 0.05), Math.floor(baseVisits * 0.4));
    const avgTime = rand(15, screen === "reels" || screen === "live" ? 300 : 180);
    result[screen] = {
      visits,
      totalTimeSec: visits * avgTime,
      avgTimeSec: avgTime,
    };
  }
  return result;
}

function generateContentInteractions(engagementLevel: string): ContentInteractionData {
  const multiplier = engagementLevel === "power" ? 5 : engagementLevel === "high" ? 3 : engagementLevel === "medium" ? 1.5 : 0.5;
  return {
    likes: rand(Math.floor(50 * multiplier), Math.floor(500 * multiplier)),
    comments: rand(Math.floor(10 * multiplier), Math.floor(100 * multiplier)),
    shares: rand(Math.floor(5 * multiplier), Math.floor(50 * multiplier)),
    saves: rand(Math.floor(5 * multiplier), Math.floor(40 * multiplier)),
    postsCreated: rand(Math.floor(2 * multiplier), Math.floor(30 * multiplier)),
    reelsWatched: rand(Math.floor(100 * multiplier), Math.floor(800 * multiplier)),
    storiesViewed: rand(Math.floor(50 * multiplier), Math.floor(400 * multiplier)),
    pollsVoted: rand(Math.floor(5 * multiplier), Math.floor(50 * multiplier)),
    liveJoined: rand(Math.floor(5 * multiplier), Math.floor(60 * multiplier)),
    giftsSent: rand(Math.floor(0 * multiplier), Math.floor(20 * multiplier)),
    giftsReceived: rand(Math.floor(0 * multiplier), Math.floor(30 * multiplier)),
  };
}

function generateDailyActivity(engagementLevel: string): DailyActivity[] {
  const multiplier = engagementLevel === "power" ? 5 : engagementLevel === "high" ? 3 : engagementLevel === "medium" ? 1.5 : 0.5;
  const activities: DailyActivity[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const date = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendBoost = isWeekend ? 1.4 : 1;
    const sessions = rand(Math.floor(1 * multiplier * weekendBoost), Math.floor(8 * multiplier * weekendBoost));
    const durationMinutes = sessions * randFloat(3, 25 * multiplier);
    activities.push({
      date,
      sessions,
      durationMinutes: Math.round(durationMinutes * 10) / 10,
      events: Math.floor(durationMinutes * rand(2, 8)),
      likes: Math.floor(durationMinutes * randFloat(0.5, 3) * multiplier),
      comments: Math.floor(durationMinutes * randFloat(0.1, 0.8) * multiplier),
      shares: Math.floor(durationMinutes * randFloat(0.05, 0.4) * multiplier),
      posts: Math.floor(durationMinutes * randFloat(0.01, 0.1) * multiplier),
      reels: Math.floor(durationMinutes * randFloat(0.5, 2) * multiplier),
      matches: Math.floor(durationMinutes * randFloat(0.02, 0.15) * multiplier),
      chats: Math.floor(durationMinutes * randFloat(0.2, 1.5) * multiplier),
      coinsEarned: Math.floor(durationMinutes * randFloat(0.5, 3) * multiplier),
      coinsSpent: Math.floor(durationMinutes * randFloat(0.1, 1.5) * multiplier),
      adsWatched: Math.floor(durationMinutes * randFloat(0.1, 0.5) * multiplier),
    });
  }
  return activities;
}

function generateDatingActivity(engagementLevel: string): DatingActivityData {
  const multiplier = engagementLevel === "power" ? 5 : engagementLevel === "high" ? 3 : engagementLevel === "medium" ? 1.5 : 0.5;
  const profilesViewed = rand(Math.floor(50 * multiplier), Math.floor(500 * multiplier));
  const rightSwipes = Math.floor(profilesViewed * randFloat(0.15, 0.35));
  const leftSwipes = Math.floor(profilesViewed * randFloat(0.5, 0.75));
  const superLikes = Math.floor(rightSwipes * randFloat(0.02, 0.08));
  const matches = Math.floor(rightSwipes * randFloat(0.1, 0.25));
  return {
    profilesViewed,
    rightSwipes,
    leftSwipes,
    superLikes,
    matches,
    messagesSent: rand(Math.floor(10 * multiplier), Math.floor(200 * multiplier)),
    callsMade: rand(Math.floor(0), Math.floor(20 * multiplier)),
    callsReceived: rand(Math.floor(0), Math.floor(15 * multiplier)),
    callDurationMinutes: rand(Math.floor(0), Math.floor(300 * multiplier)),
    blocks: rand(0, Math.floor(5 * multiplier)),
    reports: rand(0, Math.floor(3 * multiplier)),
  };
}

function generateCommerceActivity(engagementLevel: string): CommerceActivityData {
  const multiplier = engagementLevel === "power" ? 5 : engagementLevel === "high" ? 3 : engagementLevel === "medium" ? 1.5 : 0.5;
  const coinRecharges = rand(0, Math.floor(10 * multiplier));
  const rechargeAmount = coinRecharges * rand(49, 1999);
  const subscriptions: string[] = [];
  if (Math.random() > 0.7) subscriptions.push("Silver");
  if (Math.random() > 0.85) subscriptions.push("Gold");
  if (Math.random() > 0.95) subscriptions.push("Platinum");
  const giftsSent = rand(0, Math.floor(20 * multiplier));
  const giftsValue = giftsSent * rand(10, 500);
  const withdrawals = rand(0, Math.floor(3 * multiplier));
  const withdrawalAmount = withdrawals * rand(500, 5000);
  return {
    coinRecharges,
    rechargeAmount,
    subscriptions,
    giftsSent,
    giftsValue,
    withdrawals,
    withdrawalAmount,
    adCampaigns: rand(0, Math.floor(3 * multiplier)),
    adSpend: rand(0, Math.floor(5000 * multiplier)),
    boosts: rand(0, Math.floor(10 * multiplier)),
    chatUnlocks: rand(0, Math.floor(5 * multiplier)),
  };
}

function generateChatActivity(engagementLevel: string): ChatActivityData {
  const multiplier = engagementLevel === "power" ? 5 : engagementLevel === "high" ? 3 : engagementLevel === "medium" ? 1.5 : 0.5;
  const messagesSent = rand(Math.floor(50 * multiplier), Math.floor(800 * multiplier));
  return {
    messagesSent,
    messagesReceived: Math.floor(messagesSent * randFloat(0.8, 1.2)),
    conversations: rand(Math.floor(5 * multiplier), Math.floor(50 * multiplier)),
    voiceMessages: rand(Math.floor(0), Math.floor(30 * multiplier)),
    imagesSent: rand(Math.floor(5 * multiplier), Math.floor(100 * multiplier)),
    gifsSent: rand(Math.floor(0), Math.floor(50 * multiplier)),
    activeConversations: rand(Math.floor(1 * multiplier), Math.floor(10 * multiplier)),
    avgResponseTimeSec: rand(30, 600),
  };
}

function generateFeatureUsage(engagementLevel: string): Record<string, number> {
  const multiplier = engagementLevel === "power" ? 5 : engagementLevel === "high" ? 3 : engagementLevel === "medium" ? 1.5 : 0.5;
  const result: Record<string, number> = {};
  for (const f of FEATURES) {
    if (Math.random() > 0.3) {
      result[f] = rand(Math.floor(1 * multiplier), Math.floor(50 * multiplier));
    }
  }
  return result;
}

function generateRetention(engagementLevel: string): Record<string, boolean> {
  const retention: Record<string, boolean> = {};
  const baseRate = engagementLevel === "power" ? 0.95 : engagementLevel === "high" ? 0.85 : engagementLevel === "medium" ? 0.65 : 0.35;
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 86400000);
    retention[d.toISOString().split("T")[0]] = Math.random() < baseRate;
  }
  return retention;
}

function getEngagementLevel(i: number): "low" | "medium" | "high" | "power" {
  const r = Math.random();
  if (i < 5) return r < 0.4 ? "power" : r < 0.7 ? "high" : "medium";
  if (i < 15) return r < 0.2 ? "power" : r < 0.5 ? "high" : r < 0.8 ? "medium" : "low";
  return r < 0.1 ? "high" : r < 0.4 ? "medium" : "low";
}

export const USER_BEHAVIOR_ANALYTICS: UserBehaviorAnalytics[] = Array.from({ length: 30 }, (_, i) => {
  const engagementLevel = getEngagementLevel(i);
  const dailyActivity = generateDailyActivity(engagementLevel);
  const totalSessions = dailyActivity.reduce((s, d) => s + d.sessions, 0);
  const totalDurationMinutes = dailyActivity.reduce((s, d) => s + d.durationMinutes, 0);
  const avgSessionMinutes = totalSessions > 0 ? totalDurationMinutes / totalSessions : 0;

  // Engagement score: 0-100
  const engagementScore = Math.min(100, Math.round(
    Math.min(20, totalSessions / 5) +
    Math.min(20, totalDurationMinutes / 60) +
    Math.min(15, dailyActivity.reduce((s, d) => s + d.likes, 0) / 20) +
    Math.min(15, dailyActivity.reduce((s, d) => s + d.comments, 0) / 10) +
    Math.min(15, dailyActivity.reduce((s, d) => s + d.shares, 0) / 5) +
    Math.min(15, dailyActivity.reduce((s, d) => s + d.reels, 0) / 50)
  ));

  return {
    userId: `u${i + 1}`,
    userName: USER_NAMES[i % USER_NAMES.length],
    totalSessions,
    totalDurationMinutes: Math.round(totalDurationMinutes * 10) / 10,
    avgSessionMinutes: Math.round(avgSessionMinutes * 10) / 10,
    engagementScore,
    lastActive: randomDate(7),
    screenVisits: generateScreenVisits(engagementLevel),
    contentInteractions: generateContentInteractions(engagementLevel),
    featureUsage: generateFeatureUsage(engagementLevel),
    retention: generateRetention(engagementLevel),
    dailyActivity,
    deviceInfo: { platform: Math.random() > 0.3 ? "android" : "ios", os: Math.random() > 0.5 ? "14" : "13" },
    datingActivity: generateDatingActivity(engagementLevel),
    commerceActivity: generateCommerceActivity(engagementLevel),
    chatActivity: generateChatActivity(engagementLevel),
  };
});

// ── Cohort Retention Data ──
export const COHORT_DATA: CohortData[] = Array.from({ length: 12 }, (_, i) => {
  const users = rand(200, 800);
  const d0 = 100;
  const d1 = Math.round(d0 * randFloat(0.55, 0.75));
  const d3 = Math.round(d0 * randFloat(0.35, 0.55));
  const d7 = Math.round(d0 * randFloat(0.20, 0.40));
  const d14 = Math.round(d0 * randFloat(0.12, 0.25));
  const d30 = Math.round(d0 * randFloat(0.08, 0.18));
  return {
    cohortDate: new Date(Date.now() - (30 - i * 7) * 86400000).toISOString().split("T")[0],
    users,
    day0: d0,
    day1: d1,
    day3: d3,
    day7: d7,
    day14: d14,
    day30: d30,
  };
});

// ── Funnel Data ──
export const FUNNEL_DATA: FunnelData[] = [
  { stage: "App Install", users: 10000, conversionRate: 100 },
  { stage: "Sign Up", users: 7500, conversionRate: 75 },
  { stage: "Profile Complete", users: 5200, conversionRate: 69.3 },
  { stage: "First Like", users: 3800, conversionRate: 73.1 },
  { stage: "First Comment", users: 2100, conversionRate: 55.3 },
  { stage: "First Share", users: 1200, conversionRate: 57.1 },
  { stage: "First Reel Watch", users: 6500, conversionRate: 86.7 },
  { stage: "First Match", users: 1800, conversionRate: 24.0 },
  { stage: "First Chat", users: 950, conversionRate: 52.8 },
  { stage: "First Recharge", users: 420, conversionRate: 44.2 },
  { stage: "First Subscription", users: 85, conversionRate: 20.2 },
];

// ── Feature Usage Summary ──
export const FEATURE_USAGE_SUMMARY: FeatureUsageData[] = [
  { feature: "Home Feed", activeUsers: 28500, totalEvents: 892000, avgPerUser: 31, trend: 4.2 },
  { feature: "Reels", activeUsers: 22100, totalEvents: 1250000, avgPerUser: 57, trend: 8.7 },
  { feature: "Dating Match", activeUsers: 15400, totalEvents: 456000, avgPerUser: 30, trend: -2.1 },
  { feature: "Chat", activeUsers: 18700, totalEvents: 678000, avgPerUser: 36, trend: 3.5 },
  { feature: "Live Streams", activeUsers: 8900, totalEvents: 234000, avgPerUser: 26, trend: 12.3 },
  { feature: "Communities", activeUsers: 6200, totalEvents: 89000, avgPerUser: 14, trend: 1.8 },
  { feature: "Coin Wallet", activeUsers: 12400, totalEvents: 156000, avgPerUser: 13, trend: -1.2 },
  { feature: "Ad Watch", activeUsers: 18900, totalEvents: 312000, avgPerUser: 17, trend: 15.6 },
  { feature: "Creator Dashboard", activeUsers: 2100, totalEvents: 45000, avgPerUser: 21, trend: 6.2 },
  { feature: "Audio Rooms", activeUsers: 3400, totalEvents: 56000, avgPerUser: 16, trend: 9.1 },
  { feature: "Random Calls", activeUsers: 5600, totalEvents: 78000, avgPerUser: 14, trend: -3.5 },
  { feature: "Explore", activeUsers: 11200, totalEvents: 134000, avgPerUser: 12, trend: 2.8 },
];

// ── Daily Active Users (30 days) ──
export const DAU_DATA = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(Date.now() - (29 - i) * 86400000);
  const baseDau = 18000 + Math.sin(i / 5) * 3000;
  const weekendBoost = (d.getDay() === 0 || d.getDay() === 6) ? 1.15 : 1;
  return {
    date: d.toISOString().split("T")[0].slice(5),
    dau: Math.round(baseDau * weekendBoost + rand(-500, 500)),
    newUsers: Math.round(baseDau * 0.04 * weekendBoost + rand(-50, 100)),
    returning: Math.round(baseDau * 0.96 * weekendBoost + rand(-200, 200)),
  };
});

// ── Session Distribution ──
export const SESSION_DISTRIBUTION = [
  { bucket: "0-2 min", users: 4200, pct: 21 },
  { bucket: "2-5 min", users: 6800, pct: 34 },
  { bucket: "5-10 min", users: 5200, pct: 26 },
  { bucket: "10-20 min", users: 2800, pct: 14 },
  { bucket: "20-30 min", users: 800, pct: 4 },
  { bucket: "30+ min", users: 200, pct: 1 },
];

// ── Screen Heatmap (hour x screen) ──
export const SCREEN_HEATMAP = Array.from({ length: 24 }, (_, hour) => {
  const row: Record<string, number | string> = { hour: `${hour}:00` };
  const baseActivity = Math.sin((hour - 6) / 12 * Math.PI) * 0.5 + 0.5; // peak at 6pm
  for (const screen of ["home", "reels", "match", "chat", "live", "explore", "profile"]) {
    const screenWeight =
      screen === "reels" ? 1.3 :
      screen === "match" ? 0.8 :
      screen === "live" ? 1.1 :
      screen === "chat" ? 0.9 : 1;
    row[screen] = Math.round(baseActivity * screenWeight * rand(100, 500));
  }
  return row;
});

// ── Content Type Breakdown ──
export const CONTENT_TYPE_BREAKDOWN = [
  { type: "Posts", count: 12400, engagement: 3.2, trend: 1.5 },
  { type: "Reels", count: 28700, engagement: 8.7, trend: 12.3 },
  { type: "Stories", count: 8900, engagement: 2.1, trend: -0.8 },
  { type: "Live", count: 3400, engagement: 15.2, trend: 18.5 },
  { type: "Polls", count: 1200, engagement: 4.5, trend: 3.2 },
  { type: "Audio Rooms", count: 800, engagement: 6.8, trend: 7.1 },
];

// ── Geographic Distribution ──
export const GEO_DISTRIBUTION = [
  { city: "Mumbai", users: 8400, activePct: 72, avgSessionMin: 14.2 },
  { city: "Delhi", users: 7600, activePct: 68, avgSessionMin: 12.8 },
  { city: "Bangalore", users: 6200, activePct: 75, avgSessionMin: 16.5 },
  { city: "Hyderabad", users: 4800, activePct: 65, avgSessionMin: 11.3 },
  { city: "Chennai", users: 3800, activePct: 63, avgSessionMin: 10.9 },
  { city: "Kolkata", users: 3200, activePct: 58, avgSessionMin: 9.8 },
  { city: "Pune", users: 2800, activePct: 70, avgSessionMin: 13.5 },
  { city: "Kochi", users: 2200, activePct: 62, avgSessionMin: 10.2 },
  { city: "Ahmedabad", users: 1800, activePct: 55, avgSessionMin: 8.5 },
  { city: "Jaipur", users: 1200, activePct: 60, avgSessionMin: 9.1 },
];

// Helper to get analytics for a specific user
export function getUserAnalytics(userId: string): UserBehaviorAnalytics | null {
  return USER_BEHAVIOR_ANALYTICS.find((u) => u.userId === userId) || null;
}

// Helper to aggregate all users
export function getAggregatedAnalytics() {
  const users = USER_BEHAVIOR_ANALYTICS;
  const totalUsers = users.length;
  const totalSessions = users.reduce((s, u) => s + u.totalSessions, 0);
  const totalDuration = users.reduce((s, u) => s + u.totalDurationMinutes, 0);
  const avgEngagement = users.reduce((s, u) => s + u.engagementScore, 0) / totalUsers;
  const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

  // Aggregate screen visits
  const screenTotals: Record<string, { visits: number; time: number }> = {};
  for (const u of users) {
    for (const [screen, data] of Object.entries(u.screenVisits)) {
      if (!screenTotals[screen]) screenTotals[screen] = { visits: 0, time: 0 };
      screenTotals[screen].visits += data.visits;
      screenTotals[screen].time += data.totalTimeSec;
    }
  }

  // Aggregate content interactions
  const contentTotals = {
    likes: users.reduce((s, u) => s + u.contentInteractions.likes, 0),
    comments: users.reduce((s, u) => s + u.contentInteractions.comments, 0),
    shares: users.reduce((s, u) => s + u.contentInteractions.shares, 0),
    posts: users.reduce((s, u) => s + u.contentInteractions.postsCreated, 0),
    reels: users.reduce((s, u) => s + u.contentInteractions.reelsWatched, 0),
    live: users.reduce((s, u) => s + u.contentInteractions.liveJoined, 0),
  };

  // Aggregate feature usage
  const featureTotals: Record<string, number> = {};
  for (const u of users) {
    for (const [feat, count] of Object.entries(u.featureUsage)) {
      featureTotals[feat] = (featureTotals[feat] || 0) + count;
    }
  }

  return {
    totalUsers,
    totalSessions,
    totalDuration,
    avgEngagement: Math.round(avgEngagement),
    avgSessionDuration: Math.round(avgSessionDuration * 10) / 10,
    screenTotals,
    contentTotals,
    featureTotals,
  };
}

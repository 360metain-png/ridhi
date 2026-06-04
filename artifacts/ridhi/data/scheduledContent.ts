// ── Scheduled Content Data Model ────────────────────────────────────────────────

export type ScheduledContentType =
  | "post"
  | "reel"
  | "story"
  | "live"
  | "poll"
  | "duet"
  | "stitch";

export type ScheduledStatus = "pending" | "published" | "failed" | "cancelled";

export interface ScheduledContent {
  id: string;
  type: ScheduledContentType;
  title: string;
  content: string;
  mediaUri?: string;
  hashtags: string[];
  scheduledAt: string; // ISO 8601
  status: ScheduledStatus;
  createdAt: string;
  // Meta
  audience: "public" | "followers" | "private";
  location?: string;
  feeling?: string;
  taggedPeople?: string[];
  // Content-specific
  pollOptions?: string[];
  duetWith?: { reelId: string; reelTitle: string; reelUser: string };
  stitchWith?: { reelId: string; reelTitle: string; reelUser: string; trim?: string };
  soundId?: string;
  soundTitle?: string;
  soundArtist?: string;
  // Live-specific
  liveTitle?: string;
  liveCategory?: string;
}

export const SCHEDULED_CONTENT_MOCK: ScheduledContent[] = [
  {
    id: "sch_001",
    type: "post",
    title: "Morning motivation",
    content: "Rise and shine! Today's going to be amazing ✨",
    hashtags: ["#morning", "#motivation", "#ridhi"],
    scheduledAt: new Date(Date.now() + 3600 * 1000 * 2).toISOString(), // 2 hours from now
    status: "pending",
    createdAt: new Date().toISOString(),
    audience: "public",
    location: "Mumbai",
    feeling: "😊 Happy",
  },
  {
    id: "sch_002",
    type: "reel",
    title: "Dance reel",
    content: "New trending dance 🔥",
    hashtags: ["#dance", "#trending", "#reels"],
    scheduledAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(), // tomorrow
    status: "pending",
    createdAt: new Date().toISOString(),
    audience: "followers",
    soundId: "bollywood_1",
    soundTitle: "Bollywood Beats",
    soundArtist: "DJ Ridhi",
  },
  {
    id: "sch_003",
    type: "live",
    title: "Q&A Session",
    content: "Ask me anything about content creation!",
    hashtags: ["#live", "#qa", "#creator"],
    scheduledAt: new Date(Date.now() + 3600 * 1000 * 48).toISOString(), // 2 days
    status: "pending",
    createdAt: new Date().toISOString(),
    audience: "public",
    liveTitle: "Q&A Session",
    liveCategory: "Creator Tips",
  },
  {
    id: "sch_004",
    type: "story",
    title: "Poll: Tea or Coffee?",
    content: "What's your morning fuel?",
    hashtags: ["#poll", "#morning"],
    scheduledAt: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
    status: "pending",
    createdAt: new Date().toISOString(),
    audience: "public",
    pollOptions: ["Tea ☕", "Coffee ☕"],
  },
  {
    id: "sch_005",
    type: "post",
    title: "Weekend vibes",
    content: "Weekend plans? Mine: chai + Ridhi 😌",
    hashtags: ["#weekend", "#chai", "#vibes"],
    scheduledAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // 2 hours ago (published)
    status: "published",
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    audience: "public",
  },
];

// ── Helpers ────────────────────────────────────────────────

export function isScheduledContentExpired(item: ScheduledContent): boolean {
  return new Date(item.scheduledAt) <= new Date();
}

export function timeUntilScheduled(item: ScheduledContent): string {
  const diff = new Date(item.scheduledAt).getTime() - Date.now();
  if (diff <= 0) return "Now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function formatScheduledDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export const CONTENT_TYPE_ICONS: Record<ScheduledContentType, string> = {
  post: "file-text",
  reel: "play",
  story: "circle",
  live: "radio",
  poll: "bar-chart-2",
  duet: "users",
  stitch: "git-merge",
};

export const CONTENT_TYPE_LABELS: Record<ScheduledContentType, string> = {
  post: "Post",
  reel: "Reel",
  story: "Story",
  live: "Live",
  poll: "Poll",
  duet: "Duet",
  stitch: "Stitch",
};

export const CONTENT_TYPE_COLORS: Record<ScheduledContentType, string> = {
  post: "#4A90E2",
  reel: "#E91E8C",
  story: "#FF6B35",
  live: "#FF3B30",
  poll: "#7B2FBE",
  duet: "#34C759",
  stitch: "#FFB800",
};

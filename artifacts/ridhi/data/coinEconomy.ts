export interface Gift {
  id: string;
  name: string;
  emoji: string;
  coins: number;
  category: "basic" | "premium" | "luxury" | "special";
  animated?: boolean;
  popular?: boolean;
}

export interface Mission {
  id: string;
  title: string;
  desc: string;
  icon: string;
  reward: number;
  type: "weekly" | "one_time";
  progress: number;
  total: number;
  completed: boolean;
  category: "social" | "content" | "engage" | "recharge";
}

export interface SpendCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  desc: string;
  cost: string;
  route: string;
}

export const GIFTS: Gift[] = [
  { id: "g01", name: "Hello",        emoji: "👋", coins: 1,      category: "basic",   popular: true },
  { id: "g02", name: "Rose",         emoji: "🌹", coins: 3,      category: "basic" },
  { id: "g03", name: "Heart",        emoji: "❤️", coins: 5,      category: "basic",   popular: true },
  { id: "g04", name: "Coffee",       emoji: "☕", coins: 10,     category: "basic" },
  { id: "g04b",name: "Chocolate",    emoji: "🍫", coins: 15,     category: "basic" },
  { id: "g05", name: "Bouquet",      emoji: "💐", coins: 30,     category: "premium" },
  { id: "g06", name: "Ring",         emoji: "💍", coins: 50,     category: "premium", popular: true },
  { id: "g07", name: "Crown",        emoji: "👑", coins: 100,    category: "premium" },
  { id: "g08", name: "Fireworks",    emoji: "🎆", coins: 150,    category: "premium", animated: true },
  { id: "g09", name: "Sports Car",   emoji: "🚗", coins: 300,    category: "luxury",  popular: true },
  { id: "g10", name: "Yacht",        emoji: "🛥️", coins: 600,    category: "luxury" },
  { id: "g11", name: "Private Jet",  emoji: "✈️", coins: 1200,   category: "luxury" },
  { id: "g12", name: "Rocket",       emoji: "🚀", coins: 2000,   category: "luxury",  animated: true },
  { id: "g13", name: "Castle",       emoji: "🏰", coins: 3500,   category: "luxury",  popular: true },
  { id: "g14", name: "Galaxy",       emoji: "🌌", coins: 5000,   category: "luxury",  animated: true },
  { id: "g15", name: "Lucky Diya",   emoji: "🪔", coins: 5,      category: "special", popular: true },
  { id: "g16", name: "Fireworks",    emoji: "🎇", coins: 8,      category: "special" },
  { id: "g17", name: "Garland",      emoji: "💫", coins: 10,     category: "special" },
  { id: "g18", name: "Peacock",      emoji: "🦚", coins: 50,     category: "special", popular: true },
  { id: "g19", name: "Elephant",     emoji: "🐘", coins: 100,    category: "special" },
  { id: "g20", name: "Om",           emoji: "🕉️", coins: 25,     category: "special" },
];

export const GIFT_CATEGORIES = [
  { id: "all",     label: "All" },
  { id: "basic",   label: "Basic" },
  { id: "premium", label: "Premium" },
  { id: "luxury",  label: "Luxury" },
  { id: "special", label: "India Special" },
];

export const AD_REWARDS = [
  { id: "ad1", title: "Watch 15s Ad",    desc: "Watch a short video ad",          icon: "play-circle", reward: 2,  type: "ad", cooldown: 30,   category: "engage" },
  { id: "ad2", title: "Watch 30s Ad",    desc: "Watch a full video ad",          icon: "video",       reward: 5,  type: "ad", cooldown: 60,   category: "engage" },
  { id: "ad3", title: "Install App",     desc: "Install and open a promoted app", icon: "download",    reward: 20, type: "ad", cooldown: 1440, category: "engage" },
  { id: "ad4", title: "Survey Complete",  desc: "Complete a quick survey",        icon: "file-text",   reward: 15, type: "ad", cooldown: 1440, category: "engage" },
  { id: "ad5", title: "Interstitial Ad", desc: "Watch an interstitial ad",      icon: "monitor",     reward: 3,  type: "ad", cooldown: 15,   category: "engage" },
];

export const MISSIONS: Mission[] = [
  { id: "m09", title: "Create a Post",      desc: "Post original content this week",            icon: "edit-2",     reward: 3,   type: "weekly",   progress: 0, total: 1,  completed: false, category: "content" },
  { id: "m10", title: "Host a Live",        desc: "Start a live stream this week",              icon: "radio",      reward: 5,   type: "weekly",   progress: 0, total: 1,  completed: false, category: "content" },
  { id: "m11", title: "Get 50 Likes",       desc: "Collect 50 likes on your posts this week",   icon: "thumbs-up",  reward: 5,   type: "weekly",   progress: 12, total: 50, completed: false, category: "social" },
  { id: "m12", title: "Refer 1 Friend",     desc: "Invite a friend who joins & recharges",      icon: "user-plus",  reward: 25,  type: "weekly",   progress: 0, total: 1,  completed: false, category: "social" },
  { id: "m13", title: "Join a Community",   desc: "Join any community this week",               icon: "users",      reward: 2,   type: "weekly",   progress: 0, total: 1,  completed: false, category: "engage" },
  { id: "m14", title: "Listen to Podcast",  desc: "Listen to a full episode this week",         icon: "headphones", reward: 3,   type: "weekly",   progress: 0, total: 1,  completed: false, category: "engage" },

  { id: "m15", title: "First Recharge",     desc: "Recharge coins for the first time",         icon: "zap",        reward: 5,   type: "one_time", progress: 0, total: 1,  completed: false, category: "recharge" },
  { id: "m16", title: "Complete KYC",       desc: "Verify your identity to unlock all features",icon: "shield",     reward: 10,  type: "one_time", progress: 0, total: 1,  completed: false, category: "social" },
  { id: "m17", title: "Profile Setup",      desc: "Add photo, bio, and 5 interests",            icon: "user",       reward: 2,   type: "one_time", progress: 1, total: 1,  completed: true,  category: "social" },
  { id: "m18", title: "First Super Like",   desc: "Send your first Super Like",                icon: "star",       reward: 2,   type: "one_time", progress: 0, total: 1,  completed: false, category: "engage" },
  { id: "m19", title: "First Gift Sent",    desc: "Send your very first gift to a creator",    icon: "gift",       reward: 2,   type: "one_time", progress: 0, total: 1,  completed: false, category: "social" },
  { id: "m20", title: "VIP Upgrade",        desc: "Subscribe to any VIP plan",                 icon: "award",      reward: 25,  type: "one_time", progress: 0, total: 1, completed: false, category: "recharge" },
];

export const SPEND_CATEGORIES: SpendCategory[] = [
  { id: "sc1", label: "Super Like",       icon: "star",         color: "#FFB800", desc: "Stand out in dating",        cost: "5 coins",            route: "/(tabs)/match" },
  { id: "sc1b", label: "Backtrack",       icon: "corner-up-left", color: "#FF8F00", desc: "Undo last swipe",           cost: "1 coin",              route: "/(tabs)/match" },
  { id: "sc2", label: "Send Gift",        icon: "gift",         color: "#E91E8C", desc: "Gift hosts & creators",      cost: "From 1 coin",         route: "/coin-store" },
  { id: "sc3", label: "Boost Post",       icon: "trending-up",  color: "#7B2FBE", desc: "Reach 10× more people",     cost: "50 coins/hr",         route: "/create-post" },
  { id: "sc4", label: "VIP Badge",        icon: "award",        color: "#F59E0B", desc: "Stand out everywhere",       cost: "From 49/month",       route: "/subscription" },
  { id: "sc5", label: "Audio Call",       icon: "phone",        color: "#3B82F6", desc: "Call any host live",         cost: "15 coins/min",        route: "/random-call" },
  { id: "sc6", label: "Video Call",       icon: "video",        color: "#10B981", desc: "Face-to-face with hosts",    cost: "40 coins/min",        route: "/random-call" },
  { id: "sc7", label: "Unlock Message",   icon: "lock",         color: "#8B5CF6", desc: "Read locked DMs",            cost: "50 coins",            route: "/(tabs)/chat" },
  { id: "sc8", label: "AI Assistant",     icon: "zap",          color: "#06B6D4", desc: "AI-powered features",        cost: "10 coins/query",      route: "/ai-assistant" },
  { id: "sc9", label: "Download",         icon: "download",     color: "#34C759", desc: "Download videos & posts",  cost: "3-20 coins",          route: "/(tabs)/reels" },
  { id: "sc10", label: "Ridhi Shop",       icon: "shopping-bag", color: "#FF6B35", desc: "Buy products & deals",       cost: "Varies",              route: "/shop" },
  { id: "sc11", label: "Event Creation",   icon: "calendar",     color: "#06B6D4", desc: "Create & host events",       cost: "50 coins",            route: "/events" },
  { id: "sc12", label: "Broadcast",        icon: "radio",        color: "#7B2FBE", desc: "Start broadcast channels",   cost: "20 coins",            route: "/broadcast" },
];

export type ContentType = "reel" | "post" | "story" | "live" | "audio" | "post_download";

export interface DownloadPrice {
  type: ContentType;
  price: number;
  label: string;
}

export const DOWNLOAD_PRICING: Record<ContentType, DownloadPrice> = {
  reel:          { type: "reel",          price: 5,  label: "Reel" },
  post:          { type: "post",          price: 10, label: "Post" },
  post_download: { type: "post_download", price: 10, label: "Post Download" },
  story:         { type: "story",         price: 3,  label: "Story" },
  live:          { type: "live",          price: 20, label: "Live Recording" },
  audio:         { type: "audio",         price: 8,  label: "Audio Room" },
};

export const REVENUE_SPLIT = {
  creator: 0.6,
  platform: 0.4,
};

export const COIN_RATE_INR = 1.00;

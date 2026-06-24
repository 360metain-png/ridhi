import { useState } from "react";
import OTPProviderCard from "@/pages/otp-provider-card";
import PaymentProviderCard from "@/pages/payment-provider-card";
import RandomCallAdminCard from "@/pages/random-call-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { downloadCSV } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  Shield, Users, Server, Activity, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Lock, Globe, Database, Cpu, Wifi, CreditCard, Eye, EyeOff,
  Star, Briefcase, Key, UserCheck, UserX, Clock, ShieldCheck,
  Zap, Link, Code, Webhook, ToggleRight, Copy, RotateCcw, PlusCircle, UserPlus,
  Bell, MessageSquare, Mail, Smartphone, BarChart2, CloudLightning,
  Gamepad2, Flame, Heart, Video, Camera, Phone, Radio, ShoppingBag, Film, Rocket,
  Languages, Layers, Megaphone, MessageCircle, Coins, IndianRupee,
  Percent, GitMerge, CheckSquare, Settings2, Save, TestTube,
  PhoneCall, Mic, Cast, SlidersHorizontal, ClipboardCheck, BadgeCheck,
  Banknote, ArrowRightLeft, Sliders, Wallet,
  LayoutTemplate, TrendingUp, MousePointer, Pause, Play, Target,
  Monitor, Palette, ArrowRight, Sparkles, Search, Crown, Trash2, Download,
  Bookmark, Image, HelpCircle, Calendar, Radio as RadioIcon,
  Award, EyeOff as EyeOffIcon, TrendingUp as TrendingUpIcon, MapPin,
  Smile, Star as StarIcon} from "lucide-react";

const ADMIN_ROLES = [
  { id: 1, name: "Arjun Mehta", email: "arjun@ridhi.app", role: "Super Admin", status: "active", lastLogin: "2 min ago", permissions: "all" },
  { id: 2, name: "Sneha Patel", email: "sneha@ridhi.app", role: "Content Admin", status: "active", lastLogin: "1h ago", permissions: "content,users" },
  { id: 3, name: "Rohit Kumar", email: "rohit@ridhi.app", role: "Finance Admin", status: "active", lastLogin: "3h ago", permissions: "revenue,payouts" },
  { id: 4, name: "Priya Nair", email: "priya@ridhi.app", role: "Support Admin", status: "inactive", lastLogin: "2d ago", permissions: "users,reports" },
  { id: 5, name: "Vikash Singh", email: "vikash@ridhi.app", role: "Marketing Admin", status: "active", lastLogin: "30m ago", permissions: "marketing,analytics" },
];

const SUPER_ADMIN_USERS = [
  { id: "u1", name: "Rahul Sharma", phone: "+91 98765 43210", city: "Mumbai", status: "active", role: "user", joined: "2 days ago", coins: 12500 },
  { id: "u2", name: "Priya Patel", phone: "+91 87654 32109", city: "Delhi", status: "active", role: "vip", joined: "1 month ago", coins: 89000 },
  { id: "u3", name: "Amit Kumar", phone: "+91 76543 21098", city: "Bangalore", status: "banned", role: "user", joined: "3 months ago", coins: 0 },
  { id: "u4", name: "Sneha Gupta", phone: "+91 65432 10987", city: "Chennai", status: "active", role: "creator", joined: "2 weeks ago", coins: 45000 },
  { id: "u5", name: "Vikram Rao", phone: "+91 54321 09876", city: "Hyderabad", status: "suspended", role: "user", joined: "5 months ago", coins: 3200 },
  { id: "u6", name: "Ananya Krishnan", phone: "+91 43210 98765", city: "Kochi", status: "active", role: "host", joined: "1 month ago", coins: 6200000 },
  { id: "u7", name: "Karan Malhotra", phone: "+91 32109 87654", city: "Pune", status: "active", role: "user", joined: "4 days ago", coins: 500 },
  { id: "u8", name: "Neha Iyer", phone: "+91 21098 76543", city: "Jaipur", status: "active", role: "vip", joined: "3 weeks ago", coins: 67000 },
];

const HOSTS_WITH_ACCESS = [
  { id: "h1", name: "Priya Sharma", email: "host.priya@ridhi.app", level: "L5", levelLabel: "VIP", coins: 380000, access: true, lastLogin: "5m ago", sessions: 3, city: "Mumbai", joinedAdmin: "3 months ago" },
  { id: "h2", name: "Rahul Verma", email: "host.rahul@ridhi.app", level: "L6", levelLabel: "Diamond", coins: 920000, access: true, lastLogin: "1h ago", sessions: 1, city: "Delhi", joinedAdmin: "5 months ago" },
  { id: "h3", name: "Ananya Krishnan", email: "host.ananya@ridhi.app", level: "L7", levelLabel: "Royal Crown", coins: 6200000, access: true, lastLogin: "12m ago", sessions: 2, city: "Bangalore", joinedAdmin: "8 months ago" },
  { id: "h4", name: "Karan Malhotra", email: "host.karan@ridhi.app", level: "L4", levelLabel: "Gold", coins: 125000, access: true, lastLogin: "3h ago", sessions: 1, city: "Hyderabad", joinedAdmin: "2 months ago" },
  { id: "h5", name: "Neha Gupta", email: "host.neha@ridhi.app", level: "L5", levelLabel: "VIP", coins: 410000, access: true, lastLogin: "30m ago", sessions: 1, city: "Chennai", joinedAdmin: "4 months ago" },
  { id: "h6", name: "Arjun Nair", email: "host.arjun@ridhi.app", level: "L3", levelLabel: "Silver", coins: 68000, access: false, lastLogin: "2d ago", sessions: 0, city: "Pune", joinedAdmin: "—" },
  { id: "h7", name: "Divya Pillai", email: "host.divya@ridhi.app", level: "L6", levelLabel: "Diamond", coins: 1100000, access: true, lastLogin: "8m ago", sessions: 2, city: "Kolkata", joinedAdmin: "6 months ago" },
  { id: "h8", name: "Suresh Kumar", email: "host.suresh@ridhi.app", level: "L2", levelLabel: "Bronze+", coins: 28000, access: false, lastLogin: "1w ago", sessions: 0, city: "Jaipur", joinedAdmin: "—" },
];

const AGENTS_WITH_ACCESS = [
  { id: "a1", name: "Vivek Sharma", email: "agent.vivek@ridhi.app", level: "A4", levelLabel: "Senior Agent", hosts: 180, commission: "8%", access: true, lastLogin: "15m ago", sessions: 2, city: "Mumbai", joinedAdmin: "6 months ago" },
  { id: "a2", name: "Meera Iyer", email: "agent.meera@ridhi.app", level: "A5", levelLabel: "Master Agent", hosts: 260, commission: "10%", access: true, lastLogin: "3m ago", sessions: 4, city: "Bangalore", joinedAdmin: "1 year ago" },
  { id: "a3", name: "Ajay Patel", email: "agent.ajay@ridhi.app", level: "A3", levelLabel: "Mid Agent", hosts: 90, commission: "6%", access: true, lastLogin: "45m ago", sessions: 1, city: "Ahmedabad", joinedAdmin: "4 months ago" },
  { id: "a4", name: "Pooja Nair", email: "agent.pooja@ridhi.app", level: "A2", levelLabel: "Junior Agent", hosts: 35, commission: "4%", access: false, lastLogin: "1d ago", sessions: 0, city: "Kochi", joinedAdmin: "—" },
  { id: "a5", name: "Rahul Singh", email: "agent.rahul@ridhi.app", level: "A3", levelLabel: "Mid Agent", hosts: 120, commission: "6%", access: true, lastLogin: "2h ago", sessions: 1, city: "Delhi", joinedAdmin: "7 months ago" },
];

const SERVER_HEALTH = [
  { name: "API Server", status: "healthy", uptime: "99.97%", responseTime: "42ms", load: 34 },
  { name: "WebSocket Server", status: "healthy", uptime: "99.91%", responseTime: "18ms", load: 61 },
  { name: "Media CDN", status: "healthy", uptime: "100%", responseTime: "22ms", load: 45 },
  { name: "PostgreSQL DB", status: "healthy", uptime: "99.99%", responseTime: "8ms", load: 28 },
  { name: "Redis Cache", status: "warning", uptime: "99.82%", responseTime: "3ms", load: 78 },
  { name: "Push Notifications", status: "healthy", uptime: "99.95%", responseTime: "95ms", load: 22 },
];

const API_LOGS = [
  { method: "GET", path: "/api/feed", status: 200, time: "38ms", count: "142K/h" },
  { method: "POST", path: "/api/posts", status: 201, time: "124ms", count: "8.2K/h" },
  { method: "GET", path: "/api/match", status: 200, time: "56ms", count: "24K/h" },
  { method: "POST", path: "/api/coins/recharge", status: 200, time: "892ms", count: "1.1K/h" },
  { method: "DELETE", path: "/api/reports/:id", status: 200, time: "44ms", count: "340/h" },
];

const PAYMENT_GATEWAYS = [
  { name: "Razorpay", status: "active", successRate: 98.4, txToday: "₹2.4L", icon: CreditCard, color: "text-blue-600" },
  { name: "UPI Direct", status: "active", successRate: 99.1, txToday: "₹1.8L", icon: Globe, color: "text-green-600" },
  { name: "Google Pay", status: "active", successRate: 97.8, txToday: "₹0.9L", icon: CreditCard, color: "text-emerald-600" },
  { name: "PhonePe", status: "maintenance", successRate: 0, txToday: "₹0", icon: CreditCard, color: "text-purple-600" },
];

const SECURITY_ALERTS = [
  { severity: "low", message: "12 failed login attempts from IP 203.x.x.x", time: "5 min ago" },
  { severity: "medium", message: "Unusual spike in API calls from new account cluster", time: "23 min ago" },
  { severity: "low", message: "3 accounts flagged for coordinated inauthentic behavior", time: "1h ago" },
  { severity: "high", message: "Payment anomaly detected: 47 micro-transactions in 2 minutes", time: "2h ago" },
];

const PLATFORM_APIS = [
  { id: "feed", name: "Feed API", path: "/api/feed", category: "Core", status: "active", version: "v2", calls: "142K/h", latency: "38ms", enabled: true },
  { id: "auth", name: "Auth API", path: "/api/auth", category: "Core", status: "active", version: "v2", calls: "38K/h", latency: "55ms", enabled: true },
  { id: "match", name: "Match/Dating API", path: "/api/match", category: "Core", status: "active", version: "v1", calls: "24K/h", latency: "56ms", enabled: true },
  { id: "posts", name: "Posts API", path: "/api/posts", category: "Content", status: "active", version: "v2", calls: "8.2K/h", latency: "124ms", enabled: true },
  { id: "reels", name: "Reels API", path: "/api/reels", category: "Content", status: "active", version: "v1", calls: "19K/h", latency: "88ms", enabled: true },
  { id: "stories", name: "Stories API", path: "/api/stories", category: "Content", status: "active", version: "v1", calls: "11K/h", latency: "42ms", enabled: true },
  { id: "chat", name: "Chat & Messaging API", path: "/api/chat", category: "Social", status: "active", version: "v2", calls: "65K/h", latency: "22ms", enabled: true },
  { id: "calls", name: "Audio/Video Calls API", path: "/api/calls", category: "Social", status: "active", version: "v1", calls: "3.4K/h", latency: "210ms", enabled: true },
  { id: "coins", name: "Coins & Wallet API", path: "/api/coins", category: "Finance", status: "active", version: "v2", calls: "5.8K/h", latency: "67ms", enabled: true },
  { id: "wallet", name: "Wallet API", path: "/api/wallet", category: "Finance", status: "active", version: "v2", calls: "3.2K/h", latency: "42ms", enabled: true },
  { id: "plan", name: "Plan Subscribe API", path: "/api/plan", category: "Finance", status: "active", version: "v2", calls: "1.1K/h", latency: "55ms", enabled: true },
  { id: "payouts", name: "Payouts API", path: "/api/payouts", category: "Finance", status: "active", version: "v1", calls: "320/h", latency: "890ms", enabled: true },
  { id: "notifications", name: "Notifications API", path: "/api/notifications", category: "Platform", status: "active", version: "v1", calls: "88K/h", latency: "95ms", enabled: true },
  { id: "kyc", name: "KYC / E-Verify API", path: "/api/kyc", category: "Platform", status: "active", version: "v1", calls: "210/h", latency: "1.2s", enabled: true },
  { id: "search", name: "Search & Explore API", path: "/api/search", category: "Content", status: "active", version: "v1", calls: "33K/h", latency: "74ms", enabled: true },
  { id: "admin", name: "Admin API", path: "/api/admin", category: "Core", status: "active", version: "v1", calls: "4.1K/h", latency: "48ms", enabled: true },
  { id: "live", name: "Live Stream API", path: "/api/live", category: "Social", status: "active", version: "v1", calls: "1.8K/h", latency: "330ms", enabled: true },
  { id: "games", name: "Gaming API", path: "/api/games", category: "Platform", status: "inactive", version: "v1", calls: "0/h", latency: "—", enabled: false },
  { id: "ai", name: "AI & Moderation API", path: "/api/ai", category: "AI", status: "active", version: "v1", calls: "9.5K/h", latency: "340ms", enabled: true },
  { id: "analytics", name: "Analytics API", path: "/api/analytics", category: "AI", status: "active", version: "v1", calls: "2.1K/h", latency: "88ms", enabled: true },
];

const INTEGRATIONS = [
  {
    category: "Payments",
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: [
      { name: "Razorpay", desc: "Primary payment gateway — UPI, cards, netbanking", icon: CreditCard, status: "active", keyMasked: "rzp_live_••••••••K7xQ", enabled: true },
      { name: "Cashfree", desc: "Alternative gateway — low TDR, auto-collect", icon: Wallet, status: "active", keyMasked: "CF_••••••••••••", enabled: true },
      { name: "PhonePe", desc: "Flipkart-owned — massive UPI market share", icon: Smartphone, status: "active", keyMasked: "ppe_••••••••••3nXp", enabled: true },
      { name: "Instamojo", desc: "SME-friendly — links, subscriptions, payouts", icon: Globe, status: "active", keyMasked: "IJ_••••••••••••", enabled: true },
    ],
  },
  {
    category: "Messaging & Notifications",
    color: "text-green-600",
    bg: "bg-green-50",
    items: [
      { name: "Firebase Cloud Messaging", desc: "Push notifications (Android & iOS)", icon: Bell, status: "active", keyMasked: "AIza••••••••••••••Mx9", enabled: true },
      { name: "MSG91 SMS", desc: "OTP via MSG91 gateway (India)", icon: MessageSquare, status: "active", keyMasked: "AC••••••••••••••••9f", enabled: true },
      { name: "Firebase Auth", desc: "OTP via Firebase Phone Auth", icon: Smartphone, status: "active", keyMasked: "Google-managed", enabled: true },
      { name: "SendGrid Email", desc: "Transactional email (OTP, receipts)", icon: Mail, status: "active", keyMasked: "SG.••••••••••••••••Kp", enabled: true },
    ],
  },
  {
    category: "Cloud & Storage",
    color: "text-orange-600",
    bg: "bg-orange-50",
    items: [
      { name: "AWS S3", desc: "Media & asset storage (photos, videos)", icon: Database, status: "active", keyMasked: "AKIA••••••••••••••7L", enabled: true },
      { name: "Cloudflare CDN", desc: "Global content delivery & DDoS protection", icon: CloudLightning, status: "active", keyMasked: "cf_••••••••••••••••Rq", enabled: true },
    ],
  },
  {
    category: "Analytics & AI",
    color: "text-purple-600",
    bg: "bg-purple-50",
    items: [
      { name: "Google Analytics 4", desc: "App usage analytics & funnel tracking", icon: BarChart2, status: "active", keyMasked: "G-••••••••••••••••J3", enabled: true },
      { name: "OpenAI / GPT", desc: "AI moderation, captions & content tools", icon: Zap, status: "active", keyMasked: "sk-••••••••••••••••T8", enabled: true },
    ],
  },
  {
    category: "Communication & Auth",
    color: "text-pink-600",
    bg: "bg-pink-50",
    items: [
      { name: "Google Sign-In", desc: "OAuth 2.0 social login", icon: Globe, status: "active", keyMasked: "438••••••••••••••apps.googleusercontent.com", enabled: true },
      { name: "Agora RTC", desc: "Real-time audio/video calling infrastructure", icon: Wifi, status: "active", keyMasked: "agr_••••••••••••••••8X", enabled: true },
    ],
  },
];

const WEBHOOKS = [
  { name: "Payment Success", url: "https://api.ridhi.app/webhooks/payment", events: ["payment.success", "payment.failed"], active: true, lastTriggered: "2 min ago" },
  { name: "KYC Verification", url: "https://api.ridhi.app/webhooks/kyc", events: ["kyc.approved", "kyc.rejected"], active: true, lastTriggered: "4h ago" },
  { name: "Content Moderation", url: "https://api.ridhi.app/webhooks/moderation", events: ["content.flagged", "content.removed"], active: true, lastTriggered: "18 min ago" },
  { name: "Payout Processed", url: "https://api.ridhi.app/webhooks/payout", events: ["payout.sent", "payout.failed"], active: true, lastTriggered: "1h ago" },
  { name: "New Registration", url: "https://api.ridhi.app/webhooks/signup", events: ["user.created", "user.verified"], active: false, lastTriggered: "3d ago" },
];

type FeatureStatus = "live" | "beta" | "testing" | "disabled";
interface AppFeature {
  id: string; name: string; desc: string;
  phase: string; audience: string; status: FeatureStatus; enabled: boolean;
}
interface FeatureCategory {
  id: string; category: string; icon: React.ComponentType<{ className?: string }>;
  color: string; bg: string; borderColor: string; features: AppFeature[];
}

const FEATURE_FLAGS: FeatureCategory[] = [
  {
    id: "core", category: "Core & Authentication",
    icon: Shield, color: "text-purple-600", bg: "bg-purple-50", borderColor: "border-purple-200",
    features: [
      { id: "onboarding",    name: "Onboarding Carousel",    desc: "3-slide welcome flow shown to new users on first launch",                        phase: "1", audience: "New Users",      status: "live",  enabled: true  },
      { id: "otp-login",    name: "Phone OTP Login",         desc: "6-digit OTP via SMS — primary login method for Indian users",                    phase: "1", audience: "All Users",      status: "live",  enabled: true  },
      { id: "email-login",  name: "Email Login",             desc: "Email + password authentication alternative",                                   phase: "1", audience: "All Users",      status: "live",  enabled: true  },
      { id: "profile-setup",name: "Profile Setup Wizard",    desc: "4-step onboarding: name, age/gender, city, interests",                          phase: "1", audience: "New Users",      status: "live",  enabled: true  },
      { id: "guest-access", name: "Guest Browse Mode",       desc: "Limited feed browsing without creating an account",                             phase: "2", audience: "Guests",         status: "beta",  enabled: false },
    ],
  },
  {
    id: "feed", category: "Feed & Content",
    icon: Layers, color: "text-blue-600", bg: "bg-blue-50", borderColor: "border-blue-200",
    features: [
      { id: "home-feed",    name: "Home Feed",               desc: "Main feed with For You / Trending / Local / Following / Community tabs",        phase: "1", audience: "All Users",      status: "live",  enabled: true  },
      { id: "stories",      name: "Stories",                 desc: "24-hour disappearing stories with animated progress bar viewer",                phase: "1", audience: "All Users",      status: "live",  enabled: true  },
      { id: "reels",        name: "Reels (Vertical Video)",  desc: "TikTok-style full-screen vertical video feed with loop playback",               phase: "1", audience: "All Users",      status: "live",  enabled: true  },
      { id: "create-post",  name: "Create Post (6 types)",   desc: "Text, photo, video, reel, story, poll — with hashtag suggestions",             phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "explore",      name: "Explore & Search",        desc: "Trending posts grid, suggested users, trending hashtags",                      phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "communities",  name: "Communities",             desc: "Browse & join communities — 10 categories, join/leave, member count",          phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "saved-posts",  name: "Saved Posts & Collections", desc: "Bookmark posts with collection folders (20—unlimited by tier)",              phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "story-highlights", name: "Story Highlights",    desc: "Save stories permanently to profile highlights (2—unlimited by tier)",      phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "promo-banner", name: "Promo Banner (Home Feed)","desc": "Auto-sliding gradient promo cards between feed posts (5 cards, 3s rotation)", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "banner-ads",   name: "Inline Banner Ads",       desc: "Sponsored banner ads injected every 5th post in the feed — API-backed targeting with impression/click tracking", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "ad-serving",   name: "Ad Serving System",       desc: "Real-time ad targeting by city, age, gender, interests. Active campaigns served via /api/ads/feed with server-side targeting", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "emoji-reactions", name: "Emoji Reactions",      desc: "React to posts, video reels, voice reels, and live streams with emoji (❤️ 🔥 😂 😢 🤯 🙌 + 6 more). Selected emojis highlight in pink. Count displayed with K-formatting.", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
    ],
  },
  {
    id: "social", category: "Social & Communication",
    icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-50", borderColor: "border-pink-200",
    features: [
      { id: "dating-swipe", name: "Dating Swipe (Match Tab)", desc: "Tinder-style card swipe for dating & friend matching",                        phase: "1", audience: "All Users",      status: "live",  enabled: true  },
      { id: "chat",         name: "Chat & Messaging",         desc: "1-on-1 chat with text, emoji, coin gifts, media sharing",                    phase: "1", audience: "All Users",      status: "live",  enabled: true  },
      { id: "live-streams", name: "Live Streams",             desc: "Real-time broadcasting with gifts, chat, co-host & PK battles",              phase: "2", audience: "Hosts",          status: "live",  enabled: true  },
      { id: "random-calls", name: "Random Video / Audio Calls","desc": "Stranger matching for coin-based random calls. Server-authoritative billing: coinRate (audio=10, video=25) is resolved server-side from call type; client coinRate is ignored. Upfront coins deducted at match start; remaining balance settled on call end via atomic SQL conditional update.", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "audio-rooms",  name: "Audio Rooms",              desc: "Multi-user audio rooms — podcast, Q&A, karaoke style",                      phase: "2", audience: "All Users",      status: "beta",  enabled: true  },
      { id: "super-like",   name: "Super Like & Backtrack",   desc: "Stand out in dating with Super Like (5 coins) and undo last swipe (1 coin)", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "profile-prompts", name: "Profile Prompts",       desc: "Desi dating icebreakers — 10 prompts for better profile matching",         phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "voice-reels",  name: "Voice Reels (Audio Tab)",  desc: "Voice-only reels with tappable playback, progress bar, and animated waveform", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "group-chat",   name: "Group Chat",               desc: "Create and manage group chats with friends and communities",               phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "chatrooms",    name: "Chatrooms",                desc: "Public themed chatrooms for community discussion and real-time messaging",   phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "friend-requests", name: "Friend Requests",      desc: "Send and manage friend connection requests with approval flow",             phase: "2", audience: "All Users",      status: "live",  enabled: true  },
    ],
  },
  {
    id: "gaming", category: "In-App Gaming",
    icon: Gamepad2, color: "text-gray-500", bg: "bg-gray-50", borderColor: "border-gray-200",
    features: [
      { id: "ludo",         name: "Ludo Board Game",         desc: "Not available in app — planned for Phase 3",                               phase: "3", audience: "All Users",      status: "disabled", enabled: false },
      { id: "ludo-tourney", name: "Ludo Tournaments",        desc: "Not available in app — planned for Phase 3",                               phase: "3", audience: "All Users",      status: "disabled", enabled: false },
      { id: "spin-wheel",   name: "Lucky Spin Wheel",        desc: "Daily spin for bonus coins and prizes (planned)",                            phase: "3", audience: "All Users",      status: "testing", enabled: false },
      { id: "quiz",         name: "Live Quiz Battles",       desc: "Real-time quiz competition with coin wagering (planned)",                    phase: "3", audience: "All Users",      status: "testing", enabled: false },
    ],
  },
  {
    id: "commerce", category: "Commerce & Coins",
    icon: ShoppingBag, color: "text-yellow-600", bg: "bg-yellow-50", borderColor: "border-yellow-200",
    features: [
      { id: "coin-wallet",       name: "Coin Wallet & Recharge",   desc: "Ridhi Coins balance, ₹49–₹499 recharge packs",           phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "server-wallet",     name: "Server-Authoritative Wallet", desc: "Coin add and plan subscribe are no longer public endpoints. Coins/plans are auto-credited after verified payment. Only deduct and balance query remain public. Atomic SQL updates prevent double-spend.", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "payment-auto-fulfill", name: "Payment Auto-Fulfillment", desc: "Server resolves SKU → coins/plan/bonus from canonical mapping. Amount is validated against SKU. Client cannot override bonus or plan.", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "order-ownership",      name: "Order Ownership Binding",  desc: "POST /payments/verify and GET /payments/status/:orderId now reject orders belonging to another user (403). Prevents cross-user order probing.", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "gift-deduct-harden",   name: "Gift & Spend Await Confirm", desc: "Gift send, live stream gifts, random call, brand registration, and coin store now await deductCoins result. UI only proceeds on server confirmation. Prevents bypass when server rejects.", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "checkout-harden",      name: "Checkout Open Redirect Fix", desc: "GET /payments/checkout now requires authentication and binds to the server-created order. Redirect URL is taken from the server-stored order, never from client query params. Prevents arbitrary phishing redirects.", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "download-canonical",   name: "Canonical Download Pricing", desc: "Download price is looked up server-side by contentType. Atomic conditional SQL update prevents double-spend.", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "vip-subscriptions", name: "VIP Subscription Plans",    desc: "4-tier VIP (Silver/Gold/Platinum/Diamond) with weekly/monthly/yearly billing",  phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "creator-plans",     name: "Creator Plans",            desc: "3-tier Creator plans (Starter/Pro/Elite) with monthly billing and bonus coins", phase: "2", audience: "Creators",       status: "live",  enabled: true  },
      { id: "coin-fountain",     name: "Coin Fountain Animations", desc: "Burst & rain coin animations during gifts in live streams",             phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "creator-tools",     name: "Creator Tools",            desc: "14-tiered tools: 6 free (upload/drafts/analytics/schedule/music) + 8 premium (live/podcast/HD/ads/fan-club/brand-deals/radio/manager)", phase: "2", audience: "Creators",       status: "live",  enabled: true  },
      { id: "creator-dashboard", name: "Creator Dashboard",        desc: "Tiered analytics: basic (free), advanced+audience demographics (Pro), revenue projection (Elite)", phase: "2", audience: "Hosts/Creators", status: "live",  enabled: true  },
      { id: "marketplace",       name: "Marketplace",              desc: "Creator brand deals & sponsorships (not product marketplace)",       phase: "2", audience: "All Users",      status: "beta",  enabled: false  },
      { id: "business-ads",      name: "Business Ads Manager",     desc: "Self-serve ad creation for businesses targeting Ridhi's audience",     phase: "2", audience: "Advertisers",    status: "live",  enabled: true  },
      { id: "special-ads",       name: "Special Client Popup Ads", desc: "Full-screen premium popup ads — Super Admin managed only",            phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "promotions",        name: "User Promotions & Boosts", desc: "Profile boost and visibility promotion tools for regular users",       phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "ridhi-shop",        name: "Ridhi Shop",               desc: "In-app product marketplace with exclusive merchandise, digital gifts, and creator merch", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "ridhi-shop-cart",   name: "Shop Cart & Checkout",   desc: "Add to cart, quantity adjust, bulk checkout with coins. Cart persistence via AsyncStorage", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "coin-store",        name: "Coin Store",             desc: "Dedicated coin purchase screen with ₹49–₹4999 recharge packs and bonus coins",        phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "dual-coin",         name: "Dual-Coin Economy",      desc: "Free coins (missions/ads/referrals) tracked separately from paid coins (recharges). Free coins expire in 30 days. Paid coins never expire. Spend order: free first, then paid.", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "coin-economy-safeguard", name: "Coin Economy Safeguard", desc: "Platform-wide daily free-coin budget of 50,000 with auto-pause. Real-time health monitor with free-to-paid ratio alerts and circulation breakdown. Prevents economy collapse from excessive free coin issuance.", phase: "2", audience: "Super Admin",    status: "live",  enabled: true  },
      { id: "missions",          name: "Missions & Rewards", desc: "Task-based coin earning: weekly missions, ad rewards, referral missions, and achievement badges", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "referral",          name: "Referral Program",       desc: "Invite friends with unique code and earn bonus coins when they join and verify",  phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "withdraw",          name: "Withdrawal & Payouts",   desc: "Request earnings withdrawal to bank or UPI with KYC verification and admin approval", phase: "2", audience: "Hosts/Creators", status: "live",  enabled: true  },
      { id: "kyc",               name: "E-KYC Verification",     desc: "Aadhaar/PAN identity verification for hosts, creators & high earners",          phase: "2", audience: "Hosts/Creators", status: "live",  enabled: true  },
      { id: "brand-register",    name: "Brand Registration",     desc: "Business registration for advertisers to run self-serve ads and branded content",  phase: "2", audience: "Advertisers",    status: "live",  enabled: true  },
      { id: "ads-manager",       name: "Ads Manager",            desc: "Self-serve campaign creation, budget management, and performance analytics for brands", phase: "2", audience: "Advertisers",    status: "live",  enabled: true  },
      { id: "creator-marketplace", name: "Creator Marketplace",  desc: "Platform for creators to find brand deals, sponsorships, and collaboration opportunities", phase: "2", audience: "Creators",       status: "beta",  enabled: false  },
      { id: "podcasts",          name: "Podcasts & Audio Content", desc: "Podcast channel creation, episode management, and audio streaming platform",  phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "events",            name: "Events & Meetups",         desc: "Virtual and in-person events, meetups, dating events, and community gatherings", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "pk-battle",         name: "PK Battles",             desc: "Livestream competition between two hosts where viewers vote with gifts",        phase: "2", audience: "Hosts",          status: "live",  enabled: true  },
      { id: "vibe-stars",        name: "Vibe Stars",             desc: "Curated influencer discovery and trending creator showcase with match integration", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "host-dashboard",    name: "Host Dashboard",         desc: "Full host management: analytics, earnings, stream history, KYC, and agent info", phase: "2", audience: "Hosts",          status: "live",  enabled: true  },
      { id: "agent-dashboard",   name: "Agent Dashboard",        desc: "Agent management: roster, commissions, levels, recruitment tools, and host performance", phase: "2", audience: "Agents",         status: "live",  enabled: true  },
      { id: "admin-dashboard",   name: "Admin Dashboard",        desc: "Operations panel: host/agent monitoring, KYC queue, analytics, calls, and marketing", phase: "2", audience: "Admins",         status: "live",  enabled: true  },
      { id: "host-profile",      name: "Host Profile",           desc: "Public host profile page with live status, stats, bio, and follower interaction", phase: "2", audience: "Hosts",          status: "live",  enabled: true  },
      { id: "music-library",     name: "Music Library",          desc: "In-app music browsing, trending tracks, and background music for reels/posts",  phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "scheduled-content", name: "Scheduled Posts",        desc: "Schedule posts, reels, and stories to publish at a future date and time",        phase: "2", audience: "Creators",       status: "live",  enabled: true  },
      { id: "stitch-record",     name: "Stitch & Duet",         desc: "React to existing content with side-by-side video or stitched response reels",  phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "lead-form-builder", name: "Lead Form Builder",      desc: "Create custom lead capture forms for ads and brand campaigns with builder UI",  phase: "2", audience: "Advertisers",    status: "live",  enabled: true  },
      { id: "ai-assistant",      name: "AI Assistant (Priya AI)", desc: "In-app AI chat for user support, icebreakers & content suggestions",            phase: "2", audience: "All Users",      status: "beta",  enabled: true  },
      { id: "events",            name: "Events & Meetups",         desc: "Virtual and in-person events, meetups, dating events, and community gatherings", phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "broadcast-channels", name: "Broadcast Channels",       desc: "One-to-many broadcast channels for creators, announcements, and fan engagement", phase: "2", audience: "Hosts/Creators", status: "live",  enabled: true  },
      { id: "subscriptions",     name: "Creator Subscriptions",    desc: "Monthly fan subscription tiers for exclusive content (planned)",      phase: "3", audience: "Hosts/Creators", status: "testing", enabled: false },
    ],
  },
  {
    id: "ai", category: "AI & Safety",
    icon: Cpu, color: "text-cyan-600", bg: "bg-cyan-50", borderColor: "border-cyan-200",
    features: [
      { id: "ai-assistant",   name: "AI Assistant (Priya AI)",   desc: "In-app AI chat for user support, icebreakers & content suggestions",    phase: "2", audience: "All Users",      status: "beta",  enabled: true  },
      { id: "ai-moderation",  name: "AI Content Moderation",     desc: "Automated detection of NSFW, spam, hate speech & misinformation",      phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "kyc",            name: "E-KYC Verification",        desc: "Aadhaar/PAN identity verification for hosts, creators & high earners",  phase: "2", audience: "Hosts/Creators", status: "live",  enabled: true  },
      { id: "watermark",      name: "Creator Watermark Badge",   desc: "Auto-overlay Ridhi watermark on creator content for brand protection",  phase: "2", audience: "Hosts/Creators", status: "live",  enabled: true  },
      { id: "ai-matchmaking", name: "AI Smart Matchmaking",      desc: "ML-powered compatibility scoring for better dating matches (planned)",  phase: "3", audience: "All Users",      status: "testing", enabled: false },
      { id: "deepfake-detect","name": "Deepfake Detection",      desc: "AI model to flag AI-generated or manipulated media in uploads (planned)",phase: "3", audience: "All Users",     status: "testing", enabled: false },
    ],
  },
  {
    id: "platform", category: "Platform & Settings",
    icon: Globe, color: "text-orange-600", bg: "bg-orange-50", borderColor: "border-orange-200",
    features: [
      { id: "dark-mode",      name: "Dark / Light / System Theme", desc: "Full dark mode with system-preference auto-detection",                 phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "multi-lang",     name: "13 Indian Language Support", desc: "English + Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Odia, Urdu, Assamese", phase: "2", audience: "All Users", status: "live", enabled: true },
      { id: "notifications",  name: "In-App Notifications Center","desc": "Notification feed for likes, matches, gifts, system alerts & more",  phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "push-notif",     name: "Push Notifications (FCM)",   desc: "Firebase Cloud Messaging background push alerts",                      phase: "2", audience: "All Users",      status: "live",  enabled: true  },
      { id: "regional-feed",  name: "Regional Language Feed",     desc: "Feed content filtered by selected app language & region",             phase: "3", audience: "All Users",      status: "testing", enabled: false },
      { id: "share-sheet",    name: "Native Share Sheet",         desc: "Share posts to WhatsApp, Instagram, Telegram & more (planned)",       phase: "3", audience: "All Users",      status: "testing", enabled: false },
      { id: "sa-host-review", name: "SA-Centric Host Application Review", desc: "All host applications are reviewed exclusively by Super Admin. SA picks the assigned Agent (and Admin is derived from the agent's chain) before approving. Admins and Agents no longer see or approve pending host applications.", phase: "2", audience: "Super Admin", status: "live", enabled: true },
      { id: "sa-agent-review", name: "SA-Centric Agent Application Review", desc: "All agent applications are reviewed exclusively by Super Admin. SA selects starting level (A1–A5) and the dedicated Admin the agent reports to before approving. Admins no longer see or approve pending agent applications.", phase: "2", audience: "Super Admin", status: "live", enabled: true },
      { id: "cross-role-block", name: "Cross-Role Eligibility Enforcement", desc: "A user registered as an active Host is blocked from being approved as an Agent, and vice versa. Pending application cards show a red 'Ineligible' badge and a disabled Approve button. The ApproveHost/ApproveAgent dialogs also surface a hard error banner and keep Approve disabled when a cross-role conflict is detected.", phase: "2", audience: "Super Admin", status: "live", enabled: true },
      { id: "admin-nominates-agent", name: "Admin Nominates Agent Candidate", desc: "Admins can nominate external candidates for the Agent role via the 'Nominate an Agent Candidate' card on the Agents page. Nominations appear in the SA pending queue with a blue 'Admin Nomination' badge. Super Admin is the sole approver — Admins cannot self-approve. Nominated entries carry nominationType='admin' metadata for audit.", phase: "2", audience: "Admin", status: "live", enabled: true },
      { id: "admin-nominates-host", name: "Admin Nominates Host Candidate (via Agent)", desc: "Admins can submit host nominations on behalf of one of their agents via the 'Nominate a Host Candidate' card on the Hosts page. The Admin selects the nominating Agent, enters candidate details, and submits. The entry lands in the SA pending queue with a blue 'Nominated by [Agent Name]' badge. Super Admin is the sole approver. Entries carry nominationType='agent' metadata for audit.", phase: "2", audience: "Admin", status: "live", enabled: true },
      { id: "geo-targeting", name: "Campaign Geo-Targeting", desc: "When creating a campaign, Admins can set location targeting: All Locations (default), a specific City (free-text city name), or a configurable Radius around a city (5 km – 100 km slider with 5 km steps). Target city and radius are stored on the campaign record and shown in the campaign table. The campaign preview also reflects the selected location.", phase: "2", audience: "Admin", status: "live", enabled: true },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Core: "bg-purple-100 text-purple-700",
  Content: "bg-blue-100 text-blue-700",
  Social: "bg-pink-100 text-pink-700",
  Finance: "bg-green-100 text-green-700",
  Platform: "bg-orange-100 text-orange-700",
  AI: "bg-cyan-100 text-cyan-700",
};

const LEVEL_COLORS: Record<string, string> = {
  L1: "bg-orange-100 text-orange-700 border-orange-200",
  L2: "bg-gray-100 text-gray-700 border-gray-200",
  L3: "bg-gray-100 text-gray-600 border-gray-200",
  L4: "bg-yellow-100 text-yellow-700 border-yellow-200",
  L5: "bg-purple-100 text-purple-700 border-purple-200",
  L6: "bg-blue-100 text-blue-700 border-blue-200",
  L7: "bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-700 border-orange-200",
  A1: "bg-gray-100 text-gray-600 border-gray-200",
  A2: "bg-blue-50 text-blue-600 border-blue-200",
  A3: "bg-purple-100 text-purple-700 border-purple-200",
  A4: "bg-pink-100 text-pink-700 border-pink-200",
  A5: "bg-gradient-to-r from-purple-50 to-pink-50 text-pink-700 border-pink-200",
};

export default function SuperAdminPage() {
  const [globalSettings, setGlobalSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    guestAccess: true,
    aiModeration: true,
    autoPayouts: false,
    devMode: false,
  });

  const [hosts, setHosts] = useState(HOSTS_WITH_ACCESS);
  const [agents, setAgents] = useState(AGENTS_WITH_ACCESS);
  const [platformApis, setPlatformApis] = useState(PLATFORM_APIS);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [webhooks, setWebhooks] = useState(WEBHOOKS);
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAGS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ── API Keys state ─────────────────────────────────────────────────────────
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, "ok" | "fail" | null>>({});
  const [apiKeys, setApiKeys] = useState({
    msg91AuthKey:         "MSG91_AUTH_KEY_SECURED",
    msg91OtpTemplate:     "MSG91_OTP_TEMPLATE_ID_SECURED",
    msg91SmsTemplate:     "",
    msg91Unicode:         false,
    msg91DefaultLang:     "en",
    msg91WaNumber:        "",
    msg91WaTemplate:      "",
    razorpayKeyId:        "rzp_live_••••••••K7xQ",
    razorpayKeySecret:    "razorpay_secret_secured",
    agoraAppId:           "agora_app_id_secured",
    agoraCert:            "agora_cert_secured",
    agoraAudioRate:       "10",
    agoraVideoRate:       "25",
    zegoAppId:            "",
    zegoCert:             "",
    hmsAppId:             "",
    hmsToken:             "",
    streamingCdnUrl:      "https://rtmp.ridhi.app/live",
    streamingSecret:      "stream_secret_secured",
    fcmServerKey:         "FCM_SERVER_KEY_SECURED",
    fcmSenderId:          "838429100274",
    openAiKey:            "sk-••••••••••••T8",
    awsAccessKey:         "AKIA••••••••7L",
    awsSecretKey:         "aws_secret_secured",
    awsS3Bucket:          "ridhi-media-prod",
    googleClientId:       "438••••••apps.googleusercontent.com",
    googleClientSecret:   "google_secret_secured",
  });
  const [coinGenUser, setCoinGenUser] = useState("");
  const [coinGenAmount, setCoinGenAmount] = useState("");
  const [coinGenReason, setCoinGenReason] = useState("support");
  const [coinGenLog, setCoinGenLog] = useState<Array<{ id: string; user: string; amount: number; reason: string; by: string; time: string }>>([]);

  const handleCoinGen = () => {
    const amount = parseInt(coinGenAmount);
    if (!coinGenUser.trim() || isNaN(amount) || amount <= 0) return;
    const entry = {
      id: `cg_${Date.now()}`,
      user: coinGenUser.trim(),
      amount,
      reason: coinGenReason,
      by: "Arjun Mehta (Super Admin)",
      time: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    setCoinGenLog((prev) => [entry, ...prev]);
    setCoinGenUser("");
    setCoinGenAmount("");
    setCoinGenReason("support");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTabActive, setSearchTabActive] = useState(false);

  const [coinConfig, setCoinConfig] = useState({
    coinValueInr:           "1.00",
    autoGenWatchReel:       "3",
    autoGenPostLike:        "1",
    autoGenReferral:        "100",
    autoGenEnabled:         true,
    missionDailyMax:        "360",
    superLikeCost:          "5",
    backtrackCost:          "1",
    audioCallCostPerMin:    "10",
    videoCallCostPerMin:    "25",
    boostPostCostPerHr:     "50",
    unlockMsgCost:          "50",
    aiQueryCost:            "5",
    shopItemCost:           "100",
    eventCreationCost:      "50",
    broadcastMsgCost:       "10",
    creatorRevShare:        "70",
    platformRevShare:       "20",
    agentRevShare:          "10",
    withdrawMin:            "500",
    withdrawPlatformFee:    "2",
    bonusMultiplier:        "1.0",
  });
  const [approvalConfig, setApprovalConfig] = useState({
    hostRegistration:     true,
    agentRegistration:    true,
    withdrawalApproval:   true,
    kycApproval:          true,
    contentApproval:      false,
    liveStreamApproval:   false,
    podcastPublish:       false,
    coinManualAdd:        true,
    adsApproval:          true,
    autoApproveKyc:       false,
    autoApproveWithdraw:  false,
    withdrawAutoThreshold: "1000",
  });

  const [securitySettings, setSecuritySettings] = useState({
    enforce2FA: true,
    minPasswordLength: "8",
    requireComplexity: true,
    maxLoginAttempts: "5",
    lockoutDuration: "30",
    rateLimitRequests: "100",
    rateLimitWindow: "60",
    sessionTimeout: "24",
    ipWhitelist: "",
    ipBlacklist: "",
  });

  // ── Levels & Commissions state ─────────────────────────────────────────────────────
  const [autoPromo, setAutoPromo] = useState(true);

  interface HostLevel { level: string; title: string; minCoins: number; badge: string; color: string; }
  interface AgentLevel { level: string; title: string; hostsRequired: number; commissionRate: number; icon: string; color: string; }

  const DEFAULT_HOST_LEVELS: HostLevel[] = [
    { level: "L1", title: "Bronze",      minCoins: 50000,   badge: "🥉", color: "#CD7F32" },
    { level: "L2", title: "Silver",      minCoins: 200000,  badge: "🥈", color: "#9E9E9E" },
    { level: "L3", title: "Gold",        minCoins: 500000,  badge: "🥇", color: "#FFB800" },
    { level: "L4", title: "Platinum",    minCoins: 1000000, badge: "💎", color: "#00BCD4" },
    { level: "L5", title: "Diamond",     minCoins: 2000000, badge: "🔷", color: "#2196F3" },
    { level: "L6", title: "Elite",       minCoins: 3500000, badge: "⭐", color: "#7B2FBE" },
    { level: "L7", title: "Royal Crown", minCoins: 5000000, badge: "👑", color: "#E91E8C" },
  ];
  const DEFAULT_AGENT_LEVELS: AgentLevel[] = [
    { level: "A1", title: "Agent",       hostsRequired: 5,   commissionRate: 2,  icon: "🥉", color: "#9E9E9E" },
    { level: "A2", title: "Senior Agent",hostsRequired: 20,  commissionRate: 4,  icon: "🥈", color: "#4CAF50" },
    { level: "A3", title: "Super Agent", hostsRequired: 60,  commissionRate: 6,  icon: "🥇", color: "#2196F3" },
    { level: "A4", title: "Elite Agent", hostsRequired: 150, commissionRate: 8,  icon: "💎", color: "#FF9800" },
    { level: "A5", title: "Master Agent",hostsRequired: 250, commissionRate: 10, icon: "👑", color: "#E91E8C" },
  ];
  const [hostLevels, setHostLevels] = useState<HostLevel[]>(() => JSON.parse(JSON.stringify(DEFAULT_HOST_LEVELS)));
  const [agentLevels, setAgentLevels] = useState<AgentLevel[]>(() => JSON.parse(JSON.stringify(DEFAULT_AGENT_LEVELS)));

  const updateHostLevel = (idx: number, field: string, val: string | number) =>
    setHostLevels(prev => prev.map((l, i) => i === idx ? { ...l, [field]: val as never } : l));
  const removeHostLevel = (idx: number) => setHostLevels(prev => prev.filter((_l, i) => i !== idx));
  const addHostLevel = () => {
    const nextNum = hostLevels.length + 1;
    setHostLevels(prev => [...prev, { level: `L${nextNum}`, title: "New Level", minCoins: 0, badge: "🔴", color: "#888888" }]);
  };
  const updateAgentLevel = (idx: number, field: string, val: string | number) =>
    setAgentLevels(prev => prev.map((l, i) => i === idx ? { ...l, [field]: val as never } : l));
  const removeAgentLevel = (idx: number) => setAgentLevels(prev => prev.filter((_l, i) => i !== idx));
  const addAgentLevel = () => {
    const nextNum = agentLevels.length + 1;
    setAgentLevels(prev => [...prev, { level: `A${nextNum}`, title: "New Level", hostsRequired: 0, commissionRate: 0, icon: "🔴", color: "#888888" }]);
  };
  const resetLevels = () => {
    setHostLevels(JSON.parse(JSON.stringify(DEFAULT_HOST_LEVELS)));
    setAgentLevels(JSON.parse(JSON.stringify(DEFAULT_AGENT_LEVELS)));
  };
  const saveLevels = () => {
    handleSaveKey("levels");
  };

  const toggleReveal = (key: string) =>
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));

  const maskKey = (val: string) => {
    if (!val || val === "") return "— not configured —";
    return val.slice(0, 4) + "••••••••••••" + val.slice(-4);
  };

  const handleSaveKey = (section: string) => {
    setSavedKeys(prev => ({ ...prev, [section]: true }));
    setTimeout(() => setSavedKeys(prev => ({ ...prev, [section]: false })), 2000);
  };

  const handleTest = (key: string, succeed = true) => {
    setTestResults(prev => ({ ...prev, [key]: null }));
    setTimeout(() => setTestResults(prev => ({ ...prev, [key]: succeed ? "ok" : "fail" })), 1200);
  };

  const totalFeatures   = featureFlags.reduce((n, c) => n + c.features.length, 0);
  const enabledFeatures = featureFlags.reduce((n, c) => n + c.features.filter(f => f.enabled).length, 0);
  const betaFeatures    = featureFlags.reduce((n, c) => n + c.features.filter(f => f.status === "beta").length, 0);
  const testingFeatures = featureFlags.reduce((n, c) => n + c.features.filter(f => f.status === "testing").length, 0);

  const toggleFeature = (categoryId: string, featureId: string) =>
    setFeatureFlags(prev => prev.map(c => c.id !== categoryId ? c : {
      ...c, features: c.features.map(f => f.id !== featureId ? f : { ...f, enabled: !f.enabled }),
    }));

  const enableAllInCategory = (categoryId: string) =>
    setFeatureFlags(prev => prev.map(c => c.id !== categoryId ? c : {
      ...c, features: c.features.map(f => ({ ...f, enabled: true })),
    }));

  const disableAllInCategory = (categoryId: string) =>
    setFeatureFlags(prev => prev.map(c => c.id !== categoryId ? c : {
      ...c, features: c.features.map(f => f.status === "live" || f.status === "beta" ? { ...f, enabled: false } : f),
    }));

  const toggleApi = (id: string) =>
    setPlatformApis((prev) => prev.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a));

  const enableAllApis = () =>
    setPlatformApis((prev) => prev.map((a) => ({ ...a, enabled: true })));

  const toggleIntegration = (category: string, name: string) =>
    setIntegrations((prev) => prev.map((g) => g.category !== category ? g : {
      ...g,
      items: g.items.map((i) => i.name === name ? { ...i, enabled: !i.enabled } : i),
    }));

  const toggleWebhook = (name: string) =>
    setWebhooks((prev) => prev.map((w) => w.name === name ? { ...w, active: !w.active } : w));

  const handleCopyKey = (key: string) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const toggleHostAccess = (id: string) => {
    setHosts((prev) => prev.map((h) => h.id === id ? {
      ...h,
      access: !h.access,
      lastLogin: !h.access ? "just now" : h.lastLogin,
      sessions: !h.access ? 1 : 0,
      joinedAdmin: !h.access ? "just now" : "—",
    } : h));
  };

  const toggleAgentAccess = (id: string) => {
    setAgents((prev) => prev.map((a) => a.id === id ? {
      ...a,
      access: !a.access,
      lastLogin: !a.access ? "just now" : a.lastLogin,
      sessions: !a.access ? 1 : 0,
      joinedAdmin: !a.access ? "just now" : "—",
    } : a));
  };

  const grantAllHosts = () => setHosts((prev) => prev.map((h) => ({ ...h, access: true, sessions: h.sessions || 1, joinedAdmin: h.joinedAdmin === "—" ? "just now" : h.joinedAdmin })));
  const grantAllAgents = () => setAgents((prev) => prev.map((a) => ({ ...a, access: true, sessions: a.sessions || 1, joinedAdmin: a.joinedAdmin === "—" ? "just now" : a.joinedAdmin })));

  const activeHosts = hosts.filter((h) => h.access).length;
  const activeAgents = agents.filter((a) => a.access).length;

  const statusColor = (s: string) =>
    s === "healthy" ? "text-green-600" : s === "warning" ? "text-yellow-600" : "text-red-600";
  const statusIcon = (s: string) =>
    s === "healthy" ? CheckCircle : s === "warning" ? AlertTriangle : XCircle;
  const severityColor = (s: string) =>
    s === "high" ? "bg-red-100 text-red-700 border-red-200" :
    s === "medium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
    "bg-blue-100 text-blue-700 border-blue-200";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("super-admin_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Super Admin Control
          </h2>
          <p className="text-muted-foreground text-sm mt-1">End-to-end control · Monitors Admins → Agents → Hosts → Users</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-green-500 text-white gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
            {activeHosts + activeAgents + 5} Active Sessions
          </Badge>
          <Badge variant="outline" className="gap-1 text-purple-700 border-purple-200 bg-purple-50">
            <ShieldCheck className="w-3 h-3" />
            Super Admin: Full Control
          </Badge>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Platform Admins", value: "5", icon: Shield, color: "text-purple-600 bg-purple-50" },
          { label: "Hosts with Access", value: `${activeHosts}/${hosts.length}`, icon: Star, color: "text-pink-600 bg-pink-50" },
          { label: "Agents with Access", value: `${activeAgents}/${agents.length}`, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
          { label: "Live Streams", value: "8", icon: Radio, color: "text-emerald-600 bg-emerald-50" },
          { label: "Video Uploads", value: "40", icon: Film, color: "text-violet-600 bg-violet-50" },
          { label: "Security Alerts", value: "4", icon: AlertTriangle, color: "text-yellow-600 bg-yellow-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="admins">
        <TabsList className="h-9">
          <TabsTrigger value="admins" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" /> Admin Monitoring
          </TabsTrigger>
          <TabsTrigger value="access" className="text-xs gap-1.5">
            <Key className="w-3.5 h-3.5" /> Host & Agent Access
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs gap-1.5">
            <Server className="w-3.5 h-3.5" /> System
          </TabsTrigger>
          <TabsTrigger value="apis" className="text-xs gap-1.5">
            <Code className="w-3.5 h-3.5" /> APIs & Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="features" className="text-xs gap-1.5">
            <Flame className="w-3.5 h-3.5" /> Features
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" /> Feature Analytics
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="text-xs gap-1.5">
            <Key className="w-3.5 h-3.5" /> API Keys & Config
          </TabsTrigger>
          <TabsTrigger value="commercial-ads" className="text-xs gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5" /> Commercial ADs
          </TabsTrigger>
          <TabsTrigger value="coin-gen" className="text-xs gap-1.5">
            <Coins className="w-3.5 h-3.5" /> Coin Generator
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="text-xs gap-1.5">
            <Crown className="w-3.5 h-3.5" /> Subscriptions
          </TabsTrigger>
          <TabsTrigger value="search" className="text-xs gap-1.5">
            <Search className="w-3.5 h-3.5" /> Quick Search
          </TabsTrigger>
          <TabsTrigger value="calls" className="text-xs gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" /> Random Calls
          </TabsTrigger>
          <TabsTrigger value="levels" className="text-xs gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Levels & Commissions
          </TabsTrigger>
        </TabsList>

        {/* ─── HOST & AGENT ACCESS TAB ─── */}
        <TabsContent value="access" className="mt-4 space-y-6">

          {/* Hierarchy banner */}
          <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
            <p className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Role-Based Access Hierarchy
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { role: "Super Admin", color: "bg-purple-600", scope: "Full control — all Hosts, all Agents, all Admin dashboards, all pages, all actions", manages: "Manages Admins" },
                { role: "Admin",       color: "bg-indigo-500", scope: "Your Hosts + Your Agents + Admin pages", manages: "Approves Agents" },
                { role: "Agent",       color: "bg-blue-500",   scope: "Hosts, Calls, KYC, Live Streams",       manages: "Approves Hosts" },
                { role: "Host",        color: "bg-pink-500",   scope: "Host Dashboard, Calls, Live Streams only",   manages: "Managed by Agent" },
              ].map((r) => (
                <div key={r.role} className="bg-white rounded-lg border p-3 space-y-1.5">
                  <div className={`w-fit px-2 py-0.5 rounded-full ${r.color} text-white text-xs font-bold`}>{r.role}</div>
                  <p className="text-xs text-foreground font-medium">{r.manages}</p>
                  <p className="text-xs text-muted-foreground">{r.scope}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── HOSTS TABLE ── */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-pink-600" />
                Host Access Portal
                <Badge className="bg-pink-500 text-white text-xs ml-1">{activeHosts} Active</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={grantAllHosts}>
                  <UserCheck className="w-3 h-3" /> Grant All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left p-3 font-medium">Host</th>
                      <th className="text-left p-3 font-medium">Level</th>
                      <th className="text-left p-3 font-medium">Login Credentials</th>
                      <th className="text-left p-3 font-medium">Last Login</th>
                      <th className="text-left p-3 font-medium">Sessions</th>
                      <th className="text-left p-3 font-medium">Admin Since</th>
                      <th className="text-left p-3 font-medium">Full Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hosts.map((host) => (
                      <tr key={host.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {host.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{host.name}</p>
                              <p className="text-xs text-muted-foreground">{host.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-xs ${LEVEL_COLORS[host.level]}`}>
                            {host.level} · {host.levelLabel}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="text-xs font-mono">{host.email}</p>
                            <p className="text-xs text-muted-foreground">Pass: host123</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className={`flex items-center gap-1.5 text-xs ${host.access ? "text-green-600" : "text-muted-foreground"}`}>
                            <Clock className="w-3 h-3" />
                            {host.lastLogin}
                          </div>
                        </td>
                        <td className="p-3">
                          {host.sessions > 0 ? (
                            <Badge variant="outline" className="text-xs text-green-600 bg-green-50 border-green-200">
                              {host.sessions} active
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{host.joinedAdmin}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={host.access}
                              onCheckedChange={() => toggleHostAccess(host.id)}
                            />
                            <span className={`text-xs font-medium ${host.access ? "text-green-600" : "text-muted-foreground"}`}>
                              {host.access ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* ── AGENTS TABLE ── */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Agent Access Portal
                <Badge className="bg-blue-500 text-white text-xs ml-1">{activeAgents} Active</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={grantAllAgents}>
                  <UserCheck className="w-3 h-3" /> Grant All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left p-3 font-medium">Agent</th>
                      <th className="text-left p-3 font-medium">Level</th>
                      <th className="text-left p-3 font-medium">Login Credentials</th>
                      <th className="text-left p-3 font-medium">Hosts Managed</th>
                      <th className="text-left p-3 font-medium">Last Login</th>
                      <th className="text-left p-3 font-medium">Sessions</th>
                      <th className="text-left p-3 font-medium">Full Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr key={agent.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {agent.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">{agent.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-xs ${LEVEL_COLORS[agent.level]}`}>
                            {agent.level} · {agent.levelLabel}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="text-xs font-mono">{agent.email}</p>
                            <p className="text-xs text-muted-foreground">Pass: agent123</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">{agent.hosts}</span>
                            <span className="text-muted-foreground">hosts · {agent.commission}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className={`flex items-center gap-1.5 text-xs ${agent.access ? "text-green-600" : "text-muted-foreground"}`}>
                            <Clock className="w-3 h-3" />
                            {agent.lastLogin}
                          </div>
                        </td>
                        <td className="p-3">
                          {agent.sessions > 0 ? (
                            <Badge variant="outline" className="text-xs text-green-600 bg-green-50 border-green-200">
                              {agent.sessions} active
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={agent.access}
                              onCheckedChange={() => toggleAgentAccess(agent.id)}
                            />
                            <span className={`text-xs font-medium ${agent.access ? "text-green-600" : "text-muted-foreground"}`}>
                              {agent.access ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="w-4 h-4" /> Permission Matrix — All Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">Permission</th>
                      <th className="text-center py-2 px-3 font-semibold">
                        <div className="flex items-center justify-center gap-1"><Shield className="w-3 h-3 text-purple-600" />Super Admin</div>
                      </th>
                      <th className="text-center py-2 px-3 font-semibold">
                        <div className="flex items-center justify-center gap-1"><Star className="w-3 h-3 text-pink-600" />Host</div>
                      </th>
                      <th className="text-center py-2 px-3 font-semibold">
                        <div className="flex items-center justify-center gap-1"><Briefcase className="w-3 h-3 text-blue-600" />Agent</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Admin Dashboard",          sa: true, host: false, agent: false },
                      { name: "Host Dashboard",           sa: true, host: true,  agent: false },
                      { name: "Agent Dashboard",          sa: true, host: false, agent: true  },
                      { name: "User Management",          sa: true, host: false, agent: false },
                      { name: "Content Moderation",       sa: true, host: false, agent: false },
                      { name: "Host Management",          sa: true, host: false, agent: true  },
                      { name: "Agent Management",         sa: true, host: false, agent: false },
                      { name: "Audio/Video Calls",        sa: true, host: true,  agent: true  },
                      { name: "Live Streams",             sa: true, host: true,  agent: true  },
                      { name: "Coin Economy",             sa: true, host: true,  agent: true  },
                      { name: "Payouts & Revenue",        sa: true, host: false, agent: true  },
                      { name: "AI Hub Controls",          sa: true, host: false, agent: false },
                      { name: "Marketing",                sa: true, host: false, agent: true  },
                      { name: "Global Settings",          sa: true, host: false, agent: false },
                      { name: "Security Controls",        sa: true, host: false, agent: false },
                      { name: "Payment Gateways",         sa: true, host: false, agent: true  },
                    ].map((perm) => (
                      <tr key={perm.name} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="py-2 pr-4 font-medium text-foreground">{perm.name}</td>
                        <td className="py-2 text-center"><CheckCircle className="w-4 h-4 text-green-500 mx-auto" /></td>
                        <td className="py-2 text-center">
                          {perm.host
                            ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                        </td>
                        <td className="py-2 text-center">
                          {perm.agent
                            ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SYSTEM TAB ─── */}
        <TabsContent value="system" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="w-4 h-4" /> Server Health Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SERVER_HEALTH.map((srv) => {
                  const Icon = statusIcon(srv.status);
                  return (
                    <div key={srv.name} className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${statusColor(srv.status)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{srv.name}</span>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground ml-2 flex-shrink-0">
                            <span>{srv.uptime}</span>
                            <span>{srv.responseTime}</span>
                            <span>{srv.load}% load</span>
                          </div>
                        </div>
                        <Progress value={srv.load} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                  <RefreshCw className="w-3 h-3" /> Refresh Status
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Global Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(globalSettings).map(([key, val]) => {
                  const labels: Record<string, { label: string; desc: string; danger?: boolean }> = {
                    maintenanceMode: { label: "Maintenance Mode", desc: "Disable app access for all users", danger: true },
                    registrationOpen: { label: "Open Registration", desc: "Allow new user sign-ups" },
                    guestAccess: { label: "Guest Access", desc: "Allow browsing without account" },
                    aiModeration: { label: "AI Auto-Moderation", desc: "AI reviews flagged content" },
                    autoPayouts: { label: "Auto Payouts", desc: "Automatically process creator payouts" },
                    devMode: { label: "Developer Mode", desc: "Show extended debug info in APIs", danger: true },
                  };
                  const meta = labels[key];
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${meta.danger ? "text-destructive" : ""}`}>{meta.label}</p>
                        <p className="text-xs text-muted-foreground">{meta.desc}</p>
                      </div>
                      <Switch checked={val} onCheckedChange={(v) => setGlobalSettings((s) => ({ ...s, [key]: v }))} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" /> API Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs">
                    <th className="text-left pb-2">Method</th>
                    <th className="text-left pb-2">Endpoint</th>
                    <th className="text-right pb-2">Status</th>
                    <th className="text-right pb-2">Avg Time</th>
                    <th className="text-right pb-2">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {API_LOGS.map((log, i) => (
                    <tr key={i}>
                      <td className="py-2">
                        <Badge variant={log.method === "GET" ? "secondary" : log.method === "POST" ? "default" : "destructive"} className="text-xs">
                          {log.method}
                        </Badge>
                      </td>
                      <td className="py-2 font-mono text-xs truncate max-w-[120px]">{log.path}</td>
                      <td className="py-2 text-right"><span className="text-green-600 font-medium">{log.status}</span></td>
                      <td className="py-2 text-right text-muted-foreground">{log.time}</td>
                      <td className="py-2 text-right text-muted-foreground">{log.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Gateway Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PAYMENT_GATEWAYS.map((gw) => (
                  <div key={gw.name} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <gw.icon className={`w-4 h-4 ${gw.color}`} />
                        <span className="font-medium text-sm">{gw.name}</span>
                      </div>
                      <Badge variant={gw.status === "active" ? "default" : "secondary"} className="text-xs">{gw.status}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Success Rate</span>
                        <span className="text-foreground font-medium">{gw.successRate > 0 ? gw.successRate + "%" : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Today's Tx</span>
                        <span className="text-foreground font-medium">{gw.txToday}</span>
                      </div>
                    </div>
                    {gw.successRate > 0 && <Progress value={gw.successRate} className="h-1.5" />}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                        {gw.status === "active" ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2"><Eye className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ADMIN ROLES TAB ─── */}
        <TabsContent value="admins" className="mt-4 space-y-5">
          {/* Authority banner */}
          <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
            <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Super Admin Exclusive Authority
            </p>
            <p className="text-sm text-purple-800">
              Only the <strong>Super Admin</strong> role may create, edit, suspend, or remove admin accounts.
              Regular admins cannot access these pages or perform these actions.
            </p>
          </div>

          {/* Quick-action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-purple-200/60">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Admin Management</p>
                    <p className="text-xs text-muted-foreground">Create, edit, suspend, and remove admin accounts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Super Admin only
                </div>
                <Button
                  size="sm"
                  className="w-full gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90"
                  onClick={() => window.location.href = "admin-management"}
                >
                  Open Admin Management <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200/60">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Admin Activity Monitor</p>
                    <p className="text-xs text-muted-foreground">Full audit trail of every action taken by every admin</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Super Admin only
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => window.location.href = "/admins/admin-activity"}
                >
                  View Activity Logs <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Admin roster summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" /> Current Admin Roster
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 pb-3">Admin</th>
                      <th className="text-left pb-3">Role</th>
                      <th className="text-left pb-3">Status</th>
                      <th className="text-left pb-3">Last Login</th>
                      <th className="text-left pb-3">Permissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ADMIN_ROLES.map((admin) => (
                      <tr key={admin.id}>
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${admin.role === "Super Admin" ? "from-purple-500 to-pink-500" : "from-indigo-400 to-blue-400"} flex items-center justify-center text-white text-xs font-bold`}>
                              {admin.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-medium">{admin.name}</p>
                              <p className="text-xs text-muted-foreground">{admin.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant={admin.role === "Super Admin" ? "default" : "secondary"} className="text-xs">{admin.role}</Badge>
                        </td>
                        <td className="py-3">
                          <div className={`flex items-center gap-1.5 text-xs ${admin.status === "active" ? "text-green-600" : "text-muted-foreground"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${admin.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                            {admin.status}
                          </div>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{admin.lastLogin}</td>
                        <td className="py-3">
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">{admin.permissions}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                To modify any admin account, use the <strong>Admin Management</strong> page above.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── APIs & INTEGRATIONS TAB ─── */}
        <TabsContent value="apis" className="mt-4 space-y-6">

          {/* Full-access banner */}
          <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-green-600">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-900">Super Admin — Full API & Integration Access</p>
              <p className="text-sm text-green-700 mt-0.5">
                You have <strong>unrestricted read/write access</strong> to all platform APIs, third-party integrations, API keys, and webhooks. All {platformApis.length} APIs are enabled.
              </p>
            </div>
            <div className="hidden md:flex flex-col gap-1 text-xs text-green-700">
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> All APIs Enabled</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Key Management</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Webhooks Control</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Third-party Access</span>
            </div>
          </div>

          {/* KPI mini-row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Platform APIs", value: `${platformApis.filter(a => a.enabled).length}/${platformApis.length}`, color: "text-purple-600 bg-purple-50", icon: Code },
              { label: "Integrations Active", value: `${integrations.reduce((n, g) => n + g.items.filter(i => i.enabled).length, 0)}`, color: "text-blue-600 bg-blue-50", icon: Link },
              { label: "Webhooks Active", value: `${webhooks.filter(w => w.active).length}/${webhooks.length}`, color: "text-green-600 bg-green-50", icon: Webhook },
              { label: "Avg API Latency", value: "87ms", color: "text-orange-600 bg-orange-50", icon: Activity },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform APIs table */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-600" />
                Platform APIs
                <Badge className="bg-purple-500 text-white text-xs ml-1">{platformApis.filter(a => a.enabled).length} Active</Badge>
              </CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={enableAllApis}>
                <CheckCircle className="w-3 h-3" /> Enable All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left p-3 font-medium">API Name</th>
                      <th className="text-left p-3 font-medium">Endpoint</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Version</th>
                      <th className="text-right p-3 font-medium">Calls/hr</th>
                      <th className="text-right p-3 font-medium">Latency</th>
                      <th className="text-center p-3 font-medium">Enabled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformApis.map((api) => (
                      <tr key={api.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${api.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                            <span className="font-medium text-sm">{api.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{api.path}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[api.category] ?? ""}`}>{api.category}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs">{api.version}</Badge>
                        </td>
                        <td className="p-3 text-right text-xs text-muted-foreground">{api.calls}</td>
                        <td className="p-3 text-right text-xs text-muted-foreground">{api.latency}</td>
                        <td className="p-3 text-center">
                          <Switch checked={api.enabled} onCheckedChange={() => toggleApi(api.id)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Third-party Integrations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Link className="w-4 h-4 text-blue-600" /> Third-Party Integrations
              </h3>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <PlusCircle className="w-3 h-3" /> Add Integration
              </Button>
            </div>
            <div className="space-y-4">
              {integrations.map((group) => (
                <Card key={group.category}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <span className={`${group.color} font-semibold`}>{group.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {group.items.filter(i => i.enabled).length}/{group.items.length} active
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {group.items.map((item) => (
                        <div key={item.name} className="flex items-center gap-4 p-3 hover:bg-muted/20 transition-colors">
                          <div className={`p-2 rounded-lg ${group.bg} flex-shrink-0`}>
                            <item.icon className={`w-4 h-4 ${group.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{item.name}</span>
                              <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-xs">
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="hidden md:flex items-center gap-1.5 bg-muted/60 rounded-md px-2 py-1">
                              <span className="font-mono text-xs text-muted-foreground max-w-[140px] truncate">{item.keyMasked}</span>
                              <button
                                onClick={() => handleCopyKey(item.name)}
                                className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                              >
                                {copiedKey === item.name
                                  ? <CheckCircle className="w-3 h-3 text-green-500" />
                                  : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 hidden md:flex">
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                            <Switch
                              checked={item.enabled}
                              onCheckedChange={() => toggleIntegration(group.category, item.name)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Webhooks */}
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Webhook className="w-4 h-4 text-orange-600" />
                Webhooks
                <Badge className="bg-orange-500 text-white text-xs ml-1">{webhooks.filter(w => w.active).length} Active</Badge>
              </CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <PlusCircle className="w-3 h-3" /> New Webhook
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {webhooks.map((wh) => (
                  <div key={wh.name} className="flex items-start gap-4 p-3 hover:bg-muted/20 transition-colors">
                    <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${wh.active ? "bg-orange-50" : "bg-muted"}`}>
                      <Webhook className={`w-3.5 h-3.5 ${wh.active ? "text-orange-600" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{wh.name}</span>
                        {wh.events.map((ev) => (
                          <Badge key={ev} variant="secondary" className="text-xs">{ev}</Badge>
                        ))}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{wh.url}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Last triggered: {wh.lastTriggered}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch checked={wh.active} onCheckedChange={() => toggleWebhook(wh.name)} />
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* ─── SECURITY TAB ─── */}
        <TabsContent value="security" className="mt-4 space-y-6">

          {/* Security alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" /> Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SECURITY_ALERTS.map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${severityColor(alert.severity)}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs opacity-70 mt-0.5">{alert.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{alert.severity}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Authentication & Password */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" /> Authentication & 2FA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enforce 2FA for Super Admin</p>
                    <p className="text-xs text-muted-foreground">Require OTP or authenticator for all Super Admin logins</p>
                  </div>
                  <Switch
                    checked={securitySettings.enforce2FA}
                    onCheckedChange={v => setSecuritySettings(p => ({...p, enforce2FA: v}))}
                  />
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label className="text-xs">Minimum Password Length</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={6} max={32}
                      value={securitySettings.minPasswordLength}
                      onChange={e => setSecuritySettings(p => ({...p, minPasswordLength: e.target.value}))}
                      className="h-8 text-xs w-20" />
                    <span className="text-xs text-muted-foreground">characters</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Require Complexity</p>
                    <p className="text-xs text-muted-foreground">Upper, lower, number, special character</p>
                  </div>
                  <Switch
                    checked={securitySettings.requireComplexity}
                    onCheckedChange={v => setSecuritySettings(p => ({...p, requireComplexity: v}))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-blue-600" /> Rate Limiting & Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max Login Attempts</Label>
                    <Input type="number" min={1} max={20}
                      value={securitySettings.maxLoginAttempts}
                      onChange={e => setSecuritySettings(p => ({...p, maxLoginAttempts: e.target.value}))}
                      className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Lockout (minutes)</Label>
                    <Input type="number" min={1} max={1440}
                      value={securitySettings.lockoutDuration}
                      onChange={e => setSecuritySettings(p => ({...p, lockoutDuration: e.target.value}))}
                      className="h-8 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Rate Limit (requests)</Label>
                    <Input type="number"
                      value={securitySettings.rateLimitRequests}
                      onChange={e => setSecuritySettings(p => ({...p, rateLimitRequests: e.target.value}))}
                      className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Window (seconds)</Label>
                    <Input type="number"
                      value={securitySettings.rateLimitWindow}
                      onChange={e => setSecuritySettings(p => ({...p, rateLimitWindow: e.target.value}))}
                      className="h-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Session Timeout (hours)</Label>
                  <Input type="number" min={1} max={168}
                    value={securitySettings.sessionTimeout}
                    onChange={e => setSecuritySettings(p => ({...p, sessionTimeout: e.target.value}))}
                    className="h-8 text-xs w-24" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* IP Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" /> IP Whitelist / Blacklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Allowed IPs (whitelist)</Label>
                  <Input
                    placeholder="e.g. 203.192.12.0/24, 192.168.1.1"
                    value={securitySettings.ipWhitelist}
                    onChange={e => setSecuritySettings(p => ({...p, ipWhitelist: e.target.value}))}
                    className="h-9 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Comma-separated. Leave blank to allow all.</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Blocked IPs (blacklist)</Label>
                  <Input
                    placeholder="e.g. 45.142.212.98, 103.253.145.0/24"
                    value={securitySettings.ipBlacklist}
                    onChange={e => setSecuritySettings(p => ({...p, ipBlacklist: e.target.value}))}
                    className="h-9 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">Comma-separated. These IPs are denied access.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button size="sm" variant="outline" className="gap-1.5 h-9 text-xs">
              <RotateCcw className="w-4 h-4" /> Revert Defaults
            </Button>
            <Button size="sm" className="gap-1.5 h-9 text-xs">
              <Save className="w-4 h-4" /> Save Security Config
            </Button>
          </div>
        </TabsContent>

        {/* ─── FEATURES TAB ─── */}
        <TabsContent value="features" className="mt-4 space-y-6">

          {/* Launch Control Banner */}
          <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 to-pink-500/10 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex-shrink-0">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">Launch Control Centre</p>
                  <p className="text-sm text-muted-foreground">
                    Toggle the app between <strong>Live / Published</strong> and <strong>Maintenance / Staging</strong> mode.
                    All feature flags, API keys, and readiness checks must pass before going public.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs gap-1 border-green-300 text-green-700 bg-green-50">
                  <CheckCircle className="w-3 h-3" /> 28/30 Checks Passing
                </Badge>
                <Button size="sm" className="h-9 gap-1.5 bg-gradient-to-r from-primary to-pink-500 text-white hover:opacity-90">
                  <Globe className="w-4 h-4" /> Take App Live
                </Button>
              </div>
            </div>

            {/* Readiness checklist */}
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Payment Gateway",    status: "ok",    desc: "Razorpay live keys configured" },
                { label: "KYC Verification",    status: "ok",    desc: "16 of 20 hosts verified" },
                { label: "Feature Flags",      status: "warn",  desc: "2 features still in testing" },
                { label: "API Health",         status: "ok",    desc: "All 8 platform APIs responding" },
                { label: "CDN / Streaming",    status: "ok",    desc: "RTMP ingest & Cloudflare active" },
                { label: "Push Notifications", status: "ok",    desc: "FCM configured, test sent" },
                { label: "Content Moderation", status: "ok",    desc: "AI moderation + human review ready" },
                { label: "Admin Roster",       status: "ok",    desc: "5 admins active, roles assigned" },
              ].map((check) => (
                <div key={check.label} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${check.status === "ok" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                  {check.status === "ok"
                    ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                  <div>
                    <p className={`text-xs font-semibold ${check.status === "ok" ? "text-emerald-800" : "text-amber-800"}`}>{check.label}</p>
                    <p className="text-[11px] text-muted-foreground">{check.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Header banner */}
          <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-orange-500">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-orange-900">Feature Flag Control Centre</p>
              <p className="text-sm text-orange-700 mt-0.5">
                Enable or disable any Ridhi app feature globally — changes take effect on next session refresh.
                Testing/planned features are locked until promoted to beta.
              </p>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Features",    value: `${totalFeatures}`,                       icon: Layers,     color: "text-purple-600 bg-purple-50" },
              { label: "Live & Enabled",    value: `${enabledFeatures}`,                     icon: CheckCircle,color: "text-green-600 bg-green-50"   },
              { label: "Beta Features",     value: `${betaFeatures}`,                        icon: Zap,        color: "text-blue-600 bg-blue-50"     },
              { label: "In Testing",        value: `${testingFeatures}`,                     icon: Activity,   color: "text-yellow-600 bg-yellow-50" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status legend */}
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <span className="font-semibold text-muted-foreground">Status key:</span>
            {[
              { label: "Live",    cls: "bg-green-100 text-green-700 border-green-200" },
              { label: "Beta",    cls: "bg-blue-100 text-blue-700 border-blue-200"   },
              { label: "Testing", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
              { label: "Disabled",cls: "bg-gray-100 text-gray-600 border-gray-200"  },
            ].map((s) => (
              <Badge key={s.label} variant="outline" className={`text-xs ${s.cls}`}>{s.label}</Badge>
            ))}
            <span className="text-muted-foreground ml-2">· Phase badges show which development phase shipped the feature</span>
          </div>

          {/* Feature categories */}
          {featureFlags.map((cat) => {
            const enabledCount = cat.features.filter(f => f.enabled).length;
            return (
              <Card key={cat.id} className={`border ${cat.borderColor}`}>
                <CardHeader className="py-3 flex flex-row items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${cat.bg}`}>
                      <cat.icon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <span>{cat.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {enabledCount}/{cat.features.length} enabled
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => enableAllInCategory(cat.id)}>
                      <CheckCircle className="w-3 h-3 text-green-600" /> Enable All
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => disableAllInCategory(cat.id)}>
                      <XCircle className="w-3 h-3 text-red-500" /> Disable Live
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {cat.features.map((feat) => {
                      const statusCls: Record<string, string> = {
                        live:     "bg-green-100 text-green-700 border-green-200",
                        beta:     "bg-blue-100 text-blue-700 border-blue-200",
                        testing:  "bg-yellow-100 text-yellow-700 border-yellow-200",
                        disabled: "bg-gray-100 text-gray-600 border-gray-200",
                      };
                      const phaseCls: Record<string, string> = {
                        "1": "bg-purple-100 text-purple-700",
                        "2": "bg-indigo-100 text-indigo-700",
                        "3": "bg-orange-100 text-orange-700",
                      };
                      const isLocked = feat.status === "testing";
                      return (
                        <div
                          key={feat.id}
                          className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                            feat.enabled ? "hover:bg-muted/20" : "hover:bg-muted/10 opacity-70"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className={`font-medium text-sm ${!feat.enabled ? "text-muted-foreground" : ""}`}>
                                {feat.name}
                              </span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 h-4 ${statusCls[feat.status]}`}>
                                {feat.status}
                              </Badge>
                              <Badge variant="secondary" className={`text-[10px] px-1.5 h-4 ${phaseCls[feat.phase] ?? ""}`}>
                                Phase {feat.phase}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                {feat.audience}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{feat.desc}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isLocked ? (
                              <div className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Locked</span>
                              </div>
                            ) : (
                              <>
                                <Switch
                                  checked={feat.enabled}
                                  onCheckedChange={() => toggleFeature(cat.id, feat.id)}
                                />
                                <span className={`text-xs font-medium w-14 ${feat.enabled ? "text-green-600" : "text-muted-foreground"}`}>
                                  {feat.enabled ? "Enabled" : "Disabled"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Upcoming features note */}
          <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center">
            <Flame className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">More features in the pipeline</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Phase 3 features (spin wheel, quiz battles, live shopping, regional feed) are in development.
              Promote a feature from <em>Testing → Beta → Live</em> via the backend config API.
            </p>
          </div>

        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────────────
            FEATURE ANALYTICS TAB
        ───────────────────────────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="mt-4 space-y-6">
          {/* Feature Analytics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Feature Revenue (7d)",    value: "₹32.4L",   icon: Banknote,     color: "text-emerald-600 bg-emerald-50" },
              { label: "Coin Spend (7d)",       value: "1.85M",    icon: Coins,        color: "text-yellow-600 bg-yellow-50" },
              { label: "Avg Revenue/Feature",  value: "₹1.35L",   icon: IndianRupee,  color: "text-purple-600 bg-purple-50" },
              { label: "Top Converting",        value: "Super Like", icon: Award,        color: "text-amber-600 bg-amber-50" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Revenue Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-600" /> Feature Revenue — Last 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Mon", "Saved Posts": 0, "Story Highlights": 0, "Super Likes": 42000, "Profile Prompts": 0, "Ridhi Shop": 5800, "Shop Cart": 4200, "Events": 3100, "Broadcast": 31000 },
                    { name: "Tue", "Saved Posts": 0, "Story Highlights": 0, "Super Likes": 48000, "Profile Prompts": 0, "Ridhi Shop": 7200, "Shop Cart": 5100, "Events": 2800, "Broadcast": 33000 },
                    { name: "Wed", "Saved Posts": 0, "Story Highlights": 0, "Super Likes": 51000, "Profile Prompts": 0, "Ridhi Shop": 6500, "Shop Cart": 3800, "Events": 4500, "Broadcast": 29000 },
                    { name: "Thu", "Saved Posts": 0, "Story Highlights": 0, "Super Likes": 45000, "Profile Prompts": 0, "Ridhi Shop": 8900, "Shop Cart": 6200, "Events": 3200, "Broadcast": 35000 },
                    { name: "Fri", "Saved Posts": 0, "Story Highlights": 0, "Super Likes": 55000, "Profile Prompts": 0, "Ridhi Shop": 9500, "Shop Cart": 7100, "Events": 5100, "Broadcast": 38000 },
                    { name: "Sat", "Saved Posts": 0, "Story Highlights": 0, "Super Likes": 62000, "Profile Prompts": 0, "Ridhi Shop": 12000, "Shop Cart": 9800, "Events": 7800, "Broadcast": 42000 },
                    { name: "Sun", "Saved Posts": 0, "Story Highlights": 0, "Super Likes": 58000, "Profile Prompts": 0, "Ridhi Shop": 10500, "Shop Cart": 8400, "Events": 6200, "Broadcast": 39000 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, ""]} />
                    <Legend />
                    <Bar dataKey="Super Likes" fill="#F59E0B" radius={[4,4,0,0]} />
                    <Bar dataKey="Broadcast" fill="#7B2FBE" radius={[4,4,0,0]} />
                    <Bar dataKey="Ridhi Shop" fill="#06B6D4" radius={[4,4,0,0]} />
                    <Bar dataKey="Shop Cart" fill="#0D9488" radius={[4,4,0,0]} />
                    <Bar dataKey="Events" fill="#F43F5E" radius={[4,4,0,0]} />
                    <Bar dataKey="Saved Posts" fill="#94A3B8" radius={[4,4,0,0]} />
                    <Bar dataKey="Story Highlights" fill="#6366F1" radius={[4,4,0,0]} />
                    <Bar dataKey="Profile Prompts" fill="#8B5CF6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Revenue by Tier */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" /> Revenue by User Tier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: "Free Users", value: 12, color: "#94A3B8" },
                        { name: "Silver VIP", value: 18, color: "#9E9E9E" },
                        { name: "Gold VIP", value: 24, color: "#F59E0B" },
                        { name: "Platinum VIP", value: 28, color: "#7B2FBE" },
                        { name: "Diamond Elite", value: 18, color: "#E91E8C" },
                      ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}%`}>
                        {[
                          { name: "Free Users", value: 12, color: "#94A3B8" },
                          { name: "Silver VIP", value: 18, color: "#9E9E9E" },
                          { name: "Gold VIP", value: 24, color: "#F59E0B" },
                          { name: "Platinum VIP", value: 28, color: "#7B2FBE" },
                          { name: "Diamond Elite", value: 18, color: "#E91E8C" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {[
                    { label: "Free", value: "12%", color: "bg-gray-400" },
                    { label: "Silver", value: "18%", color: "bg-gray-500" },
                    { label: "Gold", value: "24%", color: "bg-amber-500" },
                    { label: "Platinum", value: "28%", color: "bg-purple-600" },
                    { label: "Diamond", value: "18%", color: "bg-pink-600" },
                  ].map((tier) => (
                    <div key={tier.label} className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${tier.color}`} />
                      <p className="text-xs font-medium">{tier.label}</p>
                      <p className="text-xs text-muted-foreground">{tier.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coin Spend by Feature */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-600" /> Coin Spend by Feature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Super Likes", coins: 482000, revenue: 482000, pct: 28, color: "bg-amber-500", icon: StarIcon },
                    { label: "Broadcast Messages", coins: 310000, revenue: 310000, pct: 18, color: "bg-purple-600", icon: RadioIcon },
                    { label: "Audio Calls", coins: 245000, revenue: 245000, pct: 14, color: "bg-emerald-500", icon: Phone },
                    { label: "Video Calls", coins: 198000, revenue: 198000, pct: 11, color: "bg-blue-500", icon: Video },
                    { label: "Shop Purchases", coins: 156000, revenue: 156000, pct: 9, color: "bg-teal-500", icon: ShoppingBag },
                    { label: "Shop Cart (Bulk)", coins: 89000, revenue: 89000, pct: 5, color: "bg-teal-700", icon: ShoppingBag },
                    { label: "Event Creation", coins: 98000, revenue: 98000, pct: 6, color: "bg-rose-500", icon: Calendar },
                    { label: "Backtracks", coins: 72000, revenue: 72000, pct: 4, color: "bg-orange-500", icon: ArrowRightLeft },
                    { label: "Boost Posts", coins: 65000, revenue: 65000, pct: 4, color: "bg-indigo-500", icon: TrendingUpIcon },
                    { label: "AI Queries", coins: 42000, revenue: 42000, pct: 3, color: "bg-cyan-500", icon: Cpu },
                    { label: "Unlock Messages", coins: 28000, revenue: 28000, pct: 2, color: "bg-pink-500", icon: MessageSquare },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${row.color} bg-opacity-10`}>
                        <row.icon className={`w-3.5 h-3.5 ${row.color.replace("bg-", "text-")}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{row.label}</span>
                          <span className="text-muted-foreground">{row.coins.toLocaleString()} coins · ₹{row.revenue.toLocaleString()}</span>
                        </div>
                        <Progress value={row.pct} className="h-1.5 mt-1" />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right">{row.pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total coins spent: 1.85M · Total revenue: ₹32.4L</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => {
                    const rows = [
                      { label: "Super Likes", coins: 482000, revenue: 482000, pct: 28 },
                      { label: "Broadcast Messages", coins: 310000, revenue: 310000, pct: 18 },
                      { label: "Audio Calls", coins: 245000, revenue: 245000, pct: 14 },
                      { label: "Video Calls", coins: 198000, revenue: 198000, pct: 11 },
                      { label: "Shop Purchases", coins: 156000, revenue: 156000, pct: 9 },
                      { label: "Shop Cart (Bulk)", coins: 89000, revenue: 89000, pct: 5 },
                      { label: "Event Creation", coins: 98000, revenue: 98000, pct: 6 },
                      { label: "Backtracks", coins: 72000, revenue: 72000, pct: 4 },
                      { label: "Boost Posts", coins: 65000, revenue: 65000, pct: 4 },
                      { label: "AI Queries", coins: 42000, revenue: 42000, pct: 3 },
                      { label: "Unlock Messages", coins: 28000, revenue: 28000, pct: 2 },
                    ];
                    downloadCSV("feature_revenue.csv", rows);
                  }}>
                    <Download className="w-3 h-3" /> Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Benefit Usage by Tier */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" /> Feature Benefit Uptake by VIP Tier
              </CardTitle>
              <p className="text-xs text-muted-foreground">How many users in each tier actively use their unlocked features</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left p-3 font-medium">Feature</th>
                      <th className="text-center p-3 font-medium">Free</th>
                      <th className="text-center p-3 font-medium">Silver</th>
                      <th className="text-center p-3 font-medium">Gold</th>
                      <th className="text-center p-3 font-medium">Platinum</th>
                      <th className="text-center p-3 font-medium">Diamond</th>
                      <th className="text-right p-3 font-medium">Total Users</th>
                      <th className="text-right p-3 font-medium">Revenue (₹)</th>
                      <th className="text-right p-3 font-medium">Uptake %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Super Likes", icon: StarIcon, free: "2.4K", silver: "8.2K", gold: "12.4K", platinum: "6.8K", diamond: "3.1K", total: "32.9K", revenue: "4,82,000", uptake: "68%", color: "text-amber-600" },
                      { feature: "Backtrack", icon: ArrowRightLeft, free: "0", silver: "4.1K", gold: "6.2K", platinum: "3.8K", diamond: "1.9K", total: "16.0K", revenue: "72,000", uptake: "42%", color: "text-orange-600" },
                      { feature: "Saved Posts", icon: Bookmark, free: "1.8K", silver: "5.4K", gold: "8.1K", platinum: "4.5K", diamond: "2.2K", total: "22.0K", revenue: "0", uptake: "31%", color: "text-slate-600" },
                      { feature: "Story Highlights", icon: Image, free: "0", silver: "2.8K", gold: "5.6K", platinum: "3.4K", diamond: "1.8K", total: "13.6K", revenue: "0", uptake: "24%", color: "text-indigo-600" },
                      { feature: "Profile Prompts", icon: HelpCircle, free: "0", silver: "1.2K", gold: "3.8K", platinum: "2.9K", diamond: "1.5K", total: "9.4K", revenue: "0", uptake: "18%", color: "text-violet-600" },
                      { feature: "Ridhi Shop", icon: ShoppingBag, free: "0.8K", silver: "2.1K", gold: "4.2K", platinum: "2.6K", diamond: "1.4K", total: "11.1K", revenue: "1,56,000", uptake: "38%", color: "text-teal-600" },
                    { feature: "Shop Cart", icon: ShoppingBag, free: "0.4K", silver: "1.2K", gold: "2.5K", platinum: "1.8K", diamond: "1.1K", total: "7.0K", revenue: "89,000", uptake: "31%", color: "text-teal-700" },
                      { feature: "Events", icon: Calendar, free: "0", silver: "1.5K", gold: "2.8K", platinum: "1.6K", diamond: "0.9K", total: "6.8K", revenue: "98,000", uptake: "28%", color: "text-rose-600" },
                      { feature: "Broadcast Channels", icon: RadioIcon, free: "0", silver: "0", gold: "1.2K", platinum: "0.8K", diamond: "0.5K", total: "2.5K", revenue: "3,10,000", uptake: "22%", color: "text-purple-600" },
                    ].map((row, i) => (
                      <tr key={i} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <row.icon className={`w-3.5 h-3.5 ${row.color}`} />
                            <span className="font-medium text-xs">{row.feature}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-xs">{row.free}</td>
                        <td className="p-3 text-center text-xs">{row.silver}</td>
                        <td className="p-3 text-center text-xs">{row.gold}</td>
                        <td className="p-3 text-center text-xs">{row.platinum}</td>
                        <td className="p-3 text-center text-xs">{row.diamond}</td>
                        <td className="p-3 text-right text-xs font-semibold">{row.total}</td>
                        <td className="p-3 text-right text-xs font-semibold">{row.revenue}</td>
                        <td className="p-3 text-right text-xs">
                          <Badge variant="outline" className={`text-xs ${row.uptake.replace("%", "") > "50" ? "bg-green-50 text-green-700 border-green-200" : row.uptake.replace("%", "") > "30" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                            {row.uptake}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Total users across all tiers: 1.24M active · Revenue: ₹32.4L (7-day)</p>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => {
                  const rows = [
                    { feature: "Super Likes", free: "2.4K", silver: "8.2K", gold: "12.4K", platinum: "6.8K", diamond: "3.1K", total: "32.9K", revenue: "4,82,000", uptake: "68%" },
                    { feature: "Backtrack", free: "0", silver: "4.1K", gold: "6.2K", platinum: "3.8K", diamond: "1.9K", total: "16.0K", revenue: "72,000", uptake: "42%" },
                    { feature: "Saved Posts", free: "1.8K", silver: "5.4K", gold: "8.1K", platinum: "4.5K", diamond: "2.2K", total: "22.0K", revenue: "0", uptake: "31%" },
                    { feature: "Story Highlights", free: "0", silver: "2.8K", gold: "5.6K", platinum: "3.4K", diamond: "1.8K", total: "13.6K", revenue: "0", uptake: "24%" },
                    { feature: "Profile Prompts", free: "0", silver: "1.2K", gold: "3.8K", platinum: "2.9K", diamond: "1.5K", total: "9.4K", revenue: "0", uptake: "18%" },
                    { feature: "Ridhi Shop", free: "0.8K", silver: "2.1K", gold: "4.2K", platinum: "2.6K", diamond: "1.4K", total: "11.1K", revenue: "1,56,000", uptake: "38%" },
                    { feature: "Shop Cart", free: "0.4K", silver: "1.2K", gold: "2.5K", platinum: "1.8K", diamond: "1.1K", total: "7.0K", revenue: "89,000", uptake: "31%" },
                    { feature: "Events", free: "0", silver: "1.5K", gold: "2.8K", platinum: "1.6K", diamond: "0.9K", total: "6.8K", revenue: "98,000", uptake: "28%" },
                    { feature: "Broadcast Channels", free: "0", silver: "0", gold: "1.2K", platinum: "0.8K", diamond: "0.5K", total: "2.5K", revenue: "3,10,000", uptake: "22%" },
                  ];
                  downloadCSV("feature_uptake_by_tier.csv", rows);
                }}>
                  <Download className="w-3 h-3" /> Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend Over Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" /> Revenue Trend — Monthly Feature Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: "Jan", "Super Likes": 320, "Broadcast": 180, "Ridhi Shop": 45, "Events": 28, "Profile Prompts": 0, "Story Highlights": 0, "Saved Posts": 0 },
                    { month: "Feb", "Super Likes": 380, "Broadcast": 220, "Ridhi Shop": 58, "Events": 35, "Profile Prompts": 0, "Story Highlights": 0, "Saved Posts": 0 },
                    { month: "Mar", "Super Likes": 450, "Broadcast": 290, "Ridhi Shop": 72, "Events": 48, "Profile Prompts": 0, "Story Highlights": 0, "Saved Posts": 0 },
                    { month: "Apr", "Super Likes": 520, "Broadcast": 380, "Ridhi Shop": 88, "Events": 58, "Profile Prompts": 0, "Story Highlights": 0, "Saved Posts": 0 },
                    { month: "May", "Super Likes": 610, "Broadcast": 450, "Ridhi Shop": 105, "Events": 72, "Profile Prompts": 0, "Story Highlights": 0, "Saved Posts": 0 },
                    { month: "Jun", "Super Likes": 720, "Broadcast": 520, "Ridhi Shop": 120, "Events": 85, "Profile Prompts": 0, "Story Highlights": 0, "Saved Posts": 0 },
                    { month: "Jul", "Super Likes": 850, "Broadcast": 590, "Ridhi Shop": 145, "Events": 98, "Profile Prompts": 0, "Story Highlights": 0, "Saved Posts": 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}K`} />
                    <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}K`, ""]} />
                    <Legend />
                    <Area type="monotone" dataKey="Super Likes" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="Broadcast" stackId="1" stroke="#7B2FBE" fill="#7B2FBE" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="Ridhi Shop" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="Events" stackId="1" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Export Summary */}
          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
            <div>
              <p className="text-sm font-semibold">Feature Analytics Report</p>
              <p className="text-xs text-muted-foreground">All data is mock/demo for presentation. Connect to real API for live analytics.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => {
                const rows = [
                  { metric: "Feature Revenue (7d)", value: "₹32.4L" },
                  { metric: "Coin Spend (7d)", value: "1.85M" },
                  { metric: "Top Converting Feature", value: "Super Likes (68% uptake)" },
                  { metric: "Highest Revenue Feature", value: "Super Likes (₹4.82L)" },
                  { metric: "Highest Revenue/Tier", value: "Platinum (28%)" },
                ];
                downloadCSV("feature_analytics_summary.csv", rows);
              }}>
                <Download className="w-3 h-3" /> Export Summary
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────────────
            API KEYS & CONFIG TAB
        ───────────────────────────────────────────────────────────────────── */}
        <TabsContent value="apikeys" className="mt-4 space-y-6">

          {/* Security banner */}
          <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-purple-900 text-sm">Super Admin · Full API Access</p>
              <p className="text-xs text-purple-700 mt-0.5">
                All keys are encrypted at rest. Revealed keys are masked by default — click <strong>Reveal</strong> to view, <strong>Save</strong> to persist changes.
                Changes here update the live environment immediately.
              </p>
            </div>
          </div>

          {/* ── Section helper component inline ── */}
          {(() => {

            type StringApiKey = {
              [K in keyof typeof apiKeys]: (typeof apiKeys)[K] extends string ? K : never;
            }[keyof typeof apiKeys];

            const KeyField = ({
              label, field, type = "text", placeholder, hint,
            }: {
              label: string; field: StringApiKey; type?: string; placeholder?: string; hint?: string;
            }) => {
              const revealed = revealedKeys[field];
              const val = apiKeys[field];
              const isSensitive = field.toLowerCase().includes("secret") || field.toLowerCase().includes("key") || field.toLowerCase().includes("cert") || field.toLowerCase().includes("token");
              return (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">{label}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={isSensitive && !revealed ? "password" : "text"}
                        value={val}
                        onChange={e => setApiKeys(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={placeholder ?? `Enter ${label}`}
                        className="h-8 text-xs pr-8 font-mono"
                      />
                      {isSensitive && (
                        <button
                          onClick={() => toggleReveal(field)}
                          className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground"
                        >
                          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
                </div>
              );
            };

            const SectionHeader = ({
              icon: Icon, title, desc, color = "text-purple-600", bg = "bg-purple-50",
              testKey, saved,
            }: {
              icon: React.ComponentType<{className?: string}>; title: string; desc: string;
              color?: string; bg?: string; testKey?: string; saved?: boolean;
            }) => (
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {testKey && (
                    <Button
                      size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => handleTest(testKey)}
                    >
                      {testResults[testKey] === null ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : testResults[testKey] === "ok" ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : testResults[testKey] === "fail" ? (
                        <XCircle className="w-3 h-3 text-red-500" />
                      ) : (
                        <TestTube className="w-3 h-3" />
                      )}
                      {testResults[testKey] === "ok" ? "Connected" : testResults[testKey] === "fail" ? "Failed" : "Test"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleSaveKey(testKey ?? title)}
                  >
                    {saved ? <CheckCircle className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    {saved ? "Saved!" : "Save"}
                  </Button>
                </div>
              </div>
            );

            const NumField = ({
              label, field, prefix, suffix, min, max,
            }: {
              label: string; field: keyof typeof coinConfig; prefix?: string; suffix?: string; min?: number; max?: number;
            }) => (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">{label}</Label>
                <div className="flex gap-1.5 items-center">
                  {prefix && <span className="text-xs text-muted-foreground font-medium">{prefix}</span>}
                  <Input
                    type="number"
                    value={coinConfig[field] as string}
                    onChange={e => setCoinConfig(prev => ({ ...prev, [field]: e.target.value }))}
                    min={min} max={max}
                    className="h-8 text-xs w-24"
                  />
                  {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
                </div>
              </div>
            );

            return (
              <div className="space-y-5">

                {/* ─── 1. OTP Provider Switcher ───────────────────────────── */}
                <OTPProviderCard />

                {/* ─── 2. Payment Gateway Provider Switcher ─────────────────── */}
                <PaymentProviderCard />

                {/* ─── 3. OTP & SMS (MSG91) ─────────────────────────────────── */}
                <Card>
                  <CardContent className="p-5">
                    <SectionHeader
                      icon={Smartphone} title="OTP & SMS — MSG91"
                      desc="Phone number OTP login, transactional SMS, promotional messages"
                      color="text-green-600" bg="bg-green-50"
                      testKey="msg91" saved={savedKeys["msg91"]}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <KeyField label="MSG91 Auth Key" field="msg91AuthKey"
                        hint="Your MSG91 account authentication key" />
                      <KeyField label="OTP Template ID" field="msg91OtpTemplate"
                        hint="Used for 6-digit phone OTP login (Phase 1)" />
                      <KeyField label="SMS Template ID" field="msg91SmsTemplate"
                        placeholder="e.g. 6447a9d5d6fc051..."
                        hint="For transactional & promotional SMS campaigns" />
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-foreground">Unicode SMS</p>
                          <p className="text-[10px] text-muted-foreground">Transactional & promo only</p>
                        </div>
                        <Switch
                          checked={apiKeys.msg91Unicode}
                          onCheckedChange={v => setApiKeys(p => ({...p, msg91Unicode: v}))}
                        />
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between gap-3 md:col-span-2">
                        <div>
                          <p className="text-xs font-medium text-foreground">Default SMS Language</p>
                          <p className="text-[10px] text-muted-foreground">Transactional & promo only. OTP always English.</p>
                        </div>
                        <select
                          value={apiKeys.msg91DefaultLang}
                          onChange={e => setApiKeys(p => ({...p, msg91DefaultLang: e.target.value}))}
                          className="h-8 text-xs rounded-md border border-input bg-background px-2"
                        >
                          <option value="en">English</option>
                          <option value="hi">हिन्दी (Hindi)</option>
                          <option value="ta">தமிழ् (Tamil)</option>
                          <option value="te">తెలుగु (Telugu)</option>
                          <option value="bn">বাংলা (Bengali)</option>
                          <option value="mr">मराठी (Marathi)</option>
                          <option value="gu">ગુજરાતी (Gujarati)</option>
                          <option value="kn">ಕನ್ನಡ (Kannada)</option>
                          <option value="ml">മലയാളം (Malayalam)</option>
                          <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                          <option value="ur">اردو (Urdu)</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />
                      OTP is always sent in English for reliability. Unicode & regional languages apply to transactional & promotional SMS only. DLT registration required per language.
                    </div>
                  </CardContent>
                </Card>

                {/* ─── 2. WhatsApp (MSG91) ──────────────────────────────────── */}
                <Card>
                  <CardContent className="p-5">
                    <SectionHeader
                      icon={MessageCircle} title="WhatsApp Business — MSG91"
                      desc="Send OTP, welcome messages, gift notifications & promo via WhatsApp"
                      color="text-emerald-600" bg="bg-emerald-50"
                      testKey="whatsapp" saved={savedKeys["whatsapp"]}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <KeyField label="WhatsApp Integrated Number" field="msg91WaNumber"
                        placeholder="e.g. 919XXXXXXXXX"
                        hint="MSG91 WhatsApp Business number (with country code)" />
                      <KeyField label="WhatsApp Template ID" field="msg91WaTemplate"
                        placeholder="e.g. wa_tmpl_XXXXXXX"
                        hint="Approved WhatsApp message template ID" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: "OTP via WhatsApp",        desc: "6-digit OTP through WA",     id: "wa_otp" },
                        { label: "Gift Notification",       desc: "Alert when user receives gift",id: "wa_gift" },
                        { label: "Promo Messages",          desc: "Offers & coin pack deals",    id: "wa_promo" },
                      ].map(item => (
                        <div key={item.id}
                          className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-foreground">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                          </div>
                          <Switch defaultChecked={item.id === "wa_otp"} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ─── 3. Payment Gateways ──────────────────────────────────── */}
                <Card>
                  <CardContent className="p-5">
                    <SectionHeader
                      icon={CreditCard} title="Payment Gateways — Razorpay"
                      desc="Coin recharge, VIP subscriptions, ad payments & host payouts"
                      color="text-blue-600" bg="bg-blue-50"
                      testKey="razorpay" saved={savedKeys["razorpay"]}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <KeyField label="Razorpay Key ID" field="razorpayKeyId"
                        hint="Public key — used in the frontend payment sheet" />
                      <KeyField label="Razorpay Key Secret" field="razorpayKeySecret"
                        hint="Private key — server-side only, never exposed to client" />
                    </div>
                    <Separator className="mb-4" />
                    <p className="text-xs font-semibold text-foreground mb-3">Payment Methods Enabled</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "UPI / QR", icon: "📱", enabled: true },
                        { label: "Cards",    icon: "💳", enabled: true },
                        { label: "NetBanking",icon: "🏦", enabled: true },
                        { label: "Wallets",  icon: "👜", enabled: true },
                        { label: "Google Pay",icon: "🟢", enabled: true },
                        { label: "PhonePe",  icon: "🟣", enabled: false },
                        { label: "BNPL",     icon: "⏳", enabled: false },
                        { label: "EMI",      icon: "📅", enabled: true },
                      ].map(pm => (
                        <div key={pm.label}
                          className="rounded-lg border p-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span>{pm.icon}</span>
                            <span className="text-xs font-medium">{pm.label}</span>
                          </div>
                          <Switch defaultChecked={pm.enabled} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ─── 4. Audio & Video Calls (Agora) ──────────────────────── */}
                <Card>
                  <CardContent className="p-5">
                    <SectionHeader
                      icon={PhoneCall} title="Audio & Video Calls — Agora RTC"
                      desc="Real-time audio/video calls between users and hosts. Per-minute coin billing."
                      color="text-violet-600" bg="bg-violet-50"
                      testKey="agora" saved={savedKeys["agora"]}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <KeyField label="Agora App ID" field="agoraAppId"
                        hint="From your Agora Console project settings" />
                      <KeyField label="Agora App Certificate" field="agoraCert"
                        hint="Used to generate secure channel tokens server-side" />
                    </div>
                    <Separator className="mb-4" />
                    <p className="text-xs font-semibold text-foreground mb-3">Call Pricing (Ridhi Coins = ₹)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Audio Call Rate</Label>
                        <div className="flex gap-1.5 items-center">
                          <Input type="number" value={apiKeys.agoraAudioRate}
                            onChange={e => setApiKeys(p => ({...p, agoraAudioRate: e.target.value}))}
                            className="h-8 text-xs w-20" />
                          <span className="text-xs text-muted-foreground">coins/min</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Video Call Rate</Label>
                        <div className="flex gap-1.5 items-center">
                          <Input type="number" value={apiKeys.agoraVideoRate}
                            onChange={e => setApiKeys(p => ({...p, agoraVideoRate: e.target.value}))}
                            className="h-8 text-xs w-20" />
                          <span className="text-xs text-muted-foreground">coins/min</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <p className="text-xs font-semibold text-foreground mb-3">Backup SDK — Zego (optional)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <KeyField label="Zego App ID" field="zegoAppId"
                        placeholder="e.g. 1234567890"
                        hint="Alternative RTC SDK — leave blank if not used" />
                      <KeyField label="Zego App Certificate" field="zegoCert"
                        placeholder="e.g. zego_cert_..."
                        hint="Zego app secret for token generation" />
                    </div>
                    <Separator className="my-4" />
                    <p className="text-xs font-semibold text-foreground mb-3">Backup SDK — 100ms (optional)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <KeyField label="100ms App ID" field="hmsAppId"
                        placeholder="e.g. 64f8a2b3c4d5e6f7a8b9c0d1"
                        hint="100ms dashboard → Developer → App ID" />
                      <KeyField label="100ms Management Token" field="hmsToken"
                        placeholder="e.g. HMSToken_..."
                        hint="100ms dashboard → Developer → Management Token" />
                    </div>
                  </CardContent>
                </Card>

                {/* ─── 5. Live Streaming ────────────────────────────────────── */}
                <Card>
                  <CardContent className="p-5">
                    <SectionHeader
                      icon={Cast} title="Live Streaming"
                      desc="RTMP ingest, CDN distribution, recording & stream tokens"
                      color="text-red-600" bg="bg-red-50"
                      testKey="streaming" saved={savedKeys["streaming"]}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <KeyField label="RTMP Ingest URL" field="streamingCdnUrl"
                        hint="Stream endpoint — broadcasters push to this URL" />
                      <KeyField label="Streaming Secret / Token" field="streamingSecret"
                        hint="Server key used to sign stream tokens" />
                    </div>
                    <Separator className="mb-4" />
                    <p className="text-xs font-semibold text-foreground mb-3">Live Stream Settings</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: "Auto-record all lives",    key: "autoRecord",      default: true },
                        { label: "AI moderation on stream",  key: "aiModLive",       default: true },
                        { label: "Gift animations enabled",  key: "giftAnim",        default: true },
                        { label: "PK Battle mode",           key: "pkBattle",        default: true },
                        { label: "Co-host invitations",      key: "cohost",          default: true },
                        { label: "Clip sharing (30s)",       key: "clipShare",       default: false },
                      ].map(s => (
                        <div key={s.key} className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between gap-3">
                          <p className="text-xs font-medium text-foreground">{s.label}</p>
                          <Switch defaultChecked={s.default} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ─── 6. Push Notifications (FCM) & AI ────────────────────── */}
                <Card>
                  <CardContent className="p-5">
                    <SectionHeader
                      icon={Bell} title="Push Notifications — Firebase & AI"
                      desc="FCM push alerts, OpenAI moderation & content tools, AWS media storage"
                      color="text-orange-600" bg="bg-orange-50"
                      testKey="fcm" saved={savedKeys["fcm"]}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <KeyField label="FCM Server Key" field="fcmServerKey"
                        hint="Firebase Cloud Messaging server key (Android & iOS push)" />
                      <KeyField label="FCM Sender ID" field="fcmSenderId"
                        hint="Firebase project sender ID" />
                      <KeyField label="OpenAI API Key" field="openAiKey"
                        hint="GPT-4 for AI moderation, captions, Priya AI assistant" />
                      <KeyField label="AWS S3 Bucket" field="awsS3Bucket"
                        hint="S3 bucket name for media storage" />
                      <KeyField label="AWS Access Key ID" field="awsAccessKey"
                        hint="IAM access key for S3 media uploads" />
                      <KeyField label="AWS Secret Access Key" field="awsSecretKey"
                        hint="IAM secret key (never expose to clients)" />
                    </div>
                  </CardContent>
                </Card>

                {/* ─── 7. Approvals Configuration ───────────────────────────── */}
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-50">
                          <ClipboardCheck className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Approvals & Workflows</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Control which actions require manual Super Admin approval before going live
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="h-7 text-xs gap-1"
                        onClick={() => handleSaveKey("approvals")}>
                        {savedKeys["approvals"] ? <CheckCircle className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                        {savedKeys["approvals"] ? "Saved!" : "Save"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { label: "Host Registration",        desc: "New hosts need approval before earning", field: "hostRegistration" as const },
                        { label: "Agent Registration",       desc: "New agents need Super Admin sign-off",   field: "agentRegistration" as const },
                        { label: "Withdrawal Requests",      desc: "Manual review before bank transfer",     field: "withdrawalApproval" as const },
                        { label: "KYC Verification",         desc: "Admin reviews Aadhaar/PAN uploads",      field: "kycApproval" as const },
                        { label: "Content Moderation Flag",  desc: "Flagged content needs manual decision",  field: "contentApproval" as const },
                        { label: "Live Stream Start",        desc: "Hosts need approval to go live",         field: "liveStreamApproval" as const },
                        { label: "Podcast Publishing",       desc: "Episodes reviewed before publish",       field: "podcastPublish" as const },
                        { label: "Manual Coin Add/Remove",   desc: "Coin adjustments need 2FA + approval",   field: "coinManualAdd" as const },
                        { label: "Ads Approval",             desc: "Business ads reviewed before going live",field: "adsApproval" as const },
                      ].map(item => (
                        <div key={item.field}
                          className="rounded-lg border p-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-foreground">{item.label}</p>
                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={approvalConfig[item.field]}
                              onCheckedChange={v => setApprovalConfig(p => ({...p, [item.field]: v}))}
                            />
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 h-4 ${approvalConfig[item.field] ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                            >
                              {approvalConfig[item.field] ? "Required" : "Auto"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />
                    <p className="text-xs font-semibold text-foreground mb-3">Auto-Approval Thresholds</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Auto-approve withdrawals below</Label>
                        <div className="flex gap-1.5 items-center">
                          <span className="text-xs text-muted-foreground">₹</span>
                          <Input type="number"
                            value={approvalConfig.withdrawAutoThreshold}
                            onChange={e => setApprovalConfig(p => ({...p, withdrawAutoThreshold: e.target.value}))}
                            className="h-8 text-xs w-28" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Set 0 to disable auto-approve</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Auto-approve KYC</Label>
                        <div className="flex items-center gap-2 h-8">
                          <Switch
                            checked={approvalConfig.autoApproveKyc}
                            onCheckedChange={v => setApprovalConfig(p => ({...p, autoApproveKyc: v}))}
                          />
                          <span className="text-xs text-muted-foreground">
                            {approvalConfig.autoApproveKyc ? "AI auto-approves KYC" : "Manual review"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ─── 8 + 9 + 10. Coin Auto Generation, Values & Distribution ── */}
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-yellow-50">
                          <Coins className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Coin Economy — Auto Generation, Values & Distribution</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Control the entire coin economy: how coins are generated, what they're worth, and how revenue is split
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="h-7 text-xs gap-1"
                        onClick={() => handleSaveKey("coins")}>
                        {savedKeys["coins"] ? <CheckCircle className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                        {savedKeys["coins"] ? "Saved!" : "Save"}
                      </Button>
                    </div>

                    {/* Coin Value */}
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4 mb-5">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="text-sm font-bold text-foreground flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-yellow-600" />
                            Master Coin Value
                          </p>
                          <p className="text-xs text-muted-foreground">1 Ridhi Coin = this many Indian Rupees</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-medium">₹</span>
                          <Input
                            type="number" step="0.01"
                            value={coinConfig.coinValueInr}
                            onChange={e => setCoinConfig(p => ({...p, coinValueInr: e.target.value}))}
                            className="h-9 text-sm font-bold w-24"
                          />
                          <span className="text-xs text-muted-foreground">per coin</span>
                        </div>
                      </div>
                    </div>

                    {/* Auto Generation */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-yellow-600" />
                          Auto Coin Generation Rules
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Master toggle</span>
                          <Switch
                            checked={coinConfig.autoGenEnabled}
                            onCheckedChange={v => setCoinConfig(p => ({...p, autoGenEnabled: v}))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <NumField label="Watch 1 Reel" field="autoGenWatchReel" suffix="coins" min={0} max={50} />
                        <NumField label="Like a Post" field="autoGenPostLike" suffix="coins" min={0} max={10} />
                        <NumField label="Referral Bonus" field="autoGenReferral" suffix="coins" min={0} max={1000} />
                        <NumField label="Daily Mission Max" field="missionDailyMax" suffix="coins/day" min={0} />
                        <NumField label="Bonus Multiplier" field="bonusMultiplier" prefix="×" min={1} max={10} />
                      </div>
                    </div>

                    <Separator className="mb-5" />

                    {/* Coin Spend Rates */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                        Coin Spend Rates (1 Coin = ₹{coinConfig.coinValueInr})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <NumField label="Super Like" field="superLikeCost" suffix="coins" min={1} />
                        <NumField label="Backtrack" field="backtrackCost" suffix="coins" min={1} />
                        <NumField label="Audio Call" field="audioCallCostPerMin" suffix="coins/min" min={1} />
                        <NumField label="Video Call" field="videoCallCostPerMin" suffix="coins/min" min={1} />
                        <NumField label="Boost Post" field="boostPostCostPerHr" suffix="coins/hr" min={1} />
                        <NumField label="Unlock Message" field="unlockMsgCost" suffix="coins" min={1} />
                        <NumField label="AI Query" field="aiQueryCost" suffix="coins" min={1} />
                        <NumField label="Shop Purchase" field="shopItemCost" suffix="coins" min={1} />
                        <NumField label="Event Creation" field="eventCreationCost" suffix="coins" min={1} />
                        <NumField label="Broadcast Msg" field="broadcastMsgCost" suffix="coins" min={1} />
                      </div>
                    </div>

                    <Separator className="mb-5" />

                    {/* Revenue Distribution */}
                    <div>
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                        <GitMerge className="w-3.5 h-3.5 text-pink-600" />
                        Gift & Call Revenue Distribution
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        When a user sends a gift or pays for a call, coins are split across:
                      </p>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-pink-700 font-semibold">Creator / Host</Label>
                          <div className="flex items-center gap-1.5">
                            <Input type="number" value={coinConfig.creatorRevShare}
                              onChange={e => setCoinConfig(p => ({...p, creatorRevShare: e.target.value}))}
                              className="h-8 text-xs w-20" min={0} max={100} />
                            <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-purple-700 font-semibold">Platform (Ridhi)</Label>
                          <div className="flex items-center gap-1.5">
                            <Input type="number" value={coinConfig.platformRevShare}
                              onChange={e => setCoinConfig(p => ({...p, platformRevShare: e.target.value}))}
                              className="h-8 text-xs w-20" min={0} max={100} />
                            <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-blue-700 font-semibold">Agent Commission</Label>
                          <div className="flex items-center gap-1.5">
                            <Input type="number" value={coinConfig.agentRevShare}
                              onChange={e => setCoinConfig(p => ({...p, agentRevShare: e.target.value}))}
                              className="h-8 text-xs w-20" min={0} max={100} />
                            <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                      {/* Distribution bar */}
                      <div className="rounded-lg overflow-hidden h-5 flex">
                        <div className="bg-pink-500 flex items-center justify-center text-[9px] font-bold text-white transition-all"
                          style={{ width: `${coinConfig.creatorRevShare}%` }}>
                          {coinConfig.creatorRevShare}%
                        </div>
                        <div className="bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white transition-all"
                          style={{ width: `${coinConfig.platformRevShare}%` }}>
                          {coinConfig.platformRevShare}%
                        </div>
                        <div className="bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white transition-all"
                          style={{ width: `${coinConfig.agentRevShare}%` }}>
                          {coinConfig.agentRevShare}%
                        </div>
                      </div>
                      <div className="flex gap-4 mt-1.5">
                        <span className="text-[10px] text-pink-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500 inline-block"/> Creator</span>
                        <span className="text-[10px] text-purple-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600 inline-block"/> Platform</span>
                        <span className="text-[10px] text-blue-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> Agent</span>
                      </div>

                      <Separator className="my-4" />
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-3">
                        <Banknote className="w-3.5 h-3.5 text-green-600" />
                        Withdrawal Settings
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <NumField label="Minimum Withdrawal" field="withdrawMin" prefix="₹" min={100} />
                        <NumField label="Platform Fee on Withdrawal" field="withdrawPlatformFee" suffix="%" min={0} max={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            );
          })()}

        </TabsContent>

        {/* ─── COMMERCIAL ADS TAB ─── */}
        <TabsContent value="commercial-ads" className="mt-4 space-y-6">
          {(() => {
            const SA_BANNERS = [
              { id: "cb1", title: "Ridhi Premium Launch",  style: "gradient", from: "#7B2FBE", to: "#E91E8C", status: "active",    placements: 2, impressions: 124000, clicks: 9840,  ctr: "7.9%", anim: "Fade",     spend: "₹0",      priority: 1 },
              { id: "cb3", title: "Night Mode Live Launch",style: "neon_glow",from: "#0F0F1A", to: "#1A0A2E", status: "active",    placements: 2, impressions:  58200, clicks: 6140,  ctr: "10.5%",anim: "Pulse",    spend: "₹0",      priority: 2 },
              { id: "cb5", title: "New User Welcome",      style: "frosted",  from: "#C9D6FF", to: "#E2E2E2", status: "active",    placements: 1, impressions: 310000, clicks: 87400, ctr: "28.2%",anim: "Slide In", spend: "₹0",      priority: 3 },
              { id: "cb4", title: "IPL Prediction Contest",style: "sports",   from: "#FF0844", to: "#FFB199", status: "paused",    placements: 3, impressions:  34500, clicks: 4200,  ctr: "12.2%",anim: "Shimmer",  spend: "₹48,000", priority: 4 },
              { id: "cb2", title: "Diwali Coin Bonanza",   style: "festive",  from: "#FF6B00", to: "#FFD700", status: "scheduled", placements: 3, impressions:       0, clicks:    0,  ctr: "—",    anim: "Bounce",   spend: "₹0",      priority: 5 },
            ];

            const SA_PLACEMENTS = [
              { label: "Feed (In-line)",      active: 3, total: 8  },
              { label: "Top Bar",             active: 2, total: 4  },
              { label: "Bottom Sticky",       active: 1, total: 3  },
              { label: "Between Stories",     active: 1, total: 5  },
              { label: "Explore Page",        active: 2, total: 6  },
              { label: "Chat Header",         active: 1, total: 3  },
            ];

            const globalBannerToggles = [
              { key: "feed_banners",     label: "Feed Banners",          desc: "Commercial banners in the main feed scroll" },
              { key: "top_banners",      label: "Top Bar Banners",       desc: "Sticky banners pinned to top of screen" },
              { key: "story_banners",    label: "Story Banners",         desc: "Banners displayed between user stories" },
              { key: "explore_banners",  label: "Explore Banners",       desc: "Banners in the Explore / Discover page" },
              { key: "chat_banners",     label: "Chat Header Banners",   desc: "Lightweight banners in chat list header" },
              { key: "anim_effects",     label: "Animation Effects",     desc: "Allow shimmer, bounce & neon glow effects" },
            ];

            const [saToggles, setSaToggles] = useState<Record<string, boolean>>({
              feed_banners: true, top_banners: true, story_banners: true,
              explore_banners: true, chat_banners: false, anim_effects: true,
            });
            const [maxBanners, setMaxBanners]       = useState("3");
            const [refreshRate, setRefreshRate]     = useState("30");
            const [fallbackBanner, setFallbackBanner] = useState(true);
            const [freqCap, setFreqCap]             = useState("5");

            const totalImpr  = SA_BANNERS.reduce((s, b) => s + b.impressions, 0);
            const totalClick = SA_BANNERS.reduce((s, b) => s + b.clicks, 0);
            const avgCTR     = totalImpr ? ((totalClick / totalImpr) * 100).toFixed(1) + "%" : "—";
            const activeCnt  = SA_BANNERS.filter(b => b.status === "active").length;

            const statusCls: Record<string, string> = {
              active:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
              paused:    "bg-amber-500/15 text-amber-400 border-amber-500/20",
              scheduled: "bg-blue-500/15 text-blue-400 border-blue-500/20",
            };

            const fmtN = (n: number) => n >= 1_000_000 ? (n/1e6).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(1)+"K" : String(n);

            return (
              <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("super-admin_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Banners",    value: SA_BANNERS.length, sub: `${activeCnt} live`,           icon: LayoutTemplate, color: "text-violet-500", bg: "bg-violet-500/10" },
                    { label: "Total Impressions",value: fmtN(totalImpr),   sub: "across all banners",          icon: Eye,            color: "text-blue-500",   bg: "bg-blue-500/10"   },
                    { label: "Total Clicks",     value: fmtN(totalClick),  sub: "all placements",              icon: MousePointer,   color: "text-emerald-500",bg: "bg-emerald-500/10"},
                    { label: "Avg CTR",          value: avgCTR,            sub: "vs 4.2% industry avg",        icon: TrendingUp,     color: "text-pink-500",   bg: "bg-pink-500/10"   },
                  ].map(m => (
                    <Card key={m.label}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center flex-shrink-0`}>
                          <m.icon className={`w-4 h-4 ${m.color}`} />
                        </div>
                        <div>
                          <p className="text-base font-bold">{m.value}</p>
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                          <p className="text-[10px] text-muted-foreground/60">{m.sub}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                  {/* ── Banner Monitor ── */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-violet-500" />
                        Live Banner Monitor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {SA_BANNERS.map(b => (
                        <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                          {/* Style swatch */}
                          <div className="w-10 h-10 rounded-lg flex-shrink-0 relative overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${b.from}, ${b.to})` }}>
                            <span className="absolute inset-0 flex items-center justify-center">
                              <LayoutTemplate className="w-4 h-4 text-white/80" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold truncate">{b.title}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${statusCls[b.status] ?? ""}`}>
                                {b.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtN(b.impressions)}</span>
                              <span className="flex items-center gap-0.5"><MousePointer className="w-2.5 h-2.5" />{fmtN(b.clicks)}</span>
                              <span className="flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{b.ctr}</span>
                              <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />{b.anim}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[10px] text-muted-foreground">P{b.priority}</span>
                            {b.status === "active"
                              ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              : b.status === "scheduled"
                              ? <div className="w-2 h-2 rounded-full bg-blue-500" />
                              : <div className="w-2 h-2 rounded-full bg-amber-500" />
                            }
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* ── Placement Health ── */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Placement Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {SA_PLACEMENTS.map(p => (
                        <div key={p.label} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{p.label}</span>
                            <span className="font-medium">{p.active}/{p.total} filled</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all"
                              style={{ width: `${(p.active / p.total) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                </div>

                {/* ── Style Distribution ── */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Palette className="w-4 h-4 text-pink-500" />
                      Dynamic Style Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: "Classic Gradient", from: "#7B2FBE", to: "#E91E8C", count: 1, anim: "Fade",     ctr: "7.9%"  },
                        { label: "Neon Glow",         from: "#0F0F1A", to: "#1A0A2E", count: 1, anim: "Pulse",   ctr: "10.5%" },
                        { label: "Frosted Glass",     from: "#C9D6FF", to: "#E2E2E2", count: 1, anim: "Slide",   ctr: "28.2%" },
                        { label: "Sports Energy",     from: "#FF0844", to: "#FFB199", count: 1, anim: "Shimmer", ctr: "12.2%" },
                        { label: "Festive India",     from: "#FF6B00", to: "#FFD700", count: 1, anim: "Bounce",  ctr: "—"     },
                      ].map(s => (
                        <div key={s.label} className="rounded-xl border border-border/60 overflow-hidden">
                          <div className="h-12 relative" style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
                            <span className="absolute bottom-1.5 left-2 text-[8px] font-bold text-white/90 leading-none">{s.label}</span>
                          </div>
                          <div className="p-2 space-y-0.5">
                            <p className="text-[10px] text-muted-foreground">Anim: <span className="text-foreground">{s.anim}</span></p>
                            <p className="text-[10px] text-muted-foreground">CTR: <span className="text-emerald-500 font-semibold">{s.ctr}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ── Global Config ── */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-violet-500" />
                      Global Banner Config
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Placement toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {globalBannerToggles.map(t => (
                        <div key={t.key} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                          <div>
                            <p className="text-xs font-medium">{t.label}</p>
                            <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                          </div>
                          <Switch
                            checked={saToggles[t.key]}
                            onCheckedChange={v => setSaToggles(prev => ({ ...prev, [t.key]: v }))}
                          />
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Numeric config */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Max Banners Per Session</Label>
                        <Input type="number" value={maxBanners} onChange={e => setMaxBanners(e.target.value)}
                          className="h-8 text-xs" min={1} max={10} />
                        <p className="text-[10px] text-muted-foreground">Total ads shown per app session</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Refresh Rate (sec)</Label>
                        <Input type="number" value={refreshRate} onChange={e => setRefreshRate(e.target.value)}
                          className="h-8 text-xs" min={10} max={300} />
                        <p className="text-[10px] text-muted-foreground">Banner rotation frequency in feed</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Frequency Cap (per user/day)</Label>
                        <Input type="number" value={freqCap} onChange={e => setFreqCap(e.target.value)}
                          className="h-8 text-xs" min={1} max={50} />
                        <p className="text-[10px] text-muted-foreground">Max times a user sees one banner daily</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Fallback Banner</Label>
                        <div className="flex items-center gap-2 h-8">
                          <Switch checked={fallbackBanner} onCheckedChange={setFallbackBanner} />
                          <span className="text-xs text-muted-foreground">{fallbackBanner ? "Ridhi promo shown when no client ad" : "Empty slot"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button size="sm" className="gap-1.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:opacity-90">
                        <Save className="w-3.5 h-3.5" /> Save Config
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Link */}
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                      <LayoutTemplate className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Commercial Banners Manager</p>
                      <p className="text-xs text-muted-foreground">Create, design and deploy dynamic banners with live preview & animation controls</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 border-violet-500/40 text-violet-600 hover:bg-violet-500/10"
                    onClick={() => window.location.href = "/admins/commercial-banners"}>
                    Open Manager <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>

              </div>
            );
          })()}
        </TabsContent>

        {/* ─── COIN GENERATOR TAB ─── */}
        <TabsContent value="coin-gen" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Generator Panel ── */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Generate Coins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Super Admin Only — All actions are logged & auditable
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">User Phone / Email / ID</Label>
                  <Input
                    placeholder="e.g. +91 98765 43210 or user@email.com"
                    value={coinGenUser}
                    onChange={(e) => setCoinGenUser(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Coin Amount</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={coinGenAmount}
                    onChange={(e) => setCoinGenAmount(e.target.value)}
                    className="h-9 text-xs"
                    min={1}
                    max={100000}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Max 100,000 coins per operation. Use responsibly.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Reason</Label>
                  <select
                    value={coinGenReason}
                    onChange={(e) => setCoinGenReason(e.target.value)}
                    className="w-full h-9 text-xs rounded-md border border-input bg-background px-3"
                  >
                    <option value="support">Customer Support Compensation</option>
                    <option value="promo">Promotional Campaign</option>
                    <option value="bug">Bug Fix Compensation</option>
                    <option value="creator">Creator Program Bonus</option>
                    <option value="test">Internal Testing</option>
                    <option value="refund">Refund / Reversal</option>
                    <option value="other">Other (see notes)</option>
                  </select>
                </div>

                <Button
                  className="w-full gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
                  size="sm"
                  disabled={!coinGenUser.trim() || !coinGenAmount || parseInt(coinGenAmount) <= 0}
                  onClick={handleCoinGen}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Grant {coinGenAmount ? parseInt(coinGenAmount).toLocaleString() : "0"} Coins
                </Button>
              </CardContent>
            </Card>

            {/* ── Activity Log ── */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-violet-500" />
                  Generation Log
                  <Badge variant="outline" className="text-xs">{coinGenLog.length} entries</Badge>
                </CardTitle>
                {coinGenLog.length > 0 && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"
                    onClick={() => setCoinGenLog([])}>
                    <RotateCcw className="w-3 h-3" /> Clear
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {coinGenLog.length === 0 ? (
                  <div className="p-8 text-center">
                    <Coins className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No coin grants yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Generated coins will appear here with full audit trail</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr className="text-xs text-muted-foreground">
                          <th className="text-left p-3 font-medium">User</th>
                          <th className="text-left p-3 font-medium">Amount</th>
                          <th className="text-left p-3 font-medium">Reason</th>
                          <th className="text-left p-3 font-medium">Granted By</th>
                          <th className="text-left p-3 font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coinGenLog.map((entry) => (
                          <tr key={entry.id} className="border-t hover:bg-muted/20 transition-colors">
                            <td className="p-3">
                              <p className="font-medium text-sm">{entry.user}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{entry.id}</p>
                            </td>
                            <td className="p-3">
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                                +{entry.amount.toLocaleString()} coins
                              </Badge>
                            </td>
                            <td className="p-3">
                              <span className="text-xs capitalize">{entry.reason}</span>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">{entry.by}</td>
                            <td className="p-3 text-xs text-muted-foreground">{entry.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Quick Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Granted Today", value: coinGenLog.filter(l => l.time.includes(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }))).reduce((s, l) => s + l.amount, 0).toLocaleString(), icon: Coins, color: "text-amber-500" },
              { label: "Total Granted (All)", value: coinGenLog.reduce((s, l) => s + l.amount, 0).toLocaleString(), icon: IndianRupee, color: "text-green-500" },
              { label: "Unique Users", value: new Set(coinGenLog.map(l => l.user)).size.toString(), icon: Users, color: "text-blue-500" },
              { label: "Operations", value: coinGenLog.length.toString(), icon: Activity, color: "text-violet-500" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── SUBSCRIPTIONS TAB ─── */}
        <TabsContent value="subscriptions" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VIP Plans Editor */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-pink-500" /> VIP Plans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {([
                  { tier: "Silver", weekly: 49, monthly: 149, yearly: 1499, coins: 100, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", features: "No ads, 20 saved posts, 2 story highlights, 2 Super Likes/day, join events" },
                  { tier: "Gold", weekly: 99, monthly: 299, yearly: 2999, coins: 350, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", features: "Silver + 50 saved posts, 5 highlights, 5 Super Likes/day, 5 profile prompts, broadcast join" },
                  { tier: "Platinum", weekly: 199, monthly: 599, yearly: 5999, coins: 1000, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", features: "Gold + 100 saved posts, 10 highlights, 10 Super Likes/day, 10 prompts, create events, 10% shop discount, cart checkout" },
                  { tier: "Diamond Elite", weekly: 299, monthly: 999, yearly: 9999, coins: 3000, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200", features: "Platinum + unlimited saved posts, unlimited highlights, 10 Super Likes/day, unlimited prompts, 15% shop discount, bulk cart checkout, broadcast create, event monetization" },
                ] as const).map((plan) => (
                  <div key={plan.tier} className={`rounded-lg border p-3 space-y-2 ${plan.border} ${plan.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${plan.color}`}>{plan.tier} VIP</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Weekly (₹)</Label>
                        <Input type="number" defaultValue={plan.weekly} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Monthly (₹)</Label>
                        <Input type="number" defaultValue={plan.monthly} className="h-8 text-xs font-semibold" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Yearly (₹)</Label>
                        <Input type="number" defaultValue={plan.yearly} className="h-8 text-xs" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Bonus Coins/mo</span>
                      <Input type="number" defaultValue={plan.coins} className="h-8 text-xs w-24 text-right" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Features</Label>
                      <Input defaultValue={plan.features} className="h-8 text-xs" placeholder="Comma-separated features" />
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full gap-1 text-xs h-8">
                  <PlusCircle className="w-3.5 h-3.5" /> Add Custom VIP Tier
                </Button>
              </CardContent>
            </Card>

            {/* Creator Plans Editor */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-500" /> Creator Plans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {([
                  { name: "Creator Starter", price: 199, features: "Go Live, Podcast Studio, Basic Analytics, Commission 20%", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                  { name: "Creator Pro", price: 499, features: "HD Upload, Boost & Ads, Fan Club, Audience Demographics, Advanced Analytics, Commission 13%", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
                  { name: "Creator Elite", price: 999, features: "Brand Deals, Ridhi Radio, Account Manager, Revenue Projection, Commission 8%", color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200" },
                ] as const).map((plan) => (
                  <div key={plan.name} className={`rounded-lg border p-3 space-y-2 ${plan.border} ${plan.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${plan.color}`}>{plan.name}</span>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={plan.price} className="h-8 text-xs w-20 text-right font-semibold" />
                        <span className="text-xs text-muted-foreground">/mo</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <Input defaultValue={plan.features} className="h-8 text-xs" placeholder="Comma-separated features" />
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" /> Remove
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Save className="w-3 h-3" /> Save
                      </Button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full gap-1 text-xs h-8">
                  <PlusCircle className="w-3.5 h-3.5" /> Add Creator Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" className="gap-1.5 h-9 text-xs">
              <Save className="w-4 h-4" /> Save All Changes
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 h-9 text-xs">
              <RotateCcw className="w-4 h-4" /> Revert Defaults
            </Button>
            <Badge variant="outline" className="text-xs h-9 px-3">Last updated: Today, 10:30 AM</Badge>
          </div>
        </TabsContent>

        {/* ─── QUICK SEARCH TAB ─── */}
        <TabsContent value="search" className="mt-4 space-y-6">
          <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-4">
            <div className="relative w-full max-w-lg mx-auto">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search across admins, hosts, agents, APIs, integrations, alerts..."
                className="pl-10 h-11 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {!searchQuery && (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <Search className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm">Start typing to search across the entire Super Admin panel</p>
              <p className="text-xs opacity-70">Searches names, emails, API paths, integration names, alerts, and more</p>
            </div>
          )}

          {searchQuery && (
            <div className="space-y-5">
              {/* Admins */}
              {(() => {
                const admins = ADMIN_ROLES.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()) || a.role.toLowerCase().includes(searchQuery.toLowerCase()));
                return admins.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Admins — {admins.length}</p>
                    <div className="space-y-2">
                      {admins.map(a => (
                        <Card key={a.id}><CardContent className="p-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">{a.name.split(" ").map(n=>n[0]).join("")}</div>
                            <div>
                              <p className="font-medium">{a.name}</p>
                              <p className="text-xs text-muted-foreground">{a.email} · {a.role} · {a.status}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">Admin</Badge>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Hosts */}
              {(() => {
                const matches = hosts.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.email.toLowerCase().includes(searchQuery.toLowerCase()) || h.city.toLowerCase().includes(searchQuery.toLowerCase()));
                return matches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hosts — {matches.length}</p>
                    <div className="space-y-2">
                      {matches.map(h => (
                        <Card key={h.id}><CardContent className="p-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{h.name.split(" ").map(n=>n[0]).join("")}</div>
                            <div>
                              <p className="font-medium">{h.name}</p>
                              <p className="text-xs text-muted-foreground">{h.email} · {h.city} · {h.level} ({h.levelLabel})</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">Host</Badge>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Agents */}
              {(() => {
                const matches = agents.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()) || a.city.toLowerCase().includes(searchQuery.toLowerCase()));
                return matches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Agents — {matches.length}</p>
                    <div className="space-y-2">
                      {matches.map(a => (
                        <Card key={a.id}><CardContent className="p-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{a.name.split(" ").map(n=>n[0]).join("")}</div>
                            <div>
                              <p className="font-medium">{a.name}</p>
                              <p className="text-xs text-muted-foreground">{a.email} · {a.city} · {a.levelLabel} · {a.commission} commission</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">Agent</Badge>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* APIs */}
              {(() => {
                const matches = platformApis.filter(api => api.name.toLowerCase().includes(searchQuery.toLowerCase()) || api.path.toLowerCase().includes(searchQuery.toLowerCase()) || api.category.toLowerCase().includes(searchQuery.toLowerCase()));
                return matches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">APIs — {matches.length}</p>
                    <div className="space-y-2">
                      {matches.map(api => (
                        <Card key={api.id}><CardContent className="p-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <Code className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{api.name}</p>
                              <p className="text-xs text-muted-foreground">{api.path} · {api.category} · {api.calls}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">API</Badge>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Integrations */}
              {(() => {
                const matches: { name: string; desc: string; category: string; status: string }[] = [];
                integrations.forEach(group => {
                  group.items.forEach(item => {
                    if (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase()) || group.category.toLowerCase().includes(searchQuery.toLowerCase())) {
                      matches.push({ name: item.name, desc: item.desc, category: group.category, status: item.status });
                    }
                  });
                });
                return matches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Integrations — {matches.length}</p>
                    <div className="space-y-2">
                      {matches.map((item, i) => (
                        <Card key={i}><CardContent className="p-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <Link className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.desc} · {item.category}</p>
                            </div>
                          </div>
                          <Badge variant={item.status === "active" ? "outline" : "secondary"} className="text-xs capitalize">{item.status}</Badge>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Webhooks */}
              {(() => {
                const matches = webhooks.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.url.toLowerCase().includes(searchQuery.toLowerCase()));
                return matches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Webhooks — {matches.length}</p>
                    <div className="space-y-2">
                      {matches.map((w, i) => (
                        <Card key={i}><CardContent className="p-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <Webhook className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{w.name}</p>
                              <p className="text-xs text-muted-foreground">{w.url} · {w.events.join(", ")}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">Webhook</Badge>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Users */}
              {(() => {
                const matches = SUPER_ADMIN_USERS.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.toLowerCase().includes(searchQuery.toLowerCase()) || u.city.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase()));
                return matches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Users — {matches.length}</p>
                    <div className="space-y-2">
                      {matches.map(u => (
                        <Card key={u.id}><CardContent className="p-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${u.role === "host" ? "bg-gradient-to-br from-pink-500 to-purple-600" : u.role === "vip" ? "bg-gradient-to-br from-amber-500 to-yellow-600" : u.role === "creator" ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-gray-500 to-slate-600"}`}>
                              {u.name.split(" ").map(n=>n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.phone} · {u.city} · {u.coins.toLocaleString()} coins</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={u.status === "active" ? "outline" : u.status === "banned" ? "destructive" : "secondary"} className="text-xs capitalize">{u.status}</Badge>
                            <Badge variant="outline" className="text-xs capitalize">{u.role}</Badge>
                          </div>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Security Alerts */}
              {(() => {
                const matches = SECURITY_ALERTS.filter(a => a.message.toLowerCase().includes(searchQuery.toLowerCase()));
                return matches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Security Alerts — {matches.length}</p>
                    <div className="space-y-2">
                      {matches.map((a, i) => (
                        <Card key={i}><CardContent className="p-3 flex items-center gap-3 text-sm">
                          <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${a.severity === "high" ? "text-red-500" : a.severity === "medium" ? "text-amber-500" : "text-blue-500"}`} />
                          <div>
                            <p className="font-medium text-sm">{a.message}</p>
                            <p className="text-xs text-muted-foreground">{a.time} · Severity: {a.severity}</p>
                          </div>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* No results */}
              {(() => {
                const totalMatches =
                  ADMIN_ROLES.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase())).length +
                  SUPER_ADMIN_USERS.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.toLowerCase().includes(searchQuery.toLowerCase())).length +
                  hosts.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.email.toLowerCase().includes(searchQuery.toLowerCase())).length +
                  agents.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase())).length +
                  platformApis.filter(api => api.name.toLowerCase().includes(searchQuery.toLowerCase())).length +
                  SECURITY_ALERTS.filter(a => a.message.toLowerCase().includes(searchQuery.toLowerCase())).length +
                  webhooks.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase())).length;
                const intMatches: { name: string }[] = [];
                integrations.forEach(g => g.items.forEach(item => { if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) intMatches.push(item); }));
                return totalMatches + intMatches.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto opacity-30 mb-2" />
                    <p className="text-sm">No results found for “{searchQuery}”</p>
                    <p className="text-xs opacity-70 mt-1">Try a different keyword or check the spelling</p>
                  </div>
                );
              })()}
            </div>
          )}
        </TabsContent>

        {/* ─── RANDOM CALLS TAB ─── */}
        <TabsContent value="calls" className="mt-4 space-y-6">
          <RandomCallAdminCard />
        </TabsContent>

        {/* ─── LEVELS & COMMISSIONS TAB ─── */}
        <TabsContent value="levels" className="mt-4 space-y-6">

          {/* Auto-promotion banner */}
          <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-purple-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Automatic Level Promotion
                </p>
                <p className="text-xs text-purple-700 mt-1">When enabled, hosts and agents are automatically promoted to the next level when they meet the required thresholds.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-purple-800 font-medium">{autoPromo ? "Enabled" : "Disabled"}</span>
                <Switch checked={autoPromo} onCheckedChange={setAutoPromo} />
              </div>
            </div>
          </div>

          {/* Host Levels Editor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-pink-600" />
                <CardTitle className="text-base">Host Level Structure</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Define coin thresholds, titles, and visual badges for each host tier.</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left p-2 font-medium">Level</th>
                      <th className="text-left p-2 font-medium">Title</th>
                      <th className="text-left p-2 font-medium">Min Coins</th>
                      <th className="text-left p-2 font-medium">Badge</th>
                      <th className="text-left p-2 font-medium">Color</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostLevels.map((hl, i) => (
                      <tr key={hl.level} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-2 font-mono font-medium">{hl.level}</td>
                        <td className="p-2">
                          <Input value={hl.title} onChange={e => updateHostLevel(i, "title", e.target.value)} className="h-7 text-xs" />
                        </td>
                        <td className="p-2">
                          <Input type="number" value={hl.minCoins} onChange={e => updateHostLevel(i, "minCoins", parseInt(e.target.value) || 0)} className="h-7 text-xs" />
                        </td>
                        <td className="p-2">
                          <Input value={hl.badge} onChange={e => updateHostLevel(i, "badge", e.target.value)} className="h-7 text-xs w-20 text-center" />
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <input type="color" value={hl.color} onChange={e => updateHostLevel(i, "color", e.target.value)} className="w-8 h-7 rounded cursor-pointer" />
                            <span className="text-xs text-muted-foreground">{hl.color}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          {hostLevels.length > 1 && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => removeHostLevel(i)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button size="sm" variant="outline" className="mt-3 text-xs gap-1" onClick={addHostLevel}>
                <PlusCircle className="w-3.5 h-3.5" /> Add Host Level
              </Button>
            </CardContent>
          </Card>

          {/* Agent Levels Editor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base">Agent Level Structure</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Define host count thresholds, titles, and commission % for each agent tier.</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left p-2 font-medium">Level</th>
                      <th className="text-left p-2 font-medium">Title</th>
                      <th className="text-left p-2 font-medium">Min Hosts</th>
                      <th className="text-left p-2 font-medium">Commission %</th>
                      <th className="text-left p-2 font-medium">Badge</th>
                      <th className="text-left p-2 font-medium">Color</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentLevels.map((al, i) => (
                      <tr key={al.level} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-2 font-mono font-medium">{al.level}</td>
                        <td className="p-2">
                          <Input value={al.title} onChange={e => updateAgentLevel(i, "title", e.target.value)} className="h-7 text-xs" />
                        </td>
                        <td className="p-2">
                          <Input type="number" value={al.hostsRequired} onChange={e => updateAgentLevel(i, "hostsRequired", parseInt(e.target.value) || 0)} className="h-7 text-xs" />
                        </td>
                        <td className="p-2">
                          <Input type="number" value={al.commissionRate} onChange={e => updateAgentLevel(i, "commissionRate", parseInt(e.target.value) || 0)} className="h-7 text-xs" />
                        </td>
                        <td className="p-2">
                          <Input value={al.icon} onChange={e => updateAgentLevel(i, "icon", e.target.value)} className="h-7 text-xs w-20 text-center" />
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <input type="color" value={al.color} onChange={e => updateAgentLevel(i, "color", e.target.value)} className="w-8 h-7 rounded cursor-pointer" />
                            <span className="text-xs text-muted-foreground">{al.color}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          {agentLevels.length > 1 && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => removeAgentLevel(i)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button size="sm" variant="outline" className="mt-3 text-xs gap-1" onClick={addAgentLevel}>
                <PlusCircle className="w-3.5 h-3.5" /> Add Agent Level
              </Button>
            </CardContent>
          </Card>

          {/* Live preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Host Level Preview</CardTitle>
                <p className="text-xs text-muted-foreground">How existing hosts map to current thresholds</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {HOSTS_WITH_ACCESS.slice(0, 5).map(h => (
                  <div key={h.id} className="flex items-center justify-between text-sm rounded-lg border p-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">{h.name.split(" ").map(n => n[0]).join("")}</div>
                      <div>
                        <p className="font-medium text-sm">{h.name}</p>
                        <p className="text-xs text-muted-foreground">{h.coins.toLocaleString()} coins</p>
                      </div>
                    </div>
                    {(() => {
                      const lvl = hostLevels.slice().reverse().find(l => h.coins >= l.minCoins) || hostLevels[0];
                      return <Badge variant="outline" className="text-xs" style={{ borderColor: lvl.color, color: lvl.color }}>{lvl.level} · {lvl.title}</Badge>;
                    })()}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Agent Level Preview</CardTitle>
                <p className="text-xs text-muted-foreground">How existing agents map to current thresholds</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {AGENTS_WITH_ACCESS.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between text-sm rounded-lg border p-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">{a.name.split(" ").map(n => n[0]).join("")}</div>
                      <div>
                        <p className="font-medium text-sm">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.hosts} hosts · {a.commission} commission</p>
                      </div>
                    </div>
                    {(() => {
                      const lvl = agentLevels.slice().reverse().find(l => a.hosts >= l.hostsRequired) || agentLevels[0];
                      return <Badge variant="outline" className="text-xs" style={{ borderColor: lvl.color, color: lvl.color }}>{lvl.level} · {lvl.title}</Badge>;
                    })()}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Save / Reset */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Changes apply immediately to previews. Save to persist.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={resetLevels}>
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </Button>
              <Button size="sm" className="text-xs gap-1 bg-gradient-to-r from-purple-600 to-pink-600" onClick={saveLevels}>
                <Save className="w-3.5 h-3.5" /> Save Levels
              </Button>
            </div>
          </div>

        </TabsContent>

      </Tabs>
    </div>
  );
}

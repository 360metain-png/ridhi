import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Users, Server, Activity, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Lock, Globe, Database, Cpu, Wifi, CreditCard, Eye,
  Star, Briefcase, Key, UserCheck, UserX, Clock, ShieldCheck,
  Zap, Link, Code, Webhook, ToggleRight, Copy, RotateCcw, PlusCircle,
  Bell, MessageSquare, Mail, Smartphone, BarChart2, CloudLightning,
} from "lucide-react";

const ADMIN_ROLES = [
  { id: 1, name: "Arjun Mehta", email: "arjun@ridhi.app", role: "Super Admin", status: "active", lastLogin: "2 min ago", permissions: "all" },
  { id: 2, name: "Sneha Patel", email: "sneha@ridhi.app", role: "Content Admin", status: "active", lastLogin: "1h ago", permissions: "content,users" },
  { id: 3, name: "Rohit Kumar", email: "rohit@ridhi.app", role: "Finance Admin", status: "active", lastLogin: "3h ago", permissions: "revenue,payouts" },
  { id: 4, name: "Priya Nair", email: "priya@ridhi.app", role: "Support Admin", status: "inactive", lastLogin: "2d ago", permissions: "users,reports" },
  { id: 5, name: "Vikash Singh", email: "vikash@ridhi.app", role: "Marketing Admin", status: "active", lastLogin: "30m ago", permissions: "marketing,analytics" },
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
  { id: "payouts", name: "Payouts API", path: "/api/payouts", category: "Finance", status: "active", version: "v1", calls: "320/h", latency: "890ms", enabled: true },
  { id: "notifications", name: "Notifications API", path: "/api/notifications", category: "Platform", status: "active", version: "v1", calls: "88K/h", latency: "95ms", enabled: true },
  { id: "kyc", name: "KYC / E-Verify API", path: "/api/kyc", category: "Platform", status: "active", version: "v1", calls: "210/h", latency: "1.2s", enabled: true },
  { id: "search", name: "Search & Explore API", path: "/api/search", category: "Content", status: "active", version: "v1", calls: "33K/h", latency: "74ms", enabled: true },
  { id: "admin", name: "Admin API", path: "/api/admin", category: "Core", status: "active", version: "v1", calls: "4.1K/h", latency: "48ms", enabled: true },
  { id: "live", name: "Live Stream API", path: "/api/live", category: "Social", status: "active", version: "v1", calls: "1.8K/h", latency: "330ms", enabled: true },
  { id: "games", name: "Gaming API", path: "/api/games", category: "Platform", status: "active", version: "v1", calls: "7.2K/h", latency: "62ms", enabled: true },
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
      { name: "Google Pay Business", desc: "GPay merchant integration", icon: Smartphone, status: "active", keyMasked: "gpy_••••••••••HJk2", enabled: true },
      { name: "PhonePe Switch", desc: "PhonePe merchant gateway", icon: CreditCard, status: "maintenance", keyMasked: "ppe_••••••••••3nXp", enabled: false },
    ],
  },
  {
    category: "Messaging & Notifications",
    color: "text-green-600",
    bg: "bg-green-50",
    items: [
      { name: "Firebase Cloud Messaging", desc: "Push notifications (Android & iOS)", icon: Bell, status: "active", keyMasked: "AIza••••••••••••••Mx9", enabled: true },
      { name: "Twilio SMS", desc: "OTP & transactional SMS delivery", icon: MessageSquare, status: "active", keyMasked: "AC••••••••••••••••9f", enabled: true },
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Platform Admins", value: "5", icon: Shield, color: "text-purple-600 bg-purple-50" },
          { label: "Hosts with Access", value: `${activeHosts}/${hosts.length}`, icon: Star, color: "text-pink-600 bg-pink-50" },
          { label: "Agents with Access", value: `${activeAgents}/${agents.length}`, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
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
                { role: "Super Admin", color: "bg-purple-600", scope: "Full control — all pages, all actions", manages: "Manages Admins" },
                { role: "Admin",       color: "bg-indigo-500", scope: "All pages except Super Admin panel",    manages: "Approves Agents" },
                { role: "Agent",       color: "bg-blue-500",   scope: "Hosts, Calls, KYC, Live Streams",       manages: "Approves Hosts" },
                { role: "Host",        color: "bg-pink-500",   scope: "Dashboard, Calls, Live Streams only",   manages: "Managed by Agent" },
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
                      "Dashboard & Analytics", "User Management", "Content Moderation",
                      "Host Management", "Agent Management", "Audio/Video Calls",
                      "Gaming Management", "Live Streams", "Coin Economy",
                      "Payouts & Revenue", "AI Hub Controls", "Marketing",
                      "Global Settings", "Security Controls", "Payment Gateways",
                    ].map((perm) => (
                      <tr key={perm} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="py-2 pr-4 font-medium text-foreground">{perm}</td>
                        <td className="py-2 text-center"><CheckCircle className="w-4 h-4 text-green-500 mx-auto" /></td>
                        <td className="py-2 text-center"><CheckCircle className="w-4 h-4 text-green-500 mx-auto" /></td>
                        <td className="py-2 text-center"><CheckCircle className="w-4 h-4 text-green-500 mx-auto" /></td>
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
        <TabsContent value="admins" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" /> Platform Admin Role Management
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
                      <th className="text-left pb-3">Permissions</th>
                      <th className="text-left pb-3">Last Login</th>
                      <th className="text-right pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ADMIN_ROLES.map((admin) => (
                      <tr key={admin.id}>
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{admin.name}</p>
                            <p className="text-xs text-muted-foreground">{admin.email}</p>
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
                        <td className="py-3">
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">{admin.permissions}</code>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{admin.lastLogin}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                            {admin.role !== "Super Admin" && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">Revoke</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button className="mt-4 gap-2">
                <Users className="w-4 h-4" /> Invite New Admin
              </Button>
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
        <TabsContent value="security" className="mt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

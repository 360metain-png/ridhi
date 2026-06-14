import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart,
} from "recharts";
import {
  Activity, Users, Clock, Monitor, ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown, Eye, Target, Zap,
  Crown, IndianRupee, Coins,
  Calendar, ChevronRight, Circle, UserCheck,
  Anchor, CircleDot, BarChart3,
} from "lucide-react";
import DateRangeFilter from "@/components/DateRangeFilter";
import type { DateRange } from "@/components/DateRangeFilter";

// ── Colors ───────────────────────────────────────────────────────────────
const PURPLE = "#7B2FBE";
const MAGENTA = "#E91E8C";
const TEAL = "#06B6D4";
const AMBER = "#F59E0B";
const EMERALD = "#10B981";
const ROSE = "#F43F5E";
const COLORS = [PURPLE, MAGENTA, TEAL, AMBER, EMERALD, ROSE, "#8B5CF6", "#F97316"];

// ── GA-Style Sidebar Categories ──────────────────────────────────────────
const CATEGORIES = [
  { id: "realtime",    label: "Real-time",    icon: CircleDot },
  { id: "audience",    label: "Audience",     icon: Users },
  { id: "acquisition", label: "Acquisition",  icon: Anchor },
  { id: "engagement",  label: "Engagement",   icon: Activity },
  { id: "retention",   label: "Retention",    icon: Calendar },
  { id: "monetization",label: "Monetization", icon: IndianRupee },
  { id: "conversions", label: "Conversions",  icon: Target },
] as const;
type CategoryId = typeof CATEGORIES[number]["id"];

// ── Date helpers ─────────────────────────────────────────────────────────
const today = new Date();
const formatDay = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function rangeDays(range: DateRange): number {
  if (!range.from || !range.to) return 30;
  return Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)));
}

function generateTrend(range: DateRange, base: number, variance: number, seed: number): { day: string; value: number }[] {
  const days = rangeDays(range);
  const result: { day: string; value: number }[] = [];
  for (let i = 0; i < Math.min(days, 30); i++) {
    const d = new Date(range.to ?? today);
    d.setDate(d.getDate() - (Math.min(days, 30) - 1 - i));
    const v = Math.floor(base + Math.sin((i + seed) * 0.5) * variance + Math.random() * (variance / 2));
    result.push({ day: formatDay(d), value: Math.max(0, v) });
  }
  return result;
}

// ── Mock Data ────────────────────────────────────────────────────────────
const REALTIME_USERS = [
  { minute: "1m", users: 42 }, { minute: "2m", users: 48 }, { minute: "3m", users: 56 },
  { minute: "4m", users: 52 }, { minute: "5m", users: 64 }, { minute: "6m", users: 71 },
  { minute: "7m", users: 68 }, { minute: "8m", users: 75 }, { minute: "9m", users: 82 },
  { minute: "10m", users: 78 }, { minute: "11m", users: 85 }, { minute: "12m", users: 91 },
  { minute: "13m", users: 88 }, { minute: "14m", users: 94 }, { minute: "15m", users: 89 },
  { minute: "16m", users: 97 }, { minute: "17m", users: 103 }, { minute: "18m", users: 98 },
  { minute: "19m", users: 106 }, { minute: "20m", users: 112 }, { minute: "21m", users: 108 },
  { minute: "22m", users: 115 }, { minute: "23m", users: 121 }, { minute: "24m", users: 118 },
  { minute: "25m", users: 124 }, { minute: "26m", users: 130 }, { minute: "27m", users: 127 },
  { minute: "28m", users: 135 }, { minute: "29m", users: 142 }, { minute: "30m", users: 138 },
];

const TOP_SCREENS = [
  { name: "Home Feed", views: 12400, avgTime: "2:34" },
  { name: "Reels", views: 8900, avgTime: "4:12" },
  { name: "Match", views: 7100, avgTime: "1:45" },
  { name: "Chat", views: 6800, avgTime: "3:20" },
  { name: "Profile", views: 4200, avgTime: "1:10" },
  { name: "Live Stream", views: 3800, avgTime: "5:45" },
  { name: "Wallet", views: 2900, avgTime: "0:55" },
  { name: "Settings", views: 1500, avgTime: "1:05" },
];

const TOP_EVENTS = [
  { name: "swipe_like", count: 45200, pctChange: 12.4 },
  { name: "message_sent", count: 38700, pctChange: 8.2 },
  { name: "coin_purchase", count: 12400, pctChange: 15.6 },
  { name: "reel_view", count: 89300, pctChange: -2.1 },
  { name: "story_view", count: 67200, pctChange: 5.3 },
  { name: "live_join", count: 18900, pctChange: 22.7 },
  { name: "gift_sent", count: 12400, pctChange: 9.1 },
  { name: "profile_visit", count: 34200, pctChange: 3.4 },
];

const GEO_DATA = [
  { state: "Maharashtra", users: 12400, pct: 24.2 },
  { state: "Karnataka", users: 9800, pct: 19.1 },
  { state: "Delhi NCR", users: 8200, pct: 16.0 },
  { state: "Tamil Nadu", users: 6700, pct: 13.1 },
  { state: "Telangana", users: 5400, pct: 10.5 },
  { state: "Gujarat", users: 4100, pct: 8.0 },
  { state: "Kerala", users: 3200, pct: 6.2 },
  { state: "Rajasthan", users: 1500, pct: 2.9 },
];

const DEVICE_DATA = [
  { name: "Android", value: 72 },
  { name: "iOS", value: 26 },
  { name: "Web", value: 2 },
];

const OS_DATA = [
  { name: "Android 14", value: 38 },
  { name: "Android 13", value: 24 },
  { name: "iOS 18", value: 18 },
  { name: "iOS 17", value: 8 },
  { name: "Android 12", value: 7 },
  { name: "Other", value: 5 },
];

const LANGUAGE_DATA = [
  { name: "English", value: 28 },
  { name: "Hindi", value: 24 },
  { name: "Tamil", value: 12 },
  { name: "Telugu", value: 10 },
  { name: "Kannada", value: 8 },
  { name: "Marathi", value: 7 },
  { name: "Gujarati", value: 5 },
  { name: "Malayalam", value: 4 },
  { name: "Punjabi", value: 1 },
  { name: "Other", value: 1 },
];

const AGE_DATA = [
  { age: "18-24", male: 32, female: 28 },
  { age: "25-34", male: 24, female: 22 },
  { age: "35-44", male: 14, female: 12 },
  { age: "45-54", male: 8, female: 6 },
  { age: "55+", male: 3, female: 2 },
];

const CHANNEL_DATA = [
  { channel: "Organic Search", users: 12400, sessions: 18600, conversion: 3.2 },
  { channel: "Social Media", users: 18200, sessions: 31200, conversion: 4.8 },
  { channel: "Direct", users: 15600, sessions: 22400, conversion: 5.1 },
  { channel: "Referral", users: 4200, sessions: 5800, conversion: 2.9 },
  { channel: "Paid Ads", users: 8100, sessions: 12400, conversion: 7.2 },
  { channel: "App Store", users: 6800, sessions: 9200, conversion: 6.5 },
];

const CAMPAIGNS = [
  { name: "Summer Dating 2026", channel: "Paid Ads", budget: 250000, spent: 187000, users: 12400, conversions: 890, roi: 2.4 },
  { name: "Influencer Wave", channel: "Social Media", budget: 150000, spent: 98000, users: 18200, conversions: 1240, roi: 3.1 },
  { name: "Google Search", channel: "Organic Search", budget: 80000, spent: 62000, users: 8200, conversions: 340, roi: 1.8 },
  { name: "Referral Boost", channel: "Referral", budget: 50000, spent: 28000, users: 4200, conversions: 210, roi: 1.5 },
  { name: "App Store Feature", channel: "App Store", budget: 0, spent: 0, users: 6800, conversions: 445, roi: 0 },
];

const FUNNEL_STEPS = [
  { name: "App Install", users: 10000, drop: 0 },
  { name: "Registration", users: 8200, drop: 18 },
  { name: "Profile Complete", users: 6400, drop: 22 },
  { name: "First Match", users: 4800, drop: 25 },
  { name: "First Message", users: 3200, drop: 33 },
  { name: "First Call", users: 1800, drop: 44 },
  { name: "Coin Purchase", users: 720, drop: 60 },
  { name: "Subscription", users: 180, drop: 75 },
];

const COHORT_DATA = [
  { month: "Jan 2025", d0: 100, d7: 45, d14: 32, d30: 24, d60: 18, d90: 14 },
  { month: "Feb 2025", d0: 100, d7: 48, d14: 35, d30: 28, d60: 22, d90: 17 },
  { month: "Mar 2025", d0: 100, d7: 52, d14: 38, d30: 30, d60: 24, d90: 19 },
  { month: "Apr 2025", d0: 100, d7: 55, d14: 42, d30: 34, d60: 28, d90: 22 },
  { month: "May 2025", d0: 100, d7: 58, d14: 45, d30: 37, d60: 31, d90: 25 },
  { month: "Jun 2025", d0: 100, d7: 62, d14: 48, d30: 40, d60: 34, d90: 28 },
];

const LTV_DATA = [
  { month: "Jan 2025", ltv: 420, arpu: 280, arppu: 1240 },
  { month: "Feb 2025", ltv: 480, arpu: 310, arppu: 1380 },
  { month: "Mar 2025", ltv: 520, arpu: 340, arppu: 1450 },
  { month: "Apr 2025", ltv: 580, arpu: 380, arppu: 1620 },
  { month: "May 2025", ltv: 640, arpu: 420, arppu: 1780 },
  { month: "Jun 2025", ltv: 720, arpu: 480, arppu: 1950 },
];

const GOAL_DATA = [
  { name: "Complete Registration", completions: 8200, rate: 82, value: 0 },
  { name: "First Match", completions: 4800, rate: 48, value: 0 },
  { name: "Send First Message", completions: 3200, rate: 32, value: 0 },
  { name: "Make First Call", completions: 1800, rate: 18, value: 0 },
  { name: "Purchase Coins", completions: 720, rate: 7.2, value: 245000 },
  { name: "Subscribe to VIP", completions: 180, rate: 1.8, value: 448000 },
  { name: "Refer a Friend", completions: 420, rate: 4.2, value: 84000 },
];

const REVENUE_STREAMS = [
  { name: "Coin Recharges", value: 48, amount: 1240000 },
  { name: "VIP Subscriptions", value: 27, amount: 698000 },
  { name: "Creator Plans", value: 12, amount: 310000 },
  { name: "Ad Revenue", value: 8, amount: 207000 },
  { name: "Virtual Gifts", value: 3, amount: 78000 },
  { name: "Other", value: 2, amount: 52000 },
];

const COIN_PACKAGES = [
  { name: "Starter ₹49", purchases: 4800, revenue: 235200 },
  { name: "Basic ₹199", purchases: 3200, revenue: 636800 },
  { name: "Popular ₹499", purchases: 2100, revenue: 1047900 },
  { name: "Premium ₹999", purchases: 980, revenue: 979020 },
  { name: "Elite ₹2499", purchases: 420, revenue: 1049580 },
  { name: "Whale ₹4999", purchases: 180, revenue: 899820 },
];

const AD_REVENUE = [
  { type: "Interstitial", impressions: 820000, ctr: 2.8, revenue: 124000 },
  { type: "Banner", impressions: 2100000, ctr: 1.2, revenue: 42000 },
  { type: "Rewarded Video", impressions: 480000, ctr: 8.5, revenue: 98000 },
  { type: "Native", impressions: 620000, ctr: 2.1, revenue: 38000 },
  { type: "Sponsored", impressions: 180000, ctr: 4.2, revenue: 52000 },
];

const KPI = ({ label, value, change, icon: Icon, color }: {
  label: string; value: string; change: number; icon: React.ComponentType<{ className?: string; color?: string }>; color: string;
}) => (
  <Card className="bg-card border-border">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-opacity-10 flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-4 h-4" color={color} />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
        {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(change)}% vs previous period
      </div>
    </CardContent>
  </Card>
);

const MiniChart = ({ data, color, height = 40 }: { data: { value: number }[]; color: string; height?: number }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data}>
      <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
);

// ── Real-time Section ───────────────────────────────────────────────────
function RealtimeSection({ dateRange }: { dateRange: DateRange }) {
  const activeUsers = 138;
  const pageViews = REALTIME_USERS.reduce((s, r) => s + r.users, 0) * 2;
  const events = 892;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI label="Active Users Now" value={activeUsers.toString()} change={12.4} icon={Users} color={PURPLE} />
        <KPI label="Page Views (30m)" value={pageViews.toLocaleString()} change={8.2} icon={Eye} color={TEAL} />
        <KPI label="Events (30m)" value={events.toLocaleString()} change={-3.1} icon={Zap} color={AMBER} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Active Users (Last 30 Minutes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REALTIME_USERS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="minute" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke={PURPLE} fill={PURPLE} fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" /> Top Screens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TOP_SCREENS.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <span className="text-xs text-foreground flex-1">{s.name}</span>
                <span className="text-xs font-medium text-foreground">{s.views.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground w-12 text-right">{s.avgTime}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Top Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold">Event Name</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Count</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_EVENTS.map((e) => (
                <TableRow key={e.name} className="border-border hover:bg-muted/30">
                  <TableCell className="text-sm text-foreground">{e.name}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{e.count.toLocaleString()}</TableCell>
                  <TableCell className={`text-sm text-right ${e.pctChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {e.pctChange >= 0 ? "+" : ""}{e.pctChange}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Audience Section ────────────────────────────────────────────────────
function AudienceSection({ dateRange }: { dateRange: DateRange }) {
  const dauTrend = generateTrend(dateRange, 15000, 4000, 1);
  const mauTrend = generateTrend(dateRange, 120000, 15000, 3);
  const newUsers = generateTrend(dateRange, 800, 300, 5);
  const returningUsers = generateTrend(dateRange, 12000, 3000, 7);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="DAU" value={Math.round(dauTrend[dauTrend.length - 1].value).toLocaleString()} change={5.2} icon={Users} color={PURPLE} />
        <KPI label="MAU" value={Math.round(mauTrend[mauTrend.length - 1].value).toLocaleString()} change={8.1} icon={Users} color={TEAL} />
        <KPI label="New Users" value={Math.round(newUsers[newUsers.length - 1].value).toLocaleString()} change={12.4} icon={UserCheck} color={EMERALD} />
        <KPI label="Avg Session" value="4:32" change={3.1} icon={Clock} color={AMBER} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted flex-wrap h-auto py-1 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="userflow">User Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">DAU / MAU Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dauTrend.map((d, i) => ({ ...d, mau: mauTrend[i]?.value ?? 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="value" name="DAU" stroke={PURPLE} fill={PURPLE} fillOpacity={0.15} />
                      <Area yAxisId="right" type="monotone" dataKey="mau" name="MAU" stroke={TEAL} fill={TEAL} fillOpacity={0.15} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">New vs Returning Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dauTrend.map((d, i) => ({ ...d, new: newUsers[i]?.value ?? 0, returning: returningUsers[i]?.value ?? 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="new" stackId="1" name="New" stroke={EMERALD} fill={EMERALD} />
                      <Area type="monotone" dataKey="returning" stackId="1" name="Returning" stroke={PURPLE} fill={PURPLE} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">User Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Metric</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Value</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { metric: "Total Users", value: "124,800", change: 8.2 },
                    { metric: "Active Users (7d)", value: "42,600", change: 5.4 },
                    { metric: "Active Users (30d)", value: "68,200", change: 7.1 },
                    { metric: "Sessions", value: "184,200", change: 9.3 },
                    { metric: "Avg Session Duration", value: "4:32", change: 3.1 },
                    { metric: "Screens / Session", value: "8.4", change: 2.8 },
                    { metric: "Bounce Rate", value: "32.4%", change: -1.2 },
                    { metric: "Stickiness (DAU/MAU)", value: "22.1%", change: 1.5 },
                  ].map((r) => (
                    <TableRow key={r.metric} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm text-foreground">{r.metric}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{r.value}</TableCell>
                      <TableCell className={`text-sm text-right ${r.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {r.change >= 0 ? "+" : ""}{r.change}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={AGE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="age" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="male" name="Male" fill={PURPLE} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="female" name="Female" fill={MAGENTA} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Gender Split</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: "Male", value: 54 }, { name: "Female", value: 42 }, { name: "Other", value: 4 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                        <Cell fill={PURPLE} />
                        <Cell fill={MAGENTA} />
                        <Cell fill={TEAL} />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technology" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Device Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DEVICE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                        {DEVICE_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Operating System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={OS_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                        {OS_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Users by State</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">State</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Users</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">%</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Distribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {GEO_DATA.map((g) => (
                    <TableRow key={g.state} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm text-foreground">{g.state}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{g.users.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right">{g.pct}%</TableCell>
                      <TableCell className="w-32">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${g.pct}%` }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Users by Language</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={LANGUAGE_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill={PURPLE} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Retention Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { day: "Day 1", rate: 62, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { day: "Day 7", rate: 48, color: "text-blue-600", bg: "bg-blue-50" },
                  { day: "Day 14", rate: 38, color: "text-purple-600", bg: "bg-purple-50" },
                  { day: "Day 30", rate: 32, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((r) => (
                  <Card key={r.day} className={r.bg}>
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-foreground">{r.rate}%</p>
                      <p className={`text-sm font-medium ${r.color}`}>{r.day}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{ day: "D0", rate: 100 }, { day: "D1", rate: 62 }, { day: "D3", rate: 55 }, { day: "D7", rate: 48 }, { day: "D14", rate: 38 }, { day: "D30", rate: 32 }, { day: "D60", rate: 28 }, { day: "D90", rate: 24 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke={PURPLE} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="userflow" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">User Flow — Top Paths</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Path</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Sessions</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Drop-off</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Flow</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { path: "Home → Reels → Profile", sessions: 12400, dropoff: 18 },
                    { path: "Home → Match → Chat", sessions: 9800, dropoff: 32 },
                    { path: "Home → Live → Gift", sessions: 7200, dropoff: 45 },
                    { path: "Reels → Profile → Chat", sessions: 6400, dropoff: 28 },
                    { path: "Match → Chat → Call", sessions: 4200, dropoff: 52 },
                    { path: "Home → Wallet → Coin Store", sessions: 3800, dropoff: 12 },
                    { path: "Profile → Settings → KYC", sessions: 2100, dropoff: 35 },
                    { path: "Home → Explore → Community", sessions: 1800, dropoff: 22 },
                  ].map((p) => (
                    <TableRow key={p.path} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm font-medium text-foreground">{p.path}</TableCell>
                      <TableCell className="text-sm text-right">{p.sessions.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right text-rose-400">{p.dropoff}%</TableCell>
                      <TableCell className="w-32">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((p.sessions / 12400) * 100, 100)}%` }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Acquisition Section ───────────────────────────────────────────────────
function AcquisitionSection({ dateRange }: { dateRange: DateRange }) {
  const trend = generateTrend(dateRange, 800, 400, 2);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI label="Total Acquisitions" value={Math.round(trend[trend.length - 1].value * 30).toLocaleString()} change={12.4} icon={Users} color={PURPLE} />
        <KPI label="Cost Per Acquisition" value={"₹28"} change={-5.2} icon={IndianRupee} color={TEAL} />
        <KPI label="Conversion Rate" value="3.2%" change={0.8} icon={Target} color={EMERALD} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted flex-wrap h-auto py-1 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Acquisition Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke={PURPLE} fill={PURPLE} fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Channel Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={CHANNEL_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="users" nameKey="channel" label>
                        {CHANNEL_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Channel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Channel</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Users</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Sessions</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Conv. Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CHANNEL_DATA.map((c) => (
                    <TableRow key={c.channel} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm text-foreground">{c.channel}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{c.users.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right">{c.sessions.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{c.conversion}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Campaign</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Channel</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Budget</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Spent</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Users</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Conv.</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CAMPAIGNS.map((c) => (
                    <TableRow key={c.name} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm text-foreground font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.channel}</TableCell>
                      <TableCell className="text-sm text-right">{c.budget > 0 ? `₹${c.budget.toLocaleString()}` : "-"}</TableCell>
                      <TableCell className="text-sm text-right">{c.spent > 0 ? `₹${c.spent.toLocaleString()}` : "-"}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{c.users.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right">{c.conversions}</TableCell>
                      <TableCell className={`text-sm text-right font-medium ${c.roi > 2 ? "text-emerald-400" : "text-amber-400"}`}>{c.roi > 0 ? `${c.roi}x` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Top Referrers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs font-semibold">User</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">Referrals</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">Conversions</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { user: "Vikram R", refs: 124, conv: 42, earnings: 6200 },
                      { user: "Priya S", refs: 98, conv: 31, earnings: 4800 },
                      { user: "Ananya K", refs: 87, conv: 28, earnings: 4200 },
                      { user: "Rahul M", refs: 76, conv: 22, earnings: 3400 },
                      { user: "Sneha P", refs: 64, conv: 19, earnings: 2900 },
                      { user: "Karan D", refs: 52, conv: 15, earnings: 2300 },
                      { user: "Meera N", refs: 48, conv: 14, earnings: 2100 },
                      { user: "Arjun V", refs: 41, conv: 11, earnings: 1700 },
                    ].map((r) => (
                      <TableRow key={r.user} className="border-border hover:bg-muted/30">
                        <TableCell className="text-sm font-medium text-foreground">{r.user}</TableCell>
                        <TableCell className="text-sm text-right">{r.refs}</TableCell>
                        <TableCell className="text-sm text-right">{r.conv}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{`₹${r.earnings.toLocaleString()}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Referral Program Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Total Referral Users", value: "12,400", change: 18.2 },
                  { label: "Referral Conversion Rate", value: "34.2%", change: 2.4 },
                  { label: "Avg Referral Earnings", value: "₹340", change: 8.1 },
                  { label: "Referral Revenue", value: "₹4.2L", change: 12.6 },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className={`text-xs ${m.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {m.change >= 0 ? "+" : ""}{m.change}% vs last month
                      </p>
                    </div>
                    <p className="text-xl font-bold text-foreground">{m.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Engagement Section ──────────────────────────────────────────────────
function EngagementSection({ dateRange }: { dateRange: DateRange }) {
  const sessionTrend = generateTrend(dateRange, 6200, 1200, 3);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI label="Sessions" value={Math.round(sessionTrend[sessionTrend.length - 1].value).toLocaleString()} change={9.3} icon={Activity} color={PURPLE} />
        <KPI label="Avg Duration" value="4:32" change={3.1} icon={Clock} color={TEAL} />
        <KPI label="Screens / Session" value="8.4" change={2.8} icon={Monitor} color={AMBER} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted flex-wrap h-auto py-1 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="screenviews">Screen Views</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="userjourney">User Journey</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Session Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sessionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke={PURPLE} fill={PURPLE} fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Top Screens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TOP_SCREENS.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-xs text-foreground flex-1">{s.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[120px]">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(s.views / 12400) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium w-14 text-right">{s.views.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Top Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Event</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Count</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Users</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Per User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TOP_EVENTS.map((e) => (
                    <TableRow key={e.name} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm text-foreground">{e.name}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{e.count.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right">{Math.round(e.count / 3.2).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right">{(e.count / 42000).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">User Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {FUNNEL_STEPS.map((step, i) => {
                const pct = step.users / 10000 * 100;
                const prevPct = i > 0 ? FUNNEL_STEPS[i - 1].users / 10000 * 100 : 100;
                const conversion = i > 0 ? Math.round((step.users / FUNNEL_STEPS[i - 1].users) * 100) : 100;
                return (
                  <div key={step.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{step.name}</span>
                        <span className="text-sm text-muted-foreground">{step.users.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        {i > 0 && (
                          <span className={`text-xs font-medium ${conversion >= 50 ? "text-emerald-500" : conversion >= 30 ? "text-amber-500" : "text-rose-500"}`}>
                            {conversion}% conv
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenviews" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Screen Views — Top 10</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TOP_SCREENS.map((s, i) => {
                const pct = (s.views / 12400) * 100;
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5 font-medium">{i + 1}</span>
                    <span className="text-sm text-foreground flex-1">{s.name}</span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden max-w-[180px]">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium w-20 text-right">{s.views.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground w-14 text-right">{s.avgTime}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs font-semibold">Type</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">Created</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">Views</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { type: "Posts", created: 12400, views: 892000, engagement: "4.2%" },
                      { type: "Reels", created: 8200, views: 2100000, engagement: "8.7%" },
                      { type: "Stories", created: 48000, views: 1240000, engagement: "12.1%" },
                      { type: "Live Streams", created: 420, views: 680000, engagement: "18.4%" },
                      { type: "Audio Rooms", created: 180, views: 124000, engagement: "6.2%" },
                      { type: "Podcasts", created: 64, views: 42000, engagement: "9.1%" },
                    ].map((c) => (
                      <TableRow key={c.type} className="border-border hover:bg-muted/30">
                        <TableCell className="text-sm font-medium text-foreground">{c.type}</TableCell>
                        <TableCell className="text-sm text-right">{c.created.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-right">{c.views.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{c.engagement}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Content Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: "Posts", value: 40 }, { name: "Reels", value: 32 }, { name: "Stories", value: 18 }, { name: "Audio", value: 10 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                        <Cell fill="#E91E8C" />
                        <Cell fill="#7B2FBE" />
                        <Cell fill="#FFB800" />
                        <Cell fill="#00BCD4" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="userjourney" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">User Journey — Step-by-Step Drop-off</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: "App Open", users: 10000, drop: 0, label: "Entry" },
                { step: "Home Feed View", users: 9200, drop: 8, label: "Browse" },
                { step: "Engage with Content", users: 6800, drop: 26, label: "Engage" },
                { step: "Visit Profile", users: 4200, drop: 38, label: "Profile" },
                { step: "Initiate Match/Chat", users: 2800, drop: 33, label: "Connect" },
                { step: "Join Live/Call", users: 1400, drop: 50, label: "Interact" },
                { step: "Make Purchase", users: 720, drop: 49, label: "Monetize" },
                { step: "Return Next Day", users: 480, drop: 33, label: "Retain" },
              ].map((j, i) => {
                const pct = (j.users / 10000) * 100;
                return (
                  <div key={j.step} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{j.step}</span>
                        <span className="text-xs text-muted-foreground">{j.users.toLocaleString()} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        {j.drop > 0 && (
                          <span className="text-xs text-rose-400 font-medium flex-shrink-0">-{j.drop}%</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">{j.label}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Retention Section ───────────────────────────────────────────────────
function RetentionSection({ dateRange }: { dateRange: DateRange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI label="Day 7 Retention" value="48%" change={2.4} icon={Calendar} color={PURPLE} />
        <KPI label="Day 30 Retention" value="32%" change={1.8} icon={Calendar} color={TEAL} />
        <KPI label="Churn Rate" value="18%" change={-1.2} icon={TrendingDown} color={ROSE} />
      </div>

      <Tabs defaultValue="cohorts">
        <TabsList className="bg-muted flex-wrap h-auto py-1 gap-1">
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="churn">Churn Rate</TabsTrigger>
          <TabsTrigger value="returning">Returning vs New</TabsTrigger>
          <TabsTrigger value="ltv">Lifetime Value</TabsTrigger>
        </TabsList>

        <TabsContent value="cohorts" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Cohort Retention Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs font-semibold">Cohort</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">D0</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">D7</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">D14</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">D30</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">D60</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">D90</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {COHORT_DATA.map((c) => (
                      <TableRow key={c.month} className="border-border hover:bg-muted/30">
                        <TableCell className="text-sm font-medium text-foreground">{c.month}</TableCell>
                        <TableCell className="text-sm text-right bg-purple-50 text-purple-700 font-bold">{c.d0}%</TableCell>
                        <TableCell className={`text-sm text-right ${c.d7 >= 55 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"} font-medium`}>{c.d7}%</TableCell>
                        <TableCell className="text-sm text-right">{c.d14}%</TableCell>
                        <TableCell className="text-sm text-right">{c.d30}%</TableCell>
                        <TableCell className="text-sm text-right">{c.d60}%</TableCell>
                        <TableCell className="text-sm text-right">{c.d90}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={COHORT_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="d7" name="Day 7" stroke={TEAL} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="d30" name="Day 30" stroke={PURPLE} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="d90" name="Day 90" stroke={AMBER} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ltv" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Lifetime Value Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={LTV_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="arpu" name="ARPU" fill={TEAL} radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="ltv" name="LTV" stroke={PURPLE} strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="arppu" name="ARPPU" stroke={AMBER} strokeWidth={2} strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">LTV Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Average LTV", value: "₹584", change: 12.4 },
                  { label: "ARPU (Monthly)", value: "₹340", change: 8.2 },
                  { label: "ARPPU (Monthly)", value: "₹1,580", change: 15.6 },
                  { label: "Payback Period", value: "14 days", change: -2.1 },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className={`text-xs ${m.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {m.change >= 0 ? "+" : ""}{m.change}% vs last month
                      </p>
                    </div>
                    <p className="text-xl font-bold text-foreground">{m.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="churn" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Churn Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{ day: "W1", rate: 22 }, { day: "W2", rate: 20 }, { day: "W3", rate: 19 }, { day: "W4", rate: 18 }, { day: "W5", rate: 18 }, { day: "W6", rate: 17 }, { day: "W7", rate: 18 }, { day: "W8", rate: 16 }, { day: "W9", rate: 17 }, { day: "W10", rate: 16 }, { day: "W11", rate: 15 }, { day: "W12", rate: 16 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="rate" stroke={ROSE} fill={ROSE} fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Churn Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Daily Churn", value: "2.1%", change: -0.3 },
                  { label: "Weekly Churn", value: "8.4%", change: -0.8 },
                  { label: "Monthly Churn", value: "16.2%", change: -1.2 },
                  { label: "Quarterly Churn", value: "28.4%", change: -2.1 },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className={`text-xs ${m.change >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {m.change >= 0 ? "+" : ""}{m.change}% vs last period
                      </p>
                    </div>
                    <p className="text-xl font-bold text-foreground">{m.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="returning" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Returning vs New Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{ day: "Mon", new: 1200, returning: 4200 }, { day: "Tue", new: 1500, returning: 4800 }, { day: "Wed", new: 1800, returning: 5100 }, { day: "Thu", new: 1400, returning: 4900 }, { day: "Fri", new: 2000, returning: 5400 }, { day: "Sat", new: 2500, returning: 6200 }, { day: "Sun", new: 3000, returning: 6800 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="new" stackId="1" name="New Users" stroke={EMERALD} fill={EMERALD} />
                    <Area type="monotone" dataKey="returning" stackId="1" name="Returning Users" stroke={PURPLE} fill={PURPLE} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {[
                  { label: "New Users (7d)", value: "13,400", pct: 24 },
                  { label: "Returning Users (7d)", value: "42,100", pct: 76 },
                  { label: "Returning Ratio", value: "3.1x", pct: 100 },
                ].map((m) => (
                  <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-lg font-bold text-foreground">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-xs text-purple-500 mt-1">{m.pct}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Monetization Section ────────────────────────────────────────────────
function MonetizationSection({ dateRange }: { dateRange: DateRange }) {
  const revenueTrend = generateTrend(dateRange, 85000, 25000, 4);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Revenue" value={`₹${(revenueTrend[revenueTrend.length - 1].value * 30 / 100000).toFixed(2)}L`} change={12.4} icon={IndianRupee} color={PURPLE} />
        <KPI label="MRR" value={"₹2.54L"} change={8.2} icon={TrendingUp} color={TEAL} />
        <KPI label="ARPU" value={"₹340"} change={5.1} icon={Users} color={AMBER} />
        <KPI label="ARPPU" value={"₹1,580"} change={15.6} icon={Crown} color={EMERALD} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted flex-wrap h-auto py-1 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="coins">Coin Purchases</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="ads">Ad Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke={EMERALD} fill={EMERALD} fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={REVENUE_STREAMS} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" label>
                        {REVENUE_STREAMS.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coins" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Coin Package Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Package</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Purchases</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Revenue</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COIN_PACKAGES.map((p) => (
                    <TableRow key={p.name} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm font-medium text-foreground">{p.name}</TableCell>
                      <TableCell className="text-sm text-right">{p.purchases.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{`₹${p.revenue.toLocaleString()}`}</TableCell>
                      <TableCell className="w-32">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((p.revenue / 1049580) * 100, 100)}%` }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Subscription Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Free", count: 89200, revenue: 0, color: "bg-gray-100 text-gray-600" },
                  { label: "Silver", count: 12400, revenue: 248000, color: "bg-gray-100 text-gray-600" },
                  { label: "Gold", count: 8200, revenue: 410000, color: "bg-amber-100 text-amber-600" },
                  { label: "Platinum", count: 4800, revenue: 480000, color: "bg-purple-100 text-purple-600" },
                  { label: "Diamond", count: 1200, revenue: 300000, color: "bg-pink-100 text-pink-600" },
                  { label: "Creator Basic", count: 3400, revenue: 170000, color: "bg-blue-100 text-blue-600" },
                  { label: "Creator Pro", count: 1800, revenue: 270000, color: "bg-purple-100 text-purple-600" },
                  { label: "Creator Elite", count: 600, revenue: 300000, color: "bg-pink-100 text-pink-600" },
                ].map((s) => (
                  <div key={s.label} className={`p-3 rounded-lg ${s.color}`}>
                    <p className="text-xs font-medium">{s.label}</p>
                    <p className="text-lg font-bold">{s.count.toLocaleString()}</p>
                    {s.revenue > 0 && <p className="text-xs">{`₹${s.revenue.toLocaleString()}`}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Ad Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Ad Type</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Impressions</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">CTR</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AD_REVENUE.map((a) => (
                    <TableRow key={a.type} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm font-medium text-foreground">{a.type}</TableCell>
                      <TableCell className="text-sm text-right">{a.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right">{a.ctr}%</TableCell>
                      <TableCell className="text-sm text-right font-medium">{`₹${a.revenue.toLocaleString()}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Transaction Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Total Transactions", value: "42,800", change: 12.4 },
                  { label: "Avg Order Value", value: "₹480", change: 5.2 },
                  { label: "Success Rate", value: "94.2%", change: 1.8 },
                  { label: "Failed Transactions", value: "2,480", change: -3.1 },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className={`text-xs ${m.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {m.change >= 0 ? "+" : ""}{m.change}% vs last month
                      </p>
                    </div>
                    <p className="text-xl font-bold text-foreground">{m.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Payment Method Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: "UPI", value: 48 }, { name: "Cards", value: 28 }, { name: "Wallets", value: 14 }, { name: "Net Banking", value: 8 }, { name: "COD", value: 2 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                        <Cell fill="#7B2FBE" />
                        <Cell fill="#E91E8C" />
                        <Cell fill="#06B6D4" />
                        <Cell fill="#F59E0B" />
                        <Cell fill="#10B981" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Conversions Section ─────────────────────────────────────────────────
function ConversionsSection({ dateRange }: { dateRange: DateRange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI label="Goal Completions" value="8,200" change={12.4} icon={Target} color={PURPLE} />
        <KPI label="Conversion Rate" value="3.2%" change={0.8} icon={TrendingUp} color={TEAL} />
        <KPI label="Goal Value" value={"₹12.4L"} change={15.6} icon={IndianRupee} color={EMERALD} />
      </div>

      <Tabs defaultValue="goals">
        <TabsList className="bg-muted flex-wrap h-auto py-1 gap-1">
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="conversion-rate">Conversion Rate</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Goal Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Goal</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Completions</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Rate</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Value</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {GOAL_DATA.map((g) => (
                    <TableRow key={g.name} className="border-border hover:bg-muted/30">
                      <TableCell className="text-sm font-medium text-foreground">{g.name}</TableCell>
                      <TableCell className="text-sm text-right">{g.completions.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right">{g.rate}%</TableCell>
                      <TableCell className="text-sm text-right">{g.value > 0 ? `₹${g.value.toLocaleString()}` : "-"}</TableCell>
                      <TableCell className="w-32">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(g.rate, 100)}%` }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {FUNNEL_STEPS.map((step, i) => {
                const pct = step.users / 10000 * 100;
                return (
                  <div key={step.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{step.name}</span>
                        <span className="text-sm text-muted-foreground">{step.users.toLocaleString()} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {step.drop > 0 && (
                      <span className="text-xs text-rose-400 font-medium flex-shrink-0">-{step.drop}%</span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Attribution Model Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { model: "First Touch", organic: 42, paid: 28, social: 18, referral: 8, direct: 4 },
                  { model: "Last Touch", organic: 32, paid: 38, social: 12, referral: 8, direct: 10 },
                  { model: "Linear", organic: 35, paid: 32, social: 16, referral: 9, direct: 8 },
                  { model: "Time Decay", organic: 30, paid: 40, social: 14, referral: 8, direct: 8 },
                ].map((m) => (
                  <div key={m.model} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{m.model}</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden flex">
                      <div className="bg-purple-500" style={{ width: `${m.organic}%` }} />
                      <div className="bg-pink-500" style={{ width: `${m.paid}%` }} />
                      <div className="bg-teal-500" style={{ width: `${m.social}%` }} />
                      <div className="bg-amber-500" style={{ width: `${m.referral}%` }} />
                      <div className="bg-emerald-500" style={{ width: `${m.direct}%` }} />
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 text-purple-500" /> Organic {m.organic}%</span>
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 text-pink-500" /> Paid {m.paid}%</span>
                      <span className="flex items-center gap-1"><Circle className="w-2 h-2 text-teal-500" /> Social {m.social}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Conversion by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHANNEL_DATA.map((c) => ({ ...c, conv: c.conversion }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="channel" type="category" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="conv" name="Conversion %" fill={PURPLE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="conversion-rate" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Conversion Rate by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHANNEL_DATA.map((c) => ({ ...c, conv: c.conversion }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="channel" type="category" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="conv" name="Conversion %" fill={PURPLE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Conversion Rate by Cohort</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={COHORT_DATA.map((c) => ({ month: c.month, rate: c.d30 / 100 * 3.2 }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="rate" name="Conv Rate %" fill={TEAL} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Main Reports Page ─────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("realtime");
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(2025, 3, 1), to: new Date() });

  const renderSection = () => {
    switch (activeCategory) {
      case "realtime":    return <RealtimeSection dateRange={dateRange} />;
      case "audience":    return <AudienceSection dateRange={dateRange} />;
      case "acquisition": return <AcquisitionSection dateRange={dateRange} />;
      case "engagement":  return <EngagementSection dateRange={dateRange} />;
      case "retention":   return <RetentionSection dateRange={dateRange} />;
      case "monetization":return <MonetizationSection dateRange={dateRange} />;
      case "conversions": return <ConversionsSection dateRange={dateRange} />;
      default:            return <RealtimeSection dateRange={dateRange} />;
    }
  };

  return (
    <div className="flex gap-0 min-h-[calc(100vh-80px)]">
      {/* GA-style Sidebar */}
      <div className="w-[220px] flex-shrink-0 bg-card border-r border-border hidden md:block">
        <div className="p-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Reports</h2>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className="md:hidden p-4 bg-card border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-500" />
              {CATEGORIES.find((c) => c.id === activeCategory)?.label} Reports
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Google Analytics-style reporting — deep insights into your platform
            </p>
          </div>
        </div>

        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          exportFilename={`${activeCategory}_report.csv`}
        />

        {renderSection()}
      </div>
    </div>
  );
}


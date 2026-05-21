import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, UserPlus, FileText, Coins, IndianRupee, TrendingUp, Radio,
  Zap, Heart, Star, Award, Briefcase, Shield, Crown,
  ArrowUpRight, CheckCircle, Clock, AlertTriangle,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { AdminRole } from "@/App";

const dauData = [
  { name: "1",  dau: 4000,  mau: 18000 }, { name: "5",  dau: 3000,  mau: 17500 },
  { name: "10", dau: 5000,  mau: 19000 }, { name: "15", dau: 4500,  mau: 19800 },
  { name: "20", dau: 6000,  mau: 21000 }, { name: "25", dau: 5500,  mau: 22000 },
  { name: "30", dau: 7000,  mau: 23400 },
];

const revenueData = [
  { name: "Jul", coins: 820000,  subscriptions: 240000, ads: 180000 },
  { name: "Aug", coins: 940000,  subscriptions: 280000, ads: 210000 },
  { name: "Sep", coins: 1100000, subscriptions: 320000, ads: 250000 },
  { name: "Oct", coins: 1280000, subscriptions: 380000, ads: 290000 },
  { name: "Nov", coins: 1480000, subscriptions: 420000, ads: 310000 },
  { name: "Dec", coins: 1720000, subscriptions: 480000, ads: 340000 },
];

const registrationsData = [
  { name: "Mon", value: 1200 }, { name: "Tue", value: 1500 }, { name: "Wed", value: 1800 },
  { name: "Thu", value: 1400 }, { name: "Fri", value: 2000 }, { name: "Sat", value: 2500 },
  { name: "Sun", value: 3000 },
];


const agentPerformanceData = [
  { name: "Vikram R", hosts: 312, active: 278, earnings: "₹1.2L", level: "A5" },
  { name: "Sunita J",  hosts: 198, active: 163, earnings: "₹84K",  level: "A4" },
  { name: "Deepak S",  hosts: 142, active: 118, earnings: "₹62K",  level: "A3" },
  { name: "Meena P",   hosts:  96, active:  79, earnings: "₹41K",  level: "A3" },
  { name: "Rohan V",   hosts:  54, active:  43, earnings: "₹23K",  level: "A2" },
];

const hostLevelData = [
  { level: "L7 Crown", count: 4 }, { level: "L6 Diamond", count: 12 },
  { level: "L5 Gold", count: 38 }, { level: "L4 Silver+", count: 94 },
  { level: "L3 Silver", count: 210 }, { level: "L2 Bronze+", count: 380 },
  { level: "L1 Bronze", count: 546 },
];

const contentPieData = [
  { name: "Posts", value: 40 }, { name: "Reels", value: 32 },
  { name: "Stories", value: 18 }, { name: "Audio", value: 10 },
];
const PIE_COLORS = ["#E91E8C", "#7B2FBE", "#FFB800", "#00BCD4"];

const RECENT_ACTIVITY_SA = [
  { type: "level",  msg: "Kavya Reddy promoted to L5 Gold Host — Agent: Vikram Rao",   time: "2m ago",  icon: "⭐" },
  { type: "agent",  msg: "Deepak Singh (A2→A3) — passed 100-host milestone",           time: "8m ago",  icon: "📈" },
  { type: "kyc",    msg: "Diwali coin gifting event: 4.2L coins circulated in 1h",       time: "15m ago", icon: "🪙" },
  { type: "payout", msg: "Payout ₹48,000 approved for Vikram R (A5 Agent)",            time: "22m ago", icon: "💸" },
  { type: "live",   msg: "Kavya Reddy started PK Battle — 1,240 viewers",              time: "28m ago", icon: "🔴" },
  { type: "fraud",  msg: "Anti-cheat flagged cluster-99 for bot patterns",             time: "34m ago", icon: "🚨" },
  { type: "kyc",    msg: "4 new host KYC applications — 2 approved, 2 under review",   time: "45m ago", icon: "🪪" },
  { type: "coin",   msg: "New recharge record: ₹4.2L in last 1 hour",                 time: "1h ago",  icon: "🪙" },
];

const RECENT_ACTIVITY_ADMIN = [
  { type: "host",   msg: "Ananya Sen (L3→L4) promoted by you — 3 hosts ready to level up", time: "5m ago",  icon: "⭐" },
  { type: "agent",  msg: "Agent Ramesh K passed monthly target — 28 active hosts",          time: "18m ago", icon: "✅" },
  { type: "kyc",    msg: "2 KYC applications in your queue — action needed",                time: "30m ago", icon: "🪪" },
  { type: "payout", msg: "Payout ₹12,400 scheduled for agent Deepak S",                     time: "45m ago", icon: "💸" },
  { type: "live",   msg: "8 hosts from your network live right now",                        time: "1h ago",  icon: "🔴" },
  { type: "host",   msg: "Meera Pillai reached L2 Silver threshold — promote now",          time: "2h ago",  icon: "📊" },
];

const RECENT_ACTIVITY_AGENT = [
  { type: "host",  msg: "Priya R (your host) went live — 420 viewers watching now",    time: "3m ago",  icon: "🔴" },
  { type: "host",  msg: "Kavya M passed L3 threshold — eligible for promotion",        time: "20m ago", icon: "⭐" },
  { type: "kyc",   msg: "New host application from Divya Nair — review pending",       time: "1h ago",  icon: "🪪" },
  { type: "earn",  msg: "Your commission this week: ₹8,240 (5% on 4.1L coins gifted)",time: "2h ago",  icon: "💰" },
  { type: "host",  msg: "3 hosts inactive for 25+ days — follow up to prevent freeze", time: "3h ago",  icon: "⚠️" },
];

const RECENT_ACTIVITY_HOST = [
  { type: "earn",  msg: "You received 2,400 coins from fans today — keep streaming!",  time: "10m ago", icon: "🎁" },
  { type: "level", msg: "You're 1.6L coins away from L4 Gold — you can do it!",        time: "1h ago",  icon: "⭐" },
  { type: "pk",    msg: "Your last PK battle: 840 coins earned · 3rd win this week",   time: "3h ago",  icon: "⚡" },
  { type: "fan",   msg: "12 new fan club members today",                                time: "5h ago",  icon: "❤️" },
  { type: "payout",msg: "Withdrawal ₹3,200 processed to your UPI — 2–3 working days", time: "Yesterday",icon: "💸" },
];

const PLATFORM_STATS = [
  { label: "Total Users",        value: "1.02 Cr", change: "+2.5%",        up: true,  icon: Users,       color: "text-blue-600 bg-blue-50"     },
  { label: "DAU",                value: "23.4 L",  change: "+5.2%",        up: true,  icon: UserPlus,    color: "text-green-600 bg-green-50"   },
  { label: "Revenue (Month)",    value: "₹2.54 Cr",change: "+8.1%",        up: true,  icon: IndianRupee, color: "text-emerald-600 bg-emerald-50"},
  { label: "Posts Today",        value: "45,678",  change: "+12.5%",       up: true,  icon: FileText,    color: "text-purple-600 bg-purple-50" },
  { label: "Coins In Circulation",value:"8.4 Cr",  change: "+18.2%",       up: true,  icon: Coins,       color: "text-yellow-600 bg-yellow-50" },
  { label: "Live Streams Now",   value: "284",     change: "+34 from 1h",  up: true,  icon: Radio,       color: "text-red-600 bg-red-50"       },
  { label: "Audio Rooms Live",   value: "148",     change: "+22 from 1h",  up: true,  icon: Radio,       color: "text-indigo-600 bg-indigo-50" },
  { label: "PK Battles Live",   value: "48",      change: "+16 today",    up: true,  icon: Zap,         color: "text-orange-600 bg-orange-50" },
];

const NETWORK_SA = [
  { label: "Total Agents",     value: "42",     sub: "3 Admins managing",    icon: Briefcase,  color: "text-violet-600 bg-violet-50", badge: null },
  { label: "Total Hosts",      value: "1,284",  sub: "+47 this week",         icon: Star,       color: "text-yellow-600 bg-yellow-50", badge: null },
  { label: "Live Hosts Now",   value: "284",    sub: "22% of active hosts",   icon: Radio,      color: "text-red-600 bg-red-50",       badge: "LIVE" },
  { label: "KYC Pending",      value: "17",     sub: "4 submitted today",     icon: Shield,     color: "text-orange-600 bg-orange-50", badge: "⚠" },
  { label: "Promotions Due",   value: "8",      sub: "Hosts at threshold",    icon: Crown,      color: "text-amber-600 bg-amber-50",   badge: null },
  { label: "Payouts Pending",  value: "₹3.2L",  sub: "12 agent requests",     icon: IndianRupee,color: "text-green-600 bg-green-50",   badge: null },
];

const NETWORK_ADMIN = [
  { label: "My Agents",       value: "14",    sub: "2 promoted this month",  icon: Briefcase,  color: "text-violet-600 bg-violet-50", badge: null },
  { label: "Total My Hosts",  value: "428",   sub: "+16 this week",          icon: Star,       color: "text-yellow-600 bg-yellow-50", badge: null },
  { label: "Live Right Now",  value: "96",    sub: "22% of my hosts",        icon: Radio,      color: "text-red-600 bg-red-50",       badge: "LIVE" },
  { label: "KYC My Queue",    value: "5",     sub: "Action needed",          icon: Shield,     color: "text-orange-600 bg-orange-50", badge: "⚠" },
  { label: "Promotions Due",  value: "3",     sub: "In my network",          icon: Crown,      color: "text-amber-600 bg-amber-50",   badge: null },
  { label: "Agent Payouts",   value: "₹94K",  sub: "4 pending requests",     icon: IndianRupee,color: "text-green-600 bg-green-50",   badge: null },
];

const NETWORK_AGENT = [
  { label: "My Hosts",        value: "54",   sub: "+4 onboarded this week", icon: Star,       color: "text-yellow-600 bg-yellow-50", badge: null },
  { label: "Active Hosts",    value: "43",   sub: "79% active rate",        icon: CheckCircle,color: "text-green-600 bg-green-50",   badge: null },
  { label: "Live Right Now",  value: "12",   sub: "22% of my hosts",        icon: Radio,      color: "text-red-600 bg-red-50",       badge: "LIVE" },
  { label: "KYC Queue",       value: "2",    sub: "Action needed",          icon: Shield,     color: "text-orange-600 bg-orange-50", badge: "⚠" },
  { label: "Commission (Mo)", value: "₹23K", sub: "+12% vs last month",     icon: IndianRupee,color: "text-emerald-600 bg-emerald-50",badge: null },
  { label: "Inactive Alert",  value: "3",    sub: "25+ days no stream",     icon: AlertTriangle,color:"text-amber-600 bg-amber-50",  badge: null },
];

const HOST_QUICK = [
  { label: "My Level",          value: "L3 Silver",       icon: Star,       color: "text-yellow-500" },
  { label: "Coins Earned Total", value: "2.4L coins",      icon: Coins,      color: "text-pink-500"   },
  { label: "Stream Hours",      value: "124 hrs",          icon: Clock,      color: "text-purple-500" },
  { label: "PK Wins",           value: "8 wins",           icon: Zap,        color: "text-orange-500" },
  { label: "Fan Club Members",  value: "342 fans",         icon: Heart,      color: "text-red-500"    },
  { label: "Next Payout",       value: "₹3,200 pending",   icon: IndianRupee,color: "text-green-500"  },
];

const LEVEL_PROGRESS = [
  { label: "Coins to L4",  current: 240000, target: 500000, color: "#E91E8C" },
  { label: "Stream Hours", current: 124,    target: 200,    color: "#7B2FBE" },
  { label: "PK Wins",      current: 8,      target: 10,     color: "#FFB800" },
];

const roleLabel: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

export default function Dashboard() {
  const [role, setRole] = useState<AdminRole>("super_admin");

  useEffect(() => {
    const stored = localStorage.getItem("ridhi_admin_role") as AdminRole | null;
    if (stored) setRole(stored);
  }, []);

  const isSA    = role === "super_admin";
  const isAdmin = role === "admin";

  const networkStats = isSA ? NETWORK_SA : NETWORK_ADMIN;
  const activityFeed = isSA ? RECENT_ACTIVITY_SA : RECENT_ACTIVITY_ADMIN;

  const subtitles: Record<AdminRole, string> = {
    super_admin: "Full platform overview — SA view",
    admin:       "Your network: agents + hosts under your management",
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Platform Overview
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{subtitles[role]}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {roleLabel[role]}
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-green-600 border-green-200 bg-green-50">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* ── Platform KPIs (SA/Admin only) ──────────────────────────────── */}
      {(isSA || isAdmin) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PLATFORM_STATS.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color} flex-shrink-0`}><s.icon className="w-5 h-5" /></div>
                <div className="min-w-0">
                  <p className="text-xl font-bold truncate">{s.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                  <p className="text-xs flex items-center gap-0.5 mt-0.5 text-green-500">
                    <TrendingUp className="h-3 w-3" /> {s.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Host level progress (removed — hosts use mobile app) ── */}
      {false && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">⭐</span> Progress to L4 Gold Host
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-white text-xs">L3 Silver</Badge>
                <span className="text-muted-foreground text-xs">→</span>
                <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">L4 Gold</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {LEVEL_PROGRESS.map((bar) => {
              const pct = Math.round((bar.current / bar.target) * 100);
              return (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{bar.label}</span>
                    <span className="font-medium">{pct}% — {bar.current.toLocaleString()} / {bar.target.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: bar.color }} />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground mt-2">
              💡 Stream 76 more hours + win 2 more PK battles + earn 2.6L more coins to reach L4 Gold.
            </p>
          </CardContent>
        </Card>
      )}


      {/* ── Creator Network Health (SA / Admin) ────────────────────────── */}
      {networkStats && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Creator Network Health
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {networkStats.map((s) => (
              <Card key={s.label} className="relative overflow-hidden">
                <CardContent className="p-3">
                  <div className={`inline-flex p-1.5 rounded-md ${s.color} mb-2`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-lg font-bold leading-none">{s.value}</p>
                    {s.badge === "LIVE" && (
                      <Badge className="text-[10px] px-1 py-0 h-4 bg-red-500 text-white animate-pulse">LIVE</Badge>
                    )}
                    {s.badge === "⚠" && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-orange-400 text-orange-500">!</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground/70 leading-tight">{s.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Charts row (SA / Admin) ─────────────────────────────────────── */}
      {(isSA || isAdmin) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">DAU / MAU Trend (30 Days)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dauData}>
                    <defs>
                      <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number, n: string) => [v.toLocaleString(), n === "dau" ? "DAU" : "MAU"]} />
                    <Area type="monotone" dataKey="mau" name="MAU" stroke="#7B2FBE" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="5 3" />
                    <Area type="monotone" dataKey="dau" name="DAU" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#dauGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Revenue Breakdown (6 Months)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                    <Tooltip formatter={(v: number) => `₹${(v / 100000).toFixed(2)}L`} />
                    <Bar dataKey="coins"         name="Coins"         stackId="a" fill="#E91E8C" />
                    <Bar dataKey="subscriptions" name="Subscriptions" stackId="a" fill="#7B2FBE" />
                    <Bar dataKey="ads"           name="Ads"           stackId="a" fill="#FFB800" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      {/* ── Charts row 2 (SA / Admin) ───────────────────────────────────── */}
      {(isSA || isAdmin) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">New Registrations (This Week)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={registrationsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Registrations" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Content Distribution</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="h-[190px] w-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={contentPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                      {contentPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {contentPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-bold ml-auto">{d.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Host Coin Earnings (7 Days)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { day: "Mon", gifted: 380000, withdrawn: 42000 },
                    { day: "Tue", gifted: 420000, withdrawn: 38000 },
                    { day: "Wed", gifted: 510000, withdrawn: 55000 },
                    { day: "Thu", gifted: 470000, withdrawn: 48000 },
                    { day: "Fri", gifted: 620000, withdrawn: 71000 },
                    { day: "Sat", gifted: 740000, withdrawn: 88000 },
                    { day: "Sun", gifted: 810000, withdrawn: 96000 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => `${(v/1000).toFixed(0)}K coins`} />
                    <Line dataKey="gifted"    name="Coins Gifted"    stroke="#E91E8C" strokeWidth={2} dot={false} />
                    <Line dataKey="withdrawn" name="Withdrawals"     stroke="#7B2FBE" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Agent leaderboard (SA / Admin) ─────────────────────────────── */}
      {(isSA || isAdmin) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-500" /> Agent Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agentPerformanceData.map((a, i) => (
                  <div key={a.name} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                      {a.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.hosts} hosts · {a.active} active</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="secondary" className="text-[10px] mb-0.5">{a.level}</Badge>
                      <p className="text-xs font-semibold text-green-600">{a.earnings}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" /> Host Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hostLevelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="level" tick={{ fontSize: 10 }} width={72} />
                    <Tooltip />
                    <Bar dataKey="count" name="Hosts" fill="#7B2FBE" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Activity feed + stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {"Live Activity Feed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-lg w-6 flex-shrink-0">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-tight">{a.msg}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Quick Platform Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {((isSA || isAdmin) ? [
              { label: "Active Hosts (Live)",  value: "18 / 284 total",         icon: Radio,        color: "text-red-500"    },
              { label: "Top Agent (A5)",       value: "Vikram Rao · 312 hosts", icon: Award,        color: "text-purple-500" },
              { label: "Active PK Battles",    value: "48 rooms · 96 players",  icon: Zap,          color: "text-yellow-500" },
              { label: "Coin Recharges Today", value: "₹2.4L · 1,284 txns",    icon: Coins,        color: "text-green-500"  },
              { label: "Fan Club Subs",        value: "8,420 active subs",      icon: Heart,        color: "text-pink-500"   },
              { label: "Tournament Players",   value: "192 competing now",      icon: Star,         color: "text-indigo-500" },
            ] : [
              { label: "My Active Hosts",      value: "43 of 54",               icon: CheckCircle,  color: "text-green-500"  },
              { label: "Hosts Live Now",        value: "12 streaming",           icon: Radio,        color: "text-red-500"    },
              { label: "This Month Coins",     value: "4.6L gifted",             icon: Coins,        color: "text-yellow-500" },
              { label: "Commission Rate",      value: "5% (A2 tier)",            icon: Award,        color: "text-purple-500" },
              { label: "Pending KYC",          value: "2 applications",          icon: Shield,       color: "text-orange-500" },
              { label: "Next Payout",          value: "₹23K estimated",          icon: IndianRupee,  color: "text-emerald-500"},
            ]).map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <s.icon className={`w-4 h-4 flex-shrink-0 ${s.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-medium truncate">{s.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

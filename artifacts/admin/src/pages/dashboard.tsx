import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, FileText, Coins, IndianRupee, TrendingUp, Radio, Gamepad2, Zap, Heart, Star, Award } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const dauData = [
  { name: "1", dau: 4000, mau: 18000 }, { name: "5", dau: 3000, mau: 17500 }, { name: "10", dau: 5000, mau: 19000 },
  { name: "15", dau: 4500, mau: 19800 }, { name: "20", dau: 6000, mau: 21000 }, { name: "25", dau: 5500, mau: 22000 }, { name: "30", dau: 7000, mau: 23400 }
];

const revenueData = [
  { name: "Jul", coins: 820000, subscriptions: 240000, ads: 180000 },
  { name: "Aug", coins: 940000, subscriptions: 280000, ads: 210000 },
  { name: "Sep", coins: 1100000, subscriptions: 320000, ads: 250000 },
  { name: "Oct", coins: 1280000, subscriptions: 380000, ads: 290000 },
  { name: "Nov", coins: 1480000, subscriptions: 420000, ads: 310000 },
  { name: "Dec", coins: 1720000, subscriptions: 480000, ads: 340000 },
];

const registrationsData = [
  { name: "Mon", value: 1200 }, { name: "Tue", value: 1500 }, { name: "Wed", value: 1800 },
  { name: "Thu", value: 1400 }, { name: "Fri", value: 2000 }, { name: "Sat", value: 2500 }, { name: "Sun", value: 3000 }
];

const gamingData = [
  { day: "Mon", ludo: 420, carrom: 180, battles: 64 },
  { day: "Tue", ludo: 380, carrom: 220, battles: 72 },
  { day: "Wed", ludo: 510, carrom: 240, battles: 88 },
  { day: "Thu", ludo: 470, carrom: 200, battles: 76 },
  { day: "Fri", ludo: 620, carrom: 310, battles: 110 },
  { day: "Sat", ludo: 740, carrom: 380, battles: 132 },
  { day: "Sun", ludo: 810, carrom: 420, battles: 148 },
];

const contentPieData = [
  { name: "Posts", value: 38 }, { name: "Reels", value: 28 }, { name: "Stories", value: 22 }, { name: "Gaming", value: 12 },
];
const PIE_COLORS = ["#E91E8C", "#7B2FBE", "#FFB800", "#00BCD4"];

const RECENT_ACTIVITY = [
  { type: "user", msg: "Priya Sharma reached L7 Royal Crown", time: "2m ago", icon: "👑" },
  { type: "gaming", msg: "Diwali Coin Cup: 128 players registered", time: "5m ago", icon: "🏆" },
  { type: "payout", msg: "Payout ₹48,000 approved for Vikram R (A5 Agent)", time: "12m ago", icon: "💸" },
  { type: "live", msg: "Kavya Reddy started a PK Battle — 1,240 viewers", time: "18m ago", icon: "🔴" },
  { type: "fraud", msg: "Anti-cheat flagged cluster-99 for bot patterns", time: "22m ago", icon: "🚨" },
  { type: "coin", msg: "New recharge record: ₹4.2L in last 1 hour", time: "35m ago", icon: "🪙" },
  { type: "user", msg: "10,000 new registrations today (↑38%)", time: "1h ago", icon: "👥" },
];

const PLATFORM_STATS = [
  { label: "Total Users", value: "1.02 Cr", change: "+2.5%", up: true, icon: Users, color: "text-blue-600 bg-blue-50" },
  { label: "DAU", value: "23.4 L", change: "+5.2%", up: true, icon: UserPlus, color: "text-green-600 bg-green-50" },
  { label: "Revenue (Month)", value: "₹2.54 Cr", change: "+8.1%", up: true, icon: IndianRupee, color: "text-emerald-600 bg-emerald-50" },
  { label: "Posts Today", value: "45,678", change: "+12.5%", up: true, icon: FileText, color: "text-purple-600 bg-purple-50" },
  { label: "Coins In Circulation", value: "8.4 Cr", change: "+18.2%", up: true, icon: Coins, color: "text-yellow-600 bg-yellow-50" },
  { label: "Live Streams Now", value: "284", change: "+34 from 1h ago", up: true, icon: Radio, color: "text-red-600 bg-red-50" },
  { label: "Gaming Sessions", value: "8,420", change: "+22.4%", up: true, icon: Gamepad2, color: "text-indigo-600 bg-indigo-50" },
  { label: "PK Battles Live", value: "48", change: "+16 today", up: true, icon: Zap, color: "text-orange-600 bg-orange-50" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Overview</h2>
          <p className="text-muted-foreground text-sm mt-1">Real-time snapshot — Ridhi Social & Gaming Platform</p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-green-600 border-green-200 bg-green-50">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
          All Systems Operational
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PLATFORM_STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color} flex-shrink-0`}><s.icon className="w-5 h-5" /></div>
              <div className="min-w-0">
                <p className="text-xl font-bold truncate">{s.value}</p>
                <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                <p className={`text-xs flex items-center gap-0.5 mt-0.5 ${s.up ? "text-green-500" : "text-red-500"}`}>
                  <TrendingUp className="h-3 w-3" /> {s.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">DAU / MAU Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dauData}>
                  <defs>
                    <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number, n: string) => [`${v.toLocaleString()}`, n === "dau" ? "DAU" : "MAU"]} />
                  <Area type="monotone" dataKey="mau" name="MAU" stroke="#7B2FBE" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="5 3" />
                  <Area type="monotone" dataKey="dau" name="DAU" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#dauGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Breakdown (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(v: number) => `₹${(v / 100000).toFixed(2)}L`} />
                  <Bar dataKey="coins" name="Coins" stackId="a" fill="#E91E8C" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="subscriptions" name="Subscriptions" stackId="a" fill="#7B2FBE" />
                  <Bar dataKey="ads" name="Ads" stackId="a" fill="#FFB800" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Registrations (This Week)</CardTitle>
          </CardHeader>
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
          <CardHeader>
            <CardTitle className="text-base">Content Distribution</CardTitle>
          </CardHeader>
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
          <CardHeader>
            <CardTitle className="text-base">Gaming Activity (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gamingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line dataKey="ludo" name="Ludo" stroke="#E91E8C" strokeWidth={2} dot={false} />
                  <Line dataKey="carrom" name="Carrom" stroke="#7B2FBE" strokeWidth={2} dot={false} />
                  <Line dataKey="battles" name="PK Battles" stroke="#FFB800" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Live Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_ACTIVITY.map((a, i) => (
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
            <CardTitle className="text-base">Quick Platform Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Active Hosts (Live)", value: "18 / 284 total", icon: Radio, color: "text-red-500" },
              { label: "Top Agent (A5)", value: "Vikram Rao · 312 hosts", icon: Award, color: "text-purple-500" },
              { label: "Active PK Battles", value: "48 rooms · 96 players", icon: Zap, color: "text-yellow-500" },
              { label: "Coin Recharges Today", value: "₹2.4L · 1,284 txns", icon: Coins, color: "text-green-500" },
              { label: "Fan Club Subs", value: "8,420 active subs", icon: Heart, color: "text-pink-500" },
              { label: "Tournament Players", value: "192 competing now", icon: Star, color: "text-indigo-500" },
            ].map((s) => (
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

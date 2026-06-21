import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Coins, CreditCard, Wallet,
  IndianRupee, ArrowUpRight, ArrowDownRight, Zap, Crown, Gift,
  Calendar, Download, Filter, ChevronDown, CircleDollarSign,
  FileText, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadCSV } from "@/lib/utils";

const PURPLE = "#7B2FBE";
const MAGENTA = "#E91E8C";
const TEAL = "#06B6D4";
const AMBER = "#F59E0B";
const EMERALD = "#10B981";
const ROSE = "#F43F5E";

// ─── 30-day revenue data ───
const revenueData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  CoinRecharges: Math.floor(40000 + Math.random() * 30000),
  Subscriptions: Math.floor(15000 + Math.random() * 15000),
  AdRevenue: Math.floor(8000 + Math.random() * 8000),
  Gifts: Math.floor(5000 + Math.random() * 5000),
}));

// ─── MRR / ARR data ───
const mrrData = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  MRR: Math.floor(380000 + i * 25000 + Math.random() * 20000),
  ARR: Math.floor(4560000 + i * 300000 + Math.random() * 100000),
}));

// ─── Coin usage breakdown ───
const coinUsageData = [
  { name: "Gifts", value: 28, color: MAGENTA },
  { name: "Boosts", value: 18, color: PURPLE },
  { name: "Super Likes", value: 12, color: AMBER },
  { name: "Shop", value: 10, color: TEAL },
  { name: "Premium", value: 10, color: "#6366F1" },
  { name: "Events", value: 8, color: ROSE },
  { name: "Broadcasts", value: 5, color: "#8B5CF6" },
  { name: "Calls", value: 5, color: EMERALD },
  { name: "Other", value: 4, color: "#94A3B8" },
];

// ─── Subscription tier breakdown ───
const subscriptionTiers = [
  { name: "Silver", users: 8400, revenue: 420000, color: "#94A3B8" },
  { name: "Gold", users: 5200, revenue: 520000, color: AMBER },
  { name: "Platinum", users: 3100, revenue: 465000, color: TEAL },
  { name: "Diamond Elite", users: 1200, revenue: 360000, color: PURPLE },
];

// ─── New Feature Revenue Breakdown (monthly) ───
const featureRevenue = [
  { name: "Super Likes", revenue: 850000, color: AMBER },
  { name: "Ridhi Shop", revenue: 120000, color: TEAL },
  { name: "Events", revenue: 75000, color: ROSE },
  { name: "Broadcast Channels", revenue: 590000, color: PURPLE },
  { name: "Saved Posts", revenue: 0, color: "#94A3B8" },
  { name: "Story Highlights", revenue: 0, color: "#6366F1" },
  { name: "Profile Prompts", revenue: 0, color: "#8B5CF6" },
];

// ─── Creator earnings data ───
const creatorEarnings = Array.from({ length: 14 }, (_, i) => ({
  day: `Apr ${i + 8}`,
  Earnings: Math.floor(12000 + Math.random() * 8000),
  Withdrawals: Math.floor(8000 + Math.random() * 5000),
}));

// ─── Top 10 spenders ───
const topSpenders = [
  { rank: 1, name: "Aarav Sharma", city: "Mumbai", coins: 48500, revenue: "₹48,500", tier: "Diamond" },
  { rank: 2, name: "Diya Patel", city: "Delhi", coins: 42300, revenue: "₹42,300", tier: "Diamond" },
  { rank: 3, name: "Vihaan Singh", city: "Bangalore", coins: 38100, revenue: "₹38,100", tier: "Platinum" },
  { rank: 4, name: "Aditi Rao", city: "Hyderabad", coins: 35600, revenue: "₹35,600", tier: "Platinum" },
  { rank: 5, name: "Arjun Gupta", city: "Chennai", coins: 31200, revenue: "₹31,200", tier: "Platinum" },
  { rank: 6, name: "Ananya Reddy", city: "Kochi", coins: 28900, revenue: "₹28,900", tier: "Gold" },
  { rank: 7, name: "Sai Kumar", city: "Pune", coins: 26400, revenue: "₹26,400", tier: "Gold" },
  { rank: 8, name: "Priya Das", city: "Kolkata", coins: 24100, revenue: "₹24,100", tier: "Gold" },
  { rank: 9, name: "Krishna Iyer", city: "Ahmedabad", coins: 21800, revenue: "₹21,800", tier: "Silver" },
  { rank: 10, name: "Riya Desai", city: "Jaipur", coins: 19500, revenue: "₹19,500", tier: "Silver" },
];

// ─── Conversion funnel data ───
const funnelData = [
  { stage: "App Install", users: 100000, percentage: 100 },
  { stage: "Registration", users: 65000, percentage: 65 },
  { stage: "Profile Complete", users: 42000, percentage: 42 },
  { stage: "First Content View", users: 38000, percentage: 38 },
  { stage: "First Like", users: 28000, percentage: 28 },
  { stage: "First Recharge", users: 8500, percentage: 8.5 },
  { stage: "Subscription", users: 3200, percentage: 3.2 },
  { stage: "VIP Upgrade", users: 1200, percentage: 1.2 },
];

// ─── Transaction log (with GST + actual cost) ───
const transactionLog = [
  { id: "TXN-001", user: "Aarav Sharma", type: "Coin Recharge", method: "UPI", amount: 499, gst: 76, total: 575, coins: 500, status: "completed", date: "12 Jun 2026" },
  { id: "TXN-002", user: "Priya Patel", type: "Subscription", method: "Card", amount: 299, gst: 54, total: 353, plan: "Gold Monthly", status: "completed", date: "12 Jun 2026" },
  { id: "TXN-003", user: "Rohan Mehta", type: "Coin Recharge", method: "Net Banking", amount: 1999, gst: 360, total: 2359, coins: 2000, status: "completed", date: "11 Jun 2026" },
  { id: "TXN-004", user: "Ananya Rao", type: "Ad Campaign", method: "Direct", amount: 5000, gst: 900, total: 5900, campaign: "Summer Promo", status: "completed", date: "11 Jun 2026" },
  { id: "TXN-005", user: "Kavya Iyer", type: "Subscription", method: "UPI", amount: 3999, gst: 720, total: 4719, plan: "Platinum Yearly", status: "completed", date: "10 Jun 2026" },
  { id: "TXN-006", user: "Vikram Joshi", type: "Coin Recharge", method: "Wallet", amount: 99, gst: 18, total: 117, coins: 100, status: "failed", date: "10 Jun 2026" },
  { id: "TXN-007", user: "Neha Gupta", type: "Gift Purchase", method: "Coins", amount: 0, gst: 0, total: 0, coins: 100, gift: "Crown", status: "completed", date: "09 Jun 2026" },
  { id: "TXN-008", user: "Arjun Nair", type: "Withdrawal", method: "UPI", amount: 1000, platformFee: 200, gst: 180, net: 800, status: "pending", date: "09 Jun 2026" },
  { id: "TXN-009", user: "Devika Shah", type: "Coin Recharge", method: "Card", amount: 4999, gst: 900, total: 5899, coins: 5000, status: "completed", date: "08 Jun 2026" },
  { id: "TXN-010", user: "Ishaan Reddy", type: "Subscription", method: "UPI", amount: 49, gst: 9, total: 58, plan: "Silver Weekly", status: "completed", date: "08 Jun 2026" },
];

// ─── Daily coin transactions ───
const coinTransactions = Array.from({ length: 7 }, (_, i) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    day: days[i],
    Recharged: Math.floor(50000 + Math.random() * 30000),
    Spent: Math.floor(45000 + Math.random() * 25000),
  };
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.name.includes("Revenue") || p.name.includes("MRR") || p.name.includes("ARR") || p.name.includes("Earnings") || p.name.includes("Withdrawals")
              ? `₹${p.value?.toLocaleString()}`
              : p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MonetizationPage() {
  const [period, setPeriod] = useState("30d");
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.CoinRecharges + d.Subscriptions + d.AdRevenue + d.Gifts, 0);
  const totalCoins = coinUsageData.reduce((sum, d) => sum + d.value, 0);
  const totalSubscribers = subscriptionTiers.reduce((sum, d) => sum + d.users, 0);
  const avgOrderValue = Math.floor(totalRevenue / (totalSubscribers * 30));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("monetization_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monetization Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Revenue, coins, subscriptions, and conversion tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">₹{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-500 text-xs">
                  <ArrowUpRight className="w-3 h-3" /> +12.4% vs last period
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-magenta/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coin Volume</p>
                <p className="text-2xl font-bold mt-1">{totalCoins.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-500 text-xs">
                  <ArrowUpRight className="w-3 h-3" /> +8.7% vs last period
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#E91E8C]/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-[#E91E8C]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-bold mt-1">{totalSubscribers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-500 text-xs">
                  <ArrowUpRight className="w-3 h-3" /> +5.2% vs last period
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold mt-1">₹{avgOrderValue}</p>
                <div className="flex items-center gap-1 mt-1 text-rose-500 text-xs">
                  <ArrowDownRight className="w-3 h-3" /> -2.1% vs last period
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5 text-amber" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <IndianRupee className="w-3.5 h-3.5 mr-1.5" /> Revenue
          </TabsTrigger>
          <TabsTrigger value="coins" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <Coins className="w-3.5 h-3.5 mr-1.5" /> Coins
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <Crown className="w-3.5 h-3.5 mr-1.5" /> Subscriptions
          </TabsTrigger>
          <TabsTrigger value="funnel" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Conversion
          </TabsTrigger>
          <TabsTrigger value="spenders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <Users className="w-3.5 h-3.5 mr-1.5" /> Top Spenders
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Transactions
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue Breakdown (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorCoin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={MAGENTA} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={MAGENTA} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TEAL} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorGift" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={AMBER} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="CoinRecharges" stackId="1" stroke={PURPLE} fill="url(#colorCoin)" />
                    <Area type="monotone" dataKey="Subscriptions" stackId="1" stroke={MAGENTA} fill="url(#colorSub)" />
                    <Area type="monotone" dataKey="AdRevenue" stackId="1" stroke={TEAL} fill="url(#colorAd)" />
                    <Area type="monotone" dataKey="Gifts" stackId="1" stroke={AMBER} fill="url(#colorGift)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">MRR & ARR Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mrrData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 100000}L`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="MRR" stroke={PURPLE} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="ARR" stroke={MAGENTA} strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Creator Earnings vs Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={creatorEarnings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="Earnings" fill={PURPLE} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Withdrawals" fill={MAGENTA} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Coins Tab */}
        <TabsContent value="coins" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Coin Usage Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={coinUsageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {coinUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-2 shadow-xl">
                              <p className="text-sm font-semibold">{payload[0].name}: {payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {coinUsageData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Coin Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={coinTransactions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="Recharged" fill={EMERALD} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill={ROSE} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Coin Recharge Packs Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { pack: "₹49", coins: 50, sales: 2840, revenue: "₹1,39,160" },
                  { pack: "₹99", coins: 100, sales: 4120, revenue: "₹4,07,880" },
                  { pack: "₹199", coins: 200, sales: 3560, revenue: "₹7,08,440" },
                  { pack: "₹499", coins: 500, sales: 1890, revenue: "₹9,43,110" },
                  { pack: "₹999", coins: 1000, sales: 980, revenue: "₹9,79,020" },
                  { pack: "₹1999", coins: 2000, sales: 420, revenue: "₹8,39,580" },
                  { pack: "₹4999", coins: 5000, sales: 156, revenue: "₹7,79,844" },
                  { pack: "₹9999", coins: 10000, sales: 48, revenue: "₹4,79,952" },
                ].map((item) => (
                  <div key={item.pack} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{item.pack}</span>
                      <Badge variant="outline" className="text-xs">{item.coins} coins</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.sales.toLocaleString()} sales</div>
                    <div className="text-sm font-semibold text-primary">{item.revenue}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Subscription Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionTiers.map((tier) => (
                    <div key={tier.name} className="flex items-center gap-4">
                      <div className="w-3 h-12 rounded-full" style={{ backgroundColor: tier.color }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{tier.name}</span>
                          <span className="text-sm text-muted-foreground">{tier.users.toLocaleString()} users</span>
                        </div>
                        <div className="text-sm text-primary font-semibold">₹{tier.revenue.toLocaleString()} revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Subscribers</span>
                    <span className="font-bold">{totalSubscribers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-bold text-primary">₹{subscriptionTiers.reduce((s, t) => s + t.revenue, 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Subscription Churn Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Monthly Churn", value: "4.2%", trend: "-0.3%", good: true },
                    { label: "Annual Churn", value: "18.5%", trend: "-1.2%", good: true },
                    { label: "Upgrade Rate", value: "12.8%", trend: "+2.1%", good: true },
                    { label: "Downgrade Rate", value: "3.4%", trend: "+0.5%", good: false },
                    { label: "Free-to-Paid", value: "8.5%", trend: "+1.3%", good: true },
                    { label: "LTV (avg)", value: "₹2,840", trend: "+₹180", good: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.value}</span>
                        <span className={`text-xs ${item.good ? "text-emerald-500" : "text-rose-500"}`}>
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Subscription Plans (Weekly / Monthly / Yearly)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { plan: "Silver", weekly: 2900, monthly: 5200, yearly: 1800, weeklyPrice: "₹49", monthlyPrice: "₹149", yearlyPrice: "₹999" },
                  { plan: "Gold", weekly: 1800, monthly: 3400, yearly: 1200, weeklyPrice: "₹99", monthlyPrice: "₹299", yearlyPrice: "₹1,999" },
                  { plan: "Platinum", weekly: 950, monthly: 2100, yearly: 850, weeklyPrice: "₹199", monthlyPrice: "₹599", yearlyPrice: "₹3,999" },
                  { plan: "Diamond Elite", weekly: 380, monthly: 890, yearly: 420, weeklyPrice: "₹349", monthlyPrice: "₹999", yearlyPrice: "₹6,999" },
                ].map((item) => (
                  <div key={item.plan} className="border rounded-lg p-4 space-y-3">
                    <div className="font-bold text-primary">{item.plan}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weekly</span>
                        <span className="font-semibold">{item.weekly.toLocaleString()} <span className="text-muted-foreground">({item.weeklyPrice})</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly</span>
                        <span className="font-semibold">{item.monthly.toLocaleString()} <span className="text-muted-foreground">({item.monthlyPrice})</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yearly</span>
                        <span className="font-semibold">{item.yearly.toLocaleString()} <span className="text-muted-foreground">({item.yearlyPrice})</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monetization Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnelData.map((stage, i) => {
                  const prev = funnelData[i - 1];
                  const dropoff = prev ? ((prev.users - stage.users) / prev.users * 100).toFixed(1) : "0";
                  return (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{stage.users.toLocaleString()} users</span>
                          <span className="font-semibold text-primary">{stage.percentage}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg flex items-center justify-end px-2"
                            style={{
                              width: `${stage.percentage}%`,
                              background: i === 0 ? PURPLE : i === funnelData.length - 1 ? EMERALD : `linear-gradient(90deg, ${PURPLE}, ${MAGENTA})`,
                            }}
                          />
                        </div>
                        {i > 0 && (
                          <span className="text-xs text-rose-500 w-16 text-right">-{dropoff}%</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue by City</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { city: "Mumbai", revenue: 1840000, users: 4200 },
                    { city: "Delhi", revenue: 1620000, users: 3800 },
                    { city: "Bangalore", revenue: 1380000, users: 3100 },
                    { city: "Hyderabad", revenue: 980000, users: 2400 },
                    { city: "Chennai", revenue: 760000, users: 1900 },
                    { city: "Kolkata", revenue: 640000, users: 1600 },
                  ].map((item) => (
                    <div key={item.city} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium">{item.city}</div>
                      <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg bg-primary/80"
                          style={{ width: `${(item.revenue / 1840000) * 100}%` }}
                        />
                      </div>
                      <div className="w-32 text-right text-sm">
                        <span className="font-semibold">₹{(item.revenue / 100000).toFixed(1)}L</span>
                        <span className="text-muted-foreground ml-1">({item.users})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue by Device</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { device: "Android", revenue: 5200000, share: 62 },
                    { device: "iOS", revenue: 2800000, share: 33 },
                    { device: "Web", revenue: 420000, share: 5 },
                  ].map((item) => (
                    <div key={item.device} className="flex items-center gap-3">
                      <div className="w-20 text-sm font-medium">{item.device}</div>
                      <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg bg-accent"
                          style={{ width: `${item.share}%` }}
                        />
                      </div>
                      <div className="w-32 text-right text-sm">
                        <span className="font-semibold">₹{(item.revenue / 100000).toFixed(1)}L</span>
                        <span className="text-muted-foreground ml-1">({item.share}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Spenders Tab */}
        <TabsContent value="spenders" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top 10 Spenders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Rank</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">User</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">City</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tier</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Coins</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSpenders.map((spender) => (
                      <tr key={spender.rank} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            spender.rank === 1 ? "bg-amber-500 text-white" :
                            spender.rank === 2 ? "bg-gray-400 text-white" :
                            spender.rank === 3 ? "bg-amber-700 text-white" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {spender.rank}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium">{spender.name}</td>
                        <td className="py-3 px-3 text-muted-foreground">{spender.city}</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={`text-xs ${
                            spender.tier === "Diamond" ? "border-purple-500 text-purple-500" :
                            spender.tier === "Platinum" ? "border-teal-500 text-teal-500" :
                            spender.tier === "Gold" ? "border-amber-500 text-amber-500" :
                            "border-gray-500 text-gray-500"
                          }`}>
                            {spender.tier}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold">{spender.coins.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-semibold text-primary">{spender.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Spending Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "High-Value Users (₹1k+/mo)", count: 2840, revenue: "₹42.6L", percent: 28 },
                    { label: "Medium-Value (₹200-1k/mo)", count: 6520, revenue: "₹32.6L", percent: 42 },
                    { label: "Low-Value (₹50-200/mo)", count: 8940, revenue: "₹13.4L", percent: 22 },
                    { label: "Micro Spenders (<₹50/mo)", count: 4560, revenue: "₹1.8L", percent: 8 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.count.toLocaleString()} users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-5 bg-muted rounded-lg overflow-hidden">
                          <div className="h-full rounded-lg bg-primary" style={{ width: `${item.percent}%` }} />
                        </div>
                        <span className="text-sm font-semibold w-24 text-right">{item.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gift Economics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { gift: "🌹 Rose", cost: 10, sent: 45200, revenue: "₹4.52L" },
                    { gift: "💗 Heart", cost: 50, sent: 21800, revenue: "₹10.9L" },
                    { gift: "🎁 Surprise Box", cost: 100, sent: 12400, revenue: "₹12.4L" },
                    { gift: "💎 Diamond", cost: 500, sent: 3800, revenue: "₹19.0L" },
                    { gift: "👑 Crown", cost: 1000, sent: 1200, revenue: "₹12.0L" },
                    { gift: "🚀 Rocket", cost: 5000, sent: 280, revenue: "₹14.0L" },
                  ].map((item) => (
                    <div key={item.gift} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.gift.split(" ")[0]}</span>
                        <span>{item.gift.split(" ").slice(1).join(" ")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{item.sent.toLocaleString()} sent</span>
                        <span className="font-semibold text-primary w-20 text-right">{item.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Total Gift Revenue</span>
                    <span className="text-primary">₹72.82L</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Summary card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Transactions</span>
                    <span className="font-semibold">{transactionLog.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold text-emerald-500">{transactionLog.filter((t) => t.status === "completed").length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-semibold text-amber-500">{transactionLog.filter((t) => t.status === "pending").length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Failed</span>
                    <span className="font-semibold text-rose-500">{transactionLog.filter((t) => t.status === "failed").length}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Base Amount</span>
                      <span className="font-semibold">₹{transactionLog.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Total GST (18%)</span>
                      <span className="font-semibold text-amber-600">₹{transactionLog.reduce((s, t) => s + (t.gst || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="font-semibold">Total Collected</span>
                      <span className="font-bold text-primary">₹{transactionLog.reduce((s, t) => s + (t.total || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GST Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">GST Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Coin Recharges", base: 7596, gst: 1367 },
                    { label: "Subscriptions", base: 6597, gst: 1188 },
                    { label: "Ad Campaigns", base: 5000, gst: 900 },
                    { label: "Withdrawals", base: 3500, gst: 189 },
                    { label: "Gifts (Coins)", base: 0, gst: 0 },
                  ].map((cat) => (
                    <div key={cat.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{cat.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">Base ₹{cat.base.toLocaleString()}</span>
                        <span className="text-amber-600 text-xs">+GST ₹{cat.gst.toLocaleString()}</span>
                        <span className="font-semibold w-16 text-right">₹{(cat.base + cat.gst).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Net GST Liability</span>
                      <span className="text-amber-600">₹{transactionLog.reduce((s, t) => s + (t.gst || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>GSTIN: 29AABCR1234Z1Z</span>
                      <span>Monthly Filing</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Fee Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Platform Fee Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Withdrawals</span>
                    <span className="font-semibold">₹{transactionLog.filter((t) => t.type === "Withdrawal").reduce((s, t) => s + (t.amount || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (30%)</span>
                    <span className="font-semibold text-rose-500">₹{transactionLog.filter((t) => t.type === "Withdrawal").reduce((s, t) => s + (t.platformFee || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST on Fee (18%)</span>
                    <span className="font-semibold text-amber-600">₹{transactionLog.filter((t) => t.type === "Withdrawal").reduce((s, t) => s + (t.gst || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Net Paid to Users</span>
                      <span className="text-emerald-600">₹{transactionLog.filter((t) => t.type === "Withdrawal").reduce((s, t) => s + (t.net || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>TDS: 10% on ₹{transactionLog.filter((t) => t.type === "Withdrawal").reduce((s, t) => s + (t.net || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">ID</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">User</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Method</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Base</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">GST</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Total</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionLog.map((t) => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                        <td className="py-2 px-3 font-medium">{t.user}</td>
                        <td className="py-2 px-3">
                          <Badge variant="outline" className="text-xs">
                            {t.type}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{t.method}</td>
                        <td className="py-2 px-3 text-right">₹{t.amount.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-amber-600">+₹{t.gst.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-semibold text-primary">₹{(t.total || 0).toLocaleString()}</td>
                        <td className="py-2 px-3">
                          {t.status === "completed" && <span className="inline-flex items-center gap-1 text-emerald-500 text-xs"><CheckCircle2 className="w-3 h-3" /> Done</span>}
                          {t.status === "pending" && <span className="inline-flex items-center gap-1 text-amber-500 text-xs"><Clock className="w-3 h-3" /> Pending</span>}
                          {t.status === "failed" && <span className="inline-flex items-center gap-1 text-rose-500 text-xs"><XCircle className="w-3 h-3" /> Failed</span>}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

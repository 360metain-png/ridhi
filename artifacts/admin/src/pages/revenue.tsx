import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { IndianRupee, TrendingUp, TrendingDown, CreditCard, Users, Megaphone, Percent } from "lucide-react";

const PURPLE = "#7B2FBE";
const MAGENTA = "#E91E8C";
const TEAL = "#06B6D4";
const AMBER = "#F59E0B";
const GREEN = "#22C55E";

const revenueDaily = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  "Coin Recharge": Math.floor(35000 + Math.random() * 25000),
  "Subscriptions": Math.floor(18000 + Math.random() * 12000),
  "Ad Revenue": Math.floor(12000 + Math.random() * 8000),
  "Live Gifts": Math.floor(8000 + Math.random() * 10000),
}));

const adPerformance = Array.from({ length: 14 }, (_, i) => ({
  day: `Apr ${i + 8}`,
  Impressions: Math.floor(200000 + Math.random() * 100000),
  Clicks: Math.floor(8000 + Math.random() * 5000),
  Revenue: Math.floor(12000 + Math.random() * 8000),
}));

const subscriptionData = [
  { month: "Jan", Basic: 1200, Premium: 480, VIP: 120 },
  { month: "Feb", Basic: 1450, Premium: 560, VIP: 145 },
  { month: "Mar", Basic: 1680, Premium: 640, VIP: 178 },
  { month: "Apr", Basic: 1920, Premium: 740, VIP: 210 },
  { month: "May", Basic: 2180, Premium: 860, VIP: 248 },
];

const revenueSplit = [
  { name: "Coin Recharges", value: 42, amount: 1284000 },
  { name: "Subscriptions", value: 24, amount: 732000 },
  { name: "Ad Revenue", value: 19, amount: 580200 },
  { name: "Live Gifts", value: 11, amount: 335800 },
  { name: "Creator Fund", value: 4, amount: 122000 },
];
const SPLIT_COLORS = [PURPLE, MAGENTA, TEAL, AMBER, GREEN];

const TOP_ADVERTISERS = [
  { name: "Flipkart", spend: 284000, impressions: 2840000, ctr: 3.2, status: "active" },
  { name: "Myntra", spend: 198000, impressions: 1980000, ctr: 2.8, status: "active" },
  { name: "Swiggy", spend: 156000, impressions: 1560000, ctr: 4.1, status: "active" },
  { name: "Zomato", spend: 142000, impressions: 1420000, ctr: 3.9, status: "active" },
  { name: "Amazon IN", spend: 128000, impressions: 1280000, ctr: 2.4, status: "paused" },
];

const SUBSCRIPTION_PLANS = [
  { name: "Basic", price: 49, subscribers: 2180, mrr: 106820, churn: 4.2, color: TEAL },
  { name: "Premium", price: 149, subscribers: 860, mrr: 128140, churn: 2.8, color: PURPLE },
  { name: "VIP", price: 499, subscribers: 248, mrr: 123752, churn: 1.4, color: MAGENTA },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: ₹{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const GST_RATE = 0.18;

export default function RevenuePage() {
  const totalMRR = SUBSCRIPTION_PLANS.reduce((s, p) => s + p.mrr, 0);
  const totalRevenue = revenueSplit.reduce((s, r) => s + r.amount, 0);
  const gstCollected = Math.round(totalRevenue * GST_RATE);

  const summaryStats = [
    { label: "Total Revenue (MTD)", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, change: "+22.4%", up: true, color: "text-violet-400" },
    { label: "MRR (Subscriptions)", value: `₹${(totalMRR / 1000).toFixed(0)}K`, icon: CreditCard, change: "+11.2%", up: true, color: "text-emerald-400" },
    { label: "Ad Revenue (MTD)", value: `₹${(580200 / 1000).toFixed(0)}K`, icon: Megaphone, change: "+8.7%", up: true, color: "text-blue-400" },
    { label: "Paying Users", value: "3,288", icon: Users, change: "+14.6%", up: true, color: "text-pink-400" },
    { label: "GST Collected (18%)", value: `₹${(gstCollected / 100000).toFixed(1)}L`, icon: Percent, change: "+22.4%", up: true, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue & Ads</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform revenue breakdown, ad performance, and subscription reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {summaryStats.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${s.up ? "text-emerald-400" : "text-rose-400"}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change} vs last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Overview</TabsTrigger>
          <TabsTrigger value="ads" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Advertising</TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Revenue by Source — Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueDaily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      {[PURPLE, MAGENTA, TEAL, AMBER].map((c, i) => (
                        <linearGradient key={i} id={`rg${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={c} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                    {["Coin Recharge", "Subscriptions", "Ad Revenue", "Live Gifts"].map((k, i) => (
                      <Area key={k} type="monotone" dataKey={k} stroke={[PURPLE, MAGENTA, TEAL, AMBER][i]} fill={`url(#rg${i})`} strokeWidth={2} dot={false} stackId="1" />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Revenue Split</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={revenueSplit} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {revenueSplit.map((_, i) => (
                        <Cell key={i} fill={SPLIT_COLORS[i % SPLIT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {revenueSplit.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: SPLIT_COLORS[i] }} />
                        <span className="text-xs text-muted-foreground">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground">₹{(d.amount / 1000).toFixed(0)}K</span>
                        <span className="text-xs text-muted-foreground ml-2">({d.value}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ads" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Ad Performance — Last 14 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={adPerformance} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                  <Bar dataKey="Clicks" fill={PURPLE} radius={[3, 3, 0, 0]} yAxisId="left" />
                  <Bar dataKey="Revenue" fill={MAGENTA} radius={[3, 3, 0, 0]} yAxisId="right" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Top Advertisers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Advertiser", "Spend", "Impressions", "CTR", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOP_ADVERTISERS.map((a) => (
                    <tr key={a.name} className="border-b border-border hover:bg-muted/30 last:border-0">
                      <td className="px-6 py-3 font-semibold text-foreground">{a.name}</td>
                      <td className="px-6 py-3 text-foreground font-bold">₹{(a.spend / 1000).toFixed(0)}K</td>
                      <td className="px-6 py-3 text-muted-foreground">{(a.impressions / 1000000).toFixed(1)}M</td>
                      <td className="px-6 py-3">
                        <span className={`font-semibold ${a.ctr >= 3.5 ? "text-emerald-400" : "text-amber-400"}`}>{a.ctr}%</span>
                      </td>
                      <td className="px-6 py-3">
                        <Badge className={`text-xs border ${a.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-muted/60 text-muted-foreground border-border"}`}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card key={plan.name} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
                      <span className="font-bold text-foreground">{plan.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">₹{plan.price}/mo</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{plan.subscribers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">subscribers</div>
                  <div className="mt-3 pt-3 border-t border-border flex justify-between">
                    <div>
                      <div className="text-sm font-bold text-foreground">₹{(plan.mrr / 1000).toFixed(0)}K</div>
                      <div className="text-xs text-muted-foreground">MRR</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${plan.churn < 3 ? "text-emerald-400" : "text-amber-400"}`}>{plan.churn}%</div>
                      <div className="text-xs text-muted-foreground">churn</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Subscription Growth — Last 5 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={subscriptionData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                  <Bar dataKey="Basic" fill={TEAL} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Premium" fill={PURPLE} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="VIP" fill={MAGENTA} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

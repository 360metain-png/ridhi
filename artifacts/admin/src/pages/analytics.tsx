import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie
} from "recharts";
import { TrendingUp, Users, FileText, IndianRupee, MapPin, Download, FileDown } from "lucide-react";
import { downloadCSV, downloadPDF } from "@/lib/utils";
import DateRangeFilter, { filterByDateRangeDaily } from "@/components/DateRangeFilter";
import type { DateRange } from "@/components/DateRangeFilter";
import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";

const PURPLE = "#7B2FBE";
const MAGENTA = "#E91E8C";
const TEAL = "#06B6D4";
const AMBER = "#F59E0B";

const today = new Date();

// 30-day DAU/MAU data
const dauData = Array.from({ length: 30 }, (_, i) => {
  const d = subDays(today, 29 - i);
  return {
    day: `${i + 1}`,
    date: format(d, "yyyy-MM-dd"),
    DAU: Math.floor(18000 + Math.random() * 8000),
    MAU: Math.floor(120000 + Math.random() * 20000),
  };
});

// New registrations per day
const regData = Array.from({ length: 14 }, (_, i) => {
  const d = subDays(today, 13 - i);
  return {
    day: `${d.getDate()}`,
    date: format(d, "yyyy-MM-dd"),
    Registrations: Math.floor(800 + Math.random() * 600),
    Churned: Math.floor(100 + Math.random() * 150),
  };
});

// Revenue breakdown by source
const revenueSourceData = [
  { name: "Coin Recharges", value: 48 },
  { name: "Subscriptions", value: 27 },
  { name: "Ad Revenue", value: 16 },
  { name: "Creator Fund", value: 9 },
];
const SOURCE_COLORS = [PURPLE, MAGENTA, TEAL, AMBER];

// Revenue 30 days
const revenueData = Array.from({ length: 30 }, (_, i) => {
  const d = subDays(today, 29 - i);
  return {
    day: `${i + 1}`,
    date: format(d, "yyyy-MM-dd"),
    Revenue: Math.floor(40000 + Math.random() * 30000),
    MRR: Math.floor(380000 + i * 3000 + Math.random() * 10000),
  };
});

// Top cities
const cityData = [
  { city: "Mumbai", users: 42000 },
  { city: "Delhi", users: 38000 },
  { city: "Bangalore", users: 31000 },
  { city: "Hyderabad", users: 24000 },
  { city: "Chennai", users: 19000 },
  { city: "Kolkata", users: 16000 },
  { city: "Pune", users: 14000 },
  { city: "Kochi", users: 11000 },
];

// Content by day
const contentData = Array.from({ length: 14 }, (_, i) => {
  const d = subDays(today, 13 - i);
  return {
    day: `${d.getDate()}`,
    date: format(d, "yyyy-MM-dd"),
    Posts: Math.floor(2000 + Math.random() * 1500),
    Reels: Math.floor(800 + Math.random() * 600),
    Stories: Math.floor(1500 + Math.random() * 1000),
  };
});

// Top hashtags
const hashtagData = [
  { tag: "#DesiVibes", count: 2800 },
  { tag: "#ChaiTime", count: 2100 },
  { tag: "#Bollywood", count: 1950 },
  { tag: "#CricketIndia", count: 1700 },
  { tag: "#MonsoonMagic", count: 1400 },
  { tag: "#StreetFood", count: 1200 },
];

// Retention cohort (simplified: 6 cohorts x 6 weeks)
const cohortLabels = ["Apr W1", "Apr W2", "Apr W3", "Apr W4", "May W1", "May W2"];
const retentionData = [
  [100, 68, 52, 44, 38, 34],
  [100, 71, 55, 46, 40, null],
  [100, 65, 49, 41, null, null],
  [100, 73, 58, null, null, null],
  [100, 69, null, null, null, null],
  [100, null, null, null, null, null],
];

function RetentionHeatmap() {
  const getColor = (v: number | null) => {
    if (v === null) return "bg-muted/30 text-muted-foreground/30";
    if (v >= 70) return "bg-emerald-500/80 text-white";
    if (v >= 50) return "bg-emerald-500/50 text-white";
    if (v >= 35) return "bg-amber-500/50 text-white";
    return "bg-rose-500/40 text-white";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground font-medium pb-2 pr-3">Cohort</th>
            {["Wk 0", "Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"].map((w) => (
              <th key={w} className="text-center text-muted-foreground font-medium pb-2 px-1">{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {retentionData.map((row, ri) => (
            <tr key={ri}>
              <td className="text-muted-foreground font-medium pr-3 py-1 text-xs">{cohortLabels[ri]}</td>
              {row.map((v, ci) => (
                <td key={ci} className="px-1 py-1">
                  <div className={`rounded px-2 py-1.5 text-center font-semibold ${getColor(v)}`}>
                    {v !== null ? `${v}%` : ""}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" && p.name.includes("Revenue") ? `₹${p.value.toLocaleString()}` : p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(2025, 3, 1), to: new Date() });
  const [activeTab, setActiveTab] = useState("users");

  const filteredDau = useMemo(() => filterByDateRangeDaily(dauData, dateRange), [dateRange]);
  const filteredReg = useMemo(() => filterByDateRangeDaily(regData, dateRange), [dateRange]);
  const filteredRevenue = useMemo(() => filterByDateRangeDaily(revenueData, dateRange), [dateRange]);
  const filteredContent = useMemo(() => filterByDateRangeDaily(contentData, dateRange), [dateRange]);

  const exportData = useMemo(() => {
    if (activeTab === "users") return filteredDau.map((d) => ({ date: d.date, dau: d.DAU, mau: d.MAU }));
    if (activeTab === "content") return filteredContent.map((d) => ({ date: d.date, posts: d.Posts, reels: d.Reels, stories: d.Stories }));
    if (activeTab === "revenue") return filteredRevenue.map((d) => ({ date: d.date, revenue: d.Revenue, mrr: d.MRR }));
    return filteredReg.map((d) => ({ date: d.date, registrations: d.Registrations, churned: d.Churned }));
  }, [activeTab, filteredDau, filteredReg, filteredRevenue, filteredContent]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide insights across users, content, and revenue</p>
      </div>

      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        exportFilename={`analytics_${activeTab}.csv`}
        exportData={exportData as Record<string, string | number>[]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <Users className="w-3.5 h-3.5 mr-1.5" /> Users
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Content
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <IndianRupee className="w-3.5 h-3.5 mr-1.5" /> Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">DAU / MAU — Filtered Range</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={filteredDau} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={MAGENTA} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={MAGENTA} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mauGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                  <Area type="monotone" dataKey="DAU" stroke={MAGENTA} fill="url(#dauGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="MAU" stroke={PURPLE} fill="url(#mauGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Retention Cohort Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <RetentionHeatmap />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Top Cities by Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={cityData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="city" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="users" radius={[0, 4, 4, 0]}>
                      {cityData.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? PURPLE : MAGENTA} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">New Registrations vs Churn — Last 14 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={filteredReg} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                  <Bar dataKey="Registrations" fill={PURPLE} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Churned" fill={MAGENTA} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Content Published by Type — Last 14 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={filteredContent} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {[PURPLE, MAGENTA, TEAL].map((c, i) => (
                      <linearGradient key={i} id={`cg${i}`} x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="Posts" stroke={PURPLE} fill="url(#cg0)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Reels" stroke={MAGENTA} fill="url(#cg1)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Stories" stroke={TEAL} fill="url(#cg2)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Top Trending Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hashtagData.map((h, i) => (
                  <div key={h.tag} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                    <span className="text-sm font-semibold text-foreground flex-1">{h.tag}</span>
                    <div className="flex-1 bg-muted/40 rounded-full h-2 max-w-32">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${(h.count / hashtagData[0].count) * 100}%`, background: `linear-gradient(90deg, ${PURPLE}, ${MAGENTA})` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-14 text-right">{h.count.toLocaleString()} posts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Daily Revenue & MRR — Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={filteredRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={MAGENTA} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={MAGENTA} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                    <Area type="monotone" dataKey="Revenue" stroke={MAGENTA} fill="url(#revGrad)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="MRR" stroke={PURPLE} strokeWidth={2} dot={false} strokeDasharray="5 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={revenueSourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {revenueSourceData.map((_, i) => (
                        <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {revenueSourceData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: SOURCE_COLORS[i] }} />
                        <span className="text-xs text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

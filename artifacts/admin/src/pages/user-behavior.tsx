import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie,
  FunnelChart, Funnel, LabelList,
} from "recharts";
import {
  Users, Clock, Activity, TrendingUp, TrendingDown, Eye, Heart, MessageCircle,
  Share2, Play, Smartphone, MapPin, UserCheck, ArrowUpRight, ArrowDownRight,
  Zap, Target, Radio, Gift, Crown, Filter, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { downloadCSV, downloadPDF } from "@/lib/utils";
import { FileDown } from "lucide-react";
import DateRangeFilter, { filterByDateRange, filterByDateRangeDaily } from "@/components/DateRangeFilter";
import type { DateRange } from "@/components/DateRangeFilter";
import {
  USER_BEHAVIOR_ANALYTICS,
  COHORT_DATA,
  FUNNEL_DATA,
  FEATURE_USAGE_SUMMARY,
  DAU_DATA,
  SESSION_DISTRIBUTION,
  SCREEN_HEATMAP,
  CONTENT_TYPE_BREAKDOWN,
  GEO_DISTRIBUTION,
  getAggregatedAnalytics,
  type UserBehaviorAnalytics,
} from "@/data/analytics-mock";

const PURPLE = "#7B2FBE";
const MAGENTA = "#E91E8C";
const TEAL = "#06B6D4";
const AMBER = "#F59E0B";
const EMERALD = "#10B981";
const ROSE = "#F43F5E";
const COLORS = [PURPLE, MAGENTA, TEAL, AMBER, EMERALD, ROSE, "#8B5CF6", "#F97316"];

export default function UserBehavior() {
  const [period, setPeriod] = useState("30d");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(2025, 3, 1), to: new Date() });
  const [activeTab, setActiveTab] = useState("overview");
  const agg = getAggregatedAnalytics();
  const users = USER_BEHAVIOR_ANALYTICS;
  const topUsers = [...users].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 10);

  const filteredUsers = userFilter === "all"
    ? users
    : userFilter === "power"
    ? users.filter((u) => u.engagementScore >= 70)
    : userFilter === "active"
    ? users.filter((u) => u.engagementScore >= 40 && u.engagementScore < 70)
    : userFilter === "casual"
    ? users.filter((u) => u.engagementScore >= 20 && u.engagementScore < 40)
    : users.filter((u) => u.engagementScore < 20);

  const filteredDau = useMemo(() => filterByDateRangeDaily(DAU_DATA, dateRange), [dateRange]);
  const filteredCohort = useMemo(() => filterByDateRangeDaily(COHORT_DATA, dateRange), [dateRange]);

  const exportData = useMemo(() => {
    if (activeTab === "overview") return filteredDau.map((d) => ({ date: d.date, dau: d.dau, newUsers: d.newUsers }));
    if (activeTab === "retention") return filteredCohort.map((d) => ({ cohortDate: d.cohortDate, users: d.users }));
    return filteredDau.map((d) => ({ date: d.date, dau: d.dau }));
  }, [activeTab, filteredDau, filteredCohort]);

  // Top screens
  const topScreens = Object.entries(agg.screenTotals)
    .map(([screen, data]) => ({ screen, visits: data.visits, time: Math.round(data.time / 60) }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);

  // Screen time breakdown
  const screenTimeData = topScreens.map((s) => ({
    name: s.screen.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    time: s.time,
    visits: s.visits,
  }));

  // Feature usage
  const featureData = Object.entries(agg.featureTotals)
    .map(([feature, count]) => ({
      name: feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Engagement score distribution
  const engagementDist = [
    { score: "0-20", label: "Inactive", count: users.filter((u) => u.engagementScore < 20).length, color: "#94A3B8" },
    { score: "20-40", label: "Casual", count: users.filter((u) => u.engagementScore >= 20 && u.engagementScore < 40).length, color: "#F59E0B" },
    { score: "40-60", label: "Active", count: users.filter((u) => u.engagementScore >= 40 && u.engagementScore < 60).length, color: "#06B6D4" },
    { score: "60-80", label: "Engaged", count: users.filter((u) => u.engagementScore >= 60 && u.engagementScore < 80).length, color: "#10B981" },
    { score: "80-100", label: "Power", count: users.filter((u) => u.engagementScore >= 80).length, color: MAGENTA },
  ];

  // Top users by engagement
  const topUsersData = topUsers.map((u) => ({
    name: u.userName,
    score: u.engagementScore,
    sessions: u.totalSessions,
    duration: u.totalDurationMinutes,
    screen: Object.entries(u.screenVisits)
      .sort((a, b) => b[1].visits - a[1].visits)[0]?.[0] || "home",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Behavior Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Session data, engagement, content interactions, and feature usage across all users
          </p>
        </div>
      </div>

      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        exportFilename={`user_behavior_${activeTab}.csv`}
        exportData={exportData as Record<string, string | number>[]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="power">Power Users</SelectItem>
              <SelectItem value="active">Active Users</SelectItem>
              <SelectItem value="casual">Casual Users</SelectItem>
              <SelectItem value="inactive">Inactive Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Users"
          value={agg.totalUsers.toLocaleString()}
          icon={Users}
          color={PURPLE}
          trend={+12.4}
          sub="Active in last 30 days"
        />
        <KpiCard
          title="Total Sessions"
          value={agg.totalSessions.toLocaleString()}
          icon={Activity}
          color={TEAL}
          trend={+8.7}
          sub="Across all users"
        />
        <KpiCard
          title="Avg Session"
          value={`${agg.avgSessionDuration} min`}
          icon={Clock}
          color={AMBER}
          trend={-2.1}
          sub="Per user per session"
        />
        <KpiCard
          title="Engagement Score"
          value={`${agg.avgEngagement}/100`}
          icon={UserCheck}
          color={MAGENTA}
          trend={+5.3}
          sub="Average across users"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* DAU Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Daily Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={filteredDau}>
                    <defs>
                      <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="dau" stroke={PURPLE} fill="url(#dauGrad)" strokeWidth={2} />
                    <Line type="monotone" dataKey="newUsers" stroke={TEAL} strokeWidth={2} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Score Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Engagement Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={engagementDist}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      strokeWidth={2}
                    >
                      {engagementDist.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="label"
                        position="outside"
                        style={{ fontSize: 11 }}
                      />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {engagementDist.map((e) => (
                    <div key={e.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                        <span>{e.label}</span>
                      </div>
                      <span className="font-medium">{e.count} users</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Users Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Top Engaged Users (Last 30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">User</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Score</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Sessions</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Duration</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Top Screen</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Likes</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Comments</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Reels</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice(0, 10).map((u) => (
                      <tr key={u.userId} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                              {u.userName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{u.userName}</div>
                              <div className="text-xs text-muted-foreground">{u.userId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <Badge variant={u.engagementScore >= 70 ? "default" : u.engagementScore >= 40 ? "secondary" : "outline"}
                            className="text-xs">
                            {u.engagementScore}
                          </Badge>
                        </td>
                        <td className="text-center py-2">{u.totalSessions}</td>
                        <td className="text-center py-2">{u.totalDurationMinutes}m</td>
                        <td className="text-center py-2 text-xs text-muted-foreground capitalize">
                          {u.screenVisits ? Object.entries(u.screenVisits).sort((a, b) => b[1].visits - a[1].visits)[0]?.[0]?.replace(/_/g, " ") : "home"}
                        </td>
                        <td className="text-center py-2">{u.contentInteractions?.likes ?? 0}</td>
                        <td className="text-center py-2">{u.contentInteractions?.comments ?? 0}</td>
                        <td className="text-center py-2">{u.contentInteractions?.reelsWatched ?? 0}</td>
                        <td className="text-center py-2 text-xs text-muted-foreground">{u.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sessions Tab ── */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Session Duration Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Session Duration Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={SESSION_DISTRIBUTION}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="users" fill={PURPLE} radius={[4, 4, 0, 0]}>
                      {SESSION_DISTRIBUTION.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Screen Heatmap */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Screen Usage by Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground">
                    <div>Hour</div>
                    <div>Home</div>
                    <div>Reels</div>
                    <div>Match</div>
                    <div>Chat</div>
                    <div>Live</div>
                    <div>Explore</div>
                    <div>Profile</div>
                  </div>
                  {SCREEN_HEATMAP.slice(6, 22).map((row, i) => {
                    const maxVal = Math.max(...Object.values(row).filter((v) => typeof v === "number") as number[]);
                    return (
                      <div key={i} className="grid grid-cols-8 gap-1 text-xs">
                        <div className="text-muted-foreground">{row.hour}</div>
                        {["home", "reels", "match", "chat", "live", "explore", "profile"].map((screen) => {
                          const val = (row[screen] as number) || 0;
                          const intensity = maxVal > 0 ? val / maxVal : 0;
                          return (
                            <div
                              key={screen}
                              className="rounded-sm flex items-center justify-center py-1 text-white font-medium"
                              style={{
                                backgroundColor: `rgba(123, 47, 190, ${Math.max(0.15, intensity)})`,
                                fontSize: intensity > 0.5 ? 10 : 0,
                              }}
                            >
                              {intensity > 0.5 ? val : ""}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Screen Time Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Screen Time Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={screenTimeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="time" name="Time (min)" fill={PURPLE} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="visits" name="Visits" fill={TEAL} radius={[0, 4, 4, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Content Tab ── */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Content Type Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  Content Type Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={CONTENT_TYPE_BREAKDOWN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Count" fill={PURPLE} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="engagement" name="Engagement" stroke={MAGENTA} strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Content Interactions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Content Interactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InteractionRow icon={Heart} label="Likes" value={agg.contentTotals.likes} color={ROSE} />
                <InteractionRow icon={MessageCircle} label="Comments" value={agg.contentTotals.comments} color={TEAL} />
                <InteractionRow icon={Share2} label="Shares" value={agg.contentTotals.shares} color={EMERALD} />
                <InteractionRow icon={Play} label="Reels Watched" value={agg.contentTotals.reels} color={MAGENTA} />
                <InteractionRow icon={Radio} label="Live Joined" value={agg.contentTotals.live} color={AMBER} />
                <InteractionRow icon={Gift} label="Posts Created" value={agg.contentTotals.posts} color={PURPLE} />
              </CardContent>
            </Card>
          </div>

          {/* Geo Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">City</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Users</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Active %</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Avg Session</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GEO_DISTRIBUTION.map((g) => (
                      <tr key={g.city} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 font-medium">{g.city}</td>
                        <td className="text-center py-2">{g.users.toLocaleString()}</td>
                        <td className="text-center py-2">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={g.activePct} className="w-16 h-2" />
                            <span className="text-xs">{g.activePct}%</span>
                          </div>
                        </td>
                        <td className="text-center py-2">{g.avgSessionMin} min</td>
                        <td className="text-center py-2">
                          <span className={g.avgSessionMin > 12 ? "text-green-500" : "text-amber-500"}>
                            {g.avgSessionMin > 12 ? <ArrowUpRight className="w-4 h-4 inline" /> : <ArrowDownRight className="w-4 h-4 inline" />}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Features Tab ── */}
        <TabsContent value="features" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Feature Usage Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Feature Usage (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
                    <Tooltip />
                    <Bar dataKey="count" fill={PURPLE} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feature Usage Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  Feature Usage Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">Feature</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Active Users</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Total Events</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Avg/User</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FEATURE_USAGE_SUMMARY.map((f) => (
                        <tr key={f.feature} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 font-medium">{f.feature}</td>
                          <td className="text-center py-2">{f.activeUsers.toLocaleString()}</td>
                          <td className="text-center py-2">{f.totalEvents.toLocaleString()}</td>
                          <td className="text-center py-2">{f.avgPerUser}</td>
                          <td className="text-center py-2">
                            <Badge variant={f.trend > 0 ? "default" : "destructive"} className="text-xs">
                              {f.trend > 0 ? <ArrowUpRight className="w-3 h-3 inline mr-1" /> : <ArrowDownRight className="w-3 h-3 inline mr-1" />}
                              {Math.abs(f.trend)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Funnels Tab ── */}
        <TabsContent value="funnels" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  User Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={FUNNEL_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="stage" tick={{ fontSize: 10 }} width={140} />
                    <Tooltip />
                    <Bar dataKey="users" fill={PURPLE} radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="conversionRate" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 11 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Funnel Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {FUNNEL_DATA.map((stage, i) => {
                    const prev = i > 0 ? FUNNEL_DATA[i - 1] : null;
                    const dropOff = prev ? prev.users - stage.users : 0;
                    const dropOffPct = prev ? Math.round((dropOff / prev.users) * 100) : 0;
                    return (
                      <div key={stage.stage} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{stage.stage}</span>
                          <span className="text-muted-foreground">
                            {stage.users.toLocaleString()} users
                            {prev && (
                              <span className="text-red-500 ml-2">(-{dropOffPct}%)</span>
                            )}
                          </span>
                        </div>
                        <Progress value={stage.conversionRate} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {stage.conversionRate}% from previous stage
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Retention Tab ── */}
        <TabsContent value="retention" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Cohort Retention (12 Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredCohort}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="cohortDate" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="day1" name="Day 1" stroke={PURPLE} strokeWidth={2} />
                    <Line type="monotone" dataKey="day3" name="Day 3" stroke={TEAL} strokeWidth={2} />
                    <Line type="monotone" dataKey="day7" name="Day 7" stroke={MAGENTA} strokeWidth={2} />
                    <Line type="monotone" dataKey="day14" name="Day 14" stroke={AMBER} strokeWidth={2} />
                    <Line type="monotone" dataKey="day30" name="Day 30" stroke={EMERALD} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Cohort Retention Table
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">Cohort</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Users</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">D1</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">D3</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">D7</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">D14</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">D30</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COHORT_DATA.map((c) => (
                        <tr key={c.cohortDate} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 font-medium">{c.cohortDate}</td>
                          <td className="text-center py-2">{c.users}</td>
                          <td className="text-center py-2">
                            <Badge variant={c.day1 > 60 ? "default" : c.day1 > 40 ? "secondary" : "outline"} className="text-xs">
                              {c.day1}%
                            </Badge>
                          </td>
                          <td className="text-center py-2">
                            <Badge variant={c.day3 > 40 ? "default" : c.day3 > 25 ? "secondary" : "outline"} className="text-xs">
                              {c.day3}%
                            </Badge>
                          </td>
                          <td className="text-center py-2">
                            <Badge variant={c.day7 > 25 ? "default" : c.day7 > 15 ? "secondary" : "outline"} className="text-xs">
                              {c.day7}%
                            </Badge>
                          </td>
                          <td className="text-center py-2">
                            <Badge variant={c.day14 > 15 ? "default" : c.day14 > 8 ? "secondary" : "outline"} className="text-xs">
                              {c.day14}%
                            </Badge>
                          </td>
                          <td className="text-center py-2">
                            <Badge variant={c.day30 > 10 ? "default" : c.day30 > 5 ? "secondary" : "outline"} className="text-xs">
                              {c.day30}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Components ──

function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  sub,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: number;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center gap-1 text-xs">
              {trend > 0 ? (
                <ArrowUpRight className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-500" />
              )}
              <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(trend)}%
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">{sub}</div>
      </CardContent>
    </Card>
  );
}

function InteractionRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{value.toLocaleString()} total</div>
      </div>
      <div className="text-lg font-bold">{value.toLocaleString()}</div>
    </div>
  );
}

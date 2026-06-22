import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Smartphone, Star, Download, Trash2, TrendingUp, TrendingDown,
  MapPin, Monitor, Heart, MessageSquare, AlertTriangle, ChevronDown,
  Smartphone as DeviceIcon, Globe, BarChart3, ArrowUpRight, ArrowDownRight,
  Filter, Search, ArrowRight, X, ChevronLeft, ChevronRight, Frown,
  Smile, Meh, ThumbsUp, ThumbsDown, Reply,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Input } from "@/components/ui/input";

import {
  mockInstalls, mockReviews, mockDailyMetrics,
  getAppStoreTotals, getInstallTrends, getInstallsByLocation,
  getInstallsByCity, getUninstallReasons, getOnboardingDropoff,
  getRatingDistribution, getReviewSentiment, getCrashStats,
} from "@/data/app-store-mock";

const COLORS = {
  primary: "#7B2FBE", magenta: "#E91E8C", indigo: "#6366F1",
  teal: "#14B8A6", amber: "#F59E0B", rose: "#F43F5E",
  emerald: "#10B981", slate: "#64748B", orange: "#F97316",
  cyan: "#06B6D4", violet: "#8B5CF6", pink: "#EC4899",
};

const CHART_COLORS = [
  COLORS.primary, COLORS.magenta, COLORS.indigo, COLORS.teal,
  COLORS.amber, COLORS.rose, COLORS.emerald, COLORS.slate,
  COLORS.orange, COLORS.cyan, COLORS.violet, COLORS.pink,
];

export default function AppStorePage() {
  const [tab, setTab] = useState("overview");
  const [platformFilter, setPlatformFilter] = useState<"all" | "android" | "ios">("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [installSearch, setInstallSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [installPage, setInstallPage] = useState(0);
  const [reviewPage, setReviewPage] = useState(0);
  const [, setLocation] = useLocation();

  const totals = useMemo(() => getAppStoreTotals(), []);
  const trends = useMemo(() => getInstallTrends(), []);
  const byState = useMemo(() => getInstallsByLocation(), []);
  const byCity = useMemo(() => getInstallsByCity(), []);
  const uninstallReasons = useMemo(() => getUninstallReasons(), []);
  const onboardingDropoff = useMemo(() => getOnboardingDropoff(), []);
  const ratingDist = useMemo(() => getRatingDistribution(), []);
  const sentiment = useMemo(() => getReviewSentiment(), []);
  const crashStats = useMemo(() => getCrashStats(), []);

  const filteredInstalls = useMemo(() => {
    let list = mockInstalls;
    if (platformFilter !== "all") list = list.filter((i) => i.platform === platformFilter);
    if (installSearch) {
      const q = installSearch.toLowerCase();
      list = list.filter((i) =>
        i.deviceBrand.toLowerCase().includes(q) ||
        i.deviceModel.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.state.toLowerCase().includes(q) ||
        i.installSource.toLowerCase().includes(q) ||
        i.osVersion.toLowerCase().includes(q)
      );
    }
    return list;
  }, [platformFilter, installSearch]);

  const filteredReviews = useMemo(() => {
    let list = mockReviews;
    if (reviewFilter !== "all") list = list.filter((r) => r.sentiment === reviewFilter);
    if (reviewSearch) {
      const q = reviewSearch.toLowerCase();
      list = list.filter((r) =>
        r.body.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.reviewerName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reviewFilter, reviewSearch]);

  const pageSize = 15;
  const installPages = Math.ceil(filteredInstalls.length / pageSize);
  const reviewPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedInstalls = filteredInstalls.slice(installPage * pageSize, (installPage + 1) * pageSize);
  const paginatedReviews = filteredReviews.slice(reviewPage * pageSize, (reviewPage + 1) * pageSize);

  const sentimentIcon = (s: string) => {
    if (s === "positive") return <Smile className="w-4 h-4 text-emerald-500" />;
    if (s === "negative") return <Frown className="w-4 h-4 text-rose-500" />;
    return <Meh className="w-4 h-4 text-amber-500" />;
  };

  const ratingColor = (r: number) => {
    if (r >= 4) return "text-emerald-600";
    if (r === 3) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">App Store Analytics</h1>
          <p className="text-sm text-muted-foreground">Installs, reviews, devices, and attribution tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Globe className="w-3 h-3" /> India-based, Global-first
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Installs"
          value={totals.totalInstalls.toLocaleString()}
          sub={`Android ${totals.android.installs.toLocaleString()} · iOS ${totals.ios.installs.toLocaleString()}`}
          icon={Download}
          color="bg-emerald-50 text-emerald-600"
          trend="+12.3%"
          trendUp
        />
        <KPICard
          title="Active Devices"
          value={totals.totalActive.toLocaleString()}
          sub={`Retention: ${totals.retentionRate}%`}
          icon={Smartphone}
          color="bg-primary/10 text-primary"
          trend="+8.1%"
          trendUp
        />
        <KPICard
          title="Avg Rating"
          value={totals.avgRating.toFixed(1)}
          sub={`${totals.totalReviews} reviews · Android ${totals.android.avgRating.toFixed(1)} · iOS ${totals.ios.avgRating.toFixed(1)}`}
          icon={Star}
          color="bg-amber-50 text-amber-600"
          trend="+0.2"
          trendUp
        />
        <KPICard
          title="Uninstalls"
          value={totals.totalUninstalls.toLocaleString()}
          sub={`${((totals.totalUninstalls / totals.totalInstalls) * 100).toFixed(1)}% churn rate`}
          icon={Trash2}
          color="bg-rose-50 text-rose-600"
          trend="-2.1%"
          trendUp={false}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="installs">Installs</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="crashes">Crashes</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ──────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          {/* Install Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Install Trend (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="android" stackId="a" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} name="Android" />
                    <Area type="monotone" dataKey="ios" stackId="a" stroke={COLORS.magenta} fill={COLORS.magenta} fillOpacity={0.3} name="iOS" />
                    <Area type="monotone" dataKey="uninstalls" stroke={COLORS.rose} fill={COLORS.rose} fillOpacity={0.1} name="Uninstalls" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Rating Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Rating Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingDist}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="rating" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {ratingDist.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Review Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentiment}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="sentiment"
                      >
                        {sentiment.map((entry, i) => (
                          <Cell key={i} fill={
                            entry.sentiment === "positive" ? COLORS.emerald :
                            entry.sentiment === "neutral" ? COLORS.amber : COLORS.rose
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TopListCard title="Top Sources" icon={BarChart3} data={Object.entries(totals.sourceBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 6)} />
            <TopListCard title="Top Devices" icon={DeviceIcon} data={Object.entries(totals.deviceBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 6)} />
            <TopListCard title="Top States" icon={MapPin} data={byState.slice(0, 6).map((s) => [s.state, s.count])} />
          </div>
        </TabsContent>

        {/* ── Installs Tab ───────────────────────────────────────────── */}
        <TabsContent value="installs" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by device, city, source..."
                value={installSearch}
                onChange={(e) => { setInstallSearch(e.target.value); setInstallPage(0); }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1">
              {(["all", "android", "ios"] as const).map((p) => (
                <Button
                  key={p}
                  variant={platformFilter === p ? "default" : "outline"}
                  size="sm"
                  className="text-xs capitalize"
                  onClick={() => { setPlatformFilter(p); setInstallPage(0); }}
                >
                  {p}
                </Button>
              ))}
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {filteredInstalls.length} records
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">Platform</TableHead>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Installed</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Onboarding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInstalls.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="text-xs">
                      <div className="font-medium">{i.deviceBrand} {i.deviceModel}</div>
                      <div className="text-muted-foreground">{i.osVersion} · {i.appVersion}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className={i.platform === "android" ? "text-emerald-600 border-emerald-200" : "text-slate-600 border-slate-200"}>
                        {i.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="capitalize">{i.installSource.replace(/_/g, " ")}</div>
                      {i.campaignId && <div className="text-muted-foreground">{i.campaignId}</div>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {i.city}, {i.state}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(i.installedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs">
                      {i.isUninstalled ? (
                        <Badge variant="destructive" className="text-[10px]">Uninstalled</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {i.onboardingCompleted ? (
                        <span className="text-emerald-600">Completed</span>
                      ) : (
                        <span className="text-amber-600">Drop: {i.onboardingDropoffStep}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Page {installPage + 1} of {installPages || 1}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={installPage === 0} onClick={() => setInstallPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={installPage >= installPages - 1} onClick={() => setInstallPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Uninstall reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Uninstall Reasons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uninstallReasons.map((r) => (
                    <div key={r.reason} className="flex items-center gap-2">
                      <div className="w-24 text-xs capitalize">{r.reason.replace(/_/g, " ")}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(r.count / uninstallReasons[0].count) * 100}%` }} />
                      </div>
                      <div className="w-8 text-xs text-right">{r.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Onboarding Dropoff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {onboardingDropoff.map((d) => (
                    <div key={d.step} className="flex items-center gap-2">
                      <div className="w-24 text-xs capitalize">{d.step.replace(/_/g, " ")}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(d.count / onboardingDropoff[0].count) * 100}%` }} />
                      </div>
                      <div className="w-8 text-xs text-right">{d.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Reviews Tab ───────────────────────────────────────────── */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={reviewSearch}
                onChange={(e) => { setReviewSearch(e.target.value); setReviewPage(0); }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1">
              {(["all", "positive", "neutral", "negative"] as const).map((f) => (
                <Button
                  key={f}
                  variant={reviewFilter === f ? "default" : "outline"}
                  size="sm"
                  className="text-xs capitalize"
                  onClick={() => { setReviewFilter(f); setReviewPage(0); }}
                >
                  {f}
                </Button>
              ))}
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {filteredReviews.length} reviews
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Reviewer</TableHead>
                  <TableHead className="text-xs">Rating</TableHead>
                  <TableHead className="text-xs">Content</TableHead>
                  <TableHead className="text-xs">Platform</TableHead>
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Reply</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">
                      <div className="font-medium">{r.reviewerName}</div>
                      <div className="text-muted-foreground">{r.language}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className={`flex items-center gap-1 font-bold ${ratingColor(r.rating)}`}>
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {r.rating}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[300px]">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-muted-foreground truncate">{r.body}</div>
                      <div className="flex gap-1 mt-1">
                        {r.keyTopics.map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px] h-4 px-1">{t}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        {sentimentIcon(r.sentiment)}
                        <Badge variant="outline" className="text-[10px] h-4">
                          {r.platform}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.deviceModel}
                      <div className="text-muted-foreground">{r.osVersion}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.reviewDate}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.isReplySent ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 gap-1">
                          <Reply className="w-3 h-3" /> Replied
                        </Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                          Reply
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Page {reviewPage + 1} of {reviewPages || 1}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={reviewPage === 0} onClick={() => setReviewPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={reviewPage >= reviewPages - 1} onClick={() => setReviewPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Devices Tab ───────────────────────────────────────────── */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Device Brands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(totals.deviceBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([name, value]) => ({ name, value }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Platform Split</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Android", value: totals.android.installs },
                          { name: "iOS", value: totals.ios.installs },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={COLORS.primary} />
                        <Cell fill={COLORS.magenta} />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* OS Version breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OS Version Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Android</h4>
                  <div className="space-y-2">
                    {["14", "13", "12", "11", "10"].map((v, i) => {
                      const count = mockInstalls.filter((inst) => inst.platform === "android" && inst.osVersion === v).length;
                      const total = mockInstalls.filter((inst) => inst.platform === "android").length;
                      return (
                        <div key={v} className="flex items-center gap-2">
                          <div className="w-8 text-xs">{v}</div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
                          </div>
                          <div className="w-8 text-xs text-right">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">iOS</h4>
                  <div className="space-y-2">
                    {["17.4", "17.3", "17.2", "17.1", "17.0", "16.7", "16.6"].map((v) => {
                      const count = mockInstalls.filter((inst) => inst.platform === "ios" && inst.osVersion === v).length;
                      const total = mockInstalls.filter((inst) => inst.platform === "ios").length;
                      return (
                        <div key={v} className="flex items-center gap-2">
                          <div className="w-8 text-xs">{v}</div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-magenta rounded-full" style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
                          </div>
                          <div className="w-8 text-xs text-right">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Locations Tab ──────────────────────────────────────────── */}
        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Installs by State
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {byState.map((s) => (
                    <div key={s.state} className="flex items-center gap-2">
                      <div className="w-28 text-xs truncate">{s.state}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(s.count / byState[0].count) * 100}%` }} />
                      </div>
                      <div className="w-10 text-xs text-right">{s.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-magenta" />
                  Top Cities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {byCity.map((c) => (
                    <div key={c.city} className="flex items-center gap-2">
                      <div className="w-24 text-xs truncate">{c.city}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-magenta rounded-full" style={{ width: `${(c.count / byCity[0].count) * 100}%` }} />
                      </div>
                      <div className="w-10 text-xs text-right">{c.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Sources Tab ───────────────────────────────────────────── */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Install Source Attribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(totals.sourceBreakdown)
                          .sort((a, b) => b[1] - a[1])
                          .map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(totals.sourceBreakdown).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Source Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(totals.sourceBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([source, count], i) => (
                      <div key={source} className="flex items-center gap-2">
                        <div className="w-32 text-xs capitalize">{source.replace(/_/g, " ")}</div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(count / totals.totalInstalls) * 100}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        </div>
                        <div className="w-12 text-xs text-right">{count.toLocaleString()}</div>
                        <div className="w-12 text-xs text-right text-muted-foreground">{((count / totals.totalInstalls) * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Crashes Tab ───────────────────────────────────────────── */}
        <TabsContent value="crashes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600">{crashStats.android.crashes}</div>
                  <div className="text-sm text-muted-foreground mt-1">Android Crashes</div>
                  <div className="text-xs text-rose-500 mt-1">{crashStats.android.crashRate}% crash rate</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600">{crashStats.ios.crashes}</div>
                  <div className="text-sm text-muted-foreground mt-1">iOS Crashes</div>
                  <div className="text-xs text-rose-500 mt-1">{crashStats.ios.crashRate}% crash rate</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">{crashStats.android.anrs + crashStats.ios.anrs}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total ANRs</div>
                  <div className="text-xs text-muted-foreground mt-1">Android: {crashStats.android.anrs} · iOS: {crashStats.ios.anrs}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Crash Trend (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockDailyMetrics.filter((m) => m.platform === "android")}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="crashes" stroke={COLORS.rose} fill={COLORS.rose} fillOpacity={0.2} name="Crashes" />
                    <Area type="monotone" dataKey="anrs" stroke={COLORS.amber} fill={COLORS.amber} fillOpacity={0.2} name="ANRs" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── KPI Card ────────────────────────────────────────────────── */

function KPICard({
  title, value, sub, icon: Icon, color, trend, trendUp,
}: {
  title: string; value: string; sub: string;
  icon: React.ComponentType<{ className?: string }>; color: string;
  trend: string; trendUp: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold mt-1">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</p>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? "text-emerald-600" : "text-rose-600"}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Top List Card ──────────────────────────────────────────────── */

function TopListCard({
  title, icon: Icon, data,
}: {
  title: string; icon: React.ComponentType<{ className?: string }>;
  data: [string, number][];
}) {
  const max = data[0]?.[1] || 1;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map(([name, count], i) => (
            <div key={name} className="flex items-center gap-2">
              <div className="w-4 text-[10px] text-muted-foreground">{i + 1}</div>
              <div className="w-24 text-xs truncate capitalize">{name.replace(/_/g, " ")}</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <div className="w-10 text-xs text-right">{count.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

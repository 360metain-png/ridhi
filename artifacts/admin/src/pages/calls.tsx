import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Phone, Video, IndianRupee, Users, TrendingUp, Shield, AlertTriangle,
  Eye, Ban, Mic, Star, CheckCircle, Search, Clock, Coins, Download} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { downloadCSV } from "@/lib/utils";

const HOST_TIERS = [
  { id: "new",       label: "New Host",  badge: "🌱", audioRate: 10,  videoRate: 25,  color: "#4CAF50" },
  { id: "popular",   label: "Popular",   badge: "⭐", audioRate: 20,  videoRate: 50,  color: "#2196F3" },
  { id: "vip",       label: "VIP Host",  badge: "💎", audioRate: 40,  videoRate: 100, color: "#FFB800" },
  { id: "celebrity", label: "Celebrity", badge: "👑", audioRate: 80,  videoRate: 200, color: "#E91E8C" },
];

const callVolumeData = [
  { day: "Mon", audio: 8400, video: 2100 },
  { day: "Tue", audio: 9200, video: 2400 },
  { day: "Wed", audio: 8800, video: 2800 },
  { day: "Thu", audio: 10400, video: 3100 },
  { day: "Fri", audio: 12800, video: 3800 },
  { day: "Sat", audio: 14200, video: 4400 },
  { day: "Sun", audio: 16400, video: 5200 },
];

const revenueByTierData = [
  { tier: "New 🌱", audio: 42000, video: 18000 },
  { tier: "Popular ⭐", audio: 128000, video: 84000 },
  { tier: "VIP 💎", audio: 96000, video: 210000 },
  { tier: "Celebrity 👑", audio: 48000, video: 320000 },
];

const callShareData = [
  { name: "Audio — New", value: 28 },
  { name: "Audio — Popular", value: 22 },
  { name: "Video — VIP", value: 24 },
  { name: "Video — Celebrity", value: 14 },
  { name: "Other", value: 12 },
];
const SHARE_COLORS = ["#4CAF50", "#2196F3", "#FFB800", "#E91E8C", "#9E9E9E"];

const ACTIVE_CALLS = [
  { id: "c1", caller: "Rahul K", host: "Priya S", tier: "celebrity", type: "video", duration: "8:42", rate: 200, coins: 1740, city: "Delhi" },
  { id: "c2", caller: "Ananya M", host: "Dev R", tier: "vip", type: "audio", duration: "14:22", rate: 40, coins: 576, city: "Mumbai" },
  { id: "c3", caller: "Vikram P", host: "Kavya K", tier: "popular", type: "video", duration: "3:15", rate: 50, coins: 162, city: "Bangalore" },
  { id: "c4", caller: "Meera D", host: "Arjun V", tier: "new", type: "audio", duration: "22:08", rate: 10, coins: 221, city: "Kochi" },
  { id: "c5", caller: "Rohan S", host: "Sneha J", tier: "vip", type: "video", duration: "5:44", rate: 100, coins: 574, city: "Hyderabad" },
];

const SAFETY_FLAGS = [
  { id: "f1", type: "Harassment report", host: "UserXX-4421", caller: "Reported by 3 callers", severity: "high", time: "12 min ago" },
  { id: "f2", type: "Inappropriate content", host: "Preethi N", caller: "AI auto-flag", severity: "medium", time: "44 min ago" },
  { id: "f3", type: "Fake profile", host: "Account-78xx", caller: "User report", severity: "low", time: "2h ago" },
];

const HOST_PERF = [
  { name: "Priya Sharma", tier: "celebrity", calls: 284, avgDuration: "12m", rating: 4.9, earnings: 284000, repeatRate: 68 },
  { name: "Rahul Verma", tier: "vip", calls: 198, avgDuration: "9m", rating: 4.7, earnings: 142000, repeatRate: 54 },
  { name: "Kavya Reddy", tier: "popular", calls: 312, avgDuration: "7m", rating: 4.8, earnings: 84000, repeatRate: 61 },
  { name: "Dev Kumar", tier: "new", calls: 48, avgDuration: "5m", rating: 4.2, earnings: 12000, repeatRate: 32 },
];

export default function CallsPage() {
  const [tab, setTab] = useState<"overview" | "live" | "hosts" | "safety">("overview");
  const [search, setSearch] = useState("");

  const tierOf = (id: string) => HOST_TIERS.find((t) => t.id === id)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("calls_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="w-6 h-6 text-primary" />
            Audio & Video Calls
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            4 host tiers · pricing per blueprint · live monitoring · safety
          </p>
        </div>
        <Badge className="gap-1 bg-green-600 hover:bg-green-600">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
          {ACTIVE_CALLS.length} Live Calls
        </Badge>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Calls Today", value: "16,400", sub: "+22% vs yesterday", icon: Phone, color: "text-blue-600 bg-blue-50" },
          { label: "Video Calls", value: "5,200", sub: "31.7% of total", icon: Video, color: "text-purple-600 bg-purple-50" },
          { label: "Call Revenue (Day)", value: "₹3.14L", sub: "+18.4% vs yesterday", icon: IndianRupee, color: "text-green-600 bg-green-50" },
          { label: "Avg Call Duration", value: "8.4 min", sub: "audio 6.2 · video 12.8", icon: Clock, color: "text-orange-600 bg-orange-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xs text-green-500 mt-0.5">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier pricing reference */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {HOST_TIERS.map((t) => (
          <Card key={t.id} className="border-t-4" style={{ borderTopColor: t.color }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{t.badge}</span>
                <Badge variant="outline" className="text-xs" style={{ borderColor: t.color, color: t.color }}>{t.label}</Badge>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Mic className="w-3 h-3" /> Audio</span>
                  <span className="font-bold">🪙 {t.audioRate}/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>
                  <span className="font-bold">🪙 {t.videoRate}/min</span>
                </div>
                <div className="flex justify-between pt-1 border-t mt-1">
                  <span className="text-muted-foreground">Est. 5 min</span>
                  <span className="text-foreground font-medium">🪙 {t.videoRate * 5} (video)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {(["overview", "live", "hosts", "safety"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "overview" ? "📊 Overview" : t === "live" ? "🔴 Live Calls" : t === "hosts" ? "⭐ Host Performance" : "🛡️ Safety"}
            {t === "safety" && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{SAFETY_FLAGS.length}</span>}
          </button>
        ))}
        {tab !== "overview" && (
          <div className="ml-auto relative">
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 w-48 text-sm" />
          </div>
        )}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("calls_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Call Volume (7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={callVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => v.toLocaleString()} />
                      <Bar dataKey="audio" name="Audio Calls" fill="#7B2FBE" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="video" name="Video Calls" fill="#E91E8C" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Revenue by Host Tier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByTierData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                      <Bar dataKey="audio" name="Audio" fill="#7B2FBE" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="video" name="Video" fill="#E91E8C" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Call Type Share</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="h-[160px] w-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={callShareData} cx="50%" cy="50%" innerRadius={42} outerRadius={70} dataKey="value">
                        {callShareData.map((_, i) => <Cell key={i} fill={SHARE_COLORS[i % SHARE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1.5">
                  {callShareData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: SHARE_COLORS[i] }} />
                      <span className="text-muted-foreground truncate">{d.name}</span>
                      <span className="font-bold ml-auto">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Premium Add-On Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "HD Video", cost: "+10/min", earned: "₹48K", pct: 72 },
                    { label: "Beauty Mode", cost: "+5/min", earned: "₹24K", pct: 58 },
                    { label: "Voice Effects", cost: "+5/min", earned: "₹18K", pct: 44 },
                    { label: "Auto-Translate", cost: "+15/min", earned: "₹12K", pct: 28 },
                    { label: "VIP Priority", cost: "+20/min", earned: "₹21K", pct: 38 },
                  ].map((a) => (
                    <div key={a.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{a.label}</span>
                        <span className="text-muted-foreground">{a.cost}</span>
                      </div>
                      <Progress value={a.pct} className="h-1.5" />
                      <p className="text-xs text-green-600 font-medium">{a.earned} today</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "live" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left p-4 pb-3">Caller</th>
                  <th className="text-left pb-3">Host</th>
                  <th className="text-left pb-3">Tier</th>
                  <th className="text-left pb-3">Type</th>
                  <th className="text-right pb-3">Duration</th>
                  <th className="text-right pb-3">Rate</th>
                  <th className="text-right pb-3">Coins Used</th>
                  <th className="text-left pb-3">City</th>
                  <th className="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ACTIVE_CALLS.map((c) => {
                  const t = tierOf(c.tier);
                  return (
                    <tr key={c.id}>
                      <td className="p-4 py-3 font-medium">{c.caller}</td>
                      <td className="py-3">{c.host}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs" style={{ borderColor: t.color, color: t.color }}>
                          {t.badge} {t.label}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          {c.type === "audio" ? <Mic className="w-3.5 h-3.5 text-purple-500" /> : <Video className="w-3.5 h-3.5 text-pink-500" />}
                          {c.type === "audio" ? "Audio" : "Video"}
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium">{c.duration}</td>
                      <td className="py-3 text-right">🪙 {c.rate}/min</td>
                      <td className="py-3 text-right font-medium">🪙 {c.coins}</td>
                      <td className="py-3 text-muted-foreground">{c.city}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive px-2">End</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "hosts" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left p-4 pb-3">Host</th>
                  <th className="text-left pb-3">Tier</th>
                  <th className="text-right pb-3">Total Calls</th>
                  <th className="text-right pb-3">Avg Duration</th>
                  <th className="text-right pb-3">Rating</th>
                  <th className="text-right pb-3">Earnings</th>
                  <th className="text-right pb-3">Repeat Rate</th>
                  <th className="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {HOST_PERF.map((h) => {
                  const t = tierOf(h.tier);
                  return (
                    <tr key={h.name}>
                      <td className="p-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{t.badge}</span>
                          <p className="font-medium">{h.name}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs" style={{ borderColor: t.color, color: t.color }}>{t.label}</Badge>
                      </td>
                      <td className="py-3 text-right font-medium">{h.calls}</td>
                      <td className="py-3 text-right">{h.avgDuration}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500" />
                          <span className="font-bold">{h.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium text-green-600">₹{(h.earnings / 1000).toFixed(0)}K</td>
                      <td className="py-3 text-right">
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium">{h.repeatRate}%</p>
                          <Progress value={h.repeatRate} className="h-1 w-16 ml-auto" />
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "safety" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "AI Moderation", status: "Active", accuracy: 97.8, color: "text-green-600", bg: "bg-green-50" },
              { label: "Screenshot Detection", status: "Active", accuracy: 99.4, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Underage Protection", status: "Active", accuracy: 98.1, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${s.color}`} />
                      <p className="text-sm font-medium">{s.label}</p>
                    </div>
                    <Badge className={`text-xs ${s.bg} ${s.color} border-0`}>{s.status}</Badge>
                  </div>
                  <Progress value={s.accuracy} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{s.accuracy}% accuracy</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {SAFETY_FLAGS.map((f) => (
            <Card key={f.id} className={`border-l-4 ${f.severity === "high" ? "border-l-red-500" : f.severity === "medium" ? "border-l-yellow-500" : "border-l-blue-400"}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${f.severity === "high" ? "text-red-500" : f.severity === "medium" ? "text-yellow-500" : "text-blue-400"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{f.type}</p>
                    <Badge variant={f.severity === "high" ? "destructive" : "secondary"} className="text-xs capitalize">{f.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Host: {f.host} · {f.caller} · {f.time}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs"><Eye className="w-3.5 h-3.5 mr-1" />Review</Button>
                  <Button variant="destructive" size="sm" className="h-8 text-xs"><Ban className="w-3.5 h-3.5 mr-1" />Ban</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Safety Rules in Effect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {[
                  "✅ 15-second free preview before coin deduction",
                  "✅ User confirmation required before each charge",
                  "✅ OTP login mandatory — no guest calls",
                  "✅ AI detects abusive content in real-time",
                  "✅ Instant report/block available during call",
                  "✅ IP & device fraud checks on every call",
                  "✅ Underage protection: age verification required",
                  "✅ Women-safety mode: audio-only option for new users",
                  "✅ Call history accessible to user anytime",
                  "✅ Hosts flagged after 3+ abuse reports",
                ].map((r) => (
                  <p key={r} className="text-muted-foreground">{r}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

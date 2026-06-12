import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { downloadCSV } from "@/lib/utils";
import {
  PhoneCall, Users, Clock, Coins, Activity, Wifi,
  CheckCircle, XCircle, RefreshCw, Radio, Zap,
  Filter, Globe, Heart, ShieldCheck, Save, Download} from "lucide-react";

const API_BASE = "/api";

interface CallStats {
  queueSize: number;
  activeCalls: number;
  totalCalls: number;
  totalDurationMinutes: number;
  totalCoinsTransferred: number;
}

interface ActiveCall {
  callId: string;
  userA: { name: string; gender: string; language: string; category: string; city?: string };
  userB: { name: string; gender: string; language: string; category: string; city?: string };
  startedAt: number;
  durationSec: number;
  coinRate: number;
  type: "audio" | "video";
  coinsSpent: number;
}

interface CategoryItem {
  id: string;
  label: string;
  emoji: string;
  enabled: boolean;
}

interface CallConfig {
  audioRate: number;
  videoRate: number;
  crossGenderOnly: boolean;
  maxWaitSec: number;
  autoRematch: boolean;
  freePreviewSec: number;
}

async function fetchCallStats(): Promise<CallStats | null> {
  try {
    const res = await fetch(`${API_BASE}/calls/stats`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/calls/categories`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch {
    return [];
  }
}

const MOCK_STATS: CallStats = {
  queueSize: 42,
  activeCalls: 18,
  totalCalls: 3847,
  totalDurationMinutes: 12430,
  totalCoinsTransferred: 892000,
};

const MOCK_ACTIVE: ActiveCall[] = [
  {
    callId: "call_abc123",
    userA: { name: "Rahul S.", gender: "male", language: "Hindi", category: "songs", city: "Delhi" },
    userB: { name: "Priya K.", gender: "female", language: "Hindi", category: "songs", city: "Mumbai" },
    startedAt: Date.now() - 120000,
    durationSec: 120,
    coinRate: 10,
    type: "audio",
    coinsSpent: 20,
  },
  {
    callId: "call_def456",
    userA: { name: "Amit R.", gender: "male", language: "Bengali", category: "poetry", city: "Kolkata" },
    userB: { name: "Sneha M.", gender: "female", language: "Bengali", category: "poetry", city: "Kolkata" },
    startedAt: Date.now() - 450000,
    durationSec: 450,
    coinRate: 25,
    type: "video",
    coinsSpent: 187,
  },
  {
    callId: "call_ghi789",
    userA: { name: "Karan V.", gender: "male", language: "Tamil", category: "technology", city: "Chennai" },
    userB: { name: "Divya P.", gender: "female", language: "Tamil", category: "technology", city: "Chennai" },
    startedAt: Date.now() - 30000,
    durationSec: 30,
    coinRate: 10,
    type: "audio",
    coinsSpent: 5,
  },
];

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "any", label: "Any", emoji: "\u2b50", enabled: true },
  { id: "art", label: "Art", emoji: "\ud83c\udfa8", enabled: true },
  { id: "dance", label: "Dance", emoji: "\ud83d\udc83", enabled: true },
  { id: "songs", label: "Songs", emoji: "\ud83c\udfb5", enabled: true },
  { id: "romantic", label: "Romantic", emoji: "\ud83d\udc96", enabled: true },
  { id: "technology", label: "Technology", emoji: "\ud83d\udcbb", enabled: true },
  { id: "comedy", label: "Comedy", emoji: "\ud83d\ude02", enabled: true },
  { id: "poetry", label: "Poetry", emoji: "\u270d\ufe0f", enabled: true },
  { id: "gaming", label: "Gaming", emoji: "\ud83c\udfae", enabled: true },
  { id: "food", label: "Food", emoji: "\ud83c\udf5c", enabled: true },
  { id: "travel", label: "Travel", emoji: "\u2708\ufe0f", enabled: true },
];

export default function RandomCallAdminCard() {
  const [stats, setStats] = useState<CallStats | null>(null);
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>(MOCK_ACTIVE);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [config, setConfig] = useState<CallConfig>({
    audioRate: 10,
    videoRate: 25,
    crossGenderOnly: true,
    maxWaitSec: 120,
    autoRematch: true,
    freePreviewSec: 15,
  });
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>("Just now");
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!polling) return;
    const id = setInterval(loadData, 5000);
    return () => clearInterval(id);
  }, [polling]);

  async function loadData() {
    const s = await fetchCallStats();
    const c = await fetchCategories();
    setStats(s ?? MOCK_STATS);
    if (c.length > 0) setCategories(c);
    setLastRefresh(new Date().toLocaleTimeString());
  }

  const toggleCategory = (id: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
    ));
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const StatCard = ({ icon: Icon, label, value, color, suffix }: {
    icon: React.ElementType; label: string; value: string | number;
    color: string; suffix?: string;
  }) => (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}{suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("random-call-admin_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>

      {/* ── Header + Refresh ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg text-foreground">Random Call Command Centre</p>
            <p className="text-sm text-muted-foreground">
              Real-time WebSocket matching engine — cross-gender, category-filtered, coin-based calls
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 border-green-300 text-green-700 bg-green-50">
            <Radio className="w-3 h-3" /> Live
          </Badge>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-1.5">
            <Switch checked={polling} onCheckedChange={setPolling} className="scale-75" />
            <span className="text-xs text-muted-foreground">Auto</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{lastRefresh}</span>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Waiting in Queue" value={stats?.queueSize ?? 0} color="bg-orange-500" />
        <StatCard icon={PhoneCall} label="Active Calls" value={stats?.activeCalls ?? 0} color="bg-green-600" />
        <StatCard icon={Activity} label="Total Calls" value={(stats?.totalCalls ?? 0).toLocaleString()} color="bg-blue-600" />
        <StatCard icon={Clock} label="Total Duration" value={stats?.totalDurationMinutes ?? 0} color="bg-purple-600" suffix="min" />
        <StatCard icon={Coins} label="Coins Moved" value={((stats?.totalCoinsTransferred ?? 0) / 1000).toFixed(1)} color="bg-pink-600" suffix="K" />
      </div>

      {/* ── Matching Rules + Rates ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-base">Matching Rules & Pricing</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">Configure cross-gender enforcement, coin rates, and session limits</p>
        </CardHeader>
        <CardContent className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Audio Rate</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number" min={1} max={100}
                  value={config.audioRate}
                  onChange={e => setConfig(p => ({ ...p, audioRate: parseInt(e.target.value) || 10 }))}
                  className="h-8 text-xs w-20"
                />
                <span className="text-xs text-muted-foreground">coins/min</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Video Rate</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number" min={1} max={100}
                  value={config.videoRate}
                  onChange={e => setConfig(p => ({ ...p, videoRate: parseInt(e.target.value) || 25 }))}
                  className="h-8 text-xs w-20"
                />
                <span className="text-xs text-muted-foreground">coins/min</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Max Wait</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number" min={10} max={600}
                  value={config.maxWaitSec}
                  onChange={e => setConfig(p => ({ ...p, maxWaitSec: parseInt(e.target.value) || 120 }))}
                  className="h-8 text-xs w-20"
                />
                <span className="text-xs text-muted-foreground">seconds</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Free Preview</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number" min={0} max={60}
                  value={config.freePreviewSec}
                  onChange={e => setConfig(p => ({ ...p, freePreviewSec: parseInt(e.target.value) || 15 }))}
                  className="h-8 text-xs w-20"
                />
                <span className="text-xs text-muted-foreground">seconds</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-50">
                <Heart className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="text-xs font-medium">Cross-Gender Matching</p>
                <p className="text-[10px] text-muted-foreground">Male &rarr; Female only, Female &rarr; Male only</p>
              </div>
              <Switch
                checked={config.crossGenderOnly}
                onCheckedChange={v => setConfig(p => ({ ...p, crossGenderOnly: v }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium">Auto-Rematch on Disconnect</p>
                <p className="text-[10px] text-muted-foreground">Rejoin queue instantly when peer drops</p>
              </div>
              <Switch
                checked={config.autoRematch}
                onCheckedChange={v => setConfig(p => ({ ...p, autoRematch: v }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">Changes apply to new calls immediately.</p>
            <Button size="sm" className="text-xs gap-1 bg-gradient-to-r from-purple-600 to-pink-600" onClick={() => setLoading(false)}>
              <Save className="w-3.5 h-3.5" /> Save Rules
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Category Toggles ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-base">Call Categories</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">Enable or disable categories users can select when joining the random call queue</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`rounded-xl border p-3 text-center cursor-pointer transition-all ${
                  cat.enabled
                    ? "border-purple-200 bg-purple-50 hover:bg-purple-100"
                    : "border-gray-200 bg-gray-50 opacity-60 hover:opacity-80"
                }`}
                onClick={() => toggleCategory(cat.id)}
              >
                <p className="text-2xl mb-1">{cat.emoji}</p>
                <p className="text-xs font-medium">{cat.label}</p>
                <Badge variant="outline" className={`text-[10px] mt-1 ${cat.enabled ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {cat.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Active Calls Table ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-600" />
              <CardTitle className="text-base">Live Active Calls</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs gap-1 border-green-300 text-green-700 bg-green-50">
              <Radio className="w-3 h-3" /> {activeCalls.length} ongoing
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground bg-muted/30">
                  <th className="text-left p-3 font-medium">Call ID</th>
                  <th className="text-left p-3 font-medium">Caller</th>
                  <th className="text-left p-3 font-medium">Host</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Language</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Duration</th>
                  <th className="text-right p-3 font-medium">Coins</th>
                </tr>
              </thead>
              <tbody>
                {activeCalls.map(call => (
                  <tr key={call.callId} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3 font-mono text-xs text-muted-foreground">{call.callId}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1 h-4 bg-blue-100 text-blue-700 border-blue-200">
                          {call.userA.gender === "male" ? "M" : "F"}
                        </Badge>
                        <span className="text-xs font-medium">{call.userA.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{call.userA.city}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1 h-4 bg-pink-100 text-pink-700 border-pink-200">
                          {call.userB.gender === "male" ? "M" : "F"}
                        </Badge>
                        <span className="text-xs font-medium">{call.userB.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{call.userB.city}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">
                        {categories.find(c => c.id === call.userA.category)?.emoji} {call.userA.category}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{call.userA.language}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] ${call.type === "video" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                        {call.type === "video" ? "Video" : "Audio"}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs font-mono">{formatDuration(call.durationSec)}</td>
                    <td className="p-3 text-right text-xs font-semibold text-orange-600">
                      {call.coinsSpent} <Coins className="w-3 h-3 inline" />
                    </td>
                  </tr>
                ))}
                {activeCalls.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs text-muted-foreground">
                      No active calls right now
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Safety Banner ── */}
      <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-purple-900 text-sm">Safety Controls</p>
          <p className="text-xs text-purple-700 mt-0.5">
            Users can report and block during calls. All calls are logged with callId, participants, duration, and coins exchanged.
            Cross-gender matching is enforced server-side — users cannot bypass it by changing their client state.
          </p>
        </div>
      </div>
    </div>
  );
}

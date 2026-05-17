import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Cpu, Zap, Hash, Globe, Shield, AlertTriangle, Mic,
  TrendingUp, CheckCircle2, XCircle, Clock, Activity,
  RefreshCw, Settings2, Eye, Flag,
} from "lucide-react";

const AI_SYSTEMS = [
  {
    id: "feed", name: "Feed Recommendations", icon: TrendingUp, color: "#7B2FBE",
    status: "active", accuracy: 91.4, requestsPerDay: 2840000, latencyMs: 38,
    desc: "Personalizes the For You feed using collaborative filtering + content signals",
    models: ["CF Model v3.2", "Content Embeddings v1.8"],
    lastTrained: "2h ago",
  },
  {
    id: "caption", name: "Caption Generator", icon: Zap, color: "#E91E8C",
    status: "active", accuracy: 88.7, requestsPerDay: 142000, latencyMs: 1320,
    desc: "Generates captions in 4 tones (Casual, Funny, Inspirational, Desi)",
    models: ["LLM-India v2.1"],
    lastTrained: "6h ago",
  },
  {
    id: "hashtag", name: "Hashtag Suggestions", icon: Hash, color: "#F59E0B",
    status: "active", accuracy: 94.2, requestsPerDay: 310000, latencyMs: 210,
    desc: "Topic detection + trending hashtag ranking across 13 Indian languages",
    models: ["TopicBERT-IN v1.5", "Hashtag Ranker v2.0"],
    lastTrained: "4h ago",
  },
  {
    id: "translate", name: "Translation System", icon: Globe, color: "#3B82F6",
    status: "active", accuracy: 96.8, requestsPerDay: 1920000, latencyMs: 95,
    desc: "Real-time translation across Hindi, Tamil, Telugu, Bengali + 9 more languages",
    models: ["IndictTrans v3.0", "NLLB-India-200"],
    lastTrained: "12h ago",
  },
  {
    id: "moderation", name: "Content Moderation", icon: Shield, color: "#10B981",
    status: "active", accuracy: 97.3, requestsPerDay: 890000, latencyMs: 55,
    desc: "Multi-modal moderation: text, image, video. CSAM, violence, hate speech detection",
    models: ["ModBERT-IN v4.1", "VisionGuard v2.3"],
    lastTrained: "1h ago",
  },
  {
    id: "spam", name: "Spam Detection", icon: AlertTriangle, color: "#EF4444",
    status: "active", accuracy: 98.1, requestsPerDay: 3200000, latencyMs: 12,
    desc: "Real-time spam, scam, and bot detection across posts, comments, and DMs",
    models: ["SpamNet-IN v5.0", "BotDetect v2.1"],
    lastTrained: "30m ago",
  },
  {
    id: "voice", name: "Voice Assistant", icon: Mic, color: "#8B5CF6",
    status: "active", accuracy: 93.6, requestsPerDay: 78000, latencyMs: 890,
    desc: "Multi-lingual voice commands: translate, caption, hashtag, content ideas",
    models: ["Whisper-IN v2.0", "LLM-India v2.1"],
    lastTrained: "3h ago",
  },
];

const DAILY_REQUESTS = [
  { day: "Mon", feed: 2.4, translate: 1.6, spam: 2.9, moderation: 0.8, caption: 0.11, hashtag: 0.28, voice: 0.06 },
  { day: "Tue", feed: 2.6, translate: 1.8, spam: 3.1, moderation: 0.9, caption: 0.13, hashtag: 0.29, voice: 0.07 },
  { day: "Wed", feed: 2.5, translate: 1.7, spam: 2.8, moderation: 0.85, caption: 0.12, hashtag: 0.27, voice: 0.06 },
  { day: "Thu", feed: 2.9, translate: 2.0, spam: 3.4, moderation: 1.0, caption: 0.15, hashtag: 0.32, voice: 0.08 },
  { day: "Fri", feed: 3.1, translate: 2.2, spam: 3.7, moderation: 1.1, caption: 0.17, hashtag: 0.35, voice: 0.09 },
  { day: "Sat", feed: 3.4, translate: 2.4, spam: 4.0, moderation: 1.2, caption: 0.18, hashtag: 0.38, voice: 0.10 },
  { day: "Sun", feed: 2.8, translate: 1.9, spam: 3.2, moderation: 0.9, caption: 0.14, hashtag: 0.31, voice: 0.08 },
];

const MODERATION_QUEUE = [
  { id: "m1", content: "Profile photo — possible fake", type: "Image", flag: "Identity Fraud", confidence: 94, time: "2m ago", action: "pending" },
  { id: "m2", content: "Post: \"Buy followers cheap @telegramlink\"", type: "Text", flag: "Spam / Scam", confidence: 99, time: "4m ago", action: "pending" },
  { id: "m3", content: "Reel — contains abusive language (Hindi)", type: "Video", flag: "Hate Speech", confidence: 87, time: "7m ago", action: "pending" },
  { id: "m4", content: "DM bulk sender — 800 msgs in 1h", type: "Behavior", flag: "Bot Activity", confidence: 96, time: "9m ago", action: "pending" },
  { id: "m5", content: "Community post — misleading health claim", type: "Text", flag: "Misinformation", confidence: 82, time: "12m ago", action: "pending" },
  { id: "m6", content: "Story — watermarked competitor logo", type: "Image", flag: "Copyright", confidence: 91, time: "18m ago", action: "reviewed" },
  { id: "m7", content: "Comment flood — same text 200×", type: "Text", flag: "Spam", confidence: 100, time: "22m ago", action: "actioned" },
];

const SPAM_LOG = [
  { time: "2m ago", type: "Bot Account", count: 3, action: "Auto-Banned" },
  { time: "5m ago", type: "Scam DM Campaign", count: 847, action: "Auto-Blocked" },
  { time: "11m ago", type: "Comment Spam", count: 12400, action: "Auto-Deleted" },
  { time: "18m ago", type: "Fake Recharge Link", count: 56, action: "Auto-Removed" },
  { time: "29m ago", type: "Phishing Post", count: 4, action: "Auto-Banned" },
  { time: "41m ago", type: "Bulk Follow Bot", count: 2, action: "Auto-Banned" },
];

const TRANSLATION_LANGS = [
  { lang: "Hindi", pct: 34, requests: 652000, color: "#E91E8C" },
  { lang: "Tamil", pct: 16, requests: 307000, color: "#7B2FBE" },
  { lang: "Telugu", pct: 12, requests: 230000, color: "#3B82F6" },
  { lang: "Bengali", pct: 11, requests: 211000, color: "#10B981" },
  { lang: "Kannada", pct: 9, requests: 173000, color: "#F59E0B" },
  { lang: "Marathi", pct: 8, requests: 154000, color: "#EF4444" },
  { lang: "Others", pct: 10, requests: 192000, color: "#6B7280" },
];

const VOICE_QUERIES = [
  { query: "Translate to Hindi", count: 28400, pct: 36 },
  { query: "Generate caption", count: 19200, pct: 25 },
  { query: "Suggest hashtags", count: 13400, pct: 17 },
  { query: "Content ideas", count: 9800, pct: 12 },
  { query: "Check post safety", count: 4600, pct: 6 },
  { query: "Other commands", count: 2600, pct: 3 },
];

const ACCURACY_TREND = [
  { week: "W1", feed: 89.2, moderation: 95.1, spam: 97.4 },
  { week: "W2", feed: 90.1, moderation: 96.3, spam: 97.8 },
  { week: "W3", feed: 90.8, moderation: 96.9, spam: 97.9 },
  { week: "W4", feed: 91.4, moderation: 97.3, spam: 98.1 },
];

const FLAG_COLORS: Record<string, string> = {
  "Identity Fraud": "text-orange-600 bg-orange-50",
  "Spam / Scam": "text-red-600 bg-red-50",
  "Hate Speech": "text-red-700 bg-red-100",
  "Bot Activity": "text-purple-600 bg-purple-50",
  "Misinformation": "text-yellow-700 bg-yellow-50",
  "Copyright": "text-blue-600 bg-blue-50",
  "Spam": "text-red-500 bg-red-50",
};

export default function AIHubPage() {
  const [systemToggles, setSystemToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(AI_SYSTEMS.map((s) => [s.id, true]))
  );
  const [queueItems, setQueueItems] = useState(MODERATION_QUEUE);

  const totalRequests = AI_SYSTEMS.reduce((s, x) => s + x.requestsPerDay, 0);
  const avgAccuracy = (AI_SYSTEMS.reduce((s, x) => s + x.accuracy, 0) / AI_SYSTEMS.length).toFixed(1);
  const pendingModeration = queueItems.filter((q) => q.action === "pending").length;

  const handleModAction = (id: string, action: "approved" | "actioned") => {
    setQueueItems((prev) => prev.map((q) => q.id === id ? { ...q, action } : q));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" /> AI Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">7 AI systems powering Ridhi's intelligence layer</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500 text-white gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-pulse" />
            All 7 Systems Active
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total AI Requests / Day", value: (totalRequests / 1_000_000).toFixed(1) + "M", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Avg Accuracy", value: avgAccuracy + "%", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending Moderation", value: pendingModeration.toString(), icon: Flag, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Spam Blocked Today", value: "14,621", icon: Shield, color: "text-red-600", bg: "bg-red-50" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold mt-0.5">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="systems">
        <TabsList className="h-9">
          <TabsTrigger value="systems" className="text-xs">AI Systems</TabsTrigger>
          <TabsTrigger value="moderation" className="text-xs">Moderation Queue</TabsTrigger>
          <TabsTrigger value="spam" className="text-xs">Spam Detection</TabsTrigger>
          <TabsTrigger value="translation" className="text-xs">Translation</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs">Recommendations</TabsTrigger>
          <TabsTrigger value="voice" className="text-xs">Voice Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {AI_SYSTEMS.map((sys) => (
              <Card key={sys.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-1.5" style={{ backgroundColor: sys.color }} />
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: sys.color + "18" }}>
                          <sys.icon className="w-4 h-4" style={{ color: sys.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{sys.name}</p>
                          <p className="text-xs text-muted-foreground">Trained {sys.lastTrained}</p>
                        </div>
                      </div>
                      <Switch
                        checked={systemToggles[sys.id]}
                        onCheckedChange={(v) => setSystemToggles((p) => ({ ...p, [sys.id]: v }))}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{sys.desc}</p>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-semibold" style={{ color: sys.color }}>{sys.accuracy}%</span>
                      </div>
                      <Progress value={sys.accuracy} className="h-1.5" />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-muted-foreground">Requests / day</p>
                        <p className="font-semibold">{(sys.requestsPerDay / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Avg latency</p>
                        <p className="font-semibold">{sys.latencyMs}ms</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">Active</Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {sys.models.map((m) => (
                        <span key={m} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-mono">{m}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="py-4"><CardTitle className="text-sm">Accuracy Trend (4 Weeks)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={ACCURACY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis domain={[88, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Legend />
                  <Area type="monotone" dataKey="feed" name="Feed Recs" stroke="#7B2FBE" fill="#7B2FBE20" strokeWidth={2} />
                  <Area type="monotone" dataKey="moderation" name="Moderation" stroke="#10B981" fill="#10B98120" strokeWidth={2} />
                  <Area type="monotone" dataKey="spam" name="Spam Detection" stroke="#EF4444" fill="#EF444420" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="mt-4">
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">AI Moderation Queue</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200 text-xs">{pendingModeration} Pending</Badge>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Settings2 className="w-3 h-3" /> Rules</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left p-3 font-medium">Content</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">AI Flag</th>
                      <th className="text-left p-3 font-medium">Confidence</th>
                      <th className="text-left p-3 font-medium">Time</th>
                      <th className="text-left p-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueItems.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/20">
                        <td className="p-3 max-w-[220px]">
                          <p className="text-xs truncate font-medium">{item.content}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FLAG_COLORS[item.flag] ?? "text-gray-600 bg-gray-50"}`}>
                            {item.flag}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={item.confidence} className="h-1.5 w-14" />
                            <span className="text-xs font-semibold">{item.confidence}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{item.time}</td>
                        <td className="p-3">
                          {item.action === "pending" ? (
                            <div className="flex items-center gap-1.5">
                              <Button size="sm" className="h-6 text-xs px-2 bg-green-500 hover:bg-green-600" onClick={() => handleModAction(item.id, "approved")}>
                                <CheckCircle2 className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="destructive" className="h-6 text-xs px-2" onClick={() => handleModAction(item.id, "actioned")}>
                                <XCircle className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Badge variant={item.action === "approved" ? "outline" : "secondary"} className={`text-xs ${item.action === "approved" ? "text-green-600" : "text-muted-foreground"}`}>
                              {item.action === "approved" ? "Approved" : "Actioned"}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spam" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Spam Posts Removed", value: "8,421", delta: "+12% vs yesterday" },
              { label: "Bots Banned", value: "234", delta: "Auto-action" },
              { label: "Scam DMs Blocked", value: "5,847", delta: "Real-time" },
              { label: "False Positive Rate", value: "1.9%", delta: "Below threshold" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.delta}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="py-4"><CardTitle className="text-sm">Recent Auto-Actions</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left p-3 font-medium">Time</th>
                      <th className="text-left p-3 font-medium">Spam Type</th>
                      <th className="text-left p-3 font-medium">Items Affected</th>
                      <th className="text-left p-3 font-medium">AI Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SPAM_LOG.map((log, i) => (
                      <tr key={i} className="border-t hover:bg-muted/20">
                        <td className="p-3 text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3" />{log.time}</td>
                        <td className="p-3 text-xs font-medium">{log.type}</td>
                        <td className="p-3 text-xs font-bold">{log.count.toLocaleString()}</td>
                        <td className="p-3"><Badge variant="destructive" className="text-xs">{log.action}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translation" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm">Requests by Language</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={TRANSLATION_LANGS} dataKey="requests" nameKey="lang" cx="50%" cy="50%" outerRadius={85} label={({ lang, pct }) => `${lang} ${pct}%`} labelLine={false}>
                      {TRANSLATION_LANGS.map((l, i) => (
                        <Cell key={i} fill={l.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => v.toLocaleString() + " req"} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm">Language Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TRANSLATION_LANGS.map((l) => (
                    <div key={l.lang} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{l.lang}</span>
                        <span className="text-muted-foreground">{l.requests.toLocaleString()} req/day</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${l.pct}%`, backgroundColor: l.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm">Daily Translation Volume (Millions)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={DAILY_REQUESTS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => `${v}M req`} />
                  <Bar dataKey="translate" name="Translation" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "CTR Lift vs Chronological", value: "+38%", color: "text-green-600" },
              { label: "Avg Session Duration", value: "22 min", color: "text-purple-600" },
              { label: "Personalisation Score", value: "91.4%", color: "text-pink-600" },
              { label: "Cold Start Users Served", value: "12,400", color: "text-blue-600" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="py-4"><CardTitle className="text-sm">Daily Feed Recommendation Requests (Millions)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={DAILY_REQUESTS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => `${v}M req`} />
                  <Area type="monotone" dataKey="feed" name="Feed Recs" stroke="#7B2FBE" fill="#7B2FBE20" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4"><CardTitle className="text-sm">Recommendation Signals</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { signal: "Watch Time", weight: "28%", icon: "⏱️" },
                  { signal: "Likes / Reactions", weight: "18%", icon: "❤️" },
                  { signal: "Shares", weight: "16%", icon: "🔗" },
                  { signal: "Comments", weight: "14%", icon: "💬" },
                  { signal: "Profile Interests", weight: "12%", icon: "🎯" },
                  { signal: "Location / Language", weight: "12%", icon: "📍" },
                ].map((s) => (
                  <div key={s.signal} className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50">
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <p className="text-xs font-medium">{s.signal}</p>
                      <p className="text-lg font-bold text-primary">{s.weight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm">Top Voice Queries</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {VOICE_QUERIES.map((q) => (
                    <div key={q.query} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{q.query}</span>
                        <span className="text-muted-foreground">{q.count.toLocaleString()} / day</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-purple-500" style={{ width: `${q.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm">Voice Assistant Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Total Daily Queries", value: "78,000" },
                    { label: "Language Recognition Accuracy", value: "93.6%" },
                    { label: "Avg Response Time", value: "890ms" },
                    { label: "Supported Languages", value: "13" },
                    { label: "Intent Recognition Rate", value: "96.2%" },
                    { label: "Fallback Rate", value: "3.8%" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <span className="text-muted-foreground text-xs">{s.label}</span>
                      <span className="font-bold text-sm">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="py-4"><CardTitle className="text-sm">Supported Languages</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Kannada", "Malayalam", "Gujarati", "Punjabi", "Odia", "Assamese", "Urdu"].map((lang) => (
                  <span key={lang} className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">{lang}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { downloadCSV } from "@/lib/utils";
import {
  Terminal, Database, Server, Key, RefreshCw, Play,
  CheckCircle2, AlertTriangle, Clock, Copy, Trash2,
  Activity, Shield, Lock, Eye, EyeOff, HardDrive,
  Cpu, MemoryStick, Wifi, FileText, Download} from "lucide-react";

const envVars = [
  { key: "DATABASE_URL",              category: "Database",  secret: true,  value: "postgresql://ridhi:••••@db.ridhi.app:5432/ridhi_prod" },
  { key: "REDIS_URL",                 category: "Cache",     secret: true,  value: "redis://:••••@cache.ridhi.app:6379" },
  { key: "JWT_SECRET",                category: "Auth",      secret: true,  value: "••••••••••••••••••••••••••••••••" },
  { key: "MSG91_AUTH_KEY",            category: "SMS",       secret: true,  value: "••••••••••••••••••" },
  { key: "RAZORPAY_KEY_ID",           category: "Payments",  secret: false, value: "rzp_live_••••••••••••" },
  { key: "RAZORPAY_KEY_SECRET",       category: "Payments",  secret: true,  value: "••••••••••••••••••••••••••" },
  { key: "AWS_ACCESS_KEY_ID",         category: "Storage",   secret: false, value: "AKIA••••••••WXYZ" },
  { key: "AWS_SECRET_ACCESS_KEY",     category: "Storage",   secret: true,  value: "aws_sec_••••••••••••••••••" },
  { key: "AGORA_APP_ID",              category: "Media",     secret: false, value: "a9f3c••••••••••••••••••••3b2" },
  { key: "AGORA_APP_CERTIFICATE",     category: "Media",     secret: true,  value: "••••••••••••••••••••••••••••••••" },
  { key: "NODE_ENV",                  category: "App",       secret: false, value: "production" },
  { key: "PORT",                      category: "App",       secret: false, value: "5000" },
];

const serverMetrics = [
  { name: "API Server 1",   cpu: 34, ram: 58, disk: 41, net: "↑ 12 MB/s ↓ 89 MB/s", status: "healthy",  uptime: "43d 7h" },
  { name: "API Server 2",   cpu: 28, ram: 51, disk: 41, net: "↑ 9 MB/s ↓ 71 MB/s",  status: "healthy",  uptime: "43d 7h" },
  { name: "Media Worker",   cpu: 71, ram: 82, disk: 67, net: "↑ 44 MB/s ↓ 12 MB/s", status: "warning",  uptime: "12d 3h" },
  { name: "DB Primary",     cpu: 22, ram: 63, disk: 54, net: "↑ 3 MB/s ↓ 5 MB/s",   status: "healthy",  uptime: "43d 7h" },
  { name: "Redis Cache",    cpu: 8,  ram: 35, disk: 18, net: "↑ 1 MB/s ↓ 2 MB/s",   status: "healthy",  uptime: "43d 7h" },
];

const recentLogs = [
  { ts: "14:22:31", level: "INFO",  service: "api",    msg: "POST /api/auth/otp 200 — 42ms" },
  { ts: "14:22:29", level: "INFO",  service: "api",    msg: "GET /api/feed 200 — 67ms" },
  { ts: "14:22:28", level: "WARN",  service: "media",  msg: "Transcode queue depth > 50 (current: 63)" },
  { ts: "14:22:25", level: "INFO",  service: "api",    msg: "POST /api/coins/recharge 200 — 118ms" },
  { ts: "14:22:21", level: "INFO",  service: "cron",   msg: "Daily coin bonus distributed — 14,320 users" },
  { ts: "14:22:18", level: "ERROR", service: "media",  msg: "FFmpeg timeout for media_8k2p9 — retrying (1/3)" },
  { ts: "14:22:14", level: "INFO",  service: "api",    msg: "GET /api/live-streams 200 — 31ms" },
  { ts: "14:22:11", level: "INFO",  service: "db",     msg: "Autovacuum on users table completed — 0.3s" },
  { ts: "14:22:08", level: "INFO",  service: "api",    msg: "POST /api/match/swipe 200 — 23ms" },
  { ts: "14:22:05", level: "WARN",  service: "redis",  msg: "Cache miss rate spike: 18% (threshold: 15%)" },
  { ts: "14:22:01", level: "INFO",  service: "api",    msg: "GET /api/notifications 200 — 19ms" },
  { ts: "14:21:58", level: "INFO",  service: "cron",   msg: "PK battle result processed — winner: host_4829" },
];

const dbTables = [
  { name: "users",          rows: "1,240,893", size: "2.1 GB",  lastWrite: "< 1s ago"  },
  { name: "posts",          rows: "8,432,011", size: "14.3 GB", lastWrite: "< 1s ago"  },
  { name: "live_streams",   rows: "432,209",   size: "890 MB",  lastWrite: "2s ago"    },
  { name: "coin_txns",      rows: "3,901,442", size: "4.8 GB",  lastWrite: "3s ago"    },
  { name: "matches",        rows: "5,231,009", size: "3.2 GB",  lastWrite: "5s ago"    },
  { name: "chats",          rows: "22,441,882",size: "31.7 GB", lastWrite: "< 1s ago"  },
  { name: "notifications",  rows: "9,312,004", size: "7.1 GB",  lastWrite: "1s ago"    },
  { name: "agent_hosts",    rows: "22,891",    size: "18 MB",   lastWrite: "12s ago"   },
];

function LevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    INFO:  "bg-blue-100 text-blue-700",
    WARN:  "bg-yellow-100 text-yellow-700",
    ERROR: "bg-red-100 text-red-700",
    DEBUG: "bg-gray-100 text-gray-700",
  };
  return <Badge className={`${map[level] ?? ""} text-xs px-1.5 py-0 font-mono`}>{level}</Badge>;
}

function StatusDot({ status }: { status: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${status === "healthy" ? "bg-green-500" : status === "warning" ? "bg-yellow-500 animate-pulse" : "bg-red-500"}`} />
      <span className="text-xs capitalize">{status}</span>
    </span>
  );
}

export default function BackendAccess() {
  const [query, setQuery]         = useState("SELECT count(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours';");
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [revealed, setRevealed]   = useState<Set<number>>(new Set());
  const [logFilter, setLogFilter] = useState("all");

  function runQuery() {
    setQueryResult("count\n──────\n3,204\n\n(1 row) — 28 ms");
  }

  function toggleReveal(i: number) {
    setRevealed(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  }

  const filteredLogs = logFilter === "all" ? recentLogs : recentLogs.filter(l => l.level === logFilter.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("backend-access_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="w-6 h-6 text-purple-600" /> Backend Access
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Server metrics, environment variables, database console & logs</p>
        </div>
        <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 px-3 py-1">
          <Shield className="w-3.5 h-3.5" /> Super Admin Only
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Servers",    value: "5",      sub: "1 warning",         icon: Server,   color: "text-purple-600", bg: "bg-purple-50" },
          { label: "DB Size",           value: "64 GB",  sub: "+2.1 GB today",     icon: Database, color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "API Latency (p95)", value: "124ms",  sub: "↓ 8ms vs yesterday",icon: Activity, color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Error Rate",        value: "0.04%",  sub: "Last 1 hour",       icon: AlertTriangle, color: "text-pink-600", bg: "bg-pink-50"  },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex gap-3 items-start">
              <div className={`p-2.5 rounded-lg ${k.bg}`}><k.icon className={`w-4 h-4 ${k.color}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-xl font-bold">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="servers">
        <TabsList className="h-9">
          <TabsTrigger value="servers"  className="text-xs gap-1.5"><Server   className="w-3.5 h-3.5" />Servers</TabsTrigger>
          <TabsTrigger value="env"      className="text-xs gap-1.5"><Key      className="w-3.5 h-3.5" />Env Variables</TabsTrigger>
          <TabsTrigger value="db"       className="text-xs gap-1.5"><Database className="w-3.5 h-3.5" />DB Console</TabsTrigger>
          <TabsTrigger value="logs"     className="text-xs gap-1.5"><FileText className="w-3.5 h-3.5" />Live Logs</TabsTrigger>
        </TabsList>

        {/* ─── SERVERS ─── */}
        <TabsContent value="servers" className="mt-4 space-y-4">
          <div className="grid gap-4">
            {serverMetrics.map((s) => (
              <Card key={s.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">{s.name}</span>
                      <StatusDot status={s.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span><Clock className="w-3 h-3 inline mr-1" />Uptime: {s.uptime}</span>
                      <span><Wifi className="w-3 h-3 inline mr-1" />{s.net}</span>
                      <Button variant="outline" size="sm" className="h-6 text-xs gap-1"><RefreshCw className="w-3 h-3" />Restart</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "CPU", icon: Cpu,         val: s.cpu  },
                      { label: "RAM", icon: MemoryStick, val: s.ram  },
                      { label: "Disk",icon: HardDrive,   val: s.disk },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1 text-muted-foreground"><m.icon className="w-3 h-3" />{m.label}</span>
                          <span className={`font-medium ${m.val > 80 ? "text-red-600" : m.val > 60 ? "text-yellow-600" : "text-green-600"}`}>{m.val}%</span>
                        </div>
                        <Progress value={m.val} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── ENV VARS ─── */}
        <TabsContent value="env" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-purple-500" />Environment Variables</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><RefreshCw className="w-3.5 h-3.5" />Sync</Button>
                <Button size="sm" className="h-8 text-xs gap-1 bg-purple-600 hover:bg-purple-700"><Key className="w-3.5 h-3.5" />Add Variable</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    {["Key","Category","Value",""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {envVars.map((v, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs font-medium">{v.key}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{v.category}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {v.secret && !revealed.has(i) ? "••••••••••••••••••" : v.value}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {v.secret && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleReveal(i)}>
                              {revealed.has(i) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigator.clipboard.writeText(v.value)}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── DB CONSOLE ─── */}
        <TabsContent value="db" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Database className="w-4 h-4 text-purple-500" />Query Console</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">SQL Query</Label>
                  <textarea
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full h-32 text-xs border rounded-md p-3 font-mono bg-muted/30 resize-none focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <Button onClick={runQuery} size="sm" className="gap-1.5 bg-purple-600 hover:bg-purple-700">
                  <Play className="w-3.5 h-3.5" />Run Query
                </Button>
                {queryResult && (
                  <div className="mt-2 border rounded-md p-3 bg-muted/30 font-mono text-xs whitespace-pre text-green-700">
                    {queryResult}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><HardDrive className="w-4 h-4 text-purple-500" />Table Overview</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      {["Table","Rows","Size","Last Write"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dbTables.map((t) => (
                      <tr key={t.name} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-mono font-medium">{t.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{t.rows}</td>
                        <td className="px-3 py-2 text-muted-foreground">{t.size}</td>
                        <td className="px-3 py-2 text-green-600">{t.lastWrite}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── LIVE LOGS ─── */}
        <TabsContent value="logs" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="py-3 flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />Live Logs
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </CardTitle>
              <div className="flex gap-2">
                {["all","info","warn","error"].map(f => (
                  <Button
                    key={f}
                    variant={logFilter === f ? "default" : "outline"}
                    size="sm"
                    className={`h-7 text-xs capitalize ${logFilter === f ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                    onClick={() => setLogFilter(f)}
                  >
                    {f}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><RefreshCw className="w-3 h-3" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-gray-950 rounded-b-lg font-mono text-xs overflow-x-auto">
                {filteredLogs.map((log, i) => (
                  <div key={i} className={`flex items-start gap-3 px-4 py-2 border-b border-gray-800 ${log.level === "ERROR" ? "bg-red-950/30" : log.level === "WARN" ? "bg-yellow-950/20" : ""}`}>
                    <span className="text-gray-500 shrink-0">{log.ts}</span>
                    <LevelBadge level={log.level} />
                    <Badge variant="outline" className="text-xs border-gray-700 text-gray-400 shrink-0">{log.service}</Badge>
                    <span className={`${log.level === "ERROR" ? "text-red-400" : log.level === "WARN" ? "text-yellow-400" : "text-gray-300"}`}>{log.msg}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

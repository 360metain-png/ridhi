import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, Search, Download, RefreshCw, Filter, Users, ShieldCheck,
  Eye, Edit2, Trash2, CheckCircle, XCircle, UserCheck, UserX,
  Coins, IndianRupee, ShieldAlert, ScanFace, Star, Settings2,
  BarChart2, Clock, Calendar, AlertTriangle, Zap, TrendingUp,
  LogIn, LogOut, Phone, Crown, Key, Globe,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────
type ActionCategory = "content" | "users" | "finance" | "kyc" | "settings" | "auth" | "hosts" | "agents" | "system";

interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  category: ActionCategory;
  target: string;
  targetType: string;
  result: "success" | "failed" | "warning";
  ip: string;
  timestamp: string;
  details: string;
}

// ── Mock activity logs ─────────────────────────────────────────────────────
const AUDIT_LOGS: AuditLog[] = [
  { id:"l01", adminId:"a1", adminName:"Sneha Patel",   adminRole:"Content Admin",   action:"Removed flagged post",         category:"content",  target:"Post #84291",      targetType:"post",    result:"success", ip:"103.21.58.14",  timestamp:"Today 2:41 PM",    details:"Post contained nudity (confidence 94%). Permanently removed." },
  { id:"l02", adminId:"a4", adminName:"Vikash Singh",  adminRole:"Marketing Admin", action:"Activated promo banner",       category:"settings", target:"COINX2 banner",    targetType:"banner",  result:"success", ip:"103.21.58.41",  timestamp:"Today 2:38 PM",    details:"Weekend double-coin banner activated for 48h." },
  { id:"l03", adminId:"a2", adminName:"Rohit Kumar",   adminRole:"Finance Admin",   action:"Approved payout",             category:"finance",  target:"₹48,200 · Priya S", targetType:"payout",  result:"success", ip:"103.21.58.22",  timestamp:"Today 2:30 PM",    details:"Host payout for May batch approved and sent to Razorpay." },
  { id:"l04", adminId:"a1", adminName:"Sneha Patel",   adminRole:"Content Admin",   action:"Approved KYC",                category:"kyc",      target:"User #92841",      targetType:"user",    result:"success", ip:"103.21.58.14",  timestamp:"Today 2:15 PM",    details:"Aadhaar + selfie verified. User promoted to verified status." },
  { id:"l05", adminId:"a5", adminName:"Kavya Reddy",   adminRole:"Creator Admin",   action:"Upgraded host level",         category:"hosts",    target:"Rahul V. → L7",    targetType:"host",    result:"success", ip:"103.21.58.55",  timestamp:"Today 2:08 PM",    details:"Manual level upgrade approved after milestone review." },
  { id:"l06", adminId:"a1", adminName:"Sneha Patel",   adminRole:"Content Admin",   action:"Warned user",                 category:"users",    target:"User #71823",      targetType:"user",    result:"success", ip:"103.21.58.14",  timestamp:"Today 1:55 PM",    details:"1st warning issued for repeated offensive comments." },
  { id:"l07", adminId:"a2", adminName:"Rohit Kumar",   adminRole:"Finance Admin",   action:"Rejected payout — fraud flag",category:"finance",  target:"₹12,000 · Arjun N",targetType:"payout",  result:"warning", ip:"103.21.58.22",  timestamp:"Today 1:40 PM",    details:"Payout flagged by AI — same bank account as suspended user." },
  { id:"l08", adminId:"a3", adminName:"Priya Nair",    adminRole:"Support Admin",   action:"Login",                      category:"auth",     target:"Admin Panel",      targetType:"session", result:"success", ip:"103.21.58.33",  timestamp:"Today 1:30 PM",    details:"Login from Chrome on Windows." },
  { id:"l09", adminId:"a5", adminName:"Kavya Reddy",   adminRole:"Creator Admin",   action:"Suspended agent",            category:"agents",   target:"Agent A3 #441",    targetType:"agent",   result:"success", ip:"103.21.58.55",  timestamp:"Today 1:22 PM",    details:"Agent suspended for policy violation — fake host recruitment." },
  { id:"l10", adminId:"a1", adminName:"Sneha Patel",   adminRole:"Content Admin",   action:"Bulk-removed 14 spam posts", category:"content",  target:"14 posts",         targetType:"post",    result:"success", ip:"103.21.58.14",  timestamp:"Today 1:14 PM",    details:"Bulk action on spam cluster detected by AI moderation." },
  { id:"l11", adminId:"a4", adminName:"Vikash Singh",  adminRole:"Marketing Admin", action:"Created promo code",         category:"settings", target:"DIWALI200",        targetType:"promo",   result:"success", ip:"103.21.58.41",  timestamp:"Today 12:55 PM",   details:"Diwali 200 coin promo scheduled for Oct 20." },
  { id:"l12", adminId:"a2", adminName:"Rohit Kumar",   adminRole:"Finance Admin",   action:"Updated subscription price", category:"finance",  target:"Gold VIP → ₹249",  targetType:"plan",    result:"success", ip:"103.21.58.22",  timestamp:"Today 12:40 PM",   details:"Gold monthly plan price updated from ₹299 to ₹249." },
  { id:"l13", adminId:"a1", adminName:"Sneha Patel",   adminRole:"Content Admin",   action:"Rejected KYC",               category:"kyc",      target:"User #67410",      targetType:"user",    result:"failed",  ip:"103.21.58.14",  timestamp:"Today 12:20 PM",   details:"Aadhaar photo blurry — user asked to resubmit." },
  { id:"l14", adminId:"a5", adminName:"Kavya Reddy",   adminRole:"Creator Admin",   action:"Verified live stream",       category:"content",  target:"Stream #884",      targetType:"stream",  result:"success", ip:"103.21.58.55",  timestamp:"Today 12:05 PM",   details:"Live stream verified as safe to broadcast — no violations." },
  { id:"l15", adminId:"a3", adminName:"Priya Nair",    adminRole:"Support Admin",   action:"Banned user",                category:"users",    target:"User #55892",      targetType:"user",    result:"success", ip:"103.21.58.33",  timestamp:"Today 11:50 AM",   details:"Permanent ban for repeated sexual harassment reports (3rd offence)." },
  { id:"l16", adminId:"a4", adminName:"Vikash Singh",  adminRole:"Marketing Admin", action:"Paused ad campaign",         category:"settings", target:"Campaign #Ad219",  targetType:"ad",      result:"success", ip:"103.21.58.41",  timestamp:"Today 11:30 AM",   details:"Business ad campaign paused — creative violated guidelines." },
  { id:"l17", adminId:"a2", adminName:"Rohit Kumar",   adminRole:"Finance Admin",   action:"Deducted coins",             category:"finance",  target:"User #40912 −200", targetType:"user",    result:"success", ip:"103.21.58.22",  timestamp:"Today 11:10 AM",   details:"Coins deducted for chargeback fraud reversal." },
  { id:"l18", adminId:"a1", adminName:"Sneha Patel",   adminRole:"Content Admin",   action:"Logout",                     category:"auth",     target:"Admin Panel",      targetType:"session", result:"success", ip:"103.21.58.14",  timestamp:"Today 9:58 AM",    details:"Normal logout." },
  { id:"l19", adminId:"a1", adminName:"Sneha Patel",   adminRole:"Content Admin",   action:"Login",                      category:"auth",     target:"Admin Panel",      targetType:"session", result:"success", ip:"103.21.58.14",  timestamp:"Today 9:00 AM",    details:"Login from Chrome on MacOS." },
  { id:"l20", adminId:"a5", adminName:"Kavya Reddy",   adminRole:"Creator Admin",   action:"Rejected host upgrade",      category:"hosts",    target:"Host #29411",      targetType:"host",    result:"failed",  ip:"103.21.58.55",  timestamp:"Yesterday 6:10 PM","details":"Upgrade request rejected — earnings threshold not met." },
];

const activityByAdmin = [
  { name: "Sneha",   actions: 34 },
  { name: "Rohit",   actions: 18 },
  { name: "Kavya",   actions: 41 },
  { name: "Vikash",  actions: 22 },
  { name: "Priya",   actions: 8  },
];

const activityByHour = [
  { hour: "9AM",  actions: 12 },
  { hour: "10AM", actions: 28 },
  { hour: "11AM", actions: 34 },
  { hour: "12PM", actions: 41 },
  { hour: "1PM",  actions: 38 },
  { hour: "2PM",  actions: 46 },
  { hour: "3PM",  actions: 22 },
  { hour: "4PM",  actions: 18 },
  { hour: "5PM",  actions: 9  },
];

const CATEGORY_META: Record<ActionCategory, { label: string; color: string; bg: string; icon: React.ComponentType<{className?:string}> }> = {
  content:  { label: "Content",  color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   icon: ShieldAlert },
  users:    { label: "Users",    color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Users     },
  finance:  { label: "Finance",  color: "text-green-700",  bg: "bg-green-50 border-green-200", icon: IndianRupee },
  kyc:      { label: "KYC",      color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", icon: ScanFace  },
  settings: { label: "Settings", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: Settings2 },
  auth:     { label: "Auth",     color: "text-slate-700",  bg: "bg-slate-50 border-slate-200", icon: Key        },
  hosts:    { label: "Hosts",    color: "text-pink-700",   bg: "bg-pink-50 border-pink-200",   icon: Star       },
  agents:   { label: "Agents",   color: "text-cyan-700",   bg: "bg-cyan-50 border-cyan-200",   icon: Globe      },
  system:   { label: "System",   color: "text-red-700",    bg: "bg-red-50 border-red-200",     icon: Zap        },
};

const RESULT_STYLE = {
  success: "bg-green-100  text-green-700  border-green-200",
  failed:  "bg-red-100    text-red-700    border-red-200",
  warning: "bg-orange-100 text-orange-700 border-orange-200",
};

const ADMIN_COLORS: Record<string, string> = {
  "Sneha Patel":  "from-blue-500 to-indigo-500",
  "Rohit Kumar":  "from-green-500 to-teal-500",
  "Priya Nair":   "from-orange-500 to-red-400",
  "Vikash Singh": "from-purple-500 to-pink-500",
  "Kavya Reddy":  "from-pink-500 to-rose-500",
};

// ── Component ─────────────────────────────────────────────────────────────
export default function AdminActivityPage() {
  const [search, setSearch]         = useState("");
  const [filterAdmin, setFilterAdmin] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filtered = AUDIT_LOGS.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) ||
                        l.adminName.toLowerCase().includes(search.toLowerCase()) ||
                        l.target.toLowerCase().includes(search.toLowerCase());
    const matchAdmin = filterAdmin === "all" || l.adminId === filterAdmin;
    const matchCat   = filterCategory === "all" || l.category === filterCategory;
    return matchSearch && matchAdmin && matchCat;
  });

  const uniqueAdmins = Array.from(new Set(AUDIT_LOGS.map((l) => ({ id: l.adminId, name: l.adminName }))), (v) => v)
    .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Admin Activity Monitor
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Super Admin · Full audit trail of every action taken by every admin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 bg-purple-100 text-purple-700 border border-purple-200 text-xs">
            <ShieldCheck className="w-3 h-3" /> Super Admin Only
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Actions Today",  value: AUDIT_LOGS.length, icon: Activity,       color: "text-purple-600 bg-purple-50" },
          { label: "Active Admins",        value: uniqueAdmins.length,icon: Users,          color: "text-blue-600   bg-blue-50"   },
          { label: "Warnings / Rejections",value: AUDIT_LOGS.filter((l) => l.result !== "success").length, icon: AlertTriangle, color: "text-orange-600 bg-orange-50" },
          { label: "Auth Events",          value: AUDIT_LOGS.filter((l) => l.category === "auth").length,  icon: Key,           color: "text-green-600  bg-green-50"  },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="log">
        <TabsList>
          <TabsTrigger value="log"       className="gap-1.5"><Activity className="w-3.5 h-3.5" />Audit Log</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart2 className="w-3.5 h-3.5" />Analytics</TabsTrigger>
          <TabsTrigger value="admins"    className="gap-1.5"><Users className="w-3.5 h-3.5" />Per Admin</TabsTrigger>
        </TabsList>

        {/* ── Audit Log ── */}
        <TabsContent value="log" className="space-y-4 mt-4">

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search action, admin, target…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
            </div>
            <select value={filterAdmin} onChange={(e) => setFilterAdmin(e.target.value)}
              className="h-9 border rounded-md px-3 text-sm bg-background">
              <option value="all">All Admins</option>
              {uniqueAdmins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="h-9 border rounded-md px-3 text-sm bg-background">
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">{filtered.length} events</p>
          </div>

          {/* Log entries */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filtered.map((log) => {
                  const cat = CATEGORY_META[log.category];
                  const CatIcon = cat.icon;
                  const isExpanded = expandedLog === log.id;
                  return (
                    <div
                      key={log.id}
                      className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Admin avatar */}
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${ADMIN_COLORS[log.adminName] ?? "from-purple-500 to-pink-400"} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {log.adminName.split(" ").map((n) => n[0]).join("")}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{log.adminName}</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 h-4 text-muted-foreground">{log.adminRole}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-sm text-foreground">{log.action}</span>
                            <span className="text-xs text-muted-foreground">→ {log.target}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.timestamp}</span>
                            <span className="font-mono">{log.ip}</span>
                          </div>
                          {isExpanded && (
                            <div className="mt-2 p-2.5 rounded-lg bg-muted/60 text-xs text-muted-foreground border">
                              {log.details}
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-col items-end">
                          <Badge variant="outline" className={`text-[10px] px-1.5 h-4 gap-1 border ${cat.bg} ${cat.color}`}>
                            <CatIcon className="w-2.5 h-2.5" />{cat.label}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] px-1.5 h-4 border ${RESULT_STYLE[log.result]}`}>
                            {log.result}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Analytics ── */}
        <TabsContent value="analytics" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Actions by Hour (Today)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityByHour}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="actions" stroke="#7B2FBE" strokeWidth={2} dot={{ fill: "#7B2FBE", r: 4 }} name="Actions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-500" /> Actions by Admin (Today)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityByAdmin} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
                      <Tooltip />
                      <Bar dataKey="actions" name="Actions" fill="#E91E8C" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Actions by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(CATEGORY_META).map(([key, meta]) => {
                const count = AUDIT_LOGS.filter((l) => l.category === key).length;
                const pct   = Math.round(count / AUDIT_LOGS.length * 100);
                if (!count) return null;
                const Icon = meta.icon;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg border flex-shrink-0 ${meta.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{meta.label}</span>
                        <span className="text-muted-foreground">{count} actions · {pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Per Admin summary ── */}
        <TabsContent value="admins" className="space-y-3 mt-4">
          {uniqueAdmins.map((admin) => {
            const myLogs  = AUDIT_LOGS.filter((l) => l.adminId === admin.id);
            const success = myLogs.filter((l) => l.result === "success").length;
            const pct     = Math.round(success / myLogs.length * 100);
            const cats    = Array.from(new Set(myLogs.map((l) => l.category)));
            const latest  = myLogs[0];

            return (
              <Card key={admin.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ADMIN_COLORS[admin.name] ?? "from-purple-500 to-pink-400"} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {admin.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{admin.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {myLogs.length} actions today · Latest: {latest?.action} · {latest?.timestamp}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
                      <CheckCircle className="w-4 h-4" /> {pct}% success
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Progress value={pct} className="h-1.5 flex-1" />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cats.map((cat) => {
                      const m = CATEGORY_META[cat];
                      const Icon = m.icon;
                      const cnt = myLogs.filter((l) => l.category === cat).length;
                      return (
                        <span key={cat} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${m.bg} ${m.color}`}>
                          <Icon className="w-3 h-3" />{m.label} · {cnt}
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

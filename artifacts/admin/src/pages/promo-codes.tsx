import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCSV } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tag, Plus, Search, Copy, CheckCircle, XCircle, Clock, Trash2,
  Coins, Crown, Briefcase, Zap, Star, TrendingUp, Users, IndianRupee,
  ToggleLeft, ToggleRight, Eye, Edit2, AlertTriangle, Percent,
  Gift, Ticket, ShieldCheck, BarChart2, Calendar, RefreshCw, Download} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────
type CodeType =
  | "free_coins"
  | "coin_bonus_pct"
  | "subscription_discount"
  | "vip_upgrade"
  | "pitch_discount"
  | "creator_plan_discount"
  | "deal_post_discount";

type CodeStatus = "active" | "expired" | "paused" | "scheduled";

interface PromoCode {
  id: string;
  code: string;
  type: CodeType;
  title: string;
  description: string;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  status: CodeStatus;
  targetAudience: string;
  createdBy: string;
  createdAt: string;
  totalSavings: number;
}

// ── Static data ─────────────────────────────────────────────────────────────
const CODE_TYPE_META: Record<CodeType, { label: string; icon: React.ComponentType<{className?:string}>; color: string; bg: string; unit: string }> = {
  free_coins:             { label: "Free Coins",             icon: Coins,      color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", unit: "coins" },
  coin_bonus_pct:         { label: "Coin Bonus %",           icon: Percent,    color: "text-orange-700", bg: "bg-orange-50 border-orange-200", unit: "%" },
  subscription_discount:  { label: "Subscription Discount",  icon: Crown,      color: "text-purple-700", bg: "bg-purple-50 border-purple-200", unit: "%" },
  vip_upgrade:            { label: "Free VIP Upgrade",       icon: Star,       color: "text-pink-700",   bg: "bg-pink-50 border-pink-200",     unit: "days" },
  pitch_discount:         { label: "Pitch Fee Discount",     icon: Briefcase,  color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     unit: "%" },
  creator_plan_discount:  { label: "Creator Plan Discount",  icon: TrendingUp, color: "text-green-700",  bg: "bg-green-50 border-green-200",   unit: "%" },
  deal_post_discount:     { label: "Deal Post Discount",     icon: Tag,        color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", unit: "%" },
};

const INITIAL_CODES: PromoCode[] = [
  {
    id: "p1", code: "RIDHI100", type: "free_coins", title: "Welcome Bonus",
    description: "New user welcome — 100 free coins on first recharge",
    value: 100, usageLimit: 50000, usedCount: 18420, perUserLimit: 1,
    validFrom: "2025-01-01", validUntil: "2025-12-31", status: "active",
    targetAudience: "New users", createdBy: "Arjun Mehta", createdAt: "2025-01-01",
    totalSavings: 184200, minPurchase: 49,
  },
  {
    id: "p2", code: "VIP50", type: "subscription_discount", title: "VIP 50% Off",
    description: "50% off on Silver & Gold VIP plans — limited time",
    value: 50, maxDiscount: 500, usageLimit: 5000, usedCount: 3210, perUserLimit: 1,
    validFrom: "2025-05-01", validUntil: "2025-05-31", status: "active",
    targetAudience: "All users", createdBy: "Arjun Mehta", createdAt: "2025-04-28",
    totalSavings: 961500,
  },
  {
    id: "p3", code: "CREATOR30", type: "creator_plan_discount", title: "Creator Plan Launch Offer",
    description: "30% off on Basic & Pro Creator plans",
    value: 30, usageLimit: 2000, usedCount: 872, perUserLimit: 1,
    validFrom: "2025-04-15", validUntil: "2025-06-15", status: "active",
    targetAudience: "Creators & hosts", createdBy: "Arjun Mehta", createdAt: "2025-04-14",
    totalSavings: 226720,
  },
  {
    id: "p4", code: "PITCH25", type: "pitch_discount", title: "Creator Deals Launch",
    description: "25% off on pitch fee (75 coins instead of 100)",
    value: 25, usageLimit: 10000, usedCount: 10000, perUserLimit: 3,
    validFrom: "2025-03-01", validUntil: "2025-03-31", status: "expired",
    targetAudience: "All creators", createdBy: "Arjun Mehta", createdAt: "2025-02-28",
    totalSavings: 250000,
  },
  {
    id: "p5", code: "DIWALI200", type: "free_coins", title: "Diwali Special",
    description: "200 free coins for Diwali — all users",
    value: 200, usageLimit: 100000, usedCount: 0, perUserLimit: 1,
    validFrom: "2025-10-20", validUntil: "2025-10-25", status: "scheduled",
    targetAudience: "All users", createdBy: "Arjun Mehta", createdAt: "2025-05-10",
    totalSavings: 0,
  },
  {
    id: "p6", code: "BRAND25", type: "deal_post_discount", title: "Brand Onboarding Offer",
    description: "25% off on brand deal posting — new brands only",
    value: 25, usageLimit: 3000, usedCount: 640, perUserLimit: 2,
    validFrom: "2025-05-01", validUntil: "2025-07-31", status: "paused",
    targetAudience: "New brands", createdBy: "Arjun Mehta", createdAt: "2025-04-30",
    totalSavings: 19200,
  },
  {
    id: "p7", code: "COINX2", type: "coin_bonus_pct", title: "Double Coins Weekend",
    description: "100% bonus coins on any recharge pack",
    value: 100, usageLimit: 20000, usedCount: 8940, perUserLimit: 1,
    validFrom: "2025-05-16", validUntil: "2025-05-18", status: "active",
    targetAudience: "All users", createdBy: "Arjun Mehta", createdAt: "2025-05-14",
    totalSavings: 4470000, minPurchase: 99,
  },
  {
    id: "p8", code: "DEAL500", type: "deal_post_discount", title: "Brand Onboarding Offer",
    description: "50% off on deal posting — new brands only",
    value: 50, usageLimit: 1000, usedCount: 184, perUserLimit: 1,
    validFrom: "2025-04-01", validUntil: "2025-06-30", status: "active",
    targetAudience: "New brands", createdBy: "Arjun Mehta", createdAt: "2025-03-31",
    totalSavings: 92000,
  },
];

const redemptionData = [
  { date: "May 13", redemptions: 420, savings: 168000 },
  { date: "May 14", redemptions: 680, savings: 272000 },
  { date: "May 15", redemptions: 1240, savings: 496000 },
  { date: "May 16", redemptions: 2180, savings: 872000 },
  { date: "May 17", redemptions: 1860, savings: 744000 },
  { date: "May 18", redemptions: 1540, savings: 616000 },
  { date: "May 19", redemptions: 920, savings: 368000 },
];

const typeBreakdownData = [
  { type: "Free Coins",    count: 18420 + 0   },
  { type: "Coin Bonus",    count: 8940        },
  { type: "VIP Disc.",     count: 3210        },
  { type: "Creator Plan",  count: 872         },
  { type: "Pitch Fee",     count: 10000       },
  { type: "Deal Post",     count: 184         },
  { type: "Brand Deal",    count: 640         },
];

const STATUS_STYLE: Record<CodeStatus, string> = {
  active:    "bg-green-100 text-green-700 border-green-200",
  expired:   "bg-muted text-muted-foreground",
  paused:    "bg-orange-100 text-orange-700 border-orange-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
};
const STATUS_ICON: Record<CodeStatus, React.ComponentType<{className?:string}>> = {
  active:    CheckCircle,
  expired:   XCircle,
  paused:    AlertTriangle,
  scheduled: Clock,
};

// ── Blank form ───────────────────────────────────────────────────────────────
const BLANK: Omit<PromoCode, "id" | "usedCount" | "createdAt" | "createdBy" | "totalSavings"> = {
  code: "", type: "free_coins", title: "", description: "",
  value: 100, usageLimit: 1000, perUserLimit: 1,
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  status: "active", targetAudience: "All users",
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function PromoCodesPage() {
  const [codes, setCodes]         = useState<PromoCode[]>(INITIAL_CODES);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copied, setCopied]       = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState(BLANK);

  const filtered = codes.filter((c) => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase()) ||
                        c.title.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "all" || c.type === typeFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalRedemptions = codes.reduce((s, c) => s + c.usedCount, 0);
  const totalSavings     = codes.reduce((s, c) => s + c.totalSavings, 0);
  const activeCodes      = codes.filter((c) => c.status === "active").length;
  const avgUsagePct      = Math.round(
    codes.filter((c) => c.usageLimit > 0)
         .reduce((s, c) => s + c.usedCount / c.usageLimit * 100, 0) /
    codes.filter((c) => c.usageLimit > 0).length
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleStatus = (id: string) =>
    setCodes((prev) => prev.map((c) =>
      c.id === id
        ? { ...c, status: c.status === "active" ? "paused" : "active" }
        : c
    ));

  const deleteCode = (id: string) =>
    setCodes((prev) => prev.filter((c) => c.id !== id));

  const openCreate = () => {
    setEditId(null);
    setForm(BLANK);
    setShowCreate(true);
  };

  const openEdit = (c: PromoCode) => {
    setEditId(c.id);
    setForm({
      code: c.code, type: c.type, title: c.title, description: c.description,
      value: c.value, usageLimit: c.usageLimit, perUserLimit: c.perUserLimit,
      validFrom: c.validFrom, validUntil: c.validUntil,
      status: c.status, targetAudience: c.targetAudience,
      minPurchase: c.minPurchase, maxDiscount: c.maxDiscount,
    });
    setShowCreate(true);
  };

  const saveCode = () => {
    if (!form.code || !form.title) return;
    if (editId) {
      setCodes((prev) => prev.map((c) =>
        c.id === editId ? { ...c, ...form } : c
      ));
    } else {
      const newCode: PromoCode = {
        ...form,
        id: `p${Date.now()}`,
        usedCount: 0,
        totalSavings: 0,
        createdBy: "Arjun Mehta",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setCodes((prev) => [newCode, ...prev]);
    }
    setShowCreate(false);
  };

  const meta = (type: CodeType) => CODE_TYPE_META[type];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("promo-codes_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Promo & Offer Codes
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Super Admin exclusive · Create, manage and track all promotional codes across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 bg-purple-100 text-purple-700 border border-purple-200 text-xs">
            <ShieldCheck className="w-3 h-3" /> Super Admin Only
          </Badge>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Create Code
          </Button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Promo Codes", value: activeCodes, icon: Tag,          color: "text-green-600 bg-green-50",  sub: `of ${codes.length} total` },
          { label: "Total Redemptions",  value: totalRedemptions.toLocaleString(), icon: Users,      color: "text-blue-600 bg-blue-50",    sub: "all time" },
          { label: "Total User Savings", value: "₹" + (totalSavings / 100000).toFixed(1) + "L", icon: Gift, color: "text-pink-600 bg-pink-50", sub: "value given out" },
          { label: "Avg. Usage Fill",    value: avgUsagePct + "%",               icon: BarChart2,   color: "text-orange-600 bg-orange-50", sub: "usage limit filled" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-[11px] text-muted-foreground/70">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="codes">
        <TabsList>
          <TabsTrigger value="codes" className="gap-1.5"><Ticket className="w-3.5 h-3.5" />All Codes</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart2 className="w-3.5 h-3.5" />Analytics</TabsTrigger>
        </TabsList>

        {/* ── Codes Tab ── */}
        <TabsContent value="codes" className="space-y-4 mt-4">

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search code or title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 border rounded-md px-3 text-sm bg-background"
            >
              <option value="all">All Types</option>
              {Object.entries(CODE_TYPE_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 border rounded-md px-3 text-sm bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Code cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c) => {
              const m = meta(c.type);
              const Icon = m.icon;
              const SIcon = STATUS_ICON[c.status];
              const usagePct = Math.min(100, Math.round(c.usedCount / c.usageLimit * 100));

              return (
                <Card key={c.id} className={`border-l-4 ${c.status === "expired" ? "opacity-60" : ""}`}
                  style={{ borderLeftColor: c.status === "active" ? "#22C55E" : c.status === "paused" ? "#F97316" : c.status === "scheduled" ? "#3B82F6" : "#9CA3AF" }}>
                  <CardContent className="p-4 space-y-3">

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${m.bg}`}>
                          <Icon className={`w-4 h-4 ${m.color}`} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge variant="outline" className={`text-[10px] px-2 h-5 gap-1 border ${STATUS_STYLE[c.status]}`}>
                          <SIcon className="w-2.5 h-2.5" />{c.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Code chip + value */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                        <span className="font-mono font-bold text-sm tracking-widest">{c.code}</span>
                        <button
                          onClick={() => copyCode(c.code)}
                          className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                        >
                          {copied === c.code ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg border ${m.bg} ${m.color}`}>
                        {c.type === "free_coins" ? <Coins className="w-3.5 h-3.5" /> : <Percent className="w-3.5 h-3.5" />}
                        {c.value}{m.unit === "%" ? "% off" : c.type === "free_coins" ? " free coins" : ` ${m.unit}`}
                      </div>
                      <Badge variant="outline" className={`text-[10px] px-2 h-5 border ${m.bg} ${m.color}`}>{m.label}</Badge>
                    </div>

                    {/* Usage bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Usage: {c.usedCount.toLocaleString()} / {c.usageLimit.toLocaleString()}</span>
                        <span className="font-semibold">{usagePct}%</span>
                      </div>
                      <Progress value={usagePct} className="h-1.5" />
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.validFrom} → {c.validUntil}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.targetAudience}</span>
                      {c.minPurchase && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />Min ₹{c.minPurchase}</span>}
                      <span className="flex items-center gap-1"><Gift className="w-3 h-3" />Savings: ₹{c.totalSavings.toLocaleString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t">
                      <Button variant="outline" size="sm" className="h-7 gap-1 text-xs flex-1" onClick={() => openEdit(c)}>
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                      {c.status !== "expired" && (
                        <Button
                          variant="outline" size="sm"
                          className={`h-7 gap-1 text-xs flex-1 ${c.status === "active" ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "text-green-600 border-green-200 hover:bg-green-50"}`}
                          onClick={() => toggleStatus(c.id)}
                        >
                          {c.status === "active"
                            ? <><ToggleRight className="w-3 h-3" />Pause</>
                            : <><ToggleLeft className="w-3 h-3" />Activate</>}
                        </Button>
                      )}
                      <Button
                        variant="outline" size="sm"
                        className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => deleteCode(c.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-16 text-muted-foreground">
                <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No codes match your filters</p>
                <p className="text-sm">Try adjusting the search or filters above</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Analytics Tab ── */}
        <TabsContent value="analytics" className="space-y-5 mt-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Redemptions over time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Daily Redemptions (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={redemptionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="redemptions" stroke="#7B2FBE" strokeWidth={2} dot={{ fill: "#7B2FBE", r: 4 }} name="Redemptions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Savings over time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-500" /> Daily User Savings (₹)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={redemptionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                      <Bar dataKey="savings" name="User Savings" fill="#E91E8C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Type breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Redemptions by Code Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeBreakdownData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="count" name="Redemptions" fill="#7B2FBE" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top performing codes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Top Performing Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left p-4 pb-3">Code</th>
                    <th className="text-left pb-3">Type</th>
                    <th className="text-right pb-3">Redemptions</th>
                    <th className="text-right pb-3">Usage %</th>
                    <th className="text-right pb-3">Total Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...codes]
                    .sort((a, b) => b.usedCount - a.usedCount)
                    .slice(0, 6)
                    .map((c) => {
                      const m = meta(c.type);
                      const Icon = m.icon;
                      return (
                        <tr key={c.id} className="hover:bg-muted/50">
                          <td className="p-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg border ${m.bg}`}><Icon className={`w-3.5 h-3.5 ${m.color}`} /></div>
                              <div>
                                <p className="font-mono font-bold text-sm">{c.code}</p>
                                <p className="text-xs text-muted-foreground">{c.title}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline" className={`text-[10px] px-2 border ${m.bg} ${m.color}`}>{m.label}</Badge>
                          </td>
                          <td className="py-3 text-right font-semibold">{c.usedCount.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress value={Math.min(100, c.usedCount / c.usageLimit * 100)} className="w-16 h-1.5" />
                              <span className="text-xs">{Math.min(100, Math.round(c.usedCount / c.usageLimit * 100))}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-right font-semibold text-green-700">₹{c.totalSavings.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              {editId ? "Edit Promo Code" : "Create New Promo Code"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">

            {/* Code & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Code *</Label>
                <Input
                  placeholder="e.g. RIDHI50"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as CodeType }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CODE_TYPE_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title *</Label>
              <Input
                placeholder="e.g. Welcome Bonus"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</Label>
              <Input
                placeholder="Brief description shown to users"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Value + Audience */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Value ({CODE_TYPE_META[form.type].unit}) *
                </Label>
                <Input
                  type="number" min={1}
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Target Audience</Label>
                <Input
                  placeholder="All users"
                  value={form.targetAudience}
                  onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))}
                />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Usage Limit</Label>
                <Input
                  type="number" min={1}
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Per-User Limit</Label>
                <Input
                  type="number" min={1}
                  value={form.perUserLimit}
                  onChange={(e) => setForm((f) => ({ ...f, perUserLimit: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Min purchase / Max discount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Min Purchase (₹)</Label>
                <Input
                  type="number" min={0} placeholder="0 = no minimum"
                  value={form.minPurchase ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, minPurchase: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Max Discount (₹)</Label>
                <Input
                  type="number" min={0} placeholder="0 = unlimited"
                  value={form.maxDiscount ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valid From</Label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valid Until</Label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as CodeStatus }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active — live now</SelectItem>
                  <SelectItem value="scheduled">Scheduled — goes live on Valid From date</SelectItem>
                  <SelectItem value="paused">Paused — temporarily disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview chip */}
            {form.code && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                <div className={`p-2 rounded-lg border ${CODE_TYPE_META[form.type].bg}`}>
                  {(() => { const Icon = CODE_TYPE_META[form.type].icon; return <Icon className={`w-4 h-4 ${CODE_TYPE_META[form.type].color}`} />; })()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preview</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{form.code}</span>
                    <span className="text-xs">—</span>
                    <span className="text-sm font-semibold">
                      {form.type === "free_coins" ? `${form.value} free coins` : `${form.value}${CODE_TYPE_META[form.type].unit} off`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={saveCode}
              disabled={!form.code || !form.title}
              className="bg-gradient-to-r from-purple-600 to-pink-500 border-0 text-white"
            >
              {editId ? "Save Changes" : "Create Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

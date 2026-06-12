import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadCSV } from "@/lib/utils";
import {
  Users, IndianRupee, TrendingUp, Crown, Star, Zap, Video,
  Shield, Award, Layers, CheckCircle, XCircle, Search,
  BarChart3, RefreshCw, AlertCircle, ChevronUp, Cpu, Download} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type VIPTier    = "free" | "silver" | "gold" | "platinum" | "diamond";
type CreatorTier = "basic" | "pro" | "elite";
type BillingPeriod = "weekly" | "monthly" | "yearly";
type SubStatus  = "active" | "cancelled" | "expired" | "trial";

interface VIPSubscriber {
  id: string;
  name: string;
  city: string;
  tier: VIPTier;
  billing: BillingPeriod;
  amount: number;
  since: string;
  renewsIn: string;
  status: SubStatus;
  bonusCoinsGiven: number;
}

interface CreatorSubscriber {
  id: string;
  name: string;
  city: string;
  tier: CreatorTier;
  amount: number;
  since: string;
  renewsIn: string;
  status: SubStatus;
  followers: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const VIP_SUBS: VIPSubscriber[] = [
  { id: "v1",  name: "Priya Sharma",    city: "Mumbai",     tier: "diamond",  billing: "monthly", amount: 2499, since: "Jan 2025", renewsIn: "12 days", status: "active",    bonusCoinsGiven: 9000  },
  { id: "v2",  name: "Rohit Verma",     city: "Delhi",      tier: "platinum", billing: "yearly",  amount: 9999, since: "Mar 2025", renewsIn: "6 months",status: "active",    bonusCoinsGiven: 3000  },
  { id: "v3",  name: "Ananya Singh",    city: "Bangalore",  tier: "gold",     billing: "monthly", amount: 499,  since: "Feb 2025", renewsIn: "18 days", status: "active",    bonusCoinsGiven: 1050  },
  { id: "v4",  name: "Karan Mehta",     city: "Hyderabad",  tier: "gold",     billing: "weekly",  amount: 199,  since: "Apr 2025", renewsIn: "3 days",  status: "active",    bonusCoinsGiven: 700   },
  { id: "v5",  name: "Deepika Nair",    city: "Chennai",    tier: "silver",   billing: "yearly",  amount: 1999, since: "Dec 2024", renewsIn: "7 months",status: "active",    bonusCoinsGiven: 500   },
  { id: "v6",  name: "Arjun Reddy",     city: "Pune",       tier: "platinum", billing: "monthly", amount: 999,  since: "Apr 2025", renewsIn: "22 days", status: "active",    bonusCoinsGiven: 2000  },
  { id: "v7",  name: "Sneha Patel",     city: "Ahmedabad",  tier: "silver",   billing: "monthly", amount: 199,  since: "May 2025", renewsIn: "28 days", status: "active",    bonusCoinsGiven: 100   },
  { id: "v8",  name: "Vikram Kumar",    city: "Jaipur",     tier: "gold",     billing: "monthly", amount: 499,  since: "Mar 2025", renewsIn: "—",       status: "cancelled", bonusCoinsGiven: 1400  },
  { id: "v9",  name: "Meera Krishnan",  city: "Kochi",      tier: "diamond",  billing: "yearly",  amount: 24999,since: "Jan 2025", renewsIn: "8 months",status: "active",    bonusCoinsGiven: 18000 },
  { id: "v10", name: "Ravi Shankar",    city: "Kolkata",    tier: "platinum", billing: "yearly",  amount: 9999, since: "Feb 2025", renewsIn: "9 months",status: "active",    bonusCoinsGiven: 3000  },
];

const CREATOR_SUBS: CreatorSubscriber[] = [
  { id: "c1", name: "DJ Aryan",       city: "Mumbai",    tier: "elite", amount: 4999, since: "Jan 2025", renewsIn: "8 days",  status: "active",    followers: 42000 },
  { id: "c2", name: "Komal Vlogs",    city: "Delhi",     tier: "pro",   amount: 1499, since: "Mar 2025", renewsIn: "14 days", status: "active",    followers: 18500 },
  { id: "c3", name: "Tech Tanvir",    city: "Hyderabad", tier: "pro",   amount: 1499, since: "Feb 2025", renewsIn: "21 days", status: "active",    followers: 9800  },
  { id: "c4", name: "Preethi Music",  city: "Chennai",   tier: "basic", amount: 499,  since: "Apr 2025", renewsIn: "25 days", status: "active",    followers: 3400  },
  { id: "c5", name: "Reel Rohan",     city: "Pune",      tier: "elite", amount: 4999, since: "Dec 2024", renewsIn: "—",       status: "cancelled", followers: 67000 },
  { id: "c6", name: "Fitness Falak",  city: "Bangalore", tier: "pro",   amount: 1499, since: "May 2025", renewsIn: "29 days", status: "trial",     followers: 5600  },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const VIP_META: Record<VIPTier, { label: string; color: string; bg: string; icon: typeof Crown; monthlyPrice: number; bonusCoins: number }> = {
  free:     { label: "Free",         color: "text-gray-600",    bg: "bg-gray-50 border-gray-200",       icon: Users,   monthlyPrice: 0,    bonusCoins: 0    },
  silver:   { label: "Silver VIP",   color: "text-gray-500",    bg: "bg-gray-50 border-gray-200",       icon: Shield,  monthlyPrice: 199,  bonusCoins: 100  },
  gold:     { label: "Gold VIP",     color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",     icon: Award,   monthlyPrice: 499,  bonusCoins: 350  },
  platinum: { label: "Platinum VIP", color: "text-purple-600",  bg: "bg-purple-50 border-purple-200",   icon: Layers,  monthlyPrice: 999,  bonusCoins: 1000 },
  diamond:  { label: "Diamond Elite",color: "text-pink-600",    bg: "bg-pink-50 border-pink-200",       icon: Crown,   monthlyPrice: 2499, bonusCoins: 3000 },
};

const CREATOR_META: Record<CreatorTier, { label: string; color: string; bg: string; monthlyPrice: number }> = {
  basic: { label: "Creator Basic", color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",     monthlyPrice: 499  },
  pro:   { label: "Creator Pro",   color: "text-purple-600", bg: "bg-purple-50 border-purple-200", monthlyPrice: 1499 },
  elite: { label: "Creator Elite", color: "text-pink-600",   bg: "bg-pink-50 border-pink-200",     monthlyPrice: 4999 },
};

const STATUS_META: Record<SubStatus, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: "text-green-700",  bg: "bg-green-50 border-green-200"    },
  cancelled: { label: "Cancelled", color: "text-red-700",    bg: "bg-red-50 border-red-200"        },
  expired:   { label: "Expired",   color: "text-gray-600",   bg: "bg-gray-50 border-gray-200"      },
  trial:     { label: "Trial",     color: "text-blue-700",   bg: "bg-blue-50 border-blue-200"      },
};

const TABS = ["Overview", "VIP Subscribers", "Creator Plans", "Plan Config", "Revenue"] as const;
type Tab = typeof TABS[number];

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ vip, creators }: { vip: VIPSubscriber[]; creators: CreatorSubscriber[] }) {
  const activeVIP     = vip.filter(s => s.status === "active");
  const activeCreator = creators.filter(s => s.status === "active");
  const vipMRR        = activeVIP.reduce((s, v) => s + (v.billing === "monthly" ? v.amount : v.billing === "weekly" ? v.amount * 4 : v.amount / 12), 0);
  const creatorMRR    = activeCreator.reduce((s, c) => s + c.amount, 0);
  const totalMRR      = vipMRR + creatorMRR;

  const tierCounts = (["silver", "gold", "platinum", "diamond"] as VIPTier[]).map((t) => ({
    tier: t, count: activeVIP.filter(v => v.tier === t).length, meta: VIP_META[t],
  }));

  const conversionFeatures = [
    { feature: "Priority Matching",   strength: "Extremely High", pct: 95 },
    { feature: "Ad-Free Experience",  strength: "Very High",      pct: 85 },
    { feature: "Profile Boost",       strength: "Very High",      pct: 80 },
    { feature: "HD Video Calls",      strength: "Very High",      pct: 78 },
    { feature: "VIP Badge",           strength: "High",           pct: 65 },
    { feature: "Ghost Mode",          strength: "High",           pct: 60 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active VIP Subscribers", value: activeVIP.length,     icon: Crown,        color: "text-pink-600",    bg: "bg-pink-50"   },
          { label: "Creator Subscribers",    value: activeCreator.length,  icon: Video,        color: "text-blue-600",    bg: "bg-blue-50"   },
          { label: "Total MRR",             value: `₹${Math.round(totalMRR).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Retention Rate",        value: "84%",                  icon: TrendingUp,   color: "text-purple-600",  bg: "bg-purple-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* VIP Tier Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Crown className="w-4 h-4 text-pink-500" /> VIP Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tierCounts.map(({ tier, count, meta }) => (
              <div key={tier}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <meta.icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    <span className="text-xs font-medium">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold">₹{meta.monthlyPrice.toLocaleString("en-IN")}/mo</span>
                    <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.max((count / Math.max(activeVIP.length, 1)) * 100, 5)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Conversion Strength */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> Best Features for Conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversionFeatures.map((f) => (
              <div key={f.feature}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{f.feature}</span>
                  <Badge className={`text-xs px-1.5 py-0 ${f.pct >= 80 ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
                    {f.strength}
                  </Badge>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Sources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" /> Revenue Sources — Primary & Secondary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Primary</p>
              {[
                { label: "Random Video Calls",  rank: 1, color: "bg-pink-500"   },
                { label: "Virtual Gifts",        rank: 2, color: "bg-purple-500" },
                { label: "VIP Subscriptions",    rank: 3, color: "bg-amber-500"  },
                { label: "Live Streaming",        rank: 4, color: "bg-blue-500"   },
                { label: "PK Battles",            rank: 5, color: "bg-green-500"  },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                  <span className={`w-5 h-5 rounded-full ${s.color} text-white text-xs flex items-center justify-center font-bold flex-shrink-0`}>{s.rank}</span>
                  <span className="text-xs text-foreground">{s.label}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Secondary</p>
              {[
                { label: "Gaming Arena",        rank: 1, color: "bg-cyan-500"    },
                { label: "Brand Marketplace",   rank: 2, color: "bg-orange-500"  },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                  <span className={`w-5 h-5 rounded-full ${s.color} text-white text-xs flex items-center justify-center font-bold flex-shrink-0`}>{s.rank}</span>
                  <span className="text-xs text-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── VIP Subscribers Tab ───────────────────────────────────────────────────────

function VIPSubscribersTab({ subscribers }: { subscribers: VIPSubscriber[] }) {
  const [search, setSearch]           = useState("");
  const [filterTier, setFilterTier]   = useState<"all" | VIPTier>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | SubStatus>("all");

  const filtered = subscribers.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase());
    const matchTier   = filterTier   === "all" || s.tier   === filterTier;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchTier && matchStatus;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-3 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search subscriber…" className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["all", "silver", "gold", "platinum", "diamond"] as const).map((t) => (
              <Button key={t} size="sm" variant={filterTier === t ? "default" : "outline"} className="h-7 text-xs capitalize" onClick={() => setFilterTier(t)}>{t}</Button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", "active", "cancelled", "trial"] as const).map((s) => (
              <Button key={s} size="sm" variant={filterStatus === s ? "default" : "outline"} className="h-7 text-xs capitalize" onClick={() => setFilterStatus(s)}>{s}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map((sub) => {
          const vm = VIP_META[sub.tier];
          const sm = STATUS_META[sub.status];
          return (
            <Card key={sub.id}>
              <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {sub.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">{sub.city} · Since {sub.since} · Renews: {sub.renewsIn}</p>
                </div>
                <Badge className={`text-xs border ${vm.bg} ${vm.color} flex-shrink-0`}>
                  {vm.label}
                </Badge>
                <Badge className="text-xs border border-muted bg-muted/50 text-muted-foreground capitalize flex-shrink-0">
                  {sub.billing}
                </Badge>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">₹{sub.amount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">+{sub.bonusCoinsGiven.toLocaleString()} coins given</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded-lg border font-medium flex-shrink-0 ${sm.bg} ${sm.color}`}>
                  {sm.label}
                </div>
                {sub.status === "active" && (
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0">
                    <XCircle className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No subscribers match the current filters.</CardContent></Card>
        )}
      </div>
    </div>
  );
}

// ── Creator Plans Tab ─────────────────────────────────────────────────────────

function CreatorPlansTab({ subscribers }: { subscribers: CreatorSubscriber[] }) {
  return (
    <div className="space-y-4">
      {(["elite", "pro", "basic"] as CreatorTier[]).map((tier) => {
        const meta = CREATOR_META[tier];
        const tierSubs = subscribers.filter(s => s.tier === tier);
        const activeSubs = tierSubs.filter(s => s.status === "active");
        return (
          <Card key={tier} className={`border-2 ${tier === "elite" ? "border-pink-200" : tier === "pro" ? "border-purple-200" : "border-blue-200"}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Video className={`w-4 h-4 ${meta.color}`} />
                  {meta.label}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">₹{meta.monthlyPrice.toLocaleString("en-IN")}/month</span>
                  <Badge className={`text-xs border ${meta.bg} ${meta.color}`}>{activeSubs.length} active</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tierSubs.length === 0 && (
                <p className="text-xs text-muted-foreground">No subscribers yet.</p>
              )}
              {tierSubs.map((s) => {
                const sm = STATUS_META[s.status];
                return (
                  <div key={s.id} className="flex items-center gap-3 py-2 border-b last:border-0 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {s.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.city} · {s.followers.toLocaleString()} followers · Since {s.since}</p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-lg border font-medium ${sm.bg} ${sm.color}`}>{sm.label}</div>
                    <p className="text-sm font-bold text-emerald-600 flex-shrink-0">₹{s.amount.toLocaleString("en-IN")}/mo</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Plan Config Tab ───────────────────────────────────────────────────────────

function PlanConfigTab() {
  return (
    <div className="space-y-5">
      {/* VIP Plans Pricing Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4 text-pink-500" /> VIP Plan Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Plan</th>
                  <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Weekly</th>
                  <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Monthly</th>
                  <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Yearly</th>
                  <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Bonus Coins/mo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { tier: "silver",   weekly: "₹99",  monthly: "₹199",   yearly: "₹1,999",  bonus: 100,  color: "text-gray-500"   },
                  { tier: "gold",     weekly: "₹199", monthly: "₹499",   yearly: "₹4,999",  bonus: 350,  color: "text-amber-600"  },
                  { tier: "platinum", weekly: "₹399", monthly: "₹999",   yearly: "₹9,999",  bonus: 1000, color: "text-purple-600" },
                  { tier: "diamond",  weekly: "—",    monthly: "₹2,499", yearly: "₹24,999", bonus: 3000, color: "text-pink-600"   },
                ].map((row, i) => (
                  <tr key={row.tier} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                    <td className="px-4 py-2.5 font-semibold capitalize">
                      <span className={row.color}>{row.tier === "diamond" ? "Diamond Elite" : row.tier.charAt(0).toUpperCase() + row.tier.slice(1) + " VIP"}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">{row.weekly}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{row.monthly}</td>
                    <td className="px-4 py-2.5 text-right">{row.yearly}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-green-600">+{row.bonus.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Creator Plans */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-500" /> Creator Subscription Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[
              {
                name: "Creator Basic", price: "₹499/month", color: "text-blue-600",
                features: ["Creator badge", "Live streaming access", "Basic analytics", "Gift tracking", "Basic creator dashboard"],
              },
              {
                name: "Creator Pro", price: "₹1,499/month", color: "text-purple-600",
                features: ["HD streaming", "PK battle access", "Advanced analytics", "Revenue insights", "Stream promotions", "Fan engagement tools", "Priority creator support"],
              },
              {
                name: "Creator Elite", price: "₹4,999/month", color: "text-pink-600",
                features: ["Homepage promotions", "Verified creator badge", "Dedicated manager", "VIP creator rooms", "Exclusive events", "Creator sponsorship access", "Featured placement"],
              },
            ].map((plan) => (
              <div key={plan.name} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${plan.color}`}>{plan.name}</span>
                  <span className="text-sm font-bold">{plan.price}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {plan.features.map((f) => (
                    <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Free Plan */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" /> Free Plan — Always Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Basic Profile", "Random Matches", "Standard Chat", "Limited Filters", "Watch Live Streams", "Join Communities", "Basic Gaming Access", "Join Audio Rooms", "Send Virtual Gifts"].map((f) => (
              <span key={f} className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{f}</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Revenue Tab ───────────────────────────────────────────────────────────────

function RevenueTab({ vip, creators }: { vip: VIPSubscriber[]; creators: CreatorSubscriber[] }) {
  const activeVIP  = vip.filter(s => s.status === "active");
  const activeCre  = creators.filter(s => s.status === "active");

  const vipMRR     = activeVIP.reduce((s, v) => s + (v.billing === "monthly" ? v.amount : v.billing === "weekly" ? v.amount * 4 : v.amount / 12), 0);
  const creatorMRR = activeCre.reduce((s, c) => s + c.amount, 0);
  const totalMRR   = vipMRR + creatorMRR;

  const tierRevenue = (["diamond", "platinum", "gold", "silver"] as VIPTier[]).map((t) => {
    const subs = activeVIP.filter(v => v.tier === t);
    const rev  = subs.reduce((s, v) => s + (v.billing === "monthly" ? v.amount : v.billing === "weekly" ? v.amount * 4 : v.amount / 12), 0);
    return { tier: t, meta: VIP_META[t], count: subs.length, rev };
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "VIP MRR",     value: `₹${Math.round(vipMRR).toLocaleString("en-IN")}`,     color: "text-pink-600",    bg: "bg-pink-50",    icon: Crown        },
          { label: "Creator MRR", value: `₹${Math.round(creatorMRR).toLocaleString("en-IN")}`, color: "text-blue-600",    bg: "bg-blue-50",    icon: Video        },
          { label: "Total MRR",   value: `₹${Math.round(totalMRR).toLocaleString("en-IN")}`,   color: "text-emerald-600", bg: "bg-emerald-50", icon: IndianRupee  },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">VIP Revenue by Tier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tierRevenue.map(({ tier, meta, count, rev }) => (
            <div key={tier}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <meta.icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  <span className="text-xs font-medium">{meta.label}</span>
                  <span className="text-xs text-muted-foreground">({count} subs)</span>
                </div>
                <span className="text-xs font-bold">₹{Math.round(rev).toLocaleString("en-IN")}/mo</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${totalMRR > 0 ? (rev / totalMRR) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Creator Revenue by Tier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["elite", "pro", "basic"] as CreatorTier[]).map((t) => {
            const subs = activeCre.filter(c => c.tier === t);
            const rev  = subs.reduce((s, c) => s + c.amount, 0);
            const meta = CREATOR_META[t];
            return (
              <div key={t}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{subs.length} subscribers</span>
                    <span className="text-xs font-bold">₹{rev.toLocaleString("en-IN")}/mo</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" style={{ width: `${creatorMRR > 0 ? (rev / creatorMRR) * 100 : 0}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Subscription Revenue Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { goal: "Increase retention",          icon: RefreshCw,    color: "text-blue-600",    bg: "bg-blue-50"   },
              { goal: "Improve recurring revenue",    icon: TrendingUp,   color: "text-green-600",   bg: "bg-green-50"  },
              { goal: "Reduce ad dependency",         icon: XCircle,      color: "text-red-600",     bg: "bg-red-50"    },
              { goal: "Create premium status competition", icon: Crown,   color: "text-pink-600",    bg: "bg-pink-50"   },
              { goal: "Increase coin spending",       icon: ChevronUp,    color: "text-amber-600",   bg: "bg-amber-50"  },
              { goal: "Improve creator monetization", icon: Video,        color: "text-purple-600",  bg: "bg-purple-50" },
            ].map((g) => (
              <div key={g.goal} className={`flex items-center gap-3 p-3 rounded-xl border ${g.bg}`}>
                <div className={`p-1.5 rounded-lg bg-white/60`}>
                  <g.icon className={`w-4 h-4 ${g.color}`} />
                </div>
                <span className="text-xs font-medium text-foreground">{g.goal}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const activeCount   = VIP_SUBS.filter(s => s.status === "active").length;
  const expiredCount  = VIP_SUBS.filter(s => s.status === "cancelled").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("subscriptions_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-pink-500" />
            Subscriptions
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            VIP user plans · Creator subscriptions · Billing management · Revenue tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> {activeCount} Active
          </div>
          {expiredCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {expiredCount} Cancelled
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview"          && <OverviewTab      vip={VIP_SUBS}         creators={CREATOR_SUBS} />}
      {activeTab === "VIP Subscribers"   && <VIPSubscribersTab subscribers={VIP_SUBS} />}
      {activeTab === "Creator Plans"     && <CreatorPlansTab   subscribers={CREATOR_SUBS} />}
      {activeTab === "Plan Config"       && <PlanConfigTab />}
      {activeTab === "Revenue"           && <RevenueTab        vip={VIP_SUBS}         creators={CREATOR_SUBS} />}
    </div>
  );
}

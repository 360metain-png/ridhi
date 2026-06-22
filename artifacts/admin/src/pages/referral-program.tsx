import { useState } from "react";
import { getAdminRole } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share2, Users, Coins, TrendingUp, Trophy, Search, Copy, CheckCircle,
  ArrowRight, ShieldCheck, Settings2, Gift, UserPlus, Star, Crown,
  AlertTriangle, Eye, Filter, Download, RefreshCw, Zap, Target,
  IndianRupee, BarChart2, Calendar, ChevronUp, ChevronDown, Layers,
  Lock, UserCheck, Phone, Clock, CheckSquare, XCircle, Flame,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, FunnelChart, Funnel, Cell,
  PieChart, Pie, LabelList,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────
type ReferralStatus = "verified" | "pending" | "rewarded" | "flagged";

interface TopReferrer {
  rank: number;
  id: string;
  name: string;
  city: string;
  referrals: number;
  verified: number;
  active: number;
  coinsEarned: number;
  conversionRate: number;
  joinDate: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  streak: number;
}

interface ReferralEvent {
  id: string;
  referrerId: string;
  referrerName: string;
  refereePhone: string;
  refereeName: string;
  status: ReferralStatus;
  coinsAwarded: number;
  timestamp: string;
  city: string;
  source: "link" | "code" | "whatsapp" | "instagram";
}

// ── Mock data ──────────────────────────────────────────────────────────────
const TOP_REFERRERS: TopReferrer[] = [
  { rank: 1, id: "u1", name: "Priya Sharma",   city: "Mumbai",    referrals: 284, verified: 241, active: 198, coinsEarned: 12050, conversionRate: 84.9, joinDate: "Jan 2025", tier: "platinum", streak: 42 },
  { rank: 2, id: "u2", name: "Rahul Verma",    city: "Delhi",     referrals: 196, verified: 159, active: 131, coinsEarned: 7950, conversionRate: 81.1, joinDate: "Feb 2025", tier: "platinum", streak: 28 },
  { rank: 3, id: "u3", name: "Ananya K.",       city: "Bangalore", referrals: 173, verified: 138, active: 112, coinsEarned: 6900, conversionRate: 79.8, joinDate: "Jan 2025", tier: "gold",     streak: 19 },
  { rank: 4, id: "u4", name: "Karan Malhotra", city: "Hyderabad", referrals: 142, verified: 110, active: 89,  coinsEarned: 5500, conversionRate: 77.5, joinDate: "Mar 2025", tier: "gold",     streak: 14 },
  { rank: 5, id: "u5", name: "Neha Gupta",     city: "Chennai",   referrals: 118, verified: 89,  active: 74,  coinsEarned: 4450, conversionRate: 75.4, joinDate: "Feb 2025", tier: "gold",     streak: 11 },
  { rank: 6, id: "u6", name: "Arjun Nair",     city: "Pune",      referrals: 94,  verified: 68,  active: 56,  coinsEarned: 3400, conversionRate: 72.3, joinDate: "Mar 2025", tier: "silver",   streak: 8  },
  { rank: 7, id: "u7", name: "Divya Pillai",   city: "Kolkata",   referrals: 76,  verified: 54,  active: 43,  coinsEarned: 2700, conversionRate: 71.1, joinDate: "Apr 2025", tier: "silver",   streak: 6  },
  { rank: 8, id: "u8", name: "Suresh Kumar",   city: "Jaipur",    referrals: 62,  verified: 41,  active: 33,  coinsEarned: 2050, conversionRate: 66.1, joinDate: "Apr 2025", tier: "silver",   streak: 5  },
  { rank: 9, id: "u9", name: "Meera Iyer",     city: "Cochin",    referrals: 51,  verified: 33,  active: 27,  coinsEarned: 1650, conversionRate: 64.7, joinDate: "May 2025", tier: "bronze",   streak: 3  },
  { rank: 10,id:"u10", name: "Vikash Singh",   city: "Lucknow",   referrals: 44,  verified: 28,  active: 22,  coinsEarned: 1400, conversionRate: 63.6, joinDate: "May 2025", tier: "bronze",   streak: 2  },
];

const RECENT_ACTIVITY: ReferralEvent[] = [
  { id: "e1",  referrerId: "u1", referrerName: "Priya Sharma",   refereePhone: "+91 98***1234", refereeName: "Sonal R.",     status: "rewarded", coinsAwarded: 50, timestamp: "2 min ago",  city: "Mumbai",    source: "whatsapp"  },
  { id: "e2",  referrerId: "u2", referrerName: "Rahul Verma",    refereePhone: "+91 97***5678", refereeName: "Manish P.",    status: "verified", coinsAwarded: 50, timestamp: "8 min ago",  city: "Delhi",     source: "link"      },
  { id: "e3",  referrerId: "u3", referrerName: "Ananya K.",      refereePhone: "+91 96***9012", refereeName: "Lakshmi V.",   status: "rewarded", coinsAwarded: 50, timestamp: "15 min ago", city: "Bangalore", source: "instagram" },
  { id: "e4",  referrerId: "u5", referrerName: "Neha Gupta",     refereePhone: "+91 99***3456", refereeName: "Ravi S.",      status: "pending",  coinsAwarded: 0,   timestamp: "31 min ago", city: "Chennai",   source: "code"      },
  { id: "e5",  referrerId: "u1", referrerName: "Priya Sharma",   refereePhone: "+91 91***7890", refereeName: "Tanya M.",     status: "flagged",  coinsAwarded: 0,   timestamp: "45 min ago", city: "Mumbai",    source: "link"      },
  { id: "e6",  referrerId: "u4", referrerName: "Karan Malhotra", refereePhone: "+91 92***2345", refereeName: "Ankit J.",     status: "rewarded", coinsAwarded: 50, timestamp: "1h ago",     city: "Hyderabad", source: "whatsapp"  },
  { id: "e7",  referrerId: "u6", referrerName: "Arjun Nair",     refereePhone: "+91 93***6789", refereeName: "Pooja D.",     status: "verified", coinsAwarded: 50, timestamp: "1h ago",     city: "Pune",      source: "link"      },
  { id: "e8",  referrerId: "u7", referrerName: "Divya Pillai",   refereePhone: "+91 94***1234", refereeName: "Sanjay K.",    status: "rewarded", coinsAwarded: 50, timestamp: "2h ago",     city: "Kolkata",   source: "instagram" },
];

const trendData = [
  { date: "May 13", referrals: 312,  verified: 248, rewarded: 210 },
  { date: "May 14", referrals: 428,  verified: 341, rewarded: 296 },
  { date: "May 15", referrals: 586,  verified: 461, rewarded: 398 },
  { date: "May 16", referrals: 742,  verified: 596, rewarded: 511 },
  { date: "May 17", referrals: 668,  verified: 531, rewarded: 464 },
  { date: "May 18", referrals: 814,  verified: 652, rewarded: 570 },
  { date: "May 19", referrals: 920,  verified: 738, rewarded: 644 },
  { date: "May 20", referrals: 1080, verified: 864, rewarded: 756 },
  { date: "May 21", referrals: 1240, verified: 994, rewarded: 868 },
];

const cumulativeData = [
  { date: "Jan", total: 2800  },
  { date: "Feb", total: 8400  },
  { date: "Mar", total: 18600 },
  { date: "Apr", total: 34200 },
  { date: "May", total: 62800 },
];

const sourceData = [
  { name: "WhatsApp",  value: 41, fill: "#25D366" },
  { name: "Link Share",value: 28, fill: "#7B2FBE" },
  { name: "Instagram", value: 19, fill: "#E91E8C" },
  { name: "Code",      value: 12, fill: "#F97316" },
];

const cityData = [
  { city: "Mumbai",    referrals: 14200 },
  { city: "Delhi",     referrals: 11800 },
  { city: "Bangalore", referrals: 9600  },
  { city: "Hyderabad", referrals: 7200  },
  { city: "Chennai",   referrals: 5800  },
  { city: "Pune",      referrals: 4400  },
  { city: "Kolkata",   referrals: 3900  },
  { city: "Jaipur",    referrals: 2800  },
];

// Funnel steps
const FUNNEL = [
  { step: "Link Shared",   count: 186400, pct: 100,  color: "#7B2FBE" },
  { step: "Link Clicked",  count: 124820, pct: 67,   color: "#9B4FDE" },
  { step: "Signed Up",     count: 82640,  pct: 44.3, color: "#B97FFF" },
  { step: "OTP Verified",  count: 64820,  pct: 34.8, color: "#E91E8C" },
  { step: "Active 7 Days", count: 52460,  pct: 28.1, color: "#F06292" },
];

// Tier config
const TIER_META = {
  bronze:   { label: "Bronze",   min: 1,   max: 49,  color: "text-orange-700",  bg: "bg-orange-50  border-orange-200" },
  silver:   { label: "Silver",   min: 50,  max: 149, color: "text-slate-600",   bg: "bg-slate-50   border-slate-200"  },
  gold:     { label: "Gold",     min: 150, max: 299, color: "text-yellow-700",  bg: "bg-yellow-50  border-yellow-200" },
  platinum: { label: "Platinum", min: 300, max: 9999, color: "text-purple-700", bg: "bg-purple-50  border-purple-200" },
};

const STATUS_STYLE: Record<ReferralStatus, string> = {
  rewarded: "bg-green-100  text-green-700  border-green-200",
  verified: "bg-blue-100   text-blue-700   border-blue-200",
  pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  flagged:  "bg-red-100    text-red-700    border-red-200",
};
const STATUS_ICON: Record<ReferralStatus, React.ComponentType<{className?:string}>> = {
  rewarded: CheckCircle,
  verified: UserCheck,
  pending:  Clock,
  flagged:  AlertTriangle,
};
const SOURCE_ICON: Record<string, string> = {
  whatsapp:  "💬",
  link:      "🔗",
  instagram: "📸",
  code:      "🎟️",
};

// ── Main ──────────────────────────────────────────────────────────────────
export default function ReferralProgramPage() {
  const [search, setSearch]       = useState("");
  const [copied, setCopied]       = useState(false);
  const [programOn, setProgramOn] = useState(true);
  const [referrerBonus, setReferrerBonus] = useState(50);
  const [refereeBonus, setRefereeBonus]   = useState(50);
  const [tierBonus, setTierBonus]         = useState(true);
  const [fraudGuard, setFraudGuard]       = useState(true);
  const [minActivity, setMinActivity]     = useState(7);
  const [sortBy, setSortBy] = useState<"referrals"|"coins"|"conversion">("referrals");
  const [sortDir, setSortDir] = useState<"desc"|"asc">("desc");

  const isSA = (getAdminRole() ?? "") === "super_admin";

  const sortedReferrers = [...TOP_REFERRERS].sort((a, b) => {
    const va = sortBy === "referrals" ? a.referrals : sortBy === "coins" ? a.coinsEarned : a.conversionRate;
    const vb = sortBy === "referrals" ? b.referrals : sortBy === "coins" ? b.coinsEarned : b.conversionRate;
    return sortDir === "desc" ? vb - va : va - vb;
  });

  const filteredReferrers = sortedReferrers.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalReferrals   = TOP_REFERRERS.reduce((s, r) => s + r.referrals, 0);
  const totalVerified    = TOP_REFERRERS.reduce((s, r) => s + r.verified, 0);
  const totalCoins       = TOP_REFERRERS.reduce((s, r) => s + r.coinsEarned, 0);
  const avgConversion    = (TOP_REFERRERS.reduce((s, r) => s + r.conversionRate, 0) / TOP_REFERRERS.length).toFixed(1);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy !== col ? null :
    sortDir === "desc" ? <ChevronDown className="w-3 h-3 inline ml-0.5" /> : <ChevronUp className="w-3 h-3 inline ml-0.5" />;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="w-6 h-6 text-primary" />
            Referral Program
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track invites, conversions, rewards, and top referrers across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`gap-1.5 text-xs border ${programOn ? "bg-green-100 text-green-700 border-green-200" : "bg-muted text-muted-foreground"}`}>
            <span className={`w-2 h-2 rounded-full inline-block ${programOn ? "bg-green-500" : "bg-gray-400"}`} />
            Program {programOn ? "Active" : "Paused"}
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals",    value: "62,800+",           icon: Users,       color: "text-blue-600   bg-blue-50",   sub: "all time" },
          { label: "Verified & Active",  value: totalVerified.toLocaleString(), icon: UserCheck, color: "text-green-600  bg-green-50",  sub: `${avgConversion}% conversion` },
          { label: "Coins Paid Out",     value: (totalCoins / 1000).toFixed(0) + "K+",  icon: Coins,  color: "text-yellow-600 bg-yellow-50", sub: "to referrers" },
          { label: "Today's Referrals",  value: "1,240",             icon: TrendingUp,  color: "text-pink-600   bg-pink-50",   sub: "↑ 14.8% vs yesterday" },
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

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"   className="gap-1.5"><BarChart2 className="w-3.5 h-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1.5"><Trophy className="w-3.5 h-3.5" />Leaderboard</TabsTrigger>
          <TabsTrigger value="activity"   className="gap-1.5"><Zap className="w-3.5 h-3.5" />Live Activity</TabsTrigger>
          <TabsTrigger value="funnel"     className="gap-1.5"><Layers className="w-3.5 h-3.5" />Funnel</TabsTrigger>
          {isSA && (
            <TabsTrigger value="config" className="gap-1.5">
              <Settings2 className="w-3.5 h-3.5" />Config
              <Badge variant="outline" className="text-[9px] px-1 h-4 text-purple-600 border-purple-300 bg-purple-50 font-bold ml-1">SA</Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Trend area chart */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Daily Referral Trend (Last 9 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#7B2FBE" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7B2FBE" stopOpacity={0}   />
                        </linearGradient>
                        <linearGradient id="verGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#E91E8C" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#E91E8C" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="referrals" name="Referrals" stroke="#7B2FBE" fill="url(#refGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="verified"  name="Verified"  stroke="#22C55E" fill="url(#verGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="rewarded"  name="Rewarded"  stroke="#E91E8C" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#7B2FBE] inline-block rounded" />Referrals</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#22C55E] inline-block rounded" />Verified</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#E91E8C] inline-block rounded border-dashed" />Rewarded</span>
                </div>
              </CardContent>
            </Card>

            {/* Source breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Referral Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sourceData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={false}>
                        {sourceData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-1">
                  {sourceData.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.fill }} />
                      <span className="flex-1">{s.name}</span>
                      <span className="font-semibold">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cumulative growth */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" /> Cumulative Referrals (2025)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cumulativeData}>
                      <defs>
                        <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => v.toLocaleString()} />
                      <Area type="monotone" dataKey="total" name="Total Referrals" stroke="#22C55E" fill="url(#cumGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top cities */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-pink-500" /> Referrals by City
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={70} />
                      <Tooltip formatter={(v: number) => v.toLocaleString()} />
                      <Bar dataKey="referrals" name="Referrals" fill="#E91E8C" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reward structure summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-yellow-500" /> Current Reward Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <Coins className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-700">{referrerBonus}</p>
                  <p className="text-xs text-purple-600 font-medium">Coins per Referral</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">(referrer gets)</p>
                </div>
                <div className="p-4 rounded-xl bg-pink-50 border border-pink-200 text-center">
                  <Gift className="w-5 h-5 text-pink-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-pink-700">{refereeBonus}</p>
                  <p className="text-xs text-pink-600 font-medium">Welcome Coins</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">(new user gets)</p>
                </div>
                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
                  <CheckCircle className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-yellow-700">{minActivity}d</p>
                  <p className="text-xs text-yellow-600 font-medium">Min Activity</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">(before reward)</p>
                </div>
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
                  <Trophy className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">4</p>
                  <p className="text-xs text-green-600 font-medium">Referrer Tiers</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Bronze → Platinum</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Leaderboard ── */}
        <TabsContent value="leaderboard" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search referrer or city…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
            </div>
            <p className="text-sm text-muted-foreground ml-auto">{filteredReferrers.length} referrers</p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs bg-muted/30">
                      <th className="text-center p-4 pb-3 w-12">#</th>
                      <th className="text-left pb-3 p-4">Referrer</th>
                      <th className="text-center pb-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("referrals")}>
                        Referrals <SortIcon col="referrals" />
                      </th>
                      <th className="text-center pb-3">Verified</th>
                      <th className="text-center pb-3">Active 7d</th>
                      <th className="text-center pb-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("conversion")}>
                        Conv. Rate <SortIcon col="conversion" />
                      </th>
                      <th className="text-center pb-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort("coins")}>
                        Coins Earned <SortIcon col="coins" />
                      </th>
                      <th className="text-center pb-3">Tier</th>
                      <th className="text-center pb-3">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredReferrers.map((r) => {
                      const t = TIER_META[r.tier];
                      return (
                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 py-3 text-center">
                            {r.rank <= 3 ? (
                              <span className="text-lg">{r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"}</span>
                            ) : (
                              <span className="text-muted-foreground font-medium">{r.rank}</span>
                            )}
                          </td>
                          <td className="p-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {r.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{r.name}</p>
                                <p className="text-xs text-muted-foreground">{r.city} · since {r.joinDate}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center font-bold">{r.referrals}</td>
                          <td className="py-3 text-center text-green-700 font-semibold">{r.verified}</td>
                          <td className="py-3 text-center">{r.active}</td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Progress value={r.conversionRate} className="w-14 h-1.5" />
                              <span className="text-xs font-semibold">{r.conversionRate}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span className="flex items-center justify-center gap-1 text-yellow-700 font-bold">
                              <Coins className="w-3.5 h-3.5" />{r.coinsEarned.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <Badge variant="outline" className={`text-[10px] px-2 border ${t.bg} ${t.color} font-bold`}>
                              {t.label}
                            </Badge>
                          </td>
                          <td className="py-3 text-center">
                            <span className="flex items-center justify-center gap-1 text-xs">
                              <Flame className="w-3 h-3 text-orange-500" />{r.streak}d
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tier breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(TIER_META) as [keyof typeof TIER_META, typeof TIER_META[keyof typeof TIER_META]][]).map(([key, t]) => {
              const count = TOP_REFERRERS.filter((r) => r.tier === key).length;
              return (
                <Card key={key} className={`border ${t.bg}`}>
                  <CardContent className={`p-4 text-center`}>
                    <Trophy className={`w-5 h-5 mx-auto mb-1 ${t.color}`} />
                    <p className={`text-xl font-bold ${t.color}`}>{count}</p>
                    <p className={`text-xs font-semibold ${t.color}`}>{t.label} Referrers</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t.min}–{t.max === 9999 ? "∞" : t.max} referrals</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Live Activity ── */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Most recent referral events — auto-refreshed</p>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {RECENT_ACTIVITY.map((e) => {
                  const Icon = STATUS_ICON[e.status];
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                      {/* Source icon */}
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-lg flex-shrink-0">
                        {SOURCE_ICON[e.source]}
                      </div>
                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-sm">{e.referrerName}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{e.refereeName}</span>
                          <span className="text-xs text-muted-foreground">({e.refereePhone})</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span>{e.city}</span>
                          <span>via {e.source}</span>
                          <span>{e.timestamp}</span>
                        </div>
                      </div>
                      {/* Status + coins */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {e.coinsAwarded > 0 && (
                          <span className="text-xs font-bold text-yellow-700 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />+{e.coinsAwarded}
                          </span>
                        )}
                        <Badge variant="outline" className={`text-[10px] px-2 h-5 gap-1 border ${STATUS_STYLE[e.status]}`}>
                          <Icon className="w-2.5 h-2.5" />{e.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["rewarded","verified","pending","flagged"] as ReferralStatus[]).map((s) => {
              const Icon = STATUS_ICON[s];
              const count = RECENT_ACTIVITY.filter((e) => e.status === s).length;
              return (
                <Card key={s} className={`border ${STATUS_STYLE[s]}`}>
                  <CardContent className="p-3 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <div>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-xs capitalize font-medium">{s}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Funnel ── */}
        <TabsContent value="funnel" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Funnel bars */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Referral Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {FUNNEL.map((step, i) => (
                  <div key={step.step} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                          style={{ background: step.color }}>{i + 1}</span>
                        {step.step}
                      </span>
                      <span className="font-bold">{step.count.toLocaleString()} <span className="text-muted-foreground font-normal text-xs">({step.pct}%)</span></span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${step.pct}%`, background: step.color }} />
                    </div>
                    {i < FUNNEL.length - 1 && (
                      <p className="text-[11px] text-muted-foreground text-right">
                        Drop-off: {(100 - Math.round(FUNNEL[i + 1].pct / step.pct * 100)).toFixed(0)}%
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Funnel stats cards */}
            <div className="space-y-3">
              <Card className="border-l-4 border-l-[#7B2FBE]">
                <CardContent className="p-4 flex items-start gap-3">
                  <Share2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">186,400</p>
                    <p className="font-semibold text-sm">Links Shared</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Unique referral links & codes shared by users. Every share is a potential invite.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-[#22C55E]">
                <CardContent className="p-4 flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">82,640</p>
                    <p className="font-semibold text-sm">New Sign-ups</p>
                    <p className="text-xs text-muted-foreground mt-0.5">44.3% of clicked links resulted in a new account creation. Top channel: WhatsApp (41%).</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-[#E91E8C]">
                <CardContent className="p-4 flex items-start gap-3">
                  <CheckSquare className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">52,460</p>
                    <p className="font-semibold text-sm">Active after 7 Days</p>
                    <p className="text-xs text-muted-foreground mt-0.5">28.1% overall conversion. Users who complete the 7-day activity unlock rewards for referrers.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Super Admin Config ── */}
        {isSA && (
          <TabsContent value="config" className="space-y-5 mt-4">

            {/* SA banner */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
              <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-purple-800">Super Admin — Referral Program Settings</p>
                <p className="text-xs text-purple-600 mt-0.5">Changes take effect immediately. All reward amounts are in platform coins.</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm font-semibold text-purple-700">{programOn ? "Program On" : "Program Off"}</span>
                <Switch checked={programOn} onCheckedChange={setProgramOn} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Reward amounts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" /> Reward Amounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Referrer Reward (coins per verified referral)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={0} value={referrerBonus} onChange={(e) => setReferrerBonus(Number(e.target.value))} className="max-w-[120px]" />
                      <span className="text-sm text-muted-foreground">coins</span>
                      <Badge variant="outline" className="ml-auto text-xs bg-yellow-50 border-yellow-200 text-yellow-700">₹{(referrerBonus * 0.1).toFixed(0)} equiv.</Badge>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Welcome Bonus for Referee (new user)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={0} value={refereeBonus} onChange={(e) => setRefereeBonus(Number(e.target.value))} className="max-w-[120px]" />
                      <span className="text-sm text-muted-foreground">coins</span>
                      <Badge variant="outline" className="ml-auto text-xs bg-pink-50 border-pink-200 text-pink-700">₹{(refereeBonus * 0.1).toFixed(0)} equiv.</Badge>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Min. Activity Before Reward (days)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} max={30} value={minActivity} onChange={(e) => setMinActivity(Number(e.target.value))} className="max-w-[120px]" />
                      <span className="text-sm text-muted-foreground">days active</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Referee must be active for this many days before referrer receives the coin reward.</p>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-500 border-0 text-white w-full gap-2 mt-2">
                    <CheckCircle className="w-4 h-4" /> Save Reward Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Tier milestones */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" /> Referrer Tier Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Tier bonus multiplier active</p>
                    <Switch checked={tierBonus} onCheckedChange={setTierBonus} />
                  </div>
                  {(Object.entries(TIER_META) as [keyof typeof TIER_META, typeof TIER_META[keyof typeof TIER_META]][]).map(([key, t]) => {
                    const bonusMap = { bronze: "1×", silver: "1.25×", gold: "1.5×", platinum: "2×" };
                    return (
                      <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border ${t.bg}`}>
                        <Trophy className={`w-4 h-4 ${t.color} flex-shrink-0`} />
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${t.color}`}>{t.label}</p>
                          <p className="text-xs text-muted-foreground">{t.min}–{t.max === 9999 ? "∞" : t.max} referrals</p>
                        </div>
                        <Badge variant="outline" className={`border ${t.bg} ${t.color} font-bold text-xs`}>
                          {tierBonus ? bonusMap[key] : "1×"} bonus
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Fraud detection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Fraud Detection Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold">Auto Fraud Guard</p>
                    <p className="text-xs text-muted-foreground">Automatically flag and hold suspicious referrals for review</p>
                  </div>
                  <Switch checked={fraudGuard} onCheckedChange={setFraudGuard} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { rule: "Same device/IP limit",         desc: "Max 3 referrals per device per day",     active: true  },
                    { rule: "Fake account detection",       desc: "Flag accounts with no profile photo or bio", active: true  },
                    { rule: "Minimum session time",         desc: "Referee must spend ≥5 min on app",       active: true  },
                    { rule: "Phone number uniqueness",      desc: "One reward per phone number",             active: true  },
                    { rule: "Emulator detection",           desc: "Block referrals from emulated devices",  active: fraudGuard },
                    { rule: "Velocity limit",               desc: "Flag if referrer sends >20 links/hour",  active: fraudGuard },
                  ].map((r) => (
                    <div key={r.rule} className={`p-3 rounded-xl border flex items-start gap-2.5 ${r.active ? "bg-green-50 border-green-200" : "bg-muted/40"}`}>
                      {r.active
                        ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        : <XCircle    className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-xs font-semibold">{r.rule}</p>
                        <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

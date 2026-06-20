import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadCSV } from "@/lib/utils";
import {
  Check, X, Clock, MapPin, Eye, Users, Zap, IndianRupee,
  Search, Filter, AlertTriangle, TrendingUp, MousePointer,
  Layout, Circle, Video, Minus, ShoppingBag, Heart,
  ExternalLink, ChevronDown, ChevronUp, Play, Pause,
  BarChart3, Target, Globe, Megaphone, Download} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────
type AdStatus    = "pending" | "active" | "paused" | "completed" | "rejected";
type AdFormat    = "feed" | "story" | "reel" | "banner" | "explore";
type AdObjective = "awareness" | "traffic" | "leads" | "sales" | "engagement";
type BudgetType  = "cpm" | "cpc";

interface Campaign {
  id: string;
  bizName: string;
  bizContact: string;
  headline: string;
  body: string;
  cta: string;
  format: AdFormat;
  objective: AdObjective;
  budgetType: BudgetType;
  dailyBudget: number;
  totalBudget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  targetCity: string;
  targetAge: string;
  targetGender: string;
  targetInterests: string;
  startDate: string;
  endDate: string;
  status: AdStatus;
  submittedAt: string;
  rejectionReason?: string;
  // Brand registration checkpoint
  isBrandRegistered: boolean;
  brandActiveUntil: string;
  brandRevokedAt?: string;
  brandRevokedReason?: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const CAMPAIGNS: Campaign[] = [
  {
    id: "b1", bizName: "Priya's Fashion Store",   bizContact: "priya@fashion.com",
    headline: "Up to 50% off on all fashions this week!", body: "Shop the latest trends at unbeatable prices. Limited time offer — hurry!",
    cta: "Shop Now", format: "feed", objective: "sales", budgetType: "cpm",
    dailyBudget: 500, totalBudget: 3500, spent: 2100,
    impressions: 42000, clicks: 630, ctr: 1.5,
    targetCity: "All India", targetAge: "18–34", targetGender: "Female", targetInterests: "Fashion, Beauty",
    startDate: "12 May", endDate: "18 May", status: "active", submittedAt: "11 May 10:22 AM",
    isBrandRegistered: true, brandActiveUntil: "2025-07-15",
  },
  {
    id: "b2", bizName: "TechZone Electronics",    bizContact: "ads@techzone.in",
    headline: "Best deals on smartphones this season", body: "Compare 500+ phones. EMI options available. 2-year warranty on all devices.",
    cta: "Learn More", format: "story", objective: "traffic", budgetType: "cpc",
    dailyBudget: 1000, totalBudget: 7000, spent: 3000,
    impressions: 60000, clicks: 1200, ctr: 2.0,
    targetCity: "Mumbai, Delhi, Bangalore", targetAge: "25–44", targetGender: "All", targetInterests: "Tech, Gaming",
    startDate: "15 May", endDate: "21 May", status: "active", submittedAt: "14 May 3:15 PM",
    isBrandRegistered: true, brandActiveUntil: "2025-07-10",
  },
  {
    id: "b3", bizName: "SpiceRoute Foods",        bizContact: "hello@spiceroute.com",
    headline: "Order fresh home-style meals today!", body: "Chef-curated meal boxes delivered fresh. First order 20% off with code RIDHI20.",
    cta: "Order Now", format: "reel", objective: "awareness", budgetType: "cpm",
    dailyBudget: 200, totalBudget: 1400, spent: 0,
    impressions: 0, clicks: 0, ctr: 0,
    targetCity: "Bangalore", targetAge: "18–34", targetGender: "All", targetInterests: "Food, Health",
    startDate: "—", endDate: "—", status: "pending", submittedAt: "18 May 9:05 AM",
    isBrandRegistered: true, brandActiveUntil: "2025-06-25",
  },
  {
    id: "b4", bizName: "SkillUp Academy",         bizContact: "marketing@skillup.in",
    headline: "Learn in-demand skills in 60 days", body: "Python, Data Science, UI/UX. Live projects. Expert mentors. Starts June 1st.",
    cta: "Enroll Now", format: "explore", objective: "leads", budgetType: "cpc",
    dailyBudget: 800, totalBudget: 5600, spent: 0,
    impressions: 0, clicks: 0, ctr: 0,
    targetCity: "All India", targetAge: "18–34", targetGender: "All", targetInterests: "Education, Tech",
    startDate: "—", endDate: "—", status: "pending", submittedAt: "18 May 10:44 AM",
    isBrandRegistered: true, brandActiveUntil: "2025-07-20",
  },
  {
    id: "b5", bizName: "ZenFit Yoga Studio",      bizContact: "zoe@zenfit.in",
    headline: "Join ZenFit — Free trial week!", body: "12 sessions/month. Expert instructors. Pune's #1 yoga studio — join 3,000+ members.",
    cta: "Book Now", format: "banner", objective: "leads", budgetType: "cpm",
    dailyBudget: 300, totalBudget: 2100, spent: 2100,
    impressions: 31500, clicks: 472, ctr: 1.5,
    targetCity: "Pune", targetAge: "25–44", targetGender: "Female", targetInterests: "Health, Sports",
    startDate: "1 May", endDate: "7 May", status: "completed", submittedAt: "30 Apr 2:00 PM",
    isBrandRegistered: true, brandActiveUntil: "2025-06-20", brandRevokedAt: "2025-06-20", brandRevokedReason: "No campaign submitted within 30 days",
  },
  {
    id: "b6", bizName: "RohanCars Motors",        bizContact: "sales@rohancars.com",
    headline: "Test drive your dream car today!", body: "200+ cars in stock. Instant loan approval. Drive home today from Mumbai's largest showroom.",
    cta: "Book Test Drive", format: "feed", objective: "traffic", budgetType: "cpc",
    dailyBudget: 1500, totalBudget: 10500, spent: 0,
    impressions: 0, clicks: 0, ctr: 0,
    targetCity: "Mumbai", targetAge: "25–44", targetGender: "Male", targetInterests: "Vehicles",
    startDate: "—", endDate: "—", status: "pending", submittedAt: "17 May 5:30 PM",
    isBrandRegistered: false, brandActiveUntil: "—",
  },
  {
    id: "b7", bizName: "QuickMed Pharma",         bizContact: "ops@quickmed.in",
    headline: "Cure any illness fast with our miracle pills",body: "No prescription needed. Guaranteed results in 24 hours…",
    cta: "Buy Now", format: "feed", objective: "sales", budgetType: "cpm",
    dailyBudget: 2000, totalBudget: 14000, spent: 0,
    impressions: 0, clicks: 0, ctr: 0,
    targetCity: "All India", targetAge: "18+", targetGender: "All", targetInterests: "Health",
    startDate: "—", endDate: "—", status: "rejected", submittedAt: "16 May 11:00 AM",
    rejectionReason: "Misleading medical claims. Violates Ridhi Ads health & safety policy. No prescription claims permitted.",
    isBrandRegistered: true, brandActiveUntil: "2025-06-22", brandRevokedAt: "2025-06-22", brandRevokedReason: "No campaign submitted within 30 days",
  },
];

const dailyRevenueData = [
  { date: "12 May", spend: 500,  impressions: 6000,  clicks: 90  },
  { date: "13 May", spend: 1200, impressions: 15600, clicks: 312 },
  { date: "14 May", spend: 1800, impressions: 21600, clicks: 432 },
  { date: "15 May", spend: 2700, impressions: 35100, clicks: 702 },
  { date: "16 May", spend: 3100, impressions: 41300, clicks: 826 },
  { date: "17 May", spend: 3600, impressions: 48000, clicks: 960 },
  { date: "18 May", spend: 4200, impressions: 56000, clicks: 1120},
];

const formatMix = [
  { name: "Feed",    value: 35, color: "#E91E8C" },
  { name: "Story",   value: 25, color: "#7B2FBE" },
  { name: "Reel",    value: 20, color: "#2196F3" },
  { name: "Banner",  value: 12, color: "#FFB800" },
  { name: "Explore", value: 8,  color: "#34C759" },
];

// ── Checkpoint helpers ─────────────────────────────────────────────────────────

function daysLeft(deadline: string): number {
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return 0;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── Meta helpers ───────────────────────────────────────────────────────────────
const STATUS_META: Record<AdStatus, { label: string; cls: string }> = {
  pending:   { label: "Pending Review", cls: "text-amber-700 bg-amber-50 border-amber-200"   },
  active:    { label: "Running",        cls: "text-green-700 bg-green-50 border-green-200"   },
  paused:    { label: "Paused",         cls: "text-gray-600 bg-gray-50 border-gray-200"      },
  completed: { label: "Completed",      cls: "text-blue-700 bg-blue-50 border-blue-200"      },
  rejected:  { label: "Rejected",       cls: "text-red-700 bg-red-50 border-red-200"         },
};

const FORMAT_ICONS: Record<AdFormat, typeof Layout> = {
  feed: Layout, story: Circle, reel: Video, banner: Minus, explore: Search,
};

const OBJ_ICONS: Record<AdObjective, typeof Eye> = {
  awareness: Eye, traffic: ExternalLink, leads: Users, sales: ShoppingBag, engagement: Heart,
};

// ── Campaign Card ──────────────────────────────────────────────────────────────
function CampaignCard({
  campaign,
  onApprove,
  onReject,
  onPause,
  onResume,
}: {
  campaign: Campaign;
  onApprove: (id: string) => void;
  onReject:  (id: string, reason: string) => void;
  onPause:   (id: string) => void;
  onResume:  (id: string) => void;
}) {
  const [expanded,       setExpanded]       = useState(false);
  const [showReject,     setShowReject]      = useState(false);
  const [rejectReason,   setRejectReason]    = useState("");
  const meta      = STATUS_META[campaign.status];
  const FmtIcon   = FORMAT_ICONS[campaign.format];
  const ObjIcon   = OBJ_ICONS[campaign.objective];
  const progress  = campaign.totalBudget > 0 ? campaign.spent / campaign.totalBudget : 0;
  const ridhiRev  = campaign.budgetType === "cpm"
    ? (campaign.spent * 0.30) // Ridhi takes 30% of CPM spend
    : (campaign.clicks * 0.40); // Ridhi takes 40¢ of ₹2 CPC

  return (
    <Card className={`border transition-all ${campaign.status === "pending" ? "border-amber-200 dark:border-amber-800" : "border-border"}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <FmtIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm">{campaign.bizName}</span>
              <Badge variant="outline" className={`text-[10px] border ${meta.cls}`}>{meta.label}</Badge>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border capitalize">
                {campaign.format} ad
              </Badge>
              {/* Brand checkpoint badge */}
              {campaign.brandRevokedAt ? (
                <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50">
                  <AlertTriangle className="w-3 h-3 mr-0.5" /> Brand Revoked
                </Badge>
              ) : campaign.isBrandRegistered ? (
                <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">
                  <Check className="w-3 h-3 mr-0.5" /> Brand Reg · {daysLeft(campaign.brandActiveUntil)}d left
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                  <AlertTriangle className="w-3 h-3 mr-0.5" /> Unregistered
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{campaign.headline}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{campaign.bizContact} · submitted {campaign.submittedAt}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-bold text-primary text-sm">₹{campaign.dailyBudget.toLocaleString()}/day</div>
            <div className="text-[10px] text-muted-foreground">{campaign.budgetType.toUpperCase()} · {campaign.targetCity}</div>
          </div>
        </div>

        {/* Ad preview */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/40 rounded-lg p-2.5 space-y-1">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Ad Copy</p>
            <p className="font-semibold text-foreground leading-snug">{campaign.headline}</p>
            <p className="text-muted-foreground leading-snug text-[11px]">{campaign.body}</p>
            <span className="inline-block bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1">{campaign.cta}</span>
          </div>
          <div className="bg-muted/40 rounded-lg p-2.5 space-y-1.5">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Targeting</p>
            <div className="space-y-1">
              {[
                { icon: MapPin,  val: campaign.targetCity    },
                { icon: Users,   val: campaign.targetAge + " · " + campaign.targetGender },
                { icon: ObjIcon, val: campaign.objective.charAt(0).toUpperCase() + campaign.objective.slice(1) },
                { icon: Target,  val: campaign.targetInterests || "No interests" },
              ].map(({ icon: Icon, val }, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Icon className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-[11px] text-foreground">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget progress */}
        {campaign.status !== "pending" && campaign.status !== "rejected" && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Spent <span className="font-semibold text-foreground">₹{campaign.spent.toLocaleString()}</span> of ₹{campaign.totalBudget.toLocaleString()}
              </span>
              <span className="font-semibold text-primary">{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-600 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        )}

        {/* Rejection reason */}
        {campaign.status === "rejected" && campaign.rejectionReason && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{campaign.rejectionReason}</span>
          </div>
        )}

        {/* Analytics (expandable) */}
        {(campaign.status === "active" || campaign.status === "completed") && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between text-xs text-primary hover:opacity-70 transition-opacity pt-1 border-t border-border/50"
          >
            <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Performance Analytics</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
        {expanded && (
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { label: "Impressions",  val: campaign.impressions.toLocaleString(), color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20" },
              { label: "Clicks",       val: campaign.clicks.toLocaleString(),      color: "text-primary",    bg: "bg-pink-50 dark:bg-pink-950/20" },
              { label: "CTR",          val: `${campaign.ctr}%`,                   color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/20" },
              { label: "Ridhi Revenue",val: `₹${Math.round(ridhiRev).toLocaleString()}`, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
            ].map(({ label, val, color, bg }) => (
              <div key={label} className={`${bg} rounded-lg p-2 text-center`}>
                <div className={`text-base font-bold ${color}`}>{val}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-border/50 flex-wrap">
          {campaign.status === "pending" && !showReject && (
            <>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs gap-1" onClick={() => onApprove(campaign.id)}>
                <Check className="w-3 h-3" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs gap-1" onClick={() => setShowReject(true)}>
                <X className="w-3 h-3" /> Reject
              </Button>
            </>
          )}
          {campaign.status === "pending" && showReject && (
            <div className="w-full space-y-2">
              <Input placeholder="Reason for rejection…" className="h-8 text-xs" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs gap-1"
                  onClick={() => { onReject(campaign.id, rejectReason || "Policy violation."); setShowReject(false); }}>
                  <X className="w-3 h-3" /> Confirm Reject
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowReject(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {campaign.status === "active" && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onPause(campaign.id)}>
              <Pause className="w-3 h-3" /> Pause
            </Button>
          )}
          {campaign.status === "paused" && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs gap-1" onClick={() => onResume(campaign.id)}>
              <Play className="w-3 h-3" /> Resume
            </Button>
          )}
          {(campaign.status === "active" || campaign.status === "paused") && (
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs gap-1"
              onClick={() => onReject(campaign.id, "Stopped by admin.")}>
              <X className="w-3 h-3" /> Stop
            </Button>
          )}
          {campaign.status !== "pending" && campaign.status !== "rejected" && (
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 ml-auto">
              <Eye className="w-3 h-3" /> Preview Ad
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function BusinessAdsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [search,    setSearch]    = useState("");
  const [fmtFilter, setFmtFilter] = useState<"all" | AdFormat>("all");

  const handleApprove = (id: string) => {
    setCampaigns(p => p.map(c => c.id === id ? { ...c, status: "active" as AdStatus, startDate: "18 May", endDate: "25 May" } : c));
    const c = campaigns.find(x => x.id === id);
    if (c) {
      // Simulated notification dispatch
      setTimeout(() => {
        alert(`Notification sent to ${c.bizContact}
✅ Campaign "${c.headline}" approved & live!
Channels: Push + SMS + Email`);
      }, 200);
    }
  };
  const handleReject = (id: string, reason: string) => {
    setCampaigns(p => p.map(c => c.id === id ? { ...c, status: "rejected" as AdStatus, rejectionReason: reason } : c));
    const c = campaigns.find(x => x.id === id);
    if (c) {
      setTimeout(() => {
        alert(`Notification sent to ${c.bizContact}
❌ Campaign "${c.headline}" rejected.
Reason: ${reason}
Channels: Push + SMS + Email`);
      }, 200);
    }
  };
  const handlePause   = (id: string) =>
    setCampaigns(p => p.map(c => c.id === id ? { ...c, status: "paused"   as AdStatus } : c));
  const handleResume  = (id: string) =>
    setCampaigns(p => p.map(c => c.id === id ? { ...c, status: "active"   as AdStatus } : c));

  const filter = (list: Campaign[]) => list.filter(c =>
    (fmtFilter === "all" || c.format === fmtFilter) &&
    (!search || c.bizName.toLowerCase().includes(search.toLowerCase()) || c.headline.toLowerCase().includes(search.toLowerCase()))
  );

  const pending   = filter(campaigns.filter(c => c.status === "pending"));
  const active    = filter(campaigns.filter(c => c.status === "active"));
  const paused    = filter(campaigns.filter(c => c.status === "paused"));
  const completed = filter(campaigns.filter(c => c.status === "completed"));
  const rejected  = filter(campaigns.filter(c => c.status === "rejected"));

  const totalSpend    = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalImpr     = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks   = campaigns.reduce((s, c) => s + c.clicks, 0);
  const ridhiRevenue  = Math.round(totalSpend * 0.32);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows = CAMPAIGNS.map((c) => ({
            id: c.id,
            business: c.bizName,
            headline: c.headline,
            format: c.format,
            objective: c.objective,
            budget_type: c.budgetType,
            daily_budget: c.dailyBudget,
            total_budget: c.totalBudget,
            spent: c.spent,
            impressions: c.impressions,
            clicks: c.clicks,
            ctr: c.ctr,
            target_city: c.targetCity,
            target_age: c.targetAge,
            target_gender: c.targetGender,
            start_date: c.startDate,
            end_date: c.endDate,
            status: c.status,
            submitted_at: c.submittedAt,
          }));
          downloadCSV("business-ads-report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" /> Ridhi Business Ads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review, manage, and track business ad campaigns across all Ridhi users
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <Badge className="gap-1.5 bg-amber-100 text-amber-700 border-amber-300 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> {pending.length} Awaiting Review
            </Badge>
          )}
          <Badge className="gap-1.5 bg-green-100 text-green-700 border-green-300">
            <Zap className="w-3 h-3" /> {active.length} Live Now
          </Badge>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Ad Spend",    val: `₹${totalSpend.toLocaleString()}`,     icon: IndianRupee,   color: "text-primary",    bg: "bg-pink-50 dark:bg-pink-950/20 border-pink-200"    },
          { label: "Ridhi Revenue",     val: `₹${ridhiRevenue.toLocaleString()}`,   icon: TrendingUp,    color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/20 border-green-200" },
          { label: "Total Impressions", val: `${(totalImpr/1000).toFixed(0)}K`,     icon: Eye,           color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20 border-violet-200"},
          { label: "Total Clicks",      val: totalClicks.toLocaleString(),           icon: MousePointer,  color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200" },
          { label: "Avg CPC",           val: `₹${totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0.00"}`, icon: TrendingUp,    color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200"    },
          { label: "Avg CPM",           val: `₹${totalImpr > 0 ? ((totalSpend / totalImpr) * 1000).toFixed(0) : "0"}`, icon: BarChart3,     color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200"   },
          { label: "Avg CTR",           val: `${totalImpr > 0 ? ((totalClicks / totalImpr) * 100).toFixed(1) : "0.0"}%`, icon: Target,        color: "text-teal-600",   bg: "bg-teal-50 dark:bg-teal-950/20 border-teal-200"   },
          { label: "ROAS",              val: `${ridhiRevenue > 0 ? ((ridhiRevenue / totalSpend) * 100).toFixed(1) : "0.0"}%`, icon: Zap,           color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200" },
        ].map(({ label, val, icon: Icon, color, bg }) => (
          <Card key={label} className={`border ${bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg} border`}><Icon className={`w-4 h-4 ${color}`} /></div>
              <div>
                <div className={`text-xl font-bold ${color}`}>{val}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border border-border lg:col-span-2">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Daily Ad Spend & Impressions</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyRevenueData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number, name: string) => [name === "spend" ? `₹${v.toLocaleString()}` : v.toLocaleString(), name === "spend" ? "Spend" : "Impressions"]} />
                <Bar dataKey="spend"       fill="#E91E8C" radius={[4,4,0,0]} opacity={0.9} />
                <Bar dataKey="clicks"      fill="#7B2FBE" radius={[4,4,0,0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-violet-500" />Format Mix</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={formatMix} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {formatMix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {formatMix.map(f => (
                <div key={f.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className="text-muted-foreground">{f.name} {f.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue model note */}
      <div className="flex items-start gap-3 p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 rounded-lg">
        <Globe className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-violet-700 text-sm">Ridhi Ads Revenue Model</p>
          <p className="text-xs text-violet-600 mt-0.5">
            CPM campaigns: ₹50/1K impressions · CPC campaigns: ₹2/click · Ridhi earns ~30–40% of all ad spend as platform revenue. Businesses set their own daily budgets (min ₹100/day) and duration.
          </p>
          <p className="text-xs text-amber-600 mt-1 font-medium">
            🏛️ 18% GST is charged on all ad spend and remitted to the government. Advertisers should account for GST when planning budgets.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by business or headline…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={fmtFilter} onValueChange={v => setFmtFilter(v as typeof fmtFilter)}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="feed">Feed Ad</SelectItem>
            <SelectItem value="story">Story Ad</SelectItem>
            <SelectItem value="reel">Reel Ad</SelectItem>
            <SelectItem value="banner">Banner Ad</SelectItem>
            <SelectItem value="explore">Explore Ad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="pending" className="gap-1.5">
            Pending
            {pending.length > 0 && <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pending.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({paused.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        {[
          { val: "pending",   list: pending,   empty: "No campaigns pending review." },
          { val: "active",    list: active,    empty: "No active campaigns."         },
          { val: "paused",    list: paused,    empty: "No paused campaigns."         },
          { val: "completed", list: completed, empty: "No completed campaigns."      },
          { val: "rejected",  list: rejected,  empty: "No rejected campaigns."       },
        ].map(({ val, list, empty }) => (
          <TabsContent key={val} value={val} className="mt-4 space-y-3">
            {list.length === 0
              ? <Card><CardContent className="p-8 text-center text-muted-foreground">{val === "pending" && <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />}{empty}</CardContent></Card>
              : list.map(c => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onPause={handlePause}
                    onResume={handleResume}
                  />
                ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

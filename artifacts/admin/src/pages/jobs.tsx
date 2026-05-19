import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Briefcase, Search, TrendingUp, Users, Building2, IndianRupee,
  CheckCircle, XCircle, Clock, Star, Zap, Eye, Trash2,
  ChevronUp, BadgeCheck, MapPin, Cpu, Crown, BarChart3,
  AlertCircle, ShieldCheck, Megaphone, Gift,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type JobStatus = "active" | "pending" | "rejected" | "expired";
type PlanTier  = "basic" | "featured" | "premium" | "homepage";
type SubTier   = "starter" | "business" | "enterprise";

interface JobListing {
  id: string;
  title: string;
  company: string;
  employer: string;
  category: string;
  city: string;
  type: string;
  plan: PlanTier;
  coins: number;
  postedAt: string;
  expiresAt: string;
  status: JobStatus;
  urgent: boolean;
  views: number;
  applications: number;
  verified: boolean;
}

interface Employer {
  id: string;
  name: string;
  company: string;
  city: string;
  plan: SubTier | "free";
  coinsSpent: number;
  activeJobs: number;
  totalJobs: number;
  joinedAt: string;
  verified: boolean;
  revenue: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_JOBS: JobListing[] = [
  { id: "j1",  title: "React Native Developer",      company: "TechSpark Solutions",   employer: "Amit Sharma",   category: "IT & Tech",          city: "Mumbai",    type: "Full-time",   plan: "featured",  coins: 499,  postedAt: "2 hrs ago",  expiresAt: "29 days", status: "active",   urgent: true,  views: 412,  applications: 28, verified: true  },
  { id: "j2",  title: "Staff Nurse (ICU)",            company: "Sunrise Hospital",      employer: "Dr. Mehta",     category: "Healthcare",         city: "Mumbai",    type: "Full-time",   plan: "basic",     coins: 199,  postedAt: "6 hrs ago",  expiresAt: "24 days", status: "active",   urgent: true,  views: 204,  applications: 41, verified: true  },
  { id: "j3",  title: "Delivery Partner (Zomato)",   company: "Zomato Network",        employer: "HR Team",       category: "Transport",          city: "Bangalore", type: "Gig",         plan: "homepage",  coins: 1999, postedAt: "1 hr ago",   expiresAt: "14 days", status: "active",   urgent: false, views: 987,  applications: 83, verified: true  },
  { id: "j4",  title: "Content Writer",              company: "StartupBridge",         employer: "Priya Iyer",    category: "Marketing",          city: "Hyderabad", type: "Freelance",   plan: "basic",     coins: 199,  postedAt: "1 day ago",  expiresAt: "20 days", status: "active",   urgent: false, views: 88,   applications: 9,  verified: false },
  { id: "j5",  title: "Customer Support Executive",  company: "FinServe India",        employer: "Rajesh Kumar",  category: "Customer Support",   city: "Delhi",     type: "Full-time",   plan: "premium",   coins: 999,  postedAt: "3 hrs ago",  expiresAt: "30 days", status: "active",   urgent: false, views: 341,  applications: 67, verified: true  },
  { id: "j6",  title: "Social Media Influencer",     company: "BrandBoost Agency",     employer: "Sneha Patel",   category: "Creator & Influencer",city: "Pune",      type: "Part-time",   plan: "featured",  coins: 499,  postedAt: "5 hrs ago",  expiresAt: "28 days", status: "active",   urgent: false, views: 176,  applications: 22, verified: true  },
  { id: "j7",  title: "Event Coordinator",           company: "Celebration Co.",       employer: "Arjun Nair",    category: "Event & Gaming",     city: "Chennai",   type: "Part-time",   plan: "basic",     coins: 199,  postedAt: "2 days ago", expiresAt: "12 days", status: "active",   urgent: false, views: 59,   applications: 7,  verified: false },
  { id: "j8",  title: "Freelance Graphic Designer",  company: "PixelCraft Studio",     employer: "Kavya Rao",     category: "Design",             city: "Mumbai",    type: "Freelance",   plan: "basic",     coins: 199,  postedAt: "4 days ago", expiresAt: "—",       status: "expired",  urgent: false, views: 130,  applications: 14, verified: true  },
  { id: "j9",  title: "Local Shop Supervisor",       company: "DMart",                 employer: "Retail HR",     category: "Retail",             city: "Ahmedabad", type: "Full-time",   plan: "basic",     coins: 199,  postedAt: "1 hr ago",   expiresAt: "Pending", status: "pending",  urgent: false, views: 0,    applications: 0,  verified: false },
  { id: "j10", title: "Mobile App Developer",        company: "DigiEdge Tech",         employer: "Vikram Sinha",  category: "IT & Tech",          city: "Hyderabad", type: "Full-time",   plan: "premium",   coins: 999,  postedAt: "12 hrs ago", expiresAt: "30 days", status: "active",   urgent: true,  views: 255,  applications: 31, verified: true  },
];

const MOCK_EMPLOYERS: Employer[] = [
  { id: "e1", name: "Amit Sharma",  company: "TechSpark Solutions",  city: "Mumbai",    plan: "business",    coinsSpent: 8420,  activeJobs: 4,  totalJobs: 12, joinedAt: "3 months ago", verified: true,  revenue: 6736 },
  { id: "e2", name: "Dr. Mehta",    company: "Sunrise Hospital",     city: "Mumbai",    plan: "starter",     coinsSpent: 1980,  activeJobs: 2,  totalJobs: 6,  joinedAt: "5 months ago", verified: true,  revenue: 1584 },
  { id: "e3", name: "HR Team",      company: "Zomato Network",       city: "Bangalore", plan: "enterprise",  coinsSpent: 34900, activeJobs: 8,  totalJobs: 31, joinedAt: "8 months ago", verified: true,  revenue: 27920 },
  { id: "e4", name: "Priya Iyer",   company: "StartupBridge",        city: "Hyderabad", plan: "free",        coinsSpent: 199,   activeJobs: 1,  totalJobs: 2,  joinedAt: "1 month ago",  verified: false, revenue: 159 },
  { id: "e5", name: "Rajesh Kumar", company: "FinServe India",       city: "Delhi",     plan: "business",    coinsSpent: 12300, activeJobs: 5,  totalJobs: 18, joinedAt: "6 months ago", verified: true,  revenue: 9840 },
  { id: "e6", name: "Sneha Patel",  company: "BrandBoost Agency",    city: "Pune",      plan: "starter",     coinsSpent: 3100,  activeJobs: 3,  totalJobs: 9,  joinedAt: "4 months ago", verified: true,  revenue: 2480 },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<JobStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  active:   { label: "Active",   color: "text-green-700",  bg: "bg-green-50 border-green-200",  icon: CheckCircle },
  pending:  { label: "Pending",  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Clock      },
  rejected: { label: "Rejected", color: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: XCircle    },
  expired:  { label: "Expired",  color: "text-gray-600",   bg: "bg-gray-50 border-gray-200",     icon: AlertCircle},
};

const PLAN_META: Record<PlanTier, { label: string; color: string; coins: number }> = {
  basic:    { label: "Basic",    color: "text-blue-600 bg-blue-50 border-blue-200",     coins: 199  },
  featured: { label: "Featured", color: "text-purple-600 bg-purple-50 border-purple-200", coins: 499 },
  premium:  { label: "Premium",  color: "text-pink-600 bg-pink-50 border-pink-200",     coins: 999  },
  homepage: { label: "Homepage", color: "text-amber-600 bg-amber-50 border-amber-200",  coins: 1999 },
};

const SUB_META: Record<string, { label: string; color: string; coins: number }> = {
  free:       { label: "Free",       color: "text-gray-600 bg-gray-50 border-gray-200",       coins: 0     },
  starter:    { label: "Starter",    color: "text-blue-600 bg-blue-50 border-blue-200",        coins: 1499  },
  business:   { label: "Business",   color: "text-purple-600 bg-purple-50 border-purple-200",  coins: 4999  },
  enterprise: { label: "Enterprise", color: "text-amber-600 bg-amber-50 border-amber-200",     coins: 19999 },
};

const TABS = ["Overview", "Job Listings", "Employers", "Pricing", "Revenue"] as const;
type Tab = typeof TABS[number];

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ jobs, employers }: { jobs: JobListing[]; employers: Employer[] }) {
  const activeJobs    = jobs.filter((j) => j.status === "active").length;
  const pendingJobs   = jobs.filter((j) => j.status === "pending").length;
  const totalViews    = jobs.reduce((s, j) => s + j.views, 0);
  const totalApps     = jobs.reduce((s, j) => s + j.applications, 0);
  const totalRevenue  = employers.reduce((s, e) => s + e.revenue, 0);
  const enterpriseCount = employers.filter((e) => e.plan === "enterprise").length;

  const categoryBreakdown = [
    { label: "Part-Time",           count: jobs.filter(j => j.category === "Transport" || j.type === "Part-time").length, potential: "Very High", color: "bg-purple-500" },
    { label: "Local Jobs",          count: jobs.filter(j => j.category === "Retail").length, potential: "Very High", color: "bg-pink-500"   },
    { label: "Gig / Delivery",      count: jobs.filter(j => j.type === "Gig").length, potential: "High", color: "bg-orange-500" },
    { label: "Customer Support",    count: jobs.filter(j => j.category === "Customer Support").length, potential: "High", color: "bg-blue-500"   },
    { label: "Creator & Influencer",count: jobs.filter(j => j.category === "Creator & Influencer").length, potential: "High", color: "bg-rose-500"   },
    { label: "IT & Tech",           count: jobs.filter(j => j.category === "IT & Tech").length, potential: "High", color: "bg-cyan-500"   },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Active Listings",    value: activeJobs,                     icon: Briefcase,   color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Pending Approval",   value: pendingJobs,                    icon: Clock,       color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Total Views",        value: totalViews.toLocaleString(),    icon: Eye,         color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Applications",       value: totalApps.toLocaleString(),     icon: Users,       color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active Employers",   value: employers.length,               icon: Building2,   color: "text-pink-600",   bg: "bg-pink-50"   },
          { label: "Revenue (₹)",        value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-emerald-600",bg: "bg-emerald-50"},
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
        {/* Category Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Job Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryBreakdown.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{c.label}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs px-1.5 py-0 ${c.potential === "Very High" ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
                        {c.potential}
                      </Badge>
                      <span className="text-xs text-muted-foreground w-4 text-right">{c.count}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${Math.max((c.count / jobs.length) * 100, 8)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Model */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-500" /> Revenue Model — 100% Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-700">No Agent Commission</p>
                <p className="text-xs text-emerald-600">Ridhi Jobs keeps 100% of all revenue — no host/agent splits</p>
              </div>
            </div>
            {[
              { source: "Job Posting Revenue",    share: "100%", icon: Briefcase },
              { source: "Resume Boost Revenue",   share: "100%", icon: ChevronUp },
              { source: "Employer Subscriptions", share: "100%", icon: Building2 },
              { source: "Job Ads",                share: "100%", icon: Megaphone },
              { source: "Verification Fees",      share: "100%", icon: BadgeCheck },
            ].map((r) => (
              <div key={r.source} className="flex items-center justify-between py-1.5 border-b last:border-0 text-sm">
                <div className="flex items-center gap-2">
                  <r.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-foreground">{r.source}</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">{r.share}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {jobs.filter(j => j.status === "pending").length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-yellow-800">
              <Clock className="w-4 h-4" />
              {jobs.filter(j => j.status === "pending").length} Job{jobs.filter(j => j.status === "pending").length > 1 ? "s" : ""} Awaiting Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.filter(j => j.status === "pending").map((j) => (
              <div key={j.id} className="flex items-center gap-3 bg-white border border-yellow-200 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{j.title}</p>
                  <p className="text-xs text-muted-foreground">{j.company} · {j.city} · {j.postedAt}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 gap-1">
                    <CheckCircle className="w-3 h-3" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs gap-1">
                    <XCircle className="w-3 h-3" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Job Listings Tab ──────────────────────────────────────────────────────────

function JobListingsTab({ jobs, setJobs }: { jobs: JobListing[]; setJobs: (j: JobListing[]) => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | JobStatus>("all");
  const [filterPlan, setFilterPlan]     = useState<"all" | PlanTier>("all");

  const filtered = jobs.filter((j) => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || j.status === filterStatus;
    const matchPlan   = filterPlan   === "all" || j.plan   === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  const updateStatus = (id: string, status: JobStatus) =>
    setJobs(jobs.map((j) => (j.id === id ? { ...j, status } : j)));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search job title or company…" className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1">
            {(["all", "active", "pending", "rejected", "expired"] as const).map((s) => (
              <Button key={s} size="sm" variant={filterStatus === s ? "default" : "outline"} className="h-7 text-xs" onClick={() => setFilterStatus(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s === "pending" && jobs.filter(j => j.status === "pending").length > 0 && (
                  <Badge className="ml-1 h-4 px-1 text-xs bg-yellow-500 text-white">{jobs.filter(j => j.status === "pending").length}</Badge>
                )}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", "basic", "featured", "premium", "homepage"] as const).map((p) => (
              <Button key={p} size="sm" variant={filterPlan === p ? "default" : "outline"} className="h-7 text-xs" onClick={() => setFilterPlan(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Listings */}
      <div className="space-y-2">
        {filtered.map((job) => {
          const sm = STATUS_META[job.status];
          const pm = PLAN_META[job.plan];
          return (
            <Card key={job.id} className={`${job.status === "pending" ? "ring-1 ring-yellow-200" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 flex-wrap">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{job.title}</span>
                      {job.urgent && <Badge className="text-xs bg-red-100 text-red-600 border-red-200">🔥 Urgent</Badge>}
                      {job.verified && <Badge className="text-xs bg-green-100 text-green-600 border-green-200"><BadgeCheck className="w-3 h-3 mr-0.5" />Verified</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.company} · <MapPin className="w-3 h-3 inline" /> {job.city} · {job.type}</p>
                    <p className="text-xs text-muted-foreground">Posted {job.postedAt} · Expires: {job.expiresAt} · Employer: {job.employer}</p>
                  </div>

                  {/* Plan */}
                  <Badge className={`text-xs border ${pm.color}`}>⭐ {pm.label} · {pm.coins} coins</Badge>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
                    <span><Eye className="w-3 h-3 inline mr-1" />{job.views}</span>
                    <span><Users className="w-3 h-3 inline mr-1" />{job.applications}</span>
                  </div>

                  {/* Status */}
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium ${sm.bg} ${sm.color}`}>
                    <sm.icon className="w-3.5 h-3.5" />{sm.label}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {job.status === "pending" && (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 gap-1" onClick={() => updateStatus(job.id, "active")}>
                          <CheckCircle className="w-3 h-3" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => updateStatus(job.id, "rejected")}>
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </>
                    )}
                    {job.status === "active" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(job.id, "expired")}>
                        <Trash2 className="w-3 h-3" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No job listings match the current filters.</CardContent></Card>
        )}
      </div>
    </div>
  );
}

// ── Employers Tab ─────────────────────────────────────────────────────────────

function EmployersTab({ employers }: { employers: Employer[] }) {
  const [search, setSearch] = useState("");
  const filtered = employers.filter((e) =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search employer or company…" className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map((emp) => {
          const sm = SUB_META[emp.plan];
          return (
            <Card key={emp.id}>
              <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {emp.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{emp.name}</span>
                    {emp.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{emp.company} · <MapPin className="w-3 h-3 inline" /> {emp.city}</p>
                  <p className="text-xs text-muted-foreground">Joined {emp.joinedAt}</p>
                </div>
                <div className="hidden md:flex gap-4 text-center text-xs">
                  <div><p className="font-bold text-foreground">{emp.activeJobs}</p><p className="text-muted-foreground">Active</p></div>
                  <div><p className="font-bold text-foreground">{emp.totalJobs}</p><p className="text-muted-foreground">Total</p></div>
                  <div><p className="font-bold text-foreground">{emp.coinsSpent.toLocaleString()}</p><p className="text-muted-foreground">Coins</p></div>
                </div>
                <Badge className={`text-xs border ${sm.color}`}>{sm.label}{sm.coins > 0 ? ` · ${sm.coins.toLocaleString()} coins/mo` : ""}</Badge>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">₹{emp.revenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Pricing Tab ───────────────────────────────────────────────────────────────

function PricingTab() {
  return (
    <div className="space-y-5">
      {/* Free for job seekers banner */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-green-800">Job Seekers — Always Free</p>
          <p className="text-xs text-green-700 mt-0.5">Create profile · Upload resume · Search & apply for jobs · Save jobs · Follow companies — all free, no coins needed</p>
        </div>
        <Badge className="ml-auto bg-green-600 text-white border-0">FREE</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Premium Job Seeker Features */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Premium Job Seeker Features
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { feature: "Featured Resume",         coins: 49,  icon: ChevronUp    },
              { feature: "Priority Application",    coins: 99,  icon: Zap          },
              { feature: "Verified Profile Badge",  coins: 299, icon: BadgeCheck   },
              { feature: "AI Resume Review",        coins: 99,  icon: Cpu          },
              { feature: "Video Resume Upload",     coins: 49,  icon: Eye          },
              { feature: "Top Candidate Placement", coins: 199, icon: ChevronUp    },
              { feature: "Recruiter Direct Connect",coins: 99,  icon: Users        },
              { feature: "Profile Highlight",       coins: 49,  icon: Star         },
              { feature: "Skill Badge Verification",coins: 199, icon: BadgeCheck   },
            ].map((r, i, arr) => (
              <div key={r.feature} className={`flex items-center justify-between px-4 py-2.5 ${i < arr.length - 1 ? "border-b" : ""}`}>
                <div className="flex items-center gap-2">
                  <r.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-foreground">{r.feature}</span>
                </div>
                <span className="text-xs font-bold text-purple-600">{r.coins} coins</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Employer Job Posting Plans */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" /> Employer — Job Posting Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { plan: "Basic Job Post",          coins: 199,  highlight: false },
              { plan: "Featured Job Post",       coins: 499,  highlight: false },
              { plan: "Premium Job Placement",   coins: 999,  highlight: true  },
              { plan: "Homepage Featured Job",   coins: 1999, highlight: false },
              { plan: "Urgent Hiring Badge",     coins: 299,  highlight: false },
              { plan: "Top Search Placement",    coins: 799,  highlight: false },
              { plan: "City-Wide Promotion",     coins: 499,  highlight: false },
              { plan: "Category Promotion",      coins: 299,  highlight: false },
            ].map((r, i, arr) => (
              <div key={r.plan} className={`flex items-center justify-between px-4 py-2.5 ${r.highlight ? "bg-purple-50" : ""} ${i < arr.length - 1 ? "border-b" : ""}`}>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className={`text-xs ${r.highlight ? "font-semibold text-purple-700" : "text-foreground"}`}>{r.plan}</span>
                  {r.highlight && <Badge className="text-xs bg-purple-100 text-purple-600 border-purple-200 px-1.5 py-0">Popular</Badge>}
                </div>
                <span className={`text-xs font-bold ${r.highlight ? "text-purple-600" : "text-blue-600"}`}>{r.coins.toLocaleString()} coins</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Employer Monthly Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            tier: "Starter", coins: 1499, color: "border-blue-200 bg-blue-50/40", badge: "text-blue-700 bg-blue-100 border-blue-200",
            features: ["5 Job Posts/month", "1 Featured Job", "Limited Resume Access"],
          },
          {
            tier: "Business", coins: 4999, color: "border-purple-300 bg-purple-50/40 ring-2 ring-purple-200", badge: "text-purple-700 bg-purple-100 border-purple-200",
            features: ["Unlimited Job Posts", "5 Featured Jobs", "Candidate Search", "Hiring Dashboard"],
          },
          {
            tier: "Enterprise", coins: 19999, color: "border-amber-200 bg-amber-50/40", badge: "text-amber-700 bg-amber-100 border-amber-200",
            features: ["Premium Placements", "Homepage Visibility", "Verified Company Badge", "Priority Support", "Dedicated Dashboard"],
          },
        ].map((sub) => (
          <Card key={sub.tier} className={`border-2 ${sub.color}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{sub.tier} Plan</CardTitle>
                <Badge className={`text-xs border ${sub.badge}`}>Employer</Badge>
              </div>
              <p className="text-2xl font-black text-foreground mt-1">{sub.coins.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">coins/mo</span></p>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {sub.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">{f}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Boost Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" /> Ridhi Jobs Boost Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { feature: "Candidate Boost",       coins: 199,  icon: Users,     color: "bg-blue-50 border-blue-200 text-blue-700"     },
              { feature: "Job Visibility Boost",  coins: 299,  icon: Eye,       color: "bg-purple-50 border-purple-200 text-purple-700"},
              { feature: "Priority Hiring Tag",   coins: 499,  icon: Zap,       color: "bg-pink-50 border-pink-200 text-pink-700"     },
              { feature: "City Targeting",        coins: 199,  icon: MapPin,    color: "bg-cyan-50 border-cyan-200 text-cyan-700"     },
              { feature: "Skill-Based Promotion", coins: 299,  icon: BadgeCheck,color: "bg-emerald-50 border-emerald-200 text-emerald-700"},
              { feature: "Homepage Spotlight",    coins: 999,  icon: Crown,     color: "bg-amber-50 border-amber-200 text-amber-700"  },
              { feature: "Recruiter Branding",    coins: 1499, icon: Gift,      color: "bg-rose-50 border-rose-200 text-rose-700"     },
            ].map((b) => (
              <div key={b.feature} className={`rounded-xl border p-3 ${b.color}`}>
                <b.icon className="w-4 h-4 mb-1.5" />
                <p className="text-xs font-semibold">{b.feature}</p>
                <p className="text-lg font-black mt-1">{b.coins.toLocaleString()}</p>
                <p className="text-xs opacity-70">coins</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Revenue Tab ───────────────────────────────────────────────────────────────

function RevenueTab({ employers }: { employers: Employer[] }) {
  const totalRevenue  = employers.reduce((s, e) => s + e.revenue, 0);
  const totalCoins    = employers.reduce((s, e) => s + e.coinsSpent, 0);
  const entRevenue    = employers.filter(e => e.plan === "enterprise").reduce((s, e) => s + e.revenue, 0);
  const bizRevenue    = employers.filter(e => e.plan === "business").reduce((s, e) => s + e.revenue, 0);

  const breakdownRows = [
    { source: "Enterprise Subscriptions", amount: entRevenue,             share: entRevenue / totalRevenue * 100 },
    { source: "Business Subscriptions",   amount: bizRevenue,             share: bizRevenue / totalRevenue * 100 },
    { source: "Job Posting Plans",        amount: totalRevenue * 0.22,    share: 22 },
    { source: "Job Boosts",               amount: totalRevenue * 0.08,    share: 8  },
    { source: "Starter Subscriptions",    amount: totalRevenue * 0.06,    share: 6  },
    { source: "Verification Fees",        amount: totalRevenue * 0.04,    share: 4  },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue",       value: `₹${totalRevenue.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50", icon: IndianRupee },
          { label: "Total Coins Spent",   value: totalCoins.toLocaleString(),          color: "text-purple-600",  bg: "bg-purple-50",  icon: Star        },
          { label: "Platform Share",      value: "100%",                               color: "text-blue-600",    bg: "bg-blue-50",    icon: ShieldCheck },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Revenue Breakdown by Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {breakdownRows.map((r) => (
            <div key={r.source}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">{r.source}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-foreground">₹{Math.round(r.amount).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(r.share)}%</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${r.share}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Per-employer table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Revenue Per Employer</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {employers.sort((a, b) => b.revenue - a.revenue).map((emp) => {
              const sm = SUB_META[emp.plan];
              return (
                <div key={emp.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {emp.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{emp.company}</p>
                    <p className="text-xs text-muted-foreground">{emp.city} · {emp.totalJobs} jobs posted</p>
                  </div>
                  <Badge className={`text-xs border ${sm.color} flex-shrink-0`}>{sm.label}</Badge>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-600">₹{emp.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{emp.coinsSpent.toLocaleString()} coins</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [jobs, setJobs]           = useState<JobListing[]>(MOCK_JOBS);

  const pendingCount = jobs.filter(j => j.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Ridhi Jobs
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Job discovery platform · Free for seekers · Paid for employers · 100% platform revenue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Platform Revenue
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 font-medium">
              <Clock className="w-3.5 h-3.5" /> {pendingCount} Pending
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {tab === "Job Listings" && pendingCount > 0 && (
              <Badge className="h-4 px-1.5 text-xs bg-yellow-500 text-white">{pendingCount}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview"     && <OverviewTab    jobs={jobs} employers={MOCK_EMPLOYERS} />}
      {activeTab === "Job Listings" && <JobListingsTab jobs={jobs} setJobs={setJobs} />}
      {activeTab === "Employers"    && <EmployersTab   employers={MOCK_EMPLOYERS} />}
      {activeTab === "Pricing"      && <PricingTab />}
      {activeTab === "Revenue"      && <RevenueTab     employers={MOCK_EMPLOYERS} />}
    </div>
  );
}

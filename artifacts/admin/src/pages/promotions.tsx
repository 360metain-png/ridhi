import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe, UserPlus, Heart, IndianRupee, Search, Check,
  X, Pause, Play, AlertTriangle, Clock, Users,
  Target, Zap, Filter, Crown, ChevronDown, ChevronUp,
  ClipboardList, Phone, Mail, MapPin, Download,
  MousePointer, TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { downloadCSV } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
type Objective = "reach" | "leads" | "reactions";
type PromoStatus = "pending" | "active" | "paused" | "completed" | "rejected";
type PromoTarget = "profile" | "post";

interface Promotion {
  id: string;
  user: string;
  userCity: string;
  plan: "Gold" | "VIP Diamond";
  target: PromoTarget;
  objective: Objective;
  gender: string;
  age: string;
  city: string;
  interests: string[];
  budgetPerDay: number;
  durationDays: number;
  totalBudget: number;
  estReach: string;
  actualReach?: number;
  leads?: number;
  reactions?: number;
  spentSoFar: number;
  startDate?: string;
  endDate?: string;
  submittedAt: string;
  status: PromoStatus;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const PROMOTIONS: Promotion[] = [
  { id: "p1",  user: "Priya Sharma",   userCity: "Mumbai",    plan: "VIP Diamond", target: "profile", objective: "reach",     gender: "All",   age: "18–34", city: "Mumbai",        interests: ["Music","Fashion"],        budgetPerDay: 250, durationDays: 7,  totalBudget: 1750,  estReach: "42K–63K",   actualReach: 38200, leads: undefined, reactions: undefined, spentSoFar: 1250, startDate: "12 May", endDate: "18 May", submittedAt: "11 May", status: "active" },
  { id: "p2",  user: "Rahul Kumar",    userCity: "Delhi",     plan: "Gold",        target: "post",    objective: "reactions", gender: "All",   age: "18–24", city: "Delhi",         interests: ["Gaming","Tech"],          budgetPerDay: 100, durationDays: 3,  totalBudget: 300,   estReach: "6K–10.5K",  actualReach: 9100,  leads: undefined, reactions: 840, spentSoFar: 300, startDate: "16 May", endDate: "18 May", submittedAt: "15 May", status: "completed" },
  { id: "p3",  user: "Dev Raj",        userCity: "Bangalore", plan: "Gold",        target: "profile", objective: "leads",     gender: "Women", age: "25–34", city: "Bangalore",     interests: ["Travel","Food"],          budgetPerDay: 100, durationDays: 7,  totalBudget: 700,   estReach: "3.5K–6K",   actualReach: 4200,  leads: 312, reactions: undefined, spentSoFar: 400, startDate: "14 May", endDate: "20 May", submittedAt: "13 May", status: "paused" },
  { id: "p4",  user: "Ananya Mehta",   userCity: "Pune",      plan: "VIP Diamond", target: "post",    objective: "reach",     gender: "All",   age: "All",   city: "Anywhere",      interests: ["Fitness","Dance"],        budgetPerDay: 500, durationDays: 14, totalBudget: 7000,  estReach: "196K–280K", actualReach: undefined, leads: undefined, reactions: undefined, spentSoFar: 0, submittedAt: "18 May 9:12 AM", status: "pending" },
  { id: "p5",  user: "Kavya Krishnan", userCity: "Chennai",   plan: "Gold",        target: "profile", objective: "leads",     gender: "Men",   age: "25–34", city: "Chennai",       interests: ["Movies","Music"],         budgetPerDay: 100, durationDays: 7,  totalBudget: 700,   estReach: "3.5K–6K",   actualReach: undefined, leads: undefined, reactions: undefined, spentSoFar: 0, submittedAt: "18 May 8:45 AM", status: "pending" },
  { id: "p6",  user: "Rohan Singh",    userCity: "Kolkata",   plan: "Gold",        target: "post",    objective: "reactions", gender: "All",   age: "18–24", city: "Kolkata",       interests: ["Comedy","Art"],           budgetPerDay: 50,  durationDays: 3,  totalBudget: 150,   estReach: "1.5K–2.5K", actualReach: undefined, leads: undefined, reactions: undefined, spentSoFar: 0, submittedAt: "17 May", status: "pending" },
  { id: "p7",  user: "Sneha Joshi",    userCity: "Hyderabad", plan: "VIP Diamond", target: "profile", objective: "reach",     gender: "All",   age: "All",   city: "Hyderabad",     interests: [],                         budgetPerDay: 250, durationDays: 3,  totalBudget: 750,   estReach: "18K–27K",   actualReach: undefined, leads: undefined, reactions: undefined, spentSoFar: 0, submittedAt: "17 May", status: "rejected" },
  { id: "p8",  user: "Aditya Shah",    userCity: "Jaipur",    plan: "Gold",        target: "post",    objective: "leads",     gender: "Women", age: "18–24", city: "Jaipur",        interests: ["Fashion","Travel"],       budgetPerDay: 100, durationDays: 7,  totalBudget: 700,   estReach: "3.5K–6K",   actualReach: 5600,  leads: 198, reactions: undefined, spentSoFar: 700, startDate: "10 May", endDate: "16 May", submittedAt: "9 May", status: "completed" },
];

// ── Lead Form types & mock data ────────────────────────────────────────────────
interface LeadField { key: string; label: string; }
interface LeadSubmission {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  answers: Record<string, string>;
  submittedAt: string;
}
interface LeadForm {
  id: string;
  advertiser: string;
  advertiserCity: string;
  plan: "Gold" | "VIP Diamond";
  campaignId: string;
  title: string;
  fields: LeadField[];
  customQuestions: string[];
  totalSubmissions: number;
  submissions: LeadSubmission[];
  createdAt: string;
  status: "active" | "paused" | "completed";
}

const LEAD_FORMS: LeadForm[] = [
  {
    id: "lf1",
    advertiser: "Dev Raj",
    advertiserCity: "Bangalore",
    plan: "Gold",
    campaignId: "p3",
    title: "Get a Free Tech Consultation",
    fields: [
      { key: "name",  label: "Full Name"     },
      { key: "phone", label: "Phone Number"  },
      { key: "email", label: "Email Address" },
      { key: "city",  label: "City"          },
    ],
    customQuestions: [
      "What type of project do you need help with?",
      "What is your budget range (₹)?",
      "Do you have an existing app or website?",
      "When do you want to start?",
    ],
    totalSubmissions: 312,
    submissions: [
      { id: "s1", name: "Rahul Kumar",  phone: "+91 98765 43210", email: "rahul@example.com",  city: "Delhi",   answers: { q0: "Mobile App",    q1: "₹1L–₹3L",  q2: "No",  q3: "Immediately"    }, submittedAt: "18 May, 2:30 PM" },
      { id: "s2", name: "Ananya Mehta", phone: "+91 87654 32109", email: "ananya@example.com", city: "Pune",    answers: { q0: "Web App",       q1: "₹50K–₹1L", q2: "Yes", q3: "Within 1 month" }, submittedAt: "18 May, 10:15 AM" },
      { id: "s3", name: "Kavya K.",     phone: "+91 76543 21098", email: "kavya@example.com",  city: "Chennai", answers: { q0: "API / Backend",  q1: "₹25K–₹50K",q2: "No",  q3: "In 3+ months"  }, submittedAt: "17 May, 6:00 PM" },
      { id: "s4", name: "Vikram S.",    phone: "+91 65432 10987", city: "Mumbai",              answers: { q0: "All of the above", q1: "₹3L+",   q2: "Yes", q3: "Immediately"    }, submittedAt: "17 May, 3:45 PM" },
    ],
    createdAt: "13 May",
    status: "paused",
  },
  {
    id: "lf2",
    advertiser: "Aditya Shah",
    advertiserCity: "Jaipur",
    plan: "Gold",
    campaignId: "p8",
    title: "Fashion Styling Consultation",
    fields: [
      { key: "name",  label: "Full Name"    },
      { key: "phone", label: "Phone Number" },
      { key: "city",  label: "City"         },
      { key: "age",   label: "Age"          },
    ],
    customQuestions: [
      "What is your style preference?",
      "Occasion you need styling for?",
    ],
    totalSubmissions: 198,
    submissions: [
      { id: "s5", name: "Priya S.",  phone: "+91 91234 56789", city: "Jaipur",   answers: { q0: "Casual chic",   q1: "Wedding" }, submittedAt: "15 May, 11:00 AM" },
      { id: "s6", name: "Meera D.", phone: "+91 80123 45678", city: "Ahmedabad", answers: { q0: "Ethnic/Indian", q1: "Festival" }, submittedAt: "14 May, 4:20 PM" },
    ],
    createdAt: "9 May",
    status: "completed",
  },
];

// ── Lead Form Card ─────────────────────────────────────────────────────────────
function LeadFormCard({ form }: { form: LeadForm }) {
  const [expanded, setExpanded] = useState(false);
  const planColor = form.plan === "VIP Diamond"
    ? "text-violet-600 border-violet-300 bg-violet-50 dark:bg-violet-950/20"
    : "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20";
  const statusColor = form.status === "active"
    ? "text-green-600 bg-green-50 border-green-200"
    : form.status === "paused"
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-slate-600 bg-slate-100 border-slate-200";

  return (
    <Card className="border border-border">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 shrink-0">
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{form.title}</span>
              <Badge variant="outline" className={`text-[10px] ${planColor} gap-0.5`}>
                <Crown className="w-2.5 h-2.5 inline mr-0.5" />{form.plan}
              </Badge>
              <Badge variant="outline" className={`text-[10px] border ${statusColor}`}>
                {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{form.advertiser} · {form.advertiserCity}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Created {form.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total Leads",      val: form.totalSubmissions.toLocaleString(), color: "text-blue-600" },
            { label: "Form Fields",      val: form.fields.length,                     color: "text-violet-600" },
            { label: "Custom Questions", val: form.customQuestions.length,            color: "text-rose-600" },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-muted/50 rounded-lg p-2.5 text-center">
              <div className={`text-lg font-bold ${color}`}>{val}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Fields collected */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">FIELDS COLLECTED</p>
          <div className="flex flex-wrap gap-1.5">
            {form.fields.map(f => (
              <span key={f.key} className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">{f.label}</span>
            ))}
          </div>
        </div>

        {/* Custom questions */}
        {form.customQuestions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">CUSTOM QUESTIONS</p>
            <div className="space-y-1">
              {form.customQuestions.map((q, i) => (
                <div key={i} className="text-xs text-foreground flex gap-1.5">
                  <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle submissions */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between text-xs font-semibold text-blue-600 pt-2 border-t border-border/50"
        >
          <span>View Submissions ({form.submissions.length} shown of {form.totalSubmissions})</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Submissions list */}
        {expanded && (
          <div className="space-y-2 mt-1">
            {form.submissions.map((sub) => (
              <div key={sub.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {sub.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{sub.name}</p>
                      <p className="text-[10px] text-muted-foreground">{sub.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {sub.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{sub.phone}</span>}
                    {sub.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{sub.email}</span>}
                    {sub.city  && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{sub.city}</span>}
                  </div>
                </div>
                {Object.keys(sub.answers).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {form.customQuestions.map((q, qi) => sub.answers[`q${qi}`] ? (
                      <div key={qi} className="bg-background rounded p-2 text-xs">
                        <p className="text-muted-foreground truncate">{q}</p>
                        <p className="font-semibold text-foreground mt-0.5">{sub.answers[`q${qi}`]}</p>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1.5 mt-1">
              <Download className="w-3 h-3" /> Export All {form.totalSubmissions} Leads as CSV
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Chart data ─────────────────────────────────────────────────────────────────
const spendData = [
  { date: "12 May", spend: 4200, reach: 14000 },
  { date: "13 May", spend: 5800, reach: 21000 },
  { date: "14 May", spend: 6100, reach: 24500 },
  { date: "15 May", spend: 7400, reach: 29800 },
  { date: "16 May", spend: 8900, reach: 38200 },
  { date: "17 May", spend: 7200, reach: 31000 },
  { date: "18 May", spend: 9800, reach: 41600 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const OBJ_META: Record<Objective, { icon: typeof Globe; label: string; color: string; bg: string }> = {
  reach:     { icon: Globe,    label: "Reach",     color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-200" },
  leads:     { icon: UserPlus, label: "Leads",     color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200" },
  reactions: { icon: Heart,    label: "Reactions", color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200" },
};

const STATUS_META: Record<PromoStatus, { label: string; cls: string }> = {
  pending:   { label: "Pending Review", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30" },
  active:    { label: "Active",         cls: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30" },
  paused:    { label: "Paused",         cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30" },
  completed: { label: "Completed",      cls: "bg-slate-100 text-slate-600 border-slate-200" },
  rejected:  { label: "Rejected",       cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30" },
};

function PromoCard({ promo, onAction }: { promo: Promotion; onAction: (id: string, action: PromoStatus) => void }) {
  const obj  = OBJ_META[promo.objective];
  const st   = STATUS_META[promo.status];
  const ObjIcon = obj.icon;
  const planColor = promo.plan === "VIP Diamond" ? "text-violet-600 border-violet-300 bg-violet-50 dark:bg-violet-950/20" : "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20";

  const spendPct = promo.totalBudget > 0 ? Math.min(100, Math.round((promo.spentSoFar / promo.totalBudget) * 100)) : 0;

  return (
    <Card className={`border transition-all ${promo.status === "pending" ? "border-amber-200 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10" : "border-border"}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg border shrink-0 ${obj.bg}`}>
            <ObjIcon className={`w-4 h-4 ${obj.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{promo.user}</span>
              <span className="text-xs text-muted-foreground">{promo.userCity}</span>
              <Badge variant="outline" className={`text-[10px] ${planColor} gap-0.5`}>
                <Crown className="w-2.5 h-2.5 inline mr-0.5" />{promo.plan}
              </Badge>
              <Badge variant="outline" className={`text-[10px] border ${st.cls}`}>{st.label}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1"><Target className="w-3 h-3" />{obj.label} · {promo.target === "profile" ? "Profile" : "Post"}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{promo.gender}, {promo.age}, {promo.city}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{promo.submittedAt}</span>
            </div>
          </div>
        </div>

        {/* Budget & reach row */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { label: "Daily Budget",  val: `₹${promo.budgetPerDay}` },
            { label: "Duration",      val: `${promo.durationDays}d` },
            { label: "Total Budget",  val: `₹${promo.totalBudget.toLocaleString()}` },
            { label: "Est. Reach",    val: promo.estReach },
            { label: promo.objective === "reach" ? "Actual Reach" : promo.objective === "leads" ? "Leads" : "Reactions",
              val: promo.actualReach != null ? promo.actualReach.toLocaleString() : promo.leads != null ? promo.leads.toLocaleString() : promo.reactions != null ? promo.reactions.toLocaleString() : "—" },
          ].map(({ label, val }) => (
            <div key={label} className="bg-muted/50 rounded-lg p-2 text-center">
              <div className="text-xs font-semibold text-foreground">{val}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Spend progress (active/paused/completed) */}
        {promo.spentSoFar > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Spent: ₹{promo.spentSoFar.toLocaleString()}</span>
              <span>{spendPct}% of ₹{promo.totalBudget.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${spendPct}%` }} />
            </div>
          </div>
        )}

        {/* Interests */}
        {promo.interests.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {promo.interests.map(i => (
              <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{i}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {promo.status === "pending" && (
          <div className="flex gap-2 pt-1 border-t border-border/50 flex-wrap">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs gap-1" onClick={() => onAction(promo.id, "active")}>
              <Check className="w-3 h-3" /> Approve & Launch
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs gap-1" onClick={() => onAction(promo.id, "rejected")}>
              <X className="w-3 h-3" /> Reject
            </Button>
          </div>
        )}
        {promo.status === "active" && (
          <div className="flex gap-2 pt-1 border-t border-border/50">
            <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 h-7 text-xs gap-1" onClick={() => onAction(promo.id, "paused")}>
              <Pause className="w-3 h-3" /> Pause
            </Button>
          </div>
        )}
        {promo.status === "paused" && (
          <div className="flex gap-2 pt-1 border-t border-border/50">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs gap-1" onClick={() => onAction(promo.id, "active")}>
              <Play className="w-3 h-3" /> Resume
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 h-7 text-xs gap-1" onClick={() => onAction(promo.id, "rejected")}>
              <X className="w-3 h-3" /> Cancel
            </Button>
          </div>
        )}
        {(promo.status === "completed" || promo.status === "rejected") && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
            {promo.status === "completed"
              ? <><Check className="w-3 h-3 text-green-500" /> Campaign completed successfully</>
              : <><X className="w-3 h-3 text-red-500" /> Campaign was rejected</>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Promotions() {
  const [promos, setPromos]     = useState<Promotion[]>(PROMOTIONS);
  const [search, setSearch]     = useState("");
  const [objFilter, setObjFilter] = useState<"all" | Objective>("all");

  const handleAction = (id: string, action: PromoStatus) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, status: action } : p));
  };

  const filter = (list: Promotion[]) => list.filter(p =>
    (objFilter === "all" || p.objective === objFilter) &&
    (search === "" || p.user.toLowerCase().includes(search.toLowerCase()) || p.userCity.toLowerCase().includes(search.toLowerCase()))
  );

  const pending   = filter(promos.filter(p => p.status === "pending"));
  const active    = filter(promos.filter(p => p.status === "active"));
  const paused    = filter(promos.filter(p => p.status === "paused"));
  const completed = filter(promos.filter(p => p.status === "completed" || p.status === "rejected"));

  const totalSpend  = promos.reduce((sum, p) => sum + p.spentSoFar, 0);
  const totalActive = promos.filter(p => p.status === "active").length;
  const totalReach  = promos.reduce((sum, p) => sum + (p.actualReach ?? 0), 0);
  const totalLeads  = promos.reduce((sum, p) => sum + (p.leads ?? 0), 0);
  const totalReactions = promos.reduce((sum, p) => sum + (p.reactions ?? 0), 0);
  const totalConversions = totalLeads + totalReactions;
  const pendingCnt  = promos.filter(p => p.status === "pending").length;
  const platformRevenue = Math.round(totalSpend * 0.35);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows = PROMOTIONS.map((p) => ({
            id: p.id,
            user: p.user,
            city: p.userCity,
            plan: p.plan,
            target: p.target,
            objective: p.objective,
            gender: p.gender,
            age: p.age,
            target_city: p.city,
            budget_per_day: p.budgetPerDay,
            duration_days: p.durationDays,
            total_budget: p.totalBudget,
            est_reach: p.estReach,
            actual_reach: p.actualReach ?? 0,
            leads: p.leads ?? 0,
            reactions: p.reactions ?? 0,
            spent_sofar: p.spentSoFar,
            start_date: p.startDate ?? "",
            end_date: p.endDate ?? "",
            status: p.status,
            submitted_at: p.submittedAt,
          }));
          downloadCSV("promotions-report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Promotions & Boosts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage profile & post ad campaigns submitted by Premium users</p>
        </div>
        <Badge className="gap-1.5 bg-violet-100 text-violet-700 border-violet-300">
          <Zap className="w-3 h-3" /> Premium Feature
        </Badge>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending Review",  value: pendingCnt,                       icon: AlertTriangle, color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200" },
          { label: "Active Campaigns",value: totalActive,                       icon: Play,          color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/20 border-green-200" },
          { label: "Total Reached",   value: `${(totalReach/1000).toFixed(0)}K`,icon: Globe,         color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20 border-violet-200" },
          { label: "Platform Spend",  value: `₹${totalSpend.toLocaleString()}`, icon: IndianRupee,   color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200" },
          { label: "Conversions",     value: totalConversions.toLocaleString(), icon: Zap,           color: "text-teal-600",   bg: "bg-teal-50 dark:bg-teal-950/20 border-teal-200"   },
          { label: "CTC",             value: `₹${totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : "0.00"}`, icon: Target,        color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200" },
          { label: "CPC",             value: `₹${totalReach > 0 ? (totalSpend / totalReach).toFixed(2) : "0.00"}`, icon: MousePointer,  color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200"    },
          { label: "ROAS",            value: `${platformRevenue > 0 ? ((platformRevenue / totalSpend) * 100).toFixed(1) : "0.0"}%`, icon: TrendingUp,    color: "text-pink-600",   bg: "bg-pink-50 dark:bg-pink-950/20 border-pink-200"   },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className={`border ${bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg} border`}><Icon className={`w-4 h-4 ${color}`} /></div>
              <div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-rose-500" />Daily Ad Spend (₹)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={spendData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Spend"]} />
                <Bar dataKey="spend" fill="url(#spendGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E91E8C" />
                    <stop offset="100%" stopColor="#7B2FBE" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-violet-500" />Daily Reach (People)</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={spendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => [v.toLocaleString(), "Reach"]} />
                <Line type="monotone" dataKey="reach" stroke="#7B2FBE" strokeWidth={2} dot={{ fill: "#7B2FBE", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by user or city…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={objFilter} onValueChange={v => setObjFilter(v as typeof objFilter)}>
          <SelectTrigger className="w-[170px]">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="Objective" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Objectives</SelectItem>
            <SelectItem value="reach">Reach</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="reactions">Reactions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="pending">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="pending" className="gap-2">
            Pending Review
            {pendingCnt > 0 && <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pendingCnt}</span>}
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({active.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused ({paused.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="leadforms" className="gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            Lead Forms
            <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{LEAD_FORMS.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground"><Check className="w-8 h-8 mx-auto mb-2 text-green-500" />No pending promotions</CardContent></Card>
            : pending.map(p => <PromoCard key={p.id} promo={p} onAction={handleAction} />)}
        </TabsContent>
        <TabsContent value="active" className="mt-4 space-y-3">
          {active.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No active campaigns right now.</CardContent></Card>
            : active.map(p => <PromoCard key={p.id} promo={p} onAction={handleAction} />)}
        </TabsContent>
        <TabsContent value="paused" className="mt-4 space-y-3">
          {paused.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No paused campaigns.</CardContent></Card>
            : paused.map(p => <PromoCard key={p.id} promo={p} onAction={handleAction} />)}
        </TabsContent>
        <TabsContent value="history" className="mt-4 space-y-3">
          {completed.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No completed campaigns yet.</CardContent></Card>
            : completed.map(p => <PromoCard key={p.id} promo={p} onAction={handleAction} />)}
        </TabsContent>

        {/* ── Lead Forms tab ── */}
        <TabsContent value="leadforms" className="mt-4 space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Lead Forms",       val: LEAD_FORMS.length,                                          color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200" },
              { label: "Total Submissions",val: LEAD_FORMS.reduce((s, f) => s + f.totalSubmissions, 0).toLocaleString(), color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20 border-violet-200" },
              { label: "Avg. per Form",    val: Math.round(LEAD_FORMS.reduce((s, f) => s + f.totalSubmissions, 0) / LEAD_FORMS.length).toLocaleString(), color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200" },
            ].map(({ label, val, color, bg }) => (
              <Card key={label} className={`border ${bg}`}>
                <CardContent className="p-3 text-center">
                  <div className={`text-2xl font-bold ${color}`}>{val}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            {LEAD_FORMS.map(form => <LeadFormCard key={form.id} form={form} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

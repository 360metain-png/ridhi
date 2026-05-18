import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, Check, Trash2, Ban, ShieldAlert, MessageSquareWarning,
  FileText, User, Radio, Phone, Video, Clock, ChevronDown, ChevronUp
} from "lucide-react";

type ReportCategory = "post" | "user" | "audio-call" | "video-call";
type ReportStatus   = "pending" | "reviewed" | "removed";

interface Report {
  id: string;
  category: ReportCategory;
  reason: string;
  targetName: string;
  targetContent?: string;
  reporterName: string;
  reporterCity: string;
  reportCount: number;
  createdAt: string;
  status: ReportStatus;
}

const INITIAL_REPORTS: Report[] = [
  // ── Post Reports (User-to-User) ──────────────────────────────────────────
  { id: "r1",  category: "post",       reason: "Inappropriate Content",        targetName: "Rahul V",        targetContent: "Offensive language directed at a religious group — needs immediate removal.", reporterName: "Ananya Singh",  reporterCity: "Delhi",     reportCount: 14, createdAt: "5 min ago",  status: "pending"  },
  { id: "r4",  category: "post",       reason: "Spam / Misleading",             targetName: "TechDeals_In",   targetContent: "Click here to earn ₹5000/day — guaranteed! No investment needed!!!",        reporterName: "Arjun Kumar",   reporterCity: "Bangalore", reportCount: 31, createdAt: "1h ago",     status: "pending"  },
  { id: "r6",  category: "post",       reason: "Violence / Graphic Content",    targetName: "NewsFlash_Real", targetContent: "Graphic video clip shared without content warning — disturbing imagery.",    reporterName: "Rohit Verma",   reporterCity: "Mumbai",    reportCount: 9,  createdAt: "3h ago",     status: "pending"  },
  { id: "r8",  category: "post",       reason: "Copyright Violation",           targetName: "MusicFan_India", targetContent: "Full Bollywood song uploaded without any attribution or license.",           reporterName: "Dev Thakur",    reporterCity: "Chennai",   reportCount: 2,  createdAt: "5h ago",     status: "reviewed" },
  { id: "r10", category: "post",       reason: "Misinformation",                targetName: "HealthGuru_99",  targetContent: "Claiming turmeric cures diabetes — urging users to stop medication.",      reporterName: "Aditya Shah",   reporterCity: "Jaipur",    reportCount: 6,  createdAt: "8h ago",     status: "removed"  },
  // ── User Reports (User-to-User) ──────────────────────────────────────────
  { id: "r2",  category: "user",       reason: "Fake Account / Impersonation",  targetName: "Riya_Bollywood", targetContent: undefined,                                                                  reporterName: "Priya Sharma",  reporterCity: "Mumbai",    reportCount: 7,  createdAt: "12 min ago", status: "pending"  },
  { id: "r5",  category: "user",       reason: "Underage User",                 targetName: "KidUser_2010",   targetContent: undefined,                                                                  reporterName: "Kavya Reddy",   reporterCity: "Hyderabad", reportCount: 3,  createdAt: "2h ago",     status: "pending"  },
  { id: "r9",  category: "user",       reason: "Harassment / Bullying",         targetName: "TrollAcc_8291",  targetContent: undefined,                                                                  reporterName: "Divya Nair",    reporterCity: "Kochi",     reportCount: 18, createdAt: "6h ago",     status: "removed"  },
  // ── Audio Call Complaints (User-to-Host) ─────────────────────────────────
  { id: "r3",  category: "audio-call", reason: "Harassment During Audio Call",  targetName: "HostKing99",     targetContent: "Host repeatedly targeted female listeners with derogatory comments during Bollywood room.", reporterName: "Meera Patel", reporterCity: "Ahmedabad", reportCount: 22, createdAt: "28 min ago", status: "pending"  },
  { id: "r11", category: "audio-call", reason: "Abusive Language in Audio Room",targetName: "DesiGamerBoy",   targetContent: "Consistently uses slurs and profanity during game streams — reported by 5 users in same session.", reporterName: "Sneha Joshi", reporterCity: "Pune",    reportCount: 8,  createdAt: "4h ago",     status: "reviewed" },
  // ── Video Call Complaints (User-to-Host) ─────────────────────────────────
  { id: "r12", category: "video-call", reason: "Inappropriate Behavior on Call", targetName: "VIPHost_Raj",   targetContent: "Host used explicit language and showed inappropriate content during paid 1-on-1 video call.",  reporterName: "Ankit Verma",  reporterCity: "Delhi",     reportCount: 15, createdAt: "45 min ago", status: "pending"  },
  { id: "r13", category: "video-call", reason: "Scam / Fraud Attempt",           targetName: "CelebHost_22",  targetContent: "Host requested UPI payment outside platform and blocked user after receiving money.",           reporterName: "Kavita Rao",   reporterCity: "Hyderabad", reportCount: 4,  createdAt: "2h ago",     status: "pending"  },
  { id: "r14", category: "video-call", reason: "Underage Host",                  targetName: "NewHost_2009",  targetContent: undefined,                                                                  reporterName: "Raj Nair",      reporterCity: "Kochi",     reportCount: 6,  createdAt: "7h ago",     status: "removed"  },
];

const CAT_META: Record<ReportCategory, { icon: React.FC<any>; label: string; sublabel: string; color: string; bg: string }> = {
  "post":       { icon: FileText, label: "Post Report",        sublabel: "User → User",  color: "text-blue-600",  bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" },
  "user":       { icon: User,     label: "User Report",        sublabel: "User → User",  color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  "audio-call": { icon: Phone,    label: "Audio Call Complaint",sublabel: "User → Host",  color: "text-violet-600",bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800" },
  "video-call": { icon: Video,    label: "Video Call Complaint",sublabel: "User → Host",  color: "text-rose-600",  bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800" },
};

const SEVERITY = (n: number) =>
  n >= 15 ? "bg-red-100 text-red-700 border-red-200" :
  n >= 5  ? "bg-orange-100 text-orange-700 border-orange-200" :
            "bg-yellow-100 text-yellow-700 border-yellow-200";

type FilterType = "all" | "user-to-user" | "user-to-host";

function ReportCard({ report, onAction }: { report: Report; onAction: (id: string, action: "approve" | "remove" | "warn" | "ban") => void }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CAT_META[report.category];
  const Icon = meta.icon;
  const isCallComplaint = report.category === "audio-call" || report.category === "video-call";

  return (
    <Card className={`border ${meta.bg} transition-all`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${meta.bg} border shrink-0`}>
              <Icon className={`w-4 h-4 ${meta.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{report.targetName}</span>
                <Badge variant="outline" className={`text-xs ${meta.color}`}>{meta.label}</Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground border-border">{meta.sublabel}</Badge>
                <Badge variant="outline" className={`text-xs border ${SEVERITY(report.reportCount)}`}>
                  <AlertTriangle className="w-3 h-3 mr-1 inline" />{report.reportCount} reports
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">{report.reason}</span>
                <span>·</span>
                <span>Reported by <span className="font-medium">{report.reporterName}</span> ({report.reporterCity})</span>
                <span>·</span>
                <Clock className="w-3 h-3 inline" /> {report.createdAt}
              </div>
            </div>
            {report.targetContent && (
              <Button variant="ghost" size="sm" className="shrink-0 h-7 px-2" onClick={() => setExpanded(e => !e)}>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            )}
          </div>

          {expanded && report.targetContent && (
            <div className="bg-muted/60 rounded-lg px-3 py-2 text-sm text-muted-foreground italic border border-border">
              "{report.targetContent}"
            </div>
          )}

          {report.status === "pending" && (
            <div className="flex gap-2 flex-wrap pt-1 border-t border-border/50">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs" onClick={() => onAction(report.id, "approve")}>
                <Check className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onAction(report.id, "remove")}>
                <Trash2 className="w-3 h-3 mr-1" /> {isCallComplaint ? "Remove Host" : "Remove Content"}
              </Button>
              <Button size="sm" variant="outline" className="text-amber-600 hover:bg-amber-50 h-7 text-xs" onClick={() => onAction(report.id, "warn")}>
                <MessageSquareWarning className="w-3 h-3 mr-1" /> Warn {isCallComplaint ? "Host" : "User"}
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 h-7 text-xs" onClick={() => onAction(report.id, "ban")}>
                <Ban className="w-3 h-3 mr-1" /> Ban {isCallComplaint ? "Host" : "User"}
              </Button>
            </div>
          )}
          {report.status === "reviewed" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium pt-1 border-t border-border/50">
              <Check className="w-3 h-3" /> Reviewed — no action taken
            </div>
          )}
          {report.status === "removed" && (
            <div className="flex items-center gap-2 text-xs text-red-600 font-medium pt-1 border-t border-border/50">
              <ShieldAlert className="w-3 h-3" /> Action taken — content/account removed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContentModeration() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [filterType, setFilterType] = useState<FilterType>("all");

  const handleAction = (id: string, action: "approve" | "remove" | "warn" | "ban") => {
    setReports(prev => prev.map(r =>
      r.id === id ? { ...r, status: action === "approve" ? "reviewed" : "removed" } : r
    ));
  };

  const matchFilter = (r: Report) => {
    if (filterType === "user-to-user") return r.category === "post" || r.category === "user";
    if (filterType === "user-to-host") return r.category === "audio-call" || r.category === "video-call";
    return true;
  };

  const filter = (status: ReportStatus) => reports.filter(r => r.status === status && matchFilter(r));

  const pending  = filter("pending");
  const reviewed = filter("reviewed");
  const removed  = filter("removed");

  const totalPending  = reports.filter(r => r.status === "pending").length;
  const totalReviewed = reports.filter(r => r.status === "reviewed").length;
  const totalRemoved  = reports.filter(r => r.status === "removed").length;

  // Per-category pending counts
  const catCounts = Object.fromEntries(
    (["post", "user", "audio-call", "video-call"] as ReportCategory[]).map(cat => [
      cat, reports.filter(r => r.category === cat && r.status === "pending").length
    ])
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Complaints</h1>
          <p className="text-sm text-muted-foreground mt-1">Category-based complaint management system</p>
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Filter by flow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="user-to-user">User → User (Posts)</SelectItem>
            <SelectItem value="user-to-host">User → Host (Calls)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: totalPending,  color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200", Icon: AlertTriangle },
          { label: "Reviewed",       value: totalReviewed, color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/20 border-green-200",   Icon: Check },
          { label: "Action Taken",   value: totalRemoved,  color: "text-red-600",    bg: "bg-red-50 dark:bg-red-950/20 border-red-200",         Icon: Trash2 },
        ].map(({ label, value, color, bg, Icon }) => (
          <Card key={label} className={`border ${bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg} border`}><Icon className={`w-4 h-4 ${color}`} /></div>
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Category breakdown chips ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Category</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["post", "user", "audio-call", "video-call"] as ReportCategory[]).map((cat) => {
            const meta = CAT_META[cat];
            const Icon = meta.icon;
            const count = catCounts[cat];
            return (
              <div key={cat} className={`flex items-center gap-2.5 p-3 rounded-xl border ${meta.bg}`}>
                <Icon className={`w-4 h-4 ${meta.color} shrink-0`} />
                <div className="min-w-0">
                  <div className={`text-xs font-semibold ${meta.color} truncate`}>{meta.label}</div>
                  <div className="text-xs text-muted-foreground">{meta.sublabel}</div>
                </div>
                {count > 0 && (
                  <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold shrink-0">{count}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pending.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{pending.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewed.length})</TabsTrigger>
          <TabsTrigger value="removed">Action Taken ({removed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
              All clear — no pending reports!
            </CardContent></Card>
          ) : pending.map(r => <ReportCard key={r.id} report={r} onAction={handleAction} />)}
        </TabsContent>

        <TabsContent value="reviewed" className="mt-4 space-y-3">
          {reviewed.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No reviewed reports yet.</CardContent></Card>
            : reviewed.map(r => <ReportCard key={r.id} report={r} onAction={handleAction} />)}
        </TabsContent>

        <TabsContent value="removed" className="mt-4 space-y-3">
          {removed.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No action taken yet.</CardContent></Card>
            : removed.map(r => <ReportCard key={r.id} report={r} onAction={handleAction} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

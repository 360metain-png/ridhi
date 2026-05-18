import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, Check, Trash2, Ban, ShieldAlert, MessageSquareWarning,
  FileText, User, Radio, Clock, ChevronDown, ChevronUp
} from "lucide-react";

type ReportType  = "post" | "user" | "host";
type ReportStatus = "pending" | "reviewed" | "removed";

interface Report {
  id: string;
  type: ReportType;
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
  { id: "r1",  type: "post", reason: "Inappropriate Content", targetName: "Rahul V",     targetContent: "Offensive language directed at a religious group — this should be removed immediately...", reporterName: "Ananya Singh", reporterCity: "Delhi",     reportCount: 14, createdAt: "5 min ago",  status: "pending" },
  { id: "r2",  type: "user", reason: "Fake Account / Impersonation",  targetName: "Riya_Bollywood", targetContent: undefined,                                                              reporterName: "Priya Sharma", reporterCity: "Mumbai",    reportCount: 7,  createdAt: "12 min ago", status: "pending" },
  { id: "r3",  type: "host", reason: "Harassment During Live",         targetName: "HostKing99",     targetContent: "Repeatedly targeting female viewers with derogatory comments during stream.", reporterName: "Meera Patel", reporterCity: "Ahmedabad", reportCount: 22, createdAt: "28 min ago", status: "pending" },
  { id: "r4",  type: "post", reason: "Spam / Misleading",              targetName: "TechDeals_In",   targetContent: "Click here to earn ₹5000/day — guaranteed! No investment needed!!! LIMITED TIME", reporterName: "Arjun Kumar", reporterCity: "Bangalore", reportCount: 31, createdAt: "1h ago",     status: "pending" },
  { id: "r5",  type: "user", reason: "Underage User",                  targetName: "KidUser_2010",   targetContent: undefined,                                                              reporterName: "Kavya Reddy", reporterCity: "Hyderabad", reportCount: 3,  createdAt: "2h ago",     status: "pending" },
  { id: "r6",  type: "post", reason: "Violence / Graphic Content",     targetName: "NewsFlash_Real", targetContent: "Graphic video clip shared without content warning — disturbing imagery visible.", reporterName: "Rohit Verma", reporterCity: "Mumbai",    reportCount: 9,  createdAt: "3h ago",     status: "pending" },
  { id: "r7",  type: "host", reason: "Abusive Language in Stream",     targetName: "DesiGamerBoy",   targetContent: "Consistently uses slurs and profanity during game streams targeting teammates.",  reporterName: "Sneha Joshi", reporterCity: "Pune",      reportCount: 5,  createdAt: "4h ago",     status: "reviewed" },
  { id: "r8",  type: "post", reason: "Copyright Violation",            targetName: "MusicFan_India", targetContent: "Full Bollywood song uploaded without any attribution or license.",               reporterName: "Dev Thakur",  reporterCity: "Chennai",   reportCount: 2,  createdAt: "5h ago",     status: "reviewed" },
  { id: "r9",  type: "user", reason: "Harassment / Bullying",          targetName: "TrollAcc_8291",  targetContent: undefined,                                                              reporterName: "Divya Nair",  reporterCity: "Kochi",     reportCount: 18, createdAt: "6h ago",     status: "removed" },
  { id: "r10", type: "post", reason: "Misinformation",                 targetName: "HealthGuru_99",  targetContent: "Claiming that turmeric cures diabetes and stops users from taking medication.",  reporterName: "Aditya Shah", reporterCity: "Jaipur",    reportCount: 6,  createdAt: "8h ago",     status: "removed" },
];

const TYPE_META: Record<ReportType, { icon: React.FC<any>; label: string; color: string; bg: string }> = {
  post: { icon: FileText,  label: "Post",  color: "text-blue-600",  bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" },
  user: { icon: User,      label: "User",  color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  host: { icon: Radio,     label: "Host",  color: "text-rose-600",  bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800" },
};

const SEVERITY_COLOR = (n: number) =>
  n >= 15 ? "bg-red-100 text-red-700 border-red-200" :
  n >= 5  ? "bg-orange-100 text-orange-700 border-orange-200" :
            "bg-yellow-100 text-yellow-700 border-yellow-200";

function ReportCard({ report, onAction }: { report: Report; onAction: (id: string, action: "approve" | "remove" | "warn" | "ban") => void }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[report.type];
  const Icon = meta.icon;

  return (
    <Card className={`border ${meta.bg} transition-all`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Top row */}
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${meta.bg} border shrink-0`}>
              <Icon className={`w-4 h-4 ${meta.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{report.targetName}</span>
                <Badge variant="outline" className={`text-xs ${meta.color}`}>{meta.label} Report</Badge>
                <Badge variant="outline" className={`text-xs border ${SEVERITY_COLOR(report.reportCount)}`}>
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

          {/* Expandable content preview */}
          {expanded && report.targetContent && (
            <div className="bg-muted/60 rounded-lg px-3 py-2 text-sm text-muted-foreground italic border border-border">
              "{report.targetContent}"
            </div>
          )}

          {/* Actions */}
          {report.status === "pending" && (
            <div className="flex gap-2 flex-wrap pt-1 border-t border-border/50">
              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                onClick={() => onAction(report.id, "approve")}>
                <Check className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="destructive" className="h-7 text-xs"
                onClick={() => onAction(report.id, "remove")}>
                <Trash2 className="w-3 h-3 mr-1" /> Remove Content
              </Button>
              <Button size="sm" variant="outline" className="text-amber-600 hover:bg-amber-50 h-7 text-xs"
                onClick={() => onAction(report.id, "warn")}>
                <MessageSquareWarning className="w-3 h-3 mr-1" /> Warn {meta.label}
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 h-7 text-xs"
                onClick={() => onAction(report.id, "ban")}>
                <Ban className="w-3 h-3 mr-1" /> Ban {meta.label}
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
              <ShieldAlert className="w-3 h-3" /> Content removed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContentModeration() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [typeFilter, setTypeFilter] = useState<"all" | ReportType>("all");

  const handleAction = (id: string, action: "approve" | "remove" | "warn" | "ban") => {
    setReports(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: action === "approve" ? "reviewed" : "removed" }
        : r
    ));
  };

  const filter = (status: ReportStatus) =>
    reports.filter(r =>
      r.status === status &&
      (typeFilter === "all" || r.type === typeFilter)
    );

  const pending  = filter("pending");
  const reviewed = filter("reviewed");
  const removed  = filter("removed");

  const totalPending  = reports.filter(r => r.status === "pending").length;
  const totalReviewed = reports.filter(r => r.status === "reviewed").length;
  const totalRemoved  = reports.filter(r => r.status === "removed").length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Complaints</h1>
          <p className="text-sm text-muted-foreground mt-1">User-submitted reports on posts, accounts, and hosts</p>
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Posts Only</SelectItem>
            <SelectItem value="user">Users Only</SelectItem>
            <SelectItem value="host">Hosts Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: totalPending,  color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200", icon: AlertTriangle },
          { label: "Reviewed",       value: totalReviewed, color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/20 border-green-200",   icon: Check },
          { label: "Removed",        value: totalRemoved,  color: "text-red-600",    bg: "bg-red-50 dark:bg-red-950/20 border-red-200",         icon: Trash2 },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={`border ${s.bg}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg} border`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Type breakdown ── */}
      <div className="flex gap-3 flex-wrap">
        {(["post", "user", "host"] as ReportType[]).map((t) => {
          const meta = TYPE_META[t];
          const Icon = meta.icon;
          const count = reports.filter(r => r.type === t && r.status === "pending").length;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                ${typeFilter === t ? meta.bg + " " + meta.color : "bg-card text-muted-foreground hover:bg-muted border-border"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {meta.label} Reports
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${typeFilter === t ? "" : "bg-red-100 text-red-700"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending Review
            {totalPending > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{totalPending}</span>}
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({totalReviewed})</TabsTrigger>
          <TabsTrigger value="removed">Removed ({totalRemoved})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
              No pending reports — all clear!
            </CardContent></Card>
          ) : pending.map(r => <ReportCard key={r.id} report={r} onAction={handleAction} />)}
        </TabsContent>

        <TabsContent value="reviewed" className="mt-4 space-y-3">
          {reviewed.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No reviewed reports yet.</CardContent></Card>
          ) : reviewed.map(r => <ReportCard key={r.id} report={r} onAction={handleAction} />)}
        </TabsContent>

        <TabsContent value="removed" className="mt-4 space-y-3">
          {removed.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No removed content.</CardContent></Card>
          ) : removed.map(r => <ReportCard key={r.id} report={r} onAction={handleAction} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

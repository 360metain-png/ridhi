import { useState, useMemo } from "react";
import { getAdminName } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCSV } from "@/lib/utils";
import DateRangeFilter, { filterByDateRange } from "@/components/DateRangeFilter";
import type { DateRange } from "@/components/DateRangeFilter";
import {
  CheckCircle, Clock, AlertTriangle, Zap, BarChart2, Star,
  TrendingUp, Users, ShieldAlert, Coins, IndianRupee, ScanFace,
  Phone, Briefcase, Crown, ClipboardList, Target, Calendar,
  ArrowRight, Download, RefreshCw, Flag, Timer,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────
type TaskStatus = "pending" | "in_progress" | "completed" | "escalated";
type TaskPriority = "high" | "medium" | "low";

interface WorkTask {
  id: string;
  title: string;
  module: string;
  moduleIcon: React.ComponentType<{ className?: string }>;
  assignedBy: string;
  assignedAt: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  count?: number;
  notes?: string;
  date: string; // ISO date for filtering
}

// ── Mock data — scoped to logged-in admin ─────────────────────────────────
const currentAdmin = {
  name: getAdminName()?.split("@")[0] ?? "Admin",
  role: "Content Admin",
  joinedAt: "Jan 2025",
  completedAllTime: 2840,
  rating: 4.8,
};

const MY_TASKS: WorkTask[] = [
  { id: "t1",  title: "Review 47 flagged posts",           module: "Content Moderation", moduleIcon: ShieldAlert, assignedBy: "Super Admin", assignedAt: "Today 9:00 AM",  dueDate: "Today 6:00 PM",    status: "in_progress", priority: "high",   count: 47,  date: "2025-06-14" },
  { id: "t2",  title: "Approve 12 KYC submissions",        module: "E-KYC Verification", moduleIcon: ScanFace,   assignedBy: "Super Admin", assignedAt: "Today 9:00 AM",  dueDate: "Today 5:00 PM",    status: "pending",     priority: "high",   count: 12,  date: "2025-06-14" },
  { id: "t3",  title: "Handle 8 user support tickets",     module: "Users",              moduleIcon: Users,      assignedBy: "Super Admin", assignedAt: "Today 10:30 AM", dueDate: "Today 4:00 PM",    status: "pending",     priority: "medium", count: 8,   date: "2025-06-14" },
  { id: "t4",  title: "Audit 6 community violations",      module: "Communities",        moduleIcon: Users,      assignedBy: "Super Admin", assignedAt: "Yesterday",      dueDate: "Today 12:00 PM",   status: "completed",   priority: "high",   count: 6,   date: "2025-06-13" },
  { id: "t5",  title: "Review 23 live stream recordings",  module: "Recordings",         moduleIcon: Phone,      assignedBy: "Super Admin", assignedAt: "Today 8:00 AM",  dueDate: "Tomorrow 9:00 AM", status: "pending",     priority: "low",    count: 23,  date: "2025-06-14" },
  { id: "t6",  title: "Approve 4 host upgrade requests",   module: "Hosts",              moduleIcon: Star,       assignedBy: "Super Admin", assignedAt: "Today 11:00 AM", dueDate: "Today 3:00 PM",    status: "in_progress", priority: "medium", count: 4,   date: "2025-06-14" },
  { id: "t7",  title: "Respond to 3 escalated complaints", module: "Users",              moduleIcon: Users,      assignedBy: "Super Admin", assignedAt: "2h ago",         dueDate: "Today 2:00 PM",    status: "escalated",   priority: "high",   count: 3,   date: "2025-06-14" },
  { id: "t8",  title: "Validate 18 sponsored post labels", module: "Promotions & Ads",   moduleIcon: Zap,        assignedBy: "Super Admin", assignedAt: "Yesterday",      dueDate: "Tomorrow",         status: "completed",   priority: "medium", count: 18,  date: "2025-06-13" },
  { id: "t9",  title: "Review 9 reported comments",        module: "Content Moderation", moduleIcon: ShieldAlert,assignedBy: "Super Admin", assignedAt: "Today 7:00 AM",  dueDate: "Today 1:00 PM",    status: "completed",   priority: "medium", count: 9,   date: "2025-06-14" },
  { id: "t10", title: "Quarterly content audit report",    module: "Analytics",          moduleIcon: BarChart2,  assignedBy: "Super Admin", assignedAt: "May 18",         dueDate: "May 25",           status: "in_progress", priority: "low",              date: "2025-05-18" },
];

const weeklyData = [
  { day: "Mon", completed: 28, assigned: 32 },
  { day: "Tue", completed: 34, assigned: 38 },
  { day: "Wed", completed: 41, assigned: 41 },
  { day: "Thu", completed: 22, assigned: 30 },
  { day: "Fri", completed: 38, assigned: 42 },
  { day: "Sat", completed: 14, assigned: 16 },
  { day: "Sun", completed: 6,  assigned: 8  },
];

const moduleBreakdown = [
  { module: "Content Mod",    tasks: 34, completed: 28 },
  { module: "KYC",            tasks: 18, completed: 16 },
  { module: "Users",          tasks: 22, completed: 18 },
  { module: "Communities",    tasks: 12, completed: 12 },
  { module: "Recordings",     tasks: 8,  completed: 4  },
  { module: "Hosts",          tasks: 6,  completed: 3  },
  { module: "Promotions",     tasks: 10, completed: 9  },
];

const STATUS_STYLE: Record<TaskStatus, string> = {
  completed:   "bg-green-100  text-green-700  border-green-200",
  in_progress: "bg-blue-100   text-blue-700   border-blue-200",
  pending:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  escalated:   "bg-red-100    text-red-700    border-red-200",
};
const STATUS_ICON: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  completed:   CheckCircle,
  in_progress: RefreshCw,
  pending:     Clock,
  escalated:   AlertTriangle,
};
const PRIORITY_STYLE: Record<TaskPriority, string> = {
  high:   "bg-red-50   text-red-700   border-red-200",
  medium: "bg-orange-50 text-orange-700 border-orange-200",
  low:    "bg-muted    text-muted-foreground",
};

export default function MyReportPage() {
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(2025, 3, 1), to: new Date() });

  const dateFiltered = useMemo(() => filterByDateRange(MY_TASKS, dateRange, "date"), [dateRange]);

  const filtered = filter === "all" ? dateFiltered : dateFiltered.filter((t) => t.status === filter);

  const completed   = dateFiltered.filter((t) => t.status === "completed").length;
  const pending     = dateFiltered.filter((t) => t.status === "pending").length;
  const inProgress  = dateFiltered.filter((t) => t.status === "in_progress").length;
  const escalated   = dateFiltered.filter((t) => t.status === "escalated").length;
  const completionRate = Math.round((dateFiltered.length ? completed / dateFiltered.length : 0) * 100);

  const exportData = useMemo(() => filtered.map((t) => ({
    id: t.id, title: t.title, module: t.module, status: t.status, priority: t.priority, assignedAt: t.assignedAt, dueDate: t.dueDate, date: t.date,
  })), [filtered]);

  return (
    <div className="space-y-6">
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        exportFilename="my-report.csv"
        exportData={exportData as Record<string, string | number>[]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" /> My Work Report
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Your assigned tasks, completion metrics, and performance score
          </p>
        </div>
      </div>

      {/* Admin identity card */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {currentAdmin.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg capitalize">{currentAdmin.name}</p>
          <p className="text-sm text-muted-foreground">{currentAdmin.role} · Since {currentAdmin.joinedAt}</p>
        </div>
        <div className="hidden md:grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-700">{currentAdmin.completedAllTime.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Actions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Today's Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600 flex items-center gap-1 justify-center"><Star className="w-5 h-5" />{currentAdmin.rating}</p>
            <p className="text-xs text-muted-foreground">Performance</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Completed Today",  value: completed,  icon: CheckCircle, color: "text-green-600  bg-green-50"  },
          { label: "In Progress",      value: inProgress, icon: RefreshCw,   color: "text-blue-600   bg-blue-50"   },
          { label: "Pending",          value: pending,    icon: Clock,       color: "text-yellow-600 bg-yellow-50" },
          { label: "Escalated",        value: escalated,  icon: AlertTriangle, color: "text-red-600  bg-red-50"    },
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

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks"     className="gap-1.5"><ClipboardList className="w-3.5 h-3.5" />Task Queue</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart2 className="w-3.5 h-3.5" />Performance</TabsTrigger>
        </TabsList>

        {/* ── Task Queue ── */}
        <TabsContent value="tasks" className="space-y-4 mt-4">

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {(["all","pending","in_progress","completed","escalated"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors capitalize ${
                  filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
                }`}
              >
                {f === "all" ? `All (${dateFiltered.length})` : f.replace("_", " ") + ` (${dateFiltered.filter((t) => t.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="space-y-2">
            {filtered.map((task) => {
              const SIcon = STATUS_ICON[task.status];
              const Icon  = task.moduleIcon;
              return (
                <Card key={task.id} className={`border-l-4 ${
                  task.priority === "high" ? "border-l-red-400" :
                  task.priority === "medium" ? "border-l-orange-400" : "border-l-slate-200"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{task.title}</span>
                          {task.count && (
                            <Badge variant="secondary" className="text-xs">{task.count} items</Badge>
                          )}
                          <Badge variant="outline" className={`text-[10px] px-2 border ${PRIORITY_STYLE[task.priority]}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{task.module}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Assigned: {task.assignedAt}</span>
                          <span className="flex items-center gap-1"><Timer className="w-3 h-3" />Due: {task.dueDate}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>by {task.assignedBy}</span>
                        </div>
                        {task.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{task.notes}"</p>}
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className={`text-[10px] px-2 h-5 gap-1 border ${STATUS_STYLE[task.status]}`}>
                          <SIcon className="w-2.5 h-2.5" />
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Performance analytics ── */}
        <TabsContent value="analytics" className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Weekly completion chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> This Week — Assigned vs Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="assigned"  name="Assigned"  fill="#DDD6FE" radius={[4,4,0,0]} />
                      <Bar dataKey="completed" name="Completed" fill="#7B2FBE" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Module breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-pink-500" /> Module Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {moduleBreakdown.map((m) => {
                  const pct = Math.round(m.completed / m.tasks * 100);
                  return (
                    <div key={m.module} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{m.module}</span>
                        <span className="text-muted-foreground">{m.completed}/{m.tasks} · {pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Performance score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Performance Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Completion Rate",    score: 92, desc: "Tasks completed on time"     },
                  { label: "Response Time",      score: 88, desc: "Avg time to start a task"    },
                  { label: "Accuracy",           score: 96, desc: "Correctly resolved tasks"    },
                  { label: "Escalation Rate",    score: 78, desc: "Low escalations = higher score" },
                ].map((s) => (
                  <div key={s.label} className="text-center space-y-2">
                    <div className="relative w-16 h-16 mx-auto">
                      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7B2FBE" strokeWidth="3"
                          strokeDasharray={`${s.score} ${100 - s.score}`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{s.score}</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">{s.desc}</p>
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

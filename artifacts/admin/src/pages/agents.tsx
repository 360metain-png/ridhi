import { useState } from "react";
import { getAdminRole, getAdminName } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase, Users, TrendingUp, IndianRupee, Star, Eye,
  Search, Award, Plus, CheckCircle, XCircle, Clock,
  Phone, MapPin, ShieldAlert, ArrowRight, Info, Trash2,
  ShieldOff, UserCheck, ChevronRight, Network, UserPlus,
  Crown, Lock, Rocket, Wrench, Download, AlertTriangle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { downloadCSV } from "@/lib/utils";
import { getSharedAdmins, useSharedAdmins } from "@/lib/admin-store";

// ── Types ─────────────────────────────────────────────────────────────────────

type AgentStatus = "active" | "suspended" | "removed";

interface Admin {
  id: string;
  name: string;
  email: string;
  agentCount: number;
}

interface Agent {
  id: string;
  name: string;
  city: string;
  phone: string;
  level: string;
  hosts: number;
  activeHosts: number;
  commission: number;
  totalHostEarnings: number;
  earned: number;
  pendingPayout: number;
  status: AgentStatus;
  joinDate: string;
  topHost: string;
  adminId: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getLiveAdmins(): Admin[] {
  return getSharedAdmins()
    .filter((a) => a.status === "active")
    .map((a) => ({ id: a.id, name: a.name + " (Admin)", email: a.email, agentCount: 0 }));
}

const AGENT_LEVELS = [
  { level: "A1", title: "Agent",        hostsRequired: 5,   commissionRate: 2,  color: "#9E9E9E", icon: "🥉" },
  { level: "A2", title: "Senior Agent", hostsRequired: 20,  commissionRate: 4,  color: "#4CAF50", icon: "🥈" },
  { level: "A3", title: "Super Agent",  hostsRequired: 60,  commissionRate: 6,  color: "#2196F3", icon: "🥇" },
  { level: "A4", title: "Elite Agent",  hostsRequired: 150, commissionRate: 8,  color: "#FF9800", icon: "💎" },
  { level: "A5", title: "Master Agent", hostsRequired: 250, commissionRate: 10, color: "#E91E8C", icon: "👑" },
];

const INITIAL_AGENTS: Agent[] = [
  { id: "a1", name: "Vikram Rao",    city: "Delhi",     phone: "+91 98001 11111", level: "A5", hosts: 312, activeHosts: 289, commission: 10, totalHostEarnings: 2840000, earned: 284000, pendingPayout: 48000, status: "active",    joinDate: "Jan 2024", topHost: "Priya Sharma", adminId: "adm1" },
  { id: "a2", name: "Sunita Joshi",  city: "Mumbai",    phone: "+91 98002 22222", level: "A4", hosts: 178, activeHosts: 142, commission: 8,  totalHostEarnings: 1775000, earned: 142000, pendingPayout: 21000, status: "active",    joinDate: "Mar 2024", topHost: "Rahul Verma",  adminId: "adm1" },
  { id: "a3", name: "Deepak Singh",  city: "Bangalore", phone: "+91 98003 33333", level: "A3", hosts: 74,  activeHosts: 58,  commission: 6,  totalHostEarnings: 1400000, earned: 84000,  pendingPayout: 14000, status: "active",    joinDate: "May 2024", topHost: "Kavya R",      adminId: "adm2" },
  { id: "a4", name: "Meena Kumari",  city: "Hyderabad", phone: "+91 98004 44444", level: "A2", hosts: 28,  activeHosts: 19,  commission: 4,  totalHostEarnings: 1050000, earned: 42000,  pendingPayout: 8000,  status: "active",    joinDate: "Jun 2024", topHost: "Dev T",        adminId: "adm2" },
  { id: "a5", name: "Rajan Pillai",  city: "Kochi",     phone: "+91 98005 55555", level: "A1", hosts: 7,   activeHosts: 5,   commission: 2,  totalHostEarnings:  600000, earned: 12000,  pendingPayout: 3000,  status: "active",    joinDate: "Aug 2024", topHost: "Ananya S",     adminId: "adm3" },
  { id: "a6", name: "Preethi Nair",  city: "Chennai",   phone: "+91 98006 66666", level: "A2", hosts: 24,  activeHosts: 16,  commission: 4,  totalHostEarnings:  950000, earned: 38000,  pendingPayout: 0,     status: "suspended", joinDate: "Apr 2024", topHost: "Kiran N",      adminId: "adm3" },
];

const PENDING_AGENTS = [
  { id: "pa1", name: "Suresh Malhotra", city: "Pune",      phone: "+91 98765 43210", appliedAt: "2 hours ago",  hosts: 12, experience: "2 years in talent mgmt" },
  { id: "pa2", name: "Lakshmi Devi",    city: "Chennai",   phone: "+91 87654 32109", appliedAt: "5 hours ago",  hosts: 8,  experience: "Ex-host, 1.5 years"     },
  { id: "pa3", name: "Gopal Reddy",     city: "Hyderabad", phone: "+91 76543 21098", appliedAt: "1 day ago",    hosts: 0,  experience: "New to platform"        },
];

// ── Agent Complaints (from hosts) ──────────────────────────────────────────

interface AgentComplaint {
  id: string;
  agentId: string;
  hostName: string;
  hostId: string;
  reason: string;
  detail: string;
  filedAt: string;
  status: "open" | "resolved" | "escalated";
}

const AGENT_COMPLAINTS: AgentComplaint[] = [
  { id: "c1", agentId: "a1", hostName: "Riya Das", hostId: "h7", reason: "Delayed payout", detail: "Agent promised payout within 3 days but it has been 2 weeks.", filedAt: "2025-06-18", status: "open" },
  { id: "c2", agentId: "a3", hostName: "Rohan Mishra", hostId: "h10", reason: "Unresponsive agent", detail: "Agent does not reply to messages about stream issues.", filedAt: "2025-06-19", status: "open" },
  { id: "c3", agentId: "a2", hostName: "Meera Pillai", hostId: "h5", reason: "Incorrect commission", detail: "Commission calculated as 4% instead of agreed 6%.", filedAt: "2025-06-15", status: "resolved" },
  { id: "c4", agentId: "a1", hostName: "Arjun Shah", hostId: "h6", reason: "Forced stream hours", detail: "Agent pressuring me to stream beyond 30h checkpoint.", filedAt: "2025-06-20", status: "escalated" },
];

const agentEarningsData = [
  { month: "Aug", a5: 140000, a4: 82000, a3: 44000, a2: 18000, a1: 6000 },
  { month: "Sep", a5: 168000, a4: 94000, a3: 52000, a2: 22000, a1: 8000 },
  { month: "Oct", a5: 192000, a4: 112000, a3: 61000, a2: 28000, a1: 10000 },
  { month: "Nov", a5: 224000, a4: 128000, a3: 72000, a2: 32000, a1: 11000 },
  { month: "Dec", a5: 284000, a4: 142000, a3: 84000, a2: 42000, a1: 12000 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const levelColor = (l: string) => AGENT_LEVELS.find(a => a.level === l)?.color ?? "#888";
const levelIcon  = (l: string) => AGENT_LEVELS.find(a => a.level === l)?.icon  ?? "🔘";

const STATUS_META: Record<AgentStatus, { label: string; cls: string; dot: string }> = {
  active:    { label: "Active",    cls: "text-green-600", dot: "bg-green-500"  },
  suspended: { label: "Suspended", cls: "text-amber-600", dot: "bg-amber-500"  },
  removed:   { label: "Removed",   cls: "text-red-600",   dot: "bg-red-500"    },
};

// ── Assign Agent Dialog ───────────────────────────────────────────────────────

function AssignDialog({
  agent, admins, open, onClose, onAssign,
}: {
  agent: Agent | null;
  admins: Admin[];
  open: boolean;
  onClose: () => void;
  onAssign: (agentId: string, adminId: string) => void;
}) {
  const [pick, setPick] = useState("");
  if (!agent) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-violet-500" />
            Assign Agent to Admin
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="flex items-center gap-3 bg-muted rounded-xl p-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {agent.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <p className="font-semibold text-sm">{agent.name}</p>
              <p className="text-xs text-muted-foreground">{levelIcon(agent.level)} {agent.level} · {agent.city} · {agent.hosts} hosts</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Assign to Admin</p>
            <Select value={pick || agent.adminId} onValueChange={setPick}>
              <SelectTrigger><SelectValue placeholder="Select admin…" /></SelectTrigger>
              <SelectContent>
                {admins.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-violet-500" />
                      {a.name}
                      <span className="text-xs text-muted-foreground">({a.agentCount} agents)</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(pick && pick !== agent.adminId) && (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This will move {agent.name} from <strong>{admins.find(a => a.id === agent.adminId)?.name}</strong> to <strong>{admins.find(a => a.id === pick)?.name}</strong>.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={!pick || pick === agent.adminId}
            onClick={() => { onAssign(agent.id, pick); onClose(); }}>
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Remove Confirm Dialog ─────────────────────────────────────────────────────

function RemoveDialog({
  agent, open, onClose, onConfirm,
}: { agent: Agent | null; open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!agent) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" /> Remove Agent
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <strong className="text-foreground">{agent.name}</strong>?
            This will deactivate their account and unlink their {agent.hosts} hosts.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            This action cannot be undone. Hosts will be reassigned to direct admin oversight.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="destructive" onClick={onConfirm}>Remove Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Recruit Agent Dialog ─────────────────────────────────────────────────────

function RecruitDialog({
  open, admins, onClose, onRecruit,
}: {
  open: boolean;
  admins: Admin[];
  onClose: () => void;
  onRecruit: (agent: Omit<Agent, "id" | "earned" | "pendingPayout" | "status"> & { adminId: string }) => void;
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [adminId, setAdminId] = useState("");
  const [level, setLevel] = useState("A1");
  const [hosts, setHosts] = useState("0");
  const [topHost, setTopHost] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !phone || !adminId) return;
    onRecruit({
      name, city, phone, level, hosts: parseInt(hosts) || 0, activeHosts: 0,
      commission: AGENT_LEVELS.find(l => l.level === level)?.commissionRate ?? 2,
      totalHostEarnings: 0, topHost: topHost || "—",
      joinDate: new Date().toLocaleString("default", { month: "short", year: "numeric" }),
      adminId,
    });
    setName(""); setCity(""); setPhone(""); setAdminId(""); setLevel("A1"); setHosts("0"); setTopHost("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-violet-500" /> Recruit Agent
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-gray-500 uppercase">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Agent full name" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-gray-500 uppercase">City</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai" required />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-gray-500 uppercase">Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" required />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-gray-500 uppercase">Assign to Admin</Label>
            <Select value={adminId} onValueChange={setAdminId} required>
              <SelectTrigger><SelectValue placeholder="Select admin…" /></SelectTrigger>
              <SelectContent>
                {admins.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-violet-500" /> {a.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-gray-500 uppercase">Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AGENT_LEVELS.map(l => <SelectItem key={l.level} value={l.level}>{l.level} — {l.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-gray-500 uppercase">Starting Hosts</Label>
              <Input type="number" min={0} value={hosts} onChange={e => setHosts(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-gray-500 uppercase">Top Host Name</Label>
            <Input value={topHost} onChange={e => setTopHost(e.target.value)} placeholder="Optional" />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white" type="submit" disabled={!name || !city || !phone || !adminId}>
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Recruit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const { toast } = useToast();
  const role = getAdminRole() ?? "admin";
  const myAdminEmail = getAdminName() ?? "";

  // Live admins from shared store
  const liveAdmins = getLiveAdmins();
  const _useShared = useSharedAdmins(); // re-trigger when admins change

  // Determine the current admin's ID (for non-SA roles)
  const myAdminId = role === "admin"
    ? (liveAdmins.find(a => a.email === myAdminEmail)?.id ?? liveAdmins[0]?.id ?? "adm1")
    : null;

  const isSA    = role === "super_admin";
  const isAdmin = role === "admin";

  const [agents, setAgents]         = useState<Agent[]>(INITIAL_AGENTS);
  const [pending, setPending]        = useState(PENDING_AGENTS);
  const [search, setSearch]          = useState("");
  const [adminFilter, setAdminFilter]= useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignTarget, setAssignTarget] = useState<Agent | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Agent | null>(null);
  const [showRecruit, setShowRecruit] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);

  // Role-based data scope
  const scopedAgents = isSA
    ? agents.filter(a => a.status !== "removed")
    : agents.filter(a => a.adminId === myAdminId && a.status !== "removed");

  const filtered = scopedAgents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase());
    const matchAdmin  = adminFilter === "all" || a.adminId === adminFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && (isSA ? matchAdmin : true) && matchStatus;
  });

  const handleSuspend = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id
      ? { ...a, status: a.status === "suspended" ? "active" : "suspended" }
      : a));
    const a = agents.find(x => x.id === id)!;
    toast({ title: a.status === "suspended" ? "Agent reactivated" : "Agent suspended", description: a.name });
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    setAgents(prev => prev.map(a => a.id === removeTarget.id ? { ...a, status: "removed" } : a));
    toast({ title: "Agent removed", description: `${removeTarget.name} has been removed from the platform.`, variant: "destructive" });
    setRemoveTarget(null);
  };

  const handleAssign = (agentId: string, adminId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, adminId } : a));
    const admin = getLiveAdmins().find(x => x.id === adminId)!;
    const agent = agents.find(x => x.id === agentId)!;
    toast({ title: "Agent reassigned", description: `${agent.name} assigned to ${admin.name}` });
  };

  const handleRecruit = (data: Omit<Agent, "id" | "earned" | "pendingPayout" | "status"> & { adminId: string }) => {
    const newAgent: Agent = {
      ...data,
      id: `ag-${Date.now()}`,
      earned: 0,
      pendingPayout: 0,
      status: "active",
    };
    setAgents(prev => [newAgent, ...prev]);
    const admin = getLiveAdmins().find(x => x.id === data.adminId);
    toast({ title: "Agent recruited", description: `${newAgent.name} assigned to ${admin?.name ?? data.adminId}` });
  };

  const totalAgents    = scopedAgents.length;
  const activeAgents   = scopedAgents.filter(a => a.status === "active").length;
  const totalHosts     = scopedAgents.reduce((s, a) => s + a.hosts, 0);
  const totalEarned    = scopedAgents.reduce((s, a) => s + a.earned, 0);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
            const rows: Record<string, string | number>[] = [];
            downloadCSV("agents_report.csv", rows);
          }}>
            <Download className="w-3 h-3" /> Export CSV
          </Button>
        </div>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Agent Management
            {!isSA && (
              <Badge variant="outline" className="text-xs ml-2 border-violet-300 text-violet-600">
                <Lock className="w-3 h-3 mr-1" /> Your agents only
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isSA
              ? "Super Admin — full hierarchy view · assign agents to admins · remove agents"
              : "Admins recruit agents → Agents recruit hosts — manage your network"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSA && (
            <Button variant="outline" className="gap-2" onClick={() => setShowHierarchy(!showHierarchy)}>
              <Network className="w-4 h-4" />
              {showHierarchy ? "Hide" : "Show"} Hierarchy
            </Button>
          )}
          <Button className="gap-2" onClick={() => setShowRecruit(true)}><Plus className="w-4 h-4" /> Recruit Agent</Button>
        </div>
      </div>

      {/* ── Recruitment Chain Banner ── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200">
        <Network className="w-5 h-5 text-violet-600 flex-shrink-0" />
        <div className="flex items-center gap-2 text-sm text-violet-900 flex-wrap">
          <span className="font-bold">Recruitment Chain:</span>
          <span className="flex items-center gap-1 bg-violet-100 border border-violet-300 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <Crown className="w-3 h-3" /> Super Admin
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
          <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <UserCheck className="w-3 h-3" /> Admin <span className="text-blue-400">recruits</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
          <span className="flex items-center gap-1 bg-pink-50 border border-pink-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <Briefcase className="w-3 h-3" /> Agent <span className="text-pink-400">recruits</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
          <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <Star className="w-3 h-3" /> Host
          </span>
        </div>
      </div>

      {/* ── Go Live Readiness Banner ── */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 flex-shrink-0">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-emerald-900">Launch Readiness</p>
                <p className="text-xs text-emerald-700">
                  {isSA
                    ? "All agents across the platform · ensure KYC and host activation before go-live"
                    : `Your agents · ${activeAgents} active · verify host readiness before launch`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1 border-emerald-300 text-emerald-700 bg-white">
                <CheckCircle className="w-3 h-3" />
                {scopedAgents.filter(a => a.status === "active").length} Ready
              </Badge>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                onClick={() => window.location.href = "/admins/hosts"}>
                <Eye className="w-3 h-3" /> Review Hosts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Role info banner ── */}
      {isAdmin && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            You are viewing <strong>agents you personally recruited</strong>.
            You can manage their status, review their host networks, and approve new agent applications.
            <strong className="ml-1">{activeAgents} active agents</strong> under you right now.
          </p>
        </div>
      )}

      {/* ── SA Hierarchy Flow ── */}
      {isSA && showHierarchy && (
        <Card className="border-violet-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-700">
              <Network className="w-4 h-4" />
              Full Org Hierarchy — SA → Admin → Agent → Host
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* SA node */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-xl px-4 py-2 text-sm font-bold shadow">
                  <Crown className="w-4 h-4" /> Super Admin
                </div>
                <div className="text-xs text-muted-foreground">Full access · manages all admins</div>
              </div>

              {liveAdmins.map((adm) => {
                const admAgents = agents.filter(a => a.adminId === adm.id && a.status !== "removed");
                return (
                  <div key={adm.id} className="ml-6 border-l-2 border-violet-200 pl-4 space-y-2">
                    {/* Admin node */}
                    <div className="flex items-center gap-2 -ml-4">
                      <ChevronRight className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-violet-800">
                        <UserCheck className="w-3.5 h-3.5" /> {adm.name}
                      </div>
                      <span className="text-xs text-muted-foreground">{admAgents.length} agents</span>
                    </div>

                    {/* Agent nodes under this admin */}
                    {admAgents.map((ag) => (
                      <div key={ag.id} className="ml-6 border-l-2 border-pink-100 pl-4">
                        <div className="flex items-center gap-2 -ml-4">
                          <ChevronRight className="w-3.5 h-3.5 text-pink-300 flex-shrink-0" />
                          <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-lg px-3 py-1 text-xs font-medium text-pink-800">
                            <span>{levelIcon(ag.level)}</span>
                            {ag.name}
                            <Badge variant="outline" className="text-[10px] h-4 px-1" style={{ borderColor: levelColor(ag.level), color: levelColor(ag.level) }}>{ag.level}</Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{ag.hosts} hosts · ₹{(ag.earned / 1000).toFixed(0)}K earned</span>
                          {ag.status === "suspended" && <Badge variant="outline" className="text-[10px] h-4 px-1 border-amber-400 text-amber-600">Suspended</Badge>}
                        </div>
                      </div>
                    ))}
                    {admAgents.length === 0 && (
                      <div className="ml-6 text-xs text-muted-foreground italic">No agents assigned</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Pending Applications ── */}
      {(isSA || isAdmin) && pending.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-800">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              Pending Agent Applications
              <Badge className="bg-orange-500 text-white text-xs">{pending.length} awaiting</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {pending.map(app => (
              <div key={app.id} className="flex items-center gap-3 bg-white rounded-xl border border-orange-100 p-3 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {app.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{app.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{app.city}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{app.phone}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />{app.hosts} referred hosts</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{app.appliedAt}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 italic">{app.experience}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setPending(p => p.filter(x => x.id !== app.id))}>
                    <XCircle className="w-3 h-3" /> Reject
                  </Button>
                  <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setPending(p => p.filter(x => x.id !== app.id))}>
                    <CheckCircle className="w-3 h-3" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {(isSA || isAdmin) && pending.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">No pending agent applications.</p>
        </div>
      )}

      {/* ── KPI ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: isSA ? "Total Agents" : "Your Agents", value: totalAgents, sub: `${activeAgents} active`, icon: Briefcase, color: "text-violet-600 bg-violet-50" },
          { label: "Total Hosts Managed", value: totalHosts.toLocaleString(), sub: "across all your agents", icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Host Earnings (source)", value: "₹" + (scopedAgents.reduce((s, a) => s + a.totalHostEarnings, 0) / 100000).toFixed(1) + "L", sub: "total this period", icon: Star, color: "text-green-600 bg-green-50" },
          { label: "Agent Commission Paid", value: "₹" + (totalEarned / 1000).toFixed(0) + "K", sub: "from host earnings", icon: IndianRupee, color: "text-pink-600 bg-pink-50" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color} flex-shrink-0`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground/70">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Level Tiles ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {AGENT_LEVELS.map(lvl => {
          const count = scopedAgents.filter(a => a.level === lvl.level).length;
          return (
            <Card key={lvl.level} className="border-t-4" style={{ borderTopColor: lvl.color }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{lvl.icon}</span>
                  <Badge variant="outline" className="text-xs" style={{ borderColor: lvl.color, color: lvl.color }}>{lvl.level}</Badge>
                </div>
                <p className="font-bold text-sm">{lvl.title}</p>
                <p className="text-2xl font-bold mt-0.5">{count}</p>
                <p className="text-xs text-muted-foreground">agents</p>
                <p className="text-xs mt-1.5 font-semibold" style={{ color: lvl.color }}>{lvl.commissionRate}% commission</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Earnings Chart ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Monthly Commission by Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentEarningsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="a5" name="A5 Master" fill="#E91E8C" radius={[3, 3, 0, 0]} />
                <Bar dataKey="a4" name="A4 Elite"  fill="#FF9800" radius={[3, 3, 0, 0]} />
                <Bar dataKey="a3" name="A3 Super"  fill="#2196F3" radius={[3, 3, 0, 0]} />
                <Bar dataKey="a2" name="A2 Senior" fill="#4CAF50" radius={[3, 3, 0, 0]} />
                <Bar dataKey="a1" name="A1 Agent"  fill="#9E9E9E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Agent Directory ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Agent Directory
              <span className="text-sm font-normal text-muted-foreground">({filtered.length} agents)</span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {isSA && (
                <Select value={adminFilter} onValueChange={setAdminFilter}>
                  <SelectTrigger className="h-8 w-48 text-xs">
                    <SelectValue placeholder="Filter by Admin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Admins</SelectItem>
                    {liveAdmins.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search agents…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-44 text-sm" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left p-4 pb-3">Agent</th>
                  <th className="text-left pb-3">Level</th>
                  {isSA && <th className="text-left pb-3">Admin</th>}
                  <th className="text-right pb-3">Hosts</th>
                  <th className="text-right pb-3">Active</th>
                  <th className="text-right pb-3 text-green-700">Host Earnings</th>
                  <th className="text-right pb-3">Rate</th>
                  <th className="text-right pb-3 text-violet-700">Agent Income</th>
                  <th className="text-right pb-3 text-orange-600">Pending</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-right pb-3">Complaints</th>
                  <th className="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr><td colSpan={13} className="text-center py-10 text-muted-foreground text-sm">No agents found</td></tr>
                ) : filtered.map(a => {
                  const sm = STATUS_META[a.status];
                  const admin = liveAdmins.find(x => x.id === a.adminId);
                  return (
                    <tr key={a.id} className={`hover:bg-muted/40 ${a.status === "suspended" ? "opacity-70" : ""}`}>
                      <td className="p-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {a.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.city} · since {a.joinDate}</p>
                            {!isSA && (
                              <p className="text-[10px] text-violet-600 font-medium mt-0.5">
                                Recruited by you · {a.hosts} hosts managed
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{levelIcon(a.level)}</span>
                          <Badge variant="outline" className="text-xs" style={{ borderColor: levelColor(a.level), color: levelColor(a.level) }}>{a.level}</Badge>
                        </div>
                      </td>
                      {isSA && (
                        <td className="py-3 text-xs text-muted-foreground">
                          {admin ? (
                            <span className="flex items-center gap-1">
                              <Crown className="w-3 h-3 text-violet-500" />
                              {admin.name.replace(" (Admin)", "")}
                            </span>
                          ) : "—"}
                        </td>
                      )}
                      <td className="py-3 text-right font-medium">{a.hosts}</td>
                      <td className="py-3 text-right text-green-600 font-medium">{a.activeHosts}</td>
                      <td className="py-3 text-right font-semibold text-green-700">₹{(a.totalHostEarnings / 1000).toFixed(0)}K</td>
                      <td className="py-3 text-right font-medium">{a.commission}%</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="font-bold text-violet-700">₹{(a.earned / 1000).toFixed(0)}K</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-orange-500">
                        {a.pendingPayout > 0 ? `₹${(a.pendingPayout / 1000).toFixed(0)}K` : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3">
                        <div className={`flex items-center gap-1.5 text-xs ${sm.cls}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                          {sm.label}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        {(() => {
                          const agentComplaints = AGENT_COMPLAINTS.filter(c => c.agentId === a.id);
                          const openCount = agentComplaints.filter(c => c.status === "open").length;
                          const escalatedCount = agentComplaints.filter(c => c.status === "escalated").length;
                          if (openCount === 0 && escalatedCount === 0) return <span className="text-xs text-muted-foreground">—</span>;
                          return (
                            <div className="flex items-center justify-end gap-1">
                              {openCount > 0 && (
                                <Badge variant="outline" className="text-[10px] h-5 border-amber-300 text-amber-600 bg-amber-50">
                                  <AlertTriangle className="w-3 h-3 mr-0.5" />{openCount}
                                </Badge>
                              )}
                              {escalatedCount > 0 && (
                                <Badge variant="outline" className="text-[10px] h-5 border-red-300 text-red-600 bg-red-50">
                                  <ShieldAlert className="w-3 h-3 mr-0.5" />{escalatedCount}
                                </Badge>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                          {isSA && (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1"
                                onClick={() => setAssignTarget(a)}>
                                <UserPlus className="w-3 h-3" /> Assign
                              </Button>
                              <Button variant="ghost" size="sm"
                                className={`h-7 text-xs px-2 gap-1 ${a.status === "suspended" ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"}`}
                                onClick={() => handleSuspend(a.id)}>
                                {a.status === "suspended"
                                  ? <><CheckCircle className="w-3 h-3" /> Restore</>
                                  : <><ShieldOff className="w-3 h-3" /> Suspend</>}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1 text-red-600 hover:text-red-700"
                                onClick={() => setRemoveTarget(a)}>
                                <Trash2 className="w-3 h-3" /> Remove
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 px-4 py-2.5 border-t bg-muted/30 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Host Earnings = total paid to all hosts under this agent</span>
            <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Agent Income = Commission Rate × Host Earnings</span>
            {isSA && <span className="flex items-center gap-1 ml-auto text-violet-600"><Crown className="w-3 h-3" /> SA can remove, suspend, or reassign any agent</span>}
          </div>
        </CardContent>
      </Card>

      {/* ── Agent Complaints (SA + Admin only) ── */}
      {(isSA || isAdmin) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Agent Complaints from Hosts
              <Badge variant="outline" className="text-xs border-red-200 text-red-600 bg-red-50">
                {AGENT_COMPLAINTS.filter(c => c.status === "open" || c.status === "escalated").length} open
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AGENT_COMPLAINTS.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" /> No complaints filed
              </div>
            ) : AGENT_COMPLAINTS.map(c => {
              const agent = INITIAL_AGENTS.find(a => a.id === c.agentId);
              const statusMeta = {
                open:      { label: "Open",      color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                resolved:  { label: "Resolved",  color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
                escalated: { label: "Escalated", color: "text-red-600",   bg: "bg-red-50",   border: "border-red-200" },
              };
              const sm = statusMeta[c.status];
              return (
                <div key={c.id} className="flex items-start gap-3 border rounded-xl p-3 hover:bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {agent?.name.split(" ").map(n => n[0]).join("") ?? "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{agent?.name ?? "Unknown Agent"}</span>
                      <Badge variant="outline" className={`text-[10px] ${sm.color} ${sm.bg} ${sm.border}`}>{sm.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span>Host: <strong className="text-foreground">{c.hostName}</strong></span>
                      <span>· {c.reason}</span>
                      <span>· Filed {c.filedAt}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{c.detail}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="outline" size="sm" className="h-6 text-[10px]">View Details</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── Income Model (SA + Admin only) ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4" /> Commission by Agent Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {AGENT_LEVELS.map(lvl => (
            <div key={lvl.level} className="flex items-center gap-3">
              <span className="text-sm w-6">{lvl.icon}</span>
              <Badge variant="outline" className="text-xs w-7 justify-center" style={{ borderColor: lvl.color, color: lvl.color }}>{lvl.level}</Badge>
              <span className="text-xs text-muted-foreground w-28">{lvl.title}</span>
              <div className="flex-1"><Progress value={lvl.commissionRate * 10} className="h-2" /></div>
              <span className="text-sm font-bold w-10 text-right" style={{ color: lvl.color }}>{lvl.commissionRate}%</span>
              <span className="text-xs text-muted-foreground">of host earnings</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AssignDialog
        agent={assignTarget} admins={liveAdmins} open={!!assignTarget}
        onClose={() => setAssignTarget(null)} onAssign={handleAssign}
      />
      <RemoveDialog
        agent={removeTarget} open={!!removeTarget}
        onClose={() => setRemoveTarget(null)} onConfirm={handleRemove}
      />
      <RecruitDialog
        open={showRecruit} admins={liveAdmins}
        onClose={() => setShowRecruit(false)} onRecruit={handleRecruit}
      />
    </div>
  );
}

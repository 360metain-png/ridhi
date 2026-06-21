import { useState } from "react";
import { getAdminRole, getAdminName } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Star, TrendingUp, IndianRupee, Users, Eye, CheckCircle,
  Search, Radio, Award, Crown, Zap, ShieldCheck,
  XCircle, Clock, Phone, MapPin, ShieldAlert, Briefcase,
  Trash2, ShieldOff, Info, Lock, Network, ChevronRight, UserCheck,
  Rocket, Wrench, Download, UserPlus, Plus,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { downloadCSV } from "@/lib/utils";
import { getSharedAdmins, useSharedAdmins } from "@/lib/admin-store";

// ── Types ─────────────────────────────────────────────────────────────────────

type HostStatus = "active" | "suspended" | "removed";

interface Host {
  id: string;
  name: string;
  city: string;
  language: string;
  level: string;
  coinsReceived: number;
  followers: number;
  isLive: boolean;
  agentId: string;
  adminId: string;
  earnings: number;
  pkWins: number;
  streamHours: number;
  verified: boolean;
  status: HostStatus;
  joinDate: string;
  phone: string;
  // Activity checkpoint fields
  hostMonthlyHours: number;        // hours streamed this month
  hostActiveUntil: string;          // deadline for 30hr checkpoint
  hostRevokedAt?: string;
  hostRevokedReason?: string;
}

// ── Shared constants matching agents.tsx ──────────────────────────────────────

function getLiveAdmins() {
  return getSharedAdmins()
    .filter((a) => a.status === "active")
    .map((a) => ({ id: a.id, name: a.name, email: a.email }));
}

const AGENTS_META = [
  { id: "a1", name: "Vikram Rao",   level: "A5", adminId: "adm1" },
  { id: "a2", name: "Sunita Joshi", level: "A4", adminId: "adm1" },
  { id: "a3", name: "Deepak Singh", level: "A3", adminId: "adm2" },
  { id: "a4", name: "Meena Kumari", level: "A2", adminId: "adm2" },
  { id: "a5", name: "Rajan Pillai", level: "A1", adminId: "adm3" },
  { id: "a6", name: "Preethi Nair", level: "A2", adminId: "adm3" },
];

const HOST_LEVELS = [
  { level: "L1", title: "Bronze",     minCoins:   50000, badge: "🥉", color: "#CD7F32" },
  { level: "L2", title: "Silver",     minCoins:  200000, badge: "🥈", color: "#9E9E9E" },
  { level: "L3", title: "Gold",       minCoins:  500000, badge: "🥇", color: "#FFB800" },
  { level: "L4", title: "Platinum",   minCoins: 1000000, badge: "💎", color: "#00BCD4" },
  { level: "L5", title: "Diamond",    minCoins: 2000000, badge: "🔷", color: "#2196F3" },
  { level: "L6", title: "Elite",      minCoins: 3500000, badge: "⭐", color: "#7B2FBE" },
  { level: "L7", title: "Royal Crown",minCoins: 5000000, badge: "👑", color: "#E91E8C" },
];

const INITIAL_HOSTS: Host[] = [
  { id: "h1",  name: "Priya Sharma",   city: "Mumbai",    language: "Hindi",     level: "L7", coinsReceived: 6840000, followers: 128400, isLive: true,  agentId: "a1", adminId: "adm1", earnings: 284000, pkWins: 48, streamHours: 1240, verified: true,  status: "active",    joinDate: "Feb 2024", phone: "+91 99001 11111", hostMonthlyHours: 42,  hostActiveUntil: "2025-07-15" },
  { id: "h2",  name: "Rahul Verma",    city: "Delhi",     language: "Hindi",     level: "L6", coinsReceived: 3920000, followers:  98200, isLive: false, agentId: "a2", adminId: "adm1", earnings: 142000, pkWins: 32, streamHours:  840, verified: true,  status: "active",    joinDate: "Mar 2024", phone: "+91 99002 22222", hostMonthlyHours: 28,  hostActiveUntil: "2025-07-10" },
  { id: "h3",  name: "Kavya Reddy",    city: "Hyderabad", language: "Telugu",    level: "L5", coinsReceived: 2140000, followers:  76800, isLive: true,  agentId: "a3", adminId: "adm2", earnings:  84000, pkWins: 24, streamHours:  620, verified: true,  status: "active",    joinDate: "Apr 2024", phone: "+91 99003 33333", hostMonthlyHours: 35,  hostActiveUntil: "2025-07-20" },
  { id: "h4",  name: "Dev Kumar",      city: "Bangalore", language: "English",   level: "L4", coinsReceived: 1280000, followers:  54300, isLive: false, agentId: "a4", adminId: "adm2", earnings:  58000, pkWins: 18, streamHours:  440, verified: false, status: "active",    joinDate: "May 2024", phone: "+91 99004 44444", hostMonthlyHours: 12,  hostActiveUntil: "2025-07-05" },
  { id: "h5",  name: "Meera Pillai",   city: "Kochi",     language: "Malayalam", level: "L3", coinsReceived:  620000, followers:  41200, isLive: false, agentId: "a5", adminId: "adm3", earnings:  24000, pkWins:  9, streamHours:  280, verified: true,  status: "active",    joinDate: "Jun 2024", phone: "+91 99005 55555", hostMonthlyHours: 8,   hostActiveUntil: "2025-06-25" },
  { id: "h6",  name: "Arjun Shah",     city: "Surat",     language: "Gujarati",  level: "L2", coinsReceived:  240000, followers:  28700, isLive: false, agentId: "a1", adminId: "adm1", earnings:   9600, pkWins:  4, streamHours:  140, verified: false, status: "active",    joinDate: "Jul 2024", phone: "+91 99006 66666", hostMonthlyHours: 2,   hostActiveUntil: "2025-06-22" },
  { id: "h7",  name: "Riya Das",       city: "Kolkata",   language: "Bengali",   level: "L1", coinsReceived:   72000, followers:  12100, isLive: false, agentId: "a1", adminId: "adm1", earnings:   2800, pkWins:  1, streamHours:   48, verified: false, status: "suspended", joinDate: "Aug 2024", phone: "+91 99007 77777", hostMonthlyHours: 0,   hostActiveUntil: "2025-06-20", hostRevokedAt: "2025-06-20", hostRevokedReason: "Did not meet 30-hour monthly streaming requirement" },
  { id: "h8",  name: "Kiran Nair",     city: "Pune",      language: "Marathi",   level: "L3", coinsReceived:  580000, followers:  33400, isLive: true,  agentId: "a6", adminId: "adm3", earnings:  22000, pkWins:  7, streamHours:  210, verified: true,  status: "active",    joinDate: "Apr 2024", phone: "+91 99008 88888", hostMonthlyHours: 31,  hostActiveUntil: "2025-07-18" },
  { id: "h9",  name: "Ananya Sen",     city: "Chennai",   language: "Tamil",     level: "L4", coinsReceived: 1140000, followers:  48900, isLive: false, agentId: "a5", adminId: "adm3", earnings:  44000, pkWins: 14, streamHours:  390, verified: true,  status: "active",    joinDate: "Mar 2024", phone: "+91 99009 99999", hostMonthlyHours: 24,  hostActiveUntil: "2025-07-12" },
  { id: "h10", name: "Rohan Mishra",   city: "Lucknow",   language: "Hindi",     level: "L2", coinsReceived:  210000, followers:  22600, isLive: false, agentId: "a3", adminId: "adm2", earnings:   8400, pkWins:  3, streamHours:   98, verified: false, status: "active",    joinDate: "Sep 2024", phone: "+91 99010 10101", hostMonthlyHours: 5,   hostActiveUntil: "2025-06-28" },
];

const PENDING_HOSTS = [
  { id: "ph1", name: "Anjali Rao",     city: "Bangalore", phone: "+91 99887 76655", appliedAt: "1 hour ago",   language: "Kannada",   followers: 3200, experience: "Dance & music creator, 2 yrs YouTube"    },
  { id: "ph2", name: "Rohit Sharma",   city: "Delhi",     phone: "+91 88776 65544", appliedAt: "3 hours ago",  language: "Hindi",     followers: 1800, experience: "Comedy & entertainment, new to live"       },
  { id: "ph3", name: "Nandita Pillai", city: "Chennai",   phone: "+91 77665 54433", appliedAt: "5 hours ago",  language: "Tamil",     followers: 5400, experience: "Singer, 3 yrs YouTube, 420K subs"         },
  { id: "ph4", name: "Gaurav Tiwari",  city: "Varanasi",  phone: "+91 66554 43322", appliedAt: "1 day ago",    language: "Hindi",     followers: 920,  experience: "Gaming streamer, first platform attempt"   },
  { id: "ph5", name: "Shweta Menon",   city: "Kochi",     phone: "+91 55443 32211", appliedAt: "2 days ago",   language: "Malayalam", followers: 7200, experience: "Fitness & wellness content, 4 yrs"         },
  { id: "ph6", name: "Vikram Rao",     city: "Delhi",     phone: "+91 98001 11111", appliedAt: "10 min ago",   language: "Hindi",     followers: 11200, experience: "Wants to try hosting after years as agent" },
];

const hostEarningsData = [
  { month: "Aug", l7: 220000, l6: 110000, l5: 62000, l4: 40000 },
  { month: "Sep", l7: 248000, l6: 124000, l5: 72000, l4: 46000 },
  { month: "Oct", l7: 260000, l6: 130000, l5: 78000, l4: 50000 },
  { month: "Nov", l7: 272000, l6: 136000, l5: 80000, l4: 54000 },
  { month: "Dec", l7: 284000, l6: 142000, l5: 84000, l4: 58000 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const levelOf    = (l: string) => HOST_LEVELS.find(h => h.level === l);
const agentName  = (id: string) => AGENTS_META.find(a => a.id === id)?.name ?? "—";
const adminName  = (id: string) => getLiveAdmins().find(a => a.id === id)?.name ?? "—";

const STATUS_META: Record<HostStatus, { label: string; cls: string; dot: string }> = {
  active:    { label: "Active",    cls: "text-green-600", dot: "bg-green-500"  },
  suspended: { label: "Suspended", cls: "text-amber-600", dot: "bg-amber-500"  },
  removed:   { label: "Removed",   cls: "text-red-600",   dot: "bg-red-500"    },
};

// ── Checkpoint helpers ────────────────────────────────────────────────────────

function daysLeft(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function checkpointStatus(h: Host): { label: string; color: string; bg: string; dot: string } {
  if (h.hostRevokedAt) {
    return { label: "Revoked", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" };
  }
  const dl = daysLeft(h.hostActiveUntil);
  const met = h.hostMonthlyHours >= 30;
  if (dl <= 0 && !met) {
    return { label: "Expired", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" };
  }
  if (dl <= 5 && !met) {
    return { label: "Urgent", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" };
  }
  if (!met) {
    return { label: "At Risk", color: "text-yellow-600", bg: "bg-yellow-50", dot: "bg-yellow-500" };
  }
  return { label: "On Track", color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" };
}

// ── Remove Confirm Dialog ─────────────────────────────────────────────────────

function RemoveDialog({
  host, open, onClose, onConfirm,
}: { host: Host | null; open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!host) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" /> Remove Host
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <strong className="text-foreground">{host.name}</strong>?
            Their account will be deactivated and removed from their agent's network.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            This action cannot be undone. The host's earnings history will be preserved for audit purposes.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="destructive" onClick={onConfirm}>Remove Host</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Assign Host to Agent Dialog ─────────────────────────────────────────────────

function AssignHostDialog({
  host, agents, open, onClose, onAssign,
}: {
  host: Host | null;
  agents: { id: string; name: string; level: string; adminId: string }[];
  open: boolean;
  onClose: () => void;
  onAssign: (hostId: string, agentId: string) => void;
}) {
  const [pick, setPick] = useState("");
  const [pickAdmin, setPickAdmin] = useState("");
  if (!host) return null;
  const filteredAgents = pickAdmin ? agents.filter(a => a.adminId === pickAdmin) : agents;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-violet-500" /> Assign Host to Agent
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="flex items-center gap-3 bg-muted rounded-xl p-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: (levelOf(host.level)?.color ?? "#888") + "20" }}>
              {levelOf(host.level)?.badge}
            </div>
            <div>
              <p className="font-semibold text-sm">{host.name}</p>
              <p className="text-xs text-muted-foreground">{host.city} · {host.language} · {host.followers.toLocaleString()} followers</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Current: {agentName(host.agentId)} → {adminName(host.adminId)}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Step 1: Select Admin</p>
            <Select value={pickAdmin} onValueChange={setPickAdmin}>
              <SelectTrigger><SelectValue placeholder="Select admin…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Admins</SelectItem>
                {getLiveAdmins().map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-violet-500" /> {a.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Step 2: Select Agent</p>
            <Select value={pick || host.agentId} onValueChange={setPick}>
              <SelectTrigger><SelectValue placeholder="Select agent…" /></SelectTrigger>
              <SelectContent>
                {filteredAgents.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-pink-500" /> {a.name} <span className="text-xs text-muted-foreground">({a.level})</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(pick && pick !== host.agentId) && (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This will move <strong>{host.name}</strong> from <strong>{agentName(host.agentId)}</strong> to <strong>{agentName(pick)}</strong>.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={!pick || pick === host.agentId}
            onClick={() => { onAssign(host.id, pick); onClose(); }}>
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Nominate Host Dialog (Admin on behalf of Agent → SA approval) ─────────────

interface PendingHost {
  id: string;
  name: string;
  city: string;
  phone: string;
  appliedAt: string;
  language: string;
  followers: number;
  experience: string;
  nominationType?: "self" | "agent";
  nominatedBy?: string;
}

const NOMINATION_LANGUAGES = ["Hindi","English","Tamil","Telugu","Kannada","Malayalam","Bengali","Marathi","Punjabi","Gujarati","Odia","Urdu","Bhojpuri"];

function NominateHostDialog({
  open, onClose, onSubmit, agentsForAdmin,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (c: Omit<PendingHost, "id">) => void;
  agentsForAdmin: typeof AGENTS_META;
}) {
  const [name,       setName]       = useState("");
  const [city,       setCity]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [language,   setLanguage]   = useState("Hindi");
  const [followers,  setFollowers]  = useState("");
  const [experience, setExperience] = useState("");
  const [agentId,    setAgentId]    = useState(agentsForAdmin[0]?.id ?? "");

  const reset = () => { setName(""); setCity(""); setPhone(""); setFollowers(""); setExperience(""); setLanguage("Hindi"); setAgentId(agentsForAdmin[0]?.id ?? ""); };

  const selectedAgent = agentsForAdmin.find(a => a.id === agentId);

  return (
    <Dialog open={open} onOpenChange={() => { reset(); onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-pink-500" />
            Nominate Host Candidate
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="flex items-start gap-2 bg-pink-50 border border-pink-200 rounded-lg px-3 py-2.5">
            <Info className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-pink-800">
              Submit a host nomination on behalf of one of your agents.
              <strong className="text-pink-900"> Super Admin will review and approve</strong> before the candidate is onboarded.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nominating Agent *</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agentsForAdmin.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name} · {a.level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Candidate Full Name *</Label>
              <Input className="mt-1 h-8 text-sm" placeholder="Candidate's full name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">City</Label>
                <Input className="mt-1 h-8 text-sm" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Phone *</Label>
                <Input className="mt-1 h-8 text-sm" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NOMINATION_LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Social Followers</Label>
                <Input type="number" className="mt-1 h-8 text-sm" placeholder="e.g. 5000" value={followers} onChange={e => setFollowers(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Why this candidate?</Label>
              <Textarea className="mt-1 text-sm min-h-[64px]" placeholder="Content background, language skills, audience…" value={experience} onChange={e => setExperience(e.target.value)} />
            </div>
          </div>
          {selectedAgent && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-800 font-medium">
                Nominated by agent: <strong>{selectedAgent.name} ({selectedAgent.level})</strong> · Awaiting SA review
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button size="sm"
            className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white gap-1 border-0"
            disabled={!name.trim() || !phone.trim() || !agentId}
            onClick={() => {
              onSubmit({ name: name.trim(), city: city.trim(), phone: phone.trim(), appliedAt: "Just now", language, followers: parseInt(followers) || 0, experience: experience.trim() || "Nominated by Agent", nominationType: "agent", nominatedBy: selectedAgent?.name ?? "Agent" });
              reset(); onClose();
            }}>
            <UserPlus className="w-3.5 h-3.5" /> Submit Nomination
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Approve Host & Assign Dialog (Super Admin only) ──────────────────────────

function ApproveHostDialog({
  app, open, onClose, onApprove,
}: {
  app: PendingHost | null;
  open: boolean;
  onClose: () => void;
  onApprove: (appId: string, agentId: string) => void;
}) {
  const [selectedAgentId, setSelectedAgentId] = useState("");
  if (!app) return null;
  const isAlreadyAgent = AGENTS_META.some(a => a.name === app.name);
  const selectedAgent  = AGENTS_META.find(a => a.id === selectedAgentId);
  const derivedAdmin   = getLiveAdmins().find(a => a.id === selectedAgent?.adminId);
  return (
    <Dialog open={open} onOpenChange={() => { setSelectedAgentId(""); onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAlreadyAgent
              ? <XCircle className="w-5 h-5 text-red-500" />
              : <CheckCircle className="w-5 h-5 text-green-500" />}
            Approve & Assign Host
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          {/* Ineligibility block */}
          {isAlreadyAgent && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-800">Ineligible — Already an Agent</p>
                <p className="text-xs text-red-700 mt-0.5">This person is currently registered as an active Agent on the platform. A user cannot hold both Host and Agent roles simultaneously. Reject this application.</p>
              </div>
            </div>
          )}
          {/* SA note */}
          {!isAlreadyAgent && (
            <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
              <Crown className="w-4 h-4 text-violet-600 flex-shrink-0" />
              <p className="text-xs text-violet-800 font-medium">Super Admin action — approve this host application and assign them to a dedicated agent.</p>
            </div>
          )}
          {/* Applicant info */}
          <div className="flex items-center gap-3 bg-muted rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {app.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{app.name}</p>
              <div className="flex items-center gap-3 flex-wrap mt-0.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{app.city}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />{app.followers.toLocaleString()} followers</span>
                <span className="text-xs text-muted-foreground">{app.language}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 italic">{app.experience}</p>
            </div>
          </div>
          {/* Agent picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Assign to Dedicated Agent</Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger><SelectValue placeholder="Choose an agent to manage this host…" /></SelectTrigger>
              <SelectContent>
                {AGENTS_META.map(a => {
                  const adm = getLiveAdmins().find(x => x.id === a.adminId);
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-pink-500" />
                        {a.name}
                        <span className="text-xs text-muted-foreground">({a.level})</span>
                        {adm && <span className="text-xs text-muted-foreground">· under {adm.name}</span>}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {/* Chain preview */}
          {selectedAgent && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 space-y-1.5">
              <p className="text-xs font-semibold text-emerald-800">Assignment chain after approval:</p>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="flex items-center gap-1 bg-violet-100 border border-violet-300 rounded-full px-2 py-0.5 font-medium text-violet-700"><Crown className="w-3 h-3" /> Super Admin</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 font-medium text-blue-700">{derivedAdmin?.name ?? "—"}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="flex items-center gap-1 bg-pink-50 border border-pink-200 rounded-full px-2 py-0.5 font-medium text-pink-700"><Briefcase className="w-3 h-3" /> {selectedAgent.name}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="flex items-center gap-1 bg-emerald-100 border border-emerald-300 rounded-full px-2 py-0.5 font-medium text-emerald-700"><Star className="w-3 h-3" /> {app.name}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => { setSelectedAgentId(""); onClose(); }}>Cancel</Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1"
            disabled={!selectedAgentId || isAlreadyAgent}
            onClick={() => { onApprove(app.id, selectedAgentId); setSelectedAgentId(""); onClose(); }}>
            <CheckCircle className="w-3.5 h-3.5" /> Approve & Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Host Detail Sheet ─────────────────────────────────────────────────────────

function HostDetail({ host, onClose }: { host: Host; onClose: () => void }) {
  const lvl   = levelOf(host.level)!;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">{lvl.badge}</span>
            {host.name}
            {host.isLive && <Badge className="h-5 bg-red-500 hover:bg-red-500 text-xs px-1.5">LIVE</Badge>}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Identity */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "City",        value: host.city       },
              { label: "Language",    value: host.language   },
              { label: "Phone",       value: host.phone      },
              { label: "Joined",      value: host.joinDate   },
              { label: "Followers",   value: host.followers.toLocaleString() },
              { label: "Stream Hrs",  value: host.streamHours + " hrs"       },
            ].map(r => (
              <div key={r.label} className="bg-muted rounded-lg px-3 py-2">
                <p className="text-xs text-muted-foreground">{r.label}</p>
                <p className="font-semibold mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          {/* Level */}
          <div className="flex items-center gap-3 bg-muted/60 rounded-xl p-3">
            <span className="text-2xl">{lvl.badge}</span>
            <div className="flex-1">
              <p className="font-bold" style={{ color: lvl.color }}>{host.level} — {lvl.title}</p>
              <p className="text-xs text-muted-foreground">Min {(lvl.minCoins / 100000).toFixed(1)}L coins required</p>
            </div>
            {host.verified && (
              <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Verified
              </div>
            )}
          </div>

          {/* Earnings */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Coins Received", value: "🪙 " + (host.coinsReceived / 1000).toFixed(0) + "K", color: "text-yellow-600" },
              { label: "Earnings",       value: "₹" + (host.earnings / 1000).toFixed(0) + "K",       color: "text-green-600"  },
              { label: "PK Wins",        value: "⚡ " + host.pkWins,                                   color: "text-pink-600"   },
            ].map(m => (
              <div key={m.label} className="bg-muted rounded-xl py-3">
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Activity Checkpoint */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Activity Checkpoint</p>
            {(() => {
              const cp = checkpointStatus(host);
              const dl = daysLeft(host.hostActiveUntil);
              return (
                <div className={`rounded-xl p-3 border ${cp.bg} border-opacity-40`} style={{ borderColor: cp.color.replace("text-", "").replace("600", "200").replace("500", "200") }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <div className={`w-2 h-2 rounded-full ${cp.dot}`} />
                      <span className={cp.color}>{cp.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dl > 0 ? `${dl} days left` : dl === 0 ? "Due today" : `${Math.abs(dl)} days overdue`}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Monthly Hours</span>
                      <span className="font-medium">{host.hostMonthlyHours} / 30 hrs</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${host.hostMonthlyHours >= 30 ? "bg-green-500" : host.hostMonthlyHours >= 15 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(100, (host.hostMonthlyHours / 30) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {host.hostRevokedAt && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                      <strong>Revoked on {host.hostRevokedAt}:</strong> {host.hostRevokedReason}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Network */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Network Chain</p>
            <div className="flex items-center gap-1.5 text-sm flex-wrap">
              <div className="flex items-center gap-1 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1 text-xs font-medium text-violet-700">
                <Crown className="w-3 h-3" /> Super Admin
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 text-xs font-medium text-blue-700">
                {adminName(host.adminId)}
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <div className="flex items-center gap-1 bg-pink-50 border border-pink-200 rounded-full px-2.5 py-1 text-xs font-medium text-pink-700">
                <Briefcase className="w-3 h-3" /> {agentName(host.agentId)}
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 text-xs font-medium text-emerald-700">
                <Star className="w-3 h-3" /> {host.name}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function HostsPage() {
  const { toast } = useToast();
  const role = getAdminRole() ?? "admin";
  const myEmail = getAdminName() ?? "";

  const isSA    = role === "super_admin";
  const isAdmin = role === "admin";
  const isAgent = false;

  // Live admins from shared store
  const liveAdmins = getLiveAdmins();
  const _useShared = useSharedAdmins(); // re-trigger when admins change

  // Resolve current viewer's ID
  const myAdminId = isAdmin ? (liveAdmins.find(a => a.email === myEmail)?.id ?? liveAdmins[0]?.id ?? "adm1") : null;
  // For agent role — derive their agent ID from email (mock: use first agent of first admin)
  const myAgentId = isAgent ? "a5" : null; // demo: Rajan Pillai

  const [hosts, setHosts]           = useState<Host[]>(INITIAL_HOSTS);
  const [pending, setPending]        = useState<PendingHost[]>(PENDING_HOSTS as PendingHost[]);
  const [search, setSearch]          = useState("");
  const [levelFilter, setLevelFilter]= useState("all");
  const [agentFilter, setAgentFilter]= useState("all");
  const [adminFilter, setAdminFilter]= useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailHost, setDetailHost]  = useState<Host | null>(null);
  const [removeTarget,    setRemoveTarget]    = useState<Host | null>(null);
  const [assignTarget,    setAssignTarget]    = useState<Host | null>(null);
  const [approveTarget,   setApproveTarget]   = useState<PendingHost | null>(null);
  const [showNominateHost, setShowNominateHost] = useState(false);

  // Agents available to this admin for the nomination form
  const agentsForNomination = isAdmin
    ? AGENTS_META.filter(a => a.adminId === myAdminId)
    : isSA ? AGENTS_META : [];

  // ── Role-based data scoping ──────────────────────────────────────────────
  const scopedHosts = (() => {
    const active = hosts.filter(h => h.status !== "removed");
    if (isSA)    return active;
    if (isAdmin) {
      // Admin sees hosts whose agent belongs to this admin
      const myAgentIds = AGENTS_META.filter(a => a.adminId === myAdminId).map(a => a.id);
      return active.filter(h => myAgentIds.includes(h.agentId));
    }
    if (isAgent) return active.filter(h => h.agentId === myAgentId);
    return [];
  })();

  const filtered = scopedHosts.filter(h => {
    const matchSearch  = h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase());
    const matchLevel   = levelFilter === "all" || h.level === levelFilter;
    const matchAgent   = agentFilter === "all" || h.agentId === agentFilter;
    const matchAdmin   = adminFilter === "all" || h.adminId === adminFilter;
    const matchStatus  = statusFilter === "all" || h.status === statusFilter;
    return matchSearch && matchLevel && matchAgent && matchAdmin && matchStatus;
  });

  // Pending hosts — Super Admin reviews ALL applications; other roles see none
  const scopedPending = isSA ? pending : [];

  const handleSuspend = (id: string) => {
    setHosts(prev => prev.map(h => h.id === id
      ? { ...h, status: h.status === "suspended" ? "active" : "suspended" }
      : h));
    const h = hosts.find(x => x.id === id)!;
    toast({ title: h.status === "suspended" ? "Host reactivated" : "Host suspended", description: h.name });
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    setHosts(prev => prev.map(h => h.id === removeTarget.id ? { ...h, status: "removed" } : h));
    toast({ title: "Host removed", description: `${removeTarget.name} has been removed.`, variant: "destructive" });
    setRemoveTarget(null);
  };

  const handleAssign = (hostId: string, agentId: string) => {
    const agent = AGENTS_META.find(a => a.id === agentId);
    setHosts(prev => prev.map(h => h.id === hostId ? { ...h, agentId, adminId: agent?.adminId ?? h.adminId } : h));
    const host = hosts.find(x => x.id === hostId)!;
    toast({ title: "Host reassigned", description: `${host.name} assigned to ${agent?.name ?? agentId}` });
  };

  const handleApproveHost = (appId: string, agentId: string) => {
    const app = pending.find(p => p.id === appId);
    if (!app) return;
    const agent = AGENTS_META.find(a => a.id === agentId);
    const newHost: Host = {
      id: `h-${Date.now()}`,
      name: app.name,
      city: app.city,
      language: app.language,
      level: "L1",
      coinsReceived: 0,
      followers: app.followers,
      isLive: false,
      agentId,
      adminId: agent?.adminId ?? liveAdmins[0]?.id ?? "adm1",
      earnings: 0,
      pkWins: 0,
      streamHours: 0,
      verified: false,
      status: "active",
      joinDate: new Date().toLocaleString("default", { month: "short", year: "numeric" }),
      phone: app.phone,
      hostMonthlyHours: 0,
      hostActiveUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
    setHosts(prev => [newHost, ...prev]);
    setPending(prev => prev.filter(p => p.id !== appId));
    toast({ title: "Host approved & assigned", description: `${app.name} → ${agent?.name ?? agentId}`, className: "border-green-200 bg-green-50 text-green-900" });
  };

  const liveCount     = scopedHosts.filter(h => h.isLive).length;
  const totalEarnings = scopedHosts.reduce((s, h) => s + h.earnings, 0);

  // Agents visible to the current admin (for filter dropdown)
  const visibleAgents = isSA
    ? AGENTS_META
    : AGENTS_META.filter(a => a.adminId === myAdminId);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
            const rows: Record<string, string | number>[] = [];
            downloadCSV("hosts_report.csv", rows);
          }}>
            <Download className="w-3 h-3" /> Export CSV
          </Button>
        </div>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Host Management
            {!isSA && (
              <Badge variant="outline" className="text-xs ml-2 border-violet-300 text-violet-600">
                <Lock className="w-3 h-3 mr-1" />
                {isAdmin ? "Your agents' hosts" : "Your hosts only"}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isSA    && "Super Admin — all hosts across all agents & admins · full remove/suspend access"}
            {isAdmin && "Admin view — hosts recruited by your agents"}
            {isAgent && "Agent view — your personally recruited hosts"}
          </p>
        </div>
        <Badge className="gap-1 bg-green-600 hover:bg-green-600">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
          {liveCount} Live Now
        </Badge>
      </div>

      {/* ── Go Live / Activation Banner ── */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-600 flex-shrink-0">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-amber-900">Activation Readiness</p>
                <p className="text-xs text-amber-700">
                  {isSA
                    ? "Super Admin view · verify all hosts are KYC-verified and live-ready before public launch"
                    : isAdmin
                    ? "Your agents' hosts · approve pending hosts and verify KYC before launch"
                    : "Your hosts · ensure KYC is complete and stream settings are ready"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1 border-emerald-300 text-emerald-700 bg-white">
                <CheckCircle className="w-3 h-3" />
                {scopedHosts.filter(h => h.status === "active").length} Live-Ready
              </Badge>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => window.location.href = "/admins/kyc"}>
                <ShieldCheck className="w-3 h-3" /> KYC Queue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* ── Access info banner ── */}
      {(isAdmin || isAgent) && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            {isAdmin
              ? <><strong>Admin view</strong> — You see hosts recruited by <strong>your agents</strong>. Hosts under other admins' agents are hidden. You can verify, suspend, or remove any host in your chain.</>
              : <><strong>Agent view</strong> — You see only <strong>hosts you personally recruited</strong>. You manage their day-to-day status and earnings. Contact your admin for escalations.</>}
          </p>
        </div>
      )}

      {/* ── Admin / Agent: Nominate Host Candidate ── */}
      {(isAdmin || isAgent) && (
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50/60 to-violet-50/40">
          <CardContent className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-pink-900">Nominate a Host Candidate</p>
                <p className="text-xs text-pink-700">
                  {isAdmin
                    ? "Submit a nomination on behalf of one of your agents — Super Admin reviews & approves."
                    : "Propose a host candidate to your Admin chain — Super Admin reviews & approves."}
                </p>
              </div>
            </div>
            <Button size="sm"
              className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white gap-1.5 border-0 flex-shrink-0"
              onClick={() => setShowNominateHost(true)}>
              <Plus className="w-3.5 h-3.5" /> Nominate
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Pending Host Approvals (Super Admin only) ── */}
      {isSA && scopedPending.length > 0 && (
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50/60 to-pink-50/40">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-900">
              <Crown className="w-4 h-4 text-violet-600" />
              Pending Host Applications
              <Badge className="bg-violet-600 text-white text-xs">{scopedPending.length} awaiting</Badge>
              <Badge variant="outline" className="ml-1 text-xs border-violet-300 text-violet-600 gap-1">
                <Crown className="w-3 h-3" /> Super Admin Review Required
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {scopedPending.map(app => {
              const alreadyAgent = AGENTS_META.some(a => a.name === app.name);
              return (
              <div key={app.id} className={`flex items-center gap-3 bg-white rounded-xl border p-3 shadow-sm ${alreadyAgent ? "border-red-200 bg-red-50/30" : "border-violet-100"}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {app.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{app.name}</p>
                    {alreadyAgent && (
                      <Badge className="bg-red-100 text-red-700 border border-red-200 text-[10px] h-4 px-1.5 gap-1 font-semibold">
                        <XCircle className="w-2.5 h-2.5" /> Ineligible — Already an Agent
                      </Badge>
                    )}
                    {app.nominationType === "agent" && app.nominatedBy && (
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] h-4 px-1.5 gap-1">
                        <UserPlus className="w-2.5 h-2.5" /> Nominated by {app.nominatedBy}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{app.city}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{app.phone}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />{app.followers.toLocaleString()} followers</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{app.appliedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">{app.language}</Badge>
                    <span className="text-xs text-muted-foreground italic">{app.experience}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setPending(p => p.filter(x => x.id !== app.id))}>
                    <XCircle className="w-3 h-3" /> Reject
                  </Button>
                  <Button size="sm"
                    className={`h-7 text-xs gap-1 text-white border-0 ${alreadyAgent ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"}`}
                    disabled={alreadyAgent}
                    onClick={() => !alreadyAgent && setApproveTarget(app)}>
                    <CheckCircle className="w-3 h-3" /> Approve & Assign
                  </Button>
                </div>
              </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      {isSA && scopedPending.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">No pending host applications — queue is clear.</p>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: isSA ? "Total Hosts" : isAdmin ? "Your Agents' Hosts" : "Your Hosts", value: scopedHosts.length, icon: Users, color: "text-purple-600 bg-purple-50" },
          { label: "Live Right Now", value: liveCount, icon: Radio, color: "text-red-600 bg-red-50" },
          { label: "Host Earnings (Month)", value: "₹" + (totalEarnings / 1000).toFixed(0) + "K", icon: IndianRupee, color: "text-green-600 bg-green-50" },
          { label: "PK Battles Won", value: scopedHosts.reduce((s, h) => s + h.pkWins, 0), icon: Zap, color: "text-yellow-600 bg-yellow-50" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color} flex-shrink-0`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Level tiles ── */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {HOST_LEVELS.map(lvl => {
          const count = scopedHosts.filter(h => h.level === lvl.level).length;
          return (
            <button
              key={lvl.level}
              onClick={() => setLevelFilter(levelFilter === lvl.level ? "all" : lvl.level)}
              className={`text-left border rounded-xl p-3 transition-all ${levelFilter === lvl.level ? "ring-2 ring-offset-1 ring-violet-400 border-violet-300" : "hover:bg-muted/50"}`}
              style={{ borderColor: lvl.color + "60" }}
            >
              <p className="text-xl">{lvl.badge}</p>
              <p className="text-xs font-bold mt-1" style={{ color: lvl.color }}>{lvl.level}</p>
              <p className="text-lg font-bold">{count}</p>
              <p className="text-[10px] text-muted-foreground">{lvl.title}</p>
            </button>
          );
        })}
      </div>

      {/* ── SA: Hierarchy drill-down preview ── */}
      {isSA && (
        <Card className="border-violet-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-700">
              <Network className="w-4 h-4" /> Host Distribution — by Admin & Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getLiveAdmins().map(adm => {
                const admHosts = scopedHosts.filter(h => h.adminId === adm.id);
                const admAgents = AGENTS_META.filter(a => a.adminId === adm.id);
                return (
                  <div key={adm.id} className="border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between bg-violet-50 border-b border-violet-100 px-4 py-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-violet-800">
                        <Crown className="w-4 h-4" /> {adm.name} (Admin)
                      </div>
                      <Badge variant="outline" className="text-xs border-violet-300 text-violet-600">
                        {admHosts.length} hosts total
                      </Badge>
                    </div>
                    <div className="divide-y">
                      {admAgents.map(ag => {
                        const agHosts = admHosts.filter(h => h.agentId === ag.id);
                        return (
                          <div key={ag.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30">
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <Briefcase className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                            <span className="text-sm font-medium flex-1">{ag.name}</span>
                            <Badge variant="outline" className="text-xs" style={{ borderColor: "#E91E8C40", color: "#E91E8C" }}>{ag.level}</Badge>
                            <span className="text-xs text-muted-foreground">{agHosts.length} hosts</span>
                            <div className="flex gap-1 flex-wrap">
                              {agHosts.slice(0, 4).map(h => {
                                const lvl = levelOf(h.level);
                                return (
                                  <span key={h.id} className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                    style={{ backgroundColor: lvl?.color + "20", color: lvl?.color }}>
                                    {h.name.split(" ")[0]}
                                  </span>
                                );
                              })}
                              {agHosts.length > 4 && <span className="text-xs text-muted-foreground">+{agHosts.length - 4}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Earnings Chart (SA + Admin) ── */}
      {!isAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Host Level Earnings (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hostEarningsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Line dataKey="l7" name="L7 Royal Crown" stroke="#E91E8C" strokeWidth={2} dot={false} />
                  <Line dataKey="l6" name="L6 Elite"       stroke="#7B2FBE" strokeWidth={2} dot={false} />
                  <Line dataKey="l5" name="L5 Diamond"     stroke="#2196F3" strokeWidth={2} dot={false} />
                  <Line dataKey="l4" name="L4 Platinum"    stroke="#00BCD4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Host Directory ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Host Directory
              <span className="text-sm font-normal text-muted-foreground">({filtered.length} hosts)</span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {isSA && (
                <Select value={adminFilter} onValueChange={setAdminFilter}>
                  <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Filter Admin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Admins</SelectItem>
                    {getLiveAdmins().map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {(isSA || isAdmin) && (
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Filter Agent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {visibleAgents.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.level})</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search hosts…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-40 text-sm" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left p-4 pb-3">Host</th>
                  <th className="text-left pb-3">Level</th>
                  <th className="text-left pb-3">Language</th>
                  <th className="text-right pb-3">Followers</th>
                  <th className="text-right pb-3">Coins Recv.</th>
                  <th className="text-right pb-3">Earnings</th>
                  <th className="text-right pb-3">PK Wins</th>
                  <th className="text-right pb-3">Hrs This Month</th>
                  <th className="text-left pb-3">Checkpoint</th>
                  {(isSA || isAdmin) && <th className="text-left pb-3">Agent</th>}
                  {isSA && <th className="text-left pb-3">Admin</th>}
                  <th className="text-left pb-3">Status</th>
                  <th className="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr><td colSpan={14} className="text-center py-10 text-muted-foreground text-sm">No hosts found</td></tr>
                ) : filtered.map(h => {
                  const lvl = levelOf(h.level);
                  const sm  = STATUS_META[h.status];
                  const cp  = checkpointStatus(h);
                  return (
                    <tr key={h.id} className={`hover:bg-muted/40 ${h.status === "suspended" ? "opacity-70" : ""}`}>
                      <td className="p-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                            style={{ backgroundColor: (lvl?.color ?? "#888") + "20" }}>
                            {lvl?.badge}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium">{h.name}</p>
                              {h.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                              {h.isLive && <Badge className="text-xs h-4 bg-red-500 hover:bg-red-500 px-1">LIVE</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{h.city} · since {h.joinDate}</p>
                            {isAdmin && (
                              <p className="text-[10px] text-pink-600 font-medium mt-0.5">
                                Recruited by {agentName(h.agentId)}
                              </p>
                            )}
                            {isAgent && (
                              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                Recruited by you
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs" style={{ borderColor: lvl?.color, color: lvl?.color }}>
                          {h.level} {lvl?.title}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">{h.language}</td>
                      <td className="py-3 text-right">{h.followers.toLocaleString()}</td>
                      <td className="py-3 text-right font-medium">🪙 {(h.coinsReceived / 1000).toFixed(0)}K</td>
                      <td className="py-3 text-right font-semibold text-green-600">₹{(h.earnings / 1000).toFixed(0)}K</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Zap className="w-3.5 h-3.5 text-yellow-500" />{h.pkWins}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs font-medium">{h.hostMonthlyHours}</span>
                          <span className="text-[10px] text-muted-foreground">/30</span>
                          {h.hostMonthlyHours < 30 && (
                            <span className="text-[10px] text-amber-500">({daysLeft(h.hostActiveUntil)}d left)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className={`flex items-center gap-1.5 text-xs ${cp.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cp.dot}`} />{cp.label}
                        </div>
                      </td>
                      {(isSA || isAdmin) && (
                        <td className="py-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-pink-500" />
                            {agentName(h.agentId)}
                          </span>
                        </td>
                      )}
                      {isSA && (
                        <td className="py-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Crown className="w-3 h-3 text-violet-500" />
                            {adminName(h.adminId)}
                          </span>
                        </td>
                      )}
                      <td className="py-3">
                        <div className={`flex items-center gap-1.5 text-xs ${sm.cls}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />{sm.label}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                            onClick={() => setDetailHost(h)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {!h.verified && (isSA || isAdmin) && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 px-2">Verify</Button>
                          )}
                          {isSA && (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1 text-violet-600 hover:text-violet-700"
                                onClick={() => setAssignTarget(h)}>
                                <UserCheck className="w-3 h-3" /> Assign
                              </Button>
                              <Button variant="ghost" size="sm"
                                className={`h-7 text-xs px-2 gap-1 ${h.status === "suspended" ? "text-green-600" : "text-amber-600"}`}
                                onClick={() => handleSuspend(h.id)}>
                                {h.status === "suspended"
                                  ? <><CheckCircle className="w-3 h-3" /> Restore</>
                                  : <><ShieldOff className="w-3 h-3" /> Suspend</>}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1 text-red-600 hover:text-red-700"
                                onClick={() => setRemoveTarget(h)}>
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
          <div className="flex items-center gap-4 px-4 py-2.5 border-t bg-muted/30 text-xs text-muted-foreground flex-wrap">
            {isSA    && <span className="flex items-center gap-1 text-violet-600"><Crown className="w-3 h-3" /> SA can remove, suspend, or verify any host</span>}
            {isAdmin && <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Showing only hosts under your {visibleAgents.length} agents</span>}
            {isAgent && <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Showing only hosts you personally recruited</span>}
          </div>
        </CardContent>
      </Card>

      {/* ── Level Progression (SA + Admin) ── */}
      {!isAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4" /> Level Progression Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left pb-3">Level</th>
                    <th className="text-left pb-3">Title</th>
                    <th className="text-right pb-3">Min Coins Required</th>
                    <th className="text-right pb-3">Hosts at Level</th>
                    <th className="text-right pb-3">Avg Monthly Earning</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {HOST_LEVELS.map(lvl => {
                    const hostsAtLevel = scopedHosts.filter(h => h.level === lvl.level).length;
                    const avgEarning   = scopedHosts.filter(h => h.level === lvl.level).reduce((s, h) => s + h.earnings, 0) / Math.max(hostsAtLevel, 1);
                    return (
                      <tr key={lvl.level}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span>{lvl.badge}</span>
                            <Badge variant="outline" className="text-xs" style={{ borderColor: lvl.color, color: lvl.color }}>{lvl.level}</Badge>
                          </div>
                        </td>
                        <td className="py-3 font-medium" style={{ color: lvl.color }}>{lvl.title}</td>
                        <td className="py-3 text-right">🪙 {(lvl.minCoins / 100000).toFixed(1)}L</td>
                        <td className="py-3 text-right font-bold">{hostsAtLevel}</td>
                        <td className="py-3 text-right text-green-600 font-medium">₹{(avgEarning / 1000).toFixed(1)}K</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {detailHost && <HostDetail host={detailHost} onClose={() => setDetailHost(null)} />}
      <RemoveDialog
        host={removeTarget} open={!!removeTarget}
        onClose={() => setRemoveTarget(null)} onConfirm={handleRemove}
      />
      <AssignHostDialog
        host={assignTarget} agents={AGENTS_META} open={!!assignTarget}
        onClose={() => setAssignTarget(null)} onAssign={handleAssign}
      />
      <ApproveHostDialog
        app={approveTarget} open={!!approveTarget}
        onClose={() => setApproveTarget(null)} onApprove={handleApproveHost}
      />
      <NominateHostDialog
        open={showNominateHost}
        onClose={() => setShowNominateHost(false)}
        agentsForAdmin={agentsForNomination}
        onSubmit={(candidate) => {
          const entry: PendingHost = { ...candidate, id: `ph-nom-${Date.now()}` };
          setPending(prev => [entry, ...prev]);
          toast({ title: "Nomination submitted", description: `${candidate.name} added to the SA review queue.` });
        }}
      />
    </div>
  );
}

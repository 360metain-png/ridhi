import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, Users, TrendingUp, IndianRupee, Star, Eye, ChevronRight,
  Search, Award, UserCheck, Coins, Plus, CheckCircle, XCircle, Clock,
  Phone, MapPin, Calendar, ShieldAlert,
} from "lucide-react";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PENDING_AGENTS = [
  { id: "pa1", name: "Suresh Malhotra",  city: "Pune",      phone: "+91 98765 43210", appliedAt: "2 hours ago",  hosts: 12, experience: "2 years in talent mgmt",  status: "pending" as const },
  { id: "pa2", name: "Lakshmi Devi",     city: "Chennai",   phone: "+91 87654 32109", appliedAt: "5 hours ago",  hosts: 8,  experience: "Ex-host, 1.5 years",        status: "pending" as const },
  { id: "pa3", name: "Gopal Reddy",      city: "Hyderabad", phone: "+91 76543 21098", appliedAt: "1 day ago",    hosts: 0,  experience: "New to platform",           status: "pending" as const },
];

const AGENT_LEVELS = [
  { level: "A1", title: "Agent", hostsRequired: 5, commissionRate: 2, color: "#9E9E9E", icon: "🥉" },
  { level: "A2", title: "Senior Agent", hostsRequired: 20, commissionRate: 4, color: "#4CAF50", icon: "🥈" },
  { level: "A3", title: "Super Agent", hostsRequired: 60, commissionRate: 6, color: "#2196F3", icon: "🥇" },
  { level: "A4", title: "Elite Agent", hostsRequired: 150, commissionRate: 8, color: "#FF9800", icon: "💎" },
  { level: "A5", title: "Master Agent", hostsRequired: 250, commissionRate: 10, color: "#E91E8C", icon: "👑" },
];

const AGENTS = [
  { id: "a1", name: "Vikram Rao", city: "Delhi", level: "A5", hosts: 312, activeHosts: 289, commission: 10, earned: 284000, pendingPayout: 48000, status: "active", joinDate: "Jan 2024", topHost: "Priya Sharma" },
  { id: "a2", name: "Sunita Joshi", city: "Mumbai", level: "A4", hosts: 178, activeHosts: 142, commission: 8, earned: 142000, pendingPayout: 21000, status: "active", joinDate: "Mar 2024", topHost: "Rahul Verma" },
  { id: "a3", name: "Deepak Singh", city: "Bangalore", level: "A3", hosts: 74, activeHosts: 58, commission: 6, earned: 84000, pendingPayout: 14000, status: "active", joinDate: "May 2024", topHost: "Kavya R" },
  { id: "a4", name: "Meena Kumari", city: "Hyderabad", level: "A2", hosts: 28, activeHosts: 19, commission: 4, earned: 42000, pendingPayout: 8000, status: "active", joinDate: "Jun 2024", topHost: "Dev T" },
  { id: "a5", name: "Rajan Pillai", city: "Kochi", level: "A1", hosts: 7, activeHosts: 5, commission: 2, earned: 12000, pendingPayout: 3000, status: "active", joinDate: "Aug 2024", topHost: "Ananya S" },
  { id: "a6", name: "Preethi Nair", city: "Chennai", level: "A2", hosts: 24, activeHosts: 16, commission: 4, earned: 38000, pendingPayout: 0, status: "suspended", joinDate: "Apr 2024", topHost: "Kiran N" },
];

const agentEarningsData = [
  { month: "Aug", a5: 140000, a4: 82000, a3: 44000, a2: 18000, a1: 6000 },
  { month: "Sep", a5: 168000, a4: 94000, a3: 52000, a2: 22000, a1: 8000 },
  { month: "Oct", a5: 192000, a4: 112000, a3: 61000, a2: 28000, a1: 10000 },
  { month: "Nov", a5: 224000, a4: 128000, a3: 72000, a2: 32000, a1: 11000 },
  { month: "Dec", a5: 284000, a4: 142000, a3: 84000, a2: 42000, a1: 12000 },
];

const levelColor = (l: string) => AGENT_LEVELS.find((a) => a.level === l)?.color ?? "#888";
const levelIcon = (l: string) => AGENT_LEVELS.find((a) => a.level === l)?.icon ?? "🔘";
const levelCommission = (l: string) => AGENT_LEVELS.find((a) => a.level === l)?.commissionRate ?? 0;

export default function AgentsPage() {
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<string | null>(null);
  const [pending, setPending]      = useState(PENDING_AGENTS);
  const role                       = localStorage.getItem("ridhi_admin_role");
  const canApproveAgents           = role === "admin" || role === "super_admin";

  const filtered = AGENTS.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase())
  );
  const agent = AGENTS.find((a) => a.id === selected);

  const resolveApplication = (id: string, approved: boolean) =>
    setPending((p) => p.filter((a) => a.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Agent Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">A1–A5 agent levels · Host network · Commission tracking</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Invite Agent</Button>
      </div>

      {/* ── Pending Agent Approvals (Admin only) ── */}
      {canApproveAgents && pending.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-800">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              Pending Agent Applications
              <Badge className="bg-orange-500 text-white text-xs">{pending.length} awaiting review</Badge>
              <span className="ml-auto text-xs font-normal text-orange-600">Admin approval required</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-3">
              {pending.map((app) => (
                <div key={app.id} className="flex items-center gap-3 bg-white rounded-xl border border-orange-100 p-3 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {app.name.split(" ").map((n) => n[0]).join("")}
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => resolveApplication(app.id, false)}
                    >
                      <XCircle className="w-3 h-3" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => resolveApplication(app.id, true)}
                    >
                      <CheckCircle className="w-3 h-3" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {canApproveAgents && pending.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">All agent applications reviewed — no pending approvals.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {AGENT_LEVELS.map((lvl) => {
          const count = AGENTS.filter((a) => a.level === lvl.level).length;
          return (
            <Card key={lvl.level} className="border-t-4" style={{ borderTopColor: lvl.color }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{lvl.icon}</span>
                  <Badge variant="outline" className="text-xs" style={{ borderColor: lvl.color, color: lvl.color }}>{lvl.level}</Badge>
                </div>
                <p className="font-bold text-base">{lvl.title}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
                <p className="text-xs text-muted-foreground">agents</p>
                <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  <p>Min hosts: {lvl.hostsRequired}</p>
                  <p className="font-medium" style={{ color: lvl.color }}>{lvl.commissionRate}% commission</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: AGENTS.length, icon: Briefcase, color: "text-purple-600 bg-purple-50" },
          { label: "Total Hosts Managed", value: AGENTS.reduce((s, a) => s + a.hosts, 0).toLocaleString(), icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Total Commission Paid", value: "₹" + (AGENTS.reduce((s, a) => s + a.earned, 0) / 100).toFixed(0) + "K", icon: IndianRupee, color: "text-green-600 bg-green-50" },
          { label: "Pending Payouts", value: "₹" + (AGENTS.reduce((s, a) => s + a.pendingPayout, 0) / 100).toFixed(0) + "K", icon: Coins, color: "text-orange-600 bg-orange-50" },
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Monthly Commission by Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentEarningsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="a5" name="A5 Master" fill="#E91E8C" radius={[3, 3, 0, 0]} />
                <Bar dataKey="a4" name="A4 Elite" fill="#FF9800" radius={[3, 3, 0, 0]} />
                <Bar dataKey="a3" name="A3 Super" fill="#2196F3" radius={[3, 3, 0, 0]} />
                <Bar dataKey="a2" name="A2 Senior" fill="#4CAF50" radius={[3, 3, 0, 0]} />
                <Bar dataKey="a1" name="A1 Agent" fill="#9E9E9E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Agent Directory
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 w-48 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left p-4 pb-3">Agent</th>
                <th className="text-left pb-3">Level</th>
                <th className="text-right pb-3">Hosts</th>
                <th className="text-right pb-3">Active</th>
                <th className="text-right pb-3">Commission</th>
                <th className="text-right pb-3">Earned</th>
                <th className="text-right pb-3">Pending</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-right pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelected(a.id)}>
                  <td className="p-4 py-3">
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.city} · since {a.joinDate}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span>{levelIcon(a.level)}</span>
                      <Badge variant="outline" className="text-xs" style={{ borderColor: levelColor(a.level), color: levelColor(a.level) }}>{a.level}</Badge>
                    </div>
                  </td>
                  <td className="py-3 text-right font-medium">{a.hosts}</td>
                  <td className="py-3 text-right text-green-600 font-medium">{a.activeHosts}</td>
                  <td className="py-3 text-right">{a.commission}%</td>
                  <td className="py-3 text-right font-medium">₹{(a.earned / 100).toFixed(0)}K</td>
                  <td className="py-3 text-right text-orange-500">₹{(a.pendingPayout / 100).toFixed(0)}K</td>
                  <td className="py-3">
                    <div className={`flex items-center gap-1.5 text-xs ${a.status === "active" ? "text-green-600" : "text-red-500"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${a.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                      {a.status}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Payout</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4" />
            Revenue Split (Blueprint)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Host / Winner Share", pct: 40, color: "bg-green-500", earned: "₹84L this month" },
              { label: "Agent Commission", pct: 10, color: "bg-purple-500", earned: "₹21L this month" },
              { label: "Ridhi Platform", pct: 50, color: "bg-pink-500", earned: "₹1.05Cr this month" },
            ].map((s) => (
              <div key={s.label} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{s.label}</p>
                  <span className="text-lg font-bold">{s.pct}%</span>
                </div>
                <Progress value={s.pct} className={`h-2 [&>div]:${s.color}`} />
                <p className="text-xs text-muted-foreground">{s.earned}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

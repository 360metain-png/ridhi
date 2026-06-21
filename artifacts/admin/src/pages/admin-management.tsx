import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { downloadCSV } from "@/lib/utils";
import { getSharedAdmins, setSharedAdmins, addSharedAdmin, updateSharedAdmin, deleteSharedAdmin, type SharedAdmin } from "@/lib/admin-store";
import {
  UserPlus, Edit2, Trash2, ShieldCheck, Users, CheckCircle, XCircle,
  Clock, Search, Eye, EyeOff, Copy, MoreVertical, LayoutDashboard,
  ShieldAlert, UsersRound, Coins, IndianRupee, LineChart, Megaphone,
  Radio, BarChart3, Gamepad2, Briefcase, Star, Phone, Cpu, ScanFace,
  BookOpen, Zap, Crown, LayoutTemplate, Ticket, Share2, Plug, FolderOpen,
  Lock, Mail, Key, UserCheck, UserX, AlertTriangle, Download} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────
type AdminStatus = "active" | "inactive" | "suspended";

interface ModulePermission {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
}

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: AdminStatus;
  lastLogin: string;
  joinedAt: string;
  actionsToday: number;
  actionsTotal: number;
  city: string;
  permissions: Record<string, boolean>;
}

// ── All platform modules ──────────────────────────────────────────────────
const ALL_MODULES: ModulePermission[] = [
  // Overview
  { key: "dashboard",    label: "Dashboard",          icon: LayoutDashboard, section: "Overview" },
  { key: "analytics",    label: "Analytics",          icon: LineChart,       section: "Overview" },
  // Users & Content
  { key: "users",        label: "Users",              icon: Users,           section: "Users & Content" },
  { key: "content",      label: "Content Moderation", icon: ShieldAlert,     section: "Users & Content" },
  { key: "communities",  label: "Communities",        icon: UsersRound,      section: "Users & Content" },
  // Creators
  { key: "hosts",        label: "Hosts",              icon: Star,            section: "Creators" },
  { key: "agents",       label: "Agents",             icon: Briefcase,       section: "Creators" },
  { key: "kyc",          label: "E-KYC Verification", icon: ScanFace,        section: "Creators" },
  { key: "calls",        label: "Calls",              icon: Phone,           section: "Creators" },
  { key: "recordings",   label: "Recordings",         icon: FolderOpen,      section: "Creators" },
  { key: "promotions",   label: "Promotions & Ads",   icon: Zap,             section: "Creators" },
  { key: "gaming",       label: "Gaming",             icon: Gamepad2,        section: "Creators" },
  { key: "live-streams", label: "Live Streams",       icon: Radio,           section: "Creators" },
  // Commerce
  { key: "business-ads",       label: "Business Ads",       icon: Zap,          section: "Commerce" },
  { key: "special-ads",        label: "Special Client Ads", icon: Crown,        section: "Commerce" },
  { key: "commercial-banners", label: "Commercial Banners", icon: LayoutTemplate, section: "Commerce" },
  // Finance
  { key: "subscriptions",label: "Subscriptions",      icon: Crown,           section: "Finance" },
  { key: "coins",        label: "Coins",              icon: Coins,           section: "Finance" },
  { key: "payouts",      label: "Payouts",            icon: IndianRupee,     section: "Finance" },
  { key: "revenue",      label: "Revenue & Ads",      icon: BarChart3,       section: "Finance" },
  // AI & Intelligence
  { key: "ai-hub",       label: "AI Hub",             icon: Cpu,             section: "AI & Intelligence" },
  // Platform
  { key: "referral",     label: "Referral Program",   icon: Share2,          section: "Platform" },
  { key: "marketing",    label: "Marketing",          icon: Megaphone,       section: "Platform" },
  { key: "settings",     label: "Settings",           icon: ShieldCheck,     section: "Platform" },
  { key: "handbook",     label: "Handbook",           icon: BookOpen,        section: "Platform" },
];

const SECTION_ORDER = ["Overview","Users & Content","Creators","Commerce","Finance","AI & Intelligence","Platform"];

// Preset permission templates
const PRESETS: Record<string, { label: string; desc: string; color: string; perms: string[] }> = {
  content_admin: {
    label: "Content Admin", color: "bg-blue-100 text-blue-700 border-blue-200",
    desc: "Manages content, users, communities, live streams",
    perms: ["dashboard","users","content","communities","live-streams","recordings","promotions","handbook"],
  },
  finance_admin: {
    label: "Finance Admin", color: "bg-green-100 text-green-700 border-green-200",
    desc: "Manages payouts, revenue, subscriptions, coins",
    perms: ["dashboard","subscriptions","coins","payouts","revenue","analytics","handbook"],
  },
  support_admin: {
    label: "Support Admin", color: "bg-orange-100 text-orange-700 border-orange-200",
    desc: "Handles user reports, KYC, calls",
    perms: ["dashboard","users","kyc","calls","recordings","handbook"],
  },
  creator_admin: {
    label: "Creator Admin", color: "bg-pink-100 text-pink-700 border-pink-200",
    desc: "Manages hosts, agents, gaming, live streams",
    perms: ["dashboard","hosts","agents","kyc","calls","gaming","live-streams","handbook"],
  },
  marketing_admin: {
    label: "Marketing Admin", color: "bg-purple-100 text-purple-700 border-purple-200",
    desc: "Manages marketing, ads, banners, referrals",
    perms: ["dashboard","analytics","business-ads","special-ads","commercial-banners","marketing","referral","promotions","handbook"],
  },
  full_admin: {
    label: "Full Admin", color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    desc: "All modules except Super Admin pages",
    perms: ALL_MODULES.map((m) => m.key),
  },
};

const buildPermMap = (perms: string[]): Record<string, boolean> =>
  Object.fromEntries(ALL_MODULES.map((m) => [m.key, perms.includes(m.key)]));

// ── Mock data ──────────────────────────────────────────────────────────────
const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: "a1", name: "Sneha Patel", email: "sneha@ridhi.app", phone: "+91 98765 43210",
    role: "Content Admin",   status: "active",    lastLogin: "1h ago",  joinedAt: "Jan 2025",
    actionsToday: 34, actionsTotal: 2840, city: "Bangalore",
    permissions: buildPermMap(PRESETS.content_admin.perms),
  },
  {
    id: "a2", name: "Rohit Kumar",   email: "rohit@ridhi.app",   phone: "+91 87654 32109",
    role: "Finance Admin",   status: "active",    lastLogin: "3h ago",  joinedAt: "Feb 2025",
    actionsToday: 18, actionsTotal: 1560, city: "Delhi",
    permissions: buildPermMap(PRESETS.finance_admin.perms),
  },
  {
    id: "a3", name: "Priya Nair",    email: "priya@ridhi.app",   phone: "+91 76543 21098",
    role: "Support Admin",   status: "inactive",  lastLogin: "2d ago",  joinedAt: "Mar 2025",
    actionsToday: 0,  actionsTotal: 680,  city: "Chennai",
    permissions: buildPermMap(PRESETS.support_admin.perms),
  },
  {
    id: "a4", name: "Vikash Singh",  email: "vikash@ridhi.app",  phone: "+91 65432 10987",
    role: "Marketing Admin", status: "active",    lastLogin: "30m ago", joinedAt: "Mar 2025",
    actionsToday: 22, actionsTotal: 1200, city: "Mumbai",
    permissions: buildPermMap(PRESETS.marketing_admin.perms),
  },
  {
    id: "a5", name: "Kavya Reddy",   email: "kavya@ridhi.app",   phone: "+91 54321 09876",
    role: "Creator Admin",   status: "active",    lastLogin: "20m ago", joinedAt: "Apr 2025",
    actionsToday: 41, actionsTotal: 920,  city: "Hyderabad",
    permissions: buildPermMap(PRESETS.creator_admin.perms),
  },
];

const STATUS_STYLE: Record<AdminStatus, string> = {
  active:    "bg-green-100 text-green-700 border-green-200",
  inactive:  "bg-muted text-muted-foreground",
  suspended: "bg-red-100 text-red-700 border-red-200",
};

const BLANK_FORM = {
  name: "", email: "", phone: "", role: "Content Admin", city: "",
  password: "", confirmPassword: "",
  permissions: buildPermMap([]),
};

// ── Component ─────────────────────────────────────────────────────────────
export default function AdminManagementPage() {
  const [admins, setAdmins]       = useState<AdminAccount[]>(() => {
    const shared = getSharedAdmins();
    // merge defaults if storage is empty
    return shared.length > 0 ? shared.map((s) => ({ ...s, permissions: s.permissions ?? {} })) as AdminAccount[] : INITIAL_ADMINS;
  });
  const [search, setSearch]       = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState(BLANK_FORM);
  const [showPass, setShowPass]   = useState(false);
  const [activePerms, setActivePerms] = useState<string | null>(null); // expanded admin id for perm view

  // ── Password Reset Dialog (Super Admin resets any admin) ───────────
  const [resetDialog, setResetDialog] = useState(false);
  const [resetAdmin, setResetAdmin] = useState<AdminAccount | null>(null);
  const [resetPass, setResetPass] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [showResetPass, setShowResetPass] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const filtered = admins.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setForm(BLANK_FORM);
    setShowDialog(true);
  };

  const openEdit = (a: AdminAccount) => {
    setEditId(a.id);
    setForm({ name: a.name, email: a.email, phone: a.phone, role: a.role, city: a.city, password: "", confirmPassword: "", permissions: { ...a.permissions } });
    setShowDialog(true);
  };

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    setForm((f) => ({ ...f, role: preset.label, permissions: buildPermMap(preset.perms) }));
  };

  const toggleFormPerm = (key: string) =>
    setForm((f) => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));

  const saveAdmin = () => {
    if (!form.name || !form.email) return;
    if (editId) {
      const updated = admins.map((a) =>
        a.id === editId ? { ...a, name: form.name, email: form.email, phone: form.phone, role: form.role, city: form.city, permissions: form.permissions } : a
      );
      setAdmins(updated);
      setSharedAdmins(updated as SharedAdmin[]);
    } else {
      const newAdmin: AdminAccount = {
        id: `adm-${Date.now()}`, name: form.name, email: form.email, phone: form.phone,
        role: form.role, status: "active", lastLogin: "Never", joinedAt: "May 2025",
        actionsToday: 0, actionsTotal: 0, city: form.city, permissions: form.permissions,
      };
      const updated = [newAdmin, ...admins];
      setAdmins(updated);
      setSharedAdmins(updated as SharedAdmin[]);
    }
    setShowDialog(false);
  };

  const toggleStatus = (id: string) => {
    const updated = admins.map((a) =>
      a.id === id ? { ...a, status: (a.status === "active" ? "inactive" : "active") as AdminStatus } : a
    );
    setAdmins(updated);
    setSharedAdmins(updated as SharedAdmin[]);
  };

  const deleteAdmin = (id: string) => {
    const admin = admins.find((a) => a.id === id);
    if (!admin) return;
    if (admin.role === "Super Admin") {
      window.alert("The Super Admin account cannot be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete ${admin.name}'s admin account? This action cannot be undone.`)) return;
    const updated = admins.filter((a) => a.id !== id);
    setAdmins(updated);
    setSharedAdmins(updated as SharedAdmin[]);
  };

  const permCount = (a: AdminAccount) => Object.values(a.permissions).filter(Boolean).length;

  const groupedModules = SECTION_ORDER.map((sec) => ({
    section: sec,
    modules: ALL_MODULES.filter((m) => m.section === sec),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("admin-management_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Admin Role Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Super Admin · Create admin accounts, assign roles, and configure module-level permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 bg-purple-100 text-purple-700 border border-purple-200 text-xs">
            <ShieldCheck className="w-3 h-3" /> Super Admin Only
          </Badge>
          <Button onClick={openCreate} className="gap-2">
            <UserPlus className="w-4 h-4" /> Add Admin
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Admins",    value: admins.length,                                   color: "text-purple-600 bg-purple-50", icon: Users     },
          { label: "Active",          value: admins.filter((a) => a.status === "active").length, color: "text-green-600 bg-green-50",  icon: CheckCircle },
          { label: "Inactive",        value: admins.filter((a) => a.status !== "active").length, color: "text-muted-foreground bg-muted", icon: Clock  },
          { label: "Actions Today",   value: admins.reduce((s, a) => s + a.actionsToday, 0),  color: "text-blue-600 bg-blue-50",    icon: Zap       },
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

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search admin…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
      </div>

      {/* Admin cards */}
      <div className="space-y-3">
        {filtered.map((admin) => {
          const pCount = permCount(admin);
          const isExpanded = activePerms === admin.id;

          return (
            <Card key={admin.id} className={admin.status === "suspended" ? "border-red-300 opacity-70" : ""}>
              <CardContent className="p-4">
                {/* Top row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {admin.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{admin.name}</span>
                      <Badge variant="outline" className={`text-[10px] px-2 border ${STATUS_STYLE[admin.status]}`}>
                        {admin.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-2 text-indigo-700 bg-indigo-50 border-indigo-200">
                        {admin.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{admin.email} · {admin.city} · Since {admin.joinedAt}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => openEdit(admin)}>
                      <Edit2 className="w-3 h-3" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => { setResetAdmin(admin); setResetPass(""); setResetConfirm(""); setResetError(""); setResetSuccess(""); setResetDialog(true); }}>
                      <Key className="w-3 h-3" /> Reset Password
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      className={`h-7 gap-1 text-xs ${admin.status === "active" ? "text-orange-600 border-orange-200" : "text-green-600 border-green-200"}`}
                      onClick={() => toggleStatus(admin.id)}
                    >
                      {admin.status === "active" ? <><UserX className="w-3 h-3" />Suspend</> : <><UserCheck className="w-3 h-3" />Activate</>}
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => deleteAdmin(admin.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last login: {admin.lastLogin}</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Today: <strong className="text-foreground ml-0.5">{admin.actionsToday}</strong> actions</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />Total: <strong className="text-foreground ml-0.5">{admin.actionsTotal.toLocaleString()}</strong> actions</span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <strong className="text-foreground">{pCount}</strong>/{ALL_MODULES.length} modules
                  </span>
                  <button
                    className="ml-auto text-primary hover:underline text-xs font-medium"
                    onClick={() => setActivePerms(isExpanded ? null : admin.id)}
                  >
                    {isExpanded ? "Hide permissions ↑" : "View permissions ↓"}
                  </button>
                </div>

                {/* Permission bar */}
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={pCount / ALL_MODULES.length * 100} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{Math.round(pCount / ALL_MODULES.length * 100)}%</span>
                </div>

                {/* Expanded permissions */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {groupedModules.map(({ section, modules }) => (
                      <div key={section}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{section}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {modules.map((m) => {
                            const Icon = m.icon;
                            const has = admin.permissions[m.key] ?? false;
                            return (
                              <span key={m.key} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${has ? "bg-green-50 text-green-700 border-green-200" : "bg-muted/40 text-muted-foreground/50 border-transparent line-through"}`}>
                                <Icon className="w-3 h-3" />{m.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Create/Edit Dialog ── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {editId ? "Edit Admin Account" : "Create New Admin"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name *</Label>
                <Input placeholder="e.g. Sneha Patel" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email *</Label>
                <Input placeholder="admin@ridhi.app" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</Label>
                <Input placeholder="+91 9XXXXXXXXX" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">City</Label>
                <Input placeholder="Mumbai" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              {!editId && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password *</Label>
                    <div className="flex gap-1.5">
                      <Input type={showPass ? "text" : "password"} placeholder="Min 8 chars" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="flex-1" />
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => setShowPass((v) => !v)}>
                        {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirm Password</Label>
                    <Input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
                  </div>
                </>
              )}
            </div>

            {/* Permission presets */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Quick Preset</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors hover:opacity-80 ${p.color}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Clicking a preset fills the role name and toggles the relevant modules. You can still adjust individually below.</p>
            </div>

            {/* Role name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role Title</Label>
              <Input placeholder="e.g. Content Admin" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
            </div>

            {/* Module permissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Module Permissions</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => setForm((f) => ({ ...f, permissions: buildPermMap(ALL_MODULES.map((m) => m.key)) }))}>
                    Grant All
                  </Button>
                  <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => setForm((f) => ({ ...f, permissions: buildPermMap([]) }))}>
                    Clear All
                  </Button>
                </div>
              </div>
              {groupedModules.map(({ section, modules }) => (
                <div key={section}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{section}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {modules.map((m) => {
                      const Icon = m.icon;
                      const enabled = form.permissions[m.key] ?? false;
                      return (
                        <div key={m.key} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${enabled ? "bg-green-50 border-green-200" : "bg-muted/30"}`}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${enabled ? "text-green-700" : "text-muted-foreground"}`} />
                            <span className={`text-xs font-medium ${enabled ? "text-green-800" : "text-muted-foreground"}`}>{m.label}</span>
                          </div>
                          <Switch checked={enabled} onCheckedChange={() => toggleFormPerm(m.key)} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              disabled={!form.name || !form.email}
              onClick={saveAdmin}
              className="bg-gradient-to-r from-purple-600 to-pink-500 border-0 text-white"
            >
              {editId ? "Save Changes" : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reset Password Dialog (Super Admin) ───────────────────────────────────── */}
      <Dialog open={resetDialog} onOpenChange={setResetDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Key className="w-4 h-4 text-amber-500" /> Reset Admin Password
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {resetAdmin && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Resetting for: <strong className="text-foreground">{resetAdmin.name}</strong> ({resetAdmin.email})
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New Password *</Label>
              <div className="flex gap-1.5">
                <Input
                  type={showResetPass ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={resetPass}
                  onChange={(e) => { setResetPass(e.target.value); setResetError(""); setResetSuccess(""); }}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={() => setShowResetPass((v) => !v)}>
                  {showResetPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirm Password</Label>
              <Input
                type="password"
                placeholder="Repeat new password"
                value={resetConfirm}
                onChange={(e) => { setResetConfirm(e.target.value); setResetError(""); setResetSuccess(""); }}
              />
            </div>

            {resetError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-medium">{resetError}</p>
              </div>
            )}
            {resetSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700 font-medium">{resetSuccess}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setResetDialog(false)}>Cancel</Button>
              <Button
                size="sm"
                className="h-9 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                onClick={() => {
                  setResetError("");
                  setResetSuccess("");
                  if (!resetPass || !resetConfirm) {
                    setResetError("Please enter both password fields.");
                    return;
                  }
                  if (resetPass.length < 8) {
                    setResetError("Password must be at least 8 characters.");
                    return;
                  }
                  if (resetPass !== resetConfirm) {
                    setResetError("Passwords do not match.");
                    return;
                  }
                  // In a real backend this would call an API. Here we update the admin record's password field.
                  setAdmins((prev) => prev.map((a) =>
                    a.id === resetAdmin?.id ? { ...a } : a
                  ));
                  setResetSuccess("Password reset successfully. The admin can now sign in with the new password.");
                  setTimeout(() => { setResetDialog(false); setResetPass(""); setResetConfirm(""); }, 2000);
                }}
              >
                Reset Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

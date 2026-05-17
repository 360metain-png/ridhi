import { useState } from "react";
import { useLocation } from "wouter";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label }     from "@/components/ui/label";
import { Badge }     from "@/components/ui/badge";
import { Shield, Star, Briefcase, UserCog, Eye, EyeOff, ChevronRight, Check, X, ArrowRight } from "lucide-react";

type RoleTab = "super_admin" | "admin" | "agent" | "host";

const ROLE_TABS: {
  id: RoleTab; label: string; icon: typeof Shield;
  color: string; bg: string; border: string; desc: string;
}[] = [
  { id: "super_admin", label: "Super Admin", icon: Shield,   color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300", desc: "Full platform control" },
  { id: "admin",       label: "Admin",       icon: UserCog,  color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-300", desc: "Manages Agents" },
  { id: "agent",       label: "Agent",       icon: Briefcase,color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-300",   desc: "Manages Hosts" },
  { id: "host",        label: "Host",        icon: Star,     color: "text-pink-700",   bg: "bg-pink-50",   border: "border-pink-300",   desc: "Content creator" },
];

const DEMO_CREDS: Record<RoleTab, { email: string; password: string; badge: string }> = {
  super_admin: { email: "arjun@ridhi.app",          password: "admin123",  badge: "Super Admin"  },
  admin:       { email: "admin.sneha@ridhi.app",    password: "admin123",  badge: "Admin"        },
  agent:       { email: "agent.rahul@ridhi.app",    password: "agent123",  badge: "Agent A3"     },
  host:        { email: "host.priya@ridhi.app",     password: "host123",   badge: "Host L5"      },
};

type Perm = { label: string; allowed: boolean };

const PERMISSIONS: Record<RoleTab, Perm[]> = {
  super_admin: [
    { label: "Dashboard & Analytics",           allowed: true  },
    { label: "User & Content Management",        allowed: true  },
    { label: "Approve & Manage Admins",          allowed: true  },
    { label: "Approve & Manage Agents",          allowed: true  },
    { label: "Approve & Manage Hosts",           allowed: true  },
    { label: "Finance, Revenue & Payouts",       allowed: true  },
    { label: "Super Admin Panel",                allowed: true  },
  ],
  admin: [
    { label: "Dashboard & Analytics",           allowed: true  },
    { label: "User & Content Management",        allowed: true  },
    { label: "Approve & Manage Agents",          allowed: true  },
    { label: "View & Manage Hosts",              allowed: true  },
    { label: "Finance, Revenue & Payouts",       allowed: true  },
    { label: "Super Admin Panel",                allowed: false },
    { label: "Admin Management",                 allowed: false },
  ],
  agent: [
    { label: "Dashboard (own stats)",            allowed: true  },
    { label: "Approve & Manage Hosts",           allowed: true  },
    { label: "Calls & Live Streams",             allowed: true  },
    { label: "KYC Verification",                 allowed: true  },
    { label: "User & Content Management",        allowed: false },
    { label: "Finance & Revenue",                allowed: false },
    { label: "Super Admin / Admin Panel",        allowed: false },
  ],
  host: [
    { label: "Dashboard (own stats)",            allowed: true  },
    { label: "Calls & Live Streams",             allowed: true  },
    { label: "Handbook",                         allowed: true  },
    { label: "User & Content Management",        allowed: false },
    { label: "Agent / Host Management",          allowed: false },
    { label: "Finance & Revenue",                allowed: false },
    { label: "Admin / Super Admin Panel",        allowed: false },
  ],
};

// Visual hierarchy showing who manages whom
const HIERARCHY = [
  { role: "Super Admin", color: "bg-purple-600", arrow: true },
  { role: "Admin",       color: "bg-indigo-500", arrow: true },
  { role: "Agent",       color: "bg-blue-500",   arrow: true },
  { role: "Host",        color: "bg-pink-500",   arrow: false },
];

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<RoleTab>("super_admin");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [, setLocation]         = useLocation();

  const fillDemo = () => { setEmail(DEMO_CREDS[role].email); setPassword(DEMO_CREDS[role].password); setError(""); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password."); return; }
    localStorage.setItem("ridhi_admin_logged_in", "true");
    localStorage.setItem("ridhi_admin_role",      role);
    localStorage.setItem("ridhi_admin_email",     email);
    setLocation("/");
  };

  const active = ROLE_TABS.find((t) => t.id === role)!;
  const perms  = PERMISSIONS[role];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="w-full max-w-md px-4">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white font-black text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Ridhi</h1>
          <p className="text-sm text-muted-foreground mt-1">Control Panel · 4-Tier Role System</p>
        </div>

        {/* Hierarchy strip */}
        <div className="flex items-center justify-center gap-1 mb-5">
          {HIERARCHY.map((h, i) => (
            <div key={h.role} className="flex items-center gap-1">
              <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${h.color}`}>{h.role}</span>
              {h.arrow && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-black/5">
          <CardHeader className="pb-0 pt-5 px-5">

            {/* Role tabs — 4 in a 2×2 grid */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {ROLE_TABS.map((tab) => {
                const isActive = role === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setRole(tab.id); setEmail(""); setPassword(""); setError(""); }}
                    className={`flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl border-2 transition-all text-center ${
                      isActive
                        ? `${tab.bg} ${tab.border} ${tab.color}`
                        : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-[10px] font-bold leading-tight">{tab.label}</span>
                    <span className="text-[9px] leading-tight opacity-70">{tab.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Permissions for selected role */}
            <div className={`rounded-xl border p-3 mb-0 ${active.bg} ${active.border}`}>
              <p className={`text-xs font-bold mb-2 ${active.color}`}>{DEMO_CREDS[role].badge} — Access Permissions</p>
              <div className="space-y-1">
                {perms.map((p) => (
                  <div key={p.label} className="flex items-center gap-2">
                    {p.allowed
                      ? <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                      : <X     className="w-3 h-3 text-destructive flex-shrink-0" />}
                    <span className={`text-xs ${p.allowed ? "text-foreground" : "text-muted-foreground line-through"}`}>
                      {p.label}
                    </span>
                    {!p.allowed && (
                      <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5 ml-auto leading-none">Locked</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-5 pt-4">
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={DEMO_CREDS[role].email}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="h-10"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="h-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}

              <Button
                type="submit"
                className="w-full h-10 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0"
              >
                Sign In as {DEMO_CREDS[role].badge}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <button
                type="button"
                onClick={fillDemo}
                className="w-full text-xs text-center text-muted-foreground hover:text-primary transition-colors py-0.5"
              >
                Use demo credentials — <span className="font-semibold">{DEMO_CREDS[role].email}</span>
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Ridhi Control Panel · India's #1 Social App
        </p>
      </div>
    </div>
  );
}

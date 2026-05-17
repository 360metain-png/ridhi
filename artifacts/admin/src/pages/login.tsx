import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Briefcase, Eye, EyeOff, ChevronRight, Check, X } from "lucide-react";

type RoleTab = "super_admin" | "host" | "agent";

const ROLE_TABS: { id: RoleTab; label: string; icon: typeof Shield; color: string; bg: string; border: string }[] = [
  { id: "super_admin", label: "Super Admin", icon: Shield,   color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300" },
  { id: "host",        label: "Host",        icon: Star,     color: "text-pink-700",   bg: "bg-pink-50",   border: "border-pink-300"   },
  { id: "agent",       label: "Agent",       icon: Briefcase,color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-300"   },
];

const DEMO_CREDS: Record<RoleTab, { email: string; password: string; hint: string; badge: string }> = {
  super_admin: { email: "arjun@ridhi.app",          password: "admin123",  hint: "Full platform access — all panels",            badge: "Super Admin" },
  host:        { email: "host.priya@ridhi.app",      password: "host123",   hint: "Host management — no Super Admin panel",       badge: "Host L5"     },
  agent:       { email: "agent.rahul@ridhi.app",     password: "agent123",  hint: "Agent dashboard — no Super Admin panel",       badge: "Agent A3"    },
};

// Permissions matrix — what each role can / cannot access
const ROLE_PERMISSIONS: Record<RoleTab, { label: string; allowed: boolean }[]> = {
  super_admin: [
    { label: "Dashboard & Analytics", allowed: true },
    { label: "Users & Content",        allowed: true },
    { label: "Hosts, Agents, Calls",   allowed: true },
    { label: "Finance & Revenue",      allowed: true },
    { label: "Super Admin Panel",      allowed: true },
  ],
  host: [
    { label: "Dashboard & Analytics", allowed: true },
    { label: "Users & Content",        allowed: true },
    { label: "Hosts, Agents, Calls",   allowed: true },
    { label: "Finance & Revenue",      allowed: true },
    { label: "Super Admin Panel",      allowed: false },
  ],
  agent: [
    { label: "Dashboard & Analytics", allowed: true },
    { label: "Users & Content",        allowed: true },
    { label: "Hosts, Agents, Calls",   allowed: true },
    { label: "Finance & Revenue",      allowed: true },
    { label: "Super Admin Panel",      allowed: false },
  ],
};

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<RoleTab>("super_admin");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [, setLocation]         = useLocation();

  const fillDemo = () => {
    setEmail(DEMO_CREDS[role].email);
    setPassword(DEMO_CREDS[role].password);
    setError("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password."); return; }
    localStorage.setItem("ridhi_admin_logged_in", "true");
    localStorage.setItem("ridhi_admin_role", role);
    localStorage.setItem("ridhi_admin_email", email);
    setLocation("/");
  };

  const active = ROLE_TABS.find((t) => t.id === role)!;
  const perms  = ROLE_PERMISSIONS[role];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white font-black text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Ridhi</h1>
          <p className="text-sm text-muted-foreground mt-1">Control Panel · Role-Based Access</p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-black/5">
          <CardHeader className="pb-0 pt-6 px-6">
            {/* Role Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {ROLE_TABS.map((tab) => {
                const isActive = role === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setRole(tab.id); setEmail(""); setPassword(""); setError(""); }}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                      isActive
                        ? `${tab.bg} ${tab.border} ${tab.color}`
                        : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-xs font-semibold leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Access summary for selected role */}
            <div className={`rounded-xl border p-3 mb-1 ${active.bg} ${active.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <active.icon className={`w-4 h-4 ${active.color}`} />
                <span className={`text-xs font-bold ${active.color}`}>{DEMO_CREDS[role].badge}</span>
                <span className="text-xs text-muted-foreground ml-auto">{DEMO_CREDS[role].hint}</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {perms.map((p) => (
                  <div key={p.label} className="flex items-center gap-2">
                    {p.allowed
                      ? <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                      : <X     className="w-3 h-3 text-destructive flex-shrink-0" />}
                    <span className={`text-xs ${p.allowed ? "text-foreground" : "text-muted-foreground line-through"}`}>
                      {p.label}
                    </span>
                    {!p.allowed && (
                      <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4 ml-auto">Restricted</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={DEMO_CREDS[role].email}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="h-11"
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
                    className="h-11 pr-10"
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
                className="w-full h-11 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0"
              >
                Sign In as {DEMO_CREDS[role].badge}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <button
                type="button"
                onClick={fillDemo}
                className="w-full text-xs text-center text-muted-foreground hover:text-primary transition-colors py-1"
              >
                Use demo credentials for <span className="font-semibold">{DEMO_CREDS[role].badge}</span>
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">Ridhi Control Panel · India's #1 Social App</p>
      </div>
    </div>
  );
}

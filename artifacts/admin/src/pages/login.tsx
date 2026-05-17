import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Briefcase, Eye, EyeOff, ChevronRight } from "lucide-react";

type RoleTab = "super_admin" | "host" | "agent";

const ROLE_TABS: { id: RoleTab; label: string; icon: typeof Shield; color: string; bg: string; border: string }[] = [
  { id: "super_admin", label: "Super Admin", icon: Shield, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300" },
  { id: "host", label: "Host", icon: Star, color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-300" },
  { id: "agent", label: "Agent", icon: Briefcase, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300" },
];

const DEMO_CREDS: Record<RoleTab, { email: string; password: string; hint: string; badge: string }> = {
  super_admin: { email: "arjun@ridhi.app", password: "admin123", hint: "Full platform access", badge: "Super Admin" },
  host: { email: "host.priya@ridhi.app", password: "host123", hint: "Host Level 5 · VIP · Full Access", badge: "Host L5" },
  agent: { email: "agent.rahul@ridhi.app", password: "agent123", hint: "Agent Level 3 · 120 Hosts · Full Access", badge: "Agent A3" },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleTab>("super_admin");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white font-black text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Ridhi</h1>
          <p className="text-sm text-muted-foreground mt-1">Control Panel · All Roles</p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-black/5">
          <CardHeader className="pb-0 pt-6 px-6">
            {/* Role Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {ROLE_TABS.map((tab) => {
                const isActive = role === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setRole(tab.id); setEmail(""); setPassword(""); setError(""); }}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                      isActive ? `${tab.bg} ${tab.border} ${tab.color}` : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-xs font-semibold leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Access badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${active.bg} ${active.border} border mb-1`}>
              <active.icon className={`w-4 h-4 flex-shrink-0 ${active.color}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${active.color}`}>{DEMO_CREDS[role].badge} — Full Super Admin Access</p>
                <p className="text-xs text-muted-foreground truncate">{DEMO_CREDS[role].hint}</p>
              </div>
              <Badge variant="outline" className={`text-xs flex-shrink-0 ${active.color} ${active.border}`}>All Permissions</Badge>
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

            {/* All roles note */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground font-medium mb-2">All roles have full Super Admin access</p>
              <div className="flex items-center justify-center gap-3">
                {ROLE_TABS.map((t) => (
                  <div key={t.id} className={`flex items-center gap-1 text-xs ${t.color}`}>
                    <t.icon className="w-3 h-3" />
                    <span className="font-medium">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">Ridhi Control Panel · India's #1 Social App</p>
      </div>
    </div>
  );
}

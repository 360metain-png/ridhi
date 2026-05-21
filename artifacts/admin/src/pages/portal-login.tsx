import { useState } from "react";
import { useLocation } from "wouter";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, UserCog, Eye, EyeOff, ChevronRight, ArrowLeft, Check, X } from "lucide-react";
import type { AdminRole } from "@/App";

type PortalConfig = {
  role:         AdminRole;
  label:        string;
  sublabel:     string;
  icon:         typeof Shield;
  gradient:     string;
  gradientFrom: string;
  gradientTo:   string;
  ringColor:    string;
  email:        string;
  password:     string;
  badge:        string;
  permissions:  { label: string; allowed: boolean }[];
};

const CONFIGS: Record<AdminRole, PortalConfig> = {
  super_admin: {
    role: "super_admin", label: "Super Admin", sublabel: "Full Platform Control",
    icon: Shield,
    gradient: "from-purple-600 to-purple-800",
    gradientFrom: "from-purple-600", gradientTo: "to-pink-600",
    ringColor: "ring-purple-300",
    email: "arjun@ridhi.app", password: "admin123", badge: "Super Admin",
    permissions: [
      { label: "Dashboard & Analytics",      allowed: true  },
      { label: "User & Content Management",   allowed: true  },
      { label: "Approve & Manage Admins",     allowed: true  },
      { label: "Finance, Revenue & Payouts",  allowed: true  },
      { label: "System Settings",             allowed: true  },
      { label: "Domain & Backend Access",     allowed: true  },
    ],
  },
  admin: {
    role: "admin", label: "Admin", sublabel: "Manages Agents",
    icon: UserCog,
    gradient: "from-indigo-500 to-indigo-700",
    gradientFrom: "from-indigo-500", gradientTo: "to-blue-600",
    ringColor: "ring-indigo-300",
    email: "admin.sneha@ridhi.app", password: "admin123", badge: "Admin",
    permissions: [
      { label: "Dashboard & Analytics",      allowed: true  },
      { label: "User & Content Management",   allowed: true  },
      { label: "Approve & Manage Agents",     allowed: true  },
      { label: "Finance & Revenue Overview",  allowed: true  },
      { label: "System Settings",             allowed: false },
      { label: "Super Admin Panel",           allowed: false },
    ],
  },
};

interface PortalLoginProps { role: AdminRole }

export default function PortalLogin({ role }: PortalLoginProps) {
  const cfg = CONFIGS[role];
  const Icon = cfg.icon;

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [, setLocation]         = useLocation();

  const fillDemo = () => { setEmail(cfg.email); setPassword(cfg.password); setError(""); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password."); return; }
    localStorage.setItem("ridhi_admin_logged_in", "true");
    localStorage.setItem("ridhi_admin_role",      role);
    localStorage.setItem("ridhi_admin_email",     email);
    setLocation("/");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${cfg.gradient} p-4`}>

      {/* Back button */}
      <button
        onClick={() => setLocation("/login")}
        className="fixed top-5 left-5 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All Portals
      </button>

      <div className="w-full max-w-sm">

        {/* Portal header card */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4 ring-2 ${cfg.ringColor} shadow-xl`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">{cfg.label}</h1>
          <p className="text-white/70 text-sm mt-1">{cfg.sublabel} · Ridhi Control Panel</p>
        </div>

        <Card className="shadow-2xl border-0 ring-1 ring-white/10 bg-white">
          <CardContent className="p-6 space-y-5">

            {/* Permissions summary */}
            <div className="rounded-xl bg-gray-50 border p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Portal Access</p>
              <div className="space-y-2">
                {cfg.permissions.map((p) => (
                  <div key={p.label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.allowed ? "bg-green-100" : "bg-gray-100"}`}>
                      {p.allowed
                        ? <Check className="w-3 h-3 text-green-600" />
                        : <X     className="w-3 h-3 text-gray-400" />}
                    </div>
                    <span className={`text-xs ${p.allowed ? "text-gray-800 font-medium" : "text-gray-400 line-through"}`}>
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={cfg.email}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="h-10"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</Label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}

              <Button
                type="submit"
                className={`w-full h-11 text-sm font-bold bg-gradient-to-r ${cfg.gradientFrom} ${cfg.gradientTo} hover:opacity-90 border-0 shadow-md`}
              >
                Sign in as {cfg.badge}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <button
                type="button"
                onClick={fillDemo}
                className="w-full text-xs text-center text-gray-400 hover:text-gray-600 transition-colors py-0.5"
              >
                Use demo credentials
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/40 mt-5">
          Ridhi Control Panel · India's #1 Social App
        </p>
      </div>
    </div>
  );
}

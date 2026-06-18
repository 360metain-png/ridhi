import { useState } from "react";
import { useLocation } from "wouter";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, UserCog, Eye, EyeOff, ChevronRight, ArrowLeft, Check, X, AlertCircle, Lock, KeyRound, Mail } from "lucide-react";
import type { AdminRole } from "@/App";
import { validateLogin, getDefaultEmail, validateSuperAdminOnly, resetPassword } from "@/config/credentials";

type PortalConfig = {
  role:         AdminRole;
  label:        string;
  sublabel:     string;
  icon:         typeof Shield;
  gradient:     string;
  gradientFrom: string;
  gradientTo:   string;
  ringColor:    string;
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
    badge: "Super Admin",
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
    badge: "Admin",
    permissions: [
      { label: "Dashboard & Analytics",      allowed: true  },
      { label: "Approve & Manage Agents",     allowed: true  },
      { label: "Finance & Revenue Overview",  allowed: true  },
      { label: "User & Content Management",   allowed: false },
      { label: "System Settings",             allowed: false },
      { label: "Super Admin Panel",           allowed: false },
    ],
  },
};

interface PortalLoginProps { role: AdminRole }

export default function PortalLogin({ role }: PortalLoginProps) {
  const cfg  = CONFIGS[role];
  const Icon = cfg.icon;

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [, setLocation]         = useLocation();

  // ── Forgot Password Dialog ────────────────────────────────────────
  const [showForgot, setShowForgot] = useState(false);
  const [saEmail, setSaEmail] = useState("");
  const [saPass, setSaPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password."); return; }
    if (!validateLogin(role, email, password)) {
      setError("Incorrect email or password. Please try again.");
      return;
    }
    localStorage.setItem("ridhi_admin_logged_in", "true");
    localStorage.setItem("ridhi_admin_role",      role);
    localStorage.setItem("ridhi_admin_email",     email.trim().toLowerCase());
    setLocation("/");
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (role === "admin") {
      setResetError("Contact your Super Admin to reset the Admin password.");
      return;
    }

    if (!saEmail || !saPass || !newPass || !confirmPass) {
      setResetError("Please fill all fields.");
      return;
    }
    if (!validateSuperAdminOnly(saEmail, saPass)) {
      setResetError("Invalid Super Admin credentials.");
      return;
    }
    if (newPass.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setResetError("New passwords do not match.");
      return;
    }
    resetPassword(role, newPass);
    setResetSuccess("Password reset successfully. Sign in with your new password.");
    setTimeout(() => setShowForgot(false), 2500);
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
                  placeholder={getDefaultEmail(role)}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="h-10"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-[11px] font-medium text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
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

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full h-11 text-sm font-bold bg-gradient-to-r ${cfg.gradientFrom} ${cfg.gradientTo} hover:opacity-90 border-0 shadow-md`}
              >
                Sign in as {cfg.badge}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/40 mt-5">
          Ridhi Control Panel · India's #1 Social App
        </p>
      </div>

      {/* ── Forgot Password Dialog ── */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KeyRound className="w-4 h-4 text-purple-600" /> Reset Password
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReset} className="space-y-4 py-1">
            {role === "admin" ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                <p className="font-medium">Contact Super Admin</p>
                <p className="text-xs mt-1 text-amber-700">
                  Admin passwords can only be reset by the Super Admin via the <strong>Admin Management</strong> panel.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Enter your current Super Admin credentials, then set a new password.
                </p>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Super Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="arjun@ridhi.app"
                      value={saEmail}
                      onChange={(e) => { setSaEmail(e.target.value); setResetError(""); }}
                      className="h-9 pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type={showPass ? "text" : "password"}
                      value={saPass}
                      onChange={(e) => { setSaPass(e.target.value); setResetError(""); }}
                      className="h-9 pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type={showNewPass ? "text" : "password"}
                      value={newPass}
                      onChange={(e) => { setNewPass(e.target.value); setResetError(""); }}
                      className="h-9 pl-9"
                      placeholder="Min 8 characters"
                      required
                    />
                    <button type="button" onClick={() => setShowNewPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm New Password</Label>
                  <Input
                    type={showNewPass ? "text" : "password"}
                    value={confirmPass}
                    onChange={(e) => { setConfirmPass(e.target.value); setResetError(""); }}
                    className="h-9"
                    required
                  />
                </div>

                {resetError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600 font-medium">{resetError}</p>
                  </div>
                )}
                {resetSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700 font-medium">{resetSuccess}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="h-9" onClick={() => setShowForgot(false)} type="button">Cancel</Button>
                  <Button
                    size="sm"
                    className="h-9 bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0"
                    type="submit"
                  >
                    Reset Password
                  </Button>
                </div>
              </>
            )}

            {role === "admin" && (
              <Button variant="outline" size="sm" className="w-full h-9 mt-2" onClick={() => setShowForgot(false)}>Close</Button>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

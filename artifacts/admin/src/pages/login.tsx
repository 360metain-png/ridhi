import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserCog, Shield, Eye, EyeOff, ChevronRight, ArrowLeft,
  AlertCircle, Lock, KeyRound, Mail,
} from "lucide-react";
import type { AdminRole } from "@/App";
import { validateLogin, validateSuperAdminOnly, resetPassword, getDefaultEmail } from "@/config/credentials";

const ROLES: { id: AdminRole; label: string; desc: string; icon: typeof UserCog; color: string; gradient: string }[] = [
  {
    id: "admin", label: "Admin Portal", desc: "Manage agents, revenue, and operations",
    icon: UserCog, color: "#7B2FBE", gradient: "from-purple-600 to-pink-500",
  },
  {
    id: "super_admin", label: "Super Admin", desc: "Full platform control & admin management",
    icon: Shield, color: "#6d28d9", gradient: "from-violet-600 to-purple-700",
  },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password
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
    if (!selectedRole) return;
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    setTimeout(() => {
      if (!validateLogin(selectedRole, email, password)) {
        setError("Incorrect email or password.");
        setLoading(false);
        return;
      }
      localStorage.setItem("ridhi_admin_logged_in", "true");
      localStorage.setItem("ridhi_admin_role", selectedRole);
      localStorage.setItem("ridhi_admin_email", email.trim().toLowerCase());
      setLocation("/");
    }, 400);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(""); setResetSuccess("");
    if (!saEmail || !saPass || !newPass || !confirmPass) {
      setResetError("Please fill all fields."); return;
    }
    if (!validateSuperAdminOnly(saEmail, saPass)) {
      setResetError("Invalid Super Admin credentials."); return;
    }
    if (newPass.length < 8) { setResetError("Password must be at least 8 characters."); return; }
    if (newPass !== confirmPass) { setResetError("Passwords do not match."); return; }
    resetPassword("super_admin", newPass);
    setResetSuccess("Password reset successfully.");
    setTimeout(() => { setShowForgot(false); setResetSuccess(""); }, 2500);
  };

  const cfg = selectedRole ? ROLES.find((r) => r.id === selectedRole)! : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0533] via-[#0d0d18] to-[#0a0a12] p-4">

      {/* Subtle background glows */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <img src={`${import.meta.env.BASE_URL}ridhi_logo.png`} alt="Ridhi" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-white font-black text-lg leading-none">Ridhi</p>
            <p className="text-purple-300/60 text-[10px] mt-0.5 font-medium tracking-widest uppercase">Control Panel</p>
          </div>
        </div>

        {/* Role selector (shown when no role selected) */}
        {!selectedRole && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white">Welcome back</h2>
              <p className="text-purple-300/50 text-sm mt-1">Select your portal to continue</p>
            </div>

            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setEmail(getDefaultEmail(role.id));
                    setError("");
                  }}
                  className="group w-full text-left rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(123,47,190,0.35)] focus:outline-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${role.color}, ${role.color === "#7B2FBE" ? "#E91E8C" : "#a855f7"})` }} />
                  <div className="p-5 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${role.color}40, ${role.color}25)`, border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm">{role.label}</h3>
                      <p className="text-purple-300/50 text-xs mt-0.5">{role.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </div>
                </button>
              );
            })}

            {/* Credentials hint */}
            <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[11px] text-white/30 text-center font-medium mb-2">Default Credentials</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-white/40">
                <div className="text-center">
                  <span className="text-purple-300/60 font-semibold">Admin</span>
                  <p className="mt-0.5">admin.sneha@ridhi.app</p>
                  <p>Ridhi@Admin2024</p>
                </div>
                <div className="text-center">
                  <span className="text-violet-300/60 font-semibold">Super Admin</span>
                  <p className="mt-0.5">arjun@ridhi.app</p>
                  <p>Ridhi@SA2024</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login form (shown when role selected) */}
        {selectedRole && cfg && (
          <div className="space-y-5">
            {/* Back button */}
            <button
              onClick={() => { setSelectedRole(null); setError(""); setEmail(""); setPassword(""); }}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to portals
            </button>

            {/* Header */}
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `linear-gradient(135deg, ${cfg.color}40, ${cfg.color}25)`, border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <cfg.icon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-black text-white">{cfg.label}</h2>
              <p className="text-purple-300/40 text-xs mt-0.5">Ridhi Control Panel</p>
            </div>

            <Card className="shadow-2xl border-0 ring-1 ring-white/10 bg-white">
              <CardContent className="p-5 space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Email</Label>
                    <Input
                      type="email"
                      placeholder={getDefaultEmail(selectedRole)}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className="h-10"
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Password</Label>
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
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        className="h-10 pr-10"
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
                    disabled={loading}
                    className={`w-full h-10 text-sm font-bold bg-gradient-to-r ${cfg.gradient} hover:opacity-90 border-0 shadow-md`}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-[10px] text-white/15">
              Ridhi Control Panel · India's #1 Social App
            </p>
          </div>
        )}

        {/* Forgot Password overlay */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b">
                <h3 className="flex items-center gap-2 text-base font-bold">
                  <KeyRound className="w-4 h-4 text-purple-600" /> Reset Password
                </h3>
              </div>
              <form onSubmit={handleReset} className="p-5 space-y-4">
                {selectedRole === "admin" ? (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    <p className="font-medium">Contact Super Admin</p>
                    <p className="text-xs mt-1 text-amber-700">
                      Admin passwords can only be reset by the Super Admin.
                    </p>
                    <Button variant="outline" size="sm" className="w-full h-8 mt-3" onClick={() => setShowForgot(false)} type="button">Close</Button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Enter your current Super Admin credentials, then set a new password.
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 uppercase">Super Admin Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input type="email" placeholder="arjun@ridhi.app" value={saEmail} onChange={(e) => { setSaEmail(e.target.value); setResetError(""); }} className="h-9 pl-9" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 uppercase">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input type="password" value={saPass} onChange={(e) => { setSaPass(e.target.value); setResetError(""); }} className="h-9 pl-9" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 uppercase">New Password</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input type={showNewPass ? "text" : "password"} value={newPass} onChange={(e) => { setNewPass(e.target.value); setResetError(""); }} className="h-9 pl-9" placeholder="Min 8 characters" required />
                        <button type="button" onClick={() => setShowNewPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                          {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-gray-500 uppercase">Confirm Password</Label>
                      <Input type={showNewPass ? "text" : "password"} value={confirmPass} onChange={(e) => { setConfirmPass(e.target.value); setResetError(""); }} className="h-9" required />
                    </div>
                    {resetError && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600 font-medium">{resetError}</p>
                      </div>
                    )}
                    {resetSuccess && (
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                        <Lock className="w-4 h-4 text-green-600 shrink-0" />
                        <p className="text-xs text-green-700 font-medium">{resetSuccess}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="h-9" onClick={() => setShowForgot(false)} type="button">Cancel</Button>
                      <Button size="sm" className="h-9 bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0" type="submit">Reset</Button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

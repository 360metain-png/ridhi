import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, EyeOff, AlertCircle, Lock, Mail } from "lucide-react";
import { adminLogin, saveAdminSession } from "@/lib/admin-api";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await adminLogin(email, password);
    if (!result.success) {
      setError(result.error || "Incorrect email or password.");
      setLoading(false);
      return;
    }

    if (result.token && result.role && result.name) {
      saveAdminSession(result.token, result.role, result.name);
      setLocation("/");
    } else {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0533] via-[#0d0d18] to-[#0a0a12] px-5 py-8">
      {/* Subtle background glows */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <img src={`${import.meta.env.BASE_URL}ridhi_logo.png`} alt="Ridhi" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-white font-black text-lg leading-none">Ridhi</p>
            <p className="text-purple-300/60 text-[10px] mt-0.5 font-medium tracking-widest uppercase">Control Panel</p>
          </div>
        </div>

        {/* Single unified login form */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.4), rgba(109,40,217,0.15))", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">Secure Login</h2>
          <p className="text-purple-300/40 text-xs mt-0.5">Admin & Super Admin Portal</p>
        </div>

        <Card className="shadow-2xl border-0 ring-1 ring-white/10 bg-white w-full">
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</Label>
                <div className="relative w-full">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="admin@ridhi.app"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                    disabled={loading}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 pl-10 text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ WebkitAppearance: "none" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</Label>
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    autoComplete="current-password"
                    disabled={loading}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 pl-10 pr-10 text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ WebkitAppearance: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 z-10"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 border-0 shadow-md mt-1"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-white/15 mt-6">
          Ridhi Control Panel · Authorised personnel only
        </p>
      </div>
    </div>
  );
}

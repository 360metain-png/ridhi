import { useState } from "react";
import { useLocation } from "wouter";
import {
  UserCog, ChevronRight, Smartphone, Shield,
  Users, FileText, TrendingUp, Layers,
  Radio, Coins,
} from "lucide-react";

const FEATURES = [
  { icon: Users,      label: "User Management",    desc: "Manage all users, hosts & agents"     },
  { icon: FileText,   label: "Content Moderation",  desc: "Review posts, reels & live streams"   },
  { icon: TrendingUp, label: "Revenue Analytics",   desc: "Track coins, payouts & subscriptions" },
  { icon: Radio,      label: "Live Stream Control", desc: "Monitor & moderate live sessions"     },
  { icon: Coins,      label: "Coin Economy",        desc: "Configure packages & coin rules"      },
  { icon: Layers,     label: "Platform Settings",   desc: "Feature flags & system config"        },
];

export default function Login() {
  const [, setLocation]         = useLocation();
  const [saClicks, setSaClicks] = useState(0);
  const [showSA,   setShowSA]   = useState(false);

  function handleLogoClick() {
    const next = saClicks + 1;
    setSaClicks(next);
    if (next >= 5) { setShowSA(true); setSaClicks(0); }
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#0a0a12]">

      {/* ── LEFT — Brand panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-10 overflow-hidden">

        {/* layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#2d0a5e] to-[#0e0120]" />

        {/* decorative orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-purple-700/30 blur-[100px]" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] rounded-full bg-pink-600/25 blur-[100px]" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-purple-500/15 blur-[80px]" />

        {/* subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 select-none cursor-pointer" onClick={handleLogoClick}>
          <div className="relative">
            <img
              src={`${import.meta.env.BASE_URL}ridhi_logo.png`}
              alt="Ridhi"
              className="w-12 h-12 object-contain drop-shadow-2xl"
            />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/40 blur-md" />
          </div>
          <div>
            <p className="text-white font-black text-xl leading-none tracking-tight">Ridhi</p>
            <p className="text-purple-300/80 text-[11px] leading-none mt-1 font-medium tracking-widest uppercase">Control Panel</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
              India's #1<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #c084fc 0%, #e879f9 50%, #f472b6 100%)" }}
              >
                Social Platform
              </span>
            </h1>
            <p className="mt-4 text-purple-200/70 text-base leading-relaxed max-w-xs">
              Manage 1 Cr+ users, live streams, creator payouts, and platform-wide features — all from one dashboard.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,.35), rgba(236,72,153,.25))" }}>
                  <Icon className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <p className="text-white text-[11px] font-bold leading-none">{label}</p>
                  <p className="text-purple-300/60 text-[10px] mt-1 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform stats strip */}
        <div
          className="relative z-10 flex items-center gap-6 rounded-2xl px-5 py-3"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {[
            { val: "1 Cr+",  lbl: "Users"        },
            { val: "284",    lbl: "Live Now"      },
            { val: "₹2.5Cr", lbl: "Rev / Month"  },
            { val: "13",     lbl: "Languages"     },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="text-center">
              <p className="text-white font-black text-lg leading-none">{val}</p>
              <p className="text-purple-300/60 text-[10px] mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — Login panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">

        {/* mobile bg */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-[#1a0533] via-[#0a0a12] to-[#0a0a12]" />
        <div className="absolute inset-0 hidden lg:block bg-[#0d0d18]" />

        {/* subtle right-side glow */}
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-pink-700/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[250px] h-[250px] rounded-full bg-purple-700/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[400px] space-y-8">

          {/* Mobile logo (hidden on lg) */}
          <button
            onClick={handleLogoClick}
            className="lg:hidden flex items-center gap-3 mx-auto focus:outline-none"
          >
            <img
              src={`${import.meta.env.BASE_URL}ridhi_logo.png`}
              alt="Ridhi"
              className="w-12 h-12 object-contain drop-shadow-xl"
            />
            <div className="text-left">
              <p className="text-white font-black text-xl leading-none">Ridhi</p>
              <p className="text-purple-400 text-xs mt-0.5 font-medium tracking-wider uppercase">Control Panel</p>
            </div>
          </button>

          {/* Heading */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-white leading-tight">Welcome back</h2>
            <p className="text-purple-300/70 text-sm mt-1.5">Sign in to access the admin dashboard</p>
          </div>

          {/* Admin card */}
          <button
            onClick={() => setLocation("/login/admin")}
            className="group w-full text-left rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(123,47,190,0.35)] focus:outline-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* gradient top bar */}
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #7B2FBE, #E91E8C)" }} />

            <div className="p-6 space-y-5">
              {/* Icon row */}
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(123,47,190,0.4), rgba(233,30,140,0.3))", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <UserCog className="w-7 h-7 text-purple-200" />
                </div>
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full text-white"
                  style={{ background: "linear-gradient(135deg, #7B2FBE, #E91E8C)" }}
                >
                  Platform Operations
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-2xl font-black text-white">Admin Portal</h3>
                <p className="text-purple-300/60 text-sm mt-1 leading-relaxed">
                  Oversee users, content, hosts, agents, and platform operations.
                </p>
              </div>

              {/* Access list */}
              <div
                className="rounded-xl p-4 grid grid-cols-2 gap-y-2 gap-x-3"
                style={{ background: "rgba(123,47,190,0.15)", border: "1px solid rgba(123,47,190,0.2)" }}
              >
                {["Users & content", "Hosts & agents", "Revenue overview", "Marketing tools"].map((a) => (
                  <div key={a} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "linear-gradient(135deg, #7B2FBE, #E91E8C)" }}
                    />
                    <span className="text-purple-200/80 text-xs">{a}</span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <div
                className="flex items-center justify-between rounded-xl px-5 py-3.5 text-white transition-opacity group-hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #E91E8C 100%)" }}
              >
                <span className="font-bold text-sm">Enter Portal</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* SA card — unlocked by 5× logo tap */}
          {showSA && (
            <button
              onClick={() => setLocation("/login/super-admin")}
              className="group w-full text-left rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(109,40,217,0.4)] focus:outline-none"
              style={{
                background: "linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(76,29,149,0.1) 100%)",
                border: "1px solid rgba(139,92,246,0.3)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #6d28d9, #7c3aed)" }} />
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(109,40,217,0.3)", border: "1px solid rgba(139,92,246,0.3)" }}
                  >
                    <Shield className="w-6 h-6 text-violet-300" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-700 text-white">
                    Full Platform Control
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Super Admin</h3>
                  <p className="text-violet-300/60 text-sm mt-1">Full access — settings, finance, admin management & more.</p>
                </div>
                <div
                  className="flex items-center justify-between rounded-xl px-5 py-3 text-white transition-opacity group-hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed)" }}
                >
                  <span className="font-bold text-sm">Enter Portal</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          )}

          {/* Mobile app note */}
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Smartphone className="w-4 h-4 text-pink-400 shrink-0" />
            <p className="text-xs text-white/50 leading-snug">
              <span className="text-white/80 font-semibold">Hosts & Users</span> — use the Ridhi Android / iOS app to access your account
            </p>
          </div>

          <p className="text-center text-xs text-white/20">
            Ridhi Control Panel · India's #1 Social App
          </p>
        </div>
      </div>
    </div>
  );
}

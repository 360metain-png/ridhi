import { useState } from "react";
import { useLocation } from "wouter";
import { UserCog, ChevronRight, Smartphone, Shield } from "lucide-react";

const ADMIN_PORTAL = {
  role:       "admin",
  label:      "Admin",
  path:       "/login/admin",
  icon:       UserCog,
  gradient:   "from-purple-600 to-pink-600",
  lightBg:    "bg-purple-50",
  border:     "border-purple-200 hover:border-purple-400",
  iconBg:     "bg-purple-100",
  iconColor:  "text-purple-700",
  badgeClass: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
  tagline:    "Platform Operations",
  desc:       "Oversee content moderation, user management, hosts, agents, and platform operations.",
  access:     ["Users & content", "Hosts & agents", "Revenue overview", "Marketing tools"],
};

export default function Login() {
  const [, setLocation] = useLocation();
  const [saClicks, setSaClicks]   = useState(0);
  const [showSA,   setShowSA]     = useState(false);

  // Clicking the logo 5 times reveals the SA portal option
  function handleLogoClick() {
    const next = saClicks + 1;
    setSaClicks(next);
    if (next >= 5) { setShowSA(true); setSaClicks(0); }
  }

  const Icon = ADMIN_PORTAL.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 focus:outline-none select-none"
          title="Ridhi Admin"
        >
          <img
            src={`${import.meta.env.BASE_URL}ridhi_logo.png`}
            alt="Ridhi"
            className="w-10 h-10 object-contain drop-shadow-lg"
          />
          <div>
            <p className="text-white font-black text-base leading-none">Ridhi</p>
            <p className="text-purple-300 text-[10px] leading-none mt-0.5">Control Panel</p>
          </div>
        </button>

        {/* SA badge visible only after unlock */}
        {showSA && (
          <button
            onClick={() => setLocation("/login/super-admin")}
            className="flex items-center gap-1.5 bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-purple-800/60 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            Super Admin
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center py-10 px-4 gap-4">
        <div className="relative">
          <img
            src={`${import.meta.env.BASE_URL}ridhi_logo.png`}
            alt="Ridhi"
            className="w-20 h-20 object-contain drop-shadow-2xl"
          />
          <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 blur-xl -z-10" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Admin Portal
          </h1>
          <p className="text-purple-300 text-base mt-2 max-w-sm mx-auto">
            Sign in to manage the Ridhi platform — users, content, hosts, and more.
          </p>
        </div>
      </div>

      {/* Portal Card(s) */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-sm space-y-4">

          {/* Admin card — always visible */}
          <button
            onClick={() => setLocation(ADMIN_PORTAL.path)}
            className={`group w-full text-left bg-white rounded-2xl border-2 ${ADMIN_PORTAL.border} shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 overflow-hidden`}
          >
            <div className={`h-1.5 bg-gradient-to-r ${ADMIN_PORTAL.gradient}`} />
            <div className="p-5 space-y-4">
              {/* Icon + badge */}
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${ADMIN_PORTAL.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${ADMIN_PORTAL.iconColor}`} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ADMIN_PORTAL.badgeClass}`}>
                  {ADMIN_PORTAL.tagline}
                </span>
              </div>

              {/* Title + desc */}
              <div>
                <h2 className="text-xl font-black text-gray-900">{ADMIN_PORTAL.label}</h2>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{ADMIN_PORTAL.desc}</p>
              </div>

              {/* Access list */}
              <div className={`rounded-xl ${ADMIN_PORTAL.lightBg} p-3 space-y-1.5`}>
                {ADMIN_PORTAL.access.map((a) => (
                  <div key={a} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${ADMIN_PORTAL.gradient} shrink-0`} />
                    <span className="text-xs text-gray-600">{a}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className={`flex items-center justify-between rounded-xl bg-gradient-to-r ${ADMIN_PORTAL.gradient} px-4 py-2.5 text-white group-hover:opacity-90 transition-opacity`}>
                <span className="text-sm font-bold">Enter Portal</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* SA card — only shown after logo-tap unlock */}
          {showSA && (
            <button
              onClick={() => setLocation("/login/super-admin")}
              className="group w-full text-left bg-white rounded-2xl border-2 border-purple-300 hover:border-purple-500 shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 overflow-hidden"
            >
              <div className="h-1.5 bg-gradient-to-r from-purple-700 to-indigo-700" />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-700" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-700 text-white">Full Platform Control</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Super Admin</h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Manage all admins, platform settings, finance, and system configuration.</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-3 space-y-1.5">
                  {["All pages & features", "Admin approval", "Finance & payouts", "System settings"].map((a) => (
                    <div key={a} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 shrink-0" />
                      <span className="text-xs text-gray-600">{a}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 px-4 py-2.5 text-white group-hover:opacity-90 transition-opacity">
                  <span className="text-sm font-bold">Enter Portal</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Mobile app note */}
      <div className="flex items-center justify-center gap-2 pb-8 px-4">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5 border border-white/20">
          <Smartphone className="w-4 h-4 text-pink-300 shrink-0" />
          <p className="text-xs text-white/70">
            <span className="font-semibold text-white">Hosts & Users</span> — use the Ridhi Android / iOS app to access your account
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 pb-6">
        Ridhi Control Panel · India's #1 Social App
      </p>
    </div>
  );
}

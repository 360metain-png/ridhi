import { useLocation } from "wouter";
import { Shield, UserCog, ChevronRight, ArrowRight, Smartphone } from "lucide-react";

const PORTALS = [
  {
    role:       "super_admin",
    label:      "Super Admin",
    path:       "/login/super-admin",
    icon:       Shield,
    gradient:   "from-purple-600 to-purple-800",
    lightBg:    "bg-purple-50",
    border:     "border-purple-200 hover:border-purple-400",
    iconBg:     "bg-purple-100",
    iconColor:  "text-purple-700",
    badgeClass: "bg-purple-600 text-white",
    tagline:    "Full Platform Control",
    desc:       "Manage all admins, platform settings, finance, and system configuration.",
    access:     ["All pages & features", "Admin approval", "Finance & payouts", "System settings"],
  },
  {
    role:       "admin",
    label:      "Admin",
    path:       "/login/admin",
    icon:       UserCog,
    gradient:   "from-indigo-500 to-indigo-700",
    lightBg:    "bg-indigo-50",
    border:     "border-indigo-200 hover:border-indigo-400",
    iconBg:     "bg-indigo-100",
    iconColor:  "text-indigo-700",
    badgeClass: "bg-indigo-600 text-white",
    tagline:    "Platform Operations",
    desc:       "Oversee content moderation, user management, hosts, agents, and platform operations.",
    access:     ["Users & content", "Hosts & agents", "Revenue overview", "Marketing tools"],
  },
];

const HIERARCHY = [
  { label: "Super Admin", color: "bg-purple-600" },
  { label: "Admin",       color: "bg-indigo-500" },
];

export default function Login() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-base">R</span>
          </div>
          <div>
            <p className="text-white font-black text-base leading-none">Ridhi</p>
            <p className="text-purple-300 text-[10px] leading-none mt-0.5">Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {HIERARCHY.map((h, i) => (
            <div key={h.label} className="flex items-center gap-1">
              <span className={`${h.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>{h.label}</span>
              {i < HIERARCHY.length - 1 && <ArrowRight className="w-3 h-3 text-gray-500" />}
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="text-center py-10 px-4">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
          Select Your Portal
        </h1>
        <p className="text-purple-300 text-base max-w-md mx-auto">
          Each role has its own dedicated dashboard. Choose the portal that matches your access level.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {PORTALS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.role}
                onClick={() => setLocation(p.path)}
                className={`group text-left bg-white rounded-2xl border-2 ${p.border} shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 overflow-hidden`}
              >
                {/* Gradient top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${p.gradient}`} />

                <div className="p-5 space-y-4">
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl ${p.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${p.iconColor}`} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badgeClass}`}>
                      {p.tagline}
                    </span>
                  </div>

                  {/* Title + desc */}
                  <div>
                    <h2 className="text-xl font-black text-gray-900">{p.label}</h2>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.desc}</p>
                  </div>

                  {/* Access list */}
                  <div className={`rounded-xl ${p.lightBg} p-3 space-y-1.5`}>
                    {p.access.map((a) => (
                      <div key={a} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${p.gradient} shrink-0`} />
                        <span className="text-xs text-gray-600">{a}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className={`flex items-center justify-between rounded-xl bg-gradient-to-r ${p.gradient} px-4 py-2.5 text-white group-hover:opacity-90 transition-opacity`}>
                    <span className="text-sm font-bold">Enter Portal</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
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

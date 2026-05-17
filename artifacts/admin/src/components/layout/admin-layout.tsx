import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, ShieldAlert, UsersRound, Coins, IndianRupee,
  LineChart, Megaphone, Settings, LogOut, Radio, BarChart3, ShieldCheck,
  Gamepad2, Briefcase, Star, Bell, Phone, Cpu, ScanFace, BookOpen,
  Lock, UserCog, ChevronDown, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import { type AdminRole, ROUTE_ROLES } from "@/App";

interface AdminLayoutProps { children: ReactNode }

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  allowedRoles: AdminRole[];
}

const ALL:   AdminRole[] = ["super_admin", "admin", "agent", "host"];
const SA_A:  AdminRole[] = ["super_admin", "admin"];
const SA_AA: AdminRole[] = ["super_admin", "admin", "agent"];
const SA:    AdminRole[] = ["super_admin"];

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/",         icon: LayoutDashboard, allowedRoles: ALL   },
      { name: "Analytics", href: "/analytics", icon: LineChart,       allowedRoles: SA_AA },
    ],
  },
  {
    label: "Users & Content",
    items: [
      { name: "Users",       href: "/users",       icon: Users,      allowedRoles: SA_A },
      { name: "Content",     href: "/content",     icon: ShieldAlert, badge: "12", allowedRoles: SA_A },
      { name: "Communities", href: "/communities", icon: UsersRound,  allowedRoles: SA_A },
    ],
  },
  {
    label: "Creators",
    items: [
      { name: "Hosts",              href: "/hosts",        icon: Star,     allowedRoles: SA_AA },
      { name: "Agents",             href: "/agents",       icon: Briefcase,allowedRoles: SA_A  },
      { name: "E-KYC Verification", href: "/kyc",          icon: ScanFace, badge: "4", allowedRoles: SA_AA },
      { name: "Calls",              href: "/calls",        icon: Phone,    allowedRoles: ALL   },
      { name: "Gaming",             href: "/gaming",       icon: Gamepad2, allowedRoles: SA_A  },
      { name: "Live Streams",       href: "/live-streams", icon: Radio,    allowedRoles: ALL   },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Coins",         href: "/coins",   icon: Coins,       allowedRoles: SA_A },
      { name: "Payouts",       href: "/payouts", icon: IndianRupee, allowedRoles: SA_A },
      { name: "Revenue & Ads", href: "/revenue", icon: BarChart3,   allowedRoles: SA_A },
    ],
  },
  {
    label: "AI & Intelligence",
    items: [
      { name: "AI Hub", href: "/ai-hub", icon: Cpu, badge: "7", allowedRoles: SA_A },
    ],
  },
  {
    label: "Platform",
    items: [
      { name: "Marketing",   href: "/marketing",   icon: Megaphone,  allowedRoles: SA_A },
      { name: "Settings",    href: "/settings",    icon: Settings,   allowedRoles: SA_A },
      { name: "Super Admin", href: "/super-admin", icon: ShieldCheck,allowedRoles: SA   },
      { name: "Handbook",    href: "/handbook",    icon: BookOpen,   allowedRoles: ALL  },
    ],
  },
];

type RoleInfo = {
  label: string; sublabel: string; badge: string;
  badgeClass: string; avatarClass: string; initial: string; name: string;
};

function getRoleInfo(role: string | null, email: string | null): RoleInfo {
  if (role === "admin") return {
    label: "Admin", sublabel: "Manages Agents", badge: "Admin",
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
    avatarClass: "bg-indigo-500", initial: "A",
    name: email?.split("@")[0]?.replace("admin.", "") ?? "Admin User",
  };
  if (role === "agent") return {
    label: "Agent", sublabel: "Manages Hosts", badge: "Agent A3",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    avatarClass: "bg-blue-500", initial: "A",
    name: email?.split("@")[0]?.replace("agent.", "") ?? "Agent User",
  };
  if (role === "host") return {
    label: "Host", sublabel: "Content Creator", badge: "Host L5",
    badgeClass: "bg-pink-100 text-pink-700 border-pink-200",
    avatarClass: "bg-pink-500", initial: "H",
    name: email?.split("@")[0]?.replace("host.", "") ?? "Host User",
  };
  return {
    label: "Super Admin", sublabel: "Full Platform Control", badge: "Super Admin",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
    avatarClass: "bg-gradient-to-br from-purple-600 to-pink-500", initial: "S",
    name: "Arjun Mehta",
  };
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation]     = useLocation();
  const [roleInfo, setRoleInfo]     = useState<RoleInfo>(getRoleInfo(null, null));
  const [role, setRole]             = useState<AdminRole>("super_admin");
  const [collapsed, setCollapsed]   = useState<Record<string, boolean>>({});

  useEffect(() => {
    const r     = localStorage.getItem("ridhi_admin_role") as AdminRole ?? "super_admin";
    const email = localStorage.getItem("ridhi_admin_email");
    setRole(r);
    setRoleInfo(getRoleInfo(r, email));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("ridhi_admin_logged_in");
    localStorage.removeItem("ridhi_admin_role");
    localStorage.removeItem("ridhi_admin_email");
    setLocation("/login");
  };

  const pageTitles: Record<string, string> = {
    "/":             "Dashboard",
    "/users":        "Users",
    "/content":      "Content Moderation",
    "/communities":  "Communities",
    "/coins":        "Coin Economy",
    "/payouts":      "Payouts",
    "/analytics":    "Analytics",
    "/marketing":    "Marketing",
    "/settings":     "Settings",
    "/live-streams": "Live Streams",
    "/revenue":      "Revenue & Ads",
    "/super-admin":  "Super Admin",
    "/gaming":       "Gaming Management",
    "/agents":       "Agent Management",
    "/hosts":        "Host Management",
    "/calls":        "Audio & Video Calls",
    "/ai-hub":       "AI Hub",
    "/kyc":          "E-KYC Verification",
    "/handbook":     "Platform Handbook",
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 border-r bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0">

        {/* Brand */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-primary leading-tight">Ridhi Admin</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Control Panel</p>
          </div>
          {/* Compact hierarchy hint */}
          <div className="flex flex-col items-end gap-0.5">
            {(["super_admin","admin","agent","host"] as AdminRole[]).map((r) => (
              <span
                key={r}
                className={`w-1.5 h-1.5 rounded-full ${
                  r === "super_admin" ? "bg-purple-500" :
                  r === "admin"       ? "bg-indigo-400" :
                  r === "agent"       ? "bg-blue-400"   : "bg-pink-400"
                } ${role === r ? "ring-1 ring-offset-0.5 ring-current opacity-100" : "opacity-30"}`}
              />
            ))}
          </div>
        </div>

        {/* Role banner */}
        <div className={`mx-3 mt-2.5 mb-1 px-3 py-2 rounded-xl border ${roleInfo.badgeClass} flex items-center gap-2`}>
          <div className={`w-6 h-6 rounded-full ${roleInfo.avatarClass} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-[10px]">{roleInfo.initial}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight truncate">{roleInfo.name}</p>
            <p className="text-[10px] leading-tight opacity-70">{roleInfo.sublabel}</p>
          </div>
          <Badge variant="outline" className={`text-[9px] px-1.5 h-4 ml-auto flex-shrink-0 ${roleInfo.badgeClass} font-bold`}>
            {roleInfo.badge}
          </Badge>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => item.allowedRoles.includes(role));
            const lockedItems  = section.items.filter((item) => !item.allowedRoles.includes(role));
            if (visibleItems.length === 0 && lockedItems.length === 0) return null;

            const isCollapsed = collapsed[section.label];

            return (
              <div key={section.label} className="mb-1">
                <button
                  onClick={() => setCollapsed((p) => ({ ...p, [section.label]: !p[section.label] }))}
                  className="w-full flex items-center px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
                >
                  <span className="flex-1 text-left">{section.label}</span>
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {!isCollapsed && (
                  <ul className="space-y-0.5 px-2">
                    {section.items.map((item) => {
                      const isLocked = !item.allowedRoles.includes(role);
                      const isActive = !isLocked && (
                        location === item.href || (item.href !== "/" && location.startsWith(item.href))
                      );

                      if (isLocked) {
                        return (
                          <li key={item.name}>
                            <div
                              title={`Requires ${item.allowedRoles[0]?.replace("_", " ")} or higher`}
                              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground/35 cursor-not-allowed select-none"
                            >
                              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="flex-1 line-through">{item.name}</span>
                              <Lock className="w-3 h-3 flex-shrink-0" />
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li key={item.name}>
                          <Link href={item.href}>
                            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }`}>
                              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="flex-1 text-sm">{item.name}</span>
                              {item.badge && (
                                <Badge variant={isActive ? "secondary" : "destructive"} className="text-xs h-4 px-1.5 min-w-[1.25rem] justify-center">
                                  {item.badge}
                                </Badge>
                              )}
                              {item.href === "/super-admin" && (
                                <Badge variant="outline" className="text-[9px] px-1 h-4 text-purple-600 border-purple-300 bg-purple-50 font-bold">
                                  SA
                                </Badge>
                              )}
                              {item.href === "/agents" && role === "admin" && (
                                <Badge className="text-[9px] px-1 h-4 bg-orange-100 text-orange-700 border border-orange-200">
                                  3
                                </Badge>
                              )}
                              {item.href === "/hosts" && role === "agent" && (
                                <Badge className="text-[9px] px-1 h-4 bg-orange-100 text-orange-700 border border-orange-200">
                                  2
                                </Badge>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-6 bg-card flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold">
              {pageTitles[location] ?? pageTitles[Object.keys(pageTitles).find((k) => k !== "/" && location.startsWith(k)) ?? ""] ?? "Dashboard"}
            </h1>
            <Badge variant="outline" className={`text-[10px] px-2 h-5 font-semibold ${roleInfo.badgeClass}`}>
              {roleInfo.badge}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 text-green-600 border-green-200 bg-green-50 text-xs">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              All Systems OK
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full text-white flex items-center justify-center font-bold" style={{ fontSize: "9px" }}>4</span>
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

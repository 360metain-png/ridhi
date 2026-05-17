import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  UsersRound,
  Coins,
  IndianRupee,
  LineChart,
  Megaphone,
  Settings,
  LogOut,
  Radio,
  BarChart3,
  ShieldCheck,
  Gamepad2,
  Briefcase,
  Star,
  Bell,
  Phone,
  Cpu,
  ScanFace,
  BookOpen,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  superAdminOnly?: boolean;
}

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/",         icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: LineChart       },
    ],
  },
  {
    label: "Users & Content",
    items: [
      { name: "Users",       href: "/users",       icon: Users       },
      { name: "Content",     href: "/content",     icon: ShieldAlert, badge: "12" },
      { name: "Communities", href: "/communities", icon: UsersRound  },
    ],
  },
  {
    label: "Creators & Gaming",
    items: [
      { name: "Hosts",              href: "/hosts",       icon: Star      },
      { name: "Agents",             href: "/agents",      icon: Briefcase },
      { name: "E-KYC Verification", href: "/kyc",         icon: ScanFace, badge: "4" },
      { name: "Calls",              href: "/calls",       icon: Phone     },
      { name: "Gaming",             href: "/gaming",      icon: Gamepad2  },
      { name: "Live Streams",       href: "/live-streams",icon: Radio     },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Coins",        href: "/coins",   icon: Coins       },
      { name: "Payouts",      href: "/payouts", icon: IndianRupee },
      { name: "Revenue & Ads",href: "/revenue", icon: BarChart3   },
    ],
  },
  {
    label: "AI & Intelligence",
    items: [
      { name: "AI Hub", href: "/ai-hub", icon: Cpu, badge: "7" },
    ],
  },
  {
    label: "Platform",
    items: [
      { name: "Marketing",   href: "/marketing",   icon: Megaphone  },
      { name: "Settings",    href: "/settings",    icon: Settings   },
      { name: "Super Admin", href: "/super-admin", icon: ShieldCheck, superAdminOnly: true },
      { name: "Handbook",    href: "/handbook",    icon: BookOpen   },
    ],
  },
];

type RoleInfo = { label: string; badge: string; badgeVariant: "default" | "secondary" | "outline"; color: string; initial: string; name: string };

function getRoleInfo(role: string | null, email: string | null): RoleInfo {
  if (role === "host") return {
    label:        "Host",
    badge:        "Host L5",
    badgeVariant: "secondary",
    color:        "bg-pink-500",
    initial:      "H",
    name:         email?.split("@")[0]?.replace("host.", "") ?? "Host User",
  };
  if (role === "agent") return {
    label:        "Agent",
    badge:        "Agent A3",
    badgeVariant: "secondary",
    color:        "bg-blue-500",
    initial:      "A",
    name:         email?.split("@")[0]?.replace("agent.", "") ?? "Agent User",
  };
  return {
    label:        "Super Admin",
    badge:        "Super Admin",
    badgeVariant: "default",
    color:        "bg-primary",
    initial:      "S",
    name:         "Arjun Mehta",
  };
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [roleInfo, setRoleInfo] = useState<RoleInfo>(getRoleInfo(null, null));
  const [role, setRole]         = useState<string | null>(null);

  useEffect(() => {
    const r     = localStorage.getItem("ridhi_admin_role");
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

  const isSuperAdmin = role === "super_admin";

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
      {/* Sidebar */}
      <aside className="w-60 border-r bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="h-14 flex items-center px-5 border-b border-sidebar-border gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <div>
            <p className="font-bold text-sm text-primary leading-tight">Ridhi Admin</p>
            <p className="text-xs text-muted-foreground leading-tight">Control Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-3">
              <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {section.label}
              </p>
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isLocked  = item.superAdminOnly && !isSuperAdmin;
                  const isActive  = !isLocked && (location === item.href || (item.href !== "/" && location.startsWith(item.href)));

                  if (isLocked) {
                    // Render as a non-clickable locked item
                    return (
                      <li key={item.name}>
                        <div
                          title="Super Admin only"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground/40 cursor-not-allowed select-none"
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 line-through">{item.name}</span>
                          <Lock className="w-3 h-3 flex-shrink-0" />
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={item.name}>
                      <Link href={item.href}>
                        <div
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <Badge
                              variant={isActive ? "secondary" : "destructive"}
                              className="text-xs h-4 px-1.5 min-w-[1.25rem] justify-center"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {item.superAdminOnly && isSuperAdmin && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-purple-600 border-purple-300 bg-purple-50">
                              SA
                            </Badge>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-sidebar-border space-y-1.5">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground">
            <div className={`w-6 h-6 rounded-full ${roleInfo.color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-bold text-xs">{roleInfo.initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate text-xs capitalize">{roleInfo.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={roleInfo.badgeVariant}
                  className="text-[10px] px-1.5 py-0 h-4 leading-none"
                >
                  {roleInfo.badge}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-6 bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold">
              {pageTitles[location] ?? pageTitles[Object.keys(pageTitles).find((k) => k !== "/" && location.startsWith(k)) ?? ""] ?? "Dashboard"}
            </h1>
            {!isSuperAdmin && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Lock className="w-2.5 h-2.5" />
                {roleInfo.badge}
              </Badge>
            )}
            {isSuperAdmin && (
              <Badge className="text-xs gap-1 bg-purple-100 text-purple-700 border-purple-200">
                <ShieldCheck className="w-2.5 h-2.5" />
                Super Admin
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 text-green-600 border-green-200 bg-green-50 text-xs">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              All Systems OK
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ fontSize: "9px" }}>4</span>
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

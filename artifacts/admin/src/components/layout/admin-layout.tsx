import { ReactNode, useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, ShieldAlert, UsersRound, Coins, IndianRupee,
  LineChart, Megaphone, Settings, LogOut, Radio, BarChart3, ShieldCheck,
  Briefcase, Star, Bell, Phone, Cpu, ScanFace, BookOpen, Heart,
  Lock, ChevronDown, ChevronRight, FolderOpen, Zap, Crown,
  LayoutTemplate, Ticket, Share2, Plug, Activity, ClipboardList, UserPlus, CreditCard,
  TrendingUp, Globe, Terminal, Sparkles, Download, Monitor, Film, FileText,
  Landmark,
  Gamepad2, Headphones, Music, PenTool, MessageSquare,
  Eye, Clapperboard, Menu, X, Smartphone,
  MessagesSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";
import { type AdminRole, ROUTE_ROLES } from "@/App";
import { getAdminRole, getAdminName, clearAdminSession } from "@/lib/admin-api";
import GlobalSearch from "@/components/global-search";

interface AdminLayoutProps { children: ReactNode }

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  allowedRoles: AdminRole[];
}

const ALL:   AdminRole[] = ["super_admin", "admin"];
const SA_A:  AdminRole[] = ["super_admin", "admin"];
const SA_AA: AdminRole[] = ["super_admin", "admin"];
const SA:    AdminRole[] = ["super_admin"];

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/",         icon: LayoutDashboard, allowedRoles: ALL   },
      { name: "Reports", href: "/reports", icon: LineChart,       allowedRoles: SA, badge: "NEW" },
      { name: "Analytics", href: "/analytics", icon: LineChart,       allowedRoles: SA_AA },
      { name: "User Behavior", href: "/user-behavior", icon: Activity, allowedRoles: SA_AA },
    ],
  },
  {
    label: "Users & Content",
    items: [
      { name: "Users",            href: "/users",          icon: Users,      allowedRoles: SA },
      { name: "Content",          href: "/content",        icon: ShieldAlert, badge: "12", allowedRoles: SA },
      { name: "Communities",      href: "/communities",    icon: UsersRound,  allowedRoles: SA },
      { name: "Creative Assets",  href: "/content-assets", icon: Sparkles,    allowedRoles: SA },
      { name: "Video Uploads",    href: "/video-uploads",  icon: Film,        badge: "40", allowedRoles: SA },
    ],
  },
  {
    label: "Creators",
    items: [
      { name: "Hosts",              href: "/hosts",        icon: Star,     allowedRoles: SA_AA },
      { name: "Agents",             href: "/agents",       icon: Briefcase,allowedRoles: SA_A  },
      { name: "Levels & Promotion", href: "/levels",       icon: TrendingUp, allowedRoles: SA_AA },
      { name: "E-Verification", href: "/kyc",          icon: ScanFace, badge: "4", allowedRoles: SA_AA },
      { name: "PK Battle Approvals", href: "/pk-battle-approvals", icon: Zap, badge: "NEW", allowedRoles: SA },
      { name: "Calls",              href: "/calls",        icon: Phone,       allowedRoles: ALL   },
      { name: "Recordings",         href: "/recordings",   icon: FolderOpen,  allowedRoles: SA_A  },
      { name: "Promotions & Ads",   href: "/promotions",   icon: Zap,         allowedRoles: SA },
      { name: "Live Streams",       href: "/live-streams", icon: Radio,       allowedRoles: SA },
      { name: "Dating",             href: "/dating",        icon: Heart,        allowedRoles: SA },
      { name: "App Store",          href: "/app-store",     icon: Smartphone,   allowedRoles: SA },
      { name: "CRM & Support",      href: "/crm",           icon: MessagesSquare, badge: "120", allowedRoles: SA_A },
      { name: "Podcasts",           href: "/podcasts",      icon: Headphones,  allowedRoles: SA },
      { name: "Vibe Stars",         href: "/vibe-stars",    icon: Star,        allowedRoles: SA },
      { name: "Music Library",      href: "/music-library", icon: Music,       allowedRoles: SA },
      { name: "Stories",            href: "/stories",       icon: Clapperboard,allowedRoles: SA },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Business Ads",        href: "/business-ads",        icon: Zap,            badge: "3", allowedRoles: SA },
      { name: "Special Client Ads",  href: "/special-ads",         icon: Crown,                        allowedRoles: SA },
      { name: "Commercial Banners",  href: "/commercial-banners",  icon: LayoutTemplate,               allowedRoles: SA },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Subscriptions", href: "/subscriptions", icon: Crown,       allowedRoles: SA },
      { name: "Coins",         href: "/coins",         icon: Coins,       allowedRoles: SA },
      { name: "Payouts",       href: "/payouts",       icon: IndianRupee, allowedRoles: SA },
      { name: "Revenue & Ads", href: "/revenue",       icon: BarChart3,   allowedRoles: SA },
      { name: "Monetization", href: "/monetization", icon: TrendingUp,   allowedRoles: SA },
      { name: "Financial Statements", href: "/financial-statements", icon: Landmark, badge: "ITR", allowedRoles: SA },
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
      { name: "Referral Program", href: "/referral", icon: Share2,   allowedRoles: SA_A },
      { name: "Marketing",   href: "/marketing",   icon: Megaphone,  allowedRoles: SA_A },
      { name: "Settings",    href: "/settings",    icon: Settings,   allowedRoles: SA   },
      { name: "Super Admin",         href: "/super-admin",       icon: ShieldCheck,   allowedRoles: SA   },
      { name: "Admin Role Management", href: "/admin-management", icon: Users,         allowedRoles: SA   },
      { name: "My Work Report",     href: "/my-report",         icon: ClipboardList, allowedRoles: SA_A },
      { name: "API Integrations",   href: "/api-integrations",  icon: Plug,          allowedRoles: SA   },
      { name: "Payment Gateways",   href: "/payment-gateway",   icon: CreditCard,    allowedRoles: SA   },
      { name: "Promo & Offer Codes",href: "/promo-codes",       icon: Ticket,        allowedRoles: SA   },
      { name: "Handbook",           href: "/handbook",          icon: BookOpen,      allowedRoles: ALL  },
      { name: "Lead Forms",         href: "/lead-forms",        icon: PenTool,       allowedRoles: SA   },
    ],
  },
];

type RoleInfo = {
  label: string; sublabel: string; badge: string;
  badgeClass: string; avatarClass: string; initial: string; name: string;
};

function getRoleInfo(role: string | null, name: string | null): RoleInfo {
  if (role === "admin") return {
    label: "Admin", sublabel: "Manages Agents", badge: "Admin",
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
    avatarClass: "bg-indigo-500", initial: "A",
    name: name ?? "Admin User",
  };
  return {
    label: "Super Admin", sublabel: "Full Platform Control", badge: "Super Admin",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
    avatarClass: "bg-gradient-to-br from-purple-600 to-pink-500", initial: "S",
    name: name ?? "Super Admin",
  };
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation]     = useLocation();
  const [roleInfo, setRoleInfo]     = useState<RoleInfo>(getRoleInfo(null, getAdminName()));
  const [role, setRole]             = useState<AdminRole>("super_admin");
  const [collapsed, setCollapsed]   = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const r = getAdminRole() ?? "super_admin";
    const name = getAdminName();
    setRole(r);
    setRoleInfo(getRoleInfo(r, name));
  }, [location]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleLogout = () => {
    clearAdminSession();
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
    "/agents":       "Agent Management",
    "/hosts":        "Host Management",
    "/levels":       "Levels & Promotion Strategy",
    "/calls":        "Audio & Video Calls",
    "/recordings":   "Call Recordings & Room Activity",
    "/promotions":   "User Promotions & Boosts",
    "/business-ads":  "Business Ads Manager",
    "/ai-hub":        "AI Hub",
    "/kyc":          "E-Verification",
    "/handbook":     "Platform Handbook",
    "/subscriptions": "Subscription Plans",
    "/promo-codes":   "Promo & Offer Codes",
    "/referral":          "Referral Program",
    "/api-integrations":  "3rd Party API Integrations",
    "/downloads":         "Downloads & Reports",
    "/screenshots":       "App Store Screenshots",
    "/admin-management":  "Admin Role Management",
    "/admin-activity":    "Admin Activity Monitor",
    "/my-report":         "My Work Report",
    "/content-editor":    "Content Management",
    "/app-store":         "App Store Analytics",
    "/crm":               "CRM & Support",
  };

  // Sidebar content shared between desktop and mobile drawer
  const renderSidebarContent = () => (
    <>
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">R</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-primary leading-tight">Ridhi Admin</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Control Panel</p>
        </div>
        {isMobile && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeSidebar}>
            <X className="w-4 h-4" />
          </Button>
        )}
        {!isMobile && (
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
        )}
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
                className="w-full flex items-center px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
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
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground/35 cursor-not-allowed select-none"
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
                        <Link href={item.href} onClick={isMobile ? closeSidebar : undefined}>
                          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}>
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 text-sm">{item.name}</span>
                            {item.badge && (
                              <Badge variant={isActive ? "secondary" : "destructive"} className="text-xs h-4 px-1.5 min-w-[1.25rem] justify-center">
                                {item.badge}
                              </Badge>
                            )}
                            {(item.href === "/super-admin" || item.href === "/admin-management") && (
                              <Badge variant="outline" className="text-[9px] px-1 h-4 text-purple-600 border-purple-300 bg-purple-50 font-bold">
                                SA
                              </Badge>
                            )}
                            {item.href === "/agents" && role === "admin" && (
                              <Badge className="text-[9px] px-1 h-4 bg-orange-100 text-orange-700 border border-orange-200">
                                3
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
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Mobile Sidebar Overlay ── */}
      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeSidebar} />
          <aside className="fixed inset-y-0 left-0 w-72 z-50 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl">
            {renderSidebarContent()}
          </aside>
        </>
      )}

      {/* ── Desktop Sidebar ── */}
      {!isMobile && (
        <aside className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0">
          {renderSidebarContent()}
        </aside>
      )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 lg:px-6 bg-card flex-shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {isMobile && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-base font-semibold truncate">
              {pageTitles[location] ?? pageTitles[Object.keys(pageTitles).find((k) => k !== "/" && location.startsWith(k)) ?? ""] ?? "Dashboard"}
            </h1>
            <Badge variant="outline" className={`text-[10px] px-2 h-5 font-semibold flex-shrink-0 ${roleInfo.badgeClass}`}>
              {roleInfo.badge}
            </Badge>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <GlobalSearch />
            <Badge variant="outline" className="hidden sm:flex gap-1.5 text-green-600 border-green-200 bg-green-50 text-xs">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              All Systems OK
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full text-white flex items-center justify-center font-bold" style={{ fontSize: "9px" }}>4</span>
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-3 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

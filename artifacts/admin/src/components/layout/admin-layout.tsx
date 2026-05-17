import { ReactNode } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: LineChart },
    ],
  },
  {
    label: "Users & Content",
    items: [
      { name: "Users", href: "/users", icon: Users },
      { name: "Content", href: "/content", icon: ShieldAlert, badge: "12" },
      { name: "Communities", href: "/communities", icon: UsersRound },
    ],
  },
  {
    label: "Creators & Gaming",
    items: [
      { name: "Hosts", href: "/hosts", icon: Star },
      { name: "Agents", href: "/agents", icon: Briefcase },
      { name: "Gaming", href: "/gaming", icon: Gamepad2 },
      { name: "Live Streams", href: "/live-streams", icon: Radio },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Coins", href: "/coins", icon: Coins },
      { name: "Payouts", href: "/payouts", icon: IndianRupee },
      { name: "Revenue & Ads", href: "/revenue", icon: BarChart3 },
    ],
  },
  {
    label: "Platform",
    items: [
      { name: "Marketing", href: "/marketing", icon: Megaphone },
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Super Admin", href: "/super-admin", icon: ShieldCheck },
    ],
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("ridhi_admin_logged_in");
    setLocation("/login");
  };

  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/users": "Users",
    "/content": "Content Moderation",
    "/communities": "Communities",
    "/coins": "Coin Economy",
    "/payouts": "Payouts",
    "/analytics": "Analytics",
    "/marketing": "Marketing",
    "/settings": "Settings",
    "/live-streams": "Live Streams",
    "/revenue": "Revenue & Ads",
    "/super-admin": "Super Admin",
    "/gaming": "Gaming Management",
    "/agents": "Agent Management",
    "/hosts": "Host Management",
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-60 border-r bg-sidebar text-sidebar-foreground flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-sidebar-border gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <div>
            <p className="font-bold text-sm text-primary leading-tight">Ridhi Admin</p>
            <p className="text-xs text-muted-foreground leading-tight">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-3">
              <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{section.label}</p>
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
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
                          {(item as any).badge && (
                            <Badge variant={isActive ? "secondary" : "destructive"} className="text-xs h-4 px-1.5 min-w-[1.25rem] justify-center">
                              {(item as any).badge}
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

        <div className="p-3 border-t border-sidebar-border space-y-1.5">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-xs">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate text-xs">Arjun Mehta</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-6 bg-card flex-shrink-0">
          <h1 className="text-base font-semibold">
            {pageTitles[location] ?? pageTitles[Object.keys(pageTitles).find((k) => k !== "/" && location.startsWith(k)) ?? ""] ?? "Dashboard"}
          </h1>
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

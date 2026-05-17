import { useEffect } from 'react';
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShieldOff, Lock } from "lucide-react";

import NotFound      from "@/pages/not-found";
import Login         from "@/pages/login";
import Dashboard     from "@/pages/dashboard";
import Users         from "@/pages/users";
import UserDetail    from "@/pages/user-detail";
import ContentMod    from "@/pages/content";
import Communities   from "@/pages/communities";
import Coins         from "@/pages/coins";
import Payouts       from "@/pages/payouts";
import Analytics     from "@/pages/analytics";
import Marketing     from "@/pages/marketing";
import Settings      from "@/pages/settings";
import LiveStreams    from "@/pages/live-streams";
import Revenue       from "@/pages/revenue";
import SuperAdmin    from "@/pages/super-admin";
import Gaming        from "@/pages/gaming";
import Agents        from "@/pages/agents";
import Hosts         from "@/pages/hosts";
import Calls         from "@/pages/calls";
import AIHub         from "@/pages/ai-hub";
import KYC           from "@/pages/kyc";
import Handbook      from "@/pages/handbook";
import AdminLayout   from "@/components/layout/admin-layout";

const queryClient = new QueryClient();

export type AdminRole = "super_admin" | "admin" | "agent" | "host";

// Which roles may access each route
export const ROUTE_ROLES: Record<string, AdminRole[]> = {
  "/":             ["super_admin", "admin", "agent", "host"],
  "/analytics":    ["super_admin", "admin", "agent"],
  "/users":        ["super_admin", "admin"],
  "/content":      ["super_admin", "admin"],
  "/communities":  ["super_admin", "admin"],
  "/coins":        ["super_admin", "admin"],
  "/payouts":      ["super_admin", "admin"],
  "/revenue":      ["super_admin", "admin"],
  "/agents":       ["super_admin", "admin"],
  "/hosts":        ["super_admin", "admin", "agent"],
  "/kyc":          ["super_admin", "admin", "agent"],
  "/calls":        ["super_admin", "admin", "agent", "host"],
  "/gaming":       ["super_admin", "admin"],
  "/live-streams": ["super_admin", "admin", "agent", "host"],
  "/ai-hub":       ["super_admin", "admin"],
  "/marketing":    ["super_admin", "admin"],
  "/settings":     ["super_admin", "admin"],
  "/super-admin":  ["super_admin"],
  "/handbook":     ["super_admin", "admin", "agent", "host"],
};

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
  agent:       "Agent",
  host:        "Host",
};

function AccessDenied({ route }: { route: string }) {
  const role      = localStorage.getItem("ridhi_admin_role") ?? "";
  const allowed   = ROUTE_ROLES[route] ?? [];
  const minRole   = allowed[0] ? ROLE_LABEL[allowed[0]] : "higher role";
  return (
    <div className="flex flex-col items-center justify-center min-h-[62vh] gap-6 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldOff className="w-10 h-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground max-w-sm">
          This section requires <span className="font-semibold text-foreground">{minRole}</span> access or higher.
          Your current role — <span className="font-semibold text-foreground capitalize">{ROLE_LABEL[role] ?? role}</span> — does not have permission.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full">
        <Lock className="w-3 h-3" />
        Contact your Super Admin or Admin to request access
      </div>
    </div>
  );
}

function RoleRoute({ component: Component, path }: { component: React.ComponentType<any>; path: string }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (localStorage.getItem("ridhi_admin_logged_in") !== "true") setLocation("/login");
  }, [location, setLocation]);

  const role    = (localStorage.getItem("ridhi_admin_role") ?? "") as AdminRole;
  const allowed = ROUTE_ROLES[path] ?? ["super_admin"];

  return (
    <AdminLayout>
      {allowed.includes(role) ? <Component /> : <AccessDenied route={path} />}
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login"        component={Login} />
      <Route path="/"             component={() => <RoleRoute component={Dashboard}   path="/" />} />
      <Route path="/users"        component={() => <RoleRoute component={Users}        path="/users" />} />
      <Route path="/users/:id"    component={() => <RoleRoute component={UserDetail}   path="/users" />} />
      <Route path="/content"      component={() => <RoleRoute component={ContentMod}   path="/content" />} />
      <Route path="/communities"  component={() => <RoleRoute component={Communities}  path="/communities" />} />
      <Route path="/coins"        component={() => <RoleRoute component={Coins}        path="/coins" />} />
      <Route path="/payouts"      component={() => <RoleRoute component={Payouts}      path="/payouts" />} />
      <Route path="/analytics"    component={() => <RoleRoute component={Analytics}    path="/analytics" />} />
      <Route path="/marketing"    component={() => <RoleRoute component={Marketing}    path="/marketing" />} />
      <Route path="/settings"     component={() => <RoleRoute component={Settings}     path="/settings" />} />
      <Route path="/live-streams" component={() => <RoleRoute component={LiveStreams}  path="/live-streams" />} />
      <Route path="/revenue"      component={() => <RoleRoute component={Revenue}      path="/revenue" />} />
      <Route path="/super-admin"  component={() => <RoleRoute component={SuperAdmin}   path="/super-admin" />} />
      <Route path="/gaming"       component={() => <RoleRoute component={Gaming}       path="/gaming" />} />
      <Route path="/agents"       component={() => <RoleRoute component={Agents}       path="/agents" />} />
      <Route path="/hosts"        component={() => <RoleRoute component={Hosts}        path="/hosts" />} />
      <Route path="/calls"        component={() => <RoleRoute component={Calls}        path="/calls" />} />
      <Route path="/ai-hub"       component={() => <RoleRoute component={AIHub}        path="/ai-hub" />} />
      <Route path="/kyc"          component={() => <RoleRoute component={KYC}          path="/kyc" />} />
      <Route path="/handbook"     component={() => <RoleRoute component={Handbook}     path="/handbook" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

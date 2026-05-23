import { useEffect } from 'react';
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
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
import PromoCodes    from "@/pages/promo-codes";
import ReferralProgram    from "@/pages/referral-program";
import ApiIntegrations   from "@/pages/api-integrations";
import VideoUploads      from "@/pages/video-uploads";
import AdminManagement  from "@/pages/admin-management";
import MyReport         from "@/pages/my-report";
import AdminActivity    from "@/pages/admin-activity";
import Agents        from "@/pages/agents";
import Hosts         from "@/pages/hosts";
import Levels        from "@/pages/levels";
import Calls         from "@/pages/calls";
import Recordings    from "@/pages/recordings";
import Promotions    from "@/pages/promotions";
import BusinessAds   from "@/pages/business-ads";
import AIHub         from "@/pages/ai-hub";
import KYC           from "@/pages/kyc";
import Handbook      from "@/pages/handbook";
import SpecialAds          from "@/pages/special-ads";
import CommercialBanners   from "@/pages/commercial-banners";
import Jobs                from "@/pages/jobs";
import Subscriptions       from "@/pages/subscriptions";
import DomainHosting       from "@/pages/domain-hosting";
import BackendAccess       from "@/pages/backend-access";
import ContentAssets       from "@/pages/content-assets";
import PortalLogin         from "@/pages/portal-login";
import Downloads          from "@/pages/downloads";
import Support            from "@/pages/support";
import Screenshots        from "@/pages/screenshots";
import AdminLayout         from "@/components/layout/admin-layout";

const queryClient = new QueryClient();

export type AdminRole = "super_admin" | "admin";

// Which roles may access each route
export const ROUTE_ROLES: Record<string, AdminRole[]> = {
  "/":             ["super_admin", "admin"],
  "/analytics":    ["super_admin", "admin"],
  "/users":        ["super_admin"],
  "/users/:id":    ["super_admin"],
  "/content":      ["super_admin"],
  "/communities":  ["super_admin"],
  "/coins":        ["super_admin"],
  "/payouts":      ["super_admin"],
  "/revenue":      ["super_admin"],
  "/agents":       ["super_admin", "admin"],
  "/hosts":        ["super_admin", "admin"],
  "/levels":       ["super_admin", "admin"],
  "/kyc":          ["super_admin", "admin"],
  "/calls":        ["super_admin", "admin"],
  "/recordings":   ["super_admin", "admin"],
  "/promotions":   ["super_admin"],
  "/business-ads":        ["super_admin"],
  "/special-ads":         ["super_admin"],
  "/commercial-banners":  ["super_admin"],
  "/jobs":           ["super_admin"],
  "/subscriptions":  ["super_admin"],
  "/live-streams": ["super_admin"],
  "/ai-hub":       ["super_admin", "admin"],
  "/marketing":    ["super_admin", "admin"],
  "/settings":     ["super_admin"],
  "/super-admin":  ["super_admin"],
  "/promo-codes":  ["super_admin"],
  "/referral":          ["super_admin", "admin"],
  "/api-integrations":  ["super_admin"],
  "/domain-hosting":    ["super_admin"],
  "/backend-access":    ["super_admin"],
  "/content-assets":    ["super_admin"],
  "/admin-management":  ["super_admin"],
  "/admin-activity":    ["super_admin"],
  "/my-report":         ["super_admin", "admin"],
  "/video-uploads":     ["super_admin"],
  "/downloads":         ["super_admin"],
  "/screenshots":       ["super_admin"],
  "/handbook":     ["super_admin", "admin"],
};

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
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

// Only seed a default session on first load — never overwrite a real login
function seedDefaultSession() {
  if (!localStorage.getItem("ridhi_admin_logged_in")) {
    localStorage.setItem("ridhi_admin_logged_in", "true");
    localStorage.setItem("ridhi_admin_role",      "super_admin");
    localStorage.setItem("ridhi_admin_email",     "arjun@ridhi.app");
  }
}

function RoleRoute({ component: Component, path }: { component: React.ComponentType<any>; path: string }) {
  const [location, setLocation] = useLocation();

  seedDefaultSession();

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
      <Route path="/support"             component={Support} />
      <Route path="/login"               component={Login} />
      <Route path="/login/super-admin"   component={() => <PortalLogin role="super_admin" />} />
      <Route path="/login/admin"         component={() => <PortalLogin role="admin" />} />
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
      <Route path="/promo-codes"  component={() => <RoleRoute component={PromoCodes}      path="/promo-codes" />} />
      <Route path="/referral"          component={() => <RoleRoute component={ReferralProgram}  path="/referral" />} />
      <Route path="/api-integrations"  component={() => <RoleRoute component={ApiIntegrations}  path="/api-integrations"  />} />
      <Route path="/admin-management"  component={() => <RoleRoute component={AdminManagement}  path="/admin-management"  />} />
      <Route path="/admin-activity"    component={() => <RoleRoute component={AdminActivity}    path="/admin-activity"    />} />
      <Route path="/my-report"         component={() => <RoleRoute component={MyReport}         path="/my-report"         />} />
      <Route path="/video-uploads"     component={() => <RoleRoute component={VideoUploads}     path="/video-uploads"     />} />
      <Route path="/agents"       component={() => <RoleRoute component={Agents}       path="/agents" />} />
      <Route path="/hosts"        component={() => <RoleRoute component={Hosts}        path="/hosts" />} />
      <Route path="/levels"       component={() => <RoleRoute component={Levels}       path="/levels" />} />
      <Route path="/calls"        component={() => <RoleRoute component={Calls}        path="/calls" />} />
      <Route path="/recordings"   component={() => <RoleRoute component={Recordings}   path="/recordings" />} />
      <Route path="/promotions"   component={() => <RoleRoute component={Promotions}   path="/promotions" />} />
      <Route path="/business-ads"  component={() => <RoleRoute component={BusinessAds}  path="/business-ads" />} />
      <Route path="/ai-hub"       component={() => <RoleRoute component={AIHub}        path="/ai-hub" />} />
      <Route path="/kyc"          component={() => <RoleRoute component={KYC}          path="/kyc" />} />
      <Route path="/handbook"     component={() => <RoleRoute component={Handbook}     path="/handbook" />} />
      <Route path="/special-ads"        component={() => <RoleRoute component={SpecialAds}        path="/special-ads" />} />
      <Route path="/commercial-banners" component={() => <RoleRoute component={CommercialBanners} path="/commercial-banners" />} />
      <Route path="/jobs"               component={() => <RoleRoute component={Jobs}               path="/jobs" />} />
      <Route path="/subscriptions"      component={() => <RoleRoute component={Subscriptions}      path="/subscriptions" />} />
      <Route path="/domain-hosting"    component={() => <RoleRoute component={DomainHosting}    path="/domain-hosting" />} />
      <Route path="/backend-access"    component={() => <RoleRoute component={BackendAccess}    path="/backend-access" />} />
      <Route path="/content-assets"    component={() => <RoleRoute component={ContentAssets}    path="/content-assets" />} />
      <Route path="/downloads"         component={() => <RoleRoute component={Downloads}         path="/downloads" />} />
      <Route path="/screenshots"       component={() => <RoleRoute component={Screenshots}       path="/screenshots" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Default: block ALL admin routes from indexing, archiving, and image indexing.
            Only /support overrides this via its own Helmet. */}
        <Helmet>
          <meta name="robots" content="noindex, nofollow, noarchive, noimageindex, nosnippet" />
          <meta name="title" content="Ridhi" />
        </Helmet>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import UserDetail from "@/pages/user-detail";
import ContentModeration from "@/pages/content";
import Communities from "@/pages/communities";
import Coins from "@/pages/coins";
import Payouts from "@/pages/payouts";
import Analytics from "@/pages/analytics";
import Marketing from "@/pages/marketing";
import Settings from "@/pages/settings";
import LiveStreams from "@/pages/live-streams";
import Revenue from "@/pages/revenue";
import SuperAdmin from "@/pages/super-admin";
import Gaming from "@/pages/gaming";
import Agents from "@/pages/agents";
import Hosts from "@/pages/hosts";
import Calls from "@/pages/calls";
import AIHub from "@/pages/ai-hub";
import KYC from "@/pages/kyc";
import Handbook from "@/pages/handbook";

import AdminLayout from "@/components/layout/admin-layout";
import { ShieldOff } from "lucide-react";

const queryClient = new QueryClient();

function getStoredRole(): string | null {
  return localStorage.getItem("ridhi_admin_role");
}

// Standard protected route — any logged-in admin can access
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; [key: string]: any }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("ridhi_admin_logged_in") === "true";
    if (!isLoggedIn) setLocation("/login");
  }, [location, setLocation]);

  return (
    <AdminLayout>
      <Component {...rest} />
    </AdminLayout>
  );
}

// Super-admin-only route — host / agent see an Access Denied screen
function SuperAdminRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const [location, setLocation] = useLocation();
  const role = getStoredRole();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("ridhi_admin_logged_in") === "true";
    if (!isLoggedIn) setLocation("/login");
  }, [location, setLocation]);

  if (role !== "super_admin") {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldOff className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground max-w-sm">
              The <span className="font-semibold text-foreground">Super Admin</span> panel is restricted to
              Super Admins only. Your current role — <span className="font-semibold text-foreground capitalize">{role?.replace("_", " ")}</span> — does not have permission to view this page.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full">
              Contact a Super Admin if you need access to this section
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/users" component={() => <ProtectedRoute component={Users} />} />
      <Route path="/users/:id" component={() => <ProtectedRoute component={UserDetail} />} />
      <Route path="/content" component={() => <ProtectedRoute component={ContentModeration} />} />
      <Route path="/communities" component={() => <ProtectedRoute component={Communities} />} />
      <Route path="/coins" component={() => <ProtectedRoute component={Coins} />} />
      <Route path="/payouts" component={() => <ProtectedRoute component={Payouts} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} />} />
      <Route path="/marketing" component={() => <ProtectedRoute component={Marketing} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/live-streams" component={() => <ProtectedRoute component={LiveStreams} />} />
      <Route path="/revenue" component={() => <ProtectedRoute component={Revenue} />} />
      <Route path="/super-admin" component={() => <SuperAdminRoute component={SuperAdmin} />} />
      <Route path="/gaming" component={() => <ProtectedRoute component={Gaming} />} />
      <Route path="/agents" component={() => <ProtectedRoute component={Agents} />} />
      <Route path="/hosts" component={() => <ProtectedRoute component={Hosts} />} />
      <Route path="/calls" component={() => <ProtectedRoute component={Calls} />} />
      <Route path="/ai-hub" component={() => <ProtectedRoute component={AIHub} />} />
      <Route path="/kyc" component={() => <ProtectedRoute component={KYC} />} />
      <Route path="/handbook" component={() => <ProtectedRoute component={Handbook} />} />
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

import { useState, useEffect } from 'react';
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
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

import AdminLayout from "@/components/layout/admin-layout";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: { component: any, [key: string]: any }) {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("ridhi_admin_logged_in") === "true";
    if (!isLoggedIn && location !== "/login") {
      setLocation("/login");
    }
  }, [location, setLocation]);

  return (
    <AdminLayout>
      <Component {...rest} />
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

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Users,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  CreditCard,
  Eye,
} from "lucide-react";

const ADMIN_ROLES = [
  { id: 1, name: "Arjun Mehta", email: "arjun@ridhi.app", role: "Super Admin", status: "active", lastLogin: "2 min ago", permissions: "all" },
  { id: 2, name: "Sneha Patel", email: "sneha@ridhi.app", role: "Content Admin", status: "active", lastLogin: "1h ago", permissions: "content,users" },
  { id: 3, name: "Rohit Kumar", email: "rohit@ridhi.app", role: "Finance Admin", status: "active", lastLogin: "3h ago", permissions: "revenue,payouts" },
  { id: 4, name: "Priya Nair", email: "priya@ridhi.app", role: "Support Admin", status: "inactive", lastLogin: "2d ago", permissions: "users,reports" },
  { id: 5, name: "Vikash Singh", email: "vikash@ridhi.app", role: "Marketing Admin", status: "active", lastLogin: "30m ago", permissions: "marketing,analytics" },
];

const SERVER_HEALTH = [
  { name: "API Server", status: "healthy", uptime: "99.97%", responseTime: "42ms", load: 34 },
  { name: "WebSocket Server", status: "healthy", uptime: "99.91%", responseTime: "18ms", load: 61 },
  { name: "Media CDN", status: "healthy", uptime: "100%", responseTime: "22ms", load: 45 },
  { name: "PostgreSQL DB", status: "healthy", uptime: "99.99%", responseTime: "8ms", load: 28 },
  { name: "Redis Cache", status: "warning", uptime: "99.82%", responseTime: "3ms", load: 78 },
  { name: "Push Notifications", status: "healthy", uptime: "99.95%", responseTime: "95ms", load: 22 },
];

const API_LOGS = [
  { method: "GET", path: "/api/feed", status: 200, time: "38ms", count: "142K/h" },
  { method: "POST", path: "/api/posts", status: 201, time: "124ms", count: "8.2K/h" },
  { method: "GET", path: "/api/match", status: 200, time: "56ms", count: "24K/h" },
  { method: "POST", path: "/api/coins/recharge", status: 200, time: "892ms", count: "1.1K/h" },
  { method: "DELETE", path: "/api/reports/:id", status: 200, time: "44ms", count: "340/h" },
];

const PAYMENT_GATEWAYS = [
  { name: "Razorpay", status: "active", successRate: 98.4, txToday: "₹2.4L", icon: CreditCard, color: "text-blue-600" },
  { name: "UPI Direct", status: "active", successRate: 99.1, txToday: "₹1.8L", icon: Globe, color: "text-green-600" },
  { name: "Google Pay", status: "active", successRate: 97.8, txToday: "₹0.9L", icon: CreditCard, color: "text-emerald-600" },
  { name: "PhonePe", status: "maintenance", successRate: 0, txToday: "₹0", icon: CreditCard, color: "text-purple-600" },
];

const SECURITY_ALERTS = [
  { severity: "low", message: "12 failed login attempts from IP 203.x.x.x", time: "5 min ago" },
  { severity: "medium", message: "Unusual spike in API calls from new account cluster", time: "23 min ago" },
  { severity: "low", message: "3 accounts flagged for coordinated inauthentic behavior", time: "1h ago" },
  { severity: "high", message: "Payment anomaly detected: 47 micro-transactions in 2 minutes", time: "2h ago" },
];

export default function SuperAdminPage() {
  const [globalSettings, setGlobalSettings] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    guestAccess: true,
    aiModeration: true,
    autoPayouts: false,
    devMode: false,
  });

  const statusColor = (s: string) =>
    s === "healthy" ? "text-green-600" : s === "warning" ? "text-yellow-600" : "text-red-600";
  const statusIcon = (s: string) =>
    s === "healthy" ? CheckCircle : s === "warning" ? AlertTriangle : XCircle;

  const severityColor = (s: string) =>
    s === "high" ? "bg-red-100 text-red-700 border-red-200" :
    s === "medium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
    "bg-blue-100 text-blue-700 border-blue-200";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Super Admin Control
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Full system access — proceed with caution</p>
        </div>
        <Badge variant="destructive" className="gap-1">
          <Lock className="w-3 h-3" />
          Restricted Access
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Admins", value: "5", icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "System Uptime", value: "99.96%", icon: Activity, color: "text-green-600 bg-green-50" },
          { label: "Active API Keys", value: "12", icon: Lock, color: "text-purple-600 bg-purple-50" },
          { label: "Security Alerts", value: "4", icon: AlertTriangle, color: "text-yellow-600 bg-yellow-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-4 h-4" />
              Server Health Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SERVER_HEALTH.map((srv) => {
              const Icon = statusIcon(srv.status);
              return (
                <div key={srv.name} className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${statusColor(srv.status)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{srv.name}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground ml-2 flex-shrink-0">
                        <span>{srv.uptime}</span>
                        <span>{srv.responseTime}</span>
                        <span>{srv.load}% load</span>
                      </div>
                    </div>
                    <Progress value={srv.load} className="h-1.5" />
                  </div>
                </div>
              );
            })}
            <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
              <RefreshCw className="w-3 h-3" />
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Global Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(globalSettings).map(([key, val]) => {
              const labels: Record<string, { label: string; desc: string; danger?: boolean }> = {
                maintenanceMode: { label: "Maintenance Mode", desc: "Disable app access for all users", danger: true },
                registrationOpen: { label: "Open Registration", desc: "Allow new user sign-ups" },
                guestAccess: { label: "Guest Access", desc: "Allow browsing without account" },
                aiModeration: { label: "AI Auto-Moderation", desc: "AI reviews flagged content" },
                autoPayouts: { label: "Auto Payouts", desc: "Automatically process creator payouts" },
                devMode: { label: "Developer Mode", desc: "Show extended debug info in APIs", danger: true },
              };
              const meta = labels[key];
              return (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${meta.danger ? "text-destructive" : ""}`}>{meta.label}</p>
                    <p className="text-xs text-muted-foreground">{meta.desc}</p>
                  </div>
                  <Switch
                    checked={val}
                    onCheckedChange={(v) => setGlobalSettings((s) => ({ ...s, [key]: v }))}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SECURITY_ALERTS.map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${severityColor(alert.severity)}`}>
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-xs opacity-70 mt-0.5">{alert.time}</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              API Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs">
                  <th className="text-left pb-2">Method</th>
                  <th className="text-left pb-2">Endpoint</th>
                  <th className="text-right pb-2">Status</th>
                  <th className="text-right pb-2">Avg Time</th>
                  <th className="text-right pb-2">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {API_LOGS.map((log, i) => (
                  <tr key={i}>
                    <td className="py-2">
                      <Badge variant={log.method === "GET" ? "secondary" : log.method === "POST" ? "default" : "destructive"} className="text-xs">
                        {log.method}
                      </Badge>
                    </td>
                    <td className="py-2 font-mono text-xs truncate max-w-[120px]">{log.path}</td>
                    <td className="py-2 text-right">
                      <span className="text-green-600 font-medium">{log.status}</span>
                    </td>
                    <td className="py-2 text-right text-muted-foreground">{log.time}</td>
                    <td className="py-2 text-right text-muted-foreground">{log.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Gateway Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PAYMENT_GATEWAYS.map((gw) => (
              <div key={gw.name} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <gw.icon className={`w-4 h-4 ${gw.color}`} />
                    <span className="font-medium text-sm">{gw.name}</span>
                  </div>
                  <Badge variant={gw.status === "active" ? "default" : "secondary"} className="text-xs">
                    {gw.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="text-foreground font-medium">{gw.successRate > 0 ? gw.successRate + "%" : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today's Tx</span>
                    <span className="text-foreground font-medium">{gw.txToday}</span>
                  </div>
                </div>
                {gw.successRate > 0 && <Progress value={gw.successRate} className="h-1.5" />}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                    {gw.status === "active" ? "Disable" : "Enable"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Admin Role Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pb-3">Admin</th>
                  <th className="text-left pb-3">Role</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-left pb-3">Permissions</th>
                  <th className="text-left pb-3">Last Login</th>
                  <th className="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ADMIN_ROLES.map((admin) => (
                  <tr key={admin.id}>
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={admin.role === "Super Admin" ? "default" : "secondary"} className="text-xs">
                        {admin.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className={`flex items-center gap-1.5 text-xs ${admin.status === "active" ? "text-green-600" : "text-muted-foreground"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${admin.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                        {admin.status}
                      </div>
                    </td>
                    <td className="py-3">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{admin.permissions}</code>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">{admin.lastLogin}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                        {admin.role !== "Super Admin" && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">Revoke</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="mt-4 gap-2">
            <Users className="w-4 h-4" />
            Invite New Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

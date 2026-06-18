import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CreditCard, Wallet, Smartphone, Globe, CheckCircle, XCircle,
  AlertTriangle, Zap, RefreshCw, Eye, EyeOff, Save, TestTube,
  IndianRupee, TrendingUp, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Lock, Key, Copy, ExternalLink,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────
type PayProvider = "razorpay" | "cashfree" | "phonepe";

interface ProviderConfig {
  enabled: boolean;
  keyId: string;
  keySecret: string;
  env: "sandbox" | "production";
  webhookUrl: string;
  lastTested: string | null;
  testStatus: "pass" | "fail" | "pending";
}

interface PaymentState {
  activeProvider: PayProvider;
  providers: Record<PayProvider, ProviderConfig>;
  txStats: {
    totalToday: string;
    totalMonth: string;
    successRate: number;
    avgTicket: string;
    topMethod: string;
  };
  recentTx: Array<{
    id: string; user: string; amount: string; method: string;
    provider: PayProvider; status: "success" | "failed" | "pending";
    time: string;
  }>;
}

// ── Mock initial state ──────────────────────────────────────────────────
const INITIAL_STATE: PaymentState = {
  activeProvider: "razorpay",
  providers: {
    razorpay: {
      enabled: true,
      keyId: "rzp_live_••••••••K7xQ",
      keySecret: "••••••••••••••••••••••••••••••••",
      env: "production",
      webhookUrl: "https://ridhi.app/api/webhooks/razorpay",
      lastTested: "2 min ago",
      testStatus: "pass",
    },
    cashfree: {
      enabled: false,
      keyId: "",
      keySecret: "",
      env: "sandbox",
      webhookUrl: "https://ridhi.app/api/webhooks/cashfree",
      lastTested: null,
      testStatus: "pending",
    },
    phonepe: {
      enabled: false,
      keyId: "",
      keySecret: "",
      env: "sandbox",
      webhookUrl: "https://ridhi.app/api/webhooks/phonepe",
      lastTested: null,
      testStatus: "pending",
    },
  },
  txStats: {
    totalToday: "₹2,42,800",
    totalMonth: "₹68,45,200",
    successRate: 98.4,
    avgTicket: "₹349",
    topMethod: "UPI",
  },
  recentTx: [
    { id: "pay_9aB2cD", user: "Rahul Sharma", amount: "₹499", method: "UPI", provider: "razorpay", status: "success", time: "2 min ago" },
    { id: "pay_8xY7zW", user: "Priya Patel", amount: "₹1,999", method: "Card", provider: "razorpay", status: "success", time: "5 min ago" },
    { id: "pay_7mN6pQ", user: "Amit Kumar", amount: "₹49", method: "UPI", provider: "razorpay", status: "failed", time: "8 min ago" },
    { id: "pay_6kL5jR", user: "Sneha Gupta", amount: "₹999", method: "Wallet", provider: "razorpay", status: "success", time: "12 min ago" },
    { id: "pay_5hI4gT", user: "Vikram Rao", amount: "₹4,999", method: "Card", provider: "razorpay", status: "pending", time: "15 min ago" },
  ],
};

// ── Provider metadata ───────────────────────────────────────────────────
const PROVIDER_META: Record<PayProvider, {
  label: string;
  tagline: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badge: string;
  features: string[];
  tdr: string;
  settlement: string;
  docsUrl: string;
}> = {
  razorpay: {
    label: "Razorpay",
    tagline: "India's most trusted payment gateway",
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    features: ["UPI", "Cards", "Netbanking", "Wallets", "EMI", "International"],
    tdr: "2% + GST",
    settlement: "T+2 days",
    docsUrl: "https://razorpay.com/docs",
  },
  cashfree: {
    label: "Cashfree",
    tagline: "Lowest TDR with auto-collect",
    icon: Wallet,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    features: ["UPI", "Cards", "EMI", "Auto-Collect", "T+0 Settlement", "Payouts"],
    tdr: "1.9% + GST",
    settlement: "T+0 / T+1",
    docsUrl: "https://docs.cashfree.com",
  },
  phonepe: {
    label: "PhonePe",
    tagline: "Flipkart-owned — 400M+ UPI users",
    icon: Smartphone,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    features: ["UPI", "QR Code", "Cards", "Soundbox", "BNPL", "Insurance"],
    tdr: "1.8% + GST",
    settlement: "T+1 days",
    docsUrl: "https://developer.phonepe.com",
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────
function maskSecret(val: string): string {
  if (!val) return "";
  if (val.includes("•")) return val;
  return val.slice(0, 4) + "••••••••••••••••••••••••••••••••";
}

function statusIcon(status: "success" | "failed" | "pending") {
  switch (status) {
    case "success": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
    case "pending": return <RefreshCw className="w-4 h-4 text-amber-500" />;
  }
}

function statusBadge(status: "success" | "failed" | "pending") {
  switch (status) {
    case "success": return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Success</Badge>;
    case "failed": return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Failed</Badge>;
    case "pending": return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Pending</Badge>;
  }
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function PaymentGatewayPage() {
  const [state, setState] = useState<PaymentState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<PayProvider>("razorpay");
  const [showSecrets, setShowSecrets] = useState<Record<PayProvider, boolean>>({
    razorpay: false, cashfree: false, phonepe: false,
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const activeProvider = state.activeProvider;
  const providers = ["razorpay", "cashfree", "phonepe"] as PayProvider[];

  const handleToggle = (provider: PayProvider) => {
    setState((s) => ({
      ...s,
      providers: {
        ...s.providers,
        [provider]: {
          ...s.providers[provider],
          enabled: !s.providers[provider].enabled,
        },
      },
    }));
  };

  const handleSetActive = (provider: PayProvider) => {
    if (!state.providers[provider].enabled) {
      setToast({ type: "error", msg: `${PROVIDER_META[provider].label} must be enabled first.` });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setState((s) => ({ ...s, activeProvider: provider }));
    setToast({ type: "success", msg: `${PROVIDER_META[provider].label} is now the active gateway.` });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (provider: PayProvider) => {
    setSaving(provider);
    setTimeout(() => {
      setSaving(null);
      setToast({ type: "success", msg: `${PROVIDER_META[provider].label} configuration saved.` });
      setTimeout(() => setToast(null), 3000);
    }, 800);
  };

  const handleTest = (provider: PayProvider) => {
    setTesting(provider);
    setTimeout(() => {
      setTesting(null);
      const cfg = state.providers[provider];
      const pass = cfg.keyId.length > 10 && cfg.keySecret.length > 10;
      setState((s) => ({
        ...s,
        providers: {
          ...s.providers,
          [provider]: {
            ...s.providers[provider],
            lastTested: "Just now",
            testStatus: pass ? "pass" : "fail",
          },
        },
      }));
      setToast({
        type: pass ? "success" : "error",
        msg: pass ? `${PROVIDER_META[provider].label} connection test passed.` : `${PROVIDER_META[provider].label} test failed — check API keys.`,
      });
      setTimeout(() => setToast(null), 3000);
    }, 1200);
  };

  const handleKeyChange = (provider: PayProvider, field: "keyId" | "keySecret", val: string) => {
    setState((s) => ({
      ...s,
      providers: {
        ...s.providers,
        [provider]: {
          ...s.providers[provider],
          [field]: val,
          testStatus: "pending",
          lastTested: null,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-500" />
            Payment Gateways
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage Razorpay, Cashfree, and PhonePe integrations. Toggle providers, configure API keys, and monitor transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <ShieldCheck className="w-3 h-3 mr-1" /> Super Admin Only
          </Badge>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm border ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Today's Revenue", value: state.txStats.totalToday, change: "+12.4%", icon: IndianRupee, color: "text-emerald-500" },
          { label: "Monthly Revenue", value: state.txStats.totalMonth, change: "+8.2%", icon: TrendingUp, color: "text-blue-500" },
          { label: "Success Rate", value: `${state.txStats.successRate}%`, change: "+0.3%", icon: CheckCircle, color: "text-emerald-500" },
          { label: "Avg Ticket", value: state.txStats.avgTicket, change: "+5.1%", icon: ArrowUpRight, color: "text-amber-500" },
          { label: "Top Method", value: state.txStats.topMethod, change: "", icon: Zap, color: "text-purple-500" },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="text-xl font-bold text-foreground">{kpi.value}</div>
              {kpi.change && <div className="text-xs text-emerald-500 mt-1">{kpi.change} vs yesterday</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((key) => {
          const meta = PROVIDER_META[key];
          const cfg = state.providers[key];
          const isActive = activeProvider === key;
          const Icon = meta.icon;
          return (
            <Card
              key={key}
              className={`border-2 transition-all cursor-pointer ${
                isActive ? "border-purple-400 bg-purple-50/40 shadow-sm" : "border-border hover:border-purple-200"
              }`}
              onClick={() => setActiveTab(key)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.color} border ${meta.border}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{meta.label}</span>
                        {isActive && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">
                            <Zap className="w-3 h-3 mr-0.5" /> ACTIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{meta.tagline}</p>
                    </div>
                  </div>
                  <Switch
                    checked={cfg.enabled}
                    onCheckedChange={() => handleToggle(key)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {meta.features.map((f) => (
                    <span key={f} className="inline-block rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-muted/50 rounded-md px-2 py-1.5">
                    <span className="text-muted-foreground block">TDR</span>
                    <span className="font-medium text-foreground">{meta.tdr}</span>
                  </div>
                  <div className="bg-muted/50 rounded-md px-2 py-1.5">
                    <span className="text-muted-foreground block">Settlement</span>
                    <span className="font-medium text-foreground">{meta.settlement}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {cfg.testStatus === "pass" ? (
                    <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-600">Connected</span></>
                  ) : cfg.testStatus === "fail" ? (
                    <><XCircle className="w-3.5 h-3.5 text-red-500" /> <span className="text-red-600">Connection failed</span></>
                  ) : (
                    <><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> <span className="text-amber-600">Not tested</span></>
                  )}
                  {cfg.lastTested && (
                    <span className="text-muted-foreground ml-auto">Tested {cfg.lastTested}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Configuration Tabs */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-500" /> API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PayProvider)}>
            <TabsList className="bg-muted flex-wrap h-auto py-1 gap-1">
              {providers.map((key) => {
                const meta = PROVIDER_META[key];
                const cfg = state.providers[key];
                const Icon = meta.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                    {cfg.enabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {providers.map((key) => {
              const meta = PROVIDER_META[key];
              const cfg = state.providers[key];
              return (
                <TabsContent key={key} value={key} className="space-y-5 mt-5">
                  {/* Active / Set Active */}
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${meta.bg} ${meta.color}`}>
                        <meta.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{meta.label} Configuration</p>
                        <p className="text-xs text-muted-foreground">Environment: <span className="font-medium text-foreground">{cfg.env}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeProvider === key ? (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          <Zap className="w-3 h-3 mr-1" /> Currently Active
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSetActive(key)}
                          disabled={!cfg.enabled}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Set as Active
                        </Button>
                      )}
                      <a href={meta.docsUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                        Docs <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* API Key Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-1.5">
                        <Key className="w-3 h-3" /> Key ID / Client ID
                      </Label>
                      <div className="relative">
                        <Input
                          type={showSecrets[key] ? "text" : "password"}
                          value={cfg.keyId}
                          onChange={(e) => handleKeyChange(key, "keyId", e.target.value)}
                          placeholder={`Enter ${meta.label} Key ID`}
                          className="pr-10 text-sm"
                        />
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowSecrets((s) => ({ ...s, [key]: !s[key] }))}
                          type="button"
                        >
                          {showSecrets[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-1.5">
                        <Lock className="w-3 h-3" /> Key Secret / API Secret
                      </Label>
                      <div className="relative">
                        <Input
                          type={showSecrets[key] ? "text" : "password"}
                          value={cfg.keySecret}
                          onChange={(e) => handleKeyChange(key, "keySecret", e.target.value)}
                          placeholder={`Enter ${meta.label} Secret`}
                          className="pr-10 text-sm"
                        />
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowSecrets((s) => ({ ...s, [key]: !s[key] }))}
                          type="button"
                        >
                          {showSecrets[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Webhook & Environment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Webhook URL</Label>
                      <div className="relative">
                        <Input value={cfg.webhookUrl} readOnly className="pr-10 text-sm bg-muted/50" />
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => { navigator.clipboard.writeText(cfg.webhookUrl); setToast({ type: "success", msg: "Webhook URL copied." }); setTimeout(() => setToast(null), 2000); }}
                          type="button"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Copy this URL into your {meta.label} dashboard webhook settings.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Environment</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={cfg.env === "sandbox" ? "default" : "outline"}
                          className={`text-xs h-8 ${cfg.env === "sandbox" ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                          onClick={() => setState((s) => ({ ...s, providers: { ...s.providers, [key]: { ...s.providers[key], env: "sandbox" } } }))}
                        >
                          Sandbox
                        </Button>
                        <Button
                          size="sm"
                          variant={cfg.env === "production" ? "default" : "outline"}
                          className={`text-xs h-8 ${cfg.env === "production" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                          onClick={() => setState((s) => ({ ...s, providers: { ...s.providers, [key]: { ...s.providers[key], env: "production" } } }))}
                        >
                          Production
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={() => handleSave(key)}
                      disabled={saving === key}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {saving === key ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Save Configuration
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleTest(key)}
                      disabled={testing === key}
                    >
                      {testing === key ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <TestTube className="w-4 h-4 mr-1" />}
                      Test Connection
                    </Button>
                    {!cfg.enabled && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Enable this provider to activate it
                      </span>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-500" /> Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold">Transaction ID</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">User</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Method</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Gateway</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.recentTx.map((tx) => (
                <TableRow key={tx.id} className="border-border hover:bg-muted/30">
                  <TableCell className="text-xs font-mono text-muted-foreground">{tx.id}</TableCell>
                  <TableCell className="text-sm text-foreground">{tx.user}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{tx.amount}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tx.method}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {PROVIDER_META[tx.provider].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{statusBadge(tx.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground text-right">{tx.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

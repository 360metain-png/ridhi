import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/utils";
import {
  CreditCard, Wallet, Smartphone, Globe,
  CheckCircle, XCircle, AlertTriangle, Zap, RefreshCw,
} from "lucide-react";

type PayProvider = "razorpay" | "cashfree" | "phonepe" | "instamojo";

interface PayConfig {
  activeProvider: PayProvider;
  lastChangedAt: string;
  changedBy: string;
  providers: {
    razorpay: { available: boolean; configured: boolean };
    cashfree: { available: boolean; configured: boolean };
    phonepe:  { available: boolean; configured: boolean };
    instamojo:{ available: boolean; configured: boolean };
  };
}

const API_BASE = "/api";

async function fetchConfig(): Promise<PayConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/payment-config`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function setProvider(provider: PayProvider): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/payment-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-role": "super_admin",
      },
      body: JSON.stringify({ provider, changedBy: "super_admin" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function testProvider(provider: PayProvider): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/payments/provider`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.provider === provider;
  } catch {
    return false;
  }
}

const PROVIDER_META: Record<PayProvider, {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  features: string[];
}> = {
  razorpay: {
    label: "Razorpay",
    description: "Primary gateway — UPI, cards, netbanking, wallets",
    icon: CreditCard,
    color: "bg-blue-600",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    features: ["UPI", "Cards", "Netbanking", "Wallets", "EMI"],
  },
  cashfree: {
    label: "Cashfree",
    description: "Alternative gateway — low TDR, auto-collect",
    icon: Wallet,
    color: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    features: ["UPI", "Cards", "EMI", "Auto-Collect", "T+0 Settlement"],
  },
  phonepe: {
    label: "PhonePe",
    description: "Flipkart-owned — massive UPI market share",
    icon: Smartphone,
    color: "bg-indigo-600",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    features: ["UPI", "QR Code", "Cards", "Soundbox"],
  },
  instamojo: {
    label: "Instamojo",
    description: "SME-friendly — links, subscriptions, payouts",
    icon: Globe,
    color: "bg-green-600",
    badge: "bg-green-100 text-green-700 border-green-200",
    features: ["Payment Links", "Subscriptions", "Digital Products", "Payouts"],
  },
};

export default function PaymentProviderCard() {
  const [cfg, setCfg] = useState<PayConfig | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchConfig().then(setCfg);
  }, []);

  const handleSwitch = async (provider: PayProvider) => {
    if (cfg?.activeProvider === provider) return;
    if (!cfg?.providers[provider].available) {
      setError(`${PROVIDER_META[provider].label} is not configured. Please set the required environment variables first.`);
      setTimeout(() => setError(""), 4000);
      return;
    }
    setLoading(provider);
    setError("");
    setSuccess("");
    const ok = await setProvider(provider);
    if (ok) {
      const updated = await fetchConfig();
      setCfg(updated);
      setSuccess(`Switched to ${PROVIDER_META[provider].label}`);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError("Failed to switch provider.");
      setTimeout(() => setError(""), 3000);
    }
    setLoading(null);
  };

  const handleTest = async (provider: PayProvider) => {
    setTestLoading(provider);
    const ok = await testProvider(provider);
    if (ok) {
      setSuccess(`${PROVIDER_META[provider].label} is active and responding.`);
    } else {
      setError(`${PROVIDER_META[provider].label} test failed or not active.`);
    }
    setTestLoading(null);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const providers: PayProvider[] = ["razorpay", "cashfree", "phonepe", "instamojo"];
  const activeProvider = cfg?.activeProvider ?? "razorpay";

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600" />
            Payment Gateway Provider
          </CardTitle>
          <Badge
            variant="outline"
            className={
              cfg?.providers[activeProvider]?.available
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-amber-100 text-amber-700 border-amber-200"
            }
          >
            {cfg?.providers[activeProvider]?.available ? "Active" : "Not Configured"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {cfg
            ? `Current: ${PROVIDER_META[activeProvider].label} · Last changed ${new Date(cfg.lastChangedAt).toLocaleString()} by ${cfg.changedBy}`
            : "Loading configuration…"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 border border-green-200">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {providers.map((key) => {
            const meta = PROVIDER_META[key];
            const info = cfg?.providers[key];
            const isActive = activeProvider === key;
            const isAvailable = info?.available ?? false;
            const Icon = meta.icon;

            return (
              <div
                key={key}
                className={`relative rounded-xl border-2 p-4 transition-all ${
                  isActive
                    ? "border-blue-400 bg-blue-50/60 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                } ${!isAvailable ? "opacity-70" : ""}`}
              >
                {isActive && (
                  <div className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      <Zap size={10} /> ACTIVE
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.color} text-white`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900">{meta.label}</span>
                      {isAvailable ? (
                        <CheckCircle size={12} className="text-green-600 shrink-0" />
                      ) : (
                        <XCircle size={12} className="text-red-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{meta.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {meta.features.map((f) => (
                        <span key={f} className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant={isActive ? "default" : "outline"}
                        className={`h-7 text-xs ${isActive ? "bg-slate-800" : ""}`}
                        disabled={loading === key || isActive || !isAvailable}
                        onClick={() => handleSwitch(key)}
                      >
                        {loading === key ? (
                          <RefreshCw size={12} className="mr-1 animate-spin" />
                        ) : isActive ? (
                          <CheckCircle size={12} className="mr-1" />
                        ) : null}
                        {isActive ? "Active" : "Switch"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={testLoading === key}
                        onClick={() => handleTest(key)}
                      >
                        {testLoading === key ? (
                          <RefreshCw size={12} className="mr-1 animate-spin" />
                        ) : (
                          <Zap size={12} className="mr-1" />
                        )}
                        Test
                      </Button>
                    </div>
                    {!isAvailable && (
                      <p className="mt-1.5 text-[10px] text-red-500 font-medium">
                        Not configured — set env vars
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

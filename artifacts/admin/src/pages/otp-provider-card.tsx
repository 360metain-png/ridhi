import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/utils";
import {
  Smartphone, ShieldCheck, RefreshCw, CheckCircle, XCircle,
  AlertTriangle, Zap,
} from "lucide-react";

type OtpProvider = "msg91" | "firebase" | "auto";

interface OtpConfig {
  activeProvider: OtpProvider;
  lastChangedAt: string;
  changedBy: string;
  providers: {
    msg91: { available: boolean; configured: boolean };
    firebase: { available: boolean; configured: boolean };
  };
}

const API_BASE = "/api";

async function fetchConfig(): Promise<OtpConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/otp-config`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function setProvider(provider: OtpProvider): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/otp-config`, {
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

async function testProvider(provider: OtpProvider): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/otp-provider`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.provider === provider;
  } catch {
    return false;
  }
}

export default function OTPProviderCard() {
  const [config, setConfig] = useState<OtpConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, "ok" | "fail" | null>>({});

  useEffect(() => {
    fetchConfig().then(setConfig);
  }, []);

  const handleSwitch = async (provider: OtpProvider) => {
    setLoading(true);
    const ok = await setProvider(provider);
    if (ok) {
      const updated = await fetchConfig();
      setConfig(updated);
    }
    setLoading(false);
  };

  const handleTest = async (provider: OtpProvider) => {
    setTestStatus((s) => ({ ...s, [provider]: null }));
    const ok = await testProvider(provider);
    setTestStatus((s) => ({ ...s, [provider]: ok ? "ok" : "fail" }));
    setTimeout(() => setTestStatus((s) => ({ ...s, [provider]: null })), 3000);
  };

  const providers: { key: OtpProvider; label: string; desc: string; color: string; bg: string }[] = [
    {
      key: "msg91",
      label: "MSG91 SMS",
      desc: "India-focused SMS OTP via MSG91 gateway",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      key: "firebase",
      label: "Firebase Auth",
      desc: "Google Firebase Phone Auth with global reach",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      key: "auto",
      label: "Auto Fallback",
      desc: "Try Firebase first, fall back to MSG91 on failure",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          OTP Provider
          <Badge className="bg-purple-500 text-white text-xs ml-1">Super Admin</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {config && (
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Active:</span>
            <Badge
              variant="outline"
              className={
                config.activeProvider === "msg91"
                  ? "border-green-300 text-green-700 bg-green-50"
                  : config.activeProvider === "firebase"
                  ? "border-orange-300 text-orange-700 bg-orange-50"
                  : "border-purple-300 text-purple-700 bg-purple-50"
              }
            >
              {config.activeProvider.toUpperCase()}
            </Badge>
            <span>· Last changed {new Date(config.lastChangedAt).toLocaleString()} by {config.changedBy}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {providers.map((p) => {
            const active = config?.activeProvider === p.key;
            const available =
              p.key === "msg91"
                ? config?.providers.msg91.available
                : p.key === "firebase"
                ? config?.providers.firebase.available
                : true;

            return (
              <div
                key={p.key}
                className={`rounded-xl border p-4 flex flex-col gap-2 transition-all ${
                  active
                    ? "border-purple-300 bg-purple-50/50 shadow-sm"
                    : "border-muted bg-muted/20"
                } ${!available ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${p.bg}`}>
                    <Smartphone className={`w-4 h-4 ${p.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.label}</p>
                    <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {active ? (
                    <Badge className="bg-green-500 text-white text-[10px]">
                      <CheckCircle className="w-3 h-3 mr-0.5" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      <XCircle className="w-3 h-3 mr-0.5" /> Inactive
                    </Badge>
                  )}

                  {!available && (
                    <Badge variant="outline" className="text-[10px] border-red-200 text-red-600">
                      <AlertTriangle className="w-3 h-3 mr-0.5" /> Not Configured
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 mt-auto pt-2">
                  <Button
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="h-7 text-xs flex-1"
                    disabled={!available || active || loading}
                    onClick={() => handleSwitch(p.key)}
                  >
                    {loading && !active ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : active ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      "Switch"
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 px-2"
                    disabled={!available}
                    onClick={() => handleTest(p.key)}
                  >
                    {testStatus[p.key] === "ok" ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : testStatus[p.key] === "fail" ? (
                      <XCircle className="w-3 h-3 text-red-600" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                    Test
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border bg-muted/30 p-3 flex items-start gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Provider Switching</p>
            <p className="mt-0.5">
              Changing the active OTP provider affects <strong>all new login attempts immediately</strong>.
              Existing sessions are not affected. Email OTP always uses the built-in fallback.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

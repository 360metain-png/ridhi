import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Globe, Shield, Server, Zap, RefreshCw, Plus, Trash2,
  CheckCircle2, AlertTriangle, Clock, Copy, ExternalLink,
  CloudCog, Lock, Activity, HardDrive, Wifi,
} from "lucide-react";

const domains = [
  { id: 1, domain: "ridhi.app",          type: "Primary",    ssl: "Active",   expires: "2026-08-12", dns: "Propagated", cdn: true,  status: "active"  },
  { id: 2, domain: "www.ridhi.app",      type: "Redirect",   ssl: "Active",   expires: "2026-08-12", dns: "Propagated", cdn: true,  status: "active"  },
  { id: 3, domain: "api.ridhi.app",      type: "API",        ssl: "Active",   expires: "2026-08-12", dns: "Propagated", cdn: false, status: "active"  },
  { id: 4, domain: "cdn.ridhi.app",      type: "CDN",        ssl: "Active",   expires: "2026-08-12", dns: "Propagated", cdn: true,  status: "active"  },
  { id: 5, domain: "admin.ridhi.app",    type: "Admin",      ssl: "Active",   expires: "2026-08-12", dns: "Propagated", cdn: false, status: "active"  },
  { id: 6, domain: "staging.ridhi.app",  type: "Staging",    ssl: "Pending",  expires: "—",          dns: "Pending",    cdn: false, status: "pending" },
];

const dnsRecords = [
  { type: "A",     name: "@",              value: "104.21.48.230",                    ttl: "Auto",  status: "active" },
  { type: "A",     name: "www",            value: "104.21.48.230",                    ttl: "Auto",  status: "active" },
  { type: "A",     name: "api",            value: "172.67.183.12",                    ttl: "300",   status: "active" },
  { type: "CNAME", name: "cdn",            value: "ridhi.b-cdn.net",                  ttl: "Auto",  status: "active" },
  { type: "MX",    name: "@",              value: "aspmx.l.google.com (10)",          ttl: "3600",  status: "active" },
  { type: "TXT",   name: "@",              value: "v=spf1 include:_spf.google.com ~all", ttl: "3600", status: "active" },
  { type: "TXT",   name: "_dmarc",         value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@ridhi.app", ttl: "3600", status: "active" },
];

const cdnRegions = [
  { region: "Mumbai (ap-south-1)",       latency: 12,  requests: "4.2M",  bandwidth: "182 GB", status: "healthy" },
  { region: "Singapore (ap-southeast-1)",latency: 38,  requests: "1.1M",  bandwidth: "48 GB",  status: "healthy" },
  { region: "Frankfurt (eu-central-1)",  latency: 142, requests: "0.3M",  bandwidth: "11 GB",  status: "healthy" },
  { region: "Virginia (us-east-1)",      latency: 198, requests: "0.2M",  bandwidth: "8 GB",   status: "degraded" },
];

const sslCerts = [
  { domain: "*.ridhi.app",    issuer: "Let's Encrypt",  issued: "2025-08-12", expires: "2026-08-12", daysLeft: 83, autoRenew: true  },
  { domain: "api.ridhi.app",  issuer: "Let's Encrypt",  issued: "2025-08-12", expires: "2026-08-12", daysLeft: 83, autoRenew: true  },
  { domain: "ridhi.app",      issuer: "Let's Encrypt",  issued: "2025-08-12", expires: "2026-08-12", daysLeft: 83, autoRenew: true  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "active"   || status === "healthy")   return <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" />Active</Badge>;
  if (status === "pending"  || status === "degraded")  return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1"><Clock className="w-3 h-3" />{ status === "degraded" ? "Degraded" : "Pending" }</Badge>;
  return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Error</Badge>;
}

export default function DomainHosting() {
  const [newDomain, setNewDomain] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function copyVal(val: string, idx: number) {
    navigator.clipboard.writeText(val);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" /> Domain & Hosting
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage domains, SSL, CDN, and hosting infrastructure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Refresh DNS</Button>
          <Button size="sm" className="gap-1.5 bg-purple-600 hover:bg-purple-700"><Plus className="w-3.5 h-3.5" />Add Domain</Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Domains",   value: "5",       sub: "1 pending",       icon: Globe,    color: "text-purple-600", bg: "bg-purple-50" },
          { label: "SSL Certificates", value: "3",       sub: "All valid",        icon: Lock,     color: "text-green-600",  bg: "bg-green-50"  },
          { label: "CDN Bandwidth",    value: "249 GB",  sub: "This month",       icon: Zap,      color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Uptime (30d)",     value: "99.97%",  sub: "1.2 min downtime", icon: Activity, color: "text-pink-600",   bg: "bg-pink-50"   },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4 flex gap-3 items-start">
              <div className={`p-2.5 rounded-lg ${k.bg}`}><k.icon className={`w-4 h-4 ${k.color}`} /></div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-xl font-bold">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="domains">
        <TabsList className="h-9">
          <TabsTrigger value="domains"  className="text-xs gap-1.5"><Globe    className="w-3.5 h-3.5" />Domains</TabsTrigger>
          <TabsTrigger value="ssl"      className="text-xs gap-1.5"><Shield   className="w-3.5 h-3.5" />SSL</TabsTrigger>
          <TabsTrigger value="dns"      className="text-xs gap-1.5"><Wifi     className="w-3.5 h-3.5" />DNS Records</TabsTrigger>
          <TabsTrigger value="cdn"      className="text-xs gap-1.5"><Zap      className="w-3.5 h-3.5" />CDN & Regions</TabsTrigger>
          <TabsTrigger value="hosting"  className="text-xs gap-1.5"><Server   className="w-3.5 h-3.5" />Hosting Config</TabsTrigger>
        </TabsList>

        {/* ─── DOMAINS ─── */}
        <TabsContent value="domains" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm">Registered Domains</CardTitle>
              <div className="flex gap-2">
                <Input value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="example.com" className="h-8 text-xs w-44" />
                <Button size="sm" className="h-8 gap-1 bg-purple-600 hover:bg-purple-700"><Plus className="w-3.5 h-3.5" />Add</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    {["Domain","Type","SSL","DNS","CDN","Expires","Status",""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {domains.map(d => (
                    <tr key={d.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-xs flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        {d.domain}
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{d.type}</Badge></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${d.ssl === "Active" ? "text-green-600" : "text-yellow-600"}`}>
                          {d.ssl === "Active" ? <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> : <Clock className="w-3.5 h-3.5 inline mr-1" />}
                          {d.ssl}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${d.dns === "Propagated" ? "text-green-600" : "text-yellow-600"}`}>{d.dns}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Switch checked={d.cdn} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.expires}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SSL ─── */}
        <TabsContent value="ssl" className="mt-4 space-y-4">
          <div className="grid gap-4">
            {sslCerts.map((cert, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-green-50"><Shield className="w-5 h-5 text-green-600" /></div>
                      <div>
                        <p className="font-semibold text-sm">{cert.domain}</p>
                        <p className="text-xs text-muted-foreground">Issued by {cert.issuer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Expires</p>
                        <p className="text-sm font-medium">{cert.expires}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">{cert.daysLeft} days left</Badge>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Certificate validity</span>
                      <span>{cert.daysLeft}/365 days remaining</span>
                    </div>
                    <Progress value={(cert.daysLeft / 365) * 100} className="h-1.5" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Auto-renew: <span className={cert.autoRenew ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{cert.autoRenew ? "Enabled" : "Disabled"}</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><RefreshCw className="w-3 h-3" />Force Renew</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4" />Add Custom Certificate</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Certificate (PEM)</Label>
                  <textarea className="w-full h-28 text-xs border rounded-md p-2 font-mono bg-muted/30 resize-none" placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Private Key (PEM)</Label>
                  <textarea className="w-full h-28 text-xs border rounded-md p-2 font-mono bg-muted/30 resize-none" placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----" />
                </div>
              </div>
              <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">Upload Certificate</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── DNS ─── */}
        <TabsContent value="dns" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm">DNS Records — ridhi.app</CardTitle>
              <Button size="sm" className="h-8 gap-1 bg-purple-600 hover:bg-purple-700"><Plus className="w-3.5 h-3.5" />Add Record</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    {["Type","Name","Value","TTL","Status",""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dnsRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs font-mono ${r.type === "A" ? "border-blue-300 text-blue-700" : r.type === "CNAME" ? "border-green-300 text-green-700" : r.type === "MX" ? "border-orange-300 text-orange-700" : "border-purple-300 text-purple-700"}`}>{r.type}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{r.name}</td>
                      <td className="px-4 py-3 font-mono text-xs max-w-[260px] truncate text-muted-foreground">{r.value}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.ttl}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyVal(r.value, i)}>
                            {copiedIdx === i ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── CDN ─── */}
        <TabsContent value="cdn" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {cdnRegions.map((r) => (
              <Card key={r.region}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${r.status === "healthy" ? "bg-green-50" : "bg-yellow-50"}`}>
                      <CloudCog className={`w-4 h-4 ${r.status === "healthy" ? "text-green-600" : "text-yellow-600"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.region}</p>
                      <p className="text-xs text-muted-foreground">{r.requests} requests · {r.bandwidth}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Latency</p>
                    <p className={`text-lg font-bold ${r.latency < 50 ? "text-green-600" : r.latency < 100 ? "text-yellow-600" : "text-red-600"}`}>{r.latency}ms</p>
                    <StatusBadge status={r.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-purple-500" />CDN Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Image Optimisation",          sub: "Auto compress & convert to WebP",        on: true  },
                { label: "HTTP/3 (QUIC)",               sub: "Enable next-gen transport protocol",     on: true  },
                { label: "Brotli Compression",          sub: "Compress text assets with Brotli",       on: true  },
                { label: "Cache Purge on Deploy",       sub: "Automatically purge CDN on new deploys", on: true  },
                { label: "Always Online Mode",          sub: "Serve cached page on origin failure",    on: false },
                { label: "Bot Fight Mode",              sub: "Challenge bot traffic automatically",     on: true  },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                  <Switch defaultChecked={s.on} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── HOSTING CONFIG ─── */}
        <TabsContent value="hosting" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Server className="w-4 h-4 text-purple-500" />Compute Instances</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "api-server-1",  type: "c2-standard-4", region: "Mumbai",    cpu: 34, ram: 58, status: "running" },
                  { name: "api-server-2",  type: "c2-standard-4", region: "Mumbai",    cpu: 28, ram: 51, status: "running" },
                  { name: "media-worker",  type: "n2-highmem-4",  region: "Mumbai",    cpu: 71, ram: 82, status: "running" },
                  { name: "cron-runner",   type: "e2-micro",       region: "Singapore", cpu: 5,  ram: 22, status: "running" },
                ].map((inst) => (
                  <div key={inst.name} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium font-mono">{inst.name}</span>
                        <Badge variant="outline" className="text-xs">{inst.type}</Badge>
                      </div>
                      <StatusBadge status={inst.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">CPU</span><span>{inst.cpu}%</span></div>
                        <Progress value={inst.cpu} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">RAM</span><span>{inst.ram}%</span></div>
                        <Progress value={inst.ram} className="h-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><CloudCog className="w-4 h-4 text-purple-500" />Deploy Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Primary Region</Label>
                  <Input defaultValue="ap-south-1 (Mumbai)" className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Replica Region</Label>
                  <Input defaultValue="ap-southeast-1 (Singapore)" className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max Instances (Auto-scale)</Label>
                  <Input defaultValue="8" type="number" className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Min Instances (Always-on)</Label>
                  <Input defaultValue="2" type="number" className="h-8 text-xs" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Zero-downtime Deploys</p>
                    <p className="text-xs text-muted-foreground">Rolling update strategy</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Health Check Auto-restart</p>
                    <p className="text-xs text-muted-foreground">Restart unhealthy pods</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">Save Hosting Config</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

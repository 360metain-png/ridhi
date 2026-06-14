import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Plus, Eye, MousePointer, LayoutTemplate, Layers, Users, Star,
  Pencil, Trash2, Play, Pause, X, BarChart3, Zap, Crown, Clock,
  ImageIcon, Palette, AlignLeft, Target, Calendar, TrendingUp, IndianRupee, Download} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { downloadCSV } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tier     = "Diamond" | "Gold" | "Premium";
type AdStatus = "active" | "paused" | "draft" | "scheduled" | "ended";
type BgType   = "gradient" | "solid" | "image";
type PopupType = "center" | "fullscreen" | "bottomsheet";
type Frequency = "once" | "daily" | "every_open";

interface SpecialClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tier: Tier;
  joinedAt: string;
  activeCampaigns: number;
  totalSpend: string;
}

interface BannerAd {
  id: string;
  title: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  bgType: BgType;
  gradient: [string, string];
  bgColor: string;
  imageUrl: string;
  textColor: "white" | "dark";
  clientId: string;
  position: "feed" | "top" | "bottom";
  startDate: string;
  endDate: string;
  status: AdStatus;
  impressions: number;
  clicks: number;
}

interface PopupAd {
  id: string;
  title: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  bgType: BgType;
  gradient: [string, string];
  bgColor: string;
  imageUrl: string;
  textColor: "white" | "dark";
  clientId: string;
  popupType: PopupType;
  dismissAfter: number;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  status: AdStatus;
  impressions: number;
  clicks: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_CLIENTS: SpecialClient[] = [
  { id: "sc1", name: "Arjun Malhotra",     email: "arjun@malhotra.in",  phone: "+91 98201 11223", city: "Mumbai",    tier: "Diamond", joinedAt: "Jan 2024", activeCampaigns: 3, totalSpend: "₹4,80,000" },
  { id: "sc2", name: "Priya Kapoor",       email: "priya@pkcorp.com",    phone: "+91 99110 44556", city: "Delhi",     tier: "Gold",    joinedAt: "Mar 2024", activeCampaigns: 2, totalSpend: "₹2,40,000" },
  { id: "sc3", name: "Nisha Shah",         email: "nisha@shahgroup.com", phone: "+91 97229 88770", city: "Ahmedabad", tier: "Diamond", joinedAt: "Dec 2023", activeCampaigns: 4, totalSpend: "₹6,12,000" },
  { id: "sc4", name: "Vikram Reddy",       email: "vikram@vtech.io",     phone: "+91 90001 55678", city: "Hyderabad", tier: "Gold",    joinedAt: "Feb 2024", activeCampaigns: 1, totalSpend: "₹1,20,000" },
  { id: "sc5", name: "Kavitha Krishnan",   email: "kavi@kkcorp.com",     phone: "+91 88991 22334", city: "Bengaluru", tier: "Premium", joinedAt: "Apr 2024", activeCampaigns: 2, totalSpend: "₹96,000"   },
  { id: "sc6", name: "Rohit Bansal",       email: "rohit@bansal.in",     phone: "+91 77118 99001", city: "Jaipur",    tier: "Gold",    joinedAt: "May 2024", activeCampaigns: 0, totalSpend: "₹0"         },
];

const INITIAL_BANNERS: BannerAd[] = [
  {
    id: "b1", title: "Diamond Coins Triple Offer",
    headline: "💎 Diamond Members: 3× Coins Today!", body: "Recharge any pack and triple your coins. Exclusive Diamond member offer.",
    ctaText: "Claim Now", ctaLink: "/wallet",
    bgType: "gradient", gradient: ["#7B2FBE", "#E91E8C"], bgColor: "#7B2FBE", imageUrl: "",
    textColor: "white", clientId: "sc1", position: "feed",
    startDate: "2025-05-01", endDate: "2025-06-30", status: "active",
    impressions: 48200, clicks: 3610,
  },
  {
    id: "b2", title: "Priya Fashion Week Banner",
    headline: "🛍️ Flat 50% Off — Fashion Week Sale!", body: "Shop the hottest Indian fashion brands on our partner stores.",
    ctaText: "Shop Now", ctaLink: "#",
    bgType: "gradient", gradient: ["#FF6B35", "#F7C59F"], bgColor: "#FF6B35", imageUrl: "",
    textColor: "white", clientId: "sc2", position: "feed",
    startDate: "2025-05-15", endDate: "2025-05-31", status: "active",
    impressions: 31500, clicks: 2240,
  },
  {
    id: "b3", title: "Nisha Shah — New Year Special",
    headline: "🎉 New Year New You — Special Member Deals", body: "Exclusive deals curated just for our premium members. Limited slots available.",
    ctaText: "Explore Deals", ctaLink: "#",
    bgType: "gradient", gradient: ["#1D4ED8", "#06B6D4"], bgColor: "#1D4ED8", imageUrl: "",
    textColor: "white", clientId: "sc3", position: "feed",
    startDate: "2025-05-10", endDate: "2025-06-15", status: "paused",
    impressions: 12800, clicks: 890,
  },
];

const INITIAL_POPUPS: PopupAd[] = [
  {
    id: "p1", title: "Diwali VIP Welcome Popup",
    headline: "🪔 Diwali Exclusive for You!", body: "As our Diamond VIP, you get 2× coins + free Premium upgrade for 7 days. Your exclusive Diwali gift is ready!",
    ctaText: "Claim My Gift", ctaLink: "/wallet",
    bgType: "gradient", gradient: ["#7B2FBE", "#E91E8C"], bgColor: "#7B2FBE", imageUrl: "",
    textColor: "white", clientId: "sc1",
    popupType: "center", dismissAfter: 0, frequency: "once",
    startDate: "2025-10-20", endDate: "2025-11-05", status: "scheduled",
    impressions: 8400, clicks: 6120,
  },
  {
    id: "p2", title: "Flash Sale Interstitial",
    headline: "⚡ 4-Hour Flash Sale Ends Soon!", body: "500 coins for just ₹149! This deal disappears at midnight. Tap to grab it before it's gone!",
    ctaText: "Buy Now — ₹149", ctaLink: "/wallet",
    bgType: "gradient", gradient: ["#FF9500", "#FF3B30"], bgColor: "#FF9500", imageUrl: "",
    textColor: "white", clientId: "sc3",
    popupType: "center", dismissAfter: 5, frequency: "daily",
    startDate: "2025-05-18", endDate: "2025-05-18", status: "active",
    impressions: 22100, clicks: 9800,
  },
  {
    id: "p3", title: "Premium Upgrade Sheet",
    headline: "👑 Upgrade to Gold — 50% Off Today", body: "Unlock unlimited likes, profile boosts, and priority matching for half the price. Offer for existing users only.",
    ctaText: "Upgrade Now", ctaLink: "/wallet",
    bgType: "gradient", gradient: ["#FFB800", "#FF9500"], bgColor: "#FFB800", imageUrl: "",
    textColor: "white", clientId: "sc2",
    popupType: "bottomsheet", dismissAfter: 3, frequency: "once",
    startDate: "2025-05-20", endDate: "2025-05-27", status: "draft",
    impressions: 0, clicks: 0,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_META: Record<AdStatus, { label: string; cls: string }> = {
  active:    { label: "Active",    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  paused:    { label: "Paused",    cls: "bg-amber-500/15 text-amber-400 border-amber-500/20"       },
  draft:     { label: "Draft",     cls: "bg-muted/60 text-muted-foreground border-border"           },
  scheduled: { label: "Scheduled", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20"          },
  ended:     { label: "Ended",     cls: "bg-muted/40 text-muted-foreground/60 border-border/50"    },
};

const TIER_META: Record<Tier, { cls: string }> = {
  Diamond: { cls: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  Gold:    { cls: "bg-amber-500/15 text-amber-400 border-amber-500/20"    },
  Premium: { cls: "bg-pink-500/15 text-pink-400 border-pink-500/20"       },
};

function ctr(impressions: number, clicks: number): string {
  if (!impressions) return "0.0%";
  return ((clicks / impressions) * 100).toFixed(1) + "%";
}

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// ── Mobile Preview ────────────────────────────────────────────────────────────
function MobilePreview({
  headline, body, ctaText, gradient, textColor, type = "banner",
}: {
  headline: string; body: string; ctaText: string;
  gradient: [string, string]; textColor: "white" | "dark"; type?: "banner" | "popup";
}) {
  const tc = textColor === "white" ? "#fff" : "#111";
  const mc = textColor === "white" ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.55)";

  if (type === "popup") {
    return (
      <div className="mx-auto" style={{ width: 200 }}>
        <div className="bg-zinc-900 rounded-3xl p-3 shadow-2xl border border-zinc-700">
          <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, padding: "16px 14px" }}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.22)", color: mc }}>Diamond · Sponsored</span>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
                <X className="w-2.5 h-2.5" style={{ color: mc }} />
              </div>
            </div>
            <p className="font-bold text-[13px] leading-tight mb-2" style={{ color: tc }}>{headline || "Your popup headline"}</p>
            <p className="text-[10px] leading-snug mb-4" style={{ color: mc }}>{body || "Your popup message appears here with details about the offer."}</p>
            <div className="rounded-xl py-2.5 px-4 text-center text-[11px] font-bold" style={{ backgroundColor: "rgba(255,255,255,0.25)", color: tc }}>
              {ctaText || "Claim Now"}
            </div>
            <p className="text-center text-[9px] mt-2" style={{ color: mc }}>Not now</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto" style={{ width: 220 }}>
      <div className="bg-zinc-900 rounded-3xl p-3 shadow-2xl border border-zinc-700">
        <div className="space-y-2 mb-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-zinc-800 rounded-xl h-14 flex items-center px-3 gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex-shrink-0" />
              <div className="flex-1 space-y-1"><div className="h-2 bg-zinc-700 rounded w-2/3" /><div className="h-1.5 bg-zinc-700 rounded w-full opacity-50" /></div>
            </div>
          ))}
        </div>
        <div className="rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, padding: "12px 12px" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.22)", color: mc }}>⚡ Sponsored</span>
            <X className="w-2.5 h-2.5" style={{ color: mc }} />
          </div>
          <p className="font-bold text-[11px] leading-tight mb-1" style={{ color: tc }}>{headline || "Your headline appears here"}</p>
          <p className="text-[9px] leading-snug mb-3 opacity-80" style={{ color: mc }}>{body || "Short description of your offer."}</p>
          <div className="rounded-full py-1.5 px-3 text-center text-[9px] font-bold inline-block" style={{ backgroundColor: "rgba(255,255,255,0.25)", color: tc }}>
            {ctaText || "Learn More"} →
          </div>
        </div>
        <div className="space-y-2 mt-2">
          <div className="bg-zinc-800 rounded-xl h-14 flex items-center px-3 gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex-shrink-0" />
            <div className="flex-1 space-y-1"><div className="h-2 bg-zinc-700 rounded w-3/4" /><div className="h-1.5 bg-zinc-700 rounded w-1/2 opacity-50" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ad Form Modal ─────────────────────────────────────────────────────────────
function AdFormModal({
  open, onClose, onSave, initial, clients, mode,
}: {
  open: boolean; onClose: () => void;
  onSave: (data: Partial<BannerAd & PopupAd>) => void;
  initial?: Partial<BannerAd & PopupAd>;
  clients: SpecialClient[];
  mode: "banner" | "popup";
}) {
  const { toast } = useToast();
  const [title,        setTitle]        = useState(initial?.title ?? "");
  const [headline,     setHeadline]     = useState(initial?.headline ?? "");
  const [body,         setBody]         = useState(initial?.body ?? "");
  const [ctaText,      setCtaText]      = useState(initial?.ctaText ?? "");
  const [ctaLink,      setCtaLink]      = useState(initial?.ctaLink ?? "/wallet");
  const [color1,       setColor1]       = useState((initial?.gradient?.[0]) ?? "#7B2FBE");
  const [color2,       setColor2]       = useState((initial?.gradient?.[1]) ?? "#E91E8C");
  const [textColor,    setTextColor]    = useState<"white"|"dark">(initial?.textColor ?? "white");
  const [clientId,     setClientId]     = useState(initial?.clientId ?? clients[0]?.id ?? "");
  const [position,     setPosition]     = useState<"feed"|"top"|"bottom">((initial as BannerAd)?.position ?? "feed");
  const [popupType,    setPopupType]    = useState<PopupType>((initial as PopupAd)?.popupType ?? "center");
  const [dismissAfter, setDismissAfter] = useState<number>((initial as PopupAd)?.dismissAfter ?? 0);
  const [frequency,    setFrequency]    = useState<Frequency>((initial as PopupAd)?.frequency ?? "once");
  const [startDate,    setStartDate]    = useState(initial?.startDate ?? "");
  const [endDate,      setEndDate]      = useState(initial?.endDate ?? "");
  const [loading,      setLoading]      = useState(false);

  const gradient: [string, string] = [color1, color2];

  const handleSave = async () => {
    if (!title.trim() || !headline.trim() || !ctaText.trim()) {
      toast({ title: "Missing fields", description: "Fill in title, headline and CTA.", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onSave({ title, headline, body, ctaText, ctaLink, gradient, textColor, clientId, position, popupType, dismissAfter, frequency, startDate, endDate, status: "draft", impressions: 0, clicks: 0 });
    toast({ title: initial?.id ? "✅ Ad Updated" : "✅ Ad Created", description: `"${title}" saved as draft.` });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            {mode === "banner" ? <LayoutTemplate className="w-4 h-4 text-primary" /> : <Layers className="w-4 h-4 text-primary" />}
            {initial?.id ? "Edit" : "New"} {mode === "banner" ? "Banner Ad" : "Popup Ad"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 py-2">
          <div className="lg:col-span-3 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />Campaign Title (internal)</Label>
              <Input placeholder="e.g. Diwali 2025 — Diamond VIP" className="bg-background border-border" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Headline</Label>
              <Input placeholder="e.g. 🪔 Exclusive Diwali Offer — 2× Coins!" className="bg-background border-border" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={70} />
              <p className="text-xs text-muted-foreground text-right">{headline.length}/70</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Body Text</Label>
              <Textarea placeholder="Short message…" className="bg-background border-border resize-none" rows={3} value={body} onChange={(e) => setBody(e.target.value)} maxLength={160} />
              <p className="text-xs text-muted-foreground text-right">{body.length}/160</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">CTA Button Text</Label>
                <Input placeholder="e.g. Claim Now" className="bg-background border-border" value={ctaText} onChange={(e) => setCtaText(e.target.value)} maxLength={24} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">CTA Link / Route</Label>
                <Input placeholder="/wallet or /creator-deals" className="bg-background border-border font-mono text-sm" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-muted-foreground" />Background Gradient</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Color 1</label>
                  <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border border-border bg-background" />
                  <span className="text-xs font-mono text-muted-foreground">{color1}</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Color 2</label>
                  <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border border-border bg-background" />
                  <span className="text-xs font-mono text-muted-foreground">{color2}</span>
                </div>
              </div>
              <div className="h-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Text Color</Label>
                <Select value={textColor} onValueChange={(v) => setTextColor(v as "white"|"dark")}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White text</SelectItem>
                    <SelectItem value="dark">Dark text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-amber-400" />Special Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} <span className="text-muted-foreground text-xs">({c.tier})</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {mode === "banner" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-muted-foreground" />Ad Position</Label>
                <Select value={position} onValueChange={(v) => setPosition(v as "feed"|"top"|"bottom")}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">In-Feed (between posts)</SelectItem>
                    <SelectItem value="top">Top Banner</SelectItem>
                    <SelectItem value="bottom">Bottom Banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {mode === "popup" && (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Popup Style</Label>
                  <Select value={popupType} onValueChange={(v) => setPopupType(v as PopupType)}>
                    <SelectTrigger className="bg-background border-border text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center Modal</SelectItem>
                      <SelectItem value="fullscreen">Full Screen</SelectItem>
                      <SelectItem value="bottomsheet">Bottom Sheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Dismiss After</Label>
                  <Select value={String(dismissAfter)} onValueChange={(v) => setDismissAfter(Number(v))}>
                    <SelectTrigger className="bg-background border-border text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Manual only</SelectItem>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Frequency</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                    <SelectTrigger className="bg-background border-border text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once per user</SelectItem>
                      <SelectItem value="daily">Once daily</SelectItem>
                      <SelectItem value="every_open">Every open</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" />Start Date</Label>
                <Input type="date" className="bg-background border-border" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" />End Date</Label>
                <Input type="date" className="bg-background border-border" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-muted-foreground" />Live Preview</Label>
              <div className="mt-3">
                <MobilePreview headline={headline} body={body} ctaText={ctaText} gradient={gradient} textColor={textColor} type={mode} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="border-border"><X className="w-3.5 h-3.5 mr-1.5" />Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={loading}>
            {loading
              ? <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />Saving…</span>
              : <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5" />{initial?.id ? "Update Ad" : "Create Ad"}</span>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Banner Ads Tab ────────────────────────────────────────────────────────────
function BannerAdsTab({ clients }: { clients: SpecialClient[] }) {
  const { toast } = useToast();
  const [ads, setAds]         = useState<BannerAd[]>(INITIAL_BANNERS);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<BannerAd | undefined>();

  const toggle = (id: string) => {
    setAds(ads.map((a) => {
      if (a.id !== id) return a;
      const next = a.status === "active" ? "paused" : "active";
      toast({ title: next === "active" ? "▶ Banner Activated" : "⏸ Banner Paused" });
      return { ...a, status: next };
    }));
  };

  const del = (id: string) => {
    setAds(ads.filter((a) => a.id !== id));
    toast({ title: "🗑 Banner deleted" });
  };

  const saveAd = (data: Partial<BannerAd>) => {
    if (editing) {
      setAds(ads.map((a) => a.id === editing.id ? { ...a, ...data } : a));
    } else {
      setAds([{ id: `b-${Date.now()}`, ...data } as BannerAd, ...ads]);
    }
    setEditing(undefined);
  };

  return (
    <>
      {(showForm || editing) && (
        <AdFormModal open mode="banner" clients={clients} initial={editing} onClose={() => { setShowForm(false); setEditing(undefined); }} onSave={saveAd} />
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Dynamic banner ads shown in-feed, top, or bottom of the app for special clients.</p>
          <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-xs" onClick={() => setShowForm(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> New Banner Ad
          </Button>
        </div>
        <div className="grid gap-4">
          {ads.map((ad) => {
            const client = clients.find((c) => c.id === ad.clientId);
            const sm = STATUS_META[ad.status];
            return (
              <Card key={ad.id} className="bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-48 h-28 sm:h-auto flex-shrink-0 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none overflow-hidden" style={{ background: `linear-gradient(135deg, ${ad.gradient[0]}, ${ad.gradient[1]})` }}>
                      <div className="w-full h-full flex flex-col justify-center px-4 py-3 gap-1">
                        <p className="text-white text-xs font-bold leading-tight line-clamp-2">{ad.headline}</p>
                        <div className="inline-block bg-white/25 rounded-full px-3 py-1 text-white text-[10px] font-bold w-fit">{ad.ctaText}</div>
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{ad.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs border ${sm.cls}`}>{sm.label}</Badge>
                            <Badge variant="outline" className="text-xs border-border text-muted-foreground capitalize">{ad.position}</Badge>
                            {client && <Badge className={`text-xs border ${TIER_META[client.tier].cls}`}>{client.tier}</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => { setEditing(ad); }} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          {ad.status !== "ended" && (
                            <button onClick={() => toggle(ad.id)} className={`p-1.5 rounded-md hover:bg-muted/60 transition-colors ${ad.status === "active" ? "text-amber-400" : "text-emerald-400"}`}>
                              {ad.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button onClick={() => del(ad.id)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "Impressions", value: fmt(ad.impressions), icon: Eye          },
                          { label: "Clicks",       value: fmt(ad.clicks),       icon: MousePointer },
                          { label: "CTR",          value: ctr(ad.impressions, ad.clicks), icon: BarChart3 },
                          { label: "Client",       value: client?.name?.split(" ")[0] ?? "—", icon: Users },
                        ].map((s) => (
                          <div key={s.label}>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><s.icon className="w-3 h-3" />{s.label}</p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{s.value}</p>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">{client?.name}</span> · {ad.startDate} → {ad.endDate}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Popup Ads Tab ─────────────────────────────────────────────────────────────
function PopupAdsTab({ clients }: { clients: SpecialClient[] }) {
  const { toast } = useToast();
  const [ads, setAds]           = useState<PopupAd[]>(INITIAL_POPUPS);
  const [showForm, setShowForm]  = useState(false);
  const [editing,  setEditing]   = useState<PopupAd | undefined>();

  const toggle = (id: string) => {
    setAds(ads.map((a) => {
      if (a.id !== id) return a;
      const next = a.status === "active" ? "paused" : "active";
      toast({ title: next === "active" ? "▶ Popup Activated" : "⏸ Popup Paused" });
      return { ...a, status: next };
    }));
  };

  const del = (id: string) => {
    setAds(ads.filter((a) => a.id !== id));
    toast({ title: "🗑 Popup deleted" });
  };

  const saveAd = (data: Partial<PopupAd>) => {
    if (editing) {
      setAds(ads.map((a) => a.id === editing.id ? { ...a, ...data } : a));
    } else {
      setAds([{ id: `p-${Date.now()}`, ...data } as PopupAd, ...ads]);
    }
    setEditing(undefined);
  };

  const FREQ_LABEL: Record<Frequency, string> = { once: "Once/user", daily: "Daily", every_open: "Every open" };
  const TYPE_LABEL: Record<PopupType, string> = { center: "Center Modal", fullscreen: "Full Screen", bottomsheet: "Bottom Sheet" };

  return (
    <>
      {(showForm || editing) && (
        <AdFormModal open mode="popup" clients={clients} initial={editing} onClose={() => { setShowForm(false); setEditing(undefined); }} onSave={saveAd} />
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Dynamic popup and interstitial ads shown on app open or screen transitions.</p>
          <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-xs" onClick={() => setShowForm(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> New Popup Ad
          </Button>
        </div>
        <div className="grid gap-4">
          {ads.map((ad) => {
            const client = clients.find((c) => c.id === ad.clientId);
            const sm = STATUS_META[ad.status];
            return (
              <Card key={ad.id} className="bg-card border-border overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-20 rounded-xl flex-shrink-0 flex flex-col justify-between p-2" style={{ background: `linear-gradient(135deg, ${ad.gradient[0]}, ${ad.gradient[1]})` }}>
                      <div className="text-white text-[8px] font-bold leading-tight">{ad.headline?.slice(0, 20) || "Popup"}</div>
                      <div className="bg-white/25 rounded px-1.5 py-0.5 text-white text-[7px] font-bold text-center">{ad.ctaText}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{ad.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className={`text-xs border ${sm.cls}`}>{sm.label}</Badge>
                            <Badge variant="outline" className="text-xs border-border text-muted-foreground">{TYPE_LABEL[ad.popupType]}</Badge>
                            <Badge variant="outline" className="text-xs border-border text-muted-foreground">{FREQ_LABEL[ad.frequency]}</Badge>
                            {ad.dismissAfter > 0 && <Badge variant="outline" className="text-xs border-border text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{ad.dismissAfter}s</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => setEditing(ad)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                          {ad.status !== "ended" && (
                            <button onClick={() => toggle(ad.id)} className={`p-1.5 rounded-md hover:bg-muted/60 ${ad.status === "active" ? "text-amber-400" : "text-emerald-400"}`}>
                              {ad.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button onClick={() => del(ad.id)} className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        {[
                          { label: "Impressions", value: fmt(ad.impressions) },
                          { label: "Clicks",       value: fmt(ad.clicks)       },
                          { label: "CTR",          value: ctr(ad.impressions, ad.clicks) },
                        ].map((s) => (
                          <div key={s.label}>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{s.value}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2"><span className="text-foreground font-medium">{client?.name}</span> · {ad.startDate} → {ad.endDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Special Clients Tab ───────────────────────────────────────────────────────
function SpecialClientsTab({ clients, setClients }: { clients: SpecialClient[]; setClients: (c: SpecialClient[]) => void }) {
  const { toast } = useToast();
  const [showAdd, setShowAdd]   = useState(false);
  const [newName, setNewName]   = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCity,  setNewCity]  = useState("");
  const [newTier,  setNewTier]  = useState<Tier>("Gold");

  const addClient = () => {
    if (!newName.trim()) return;
    const c: SpecialClient = {
      id: `sc-${Date.now()}`, name: newName, email: newEmail, phone: newPhone,
      city: newCity, tier: newTier, joinedAt: "May 2025", activeCampaigns: 0, totalSpend: "₹0",
    };
    setClients([...clients, c]);
    toast({ title: "✅ Client Added", description: `${newName} added as a Special Client.` });
    setNewName(""); setNewEmail(""); setNewPhone(""); setNewCity(""); setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Special clients get exclusive banner and popup ads on the Ridhi app.</p>
        <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-xs" onClick={() => setShowAdd(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Client
        </Button>
      </div>

      {showAdd && (
        <Card className="bg-card border-primary/30">
          <CardHeader className="pb-3"><CardTitle className="text-sm">New Special Client</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input placeholder="Full name" className="bg-background border-border" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Email" className="bg-background border-border" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <Input placeholder="Phone" className="bg-background border-border" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            <Input placeholder="City" className="bg-background border-border" value={newCity} onChange={(e) => setNewCity(e.target.value)} />
            <Select value={newTier} onValueChange={(v) => setNewTier(v as Tier)}>
              <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Diamond">Diamond</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={addClient}>Add</Button>
              <Button size="sm" variant="outline" className="border-border" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {clients.map((c) => (
          <Card key={c.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0" style={{ background: `linear-gradient(135deg,#7B2FBE,#E91E8C)` }}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-foreground">{c.name}</p>
                    <Badge className={`text-xs border ${TIER_META[c.tier].cls} flex items-center gap-1`}><Crown className="w-2.5 h-2.5" />{c.tier}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.email} · {c.phone} · {c.city}</p>
                </div>
                <div className="hidden sm:grid grid-cols-3 gap-6 text-center flex-shrink-0">
                  <div><p className="text-xs text-muted-foreground">Active Ads</p><p className="text-sm font-bold text-foreground">{c.activeCampaigns}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total Spend</p><p className="text-sm font-bold text-foreground">{c.totalSpend}</p></div>
                  <div><p className="text-xs text-muted-foreground">Since</p><p className="text-sm font-bold text-foreground">{c.joinedAt}</p></div>
                </div>
                <button
                  onClick={() => { setClients(clients.filter((x) => x.id !== c.id)); toast({ title: "Client removed" }); }}
                  className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SpecialAdsPage() {
  const [clients, setClients] = useState<SpecialClient[]>(INITIAL_CLIENTS);

  const totalBanners  = INITIAL_BANNERS.length;
  const totalPopups   = INITIAL_POPUPS.length;
  const activeCount   = [...INITIAL_BANNERS, ...INITIAL_POPUPS].filter((a) => a.status === "active").length;
  const totalImpr     = [...INITIAL_BANNERS, ...INITIAL_POPUPS].reduce((s, a) => s + a.impressions, 0);
  const totalClicks   = [...INITIAL_BANNERS, ...INITIAL_POPUPS].reduce((s, a) => s + a.clicks, 0);
  const avgCtr        = totalImpr ? ((totalClicks / totalImpr) * 100).toFixed(1) : "0.0";

  const totalSpend = 384000; // approx total from mock client data
  const platformRevenue = Math.round(totalSpend * 0.30);
  const avgCpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0.00";
  const avgCpm = totalImpr > 0 ? ((totalSpend / totalImpr) * 1000).toFixed(0) : "0";
  const roas = totalSpend > 0 ? ((platformRevenue / totalSpend) * 100).toFixed(1) : "0.0";

  const stats = [
    { label: "Banner Ads",       value: String(totalBanners),                icon: LayoutTemplate, color: "text-violet-400" },
    { label: "Popup Ads",        value: String(totalPopups),                  icon: Layers,         color: "text-pink-400"   },
    { label: "Active Now",       value: String(activeCount),                  icon: Zap,            color: "text-emerald-400"},
    { label: "Total Impressions",value: fmt(totalImpr),                       icon: Eye,            color: "text-blue-400"   },
    { label: "Total Clicks",     value: fmt(totalClicks),                     icon: MousePointer,   color: "text-amber-400"  },
    { label: "Avg CTR",          value: avgCtr + "%",                         icon: BarChart3,      color: "text-cyan-400"   },
    { label: "Avg CPC",          value: `₹${avgCpc}`,                        icon: TrendingUp,       color: "text-teal-400"   },
    { label: "Avg CPM",          value: `₹${avgCpm}`,                        icon: Target,           color: "text-rose-400"   },
    { label: "Revenue",          value: `₹${(platformRevenue/1000).toFixed(1)}K`, icon: IndianRupee,   color: "text-green-400"  },
    { label: "ROAS",             value: `${roas}%`,                           icon: Star,             color: "text-orange-400" },
    { label: "Special Clients",  value: String(clients.length),               icon: Crown,          color: "text-amber-400"  },
    { label: "Diamond Clients",  value: String(clients.filter((c) => c.tier === "Diamond").length), icon: Star, color: "text-violet-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows = [
            ...INITIAL_BANNERS.map((b) => ({
              id: b.id,
              type: "Banner",
              title: b.title,
              headline: b.headline,
              client_id: b.clientId,
              position: b.position,
              start_date: b.startDate,
              end_date: b.endDate,
              status: b.status,
              impressions: b.impressions,
              clicks: b.clicks,
            })),
            ...INITIAL_POPUPS.map((p) => ({
              id: p.id,
              type: "Popup",
              title: p.title,
              headline: p.headline,
              client_id: p.clientId,
              position: p.popupType,
              start_date: p.startDate,
              end_date: p.endDate,
              status: p.status,
              impressions: p.impressions,
              clicks: p.clicks,
            })),
          ];
          downloadCSV("special-ads-report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Special Client Ads</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage dynamic Banner & Popup ads for VIP clients. Full control over creative, targeting, schedule and frequency.</p>
        </div>
        <Badge className="bg-primary/15 text-primary border border-primary/20 flex items-center gap-1 flex-shrink-0">
          <Crown className="w-3 h-3" /> Admin & Super Admin Only
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border col-span-1 lg:col-span-2 sm:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground leading-tight">{s.label}</span>
                <s.icon className={`w-3.5 h-3.5 flex-shrink-0 ${s.color}`} />
              </div>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Daily Performance Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-violet-500" />Daily Impressions & Clicks</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={[
                { date: "12 May", impressions: 42000, clicks: 3100 },
                { date: "13 May", impressions: 48000, clicks: 3600 },
                { date: "14 May", impressions: 55000, clicks: 4100 },
                { date: "15 May", impressions: 52000, clicks: 3800 },
                { date: "16 May", impressions: 61000, clicks: 4500 },
                { date: "17 May", impressions: 58000, clicks: 4300 },
                { date: "18 May", impressions: 65000, clicks: 4900 },
              ]} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number, n: string) => [v.toLocaleString(), n === "impressions" ? "Impressions" : "Clicks"]} />
                <Bar dataKey="impressions" fill="#7B2FBE" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar dataKey="clicks" fill="#E91E8C" radius={[4, 4, 0, 0]} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-rose-500" />Daily Spend vs Revenue (₹)</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={[
                { date: "12 May", spend: 42000, revenue: 12600 },
                { date: "13 May", spend: 48000, revenue: 14400 },
                { date: "14 May", spend: 55000, revenue: 16500 },
                { date: "15 May", spend: 52000, revenue: 15600 },
                { date: "16 May", spend: 61000, revenue: 18300 },
                { date: "17 May", spend: 58000, revenue: 17400 },
                { date: "18 May", spend: 65000, revenue: 19500 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number, n: string) => [`₹${v.toLocaleString()}`, n === "spend" ? "Spend" : "Revenue"]} />
                <Line type="monotone" dataKey="spend" stroke="#E91E8C" strokeWidth={2} dot={{ fill: "#E91E8C", r: 3 }} />
                <Line type="monotone" dataKey="revenue" stroke="#7B2FBE" strokeWidth={2} dot={{ fill: "#7B2FBE", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="banners">
        <TabsList className="bg-muted/50 border border-border h-auto gap-1 p-1">
          {[
            { value: "banners", label: "Banner Ads",       icon: LayoutTemplate },
            { value: "popups",  label: "Popup Ads",        icon: Layers         },
            { value: "clients", label: "Special Clients",  icon: Crown          },
          ].map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm flex items-center gap-1.5">
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="banners" className="mt-4"><BannerAdsTab clients={clients} /></TabsContent>
        <TabsContent value="popups"  className="mt-4"><PopupAdsTab  clients={clients} /></TabsContent>
        <TabsContent value="clients" className="mt-4"><SpecialClientsTab clients={clients} setClients={setClients} /></TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutTemplate, Plus, Eye, MousePointer, TrendingUp, Zap, Palette,
  Play, Pause, Trash2, Pencil, X, Copy, BarChart3, Layers, Image,
  Star, Clock, Calendar, Target, Sparkles, ArrowRight, Megaphone,
  RefreshCw, CheckCircle, Settings2, Monitor, Smartphone,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type BannerStatus = "active" | "paused" | "scheduled" | "draft" | "ended";
type Placement    = "feed" | "top_bar" | "bottom_sticky" | "between_stories" | "explore" | "chat_header";
type AnimStyle    = "none" | "slide_in" | "fade" | "bounce" | "shimmer" | "pulse";
type StylePreset  = "gradient" | "neon_glow" | "frosted" | "dark_minimal" | "festive" | "sports";

interface CommercialBanner {
  id: string;
  title: string;
  advertiser: string;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaUrl: string;
  stylePreset: StylePreset;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  textColor: "white" | "dark";
  accentColor: string;
  animStyle: AnimStyle;
  animSpeed: "slow" | "normal" | "fast";
  borderRadius: number;
  showGlow: boolean;
  showOverlay: boolean;
  overlayOpacity: number;
  placement: Placement[];
  startDate: string;
  endDate: string;
  status: BannerStatus;
  impressions: number;
  clicks: number;
  spend: string;
  priority: number;
}

// ── Preset Definitions ────────────────────────────────────────────────────────

const STYLE_PRESETS: Record<StylePreset, {
  label: string; desc: string;
  from: string; to: string; angle: number;
  text: "white" | "dark"; accent: string;
  glow: boolean; overlay: boolean; radius: number; anim: AnimStyle;
}> = {
  gradient:   { label: "Classic Gradient", desc: "Bold purple-pink brand gradient",     from: "#7B2FBE", to: "#E91E8C", angle: 135, text: "white", accent: "#fff",    glow: false, overlay: false, radius: 16, anim: "none"     },
  neon_glow:  { label: "Neon Glow",        desc: "Electric neon with glow effect",       from: "#0F0F1A", to: "#1A0A2E", angle: 135, text: "white", accent: "#BF5FFF", glow: true,  overlay: false, radius: 16, anim: "pulse"    },
  frosted:    { label: "Frosted Glass",    desc: "Translucent modern glassmorphism",     from: "#C9D6FF", to: "#E2E2E2", angle: 135, text: "dark",  accent: "#7B2FBE", glow: false, overlay: true,  radius: 20, anim: "fade"     },
  dark_minimal:{ label: "Dark Minimal",   desc: "Clean dark card with accent strip",    from: "#18181B", to: "#27272A", angle: 180, text: "white", accent: "#E91E8C", glow: false, overlay: false, radius: 12, anim: "slide_in" },
  festive:    { label: "Festive India",    desc: "Warm saffron — celebrates Indian vibe",from: "#FF6B00", to: "#FFD700", angle: 135, text: "white", accent: "#fff",    glow: false, overlay: false, radius: 16, anim: "bounce"   },
  sports:     { label: "Sports Energy",   desc: "High-energy red-orange for sports",    from: "#FF0844", to: "#FFB199", angle: 125, text: "white", accent: "#fff",    glow: true,  overlay: false, radius: 10, anim: "shimmer"  },
};

const PLACEMENT_META: Record<Placement, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  feed:           { label: "Feed (In-line)",      icon: Layers    },
  top_bar:        { label: "Top Bar",             icon: Monitor   },
  bottom_sticky:  { label: "Bottom Sticky",       icon: Smartphone},
  between_stories:{ label: "Between Stories",     icon: Image     },
  explore:        { label: "Explore Page",        icon: Target    },
  chat_header:    { label: "Chat Header",         icon: Star      },
};

const ANIM_META: Record<AnimStyle, { label: string; css: string }> = {
  none:     { label: "Static",    css: ""                              },
  slide_in: { label: "Slide In",  css: "animate-in slide-in-from-left-4 duration-500" },
  fade:     { label: "Fade",      css: "animate-in fade-in duration-700"               },
  bounce:   { label: "Bounce",    css: "animate-bounce"                               },
  shimmer:  { label: "Shimmer",   css: "animate-pulse"                                },
  pulse:    { label: "Pulse",     css: "animate-pulse"                                },
};

const STATUS_META: Record<BannerStatus, { label: string; cls: string }> = {
  active:    { label: "Active",    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  paused:    { label: "Paused",    cls: "bg-amber-500/15 text-amber-400 border-amber-500/20"       },
  scheduled: { label: "Scheduled", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20"          },
  draft:     { label: "Draft",     cls: "bg-muted/60 text-muted-foreground border-border"           },
  ended:     { label: "Ended",     cls: "bg-muted/40 text-muted-foreground/60 border-border/50"    },
};

// ── Mock Data ──────────────────────────────────────────────────────────────────

const INITIAL_BANNERS: CommercialBanner[] = [
  {
    id: "cb1", title: "Ridhi Premium Launch", advertiser: "Ridhi Internal",
    headline: "💎 Unlock Premium — First Month Free!", subtext: "Priority matching, unlimited likes & no ads. Your upgrade starts today.",
    ctaText: "Upgrade Now", ctaUrl: "/wallet",
    stylePreset: "gradient", gradientFrom: "#7B2FBE", gradientTo: "#E91E8C", gradientAngle: 135,
    textColor: "white", accentColor: "#fff", animStyle: "fade", animSpeed: "normal",
    borderRadius: 16, showGlow: false, showOverlay: false, overlayOpacity: 20,
    placement: ["feed", "top_bar"], startDate: "2025-05-01", endDate: "2025-06-30",
    status: "active", impressions: 124000, clicks: 9840, spend: "₹0", priority: 1,
  },
  {
    id: "cb2", title: "Diwali Coin Bonanza", advertiser: "Ridhi Commerce",
    headline: "🪔 Diwali Special — 3× Coins All Week!", subtext: "Recharge any pack before midnight and triple your balance instantly.",
    ctaText: "Get Coins", ctaUrl: "/wallet",
    stylePreset: "festive", gradientFrom: "#FF6B00", gradientTo: "#FFD700", gradientAngle: 135,
    textColor: "white", accentColor: "#fff", animStyle: "bounce", animSpeed: "normal",
    borderRadius: 16, showGlow: false, showOverlay: false, overlayOpacity: 20,
    placement: ["feed", "between_stories", "explore"], startDate: "2025-10-20", endDate: "2025-11-05",
    status: "scheduled", impressions: 0, clicks: 0, spend: "₹0", priority: 2,
  },
  {
    id: "cb3", title: "Night Mode Live Launch", advertiser: "Ridhi Product",
    headline: "⚡ Go Live in Dark Mode — New Feature!", subtext: "Stream with neon overlays & audience reactions. Available now on Android & iOS.",
    ctaText: "Go Live", ctaUrl: "/live",
    stylePreset: "neon_glow", gradientFrom: "#0F0F1A", gradientTo: "#1A0A2E", gradientAngle: 135,
    textColor: "white", accentColor: "#BF5FFF", animStyle: "pulse", animSpeed: "slow",
    borderRadius: 16, showGlow: true, showOverlay: false, overlayOpacity: 20,
    placement: ["feed", "chat_header"], startDate: "2025-05-15", endDate: "2025-05-31",
    status: "active", impressions: 58200, clicks: 6140, spend: "₹0", priority: 3,
  },
  {
    id: "cb4", title: "IPL Prediction Contest", advertiser: "Sports Partner",
    headline: "🏏 IPL Winner Prediction — Win 5,000 Coins!", subtext: "Pick the winner before today's match. Free entry. Instant rewards.",
    ctaText: "Predict Now", ctaUrl: "/gaming",
    stylePreset: "sports", gradientFrom: "#FF0844", gradientTo: "#FFB199", gradientAngle: 125,
    textColor: "white", accentColor: "#fff", animStyle: "shimmer", animSpeed: "fast",
    borderRadius: 10, showGlow: true, showOverlay: false, overlayOpacity: 20,
    placement: ["top_bar", "feed", "explore"], startDate: "2025-05-18", endDate: "2025-05-25",
    status: "paused", impressions: 34500, clicks: 4200, spend: "₹48,000", priority: 4,
  },
  {
    id: "cb5", title: "New User Welcome", advertiser: "Ridhi Onboarding",
    headline: "👋 Welcome! You have 100 Free Coins", subtext: "Complete your profile in 2 minutes and earn your first reward.",
    ctaText: "Complete Profile", ctaUrl: "/profile",
    stylePreset: "frosted", gradientFrom: "#C9D6FF", gradientTo: "#E2E2E2", gradientAngle: 135,
    textColor: "dark", accentColor: "#7B2FBE", animStyle: "slide_in", animSpeed: "normal",
    borderRadius: 20, showGlow: false, showOverlay: true, overlayOpacity: 20,
    placement: ["top_bar"], startDate: "2025-01-01", endDate: "2025-12-31",
    status: "active", impressions: 310000, clicks: 87400, spend: "₹0", priority: 5,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function ctr(impressions: number, clicks: number): string {
  if (!impressions) return "0.0%";
  return ((clicks / impressions) * 100).toFixed(1) + "%";
}
function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000)      return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// ── Live Mobile Preview ───────────────────────────────────────────────────────

function BannerPreview({ b, size = "md" }: { b: Partial<CommercialBanner>; size?: "sm" | "md" }) {
  const preset   = STYLE_PRESETS[b.stylePreset ?? "gradient"];
  const from     = b.gradientFrom ?? preset.from;
  const to       = b.gradientTo   ?? preset.to;
  const angle    = b.gradientAngle ?? preset.angle;
  const tc       = (b.textColor ?? preset.text) === "white" ? "#fff" : "#111";
  const accent   = b.accentColor ?? preset.accent;
  const glow     = b.showGlow ?? preset.glow;
  const radius   = b.borderRadius ?? preset.radius;
  const anim     = ANIM_META[b.animStyle ?? preset.anim].css;

  const w = size === "sm" ? 180 : 240;

  return (
    <div className="mx-auto" style={{ width: w }}>
      <div className="bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-700 p-3">
        {/* Phone status bar */}
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[8px] text-zinc-400">9:41</span>
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => <div key={i} className="w-0.5 bg-zinc-400 rounded" style={{ height: 4 + i * 1.5 }} />)}
            <div className="w-3 h-2 border border-zinc-400 rounded-sm ml-0.5">
              <div className="bg-zinc-400 rounded-sm h-full w-3/4" />
            </div>
          </div>
        </div>

        {/* App header strip */}
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="w-5 h-5 rounded-full" style={{ background: "linear-gradient(135deg,#7B2FBE,#E91E8C)" }} />
          <span className="text-[9px] font-bold text-white">Ridhi</span>
          <div className="w-4 h-4 rounded-full bg-zinc-700" />
        </div>

        {/* Banner */}
        <div
          className={`relative overflow-hidden ${anim}`}
          style={{
            background: `linear-gradient(${angle}deg, ${from}, ${to})`,
            borderRadius: radius,
            padding: size === "sm" ? "10px 12px" : "14px",
            boxShadow: glow ? `0 0 20px ${from}88` : undefined,
          }}
        >
          {b.showOverlay && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded" />
          )}
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.25)", color: tc }}>
                Sponsored
              </span>
              <X className="w-3 h-3 opacity-60" style={{ color: tc }} />
            </div>
            <p className="font-bold leading-tight mb-1" style={{ fontSize: size === "sm" ? 9 : 11, color: tc }}>
              {b.headline || "Your headline here"}
            </p>
            <p className="opacity-80 leading-tight mb-2" style={{ fontSize: 7, color: tc }}>
              {b.subtext || "Supporting subtext goes here"}
            </p>
            <div className="flex items-center gap-1 text-[7px] font-bold px-2 py-1 rounded-full self-start"
              style={{ backgroundColor: accent === "#fff" ? "rgba(255,255,255,0.25)" : accent, color: accent === "#fff" ? "#fff" : "#fff", display: "inline-flex" }}>
              {b.ctaText || "Learn More"}
              <ArrowRight className="w-2 h-2" />
            </div>
          </div>
        </div>

        {/* Feed post placeholders */}
        <div className="space-y-1.5 mt-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-1.5 px-1">
              <div className="w-5 h-5 rounded-full bg-zinc-700 flex-shrink-0" />
              <div className="flex-1 space-y-0.5">
                <div className="h-1.5 bg-zinc-700 rounded w-1/2" />
                <div className="h-1 bg-zinc-800 rounded w-full" />
                <div className="h-1 bg-zinc-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Style Preset Card ─────────────────────────────────────────────────────────

function PresetCard({ preset, selected, onSelect }: {
  preset: StylePreset; selected: boolean; onSelect: () => void;
}) {
  const p = STYLE_PRESETS[preset];
  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left rounded-xl border-2 p-3 transition-all ${
        selected ? "border-violet-500 ring-2 ring-violet-500/30" : "border-border hover:border-violet-300"
      }`}
    >
      <div className="h-10 rounded-lg mb-2 relative overflow-hidden"
        style={{ background: `linear-gradient(${p.angle}deg, ${p.from}, ${p.to})`,
          boxShadow: p.glow ? `0 0 14px ${p.from}66` : undefined }}>
        {p.overlay && <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />}
        <span className="absolute bottom-1.5 right-2 text-[8px] font-bold" style={{ color: p.text === "white" ? "#fff" : "#111" }}>
          {p.label}
        </span>
      </div>
      <p className="text-xs font-semibold text-foreground">{p.label}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
      {selected && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-violet-500" />}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CommercialBanners() {
  const { toast } = useToast();
  const [banners, setBanners]       = useState<CommercialBanner[]>(INITIAL_BANNERS);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing]       = useState<CommercialBanner | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | BannerStatus>("all");

  const blankBanner = (): CommercialBanner => ({
    id: `cb${Date.now()}`, title: "", advertiser: "", headline: "", subtext: "",
    ctaText: "Learn More", ctaUrl: "", stylePreset: "gradient",
    gradientFrom: "#7B2FBE", gradientTo: "#E91E8C", gradientAngle: 135,
    textColor: "white", accentColor: "#fff", animStyle: "fade", animSpeed: "normal",
    borderRadius: 16, showGlow: false, showOverlay: false, overlayOpacity: 20,
    placement: ["feed"], startDate: "", endDate: "",
    status: "draft", impressions: 0, clicks: 0, spend: "₹0", priority: banners.length + 1,
  });

  const openNew  = () => { setEditing(blankBanner()); setShowEditor(true); };
  const openEdit = (b: CommercialBanner) => { setEditing({ ...b }); setShowEditor(true); };

  const applyPreset = (preset: StylePreset) => {
    if (!editing) return;
    const p = STYLE_PRESETS[preset];
    setEditing(prev => prev ? {
      ...prev, stylePreset: preset, gradientFrom: p.from, gradientTo: p.to,
      gradientAngle: p.angle, textColor: p.text, accentColor: p.accent,
      showGlow: p.glow, showOverlay: p.overlay, borderRadius: p.radius, animStyle: p.anim,
    } : null);
  };

  const togglePlacement = (p: Placement) => {
    if (!editing) return;
    setEditing(prev => {
      if (!prev) return null;
      const has = prev.placement.includes(p);
      return { ...prev, placement: has ? prev.placement.filter(x => x !== p) : [...prev.placement, p] };
    });
  };

  const handleSave = () => {
    if (!editing) return;
    setBanners(prev => {
      const idx = prev.findIndex(b => b.id === editing.id);
      return idx >= 0 ? prev.map(b => b.id === editing.id ? editing : b) : [editing, ...prev];
    });
    setShowEditor(false);
    toast({ title: "Banner saved", description: `"${editing.title}" has been ${editing.status === "draft" ? "saved as draft" : "updated"}.` });
  };

  const handleToggleStatus = (id: string) => {
    setBanners(prev => prev.map(b => b.id === id
      ? { ...b, status: b.status === "active" ? "paused" : "active" }
      : b));
  };

  const handleDelete = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    toast({ title: "Banner deleted", variant: "destructive" });
  };

  const handleDuplicate = (b: CommercialBanner) => {
    const copy = { ...b, id: `cb${Date.now()}`, title: b.title + " (Copy)", status: "draft" as BannerStatus, impressions: 0, clicks: 0 };
    setBanners(prev => [copy, ...prev]);
    toast({ title: "Banner duplicated" });
  };

  const filtered = filterStatus === "all" ? banners : banners.filter(b => b.status === filterStatus);

  // Metrics
  const totalImpressions = banners.reduce((s, b) => s + b.impressions, 0);
  const totalClicks      = banners.reduce((s, b) => s + b.clicks, 0);
  const activeBanners    = banners.filter(b => b.status === "active").length;
  const avgCTR           = totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-violet-500" />
            Commercial Banners
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design & deploy dynamic in-app banners across all placements — with live preview & animation controls
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 text-white">
          <Plus className="w-4 h-4" /> New Banner
        </Button>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Banners", value: banners.length, sub: `${activeBanners} active`,  icon: LayoutTemplate, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Total Impressions", value: fmt(totalImpressions), sub: "all time",      icon: Eye,          color: "text-blue-500",   bg: "bg-blue-500/10"   },
          { label: "Total Clicks",  value: fmt(totalClicks), sub: "all time",               icon: MousePointer, color: "text-emerald-500", bg: "bg-emerald-500/10"},
          { label: "Avg CTR",       value: avgCTR + "%", sub: "across all banners",         icon: TrendingUp,   color: "text-pink-500",   bg: "bg-pink-500/10"   },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center flex-shrink-0`}>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-[10px] text-muted-foreground/70">{m.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Placement Overview ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            Active Placements Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {(Object.entries(PLACEMENT_META) as [Placement, typeof PLACEMENT_META[Placement]][]).map(([key, meta]) => {
              const count = banners.filter(b => b.status === "active" && b.placement.includes(key)).length;
              return (
                <div key={key} className={`rounded-xl border p-3 text-center transition-colors ${count > 0 ? "border-violet-500/40 bg-violet-500/5" : "border-border"}`}>
                  <meta.icon className={`w-5 h-5 mx-auto mb-1.5 ${count > 0 ? "text-violet-500" : "text-muted-foreground"}`} />
                  <p className={`text-lg font-bold ${count > 0 ? "text-violet-500" : "text-muted-foreground"}`}>{count}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{meta.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Banner List ── */}
      <Tabs value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
        <div className="flex items-center justify-between mb-3">
          <TabsList className="h-8">
            {(["all", "active", "scheduled", "paused", "draft", "ended"] as const).map(s => (
              <TabsTrigger key={s} value={s} className="text-xs capitalize h-7 px-3">{s}</TabsTrigger>
            ))}
          </TabsList>
          <p className="text-xs text-muted-foreground">{filtered.length} banner{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        <TabsContent value={filterStatus} className="mt-0 space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <LayoutTemplate className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No banners in this filter</p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={openNew}>
                  <Plus className="w-3.5 h-3.5" /> Create Banner
                </Button>
              </CardContent>
            </Card>
          ) : filtered.map(b => {
            const preset = STYLE_PRESETS[b.stylePreset];
            const sm = STATUS_META[b.status];
            return (
              <Card key={b.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-0">
                    {/* Style strip */}
                    <div className="w-2 flex-shrink-0" style={{ background: `linear-gradient(180deg, ${b.gradientFrom}, ${b.gradientTo})` }} />

                    <div className="flex-1 p-4">
                      <div className="flex items-start gap-4">
                        {/* Live mini preview */}
                        <div className="flex-shrink-0">
                          <BannerPreview b={b} size="sm" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-sm truncate">{b.title}</span>
                            <Badge className={`text-[10px] h-4 border ${sm.cls}`}>{sm.label}</Badge>
                            <Badge variant="outline" className="text-[10px] h-4">{preset.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{b.advertiser}</p>
                          <p className="text-xs text-foreground/80 line-clamp-1 mb-2">"{b.headline}"</p>

                          {/* Placement chips */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {b.placement.map(p => (
                              <span key={p} className="text-[9px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                {PLACEMENT_META[p].label}
                              </span>
                            ))}
                          </div>

                          {/* Metrics */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmt(b.impressions)}</span>
                            <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" />{fmt(b.clicks)}</span>
                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{ctr(b.impressions, b.clicks)}</span>
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{ANIM_META[b.animStyle].label}</span>
                            {b.startDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.startDate} → {b.endDate}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openEdit(b)}>
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleToggleStatus(b.id)}>
                            {b.status === "active" ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Activate</>}
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleDuplicate(b)}>
                            <Copy className="w-3 h-3" /> Clone
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(b.id)}>
                            <Trash2 className="w-3 h-3" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* ── Editor Dialog ── */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-violet-500" />
              {editing && banners.find(b => b.id === editing.id) ? "Edit Banner" : "Create Banner"}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-2">

              {/* ── Left: Form ── */}
              <div className="lg:col-span-3 space-y-5">

                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Banner Info</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Campaign Title</Label>
                      <Input className="h-8 text-xs" placeholder="e.g. Diwali Bonanza" value={editing.title}
                        onChange={e => setEditing(p => p ? { ...p, title: e.target.value } : null)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Advertiser</Label>
                      <Input className="h-8 text-xs" placeholder="e.g. Ridhi Internal" value={editing.advertiser}
                        onChange={e => setEditing(p => p ? { ...p, advertiser: e.target.value } : null)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Headline</Label>
                    <Input className="h-8 text-xs" placeholder="Main headline (keep it punchy!)" value={editing.headline}
                      onChange={e => setEditing(p => p ? { ...p, headline: e.target.value } : null)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subtext</Label>
                    <Textarea className="text-xs resize-none" rows={2} placeholder="Supporting description" value={editing.subtext}
                      onChange={e => setEditing(p => p ? { ...p, subtext: e.target.value } : null)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">CTA Button Text</Label>
                      <Input className="h-8 text-xs" placeholder="e.g. Get Started" value={editing.ctaText}
                        onChange={e => setEditing(p => p ? { ...p, ctaText: e.target.value } : null)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">CTA URL / Deep Link</Label>
                      <Input className="h-8 text-xs" placeholder="/wallet or https://..." value={editing.ctaUrl}
                        onChange={e => setEditing(p => p ? { ...p, ctaUrl: e.target.value } : null)} />
                    </div>
                  </div>
                </div>

                {/* Style Presets */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" /> Visual Style
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.keys(STYLE_PRESETS) as StylePreset[]).map(p => (
                      <PresetCard key={p} preset={p} selected={editing.stylePreset === p} onSelect={() => applyPreset(p)} />
                    ))}
                  </div>
                </div>

                {/* Custom Overrides */}
                <div className="space-y-3 border rounded-xl p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5" /> Fine-tune Style
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Gradient Start</Label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={editing.gradientFrom}
                          onChange={e => setEditing(p => p ? { ...p, gradientFrom: e.target.value } : null)}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0.5 bg-transparent" />
                        <Input className="h-8 text-xs font-mono" value={editing.gradientFrom}
                          onChange={e => setEditing(p => p ? { ...p, gradientFrom: e.target.value } : null)} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Gradient End</Label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={editing.gradientTo}
                          onChange={e => setEditing(p => p ? { ...p, gradientTo: e.target.value } : null)}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0.5 bg-transparent" />
                        <Input className="h-8 text-xs font-mono" value={editing.gradientTo}
                          onChange={e => setEditing(p => p ? { ...p, gradientTo: e.target.value } : null)} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Accent / CTA Color</Label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={editing.accentColor === "#fff" ? "#ffffff" : editing.accentColor}
                          onChange={e => setEditing(p => p ? { ...p, accentColor: e.target.value } : null)}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0.5 bg-transparent" />
                        <Input className="h-8 text-xs font-mono" value={editing.accentColor}
                          onChange={e => setEditing(p => p ? { ...p, accentColor: e.target.value } : null)} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Gradient Angle</Label>
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={360} value={editing.gradientAngle}
                          onChange={e => setEditing(p => p ? { ...p, gradientAngle: Number(e.target.value) } : null)}
                          className="flex-1 h-2 accent-violet-600" />
                        <span className="text-xs w-8 text-right">{editing.gradientAngle}°</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Border Radius</Label>
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={32} value={editing.borderRadius}
                          onChange={e => setEditing(p => p ? { ...p, borderRadius: Number(e.target.value) } : null)}
                          className="flex-1 h-2 accent-violet-600" />
                        <span className="text-xs w-8 text-right">{editing.borderRadius}px</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Text Colour</Label>
                      <Select value={editing.textColor} onValueChange={v => setEditing(p => p ? { ...p, textColor: v as any } : null)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-6 pt-1">
                    <div className="flex items-center gap-2">
                      <Switch checked={editing.showGlow} onCheckedChange={v => setEditing(p => p ? { ...p, showGlow: v } : null)} />
                      <Label className="text-xs">Neon Glow</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={editing.showOverlay} onCheckedChange={v => setEditing(p => p ? { ...p, showOverlay: v } : null)} />
                      <Label className="text-xs">Frosted Overlay</Label>
                    </div>
                  </div>
                </div>

                {/* Animation */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" /> Animation
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {(Object.entries(ANIM_META) as [AnimStyle, typeof ANIM_META[AnimStyle]][]).map(([key, meta]) => (
                      <button key={key} onClick={() => setEditing(p => p ? { ...p, animStyle: key } : null)}
                        className={`rounded-lg border px-2 py-2 text-[11px] font-medium text-center transition-all ${
                          editing.animStyle === key ? "border-violet-500 bg-violet-500/10 text-violet-600" : "border-border text-muted-foreground hover:border-violet-300"
                        }`}>
                        {meta.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="text-xs whitespace-nowrap">Speed:</Label>
                    {(["slow", "normal", "fast"] as const).map(s => (
                      <button key={s} onClick={() => setEditing(p => p ? { ...p, animSpeed: s } : null)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all capitalize ${
                          editing.animSpeed === s ? "border-violet-500 bg-violet-500/10 text-violet-600" : "border-border text-muted-foreground"
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Placements */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" /> Placements
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.entries(PLACEMENT_META) as [Placement, typeof PLACEMENT_META[Placement]][]).map(([key, meta]) => {
                      const on = editing.placement.includes(key);
                      return (
                        <button key={key} onClick={() => togglePlacement(key)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                            on ? "border-violet-500 bg-violet-500/10 text-violet-600" : "border-border text-muted-foreground hover:border-violet-300"
                          }`}>
                          <meta.icon className="w-3.5 h-3.5" />
                          {meta.label}
                          {on && <CheckCircle className="w-3 h-3 ml-auto text-violet-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduling & Status */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" /> Schedule & Status
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Start Date</Label>
                      <Input type="date" className="h-8 text-xs" value={editing.startDate}
                        onChange={e => setEditing(p => p ? { ...p, startDate: e.target.value } : null)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">End Date</Label>
                      <Input type="date" className="h-8 text-xs" value={editing.endDate}
                        onChange={e => setEditing(p => p ? { ...p, endDate: e.target.value } : null)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status</Label>
                      <Select value={editing.status} onValueChange={v => setEditing(p => p ? { ...p, status: v as BannerStatus } : null)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["draft", "scheduled", "active", "paused"] as const).map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right: Live Preview ── */}
              <div className="lg:col-span-2 space-y-4">
                <div className="sticky top-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-violet-500" /> Live Preview
                    </h3>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1"
                      onClick={() => applyPreset(editing.stylePreset)}>
                      <RefreshCw className="w-3 h-3" /> Reset
                    </Button>
                  </div>
                  <BannerPreview b={editing} size="md" />
                  <div className="rounded-xl border bg-muted/40 p-3 space-y-2 text-xs">
                    <p className="font-semibold text-foreground">Style Summary</p>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: `linear-gradient(${editing.gradientAngle}deg, ${editing.gradientFrom}, ${editing.gradientTo})` }} />
                        <span>{STYLE_PRESETS[editing.stylePreset].label}</span>
                      </div>
                      <p>Animation: <span className="text-foreground">{ANIM_META[editing.animStyle].label} ({editing.animSpeed})</span></p>
                      <p>Radius: <span className="text-foreground">{editing.borderRadius}px</span></p>
                      <p>Placements: <span className="text-foreground">{editing.placement.length}</span></p>
                      {editing.showGlow && <p className="text-violet-500">✦ Neon glow enabled</p>}
                      {editing.showOverlay && <p className="text-blue-500">✦ Frosted overlay enabled</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
            {editing && (
              <Button onClick={() => { if (editing) setEditing(p => p ? { ...p, status: "draft" } : null); setTimeout(handleSave, 0); }}
                variant="outline" className="gap-1">Save as Draft</Button>
            )}
            <Button onClick={handleSave} className="gap-1.5 bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 text-white">
              <CheckCircle className="w-4 h-4" />
              {editing?.status === "active" ? "Publish Banner" : "Save Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

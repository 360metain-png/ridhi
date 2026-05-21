import { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Gift, Sticker, Award, Camera, Plus, Pencil, Trash2, Eye, EyeOff,
  Search, Filter, Coins, Star, Sparkles, Heart, Zap, Crown,
  ChevronDown, ChevronUp, ShieldCheck, ImageIcon,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type GiftItem = {
  id: string; name: string; emoji: string; category: string;
  coins: number; animation: string; enabled: boolean; uses: number;
};
type StickerPack = {
  id: string; name: string; emoji: string; category: string;
  price: number; type: "free" | "premium"; stickers: StickerItem[]; enabled: boolean;
};
type StickerItem = { id: string; emoji: string; name: string };
type BadgeItem = {
  id: string; name: string; emoji: string; type: "achievement" | "premium" | "frame";
  coins: number; criteria: string; enabled: boolean; uses: number;
};
type FilterItem = {
  id: string; name: string; emoji: string; category: string;
  type: "beauty" | "ar" | "graphic" | "color"; price: number;
  tier: "free" | "premium"; enabled: boolean; uses: number;
};

// ── Initial data ──────────────────────────────────────────────────────────────

const INIT_GIFTS: GiftItem[] = [
  { id: "g1",  name: "Rose",          emoji: "🌹", category: "Flowers",    coins: 10,    animation: "float",   enabled: true,  uses: 84_200 },
  { id: "g2",  name: "Lollipop",      emoji: "🍭", category: "Sweets",     coins: 50,    animation: "spin",    enabled: true,  uses: 32_100 },
  { id: "g3",  name: "Ring",          emoji: "💍", category: "Luxury",     coins: 500,   animation: "sparkle", enabled: true,  uses: 8_400  },
  { id: "g4",  name: "Sports Car",    emoji: "🏎️", category: "Vehicles",   coins: 2_000, animation: "drive",   enabled: true,  uses: 2_100  },
  { id: "g5",  name: "Rocket",        emoji: "🚀", category: "Space",      coins: 5_000, animation: "launch",  enabled: true,  uses: 842    },
  { id: "g6",  name: "Love Boat",     emoji: "🛥️", category: "Luxury",     coins: 10_000,animation: "sail",   enabled: true,  uses: 320    },
  { id: "g7",  name: "Castle",        emoji: "🏰", category: "Fantasy",    coins: 50_000,animation: "glow",   enabled: true,  uses: 42     },
  { id: "g8",  name: "Crown",         emoji: "👑", category: "Royalty",    coins: 1_000, animation: "sparkle", enabled: true,  uses: 4_820  },
  { id: "g9",  name: "Diamond",       emoji: "💎", category: "Luxury",     coins: 3_000, animation: "rotate",  enabled: true,  uses: 1_240  },
  { id: "g10", name: "Fireworks",     emoji: "🎆", category: "Celebration",coins: 200,   animation: "burst",   enabled: true,  uses: 18_400 },
  { id: "g11", name: "Teddy Bear",    emoji: "🧸", category: "Cute",       coins: 100,   animation: "bounce",  enabled: true,  uses: 24_100 },
  { id: "g12", name: "Mic Drop",      emoji: "🎤", category: "Music",      coins: 300,   animation: "drop",    enabled: false, uses: 3_200  },
];

const INIT_PACKS: StickerPack[] = [
  {
    id: "sp1", name: "Desi Vibes", emoji: "🤌", category: "Culture", price: 0, type: "free", enabled: true,
    stickers: [
      { id: "s1", emoji: "🤌", name: "Classic" },
      { id: "s2", emoji: "💃", name: "Dance" },
      { id: "s3", emoji: "🎉", name: "Party" },
      { id: "s4", emoji: "🙏", name: "Namaste" },
      { id: "s5", emoji: "🥘", name: "Biryani" },
      { id: "s6", emoji: "🏏", name: "Cricket" },
    ],
  },
  {
    id: "sp2", name: "Love & Romance", emoji: "💕", category: "Romance", price: 50, type: "premium", enabled: true,
    stickers: [
      { id: "s7",  emoji: "💕", name: "Hearts" },
      { id: "s8",  emoji: "💌", name: "Love Letter" },
      { id: "s9",  emoji: "🥰", name: "In Love" },
      { id: "s10", emoji: "💑", name: "Couple" },
    ],
  },
  {
    id: "sp3", name: "Bollywood Beats", emoji: "🎬", category: "Entertainment", price: 100, type: "premium", enabled: true,
    stickers: [
      { id: "s11", emoji: "🎬", name: "Clap" },
      { id: "s12", emoji: "🌟", name: "Star" },
      { id: "s13", emoji: "🎵", name: "Music" },
      { id: "s14", emoji: "💃", name: "Item" },
      { id: "s15", emoji: "🎭", name: "Drama" },
    ],
  },
  {
    id: "sp4", name: "Festive India", emoji: "🪔", category: "Festivals", price: 75, type: "premium", enabled: false,
    stickers: [
      { id: "s16", emoji: "🪔", name: "Diya" },
      { id: "s17", emoji: "🎆", name: "Firework" },
      { id: "s18", emoji: "🪅", name: "Rangoli" },
      { id: "s19", emoji: "🕌", name: "Temple" },
    ],
  },
];

const INIT_BADGES: BadgeItem[] = [
  { id: "b1",  name: "Rising Star",      emoji: "⭐", type: "achievement", coins: 0,      criteria: "500 followers",           enabled: true,  uses: 12_400 },
  { id: "b2",  name: "Top Streamer",     emoji: "📡", type: "achievement", coins: 0,      criteria: "100 hours streamed",       enabled: true,  uses: 4_820  },
  { id: "b3",  name: "PK Champion",      emoji: "⚡", type: "achievement", coins: 0,      criteria: "50 PK wins",               enabled: true,  uses: 1_240  },
  { id: "b4",  name: "Gold Badge",       emoji: "🥇", type: "premium",     coins: 500,    criteria: "Purchase",                 enabled: true,  uses: 8_400  },
  { id: "b5",  name: "VIP Crown",        emoji: "👑", type: "premium",     coins: 2_000,  criteria: "Purchase",                 enabled: true,  uses: 3_200  },
  { id: "b6",  name: "Diamond Frame",    emoji: "💎", type: "frame",       coins: 1_500,  criteria: "Purchase",                 enabled: true,  uses: 2_100  },
  { id: "b7",  name: "Fire Frame",       emoji: "🔥", type: "frame",       coins: 800,    criteria: "Purchase",                 enabled: true,  uses: 4_100  },
  { id: "b8",  name: "Community Hero",   emoji: "🦸", type: "achievement", coins: 0,      criteria: "Join 5 communities",       enabled: true,  uses: 6_200  },
  { id: "b9",  name: "Gift King",        emoji: "🎁", type: "achievement", coins: 0,      criteria: "Send 1000 gifts",          enabled: true,  uses: 840    },
  { id: "b10", name: "Verified Creator", emoji: "✅", type: "achievement", coins: 0,      criteria: "KYC + 1000 followers",     enabled: true,  uses: 3_800  },
];

const INIT_FILTERS: FilterItem[] = [
  { id: "f1",  name: "Beauty Glow",     emoji: "✨", category: "Beauty",    type: "beauty",  price: 0,    tier: "free",    enabled: true,  uses: 84_200 },
  { id: "f2",  name: "Smooth Skin",     emoji: "💆", category: "Beauty",    type: "beauty",  price: 0,    tier: "free",    enabled: true,  uses: 72_100 },
  { id: "f3",  name: "Vintage Film",    emoji: "📽️", category: "Color",     type: "color",   price: 0,    tier: "free",    enabled: true,  uses: 41_300 },
  { id: "f4",  name: "Neon Glow",       emoji: "🌈", category: "Graphic",   type: "graphic", price: 100,  tier: "premium", enabled: true,  uses: 18_400 },
  { id: "f5",  name: "Cat Ears",        emoji: "🐱", category: "AR Fun",    type: "ar",      price: 0,    tier: "free",    enabled: true,  uses: 54_200 },
  { id: "f6",  name: "Crown AR",        emoji: "👑", category: "AR Fun",    type: "ar",      price: 200,  tier: "premium", enabled: true,  uses: 8_400  },
  { id: "f7",  name: "Butterfly AR",    emoji: "🦋", category: "AR Fun",    type: "ar",      price: 150,  tier: "premium", enabled: true,  uses: 12_100 },
  { id: "f8",  name: "Bollywood Lights",emoji: "🎬", category: "Graphic",   type: "graphic", price: 300,  tier: "premium", enabled: true,  uses: 4_820  },
  { id: "f9",  name: "Desi Wedding",    emoji: "💍", category: "Graphic",   type: "graphic", price: 500,  tier: "premium", enabled: false, uses: 2_100  },
  { id: "f10", name: "Midnight Blue",   emoji: "🌙", category: "Color",     type: "color",   price: 50,   tier: "premium", enabled: true,  uses: 22_400 },
  { id: "f11", name: "Golden Hour",     emoji: "🌅", category: "Color",     type: "color",   price: 75,   tier: "premium", enabled: true,  uses: 19_800 },
  { id: "f12", name: "Dog Ears",        emoji: "🐶", category: "AR Fun",    type: "ar",      price: 0,    tier: "free",    enabled: true,  uses: 62_400 },
];

const GIFT_CATEGORIES   = ["Flowers", "Sweets", "Luxury", "Vehicles", "Space", "Fantasy", "Royalty", "Celebration", "Cute", "Music"];
const STICKER_CATEGORIES = ["Culture", "Romance", "Entertainment", "Festivals", "Memes", "Sports", "Food"];
const BADGE_TYPES       = ["achievement", "premium", "frame"] as const;
const FILTER_CATEGORIES = ["Beauty", "Color", "Graphic", "AR Fun"];
const ANIMATIONS        = ["float", "spin", "sparkle", "drive", "launch", "sail", "glow", "rotate", "burst", "bounce", "drop"];

// ── Helper ────────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-5 h-5" /></div>
        <div>
          <p className="text-2xl font-black">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ContentAssets() {
  const [gifts,   setGifts]   = useState<GiftItem[]>(INIT_GIFTS);
  const [packs,   setPacks]   = useState<StickerPack[]>(INIT_PACKS);
  const [badges,  setBadges]  = useState<BadgeItem[]>(INIT_BADGES);
  const [filters, setFilters] = useState<FilterItem[]>(INIT_FILTERS);
  const [search,  setSearch]  = useState("");
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  // Dialog state
  const [giftDialog,   setGiftDialog]   = useState(false);
  const [stickerDialog,setStickerDialog] = useState(false);
  const [badgeDialog,  setBadgeDialog]  = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [editGift,   setEditGift]   = useState<GiftItem   | null>(null);
  const [editBadge,  setEditBadge]  = useState<BadgeItem  | null>(null);
  const [editFilter, setEditFilter] = useState<FilterItem | null>(null);
  const [editPack,   setEditPack]   = useState<StickerPack| null>(null);

  // Form state
  const [form, setForm] = useState<Record<string, string>>({});

  const openGiftDialog   = (g?: GiftItem)    => { setEditGift(g ?? null);   setForm(g ? { name: g.name, emoji: g.emoji, category: g.category, coins: String(g.coins), animation: g.animation } : {}); setGiftDialog(true); };
  const openBadgeDialog  = (b?: BadgeItem)   => { setEditBadge(b ?? null);  setForm(b ? { name: b.name, emoji: b.emoji, type: b.type, coins: String(b.coins), criteria: b.criteria } : {}); setBadgeDialog(true); };
  const openFilterDialog = (f?: FilterItem)  => { setEditFilter(f ?? null); setForm(f ? { name: f.name, emoji: f.emoji, category: f.category, type: f.type, price: String(f.price), tier: f.tier } : {}); setFilterDialog(true); };
  const openPackDialog   = (p?: StickerPack) => { setEditPack(p ?? null);   setForm(p ? { name: p.name, emoji: p.emoji, category: p.category, price: String(p.price), type: p.type } : {}); setStickerDialog(true); };

  const saveGift = () => {
    const item: GiftItem = {
      id: editGift?.id ?? `g${Date.now()}`, name: form.name || "New Gift",
      emoji: form.emoji || "🎁", category: form.category || "Celebration",
      coins: Number(form.coins) || 100, animation: form.animation || "float",
      enabled: editGift?.enabled ?? true, uses: editGift?.uses ?? 0,
    };
    setGifts(g => editGift ? g.map(x => x.id === editGift.id ? item : x) : [item, ...g]);
    setGiftDialog(false);
  };

  const saveBadge = () => {
    const item: BadgeItem = {
      id: editBadge?.id ?? `b${Date.now()}`, name: form.name || "New Badge",
      emoji: form.emoji || "🏅", type: (form.type as BadgeItem["type"]) || "achievement",
      coins: Number(form.coins) || 0, criteria: form.criteria || "",
      enabled: editBadge?.enabled ?? true, uses: editBadge?.uses ?? 0,
    };
    setBadges(b => editBadge ? b.map(x => x.id === editBadge.id ? item : x) : [item, ...b]);
    setBadgeDialog(false);
  };

  const saveFilter = () => {
    const item: FilterItem = {
      id: editFilter?.id ?? `f${Date.now()}`, name: form.name || "New Filter",
      emoji: form.emoji || "✨", category: form.category || "Beauty",
      type: (form.type as FilterItem["type"]) || "beauty",
      price: Number(form.price) || 0, tier: (form.tier as "free" | "premium") || "free",
      enabled: editFilter?.enabled ?? true, uses: editFilter?.uses ?? 0,
    };
    setFilters(f => editFilter ? f.map(x => x.id === editFilter.id ? item : x) : [item, ...f]);
    setFilterDialog(false);
  };

  const savePack = () => {
    const item: StickerPack = {
      id: editPack?.id ?? `sp${Date.now()}`, name: form.name || "New Pack",
      emoji: form.emoji || "📦", category: form.category || "Culture",
      price: Number(form.price) || 0, type: (form.type as "free" | "premium") || "free",
      stickers: editPack?.stickers ?? [], enabled: editPack?.enabled ?? true,
    };
    setPacks(p => editPack ? p.map(x => x.id === editPack.id ? item : x) : [item, ...p]);
    setStickerDialog(false);
  };

  const toggleGift   = (id: string) => setGifts  (g => g.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  const toggleBadge  = (id: string) => setBadges (b => b.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  const toggleFilter = (id: string) => setFilters(f => f.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  const togglePack   = (id: string) => setPacks  (p => p.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));

  const deleteGift   = (id: string) => setGifts  (g => g.filter(x => x.id !== id));
  const deleteBadge  = (id: string) => setBadges (b => b.filter(x => x.id !== id));
  const deleteFilter = (id: string) => setFilters(f => f.filter(x => x.id !== id));
  const deletePack   = (id: string) => setPacks  (p => p.filter(x => x.id !== id));

  const q = search.toLowerCase();
  const fg = gifts.filter(g => g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q));
  const fb = badges.filter(b => b.name.toLowerCase().includes(q));
  const ff = filters.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  const fp = packs.filter(p => p.name.toLowerCase().includes(q));

  const totalGiftUses   = gifts.reduce((s, g) => s + g.uses, 0);
  const totalFilterUses = filters.reduce((s, f) => s + f.uses, 0);
  const totalBadgeUses  = badges.reduce((s, b) => s + b.uses, 0);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" /> Creative Assets
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage virtual gifts, stickers, badges, and reel filters — set prices & control visibility
          </p>
        </div>
        <Badge className="gap-1.5 bg-purple-600 text-white">
          <ShieldCheck className="w-3 h-3" /> Super Admin
        </Badge>
      </div>

      {/* ── KPI bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Gift}    label="Gifts Sent (all time)"    value={`${(totalGiftUses / 1000).toFixed(1)}K`}   color="text-pink-600 bg-pink-50" />
        <StatCard icon={Sparkles}label="Filter Uses (all time)"   value={`${(totalFilterUses / 1000).toFixed(1)}K`} color="text-purple-600 bg-purple-50" />
        <StatCard icon={Award}   label="Badges Awarded"           value={`${(totalBadgeUses / 1000).toFixed(1)}K`}  color="text-yellow-600 bg-yellow-50" />
        <StatCard icon={Sticker} label="Sticker Packs Active"     value={`${packs.filter(p => p.enabled).length}`}  color="text-blue-600 bg-blue-50" />
      </div>

      {/* ── Search bar ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search assets..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-xs text-muted-foreground">Searching across all tabs</span>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="gifts">
        <TabsList className="mb-4">
          <TabsTrigger value="gifts"   className="gap-1.5"><Gift    className="w-3.5 h-3.5" /> Virtual Gifts ({gifts.length})</TabsTrigger>
          <TabsTrigger value="stickers"className="gap-1.5"><Sticker className="w-3.5 h-3.5" /> Sticker Packs ({packs.length})</TabsTrigger>
          <TabsTrigger value="badges"  className="gap-1.5"><Award   className="w-3.5 h-3.5" /> Badges & Frames ({badges.length})</TabsTrigger>
          <TabsTrigger value="filters" className="gap-1.5"><Camera  className="w-3.5 h-3.5" /> Reel Filters ({filters.length})</TabsTrigger>
        </TabsList>

        {/* ──────────── VIRTUAL GIFTS ──────────── */}
        <TabsContent value="gifts" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{fg.filter(g => g.enabled).length} active · {fg.filter(g => !g.enabled).length} hidden</p>
            <Button size="sm" onClick={() => openGiftDialog()} className="bg-pink-600 hover:bg-pink-700 gap-1.5">
              <Plus className="w-4 h-4" /> Add Gift
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {fg.map(g => (
              <Card key={g.id} className={`relative overflow-hidden transition-opacity ${!g.enabled ? "opacity-60" : ""}`}>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border flex items-center justify-center text-2xl">{g.emoji}</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleGift(g.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title={g.enabled ? "Hide" : "Show"}>
                        {g.enabled ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      <button onClick={() => openGiftDialog(g)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button onClick={() => deleteGift(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{g.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{g.category}</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-orange-600 border-orange-200">{g.animation}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-sm font-black text-yellow-600">{g.coins.toLocaleString()} coins</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{(g.uses / 1000).toFixed(1)}K uses</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ──────────── STICKER PACKS ──────────── */}
        <TabsContent value="stickers" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{fp.filter(p => p.enabled).length} active · {fp.filter(p => !p.enabled).length} hidden</p>
            <Button size="sm" onClick={() => openPackDialog()} className="bg-blue-600 hover:bg-blue-700 gap-1.5">
              <Plus className="w-4 h-4" /> Add Pack
            </Button>
          </div>
          <div className="space-y-3">
            {fp.map(pack => (
              <Card key={pack.id} className={`transition-opacity ${!pack.enabled ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 flex items-center justify-center text-3xl shrink-0">{pack.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold">{pack.name}</p>
                        <Badge variant="outline" className="text-[10px]">{pack.category}</Badge>
                        {pack.type === "premium"
                          ? <Badge className="text-[10px] bg-yellow-100 text-yellow-800 border-yellow-300">{pack.price} coins</Badge>
                          : <Badge className="text-[10px] bg-green-100 text-green-800 border-green-300">Free</Badge>}
                        <Badge variant="outline" className="text-[10px]">{pack.stickers.length} stickers</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {pack.stickers.map(s => (
                          <span key={s.id} className="text-xl" title={s.name}>{s.emoji}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setExpandedPack(expandedPack === pack.id ? null : pack.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        {expandedPack === pack.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button onClick={() => togglePack(pack.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        {pack.enabled ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      <button onClick={() => openPackDialog(pack)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button onClick={() => deletePack(pack.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>
                  {expandedPack === pack.id && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Individual Stickers</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {pack.stickers.map(s => (
                          <div key={s.id} className="rounded-xl border bg-muted/30 p-2 text-center">
                            <div className="text-2xl mb-0.5">{s.emoji}</div>
                            <p className="text-[10px] text-muted-foreground truncate">{s.name}</p>
                          </div>
                        ))}
                        <button className="rounded-xl border-2 border-dashed border-muted-foreground/30 p-2 flex flex-col items-center justify-center gap-0.5 hover:bg-muted/50 transition-colors">
                          <Plus className="w-4 h-4 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Add</span>
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ──────────── BADGES & FRAMES ──────────── */}
        <TabsContent value="badges" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1"><Star className="w-3 h-3" /> {badges.filter(b => b.type === "achievement").length} Achievement</Badge>
              <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-200"><Crown className="w-3 h-3" /> {badges.filter(b => b.type === "premium").length} Premium</Badge>
              <Badge variant="outline" className="gap-1 text-purple-600 border-purple-200"><ImageIcon className="w-3 h-3" /> {badges.filter(b => b.type === "frame").length} Frames</Badge>
            </div>
            <Button size="sm" onClick={() => openBadgeDialog()} className="bg-yellow-600 hover:bg-yellow-700 gap-1.5">
              <Plus className="w-4 h-4" /> Add Badge
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {fb.map(b => {
              const typeColor = b.type === "achievement" ? "from-green-50 to-emerald-50 border-green-200" :
                                b.type === "premium"     ? "from-yellow-50 to-amber-50 border-yellow-200" :
                                                           "from-purple-50 to-violet-50 border-purple-200";
              const typePill  = b.type === "achievement" ? "bg-green-100 text-green-800 border-green-300" :
                                b.type === "premium"     ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                                                           "bg-purple-100 text-purple-800 border-purple-300";
              return (
                <Card key={b.id} className={`transition-opacity ${!b.enabled ? "opacity-60" : ""}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${typeColor} border-2 flex items-center justify-center text-3xl`}>{b.emoji}</div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleBadge(b.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          {b.enabled ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                        <button onClick={() => openBadgeDialog(b)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button onClick={() => deleteBadge(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{b.name}</p>
                      <Badge className={`mt-1 text-[10px] px-1.5 py-0 h-4 border ${typePill}`}>
                        {b.type === "frame" ? "Profile Frame" : b.type === "premium" ? "Premium" : "Achievement"}
                      </Badge>
                    </div>
                    <div className="pt-1 border-t space-y-1">
                      {b.type === "achievement" ? (
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{b.criteria}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-yellow-500" />
                          <span className="text-sm font-black text-yellow-600">{b.coins.toLocaleString()} coins</span>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground">{(b.uses / 1000).toFixed(1)}K holders</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ──────────── REEL FILTERS ──────────── */}
        <TabsContent value="filters" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{ff.filter(f => f.tier === "free").length} Free</Badge>
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">{ff.filter(f => f.tier === "premium").length} Premium</Badge>
              <Badge variant="outline" className="text-green-600 border-green-200">{ff.filter(f => f.enabled).length} Active</Badge>
            </div>
            <Button size="sm" onClick={() => openFilterDialog()} className="bg-purple-600 hover:bg-purple-700 gap-1.5">
              <Plus className="w-4 h-4" /> Add Filter
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {ff.map(f => {
              const typeColor = f.type === "beauty" ? "from-pink-50 to-rose-50"   :
                                f.type === "ar"     ? "from-cyan-50 to-blue-50"   :
                                f.type === "graphic"? "from-violet-50 to-purple-50":
                                                      "from-amber-50 to-yellow-50";
              const typeLabel = f.type === "beauty" ? "Beauty" : f.type === "ar" ? "AR Effect" :
                                f.type === "graphic"? "Graphic" : "Color";
              return (
                <Card key={f.id} className={`transition-opacity ${!f.enabled ? "opacity-60" : ""}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${typeColor} border flex items-center justify-center text-3xl`}>{f.emoji}</div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleFilter(f.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          {f.enabled ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                        <button onClick={() => openFilterDialog(f)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button onClick={() => deleteFilter(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{f.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{f.category}</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{typeLabel}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t">
                      {f.tier === "premium" ? (
                        <div className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-yellow-500" />
                          <span className="text-sm font-black text-yellow-600">{f.price} coins</span>
                        </div>
                      ) : (
                        <Badge className="text-[10px] bg-green-100 text-green-800 border-green-300">Free</Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">{(f.uses / 1000).toFixed(1)}K uses</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ──── Add / Edit Gift Dialog ──── */}
      <Dialog open={giftDialog} onOpenChange={setGiftDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editGift ? "Edit Virtual Gift" : "Add New Virtual Gift"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Gift Name</Label>
                <Input placeholder="e.g. Golden Crown" value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Emoji / Icon</Label>
                <Input placeholder="Paste emoji e.g. 👑" value={form.emoji ?? ""} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{GIFT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Animation Type</Label>
                <Select value={form.animation} onValueChange={v => setForm(f => ({ ...f, animation: v }))}>
                  <SelectTrigger><SelectValue placeholder="Animation" /></SelectTrigger>
                  <SelectContent>{ANIMATIONS.map(a => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Price in Coins</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                <Input type="number" min="1" placeholder="e.g. 500" className="pl-9" value={form.coins ?? ""} onChange={e => setForm(f => ({ ...f, coins: e.target.value }))} />
              </div>
              <p className="text-xs text-muted-foreground">1 coin ≈ ₹0.07 · 500 coins = ₹35</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGiftDialog(false)}>Cancel</Button>
            <Button onClick={saveGift} className="bg-pink-600 hover:bg-pink-700">{editGift ? "Save Changes" : "Add Gift"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──── Add / Edit Sticker Pack Dialog ──── */}
      <Dialog open={stickerDialog} onOpenChange={setStickerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editPack ? "Edit Sticker Pack" : "Add New Sticker Pack"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pack Name</Label>
                <Input placeholder="e.g. Festive Vibes" value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Cover Emoji</Label>
                <Input placeholder="Paste emoji" value={form.emoji ?? ""} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{STICKER_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Pack Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium (coins)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.type === "premium" && (
              <div className="space-y-1.5">
                <Label>Pack Price (coins)</Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                  <Input type="number" min="1" className="pl-9" placeholder="e.g. 100" value={form.price ?? ""} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStickerDialog(false)}>Cancel</Button>
            <Button onClick={savePack} className="bg-blue-600 hover:bg-blue-700">{editPack ? "Save Changes" : "Create Pack"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──── Add / Edit Badge Dialog ──── */}
      <Dialog open={badgeDialog} onOpenChange={setBadgeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editBadge ? "Edit Badge / Frame" : "Add New Badge / Frame"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Badge Name</Label>
                <Input placeholder="e.g. Diamond King" value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Emoji</Label>
                <Input placeholder="Paste emoji" value={form.emoji ?? ""} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Badge Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="achievement">Achievement (auto-awarded)</SelectItem>
                  <SelectItem value="premium">Premium (buy with coins)</SelectItem>
                  <SelectItem value="frame">Profile Frame (buy with coins)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === "achievement" ? (
              <div className="space-y-1.5">
                <Label>Award Criteria</Label>
                <Input placeholder="e.g. Reach 1000 followers" value={form.criteria ?? ""} onChange={e => setForm(f => ({ ...f, criteria: e.target.value }))} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Price (coins)</Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                  <Input type="number" min="1" className="pl-9" placeholder="e.g. 1500" value={form.coins ?? ""} onChange={e => setForm(f => ({ ...f, coins: e.target.value }))} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBadgeDialog(false)}>Cancel</Button>
            <Button onClick={saveBadge} className="bg-yellow-600 hover:bg-yellow-700">{editBadge ? "Save Changes" : "Add Badge"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──── Add / Edit Filter Dialog ──── */}
      <Dialog open={filterDialog} onOpenChange={setFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editFilter ? "Edit Reel Filter" : "Add New Reel Filter"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Filter Name</Label>
                <Input placeholder="e.g. Neon Glow" value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Emoji / Preview</Label>
                <Input placeholder="Paste emoji" value={form.emoji ?? ""} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{FILTER_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Filter Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="ar">AR Effect</SelectItem>
                    <SelectItem value="graphic">Graphic Overlay</SelectItem>
                    <SelectItem value="color">Color Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={v => setForm(f => ({ ...f, tier: v }))}>
                  <SelectTrigger><SelectValue placeholder="Tier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free for all users</SelectItem>
                    <SelectItem value="premium">Premium (unlock with coins)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.tier === "premium" && (
                <div className="space-y-1.5">
                  <Label>Unlock Price (coins)</Label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                    <Input type="number" min="1" className="pl-9" placeholder="e.g. 200" value={form.price ?? ""} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterDialog(false)}>Cancel</Button>
            <Button onClick={saveFilter} className="bg-purple-600 hover:bg-purple-700">{editFilter ? "Save Changes" : "Add Filter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

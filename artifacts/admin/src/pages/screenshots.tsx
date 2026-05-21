import { useState } from "react";
import {
  Heart, MessageCircle, Share2, Bookmark, Play,
  Home, Search, PlusCircle, Bell, User,
  Coins, Crown, Star, Radio, Zap, Gift,
  ChevronLeft, ChevronRight, Download, Monitor,
  X, Check, Flame, TrendingUp,
} from "lucide-react";

const PURPLE  = "#7B2FBE";
const PINK    = "#E91E8C";
const GRAD    = `linear-gradient(135deg, ${PURPLE}, ${PINK})`;

// ── Slide definitions ──────────────────────────────────────────────────────
const SLIDES = [
  "onboarding",
  "home-feed",
  "live-stream",
  "dating",
  "coins",
  "profile",
] as const;
type SlideId = typeof SLIDES[number];

const SLIDE_META: Record<SlideId, { title: string; subtitle: string; bg: string }> = {
  "onboarding":   { title: "India's #1 Social App",      subtitle: "Connect · Stream · Date · Earn",      bg: "linear-gradient(160deg,#0d001a 0%,#2d0a5e 60%,#1a001a 100%)" },
  "home-feed":    { title: "Your Personalised Feed",      subtitle: "Stories · Posts · Reels · Reactions",  bg: "linear-gradient(160deg,#0a0a12 0%,#1a0533 100%)" },
  "live-stream":  { title: "Go Live Instantly",           subtitle: "Earn coins · Gifts · Top Creators",    bg: "linear-gradient(160deg,#0a0a12 0%,#1a0020 100%)" },
  "dating":       { title: "Find Your Match",             subtitle: "Swipe · Connect · Chat",               bg: "linear-gradient(160deg,#0a0a12 0%,#2d0a5e 100%)" },
  "coins":        { title: "Ridhi Coins & VIP",           subtitle: "Recharge · Gift · Unlock Perks",       bg: "linear-gradient(160deg,#0a0a12 0%,#1a1a00 100%)" },
  "profile":      { title: "Your Creator Profile",        subtitle: "Stats · Posts · Followers · Earnings", bg: "linear-gradient(160deg,#0a0a12 0%,#1a0533 100%)" },
};

// ── Individual screen renders ──────────────────────────────────────────────
function SlideOnboarding() {
  return (
    <div className="flex flex-col items-center justify-between h-full px-6 py-8 text-white"
      style={{ background: SLIDE_META.onboarding.bg }}>
      <div />
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
          style={{ background: GRAD }}>
          <span className="text-white font-black text-4xl">R</span>
        </div>
        <div>
          <h1 className="text-4xl font-black leading-tight">Ridhi</h1>
          <p className="text-purple-300 text-lg mt-1 font-medium">India's Social Universe</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          {[
            { emoji: "🎥", label: "Live Streams" },
            { emoji: "💬", label: "Voice Rooms" },
            { emoji: "❤️",  label: "Dating & Match" },
            { emoji: "🪙", label: "Coin Economy" },
            { emoji: "🎬", label: "Reels & Shorts" },
            { emoji: "💼", label: "Jobs Board" },
          ].map(({ emoji, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-semibold text-white/90">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          <div className="rounded-full px-6 py-3 text-sm font-bold text-white"
            style={{ background: GRAD }}>Get Started</div>
          <div className="rounded-full px-6 py-3 text-sm font-bold text-white/70 border border-white/20">
            Sign In
          </div>
        </div>
      </div>
      <p className="text-white/30 text-xs">Available in 13 Indian languages</p>
    </div>
  );
}

function SlideHomeFeed() {
  const stories = ["Priya", "Arjun", "Sneha", "Rahul", "Meera", "Dev"];
  return (
    <div className="flex flex-col h-full text-white"
      style={{ background: SLIDE_META["home-feed"].bg }}>
      {/* Status bar */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1 text-xs text-white/60">
        <span>9:41</span><span>●●●●</span>
      </div>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex gap-4 text-sm font-bold">
          <span style={{ color: PINK, borderBottom: `2px solid ${PINK}`, paddingBottom: 4 }}>For You</span>
          <span className="text-white/40">Trending</span>
          <span className="text-white/40">Following</span>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}>
          <Bell className="w-4 h-4" />
        </div>
      </div>
      {/* Stories */}
      <div className="flex gap-3 px-4 pb-3 overflow-hidden">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center border-white/30">
            <PlusCircle className="w-5 h-5 text-white/50" />
          </div>
          <span className="text-[9px] text-white/50">Add</span>
        </div>
        {stories.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-12 h-12 rounded-full p-0.5"
              style={{ background: GRAD }}>
              <div className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: `hsl(${i * 40 + 250},60%,25%)` }}>{s[0]}</div>
            </div>
            <span className="text-[9px] text-white/60">{s}</span>
          </div>
        ))}
      </div>
      {/* Post card */}
      <div className="mx-4 rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-2 p-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            style={{ background: GRAD }}>P</div>
          <div>
            <p className="text-xs font-bold">Priya Sharma</p>
            <p className="text-[9px] text-white/40">Mumbai · 2h ago</p>
          </div>
          <Crown className="w-4 h-4 ml-auto" style={{ color: "#FFD700" }} />
        </div>
        <div className="h-32 flex items-center justify-center text-4xl"
          style={{ background: `linear-gradient(135deg, hsl(280,60%,20%), hsl(330,60%,20%))` }}>
          🌸
        </div>
        <div className="p-3">
          <p className="text-xs text-white/80 leading-relaxed">Kuch meetha ho jaye! 🎉 Celebrating 10K followers on Ridhi ✨</p>
          <div className="flex gap-4 mt-3 text-white/50">
            <button className="flex items-center gap-1 text-xs"><Heart className="w-3.5 h-3.5" style={{ color: PINK }} />4.2K</button>
            <button className="flex items-center gap-1 text-xs"><MessageCircle className="w-3.5 h-3.5" />328</button>
            <button className="flex items-center gap-1 text-xs"><Share2 className="w-3.5 h-3.5" />89</button>
            <button className="flex items-center gap-1 text-xs ml-auto"><Bookmark className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
      {/* Bottom nav */}
      <div className="flex justify-around items-center mt-auto px-2 py-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)" }}>
        {[
          { Icon: Home,       active: true  },
          { Icon: Search,     active: false },
          { Icon: PlusCircle, active: false },
          { Icon: Heart,      active: false },
          { Icon: User,       active: false },
        ].map(({ Icon, active }, i) => (
          <div key={i} className="w-10 h-10 flex items-center justify-center">
            <Icon className="w-5 h-5" style={{ color: active ? PINK : "rgba(255,255,255,0.35)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideLiveStream() {
  return (
    <div className="flex flex-col h-full text-white relative"
      style={{ background: "linear-gradient(160deg,#0a0a12 0%,#2d0a1e 100%)" }}>
      {/* Live header */}
      <div className="absolute top-0 inset-x-0 flex justify-between items-start p-4 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-red-500">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
          </div>
          <span className="text-xs text-white/70">28,441 watching</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center gap-1">
            <Coins className="w-3 h-3" />₹2.4L earned
          </div>
          <X className="w-5 h-5 text-white/60" />
        </div>
      </div>

      {/* Host avatar area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-28 h-28 rounded-full p-1" style={{ background: GRAD }}>
          <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-black"
            style={{ background: "linear-gradient(135deg,#2d0a5e,#1a0020)" }}>S</div>
        </div>
        <div className="text-center">
          <p className="font-black text-lg">Sneha Kapoor</p>
          <div className="flex items-center gap-1 justify-center">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-bold">Diamond Host</span>
          </div>
        </div>

        {/* Floating gifts */}
        <div className="flex gap-2 mt-2">
          {["🌹","💎","🎉","🚀","👑"].map((e, i) => (
            <div key={i} className="w-10 h-10 flex items-center justify-center rounded-2xl text-xl"
              style={{ background: "rgba(255,255,255,0.1)" }}>{e}</div>
          ))}
        </div>
      </div>

      {/* Comments strip */}
      <div className="px-4 space-y-1.5 mb-3">
        {[
          { name: "Arjun", msg: "Dil se ❤️", color: "#7B2FBE" },
          { name: "Priya",  msg: "Amazing voice! 🔥", color: "#E91E8C" },
          { name: "Rahul", msg: "Sent you a Crown 👑", color: "#FFD700" },
        ].map(({ name, msg, color }) => (
          <div key={name} className="flex items-center gap-2 text-xs">
            <span className="font-bold" style={{ color }}>{name}</span>
            <span className="text-white/70">{msg}</span>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-2 px-4 pb-6">
        <div className="flex-1 rounded-full px-4 py-2.5 text-xs text-white/40 border border-white/20">
          Say something...
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: GRAD }}>
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10">
          <Heart className="w-5 h-5" style={{ color: PINK }} />
        </div>
      </div>
    </div>
  );
}

function SlideDating() {
  return (
    <div className="flex flex-col h-full text-white"
      style={{ background: SLIDE_META.dating.bg }}>
      <div className="flex justify-between items-center px-4 pt-6 pb-2">
        <div>
          <h2 className="font-black text-xl">Discover</h2>
          <p className="text-xs text-white/40">Mumbai, India</p>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Zap className="w-4 h-4" style={{ color: PINK }} />
          </div>
        </div>
      </div>

      {/* Card stack */}
      <div className="relative mx-4 mt-2 flex-1" style={{ maxHeight: 340 }}>
        {/* Back card */}
        <div className="absolute inset-0 rounded-3xl scale-95 -translate-y-2"
          style={{ background: "linear-gradient(160deg, #3d1a6e, #1a003a)", border: "1px solid rgba(255,255,255,0.1)" }} />
        {/* Front card */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(160deg, #4a1080, #220050)", border: "1px solid rgba(255,255,255,0.18)" }}>
          <div className="h-full flex flex-col justify-end p-5"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-16 h-16 rounded-full text-3xl flex items-center justify-center font-black"
                style={{ background: GRAD }}>A</div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <Radio className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="font-black text-xl">Aditi, 24</p>
            <p className="text-xs text-white/60 mt-0.5">Product Designer · Mumbai</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {["Travel ✈️","Music 🎵","Foodie 🍜"].map((t) => (
                <span key={t} className="text-[10px] px-2 py-1 rounded-full font-medium"
                  style={{ background: "rgba(123,47,190,0.4)", border: "1px solid rgba(123,47,190,0.5)" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center items-center gap-6 py-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <X className="w-6 h-6 text-white/60" />
        </div>
        <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl" style={{ background: GRAD }}>
          <Heart className="w-7 h-7 text-white" />
        </div>
        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <Star className="w-6 h-6 text-yellow-400" />
        </div>
      </div>
    </div>
  );
}

function SlideCoins() {
  const packs = [
    { coins: "100", price: "₹49",   bonus: "",      tag: "" },
    { coins: "500", price: "₹149",  bonus: "+50",   tag: "Popular" },
    { coins: "2000",price: "₹499",  bonus: "+300",  tag: "" },
    { coins: "5000",price: "₹999",  bonus: "+1000", tag: "Best Value" },
  ];
  return (
    <div className="flex flex-col h-full text-white"
      style={{ background: SLIDE_META.coins.bg }}>
      <div className="flex items-center gap-2 px-4 pt-6 pb-2">
        <ChevronLeft className="w-5 h-5 text-white/60" />
        <h2 className="font-black text-lg flex-1">Coin Wallet</h2>
        <Crown className="w-5 h-5" style={{ color: "#FFD700" }} />
      </div>

      {/* Balance card */}
      <div className="mx-4 rounded-2xl p-5 mb-4"
        style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PINK})` }}>
        <p className="text-xs text-white/70 mb-1">Your Balance</p>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black">12,840</span>
          <span className="text-sm text-white/70 mb-1">Coins</span>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="text-xs bg-white/20 rounded-full px-3 py-1">≈ ₹2,568 value</div>
          <div className="text-xs bg-white/20 rounded-full px-3 py-1 flex items-center gap-1">
            <Flame className="w-3 h-3" />Daily bonus active
          </div>
        </div>
      </div>

      {/* Packs */}
      <p className="px-4 text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Recharge Packs</p>
      <div className="grid grid-cols-2 gap-2 px-4">
        {packs.map(({ coins, price, bonus, tag }) => (
          <div key={coins} className="rounded-xl p-3 relative"
            style={{ background: "rgba(255,255,255,0.07)", border: tag ? `1px solid ${PINK}` : "1px solid rgba(255,255,255,0.1)" }}>
            {tag && (
              <span className="absolute -top-2 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: PINK }}>{tag}</span>
            )}
            <div className="flex items-center gap-1 mb-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-black text-base">{coins}</span>
              {bonus && <span className="text-[10px] text-green-400 font-bold">{bonus}</span>}
            </div>
            <p className="text-lg font-black" style={{ color: PINK }}>{price}</p>
          </div>
        ))}
      </div>

      {/* VIP strip */}
      <div className="mx-4 mt-3 rounded-xl p-3 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, rgba(123,47,190,0.3), rgba(233,30,140,0.2))", border: `1px solid ${PURPLE}` }}>
        <Crown className="w-6 h-6 text-yellow-400 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-bold">Upgrade to VIP</p>
          <p className="text-[10px] text-white/50">Silver · Gold · Platinum · Diamond Elite</p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: GRAD }}>View</span>
      </div>
    </div>
  );
}

function SlideProfile() {
  return (
    <div className="flex flex-col h-full text-white"
      style={{ background: SLIDE_META.profile.bg }}>
      {/* Cover */}
      <div className="h-28 relative flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PINK})` }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      </div>

      {/* Avatar + info */}
      <div className="px-4 -mt-10">
        <div className="w-20 h-20 rounded-full p-1 mb-2" style={{ background: GRAD }}>
          <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-black"
            style={{ background: "#1a0533" }}>A</div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-black text-lg">Arjun Mehta</p>
            <p className="text-xs text-white/50">@arjun_creates · Mumbai</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: GRAD }}>
            <Crown className="w-3 h-3" />Diamond
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-0 mt-3 rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          {[
            { val: "248K", lbl: "Followers" },
            { val: "1.2K", lbl: "Following" },
            { val: "842",  lbl: "Posts"     },
            { val: "4.8★", lbl: "Rating"    },
          ].map(({ val, lbl }, i) => (
            <div key={lbl} className="flex-1 py-2.5 text-center"
              style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none", background: "rgba(255,255,255,0.04)" }}>
              <p className="font-black text-sm">{val}</p>
              <p className="text-[9px] text-white/40">{lbl}</p>
            </div>
          ))}
        </div>

        {/* Creator earnings */}
        <div className="mt-3 rounded-xl p-3 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <TrendingUp className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">Creator Earnings</p>
            <p className="text-[10px] text-white/50">This month: <span className="text-green-400 font-bold">₹84,220</span></p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
        </div>

        {/* Post grid preview */}
        <div className="grid grid-cols-3 gap-1 mt-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-square rounded-lg flex items-center justify-center text-2xl"
              style={{ background: `hsl(${i * 40 + 260},40%,20%)` }}>
              {["🌸","🎵","🏙️","❤️","🎬","✨"][i]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SLIDE_COMPONENTS: Record<SlideId, React.ComponentType> = {
  "onboarding":   SlideOnboarding,
  "home-feed":    SlideHomeFeed,
  "live-stream":  SlideLiveStream,
  "dating":       SlideDating,
  "coins":        SlideCoins,
  "profile":      SlideProfile,
};

// ── iPhone frame ───────────────────────────────────────────────────────────
function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: 280, height: 580 }}
    >
      {/* Outer frame */}
      <div
        className="absolute inset-0 rounded-[42px] z-10 pointer-events-none"
        style={{
          border: "8px solid #1a1a1a",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px rgba(0,0,0,0.7)",
        }}
      />
      {/* Notch */}
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 z-20"
        style={{ width: 90, height: 24, background: "#1a1a1a", borderRadius: "0 0 16px 16px" }}
      />
      {/* Side buttons */}
      <div className="absolute -left-[10px] top-24 w-[5px] h-10 rounded-l-full bg-[#1a1a1a]" />
      <div className="absolute -left-[10px] top-36 w-[5px] h-10 rounded-l-full bg-[#1a1a1a]" />
      <div className="absolute -right-[10px] top-28 w-[5px] h-14 rounded-r-full bg-[#1a1a1a]" />
      {/* Screen */}
      <div className="absolute inset-[4px] rounded-[38px] overflow-hidden bg-black">
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ScreenshotsPage() {
  const [current, setCurrent] = useState<number>(0);
  const slide = SLIDES[current];
  const meta  = SLIDE_META[slide];
  const SlideComp = SLIDE_COMPONENTS[slide];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="w-6 h-6 text-primary" /> App Store Screenshot Generator
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            6 branded screens · Required size: <strong>1284 × 2778 px</strong> or <strong>1242 × 2688 px</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            {current + 1} / {SLIDES.length}
          </span>
        </div>
      </div>

      {/* How-to strip */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <p className="font-semibold w-full">How to capture at the right dimensions:</p>
        {[
          "1. Open Chrome DevTools (F12)",
          "2. Click the device toolbar icon (Ctrl+Shift+M)",
          "3. Set size to 428 × 926 — then use browser zoom to screenshot",
          "4. Or use a tool like AppMockUp / Screely to wrap these designs",
        ].map((s) => (
          <span key={s} className="flex items-start gap-1.5 text-xs text-blue-700 w-full">
            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />{s}
          </span>
        ))}
      </div>

      {/* Slide thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {SLIDES.map((s, i) => (
          <button
            key={s}
            onClick={() => setCurrent(i)}
            className="shrink-0 rounded-xl overflow-hidden transition-all"
            style={{
              width: 72, height: 130,
              border: i === current ? `2px solid ${PINK}` : "2px solid transparent",
              boxShadow: i === current ? `0 0 0 2px rgba(233,30,140,0.3)` : undefined,
              background: SLIDE_META[s].bg,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-[9px] font-bold text-center px-1 leading-snug">
                {SLIDE_META[s].title.split(" ").slice(0, 3).join("\n")}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Main preview */}
      <div
        className="flex items-center justify-center rounded-2xl py-10 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #0d001a 0%, #1a0533 50%, #0d0010 100%)`, minHeight: 680 }}
      >
        {/* BG orbs */}
        <div className="absolute top-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-purple-700/20 blur-[80px]" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[250px] h-[250px] rounded-full bg-pink-600/15 blur-[70px]" />

        {/* Prev */}
        <button
          onClick={() => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors hover:bg-white/20"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <IPhoneFrame>
            <SlideComp />
          </IPhoneFrame>

          {/* Caption */}
          <div className="text-center">
            <p className="text-white font-black text-xl">{meta.title}</p>
            <p className="text-white/50 text-sm mt-1">{meta.subtitle}</p>
          </div>

          {/* Dots */}
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  background: i === current ? PINK : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Next */}
        <button
          onClick={() => setCurrent((p) => (p + 1) % SLIDES.length)}
          className="absolute right-4 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors hover:bg-white/20"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Screenshot guide table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Screen</th>
              <th className="text-left px-4 py-3 font-semibold">Caption</th>
              <th className="text-left px-4 py-3 font-semibold">Required size</th>
            </tr>
          </thead>
          <tbody>
            {SLIDES.map((s, i) => (
              <tr
                key={s}
                className="border-t cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setCurrent(i)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ background: GRAD }}>{i + 1}</div>
                    <span className="font-medium capitalize">{s.replace("-", " ")}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{SLIDE_META[s].subtitle}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">1284 × 2778 px</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star, Briefcase, TrendingUp, Zap, Award, ArrowRight, ArrowUp, ArrowDown,
  CheckCircle, Clock, Target, Users, IndianRupee, Radio, Crown,
  Lightbulb, Rocket, Shield, Gift, Calendar, BarChart2, Info,
  ChevronRight, Heart, MessageCircle, Share2, AlertTriangle, XCircle,
  Flame, TrendingDown, Bell, Pause, Ban, FileText, Download} from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { downloadCSV } from "@/lib/utils";

// ── Level definitions ─────────────────────────────────────────────────────────

const HOST_LEVELS = [
  { level: "L1", title: "Bronze",      badge: "🥉", color: "#CD7F32", minCoins:        50_000, minHours: 20,   pkRequired: 0,  perks: ["Basic profile badge", "Gift wall access", "Join PK queue"] },
  { level: "L2", title: "Silver",      badge: "🥈", color: "#9E9E9E", minCoins:       200_000, minHours: 60,   pkRequired: 2,  perks: ["Silver frame effect", "Priority in discovery", "Custom room theme"] },
  { level: "L3", title: "Gold",        badge: "🥇", color: "#FFB800", minCoins:       500_000, minHours: 150,  pkRequired: 5,  perks: ["Gold sparkle entrance", "Coin rain boost +10%", "Fan club unlock"] },
  { level: "L4", title: "Platinum",    badge: "💎", color: "#00BCD4", minCoins:     1_000_000, minHours: 300,  pkRequired: 10, perks: ["Platinum border glow", "Superstar search rank", "Monthly bonus ₹5K"] },
  { level: "L5", title: "Diamond",     badge: "🔷", color: "#2196F3", minCoins:     2_000_000, minHours: 600,  pkRequired: 20, perks: ["Diamond aura effect", "Featured on Explore", "Ridhi promo shoots"] },
  { level: "L6", title: "Elite",       badge: "⭐", color: "#7B2FBE", minCoins:     3_500_000, minHours: 1000, pkRequired: 35, perks: ["Elite crown animation", "Dedicated support agent", "Brand deal referrals"] },
  { level: "L7", title: "Royal Crown", badge: "👑", color: "#E91E8C", minCoins:     5_000_000, minHours: 1500, pkRequired: 50, perks: ["Royal Crown aura", "Co-created events with Ridhi", "Top 1% revenue share"] },
];

const AGENT_LEVELS = [
  { level: "A1", title: "Agent",        icon: "🥉", color: "#9E9E9E", minHosts: 5,   minActiveRate: 60, commission: 2,  perks: ["Basic agent dashboard", "Invite up to 10 hosts", "2% host commission"]             },
  { level: "A2", title: "Senior Agent", icon: "🥈", color: "#4CAF50", minHosts: 20,  minActiveRate: 65, commission: 4,  perks: ["Priority host approval", "Invite up to 40 hosts", "4% host commission"]            },
  { level: "A3", title: "Super Agent",  icon: "🥇", color: "#2196F3", minHosts: 60,  minActiveRate: 70, commission: 6,  perks: ["Super agent badge", "Analytics export", "6% host commission + bonus events"]      },
  { level: "A4", title: "Elite Agent",  icon: "💎", color: "#FF9800", minHosts: 150, minActiveRate: 75, commission: 8,  perks: ["Elite agent portal", "Custom referral link", "8% commission + ₹10K/month bonus"]  },
  { level: "A5", title: "Master Agent", icon: "👑", color: "#E91E8C", minHosts: 250, minActiveRate: 80, commission: 10, perks: ["Master agent title", "Can onboard sub-agents", "10% commission + events + equity"] },
];

// ── Mock current roster with progress data ────────────────────────────────────

const HOSTS_PROGRESS = [
  { id: "h1", name: "Priya Sharma",  level: "L7", coinsReceived: 6_840_000, streamHours: 1240, pkWins: 48, city: "Mumbai"    },
  { id: "h2", name: "Rahul Verma",   level: "L6", coinsReceived: 3_920_000, streamHours:  840, pkWins: 32, city: "Delhi"     },
  { id: "h3", name: "Kavya Reddy",   level: "L5", coinsReceived: 2_140_000, streamHours:  620, pkWins: 24, city: "Hyderabad" },
  { id: "h4", name: "Dev Kumar",     level: "L4", coinsReceived: 1_280_000, streamHours:  440, pkWins: 18, city: "Bangalore" },
  { id: "h5", name: "Meera Pillai",  level: "L3", coinsReceived:   620_000, streamHours:  280, pkWins:  9, city: "Kochi"     },
  { id: "h6", name: "Arjun Shah",    level: "L2", coinsReceived:   240_000, streamHours:  140, pkWins:  4, city: "Surat"     },
  { id: "h7", name: "Riya Das",      level: "L1", coinsReceived:    72_000, streamHours:   48, pkWins:  1, city: "Kolkata"   },
  { id: "h8", name: "Kiran Nair",    level: "L3", coinsReceived:   580_000, streamHours:  210, pkWins:  7, city: "Pune"      },
  { id: "h9", name: "Ananya Sen",    level: "L4", coinsReceived: 1_140_000, streamHours:  390, pkWins: 14, city: "Chennai"   },
  { id: "h10",name: "Rohan Mishra",  level: "L2", coinsReceived:   210_000, streamHours:   98, pkWins:  3, city: "Lucknow"   },
];

const AGENTS_PROGRESS = [
  { id: "a1", name: "Vikram Rao",   level: "A5", hosts: 312, activeHosts: 289, totalHostEarnings: 2_840_000 },
  { id: "a2", name: "Sunita Joshi", level: "A4", hosts: 178, activeHosts: 142, totalHostEarnings: 1_775_000 },
  { id: "a3", name: "Deepak Singh", level: "A3", hosts:  74, activeHosts:  58, totalHostEarnings: 1_400_000 },
  { id: "a4", name: "Meena Kumari", level: "A2", hosts:  28, activeHosts:  19, totalHostEarnings: 1_050_000 },
  { id: "a5", name: "Rajan Pillai", level: "A1", hosts:   7, activeHosts:   5, totalHostEarnings:   600_000 },
  { id: "a6", name: "Preethi Nair", level: "A2", hosts:  24, activeHosts:  16, totalHostEarnings:   950_000 },
];

const RECENT_PROMOTIONS = [
  { name: "Kavya Reddy",   from: "L4", to: "L5", type: "host",  date: "Dec 18", trigger: "Crossed 20L coins threshold" },
  { name: "Deepak Singh",  from: "A2", to: "A3", type: "agent", date: "Dec 15", trigger: "Reached 60 active hosts"      },
  { name: "Ananya Sen",    from: "L3", to: "L4", type: "host",  date: "Dec 10", trigger: "Crossed 10L coins threshold"  },
  { name: "Sunita Joshi",  from: "A3", to: "A4", type: "agent", date: "Nov 28", trigger: "Reached 150 active hosts"     },
  { name: "Meera Pillai",  from: "L2", to: "L3", type: "host",  date: "Nov 22", trigger: "Crossed 5L coins threshold"   },
];

// ── Demotion-risk roster ───────────────────────────────────────────────────────

const HOST_DEMOTION_RISK = [
  { id: "hd1", name: "Arjun Shah",   level: "L2", lastStream: 38, coinsThisMonth:  12_000, trend: "declining", risk: "critical", reason: "38 days inactive — demotion in 22 days if no stream",  city: "Surat"     },
  { id: "hd2", name: "Rohan Mishra", level: "L2", lastStream: 22, coinsThisMonth:  28_000, trend: "declining", risk: "warning",  reason: "22 days since last stream — 8 days before warning lock", city: "Lucknow"   },
  { id: "hd3", name: "Kiran Nair",   level: "L3", lastStream: 14, coinsThisMonth:  41_000, trend: "flat",      risk: "watch",   reason: "Monthly coins down 60% vs last month — monitoring",      city: "Pune"      },
  { id: "hd4", name: "Riya Das",     level: "L1", lastStream:  9, coinsThisMonth:   8_000, trend: "declining", risk: "watch",   reason: "Earning rate 45% below L1 average — early signal",       city: "Kolkata"   },
];

const AGENT_DEMOTION_RISK = [
  { id: "ad1", name: "Rajan Pillai", level: "A1", hosts: 7,  activeHosts:  3, activeRate: 43, trend: "declining", risk: "critical", reason: "Active rate 43% for 2 consecutive months — below 60% threshold"   },
  { id: "ad2", name: "Preethi Nair", level: "A2", hosts: 24, activeHosts: 13, activeRate: 54, trend: "declining", risk: "warning",  reason: "Active rate fell from 67% → 54% in 30 days — on watch"           },
  { id: "ad3", name: "Meena Kumari", level: "A2", hosts: 28, activeHosts: 19, activeRate: 68, trend: "flat",      risk: "watch",   reason: "No new host onboarded in 45 days — recruitment stalled"          },
];

// Pending manual promo requests (submitted by agents / admins for SA approval)
const PENDING_PROMOS = [
  { id: "pp1", type: "host",  name: "Dev Kumar",   currentLevel: "L4", targetLevel: "L5", requestedBy: "agent.rahul@ridhi.app",  reason: "Met all thresholds, event host partner",       date: "Dec 20" },
  { id: "pp2", type: "agent", name: "Deepak Singh", currentLevel: "A3", targetLevel: "A4", requestedBy: "super-admin@ridhi.app", reason: "Consistently 80%+ active rate past 3 months", date: "Dec 19" },
  { id: "pp3", type: "host",  name: "Meera Pillai", currentLevel: "L3", targetLevel: "L4", requestedBy: "agent.rahul@ridhi.app", reason: "Brand tie-up, needs L4 for fan club unlock",  date: "Dec 17" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(val: number, max: number) { return Math.min(100, Math.round((val / max) * 100)); }
function fmtCoins(n: number) {
  if (n >= 10_000_000) return (n / 10_000_000).toFixed(1) + "Cr";
  if (n >= 100_000)   return (n / 100_000).toFixed(1) + "L";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

function nextLevel<T extends { level: string }>(current: string, levels: T[]): T | null {
  const idx = levels.findIndex(l => l.level === current);
  return idx !== -1 && idx < levels.length - 1 ? levels[idx + 1] : null;
}
function currentLevel<T extends { level: string }>(lv: string, levels: T[]): T {
  return levels.find(l => l.level === lv)!;
}

// ── Host Strategy Cards ───────────────────────────────────────────────────────

const HOST_STRATEGIES = [
  {
    icon: Clock,
    color: "text-blue-600 bg-blue-50",
    title: "Stream Consistently",
    body: "Go live for at least 2–3 hours every day. The algorithm rewards streak-based consistency — hosts who stream 7 days in a row get a 25% visibility boost in discovery.",
    tag: "Core habit",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: Zap,
    color: "text-yellow-600 bg-yellow-50",
    title: "Win PK Battles",
    body: "PK Battles are the fastest coin accelerator. Win streaks trigger 'PK Fever' which floods your room with gifters. Target 3 PK sessions per week minimum.",
    tag: "High impact",
    tagColor: "bg-yellow-100 text-yellow-700",
  },
  {
    icon: Heart,
    color: "text-pink-600 bg-pink-50",
    title: "Build a Fan Club",
    body: "Unlock Fan Clubs at L3+. Club members get exclusive access and send 2× gifts. A host with 50 club members earns 3× more coins than one without.",
    tag: "Retention driver",
    tagColor: "bg-pink-100 text-pink-700",
  },
  {
    icon: Gift,
    color: "text-purple-600 bg-purple-50",
    title: "Host Event Streams",
    body: "Special event streams (birthday, festivals, milestones) generate surge gifting. Ridhi promotes event streams in the app banner — agent should schedule these.",
    tag: "Coin surge",
    tagColor: "bg-purple-100 text-purple-700",
  },
  {
    icon: MessageCircle,
    color: "text-green-600 bg-green-50",
    title: "Engage Your Audience",
    body: "Hosts who respond to comments and call out gifters by name see 40% longer session times. Longer sessions = more gifting windows. Coach every host on this.",
    tag: "Session length",
    tagColor: "bg-green-100 text-green-700",
  },
  {
    icon: Share2,
    color: "text-orange-600 bg-orange-50",
    title: "Cross-Platform Promotion",
    body: "Promote live sessions on WhatsApp, Instagram Reels, and YouTube Shorts 30 min before going live. Agents should help hosts build an off-app audience funnel.",
    tag: "Traffic growth",
    tagColor: "bg-orange-100 text-orange-700",
  },
];

const AGENT_STRATEGIES = [
  {
    icon: Rocket,
    color: "text-violet-600 bg-violet-50",
    title: "Recruit Quality Over Quantity",
    body: "Focus on hosts who already have a social media following (>5K on any platform). They hit L3 in 60 days vs 180 days for cold recruits — accelerating your host count.",
    tag: "Recruit smarter",
    tagColor: "bg-violet-100 text-violet-700",
  },
  {
    icon: Target,
    color: "text-blue-600 bg-blue-50",
    title: "Daily Check-in Routine",
    body: "Call every host once daily for the first 30 days. Hosts with active agents have 3× better 30-day retention. Early drop-off is the main blocker for A1→A2 agents.",
    tag: "Retention",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: Calendar,
    color: "text-green-600 bg-green-50",
    title: "Monthly Stream Targets",
    body: "Set clear monthly coin targets for each host based on their level goal. Break it into weekly micro-goals (e.g., 40K coins/week to hit L2 in 5 weeks).",
    tag: "Goal setting",
    tagColor: "bg-green-100 text-green-700",
  },
  {
    icon: BarChart2,
    color: "text-orange-600 bg-orange-50",
    title: "Monitor Active Rate",
    body: "Level-up requires 60–80% active host ratio depending on target level. Remove or re-motivate inactive hosts early — a host inactive for 14 days rarely recovers.",
    tag: "Active ratio",
    tagColor: "bg-orange-100 text-orange-700",
  },
  {
    icon: Shield,
    color: "text-pink-600 bg-pink-50",
    title: "KYC Fast-Track",
    body: "Unverified hosts cannot access coin payouts, limiting their motivation. Get all new hosts KYC-verified within 7 days of onboarding to unlock full incentives.",
    tag: "Compliance",
    tagColor: "bg-pink-100 text-pink-700",
  },
  {
    icon: Users,
    color: "text-teal-600 bg-teal-50",
    title: "Create Host Communities",
    body: "Create a WhatsApp group for your hosts. Peer motivation, shared gifting campaigns, and challenge boards drive collective performance — top agents run weekly leaderboards.",
    tag: "Community",
    tagColor: "bg-teal-100 text-teal-700",
  },
];

// ── "Ready to Promote" component ──────────────────────────────────────────────

function HostReadyList() {
  return (
    <div className="space-y-3">
      {HOSTS_PROGRESS.map(h => {
        const curr  = currentLevel(h.level, HOST_LEVELS);
        const next  = nextLevel(h.level, HOST_LEVELS);
        if (!next) return (
          <div key={h.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl">
            <span className="text-xl">{curr.badge}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.city}</p>
            </div>
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs">👑 Max Level — Royal Crown</Badge>
          </div>
        );

        const coinPct  = pct(h.coinsReceived, next.minCoins);
        const hourPct  = pct(h.streamHours, next.minHours);
        const pkPct    = pct(h.pkWins, next.pkRequired);
        const overall  = Math.min(coinPct, hourPct, next.pkRequired > 0 ? pkPct : 100);
        const isReady  = overall >= 100;
        const isClose  = overall >= 75 && !isReady;

        return (
          <div key={h.id} className={`rounded-xl border p-4 transition-all ${isReady ? "border-green-300 bg-green-50" : isClose ? "border-amber-200 bg-amber-50/40" : "border-border bg-background"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{curr.badge}</span>
                <div>
                  <p className="font-semibold text-sm">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.city} · {curr.level} {curr.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isReady  && <Badge className="bg-green-600 text-white gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Ready to Promote</Badge>}
                {isClose  && <Badge variant="outline" className="border-amber-400 text-amber-700 gap-1 text-xs"><Clock className="w-3 h-3" /> Close ({overall}%)</Badge>}
                {!isReady && !isClose && <span className="text-xs text-muted-foreground">{overall}% to next</span>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{next.badge} {next.level} {next.title}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Coins", value: fmtCoins(h.coinsReceived), target: fmtCoins(next.minCoins), p: coinPct, color: "#E91E8C" },
                { label: "Stream Hours", value: h.streamHours + "h", target: next.minHours + "h", p: hourPct, color: "#2196F3" },
                { label: "PK Wins", value: String(h.pkWins), target: String(next.pkRequired), p: next.pkRequired > 0 ? pkPct : 100, color: "#FF9800" },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.value} / {m.target}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, m.p)}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              ))}
            </div>
            {isReady && (
              <div className="mt-3 flex justify-end">
                <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white">
                  <ArrowUp className="w-3 h-3" /> Promote to {next.level}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AgentReadyList() {
  return (
    <div className="space-y-3">
      {AGENTS_PROGRESS.map(ag => {
        const curr    = currentLevel(ag.level, AGENT_LEVELS);
        const next    = nextLevel(ag.level, AGENT_LEVELS);
        const activeRate = Math.round((ag.activeHosts / ag.hosts) * 100);

        if (!next) return (
          <div key={ag.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl">
            <span className="text-xl">{curr.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{ag.name}</p>
              <p className="text-xs text-muted-foreground">{ag.hosts} hosts · {activeRate}% active</p>
            </div>
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs">👑 Max Level — Master Agent</Badge>
          </div>
        );

        const hostPct   = pct(ag.hosts, next.minHosts);
        const ratePct   = pct(activeRate, next.minActiveRate);
        const overall   = Math.min(hostPct, ratePct);
        const isReady   = overall >= 100;
        const isClose   = overall >= 75 && !isReady;

        return (
          <div key={ag.id} className={`rounded-xl border p-4 ${isReady ? "border-green-300 bg-green-50" : isClose ? "border-amber-200 bg-amber-50/40" : "border-border bg-background"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{curr.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{ag.name}</p>
                  <p className="text-xs text-muted-foreground">{curr.level} {curr.title} · {ag.hosts} hosts</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isReady && <Badge className="bg-green-600 text-white gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Ready to Promote</Badge>}
                {isClose && <Badge variant="outline" className="border-amber-400 text-amber-700 gap-1 text-xs"><Clock className="w-3 h-3" /> Close ({overall}%)</Badge>}
                {!isReady && !isClose && <span className="text-xs text-muted-foreground">{overall}% to {next.level}</span>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{next.icon} {next.level} {next.title}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Hosts", value: String(ag.hosts), target: String(next.minHosts), p: hostPct, color: "#7B2FBE" },
                { label: "Active Rate", value: activeRate + "%", target: next.minActiveRate + "%", p: ratePct, color: "#4CAF50" },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.value} / {m.target}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, m.p)}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              ))}
            </div>
            {isReady && (
              <div className="mt-3 flex justify-end">
                <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white">
                  <ArrowUp className="w-3 h-3" /> Promote to {next.level}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Promotion Mechanics explainer ─────────────────────────────────────────────

function MechanicsCard({ type }: { type: "host" | "agent" }) {
  const isHost = type === "host";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="w-4 h-4 text-violet-500" />
          How {isHost ? "Host" : "Agent"} Promotion Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Flow */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: isHost ? "Earn Coins (gifts)" : "Recruit Hosts",          color: "bg-green-100 text-green-800 border-green-300",  icon: isHost ? Gift : Users     },
            { label: isHost ? "Meet stream hours"  : "Keep them active",        color: "bg-blue-100 text-blue-800 border-blue-300",    icon: Clock                     },
            { label: isHost ? "Win PK battles"     : "Hit active rate target",  color: "bg-orange-100 text-orange-800 border-orange-300",icon: Zap                    },
            { label: "System checks thresholds",                                 color: "bg-purple-100 text-purple-800 border-purple-300",icon: Shield                  },
            { label: "Admin reviews & approves",                                 color: "bg-pink-100 text-pink-800 border-pink-300",     icon: CheckCircle              },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
              <div className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1.5 text-xs font-medium ${step.color}`}>
                <step.icon className="w-3.5 h-3.5" />
                {step.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Auto vs Manual */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Promotion Type</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0 mt-0.5 flex items-center justify-center"><CheckCircle className="w-2.5 h-2.5 text-white" /></span>
                <div>
                  <p className="font-semibold text-xs">Auto-Promotion</p>
                  <p className="text-xs text-muted-foreground">System checks thresholds daily at midnight. Sends a push notification when eligible.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-violet-500 flex-shrink-0 mt-0.5 flex items-center justify-center"><Shield className="w-2.5 h-2.5 text-white" /></span>
                <div>
                  <p className="font-semibold text-xs">Manual Override (SA only)</p>
                  <p className="text-xs text-muted-foreground">Super Admin can fast-track a promotion for strategic reasons (e.g., event partner).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Typical Timeline</p>
            <div className="space-y-1.5 text-xs">
              {(isHost ? [
                { from: "New → L1", time: "1–2 weeks",   note: "50K coins threshold" },
                { from: "L1 → L2",  time: "3–6 weeks",   note: "200K coins target"   },
                { from: "L2 → L3",  time: "6–12 weeks",  note: "500K coins + hours"  },
                { from: "L3 → L4",  time: "3–5 months",  note: "1M coins milestone"  },
                { from: "L4 → L5",  time: "5–9 months",  note: "2M coins + PK wins"  },
              ] : [
                { from: "New → A1", time: "2–4 weeks",   note: "Recruit 5 hosts"    },
                { from: "A1 → A2",  time: "1–2 months",  note: "20 active hosts"    },
                { from: "A2 → A3",  time: "2–4 months",  note: "60 hosts + 70% rate"},
                { from: "A3 → A4",  time: "4–8 months",  note: "150 hosts target"   },
                { from: "A4 → A5",  time: "8–14 months", note: "250 hosts + 80% rate"},
              ]).map(t => (
                <div key={t.from} className="flex items-center justify-between">
                  <span className="font-medium">{t.from}</span>
                  <span className="text-muted-foreground">{t.time}</span>
                  <span className="text-[10px] text-muted-foreground italic">{t.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demotion risk */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700">Demotion / Freeze Rules</p>
            <div className="space-y-1.5 text-xs text-red-800">
              {(isHost ? [
                "Inactive for 30+ days → level frozen",
                "No stream for 60 days → demoted 1 level",
                "Community violations → immediate review",
                "Coin balance refunded/disputed → recalculated",
              ] : [
                "Active host rate drops below 40% → warning",
                "Below threshold 2 months straight → demoted",
                "Fraudulent host recruitment → immediate removal",
                "No new host in 90 days → level frozen",
              ]).map((r, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold mt-0.5">·</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Progression table ─────────────────────────────────────────────────────────

const hostProgressionChartData = HOST_LEVELS.map(l => ({
  level: l.level,
  coins: l.minCoins / 100_000,
  hours: l.minHours,
  pk: l.pkRequired,
  fill: l.color,
}));

const agentProgressionChartData = AGENT_LEVELS.map(l => ({
  level: l.level,
  hosts: l.minHosts,
  commission: l.commission,
  fill: l.color,
}));

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LevelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("levels_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Levels & Promotion Strategy
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Promotion mechanics, thresholds, current progress, and growth playbook for Hosts (L1–L7) and Agents (A1–A5)
        </p>
      </div>

      {/* Recent promotions ticker */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-violet-600" />
              <p className="text-sm font-bold text-violet-800">Recent Promotions</p>
            </div>
            <Badge className="bg-violet-600 text-white text-xs">{RECENT_PROMOTIONS.length} this month</Badge>
          </div>
          <div className="flex gap-3 flex-wrap">
            {RECENT_PROMOTIONS.map((p, i) => (
              <div key={i} className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2 shadow-sm text-xs">
                <span>{p.type === "host" ? "⭐" : "💼"}</span>
                <span className="font-semibold">{p.name}</span>
                <Badge variant="outline" className="text-[10px] h-4 px-1">{p.from}</Badge>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <Badge className="h-4 px-1 text-[10px] bg-green-600 text-white">{p.to}</Badge>
                <span className="text-muted-foreground">{p.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="hosts">
        <TabsList className="h-9 flex flex-wrap gap-0.5">
          <TabsTrigger value="hosts"     className="text-xs gap-1.5"><Star          className="w-3.5 h-3.5" /> Host Levels</TabsTrigger>
          <TabsTrigger value="agents"    className="text-xs gap-1.5"><Briefcase     className="w-3.5 h-3.5" /> Agent Levels</TabsTrigger>
          <TabsTrigger value="promoq"    className="text-xs gap-1.5"><ArrowUp       className="w-3.5 h-3.5" /> Promotion Queue</TabsTrigger>
          <TabsTrigger value="demotion"  className="text-xs gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Demotion Risk</TabsTrigger>
          <TabsTrigger value="strategy"  className="text-xs gap-1.5"><FileText      className="w-3.5 h-3.5" /> P&D Policy</TabsTrigger>
        </TabsList>

        {/* ═══════════════ HOST TAB ═══════════════ */}
        <TabsContent value="hosts" className="space-y-6 mt-4">

          {/* Level Ladder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4" /> Host Level Ladder — L1 Bronze → L7 Royal Crown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {HOST_LEVELS.map((lvl, i) => {
                const next = HOST_LEVELS[i + 1];
                const hostsAtLevel = HOSTS_PROGRESS.filter(h => h.level === lvl.level).length;
                return (
                  <div key={lvl.level} className="flex items-start gap-4 p-4 rounded-xl border" style={{ borderColor: lvl.color + "40", backgroundColor: lvl.color + "08" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: lvl.color + "20" }}>
                      {lvl.badge}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs font-bold" style={{ borderColor: lvl.color, color: lvl.color }}>{lvl.level}</Badge>
                        <span className="font-bold text-sm" style={{ color: lvl.color }}>{lvl.title}</span>
                        {hostsAtLevel > 0 && <Badge className="text-[10px] h-4 px-1 bg-muted text-muted-foreground border">{hostsAtLevel} hosts currently</Badge>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Gift className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                          <span className="text-muted-foreground">Coins:</span>
                          <span className="font-semibold">🪙 {fmtCoins(lvl.minCoins)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Radio className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="text-muted-foreground">Stream hours:</span>
                          <span className="font-semibold">{lvl.minHours}h</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Zap className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                          <span className="text-muted-foreground">PK wins:</span>
                          <span className="font-semibold">{lvl.pkRequired > 0 ? lvl.pkRequired : "None"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground">Perks:</span>
                        {lvl.perks.map(p => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: lvl.color + "40", color: lvl.color, backgroundColor: lvl.color + "10" }}>{p}</span>
                        ))}
                      </div>
                    </div>
                    {next && (
                      <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-2 py-1.5">
                        <ArrowUp className="w-3 h-3" />
                        <span>+{fmtCoins(next.minCoins - lvl.minCoins)} more coins</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Coin Thresholds by Level (in Lakhs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hostProgressionChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}L`} />
                    <Tooltip formatter={(v: number) => `${v}L coins`} />
                    <Bar dataKey="coins" name="Min Coins (Lakhs)" fill="#E91E8C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Mechanics */}
          <MechanicsCard type="host" />

          {/* Ready to promote */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Host Progress Tracker
                <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs ml-1">
                  {HOSTS_PROGRESS.filter(h => {
                    const next = nextLevel(h.level, HOST_LEVELS);
                    if (!next) return false;
                    return Math.min(pct(h.coinsReceived, next.minCoins), pct(h.streamHours, next.minHours)) >= 100;
                  }).length} ready to promote
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HostReadyList />
            </CardContent>
          </Card>

          {/* Strategy cards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base">Host Growth Playbook — 6 Proven Strategies</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HOST_STRATEGIES.map(s => (
                <Card key={s.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.tagColor}`}>{s.tag}</span>
                    </div>
                    <p className="font-bold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════ AGENT TAB ═══════════════ */}
        <TabsContent value="agents" className="space-y-6 mt-4">

          {/* Level Ladder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4" /> Agent Level Ladder — A1 Agent → A5 Master Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {AGENT_LEVELS.map((lvl, i) => {
                const next  = AGENT_LEVELS[i + 1];
                const count = AGENTS_PROGRESS.filter(a => a.level === lvl.level).length;
                return (
                  <div key={lvl.level} className="flex items-start gap-4 p-4 rounded-xl border" style={{ borderColor: lvl.color + "40", backgroundColor: lvl.color + "08" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: lvl.color + "20" }}>
                      {lvl.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs font-bold" style={{ borderColor: lvl.color, color: lvl.color }}>{lvl.level}</Badge>
                        <span className="font-bold text-sm" style={{ color: lvl.color }}>{lvl.title}</span>
                        {count > 0 && <Badge className="text-[10px] h-4 px-1 bg-muted text-muted-foreground border">{count} agent{count > 1 ? "s" : ""} currently</Badge>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: lvl.color }} />
                          <span className="text-muted-foreground">Min hosts:</span>
                          <span className="font-semibold">{lvl.minHosts}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <TrendingUp className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">Active rate:</span>
                          <span className="font-semibold">{lvl.minActiveRate}%+</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <IndianRupee className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">Commission:</span>
                          <span className="font-semibold text-green-700">{lvl.commission}% of host earnings</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground">Perks:</span>
                        {lvl.perks.map(p => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: lvl.color + "40", color: lvl.color, backgroundColor: lvl.color + "10" }}>{p}</span>
                        ))}
                      </div>
                    </div>
                    {next && (
                      <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-2 py-1.5">
                        <ArrowUp className="w-3 h-3" />
                        <span>+{next.minHosts - lvl.minHosts} more hosts</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Host Count vs Commission Rate by Agent Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentProgressionChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "Hosts", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => v + "%"} label={{ value: "Comm%", angle: 90, position: "insideRight", style: { fontSize: 10 } }} />
                    <Tooltip />
                    <Bar yAxisId="left"  dataKey="hosts"      name="Min Hosts Required" fill="#7B2FBE" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="commission" name="Commission %"        fill="#E91E8C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Mechanics */}
          <MechanicsCard type="agent" />

          {/* Ready to promote */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Agent Progress Tracker
                <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs ml-1">
                  {AGENTS_PROGRESS.filter(ag => {
                    const next = nextLevel(ag.level, AGENT_LEVELS);
                    if (!next) return false;
                    const rate = Math.round((ag.activeHosts / ag.hosts) * 100);
                    return Math.min(pct(ag.hosts, next.minHosts), pct(rate, next.minActiveRate)) >= 100;
                  }).length} ready to promote
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AgentReadyList />
            </CardContent>
          </Card>

          {/* Strategy cards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base">Agent Growth Playbook — 6 Proven Strategies</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AGENT_STRATEGIES.map(s => (
                <Card key={s.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.tagColor}`}>{s.tag}</span>
                    </div>
                    <p className="font-bold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════ PROMOTION QUEUE ═══════════════ */}
        <TabsContent value="promoq" className="space-y-6 mt-4">

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Auto-eligible",    value: HOSTS_PROGRESS.filter(h => { const n = nextLevel(h.level, HOST_LEVELS); return n && Math.min(pct(h.coinsReceived, n.minCoins), pct(h.streamHours, n.minHours)) >= 100; }).length + AGENTS_PROGRESS.filter(ag => { const n = nextLevel(ag.level, AGENT_LEVELS); return n && Math.min(pct(ag.hosts, n.minHosts), pct(Math.round((ag.activeHosts/ag.hosts)*100), n.minActiveRate)) >= 100; }).length, sub: "Meet all thresholds",       icon: CheckCircle,   color: "text-green-600",  bg: "bg-green-50"  },
              { label: "Near Promotion",   value: 5, sub: "75–99% of target",          icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50"  },
              { label: "Pending Approval", value: PENDING_PROMOS.length, sub: "Manual requests",           icon: Bell,          color: "text-blue-600",   bg: "bg-blue-50"   },
              { label: "Promoted (30d)",   value: RECENT_PROMOTIONS.length, sub: "This month",            icon: Rocket,        color: "text-purple-600", bg: "bg-purple-50" },
            ].map(k => (
              <Card key={k.label}>
                <CardContent className="p-4 flex gap-3 items-start">
                  <div className={`p-2.5 rounded-lg ${k.bg}`}><k.icon className={`w-4 h-4 ${k.color}`} /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-2xl font-bold">{k.value}</p>
                    <p className="text-xs text-muted-foreground">{k.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending manual promotion approvals */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" /> Pending Manual Promotion Requests
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">{PENDING_PROMOS.length} awaiting SA approval</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PENDING_PROMOS.map(p => (
                <div key={p.id} className="flex items-start justify-between gap-3 border rounded-xl p-4 bg-blue-50/40 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg">
                      {p.type === "host" ? "⭐" : "💼"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">{p.currentLevel}</Badge>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <Badge className="text-[10px] h-4 px-1 bg-green-600 text-white">{p.targetLevel}</Badge>
                        <span className="text-xs text-muted-foreground">· {p.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">"{p.reason}"</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Requested by {p.requestedBy} · {p.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"><CheckCircle className="w-3 h-3" />Approve</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive/30"><XCircle className="w-3 h-3" />Decline</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Auto-eligible promotions — Hosts */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-pink-500" /> Host Auto-Promotion Queue
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  {HOSTS_PROGRESS.filter(h => { const n = nextLevel(h.level, HOST_LEVELS); return n && Math.min(pct(h.coinsReceived, n.minCoins), pct(h.streamHours, n.minHours)) >= 100; }).length} ready
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent><HostReadyList /></CardContent>
          </Card>

          {/* Auto-eligible promotions — Agents */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-500" /> Agent Auto-Promotion Queue
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  {AGENTS_PROGRESS.filter(ag => { const n = nextLevel(ag.level, AGENT_LEVELS); return n && Math.min(pct(ag.hosts, n.minHosts), pct(Math.round((ag.activeHosts/ag.hosts)*100), n.minActiveRate)) >= 100; }).length} ready
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent><AgentReadyList /></CardContent>
          </Card>

          {/* Promotion timeline explainer */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4 text-violet-500" />Promotion Flow & Timing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Host Promotion Timeline</p>
                  {[
                    { from: "New → L1 Bronze",    time: "1–2 weeks",    note: "50K coins + 20h stream" },
                    { from: "L1 → L2 Silver",     time: "3–6 weeks",    note: "200K coins + 60h + 2 PK wins" },
                    { from: "L2 → L3 Gold",       time: "6–12 weeks",   note: "500K coins + 150h + 5 PK wins" },
                    { from: "L3 → L4 Platinum",   time: "3–5 months",   note: "1M coins + 300h + 10 PK wins" },
                    { from: "L4 → L5 Diamond",    time: "5–9 months",   note: "2M coins + 600h + 20 PK wins" },
                    { from: "L5 → L6 Elite",      time: "9–14 months",  note: "3.5M coins + 1000h + 35 PK wins" },
                    { from: "L6 → L7 Royal Crown","time": "14–24 months", note: "5M coins + 1500h + 50 PK wins" },
                  ].map(t => (
                    <div key={t.from} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 min-w-[130px]">
                        <ArrowUp className="w-3 h-3 text-green-600 shrink-0" />
                        <span className="font-medium">{t.from}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{t.time}</Badge>
                      <span className="text-muted-foreground truncate">{t.note}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Agent Promotion Timeline</p>
                  {[
                    { from: "New → A1 Agent",       time: "2–4 weeks",    note: "5 hosts recruited" },
                    { from: "A1 → A2 Senior Agent",  time: "1–2 months",   note: "20 hosts + 65% active rate" },
                    { from: "A2 → A3 Super Agent",   time: "2–4 months",   note: "60 hosts + 70% active rate" },
                    { from: "A3 → A4 Elite Agent",   time: "4–8 months",   note: "150 hosts + 75% active rate" },
                    { from: "A4 → A5 Master Agent",  time: "8–14 months",  note: "250 hosts + 80% active rate" },
                  ].map(t => (
                    <div key={t.from} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 min-w-[140px]">
                        <ArrowUp className="w-3 h-3 text-purple-600 shrink-0" />
                        <span className="font-medium">{t.from}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{t.time}</Badge>
                      <span className="text-muted-foreground truncate">{t.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ DEMOTION RISK ═══════════════ */}
        <TabsContent value="demotion" className="space-y-6 mt-4">

          {/* Risk KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Critical (action now)", value: HOST_DEMOTION_RISK.filter(h => h.risk === "critical").length + AGENT_DEMOTION_RISK.filter(a => a.risk === "critical").length, sub: "Demotion trigger met",     icon: XCircle,       color: "text-red-600",    bg: "bg-red-50",    badge: "bg-red-600"    },
              { label: "Warning Stage",          value: HOST_DEMOTION_RISK.filter(h => h.risk === "warning").length  + AGENT_DEMOTION_RISK.filter(a => a.risk === "warning").length,  sub: "Near threshold breach",   icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", badge: "bg-orange-500" },
              { label: "Watch List",             value: HOST_DEMOTION_RISK.filter(h => h.risk === "watch").length    + AGENT_DEMOTION_RISK.filter(a => a.risk === "watch").length,    sub: "Declining performance",   icon: TrendingDown,  color: "text-yellow-600", bg: "bg-yellow-50", badge: "bg-yellow-600" },
              { label: "Level Frozen",           value: 1, sub: "Pending review", icon: Pause,         color: "text-gray-600",   bg: "bg-gray-50",   badge: "bg-gray-500"   },
            ].map(k => (
              <Card key={k.label} className={k.label === "Critical (action now)" ? "border-red-200" : ""}>
                <CardContent className="p-4 flex gap-3 items-start">
                  <div className={`p-2.5 rounded-lg ${k.bg}`}><k.icon className={`w-4 h-4 ${k.color}`} /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-2xl font-bold">{k.value}</p>
                    <p className="text-xs text-muted-foreground">{k.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Risk legend */}
          <div className="flex flex-wrap gap-3">
            {[
              { color: "bg-red-500",    label: "Critical",          desc: "Demotion criteria already met — immediate action required" },
              { color: "bg-orange-500", label: "Warning",           desc: "Approaching demotion threshold — proactive outreach needed" },
              { color: "bg-yellow-500", label: "Watch",             desc: "Performance declining — monitor closely for 2 weeks" },
              { color: "bg-gray-400",   label: "Frozen",            desc: "Level locked pending compliance/KYC review" },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2 text-xs bg-muted/40 rounded-lg px-3 py-2">
                <span className={`w-2.5 h-2.5 rounded-full ${r.color} shrink-0`} />
                <span className="font-semibold">{r.label}:</span>
                <span className="text-muted-foreground">{r.desc}</span>
              </div>
            ))}
          </div>

          {/* Host demotion risk */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-pink-500" /> Host Demotion Risk
                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">{HOST_DEMOTION_RISK.filter(h => h.risk === "critical").length} critical</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {HOST_DEMOTION_RISK.map(h => {
                const riskMap = { critical: { border: "border-red-300 bg-red-50/50", badge: "bg-red-600 text-white", icon: XCircle, iconColor: "text-red-600" }, warning: { border: "border-orange-200 bg-orange-50/30", badge: "bg-orange-500 text-white", icon: AlertTriangle, iconColor: "text-orange-600" }, watch: { border: "border-yellow-200 bg-yellow-50/30", badge: "bg-yellow-500 text-white", icon: TrendingDown, iconColor: "text-yellow-600" } };
                const r = riskMap[h.risk as keyof typeof riskMap];
                const RIcon = r.icon;
                return (
                  <div key={h.id} className={`rounded-xl border p-4 ${r.border}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                          <RIcon className={`w-5 h-5 ${r.iconColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{h.name}</p>
                            <Badge variant="outline" className="text-[10px] h-4 px-1">{h.level}</Badge>
                            <Badge className={`text-[10px] h-4 px-1.5 capitalize ${r.badge}`}>{h.risk}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{h.city}</p>
                          <p className="text-xs mt-1 font-medium">{h.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Last stream</p>
                          <p className={`text-sm font-bold ${h.lastStream > 30 ? "text-red-600" : h.lastStream > 14 ? "text-orange-600" : "text-yellow-600"}`}>{h.lastStream}d ago</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Coins / month</p>
                          <p className="text-sm font-bold">{fmtCoins(h.coinsThisMonth)}</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {h.risk === "critical" && (
                            <Button size="sm" className="h-7 text-xs gap-1 bg-red-600 hover:bg-red-700 text-white">
                              <ArrowDown className="w-3 h-3" />Demote to {(() => { const idx = HOST_LEVELS.findIndex(l => l.level === h.level); return idx > 0 ? HOST_LEVELS[idx - 1].level : "—"; })()}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                            <Bell className="w-3 h-3" />Send Warning
                          </Button>
                          {h.risk !== "critical" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                              <Pause className="w-3 h-3" />Freeze Level
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Agent demotion risk */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-500" /> Agent Demotion Risk
                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">{AGENT_DEMOTION_RISK.filter(a => a.risk === "critical").length} critical</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {AGENT_DEMOTION_RISK.map(ag => {
                const riskMap = { critical: { border: "border-red-300 bg-red-50/50", badge: "bg-red-600 text-white", icon: XCircle, iconColor: "text-red-600" }, warning: { border: "border-orange-200 bg-orange-50/30", badge: "bg-orange-500 text-white", icon: AlertTriangle, iconColor: "text-orange-600" }, watch: { border: "border-yellow-200 bg-yellow-50/30", badge: "bg-yellow-500 text-white", icon: TrendingDown, iconColor: "text-yellow-600" } };
                const r = riskMap[ag.risk as keyof typeof riskMap];
                const RIcon = r.icon;
                return (
                  <div key={ag.id} className={`rounded-xl border p-4 ${r.border}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                          <RIcon className={`w-5 h-5 ${r.iconColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{ag.name}</p>
                            <Badge variant="outline" className="text-[10px] h-4 px-1">{ag.level}</Badge>
                            <Badge className={`text-[10px] h-4 px-1.5 capitalize ${r.badge}`}>{ag.risk}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{ag.hosts} total hosts · {ag.activeHosts} active</p>
                          <p className="text-xs mt-1 font-medium">{ag.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Active rate</p>
                          <p className={`text-lg font-bold ${ag.activeRate < 50 ? "text-red-600" : ag.activeRate < 65 ? "text-orange-600" : "text-yellow-600"}`}>{ag.activeRate}%</p>
                          <Progress value={ag.activeRate} className="h-1 w-16 mt-1" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {ag.risk === "critical" && (
                            <Button size="sm" className="h-7 text-xs gap-1 bg-red-600 hover:bg-red-700 text-white">
                              <ArrowDown className="w-3 h-3" />Demote to {(() => { const idx = AGENT_LEVELS.findIndex(l => l.level === ag.level); return idx > 0 ? AGENT_LEVELS[idx - 1].level : "—"; })()}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Bell className="w-3 h-3" />Send Warning</Button>
                          {ag.risk !== "critical" && <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Pause className="w-3 h-3" />Freeze Level</Button>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ P&D POLICY ═══════════════ */}
        <TabsContent value="strategy" className="space-y-6 mt-4">

          {/* Policy overview banner */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5" />
              <h3 className="font-black text-lg">Ridhi P&D Framework — Official Policy</h3>
            </div>
            <p className="text-white/80 text-sm max-w-2xl">The Promotions & Demotions framework governs how Hosts (L1–L7) and Agents (A1–A5) move between levels. All promotions are merit-based; demotions follow a grace-period warning system to protect active creators.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Host promotion rules */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm flex items-center gap-2"><ArrowUp className="w-4 h-4 text-green-600" />Host Promotion Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Promotion Criteria (ALL must be met)</p>
                  {[
                    { rule: "Minimum coin threshold reached (level-specific)",          icon: Gift,     color: "text-pink-600"   },
                    { rule: "Minimum cumulative stream hours met",                       icon: Radio,    color: "text-blue-600"   },
                    { rule: "Minimum PK battle wins (L2 and above)",                    icon: Zap,      color: "text-orange-600" },
                    { rule: "No active violations or community strikes",                 icon: Shield,   color: "text-purple-600" },
                    { rule: "KYC verified (mandatory from L2 onwards)",                 icon: CheckCircle, color: "text-green-600" },
                  ].map(r => (
                    <div key={r.rule} className="flex items-center gap-2.5 text-xs">
                      <r.icon className={`w-3.5 h-3.5 shrink-0 ${r.color}`} />
                      <span>{r.rule}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 space-y-1.5">
                  <p className="text-xs font-bold text-green-800">Auto vs Manual Promotions</p>
                  <p className="text-xs text-green-700">🤖 <strong>Auto:</strong> System checks thresholds nightly at 12:00 AM IST. Push notification sent to host when eligible.</p>
                  <p className="text-xs text-green-700">🛡️ <strong>Manual override (SA only):</strong> Fast-track for strategic reasons (event partners, brand tie-ups, special programs).</p>
                  <p className="text-xs text-green-700">📋 <strong>Agent request:</strong> Agents may submit a manual promo request; requires Admin review + SA final approval.</p>
                </div>
              </CardContent>
            </Card>

            {/* Host demotion rules */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm flex items-center gap-2"><ArrowDown className="w-4 h-4 text-red-600" />Host Demotion Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { stage: "Watch",    days: "14–29d inactive",   action: "System alert to agent, no visible change to host",    color: "border-yellow-300 bg-yellow-50", badge: "bg-yellow-500 text-white" },
                    { stage: "Warning",  days: "30–59d inactive",   action: "Push notification to host + agent. Level highlighted in app as 'At Risk'.", color: "border-orange-300 bg-orange-50", badge: "bg-orange-500 text-white" },
                    { stage: "Freeze",   days: "60d inactive",      action: "Level frozen — host cannot earn level-based perks. 7-day recovery window.", color: "border-red-200 bg-red-50", badge: "bg-red-500 text-white" },
                    { stage: "Demote",   days: "67d+ inactive",     action: "Automatic 1-level demotion. Host notified with appeal link.", color: "border-red-400 bg-red-100", badge: "bg-red-700 text-white" },
                  ].map(s => (
                    <div key={s.stage} className={`rounded-xl border p-3 ${s.color}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] px-1.5 ${s.badge}`}>{s.stage}</Badge>
                        <span className="text-xs font-bold">{s.days}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.action}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs font-bold text-blue-800 mb-1">Additional demotion triggers</p>
                  <ul className="space-y-1 text-xs text-blue-700">
                    <li>· Community violations (hate speech, NSFW) → immediate level freeze + review</li>
                    <li>· Coin refund disputes reducing total below level threshold → recalculated</li>
                    <li>· Fraudulent PK win manipulation → wins disqualified + level audit</li>
                    <li>· Account sharing / multi-device abuse → temporary freeze</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Agent promotion rules */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm flex items-center gap-2"><ArrowUp className="w-4 h-4 text-purple-600" />Agent Promotion Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Promotion Criteria (ALL must be met)</p>
                  {[
                    { rule: "Minimum number of total hosts under management (level-specific)", icon: Users,    color: "text-purple-600" },
                    { rule: "Minimum active host rate maintained for 30+ consecutive days",    icon: TrendingUp, color: "text-green-600"  },
                    { rule: "No fraudulent host recruitment complaints in past 90 days",       icon: Shield,   color: "text-blue-600"   },
                    { rule: "All managed hosts must be KYC-verified",                         icon: CheckCircle, color: "text-green-600" },
                    { rule: "Minimum 1 new host onboarded in past 30 days",                   icon: Rocket,   color: "text-pink-600"   },
                  ].map(r => (
                    <div key={r.rule} className="flex items-center gap-2.5 text-xs">
                      <r.icon className={`w-3.5 h-3.5 shrink-0 ${r.color}`} />
                      <span>{r.rule}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 space-y-1.5">
                  <p className="text-xs font-bold text-purple-800">Commission Lock-in</p>
                  <p className="text-xs text-purple-700">Commission rate is locked at the <strong>current level</strong> and upgrades immediately upon promotion. If demoted, commission drops to the lower level starting the next billing cycle (7-day grace).</p>
                </div>
              </CardContent>
            </Card>

            {/* Agent demotion rules */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm flex items-center gap-2"><ArrowDown className="w-4 h-4 text-red-600" />Agent Demotion Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { stage: "Watch",    trigger: "Active rate drops below threshold",     action: "Admin notified. Agent receives dashboard alert. 30-day recovery window starts.",  color: "border-yellow-300 bg-yellow-50", badge: "bg-yellow-500 text-white" },
                    { stage: "Warning",  trigger: "Below threshold for 2 consecutive months", action: "Formal warning issued. Commission frozen at current level. 30-day improvement plan.", color: "border-orange-300 bg-orange-50", badge: "bg-orange-500 text-white" },
                    { stage: "Demote",   trigger: "Below threshold for 3rd month",            action: "1-level demotion applied. New commission rate takes effect next billing cycle.",     color: "border-red-300 bg-red-50",    badge: "bg-red-600 text-white"    },
                    { stage: "Suspend",  trigger: "Fraudulent recruitment detected",          action: "Immediate suspension. Full audit. Hosts reassigned to Admin pool.",                 color: "border-red-400 bg-red-100",   badge: "bg-red-800 text-white"    },
                  ].map(s => (
                    <div key={s.stage} className={`rounded-xl border p-3 ${s.color}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] px-1.5 ${s.badge}`}>{s.stage}</Badge>
                        <span className="text-xs font-bold">{s.trigger}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appeals + Special Programs */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" />Appeals Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                {[
                  { step: "1", text: "Host/Agent submits demotion appeal within 14 days of demotion via in-app form" },
                  { step: "2", text: "Assigned Agent (for hosts) or Admin (for agents) reviews the case within 5 business days" },
                  { step: "3", text: "If valid extenuating circumstances (illness, internet outage, family emergency), level is restored" },
                  { step: "4", text: "Super Admin makes final call on disputed cases. Decision is logged and binding for 90 days" },
                  { step: "5", text: "A restored level comes with a 45-day probation — any re-trigger results in immediate demotion without appeal" },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
                    <span>{s.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" />Special Promotion Programs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Fast-Track Elite",    desc: "Hosts who hit 2× the threshold in 50% of expected time get instantly promoted 2 levels.", badge: "Host only", color: "bg-pink-100 text-pink-700" },
                  { name: "Event Boost",         desc: "Hosting official Ridhi events (festivals, partnerships) counts as 2× stream hours and 1.5× coins.", badge: "Host + Agent", color: "bg-purple-100 text-purple-700" },
                  { name: "City Champion",       desc: "Top-earning host in each tier 2/3 city gets a 3-month level freeze guarantee — no demotion risk during the window.", badge: "Host only", color: "bg-blue-100 text-blue-700" },
                  { name: "Master Trainer",      desc: "Agents whose hosts collectively earn ₹10L+ in a month get an A-level fast-track bypass one time.", badge: "Agent only", color: "bg-green-100 text-green-700" },
                  { name: "Comeback Bonus",      desc: "Hosts returning after 30–90d absence with a verified reason get a 60-day grace period at their previous level.", badge: "Host only", color: "bg-amber-100 text-amber-700" },
                ].map(p => (
                  <div key={p.name} className="border rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold">{p.name}</p>
                      <Badge className={`text-[10px] px-1.5 ${p.color}`}>{p.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Search, LayoutDashboard, Users, ShieldAlert, UsersRound, Coins,
  IndianRupee, LineChart, Megaphone, Settings, Radio, BarChart3, ShieldCheck,
  Briefcase, Star, Bell, Phone, Cpu, ScanFace, BookOpen, Heart, Crown,
  ChevronDown, ChevronRight, FolderOpen, Zap, ShoppingBag, LayoutTemplate,
  Ticket, Share2, Plug, Activity, ClipboardList, UserPlus, TrendingUp,
  Globe, Terminal, Sparkles, Download, Monitor, Film, FileText, Landmark,
  Gamepad2, Headphones, Music, PenTool, MessageSquare, Eye, Clapperboard,
  Hash, Wallet, CreditCard, Gift, Receipt, Target, AlertTriangle,
  CheckCircle, User, FileText as FileIcon, MessageCircle, Play,
  BarChart2, Clock, ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

import { mockUsers, mockPosts, mockCommunities, mockTransactions, mockWithdrawals, mockCampaigns } from "@/data/mock-data";
import { USER_BEHAVIOR_ANALYTICS } from "@/data/analytics-mock";

/* ── Types ─────────────────────────────────────────────────────── */

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: string;
  badge?: string;
  badgeClass?: string;
};

/* ── Page definitions (all nav items) ───────────────────────────── */

const PAGE_RESULTS: SearchResult[] = [
  { id: "p-dashboard", title: "Dashboard", subtitle: "Platform Overview", icon: LayoutDashboard, href: "/", category: "Pages" },
  { id: "p-analytics", title: "Analytics", subtitle: "Platform Analytics", icon: LineChart, href: "/analytics", category: "Pages" },
  { id: "p-user-behavior", title: "User Behavior", subtitle: "User Analytics", icon: Activity, href: "/user-behavior", category: "Pages" },
  { id: "p-users", title: "Users", subtitle: "User Management", icon: Users, href: "/users", category: "Pages" },
  { id: "p-content", title: "Content Moderation", subtitle: "Moderate Posts & Content", icon: ShieldAlert, href: "/content", category: "Pages" },
  { id: "p-communities", title: "Communities", subtitle: "Community Management", icon: UsersRound, href: "/communities", category: "Pages" },
  { id: "p-video-uploads", title: "Video Uploads", subtitle: "40 pending uploads", icon: Film, href: "/video-uploads", category: "Pages", badge: "40", badgeClass: "bg-destructive" },
  { id: "p-hosts", title: "Hosts", subtitle: "Host Management", icon: Star, href: "/hosts", category: "Pages" },
  { id: "p-agents", title: "Agents", subtitle: "Agent Management", icon: Briefcase, href: "/agents", category: "Pages" },
  { id: "p-levels", title: "Levels & Promotion", subtitle: "Level Strategy", icon: TrendingUp, href: "/levels", category: "Pages" },
  { id: "p-kyc", title: "E-Verification", subtitle: "4 pending KYC", icon: ScanFace, href: "/kyc", category: "Pages", badge: "4", badgeClass: "bg-destructive" },
  { id: "p-calls", title: "Calls", subtitle: "Audio & Video Calls", icon: Phone, href: "/calls", category: "Pages" },
  { id: "p-recordings", title: "Recordings", subtitle: "Call Recordings", icon: FolderOpen, href: "/recordings", category: "Pages" },
  { id: "p-promotions", title: "Promotions & Ads", subtitle: "User Promotions", icon: Zap, href: "/promotions", category: "Pages" },
  { id: "p-live-streams", title: "Live Streams", subtitle: "Live Stream Management", icon: Radio, href: "/live-streams", category: "Pages" },
  { id: "p-gaming", title: "Gaming", subtitle: "Gaming Section", icon: Gamepad2, href: "/gaming", category: "Pages" },
  { id: "p-dating", title: "Dating", subtitle: "Dating Profiles", icon: Heart, href: "/dating", category: "Pages" },
  { id: "p-podcasts", title: "Podcasts", subtitle: "Podcast Library", icon: Headphones, href: "/podcasts", category: "Pages" },
  { id: "p-vibe-stars", title: "Vibe Stars", subtitle: "Star Rankings", icon: Star, href: "/vibe-stars", category: "Pages" },
  { id: "p-music", title: "Music Library", subtitle: "Music Content", icon: Music, href: "/music-library", category: "Pages" },
  { id: "p-stories", title: "Stories", subtitle: "Story Management", icon: Clapperboard, href: "/stories", category: "Pages" },
  { id: "p-business-ads", title: "Business Ads", subtitle: "3 pending approvals", icon: Zap, href: "/business-ads", category: "Pages", badge: "3", badgeClass: "bg-destructive" },
  { id: "p-special-ads", title: "Special Client Ads", subtitle: "Premium Ads", icon: Crown, href: "/special-ads", category: "Pages" },
  { id: "p-commercial-banners", title: "Commercial Banners", subtitle: "Banner Ads", icon: LayoutTemplate, href: "/commercial-banners", category: "Pages" },
  { id: "p-marketplace", title: "Marketplace", subtitle: "8 active listings", icon: ShoppingBag, href: "/marketplace", category: "Pages", badge: "8", badgeClass: "bg-destructive" },
  { id: "p-subscriptions", title: "Subscriptions", subtitle: "Subscription Plans", icon: Crown, href: "/subscriptions", category: "Pages" },
  { id: "p-coins", title: "Coins", subtitle: "Coin Economy", icon: Coins, href: "/coins", category: "Pages" },
  { id: "p-payouts", title: "Payouts", subtitle: "Withdrawal Requests", icon: IndianRupee, href: "/payouts", category: "Pages" },
  { id: "p-revenue", title: "Revenue & Ads", subtitle: "Revenue Analytics", icon: BarChart3, href: "/revenue", category: "Pages" },
  { id: "p-monetization", title: "Monetization", subtitle: "Monetization Tools", icon: TrendingUp, href: "/monetization", category: "Pages" },
  { id: "p-financial-statements", title: "Financial Statements", subtitle: "ITR & Financials", icon: Landmark, href: "/financial-statements", category: "Pages", badge: "ITR", badgeClass: "bg-amber-100 text-amber-700" },
  { id: "p-ai-hub", title: "AI Hub", subtitle: "7 AI tools", icon: Cpu, href: "/ai-hub", category: "Pages", badge: "7", badgeClass: "bg-purple-100 text-purple-700" },
  { id: "p-referral", title: "Referral Program", subtitle: "Referrals", icon: Share2, href: "/referral", category: "Pages" },
  { id: "p-marketing", title: "Marketing", subtitle: "Campaigns", icon: Megaphone, href: "/marketing", category: "Pages" },
  { id: "p-settings", title: "Settings", subtitle: "Platform Settings", icon: Settings, href: "/settings", category: "Pages" },
  { id: "p-super-admin", title: "Super Admin", subtitle: "Super Admin Panel", icon: ShieldCheck, href: "/super-admin", category: "Pages" },
  { id: "p-admin-mgmt", title: "Admin Management", subtitle: "Manage Admins", icon: UserPlus, href: "/admin-management", category: "Pages" },
  { id: "p-admin-activity", title: "Admin Activity", subtitle: "Activity Logs", icon: Activity, href: "/admin-activity", category: "Pages" },
  { id: "p-my-report", title: "My Work Report", subtitle: "Personal Report", icon: ClipboardList, href: "/my-report", category: "Pages" },
  { id: "p-api-integrations", title: "API Integrations", subtitle: "3rd Party APIs", icon: Plug, href: "/api-integrations", category: "Pages" },
  { id: "p-domain-hosting", title: "Domain & Hosting", subtitle: "Infrastructure", icon: Globe, href: "/domain-hosting", category: "Pages" },
  { id: "p-backend", title: "Backend Access", subtitle: "Server Access", icon: Terminal, href: "/backend-access", category: "Pages" },
  { id: "p-promo-codes", title: "Promo & Offer Codes", subtitle: "Promotions", icon: Ticket, href: "/promo-codes", category: "Pages" },
  { id: "p-handbook", title: "Handbook", subtitle: "Platform Handbook", icon: BookOpen, href: "/handbook", category: "Pages" },
  { id: "p-downloads", title: "Downloads", subtitle: "Reports & Downloads", icon: Download, href: "/downloads", category: "Pages" },
  { id: "p-screenshots", title: "App Screenshots", subtitle: "Store Assets", icon: Monitor, href: "/screenshots", category: "Pages" },
  { id: "p-content-editor", title: "Content Editor", subtitle: "CMS", icon: FileText, href: "/content-editor", category: "Pages" },
  { id: "p-lead-forms", title: "Lead Forms", subtitle: "Lead Management", icon: PenTool, href: "/lead-forms", category: "Pages" },
  { id: "p-chat-moderation", title: "Chat Moderation", subtitle: "Moderate Chats", icon: MessageSquare, href: "/chat-moderation", category: "Pages" },
  { id: "p-content-assets", title: "Creative Assets", subtitle: "Asset Library", icon: Sparkles, href: "/content-assets", category: "Pages" },
];

/* ── Quick Actions ─────────────────────────────────────────────── */

const QUICK_ACTIONS: SearchResult[] = [
  { id: "qa-export", title: "Export Users CSV", subtitle: "Download all users", icon: Download, href: "/users", category: "Quick Actions" },
  { id: "qa-kyc", title: "Review KYC Queue", subtitle: "4 pending approvals", icon: ScanFace, href: "/kyc", category: "Quick Actions", badge: "4", badgeClass: "bg-destructive" },
  { id: "qa-withdrawals", title: "Review Payouts", subtitle: "Pending withdrawals", icon: IndianRupee, href: "/payouts", category: "Quick Actions" },
  { id: "qa-content", title: "Moderate Content", subtitle: "12 flagged items", icon: ShieldAlert, href: "/content", category: "Quick Actions", badge: "12", badgeClass: "bg-destructive" },
  { id: "qa-super-admin", title: "Super Admin Portal", subtitle: "Full control", icon: ShieldCheck, href: "/super-admin", category: "Quick Actions" },
  { id: "qa-analytics", title: "View Analytics", subtitle: "Platform insights", icon: BarChart2, href: "/analytics", category: "Quick Actions" },
  { id: "qa-behavior", title: "User Behavior", subtitle: "Engagement data", icon: Activity, href: "/user-behavior", category: "Quick Actions" },
  { id: "qa-settings", title: "Platform Settings", subtitle: "Configure Ridhi", icon: Settings, href: "/settings", category: "Quick Actions" },
];

/* ── Helper: fuzzy match ────────────────────────────────────────── */

function match(query: string, text: string): boolean {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase().replace(/\s+/g, "");
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

/* ── Component ──────────────────────────────────────────────────── */

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  /* Keyboard shortcut: Cmd/Ctrl + K */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSelect = useCallback((href: string) => {
    setOpen(false);
    setLocation(href);
  }, [setLocation]);

  /* Build all searchable results */
  const results = useMemo(() => {
    const all: SearchResult[] = [];

    // Quick actions
    all.push(...QUICK_ACTIONS);

    // Pages
    all.push(...PAGE_RESULTS);

    // Users
    mockUsers.forEach((u) => {
      all.push({
        id: `u-${u.id}`,
        title: u.name,
        subtitle: `${u.phone} · ${u.city} · ${u.status}`,
        icon: User,
        href: `/users/${u.id}`,
        category: "Users",
        badge: u.status === "suspended" ? "Suspended" : u.isVerified ? "Verified" : undefined,
        badgeClass: u.status === "suspended" ? "bg-destructive" : "bg-green-100 text-green-700",
      });
    });

    // Posts / Content
    mockPosts.forEach((p) => {
      all.push({
        id: `post-${p.id}`,
        title: p.content.slice(0, 40),
        subtitle: `${p.type} · ${p.likes} likes · ${p.status}`,
        icon: FileIcon,
        href: `/content`,
        category: "Content",
        badge: p.status === "flagged" ? "Flagged" : p.status === "removed" ? "Removed" : undefined,
        badgeClass: p.status === "flagged" ? "bg-amber-100 text-amber-700" : "bg-destructive",
      });
    });

    // Communities
    mockCommunities.forEach((c) => {
      all.push({
        id: `c-${c.id}`,
        title: c.name,
        subtitle: `${c.category} · ${c.members.toLocaleString()} members · ${c.visibility}`,
        icon: Hash,
        href: `/communities`,
        category: "Communities",
      });
    });

    // Transactions
    mockTransactions.forEach((t) => {
      all.push({
        id: `t-${t.id}`,
        title: `${t.type} — ₹${t.amount}`,
        subtitle: `${t.userName} · ${t.description.slice(0, 30)}`,
        icon: Receipt,
        href: `/coins`,
        category: "Finance",
      });
    });

    // Withdrawals
    mockWithdrawals.forEach((w) => {
      all.push({
        id: `w-${w.id}`,
        title: `Withdrawal — ₹${w.amount}`,
        subtitle: `${w.creatorName} · ${w.method} · ${w.status}`,
        icon: Wallet,
        href: `/payouts`,
        category: "Finance",
        badge: w.status,
        badgeClass: w.status === "Pending" ? "bg-amber-100 text-amber-700" : w.status === "Paid" ? "bg-green-100 text-green-700" : "bg-destructive",
      });
    });

    // Campaigns
    mockCampaigns.forEach((c) => {
      all.push({
        id: `camp-${c.id}`,
        title: c.name,
        subtitle: `${c.type} · ${c.reach.toLocaleString()} reach · ${c.status}`,
        icon: Target,
        href: `/marketing`,
        category: "Campaigns",
        badge: c.status,
        badgeClass: c.status === "Active" ? "bg-green-100 text-green-700" : "bg-muted",
      });
    });

    // Analytics insights
    USER_BEHAVIOR_ANALYTICS.slice(0, 10).forEach((b: { userId: string; userName: string; totalSessions: number; avgSessionMinutes: number; engagementScore: number }) => {
      const score = b.engagementScore;
      all.push({
        id: `a-${b.userId}`,
        title: `${b.userName} — Analytics`,
        subtitle: `${b.totalSessions} sessions · ${b.avgSessionMinutes}m avg · Score: ${score}`,
        icon: BarChart2,
        href: `/users/${b.userId}`,
        category: "Analytics",
        badge: score >= 70 ? "High" : score >= 40 ? "Medium" : "Low",
        badgeClass: score >= 70 ? "bg-green-100 text-green-700" : score >= 40 ? "bg-amber-100 text-amber-700" : "bg-destructive",
      });
    });

    return all;
  }, []);

  /* Filter by query */
  const filtered = useMemo(() => {
    if (!query.trim()) return results;
    const q = query.trim();
    return results.filter((r) => match(q, r.title) || match(q, r.subtitle) || match(q, r.category));
  }, [query, results]);

  /* Group by category */
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    const order = ["Quick Actions", "Pages", "Users", "Content", "Communities", "Finance", "Campaigns", "Analytics"];
    filtered.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    // Sort by predefined order
    return order
      .filter((cat) => groups[cat]?.length)
      .map((cat) => ({ category: cat, items: groups[cat] }));
  }, [filtered]);

  return (
    <>
      {/* Trigger button (desktop) */}
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex items-center gap-2 h-8 px-2.5 text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground border-border"
        onClick={() => setOpen(true)}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Search…</span>
        <Kbd className="ml-1 h-4 text-[10px] px-1 border-border">⌘K</Kbd>
      </Button>

      {/* Trigger button (mobile) */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden h-8 w-8 p-0"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search users, pages, content, analytics…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-8">
              <Search className="w-8 h-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
              <p className="text-xs text-muted-foreground/70">Try searching for a user name, page, or city</p>
            </div>
          </CommandEmpty>

          {grouped.map((group, gi) => (
            <CommandGroup key={group.category} heading={group.category}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => handleSelect(item.href)}
                  className="flex items-center gap-3 py-2.5 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      {item.badge && (
                        <Badge variant="outline" className={`text-[10px] h-4 px-1 font-medium ${item.badgeClass}`}>
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                </CommandItem>
              ))}
              {gi < grouped.length - 1 && <CommandSeparator />}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

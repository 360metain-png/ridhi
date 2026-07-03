import React, { useState } from "react";
import {
  Dimensions, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, View, Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentSheet } from "@/components/PaymentSheet";
import { RidhiCoin } from "@/components/RidhiCoin";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";
import { isIapAvailable, purchasePackage, getOfferings } from "@/lib/iap";
import { PRODUCTS } from "@/data/mockData";
const COIN_IMAGE = require("../assets/images/ridhi_coin.png");
import type { VipTier } from "@/components/SubscriptionBadge";

const { width } = Dimensions.get("window");

// ── Billing period ─────────────────────────────────────────────────────────────
type BillingPeriod = "weekly" | "monthly" | "yearly";

// ── Plan definitions ───────────────────────────────────────────────────────────
// Pricing strategy: weekly = try-before-buy (impulse), monthly = baseline,
// yearly = flagship (saves ~44% vs monthly × 12 → pay for ~6.7 months, get 12)
// India ARPU comps: Tinder Gold ₹1,200/mo · OTT ₹149–649/mo · ShareChat ~free
//
// KEY REVENUE INSIGHT:
//   1. Coin gifts during live streams → PRIMARY revenue (already built ✅)
//   2. Ads revenue (ads-manager) → SECONDARY revenue (already built ✅)
//   3. VIP subscriptions → recurring, predictable (this screen)
//
// CALL PRICING MODEL:
//   All audio/video calls are coin-based for ALL users. No "unlimited" calls.
//   Backend rates: audio = 10 coins/min, video = 25 coins/min.
//   VIP tiers get discounted call rates (not free/unlimited calls).
//
// ONLY FEATURES THAT ARE ACTUALLY BUILT IN THE APP ARE LISTED HERE.
// No aspirational / backend-only features. Every perk maps to a real screen.
const PLANS = [
  {
    id: "free", name: "Free", badge: "FREE",
    prices: { weekly: 0, monthly: 0, yearly: 0 },
    bonusCoins: 0,
    yearlySaving: 0,
    color: "#888888", gradient: ["#555", "#333"] as [string, string],
    highlights: ["Basic feed & reels", "Coin-based calls"],
    features: [
      "Home Feed, Reels, Voice Reels & Explore",
      "5 stories/day · up to 5 communities",
      "Audio calls at 10 coins/min (standard quality)",
      "Video calls at 25 coins/min (standard quality)",
      "Basic match swipes (20/day)",
      "Chat with all your matches",
      "Daily missions & ad rewards (earn coins)",
      "Community Guidelines & Help Center",
      "Basic AI Assistant — 2 queries/day",
    ],
    locked: [
      "Ad-free experience",
      "VIP badge",
      "Super Likes",
      "Discounted call rates",
      "Ghost Mode",
      "Bonus coins monthly",
      "Profile boost",
      "VIP Podcast & Audio Rooms",
      "Host audio rooms",
      "Game rooms & tournaments",
      "AI Matchmaking — smart compatibility scores",
      "AI Smart Icebreakers",
      "AI Reply Suggestions",
      "AI Conversation Quality Analysis",
      "Cross-Gender Random Chat (coin-based)",
      "End-to-End Encrypted chat",
      "TikTok Tools — TTS, Auto-Captions, Carousel, Streaks",
      "Creator Dashboard & analytics",
      "Go Live streaming",
      "Brand Deal Marketplace",
      "Podcast hosting & monetization",
      "Scheduled Content",
      "Lead Forms",
      "Ads Manager",
      "KYC verified badge",
      "Referral bonus multiplier",
      "Custom profile frames",
      "Early access to new features",
      "Vibe Stars (horoscope)",
      "Leaderboard visibility",
      "Group Chat admin",
      "Coin Store (premium gifts)",
      "Music Library access",
      "Duet & Stitch recording",
      "Host Dashboard",
      "Creator Marketplace",
      "Brand Post Deals",
      "Call Persona (fake name/avatar)",
      "Saved Posts — unlimited collections",
      "Story Highlights — save & share",
      "Profile Prompts — dating icebreakers",
      "Ridhi Shop — buy & earn",
      "Events & Meetups — create & host",
      "Broadcast Channels — start your own",
    ],
  },
  {
    id: "silver", name: "Silver VIP", badge: "SILVER",
    prices: { weekly: 49, monthly: 149, yearly: 999 },
    bonusCoins: 15,
    yearlySaving: 44,
    color: "#A0A0A0", gradient: ["#9E9E9E", "#616161"] as [string, string],
    highlights: ["Ad-free", "5 Super Likes/day", "Call discount 20%"],
    features: [
      "Ad-free Feed, Reels, Voice Reels & Explore",
      "Silver VIP badge on profile, chat & swipes",
      "15 bonus coins/month (≈₹15 value)",
      "5 Super Likes/day on Match screen",
      "Unlimited stories & up to 20 communities",
      "Audio calls at 8 coins/min (20% discount)",
      "Video calls at 20 coins/min (20% discount)",
      "Unlimited match swipes",
      "Weekly profile boost (1×/week on Explore)",
      "Profile highlight badge",
      "Priority chat message delivery",
      "AI Matchmaking — basic compatibility scores",
      "AI Assistant — 5 queries/day",
      "AI Smart Icebreakers — English only",
      "AI Reply Suggestions — 1 per message",
      "Cross-Gender Random Chat — 3 trial chats/day",
      "TikTok Tools — Auto-Captions only",
      "Creator Dashboard — view-only",
      "Scheduled Content — 2 posts/week",
      "Lead Forms — basic (name + phone)",
      "Vibe Stars (horoscope) — basic",
      "Leaderboard visibility",
      "Group Chat — join up to 10 groups",
      "Music Library — basic access",
      "Call Persona — 1 persona slot",
      "Saved Posts — up to 20 posts, 1 collection",
      "Story Highlights — 2 highlights on profile",
      "Profile Prompts — 2 dating prompts",
      "Ridhi Shop — browse & buy with coins",
      "Events & Meetups — join any event",
      "Broadcast Channels — join all channels",
    ],
    locked: [
      "Higher call discounts (Gold+)",
      "Ghost Mode",
      "Host audio rooms",
      "VIP Podcast rooms",
      "AI Matchmaking (advanced)",
      "AI Assistant (full)",
      "AI Smart Icebreakers (all languages)",
      "AI Reply Suggestions (full)",
      "AI Conversation Quality Analysis",
      "Cross-Gender Random Chat (paid)",
      "End-to-End Encrypted chat",
      "TikTok Tools (TTS, Carousel, Streaks)",
      "Creator Dashboard (advanced)",
      "Go Live streaming",
      "Brand Deal Marketplace",
      "Podcast hosting & monetization",
      "Scheduled Content (batch)",
      "Lead Forms (advanced)",
      "Ads Manager",
      "KYC verified badge",
      "Referral 2× multiplier",
      "Custom profile frames",
      "Early access to features",
      "Vibe Stars (full)",
      "Group Chat admin (create groups)",
      "Coin Store (premium gifts)",
      "Music Library (full)",
      "Duet & Stitch recording",
      "Host Dashboard",
      "Creator Marketplace",
      "Brand Post Deals",
      "Saved Posts — unlimited collections",
      "Story Highlights — unlimited on profile",
      "Profile Prompts — unlimited dating prompts",
      "Ridhi Shop — 5% discount on all products",
      "Events & Meetups — create events",
      "Broadcast Channels — start your own",
    ],
  },
  {
    id: "gold", name: "Gold VIP", badge: "GOLD",
    prices: { weekly: 99, monthly: 299, yearly: 1999 },
    bonusCoins: 40,
    yearlySaving: 44,
    color: "#FFB800", gradient: ["#FFB800", "#FF8F00"] as [string, string],
    popular: true,
    highlights: ["40% call discount", "Ghost Mode", "Host audio rooms"],
    features: [
      "Everything in Silver VIP, plus:",
      "Gold VIP badge (animated glow)",
      "40 bonus coins/month (≈₹40 value)",
      "Audio calls at 6 coins/min (40% discount)",
      "Video calls at 15 coins/min (40% discount)",
      "10 Super Likes/day",
      "Ghost Mode — browse invisibly",
      "Host audio rooms (up to 20 listeners)",
      "VIP Podcast rooms (all rooms)",
      "Unlimited match filters (age, city, interest)",
      "Daily auto profile boost on Explore",
      "Priority position in Match queue",
      "AI Matchmaking — basic compatibility scores",
      "AI Assistant — 15 queries/day",
      "AI Smart Icebreakers — Hindi + English",
      "AI Reply Suggestions — 3 per message",
      "Cross-Gender Random Chat — basic (20 coins/session)",
      "TikTok Tools — TTS, Auto-Captions, Carousel",
      "Creator Dashboard — basic analytics + earnings",
      "Scheduled Content — 5 posts/week",
      "Lead Forms — basic (name, phone, email)",
      "KYC verified badge — fast-track",
      "Referral bonus 1.5× multiplier",
      "Vibe Stars (horoscope) — full",
      "Group Chat — join up to 25 groups",
      "Music Library — full access",
      "Duet & Stitch recording",
      "Call Persona — 3 persona slots",
      "Coin Store — premium gift browsing",
      "Saved Posts — up to 100 posts, 5 collections",
      "Story Highlights — 5 highlights on profile",
      "Profile Prompts — 5 dating prompts",
      "Ridhi Shop — 5% discount + early access",
      "Events & Meetups — create 3 events/month",
      "Broadcast Channels — create 3 channels",
    ],
    locked: [
      "AI Matchmaking (advanced)",
      "AI Assistant (unlimited)",
      "AI Smart Icebreakers (all 13 languages)",
      "AI Reply Suggestions (full)",
      "AI Conversation Quality Analysis",
      "Incognito profile visits",
      "Cross-Gender Random Chat (E2EE)",
      "TikTok Tools (Streaks, Video Replies, Repost)",
      "Creator Dashboard (advanced)",
      "Go Live streaming (non-creator)",
      "Brand Deal Marketplace",
      "Podcast monetization",
      "Scheduled Content (batch + auto-post)",
      "Lead Forms (advanced)",
      "Ads Manager",
      "Referral 2× multiplier",
      "Custom profile frames",
      "Early access to features",
      "Group Chat admin (create up to 500 members)",
      "Host Dashboard",
      "Creator Marketplace",
      "Brand Post Deals",
      "Homepage featured placement",
      "Top Explore visibility",
      "Saved Posts — unlimited collections",
      "Story Highlights — unlimited on profile",
      "Profile Prompts — unlimited dating prompts",
      "Ridhi Shop — 15% discount + free shipping",
      "Events & Meetups — unlimited + sponsored",
      "Broadcast Channels — unlimited + verified",
    ],
  },
  {
    id: "platinum", name: "Platinum VIP", badge: "PLATINUM",
    prices: { weekly: 199, monthly: 599, yearly: 3999 },
    bonusCoins: 100,
    yearlySaving: 44,
    color: "#7B2FBE", gradient: ["#9C27B0", "#7B2FBE"] as [string, string],
    highlights: ["100 coins/mo", "Host rooms (100)", "Faster withdrawals"],
    features: [
      "Everything in Gold VIP, plus:",
      "Platinum VIP badge (shimmer effect)",
      "100 bonus coins/month (≈₹100 value)",
      "15 Super Likes/day",
      "Audio calls at 5 coins/min (50% discount)",
      "Video calls at 12 coins/min (52% discount)",
      "Host audio rooms up to 100 listeners",
      "AI Matchmaking — advanced + reasons",
      "AI Assistant — unlimited queries",
      "AI Smart Icebreakers — all 13 languages",
      "AI Reply Suggestions — 5 per message",
      "AI Conversation Quality Analysis",
      "Cross-Gender Random Chat — premium (50 coins, E2EE)",
      "End-to-End Encrypted chat — all DMs",
      "Incognito profile visits (invisible browsing)",
      "VIP Game rooms (Ludo, Chess, Carrom)",
      "VIP Tournament bracket access",
      "TikTok Tools — full suite (Streaks, Video Replies, Repost)",
      "Creator Dashboard — advanced analytics + earnings",
      "Go Live — 3 hrs/day (no Creator Pass)",
      "Brand Deal Marketplace — browse deals",
      "Podcast hosting — 50 episodes + monetization",
      "Scheduled Content — 20 posts/week + auto-post",
      "Lead Forms — advanced + analytics",
      "Ads Manager — basic campaigns",
      "KYC verified badge — instant",
      "Referral bonus 1.5× multiplier",
      "Faster coin withdrawals (48hr)",
      "3× daily profile boost on Explore",
      "Group Chat admin — create up to 200 members",
      "Host Dashboard — basic",
      "Creator Marketplace — browse",
      "Brand Post Deals — view",
      "Call Persona — 5 persona slots",
      "Saved Posts — up to 500 posts, 10 collections",
      "Story Highlights — 10 highlights on profile",
      "Profile Prompts — 8 dating prompts",
      "Ridhi Shop — 10% discount + VIP early access",
      "Events & Meetups — create 10 events/month",
      "Broadcast Channels — create 10 channels + monetization",
    ],
    locked: [
      "Go Live unlimited (Diamond)",
      "Brand Deal Marketplace (direct brands)",
      "Ads Manager (full campaigns)",
      "Referral 2× multiplier",
      "Custom profile frames",
      "Early access to features",
      "Homepage featured placement",
      "Top Explore visibility",
      "Creator Dashboard",
      "Group Chat admin (500 members)",
      "Saved Posts — unlimited with smart folders",
      "Story Highlights — unlimited + custom covers",
      "Profile Prompts — unlimited + premium",
      "Ridhi Shop — 15% discount + free shipping",
      "Events & Meetups — unlimited + sponsored",
      "Broadcast Channels — unlimited + verified",
    ],
  },
  {
    id: "diamond", name: "Diamond Elite", badge: "DIAMOND",
    prices: { weekly: 349, monthly: 999, yearly: 6999 },
    bonusCoins: 300,
    yearlySaving: 42,
    color: "#E91E8C", gradient: ["#E91E8C", "#7B2FBE"] as [string, string],
    highlights: ["300 coins/mo", "Go Live unlimited", "Top Explore"],
    features: [
      "Everything in Platinum VIP, plus:",
      "Diamond Elite badge (animated + glow ring)",
      "300 bonus coins/month (≈₹300 value)",
      "Audio calls at 4 coins/min (60% discount)",
      "Video calls at 10 coins/min (60% discount)",
      "Unlimited Super Likes",
      "Go Live — unlimited streaming (no Creator Pass)",
      "VIP Leaderboard position (top 100)",
      "Top slot in Explore 'People Near You'",
      "Custom profile frame & border effects",
      "Group chat admin — create up to 500 members",
      "Referral bonus 2× multiplier",
      "Early access to all new Ridhi features",
      "AI Matchmaking — full compatibility engine",
      "AI Assistant — unlimited + priority",
      "AI Smart Icebreakers — all languages + tone",
      "AI Reply Suggestions — full chat coach",
      "AI Conversation Quality Analysis",
      "Cross-Gender Random Chat — unlimited (E2EE)",
      "End-to-End Encrypted chat — all DMs",
      "TikTok Tools — full creator suite",
      "Creator Dashboard — full analytics",
      "Brand Deal Marketplace — direct access",
      "Podcast hosting & monetization — unlimited",
      "Scheduled Content — auto-post + batch",
      "Lead Forms — advanced + analytics",
      "Ads Manager — full campaigns",
      "KYC verified badge — instant",
      "Community Guidelines — priority support",
      "Homepage featured placement",
      "Top Explore visibility",
      "Creator Dashboard — full access",
      "Host Dashboard — full",
      "Creator Marketplace — full",
      "Brand Post Deals — create & manage",
      "Call Persona — unlimited slots",
      "Coin Store — all premium gifts unlocked",
      "Saved Posts — unlimited with smart folders",
      "Story Highlights — unlimited + custom covers",
      "Profile Prompts — unlimited + premium prompts",
      "Ridhi Shop — 15% discount + free shipping + VIP drops",
      "Events & Meetups — unlimited + sponsored events",
      "Broadcast Channels — unlimited + verified + monetization",
    ],
    locked: [],
  },
];

// ── Creator subscription plans ─────────────────────────────────────────────────
// Creator Pass is separate from VIP — focused on EARNING, not social perks.
// Commission reduction stacks: Ridhi normally takes 30% of coin earnings.
// Starter saves 10pp → 20%; Pro saves 7pp more → 13%; Elite saves 5pp more → 8%.
const CREATOR_PLANS = [
  {
    id: "creator_starter", name: "Creator Starter", monthlyPrice: 199, yearlyPrice: 1999,
    yearlySaving: 16,
    color: "#2196F3", gradient: ["#2196F3", "#0D47A1"] as [string, string],
    icon: "video" as const,
    tagline: "Go live & start earning",
    highlights: ["Creator badge", "Live up to 2hr/day", "30% → 20% commission"],
    features: [
      "Creator badge on your profile",
      "Live streaming (up to 2 hrs/day)",
      "Audio podcast hosting (up to 10 episodes)",
      "Basic creator analytics dashboard",
      "Gift & coin earnings tracker",
      "1 Fan Club tier setup",
      "10pp commission reduction on withdrawals (30% → 20%)",
      "Creator support (email, 48hr SLA)",
    ],
    locked: ["HD streaming", "Revenue insights", "Podcast monetization", "Stream promotions"],
  },
  {
    id: "creator_pro", name: "Creator Pro", monthlyPrice: 499, yearlyPrice: 4999,
    yearlySaving: 17,
    color: "#7B2FBE", gradient: ["#9C27B0", "#7B2FBE"] as [string, string],
    popular: true,
    icon: "trending-up" as const,
    tagline: "Scale your creator business",
    highlights: ["HD streaming (unlimited)", "30% → 13% commission"],
    features: [
      "Everything in Creator Starter, plus:",
      "HD/4K live streaming (unlimited hours)",
      "Advanced analytics (retention, demographics)",
      "Revenue insights & projections",
      "Podcast monetization (paid episodes + VIP rooms)",
      "Stream promotions — featured in Explore",
      "Fan polls & live Q&A tools",
      "3 Fan Club tiers (Supporter / Super Fan / VIP)",
      "17pp commission reduction on withdrawals (30% → 13%)",
      "Priority creator support (chat, 12hr SLA)",
    ],
    locked: ["Homepage featured", "Verified badge", "Brand deals", "Dedicated manager"],
  },
  {
    id: "creator_elite", name: "Creator Elite", monthlyPrice: 999, yearlyPrice: 9999,
    yearlySaving: 17,
    color: "#E91E8C", gradient: ["#E91E8C", "#7B2FBE"] as [string, string],
    icon: "star" as const,
    tagline: "India's top creator tier",
    highlights: ["Homepage featured", "Verified blue badge", "30% → 8% commission"],
    features: [
      "Everything in Creator Pro, plus:",
      "Homepage featured placement (rotational)",
      "Verified creator badge (blue tick)",
      "Dedicated creator account manager",
      "Brand deal & sponsorship opportunities",
      "Ridhi Radio — your podcast in featured playlist",
      "Exclusive creator meetups & events",
      "Custom branded creator room",
      "Featured in 'Top Creators' section",
      "22pp commission reduction on withdrawals (30% → 8%)",
      "Priority support (WhatsApp, 2hr SLA)",
    ],
    locked: [],
  },
];

// ── Unlock features showcase ───────────────────────────────────────────────────
// Every item maps to a REAL built screen in the app.
const UNLOCK_CATEGORIES = [
  {
    title: "Audio & Video Calls",
    icon: "phone",
    color: "#2196F3",
    items: [
      { label: "Audio calls 10 coins/min",       plan: "free",     icon: "phone"      },
      { label: "Video calls 25 coins/min",       plan: "free",     icon: "video"      },
      { label: "20% call discount (Silver)",      plan: "silver",   icon: "phone"      },
      { label: "40% call discount (Gold)",       plan: "gold",     icon: "video"      },
      { label: "50% call discount (Platinum)",   plan: "platinum", icon: "phone"      },
      { label: "60% call discount (Diamond)",    plan: "diamond",  icon: "video"      },
      { label: "Host audio rooms (100 people)",  plan: "platinum", icon: "mic"        },
      { label: "Go Live — unlimited",             plan: "diamond",  icon: "radio"      },
    ],
  },
  {
    title: "Dating & Match",
    icon: "heart",
    color: "#E91E8C",
    items: [
      { label: "5 Super Likes/day",              plan: "silver",   icon: "star"       },
      { label: "10 Super Likes/day",             plan: "gold",     icon: "star"       },
      { label: "Ghost Mode (invisible visits)",  plan: "gold",     icon: "eye-off"    },
      { label: "Unlimited match filters",        plan: "gold",     icon: "sliders"    },
      { label: "Incognito profile visits",       plan: "platinum", icon: "shield"     },
      { label: "15 Super Likes/day",             plan: "platinum", icon: "star"       },
      { label: "Unlimited Super Likes",          plan: "diamond",  icon: "award"      },
      { label: "Top slot in 'People Near You'",  plan: "diamond",  icon: "map-pin"    },
    ],
  },
  {
    title: "AI & Smart Features",
    icon: "cpu",
    color: "#34C759",
    items: [
      { label: "AI Matchmaking — basic",         plan: "silver",   icon: "heart"          },
      { label: "AI Assistant — 5 queries/day",  plan: "silver",   icon: "cpu"            },
      { label: "AI Smart Icebreakers",           plan: "gold",     icon: "message-circle" },
      { label: "AI Reply Suggestions",           plan: "gold",     icon: "cpu"            },
      { label: "AI Matchmaking — advanced",      plan: "platinum", icon: "heart"          },
      { label: "AI Assistant — unlimited",      plan: "platinum", icon: "cpu"            },
      { label: "AI Chat Coach — full",          plan: "platinum", icon: "message-circle" },
      { label: "AI Matchmaking — full engine",  plan: "diamond",  icon: "heart"          },
      { label: "AI Assistant — priority",      plan: "diamond",  icon: "cpu"            },
    ],
  },
  {
    title: "Random Chat & E2EE",
    icon: "message-square",
    color: "#00BCD4",
    items: [
      { label: "3 trial random chats/day",       plan: "silver",   icon: "message-square" },
      { label: "Random Chat — basic (20 coins)", plan: "gold",     icon: "message-square" },
      { label: "Random Chat — premium (50 coins)", plan: "platinum", icon: "message-square" },
      { label: "Random Chat — unlimited (E2EE)",  plan: "diamond",  icon: "lock"           },
      { label: "End-to-End Encrypted chat",      plan: "platinum", icon: "lock"           },
      { label: "E2EE + disappearing messages",   plan: "diamond",  icon: "lock"           },
    ],
  },
  {
    title: "TikTok & Content Tools",
    icon: "film",
    color: "#FF6B35",
    items: [
      { label: "Auto-Captions",                  plan: "silver",   icon: "type"       },
      { label: "TTS + Carousel",                 plan: "gold",     icon: "mic"        },
      { label: "Full TikTok suite (Streaks)",    plan: "platinum", icon: "film"       },
      { label: "TikTok creator suite (all)",     plan: "diamond",  icon: "film"       },
      { label: "Duet & Stitch recording",        plan: "gold",     icon: "film"       },
      { label: "Voice Reels",                    plan: "free",     icon: "mic"        },
    ],
  },
  {
    title: "Creator & Business",
    icon: "briefcase",
    color: "#7B2FBE",
    items: [
      { label: "Creator Dashboard — basic",       plan: "silver",   icon: "bar-chart"  },
      { label: "Scheduled Content — 5/wk",      plan: "gold",     icon: "calendar"   },
      { label: "Lead Forms — basic",             plan: "gold",     icon: "clipboard"  },
      { label: "Creator Dashboard — advanced",    plan: "platinum", icon: "bar-chart"  },
      { label: "Go Live — 3 hrs/day",            plan: "platinum", icon: "radio"      },
      { label: "Brand Deal Marketplace",         plan: "platinum", icon: "briefcase"  },
      { label: "Podcast + monetization",         plan: "platinum", icon: "mic"        },
      { label: "Ads Manager — full",            plan: "diamond",  icon: "trending-up"},
      { label: "Host Dashboard",                 plan: "platinum", icon: "radio"      },
      { label: "Creator Dashboard",              plan: "diamond",  icon: "zap"        },
      { label: "Creator Marketplace",            plan: "platinum", icon: "trending-up"},
      { label: "Brand Post Deals",               plan: "diamond",  icon: "briefcase"  },
    ],
  },
  {
    title: "Saved Posts & Story Highlights",
    icon: "bookmark",
    color: "#2196F3",
    items: [
      { label: "Saved Posts — 20 posts, 1 collection", plan: "silver",   icon: "bookmark"   },
      { label: "Saved Posts — 100 posts, 5 collections", plan: "gold",   icon: "bookmark"   },
      { label: "Saved Posts — 500 posts, 10 collections", plan: "platinum", icon: "bookmark" },
      { label: "Saved Posts — unlimited + smart folders", plan: "diamond",  icon: "bookmark" },
      { label: "Story Highlights — 2 on profile",  plan: "silver",   icon: "image"      },
      { label: "Story Highlights — 5 on profile",   plan: "gold",     icon: "image"      },
      { label: "Story Highlights — 10 on profile",  plan: "platinum", icon: "image"      },
      { label: "Story Highlights — unlimited + custom", plan: "diamond",  icon: "image"      },
    ],
  },
  {
    title: "Dating & Profile Prompts",
    icon: "heart",
    color: "#E91E8C",
    items: [
      { label: "Profile Prompts — 2 prompts",      plan: "silver",   icon: "message-circle" },
      { label: "Profile Prompts — 5 prompts",       plan: "gold",     icon: "message-circle" },
      { label: "Profile Prompts — 8 prompts",      plan: "platinum", icon: "message-circle" },
      { label: "Profile Prompts — unlimited",       plan: "diamond",  icon: "message-circle" },
      { label: "5 Super Likes/day",                 plan: "silver",   icon: "star"       },
      { label: "10 Super Likes/day",                plan: "gold",     icon: "star"       },
      { label: "15 Super Likes/day",                plan: "platinum", icon: "star"       },
      { label: "Unlimited Super Likes",             plan: "diamond",  icon: "award"      },
      { label: "Ghost Mode (invisible visits)",     plan: "gold",     icon: "eye-off"    },
      { label: "Incognito profile visits",          plan: "platinum", icon: "shield"     },
      { label: "Top slot in 'People Near You'",     plan: "diamond",  icon: "map-pin"    },
    ],
  },
  {
    title: "Ridhi Shop, Events & Broadcast",
    icon: "shopping-bag",
    color: "#FF6B35",
    items: [
      { label: "Ridhi Shop — browse & buy",         plan: "silver",   icon: "shopping-bag" },
      { label: "Ridhi Shop — 5% discount",         plan: "gold",     icon: "shopping-bag" },
      { label: "Ridhi Shop — 10% discount + VIP",   plan: "platinum", icon: "shopping-bag" },
      { label: "Ridhi Shop — 15% + free shipping",   plan: "diamond",  icon: "shopping-bag" },
      { label: "Events — join any event",           plan: "silver",   icon: "calendar"   },
      { label: "Events — create 3 events/month",      plan: "gold",     icon: "calendar"   },
      { label: "Events — create 10 events/month",    plan: "platinum", icon: "calendar"   },
      { label: "Events — unlimited + sponsored",    plan: "diamond",  icon: "calendar"   },
      { label: "Broadcast — join channels",        plan: "silver",   icon: "radio"      },
      { label: "Broadcast — create 3 channels",     plan: "gold",     icon: "radio"      },
      { label: "Broadcast — 10 + monetization",     plan: "platinum", icon: "radio"      },
      { label: "Broadcast — unlimited + verified",  plan: "diamond",  icon: "radio"      },
    ],
  },
  {
    title: "Feed, Social & Games",
    icon: "trending-up",
    color: "#7B2FBE",
    items: [
      { label: "Ad-free Feed, Reels & Explore",  plan: "silver",   icon: "shield"     },
      { label: "Unlimited stories",              plan: "silver",   icon: "circle"     },
      { label: "VIP Podcast rooms",             plan: "gold",     icon: "mic"        },
      { label: "VIP Game rooms (Ludo/Chess)",    plan: "platinum", icon: "grid"       },
      { label: "VIP Tournament bracket",         plan: "platinum", icon: "award"      },
      { label: "PK Battle — free for all",      plan: "free",     icon: "zap"        },
      { label: "Custom profile frame & border",  plan: "diamond",  icon: "image"      },
      { label: "Early access to new features",   plan: "diamond",  icon: "clock"      },
      { label: "Leaderboard visibility",         plan: "silver",   icon: "bar-chart"  },
      { label: "Group Chat — join groups",       plan: "silver",   icon: "users"      },
      { label: "Group Chat admin (500 members)", plan: "diamond",  icon: "users"      },
    ],
  },
  {
    title: "Coins & Boosts",
    icon: "trending-up",
    color: "#FFB800",
    items: [
      { label: "15 bonus coins/month",          plan: "silver",   icon: "gift"       },
      { label: "Weekly profile boost (Explore)", plan: "silver",   icon: "trending-up"},
      { label: "40 bonus coins/month",          plan: "gold",     icon: "gift"       },
      { label: "Daily auto profile boost",       plan: "gold",     icon: "trending-up"},
      { label: "100 bonus coins/month",          plan: "platinum", icon: "gift"       },
      { label: "3× daily boost on Explore",      plan: "platinum", icon: "trending-up"},
      { label: "Fast coin withdrawal (48hr)",    plan: "platinum", icon: "zap"        },
      { label: "300 bonus coins/month",          plan: "diamond",  icon: "gift"       },
      { label: "Coin Store (premium gifts)",     plan: "gold",     icon: "gift"       },
    ],
  },
  {
    title: "Extras & Fun",
    icon: "star",
    color: "#FF6B35",
    items: [
      { label: "Vibe Stars (horoscope)",         plan: "silver",   icon: "star"       },
      { label: "Music Library access",           plan: "gold",     icon: "music"      },
      { label: "Call Persona (fake name/avatar)", plan: "silver",   icon: "user"       },
      { label: "KYC fast-track",                 plan: "gold",     icon: "shield"     },
      { label: "KYC instant badge",              plan: "platinum", icon: "shield"     },
      { label: "Referral 1.5× multiplier",       plan: "gold",     icon: "gift"       },
      { label: "Referral 2× multiplier",        plan: "diamond",  icon: "gift"       },
    ],
  },
];

const PLAN_COLOR: Record<string, string> = {
  silver:   "#A0A0A0",
  gold:     "#FFB800",
  platinum: "#7B2FBE",
  diamond:  "#E91E8C",
};

const PLAN_RANK: Record<string, number> = {
  free: 0, silver: 1, gold: 2, platinum: 3, diamond: 4,
};

// ── Fan tiers ──────────────────────────────────────────────────────────────────
// Fan Club subscriptions are paid in Ridhi Coins (1 coin ≈ ₹1.00).
// Creator keeps 70% of fan revenue; Ridhi retains 30% (20% on Creator Pro+).
// Prices shown per creator — users may join multiple creators' fan clubs.
const FAN_TIERS = [
  {
    id: "supporter", name: "Supporter",
    coinPrice: 49, rupeesApprox: "≈₹49", period: "/month",
    color: "#34C759", icon: "heart",
    perks: [
      "Supporter badge on your profile & chat",
      "Access to creator-only posts & stories",
      "Supporter-exclusive live chat colour",
      "Monthly shoutout in creator's live stream",
    ],
  },
  {
    id: "superfan", name: "Super Fan",
    coinPrice: 149, rupeesApprox: "≈₹149", period: "/month",
    color: "#FF9500", icon: "star",
    perks: [
      "All Supporter perks, plus:",
      "Direct message priority reply from creator",
      "Exclusive Super Fan live room access",
      "Monthly 50 bonus coins reward",
      "Super Fan badge (animated)",
    ],
  },
  {
    id: "vipfan", name: "VIP Fan",
    coinPrice: 499, rupeesApprox: "≈₹499", period: "/month",
    color: "#E91E8C", icon: "award",
    perks: [
      "All Super Fan perks, plus:",
      "5-min 1:1 video call with creator (monthly)",
      "Custom VIP Fan badge + profile frame",
      "Featured in creator's posts & stories",
      "Early access to creator content (24hr ahead)",
      "Monthly 150 bonus coins reward",
    ],
  },
];

// ── Boost data ─────────────────────────────────────────────────────────────────
type BoostObjective = "reach" | "leads" | "reactions";
const OBJECTIVES = [
  { id: "reach" as const,     icon: "globe",      label: "Reach",     color: "#7B2FBE", accent: "#7B2FBE20",
    sub: "Show your profile/post to thousands of new users across India" },
  { id: "leads" as const,     icon: "user-plus",  label: "Leads",     color: "#2196F3", accent: "#2196F320",
    sub: "Drive profile visits, follow requests and DM conversations" },
  { id: "reactions" as const, icon: "heart",      label: "Reactions", color: "#E91E8C", accent: "#E91E8C20",
    sub: "Maximise likes, comments and reshares on your promoted post" },
];

const CITIES    = ["Anywhere in India","Delhi","Mumbai","Bangalore","Chennai","Hyderabad","Pune","Kolkata","Jaipur","Ahmedabad","Kochi"];
const INTERESTS = ["Music","Travel","Gaming","Food","Fashion","Sports","Tech","Fitness","Movies","Comedy","Dance","Art"];
const BUDGETS = [
  { label: "₹50/day",  value: 50,  lo: 800,   hi: 1200,  reach: "800–1.2K/day"  },
  { label: "₹100/day", value: 100, lo: 2000,  hi: 3500,  reach: "2K–3.5K/day"   },
  { label: "₹250/day", value: 250, lo: 6000,  hi: 9000,  reach: "6K–9K/day"     },
  { label: "₹500/day", value: 500, lo: 14000, hi: 20000, reach: "14K–20K/day"   },
];
const DURATIONS = [
  { label: "1 day",   days: 1  },
  { label: "3 days",  days: 3  },
  { label: "7 days",  days: 7  },
  { label: "14 days", days: 14 },
];

function fmtPeople(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `${Math.round(n)}`;
}

function estimateReach(budgetVal: number, days: number, obj: BoostObjective): string {
  const mult = obj === "reach" ? 1 : obj === "reactions" ? 0.65 : 0.5;
  const bud  = BUDGETS.find(b => b.value === budgetVal) ?? BUDGETS[0];
  const lo   = Math.round(bud.lo * days * mult);
  const hi   = Math.round(bud.hi * days * mult);
  return `${fmtPeople(lo)}–${fmtPeople(hi)} people`;
}

// ── Boost section (3-step) ─────────────────────────────────────────────────────
function BoostSection({ colors }: { colors: ReturnType<typeof useColors> }) {
  const [step,      setStep]      = useState<1 | 2 | 3 | "done">(1);
  const [objective, setObjective] = useState<BoostObjective>("reach");
  const [gender,    setGender]    = useState<"all" | "male" | "female">("all");
  const [age,       setAge]       = useState<"all" | "18-24" | "25-34" | "35-44">("all");
  const [city,      setCity]      = useState(CITIES[0]);
  const [selIntr,   setSelIntr]   = useState<string[]>([]);
  const [budget,    setBudget]    = useState(100);
  const [duration,  setDuration]  = useState(3);
  const [promote,   setPromote]   = useState<"profile" | "post">("profile");
  const [showBoostPay, setShowBoostPay] = useState(false);

  const obj = OBJECTIVES.find(o => o.id === objective)!;
  const total = budget * duration;
  const toggleIntr = (i: string) =>
    setSelIntr(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const Chip = ({ label, selected, onPress, accent }: { label: string; selected: boolean; onPress: () => void; accent?: string }) => (
    <Pressable onPress={onPress} style={[bs.chip, {
      backgroundColor: selected ? (accent ?? colors.primary) : colors.card,
      borderColor:     selected ? (accent ?? colors.primary) : colors.border,
    }]}>
      <Text style={[bs.chipTxt, { color: selected ? "#fff" : colors.foreground }]}>{label}</Text>
    </Pressable>
  );

  if (step === "done") {
    return (
      <View style={[bs.doneCtr, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={bs.doneCircle}>
          <Feather name="check" size={32} color="#fff" />
        </LinearGradient>
        <Text style={[bs.doneTitle, { color: colors.foreground }]}>Promotion Launched!</Text>
        <Text style={[bs.doneSub, { color: colors.mutedForeground }]}>
          Your {obj.label} campaign is live. You'll be notified as it reaches your audience.
        </Text>
        <View style={[bs.doneStats, { backgroundColor: colors.muted }]}>
          {[
            { label: "Objective",  val: obj.label },
            { label: "Est. Reach", val: estimateReach(budget, duration, objective) },
            { label: "Budget",     val: `₹${total}` },
            { label: "Duration",   val: `${duration} day${duration > 1 ? "s" : ""}` },
          ].map(({ label, val }) => (
            <View key={label} style={bs.doneStat}>
              <Text style={[bs.doneStatVal, { color: colors.primary }]}>{val}</Text>
              <Text style={[bs.doneStatLbl, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={() => setStep(1)} style={[bs.doneBtn, { borderColor: colors.border }]}>
          <Text style={[bs.doneBtnTxt, { color: colors.foreground }]}>Create Another Boost</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: 0 }}>
      {/* Progress */}
      <View style={bs.progRow}>
        {[1, 2, 3].map((s, i) => (
          <View key={s} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={[bs.progDot, { backgroundColor: s <= step ? colors.primary : colors.muted, borderColor: s === step ? colors.primary : "transparent" }]}>
              {s < step
                ? <Feather name="check" size={11} color="#fff" />
                : <Text style={[bs.progNum, { color: s <= step ? "#fff" : colors.mutedForeground }]}>{s}</Text>}
            </View>
            {i < 2 && <View style={[bs.progLine, { backgroundColor: s < (step as number) ? colors.primary : colors.muted }]} />}
          </View>
        ))}
      </View>

      {/* Step 1 */}
      {step === 1 && (
        <View style={{ gap: 14 }}>
          <Text style={[bs.stepTitle, { color: colors.foreground }]}>Choose Your Goal</Text>
          <Text style={[bs.stepSub, { color: colors.mutedForeground }]}>What do you want this promotion to achieve?</Text>
          {OBJECTIVES.map((o) => (
            <Pressable key={o.id} onPress={() => setObjective(o.id)}
              style={[bs.objCard, { backgroundColor: objective === o.id ? o.accent : colors.card, borderColor: objective === o.id ? o.color : colors.border, borderWidth: objective === o.id ? 2 : 1 }]}>
              <View style={[bs.objIcon, { backgroundColor: o.accent }]}>
                <Feather name={o.icon as any} size={22} color={o.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[bs.objLabel, { color: colors.foreground }]}>{o.label}</Text>
                <Text style={[bs.objSub, { color: colors.mutedForeground }]}>{o.sub}</Text>
              </View>
              {objective === o.id && <View style={[bs.objCheck, { backgroundColor: o.color }]}><Feather name="check" size={12} color="#fff" /></View>}
            </Pressable>
          ))}

          {objective === "leads" && (
            <Pressable onPress={() => router.push("/lead-form-builder" as any)}
              style={[bs.leadPrompt, { backgroundColor: "#2196F312", borderColor: "#2196F340" }]}>
              <View style={[bs.leadIcon, { backgroundColor: "#2196F320" }]}><Feather name="clipboard" size={20} color="#2196F3" /></View>
              <View style={{ flex: 1 }}>
                <Text style={[bs.leadTitle, { color: colors.foreground }]}>Build a Lead Form</Text>
                <Text style={[bs.leadSub, { color: colors.mutedForeground }]}>Collect name, phone, requirements when users click your ad</Text>
              </View>
              <Feather name="arrow-right" size={16} color="#2196F3" />
            </Pressable>
          )}

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Promote</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {(["profile", "post"] as const).map((p) => (
              <Pressable key={p} onPress={() => setPromote(p)}
                style={[bs.promBtn, { flex: 1, backgroundColor: promote === p ? colors.primary : colors.card, borderColor: promote === p ? colors.primary : colors.border }]}>
                <Feather name={p === "profile" ? "user" : "image"} size={16} color={promote === p ? "#fff" : colors.mutedForeground} />
                <Text style={[bs.promBtnTxt, { color: promote === p ? "#fff" : colors.foreground }]}>{p === "profile" ? "My Profile" : "A Post"}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setStep(2)}>
            <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={bs.nextGrad}>
              <Text style={bs.nextTxt}>Next: Target Audience</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <View style={{ gap: 14 }}>
          <Text style={[bs.stepTitle, { color: colors.foreground }]}>Target Audience</Text>
          <Text style={[bs.stepSub, { color: colors.mutedForeground }]}>Define who sees your promotion</Text>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Gender</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(["all", "male", "female"] as const).map(g => (
              <Chip key={g} label={g === "all" ? "All" : g === "male" ? "Men" : "Women"} selected={gender === g} onPress={() => setGender(g)} />
            ))}
          </View>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Age Range</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(["all", "18-24", "25-34", "35-44"] as const).map(a => (
              <Chip key={a} label={a === "all" ? "Any Age" : a} selected={age === a} onPress={() => setAge(a)} />
            ))}
          </View>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>City / Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {CITIES.map(c => <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />)}
            </View>
          </ScrollView>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Interests (optional)</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS.map(i => (
              <Chip key={i} label={i} selected={selIntr.includes(i)} onPress={() => toggleIntr(i)} accent="#7B2FBE" />
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 10, alignItems: "stretch" }}>
            <Pressable onPress={() => setStep(1)} style={[bs.backBtn, { borderColor: colors.border }]}>
              <Feather name="arrow-left" size={16} color={colors.foreground} />
              <Text style={[bs.backTxt, { color: colors.foreground }]}>Back</Text>
            </Pressable>
            <Pressable onPress={() => setStep(3)} style={{ flex: 1 }}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={bs.nextGrad}>
                <Text style={bs.nextTxt}>Next: Budget</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <View style={{ gap: 14 }}>
          <Text style={[bs.stepTitle, { color: colors.foreground }]}>Budget & Duration</Text>
          <Text style={[bs.stepSub, { color: colors.mutedForeground }]}>Set your daily spend and how long to run</Text>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Daily Budget</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {BUDGETS.map(b => (
              <Pressable key={b.value} onPress={() => setBudget(b.value)}
                style={[bs.budChip, { backgroundColor: budget === b.value ? colors.primary : colors.card, borderColor: budget === b.value ? colors.primary : colors.border }]}>
                <Text style={[bs.budLabel, { color: budget === b.value ? "#fff" : colors.foreground }]}>{b.label}</Text>
                <Text style={[bs.budSub, { color: budget === b.value ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>~{b.reach}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Duration</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {DURATIONS.map(d => (
              <Chip key={d.days} label={d.label} selected={duration === d.days} onPress={() => setDuration(d.days)} />
            ))}
          </View>

          <LinearGradient colors={["#7B2FBE20", "#E91E8C20"]} style={[bs.estCard, { borderColor: "#7B2FBE30" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
              {[
                { icon: "users", val: estimateReach(budget, duration, objective), label: "Est. Reach",  color: "#7B2FBE" },
                { icon: "zap",   val: `₹${total}`,                                label: "Total Cost",  color: "#E91E8C" },
                { icon: obj.icon, val: obj.label,                                  label: "Objective",  color: obj.color },
              ].map(({ icon, val, label, color }, i) => (
                <View key={i} style={{ alignItems: "center", gap: 4 }}>
                  <Feather name={icon as any} size={18} color={color} />
                  <Text style={[bs.estVal, { color: colors.foreground }]}>{val}</Text>
                  <Text style={[bs.estLbl, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={[bs.estNote, { color: colors.mutedForeground }]}>Estimates based on your targeting. Actual results may vary.</Text>
          </LinearGradient>

          <View style={[bs.sumCard, { backgroundColor: colors.muted }]}>
            <Text style={[bs.sumTitle, { color: colors.foreground }]}>Campaign Summary</Text>
            {[
              { label: "Promote",   val: promote === "profile" ? "My Profile" : "A Post" },
              { label: "Objective", val: obj.label },
              { label: "Gender",    val: gender === "all" ? "All genders" : gender === "male" ? "Men" : "Women" },
              { label: "Age",       val: age === "all" ? "All ages" : age },
              { label: "City",      val: city },
              { label: "Duration",  val: `${duration} day${duration > 1 ? "s" : ""}` },
            ].map(({ label, val }) => (
              <View key={label} style={bs.sumRow}>
                <Text style={[bs.sumLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[bs.sumVal, { color: colors.foreground }]}>{val}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 10, alignItems: "stretch" }}>
            <Pressable onPress={() => setStep(2)} style={[bs.backBtn, { borderColor: colors.border }]}>
              <Feather name="arrow-left" size={16} color={colors.foreground} />
              <Text style={[bs.backTxt, { color: colors.foreground }]}>Back</Text>
            </Pressable>
            <Pressable onPress={() => setShowBoostPay(true)} style={{ flex: 1 }}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={bs.nextGrad}>
                <Feather name="zap" size={16} color="#fff" />
                <Text style={bs.nextTxt}>Launch for ₹{total}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}

      <PaymentSheet
        visible={showBoostPay}
        onClose={() => setShowBoostPay(false)}
        onSuccess={() => { setShowBoostPay(false); setStep("done"); }}
        amount={total}
        label={`Ridhi Boost · ${duration} day${duration > 1 ? "s" : ""}`}
        sublabel={`₹${budget}/day × ${duration} days`}
      />
    </View>
  );
}

// ── Plan comparison matrix ─────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { label: "Price/month",           free: "Free",    silver: "₹149",   gold: "₹299",       platinum: "₹599",      diamond: "₹999"        },
  { label: "Bonus Coins/mo",        free: "—",       silver: "15",     gold: "40",         platinum: "100",       diamond: "300"         },
  { label: "Super Likes",           free: "✗",       silver: "5/day",  gold: "10/day",     platinum: "15/day",    diamond: "Unlimited"   },
  { label: "Calls",                 free: "3 audio", silver: "10+5",   gold: "HD Unlim.",  platinum: "HD Unlim.", diamond: "HD Unlim."   },
  { label: "VIP Badge",             free: "✗",       silver: "Silver", gold: "Gold",       platinum: "Platinum",  diamond: "Diamond"     },
  { label: "Ad-Free",               free: "✗",       silver: "✓",      gold: "✓",          platinum: "✓",         diamond: "✓"           },
  { label: "Ghost Mode",            free: "✗",       silver: "✗",      gold: "✓",          platinum: "✓",         diamond: "✓"           },
  { label: "Podcast VIP Rooms",     free: "✗",       silver: "✗",      gold: "✓",          platinum: "✓",         diamond: "✓"           },
  { label: "AI Matchmaking",        free: "✗",       silver: "Basic",  gold: "Basic",      platinum: "Advanced",  diamond: "Full"        },
  { label: "AI Assistant",          free: "2/day",   silver: "5/day",  gold: "15/day",     platinum: "Unlimited", diamond: "Priority"    },
  { label: "AI Icebreakers",        free: "✗",       silver: "✗",      gold: "2 lang",     platinum: "13 lang",  diamond: "13+ tone"   },
  { label: "AI Reply Coach",        free: "✗",       silver: "✗",      gold: "3 sugg",     platinum: "5 sugg",   diamond: "Full"        },
  { label: "AI Chat Quality",       free: "✗",       silver: "✗",      gold: "✗",          platinum: "✓",         diamond: "✓"           },
  { label: "Cross-Gender Chat",     free: "✗",       silver: "3/day",  gold: "20 coins",   platinum: "50 coins",  diamond: "Unlimited"   },
  { label: "E2EE Encrypted Chat",   free: "✗",       silver: "✗",      gold: "✗",          platinum: "✓",         diamond: "✓"           },
  { label: "TikTok Tools",          free: "✗",       silver: "Captions",gold: "TTS+Carousel",platinum: "Full",     diamond: "Full"        },
  { label: "Duet & Stitch",         free: "✗",       silver: "✗",      gold: "✓",          platinum: "✓",         diamond: "✓"           },
  { label: "Voice Reels",           free: "✓",       silver: "✓",      gold: "✓",          platinum: "✓",         diamond: "✓"           },
  { label: "Creator Dashboard",     free: "✗",       silver: "View",   gold: "Basic",      platinum: "Advanced",  diamond: "Full"        },
  { label: "Go Live",               free: "✗",       silver: "✗",      gold: "✗",          platinum: "3hr/day",  diamond: "Unlimited"   },
  { label: "Brand Deals",           free: "✗",       silver: "✗",      gold: "✗",          platinum: "Browse",  diamond: "Direct"      },
  { label: "PK Battle",             free: "✓",       silver: "✓",      gold: "✓",          platinum: "✓",      diamond: "✓"         },
  { label: "KYC Badge",             free: "✗",       silver: "✗",      gold: "Fast",       platinum: "Instant",  diamond: "Instant"     },
  { label: "Referral Multiplier",   free: "✗",       silver: "✗",      gold: "1.5×",        platinum: "1.5×",      diamond: "2×"          },
  { label: "Incognito",             free: "✗",       silver: "✗",      gold: "✗",          platinum: "✓",         diamond: "✓"           },
  { label: "Profile Boost",         free: "✗",       silver: "1/week", gold: "Auto/day",  platinum: "3×/day",   diamond: "Featured"    },
  { label: "Homepage Featured",     free: "✗",       silver: "✗",      gold: "✗",          platinum: "✗",         diamond: "✓"           },
  { label: "Leaderboard",           free: "✗",       silver: "View",   gold: "View",       platinum: "View",      diamond: "Top 100"     },
  { label: "Group Chat Admin",      free: "✗",       silver: "Join",   gold: "Join",       platinum: "Create 200",diamond: "Create 500"  },
  { label: "Music Library",         free: "✗",       silver: "✗",      gold: "✓",          platinum: "✓",         diamond: "✓"           },
  { label: "Coin Store",            free: "✗",       silver: "✗",      gold: "Browse",     platinum: "Browse",  diamond: "All"         },
  { label: "Vibe Stars",            free: "✗",       silver: "Basic",  gold: "Full",       platinum: "Full",      diamond: "Full"        },
  { label: "Call Persona",          free: "✗",       silver: "1 slot", gold: "3 slots",    platinum: "5 slots",  diamond: "Unlimited"   },
  { label: "Host Dashboard",        free: "✗",       silver: "✗",      gold: "✗",          platinum: "Basic",   diamond: "Full"        },
  { label: "Creator Dashboard",   free: "✗",       silver: "✗",      gold: "✗",          platinum: "✗",         diamond: "✓"           },
  { label: "Creator Marketplace",   free: "✗",       silver: "✗",      gold: "✗",          platinum: "Browse",  diamond: "Full"        },
  { label: "Brand Post Deals",      free: "✗",       silver: "✗",      gold: "✗",          platinum: "View",    diamond: "Create"      },
  { label: "Yearly Saving",         free: "—",       silver: "44%",    gold: "44%",        platinum: "44%",       diamond: "42%"         },
];

function CompareTable({ colors }: { colors: ReturnType<typeof useColors> }) {
  const colW = (width - 32) / 6;
  const cols = [
    { key: "label",    head: "Feature",   color: colors.foreground, bg: "transparent" },
    { key: "free",     head: "Free",      color: "#888",            bg: "#88888818"   },
    { key: "silver",   head: "Silver",    color: "#A0A0A0",         bg: "#A0A0A018"   },
    { key: "gold",     head: "Gold",      color: "#FFB800",         bg: "#FFB80018"   },
    { key: "platinum", head: "Platinum",  color: "#7B2FBE",         bg: "#7B2FBE18"   },
    { key: "diamond",  head: "Diamond",   color: "#E91E8C",         bg: "#E91E8C18"   },
  ] as const;

  return (
    <View style={[styles.tableWrap, { borderColor: colors.border }]}>
      {/* Head */}
      <View style={[styles.tableRow, { backgroundColor: colors.muted }]}>
        {cols.map(c => (
          <View key={c.key} style={[styles.tableCell, { width: colW, backgroundColor: c.bg }]}>
            <Text style={[styles.tableHead, { color: c.color }]}>{c.head}</Text>
          </View>
        ))}
      </View>
      {/* Rows */}
      {COMPARE_ROWS.map((row, i) => (
        <View key={row.label} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? colors.card : colors.muted + "40" }]}>
          {cols.map(c => {
            const val = row[c.key as keyof typeof row];
            const isTick = val === "✓" || val === "Priority";
            const isCross= val === "✗";
            return (
              <View key={c.key} style={[styles.tableCell, { width: colW }]}>
                {isTick  ? <Feather name="check-circle" size={13} color={c.key === "label" ? colors.foreground : c.color} />
               : isCross ? <Text style={[styles.tableCross, { color: colors.mutedForeground }]}>—</Text>
               : <Text style={[styles.tableTxt, { color: c.key === "label" ? colors.mutedForeground : c.color }]} numberOfLines={1}>{val}</Text>}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
type Section = "plans" | "creator" | "boost" | "fan" | "shop";

function getPlanPrice(plan: typeof PLANS[0], billing: BillingPeriod): number | null {
  return plan.prices[billing] ?? null;
}

function formatPlanPrice(plan: typeof PLANS[0], billing: BillingPeriod): string {
  const p = getPlanPrice(plan, billing);
  if (p === null) return "N/A";
  if (p === 0) return "Free";
  return `₹${p.toLocaleString("en-IN")}`;
}

function billingLabel(billing: BillingPeriod): string {
  return billing === "weekly" ? "/week" : billing === "monthly" ? "/month" : "/year";
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function SubscriptionScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const { user, cancelPlan, syncWallet } = useAuth();

  const [section,      setSection]      = useState<Section>("plans");
  const [billing,      setBilling]      = useState<BillingPeriod>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<"free"|"silver"|"gold"|"platinum"|"diamond">(user?.plan ?? "gold");
  const [showCompare,  setShowCompare]  = useState(false);
  const [unlockCat,    setUnlockCat]    = useState(0);
  const [payAmount,    setPayAmount]    = useState(0);
  const [payLabel,     setPayLabel]     = useState("");
  const [showPayment,  setShowPayment]  = useState(false);
  const [pendingPlanId,  setPendingPlanId]  = useState<string>("");
  const [pendingBilling, setPendingBilling] = useState<string>("monthly");
  const [pendingBonus,   setPendingBonus]   = useState<number>(0);
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [activatedPlan,  setActivatedPlan]  = useState<string>("");

  const currentPlan = PLANS.find(p => p.id === selectedPlan)!;

  const activePlanId    = user?.plan ?? "free";
  const activePlanName  = PLANS.find(p => p.id === activePlanId)?.name ?? "Free";
  const planExpiry      = user?.planExpiresAt;
  const creatorPlanId   = user?.creatorPlan;
  const creatorExpiry   = user?.creatorPlanExpiresAt;

  const { trackSubscription } = useAnalytics();
  const [iapLoading, setIapLoading] = useState(false);
  const [iapError, setIapError] = useState("");

  const handleIapPurchase = async (planId: string, billing: string) => {
    if (!isIapAvailable()) return false;
    setIapLoading(true);
    setIapError("");
    try {
      const offerings = await getOfferings();
      const packages = offerings?.vipPackages ?? [];
      const pkg = packages.find((p) => p.identifier.includes(planId) && p.identifier.includes(billing));
      if (!pkg) {
        setIapError("This plan is not available on App Store yet.");
        return false;
      }
      const result = await purchasePackage(pkg);
      if (result.success) {
        return true;
      }
      if (result.error && result.error !== "User cancelled") {
        setIapError(result.error);
      }
      return false;
    } catch {
      setIapError("Purchase failed. Please try again.");
      return false;
    } finally {
      setIapLoading(false);
    }
  };

  const handlePlanSuccess = async (txnId: string) => {
    // Server auto-activates plan after verified payment. Sync from server.
    await syncWallet();
    const planName = pendingPlanId.startsWith("creator_")
      ? CREATOR_PLANS.find(p => p.id === pendingPlanId)?.name ?? pendingPlanId
      : PLANS.find(p => p.id === pendingPlanId)?.name ?? pendingPlanId;
    setActivatedPlan(planName);
    setShowPayment(false);
    setShowSuccess(true);
    trackSubscription(planName);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Gradient header ── */}
      <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.headerTitle}>Premium & Promotions</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero tagline */}
        <View style={styles.heroWrap}>
          <LinearGradient colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]} style={styles.crownBadge}>
            <Feather name="zap" size={22} color="#FFD700" />
          </LinearGradient>
          <Text style={styles.heroTitle}>Unlock the full{"\n"}Ridhi experience</Text>
          <Text style={styles.heroSub}>Grow your audience · Earn more · Access exclusive features</Text>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { val: "1.4Cr+", label: "Active Users"      },
            { val: "Save 44%", label: "On Yearly Plans"  },
            { val: "₹149",   label: "Starts From/Month" },
          ].map(({ val, label }) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Tab bar */}
        <View style={[styles.tabBar, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
          {([
            { key: "plans"   as Section, label: "VIP",      icon: "award"       },
            { key: "creator" as Section, label: "Creator",  icon: "video"       },
            { key: "boost"   as Section, label: "Boost",    icon: "trending-up" },
            { key: "fan"     as Section, label: "Fan Club", icon: "heart"       },
            { key: "shop"    as Section, label: "Shop",     icon: "shopping-bag" },
          ]).map(({ key, label, icon }) => (
            <Pressable key={key} onPress={() => setSection(key)}
              style={[styles.tabBtn, section === key && styles.tabBtnActive]}>
              <Feather name={icon as any} size={13} color={section === key ? "#7B2FBE" : "rgba(255,255,255,0.8)"} />
              <Text style={[styles.tabTxt, section === key && styles.tabTxtActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {/* ── Content ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>

        {/* ══════════════ VIP PLANS ══════════════ */}
        {section === "plans" && (
          <View style={styles.sectionWrap}>

            {/* ── Active plan status card ── */}
            {activePlanId !== "free" ? (
              <View style={[styles.activePlanCard, { backgroundColor: colors.card, borderColor: colors.primary + "50" }]}>
                <LinearGradient colors={["#7B2FBE20", "#E91E8C10"]} style={StyleSheet.absoluteFill} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activePlanLabel, { color: colors.mutedForeground }]}>Current Plan</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <SubscriptionBadge tier={activePlanId as VipTier} size="md" />
                    <Text style={[styles.activePlanName, { color: colors.foreground }]}>{activePlanName}</Text>
                  </View>
                  <Text style={[styles.activePlanExpiry, { color: colors.mutedForeground }]}>
                    Renews · {fmtDate(planExpiry)}
                  </Text>
                </View>
                <Pressable onPress={() => cancelPlan()} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                  <Text style={[styles.cancelTxt, { color: colors.mutedForeground }]}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[styles.activePlanCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="award" size={18} color={colors.mutedForeground} />
                <Text style={[styles.activePlanName, { color: colors.foreground, flex: 1 }]}>No active plan · Free tier</Text>
                <Text style={[styles.activePlanExpiry, { color: colors.primary }]}>↓ Subscribe below</Text>
              </View>
            )}

            {/* What you unlock — category selector */}
            <View style={[styles.unlockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.unlockCardTitle, { color: colors.foreground }]}>What You Unlock</Text>
              <Text style={[styles.unlockCardSub, { color: colors.mutedForeground }]}>Tap a category to explore features</Text>

              {/* Category tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, flexDirection: "row" }}>
                {UNLOCK_CATEGORIES.map((cat, i) => (
                  <Pressable key={cat.title} onPress={() => setUnlockCat(i)}
                    style={[styles.catTab, { backgroundColor: unlockCat === i ? cat.color : colors.muted, borderColor: unlockCat === i ? cat.color : "transparent" }]}>
                    <Feather name={cat.icon as any} size={12} color={unlockCat === i ? "#fff" : colors.mutedForeground} />
                    <Text style={[styles.catTabTxt, { color: unlockCat === i ? "#fff" : colors.foreground }]}>{cat.title}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Features grid for selected category */}
              <View style={styles.featGrid}>
                {UNLOCK_CATEGORIES[unlockCat].items.map((item) => {
                  const col = PLAN_COLOR[item.plan] ?? "#888";
                  return (
                    <View key={item.label} style={[styles.featCell, { backgroundColor: col + "12", borderColor: col + "30" }]}>
                      <View style={[styles.featIcon, { backgroundColor: col + "20" }]}>
                        <Feather name={item.icon as any} size={14} color={col} />
                      </View>
                      <Text style={[styles.featLabel, { color: colors.foreground }]}>{item.label}</Text>
                      <View style={[styles.featPlanBadge, { backgroundColor: col }]}>
                        <Text style={styles.featPlanTxt}>{item.plan === "vip" ? "Diamond" : item.plan.charAt(0).toUpperCase() + item.plan.slice(1)}+</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Billing period toggle */}
            <View style={[styles.billingRow, { backgroundColor: colors.muted }]}>
              {([
                { key: "weekly",  label: "Weekly",  badge: null        },
                { key: "monthly", label: "Monthly", badge: "Popular"   },
                { key: "yearly",  label: "Yearly",  badge: "Save 44%"  },
              ] as { key: BillingPeriod; label: string; badge: string | null }[]).map(({ key, label, badge }) => (
                <Pressable key={key} onPress={() => setBilling(key)}
                  style={[styles.billingBtn, billing === key && { backgroundColor: colors.primary }]}>
                  {badge && (
                    <Text style={[styles.billingBadge, { color: key === "yearly" ? "#34C759" : "rgba(255,255,255,0.9)" }]}>
                      {badge}
                    </Text>
                  )}
                  <Text style={[styles.billingTxt, { color: billing === key ? "#fff" : colors.mutedForeground }]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Plan cards */}
            {PLANS.map((plan) => {
              const sel       = selectedPlan === plan.id;
              const priceNum  = getPlanPrice(plan, billing);
              const priceStr  = formatPlanPrice(plan, billing);
              const periodStr = plan.id === "free" ? "" : billingLabel(billing);
              const unavail   = priceNum === null;
              return (
                <Pressable key={plan.id} onPress={() => !unavail && setSelectedPlan(plan.id as "free"|"silver"|"gold"|"platinum"|"diamond")}
                  style={[styles.planCard, { backgroundColor: colors.card, borderColor: sel ? plan.color : colors.border, borderWidth: sel ? 2 : 1, opacity: unavail ? 0.5 : 1 }]}>

                  {plan.popular && (
                    <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.popularBanner}>
                      <Image source={COIN_IMAGE} style={{ width: 11, height: 11 }} resizeMode="contain" />
                      <Text style={styles.popularText}>Most Popular</Text>
                    </LinearGradient>
                  )}

                  <View style={styles.planTop}>
                    <LinearGradient colors={plan.gradient} style={styles.planIconWrap}>
                      <Feather name={plan.id === "free" ? "user" : plan.id === "silver" ? "shield" : plan.id === "gold" ? "award" : plan.id === "platinum" ? "layers" : "zap"} size={22} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
                        <Text style={[styles.planPrice, { color: plan.color }]}>
                          {unavail ? "—" : priceStr}
                        </Text>
                        <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>{periodStr}</Text>
                      </View>
                      {plan.bonusCoins > 0 && (
                        <Text style={{ fontSize: 10, color: "#34C759", fontFamily: "Inter_600SemiBold", marginTop: 2 }}>
                          +{plan.bonusCoins.toLocaleString("en-IN")} bonus coins/month
                        </Text>
                      )}
                      {unavail && (
                        <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>Not available on {billing} billing</Text>
                      )}
                    </View>
                    {sel && (
                      <View style={[styles.selCheck, { backgroundColor: plan.color }]}>
                        <Feather name="check" size={14} color="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Highlights row */}
                  <View style={[styles.planHighlights, { backgroundColor: plan.color + "10", borderColor: plan.color + "25" }]}>
                    {plan.highlights.map((h) => (
                      <View key={h} style={styles.planHL}>
                        <Feather name="check" size={11} color={plan.color} />
                        <Text style={[styles.planHLTxt, { color: plan.color }]} numberOfLines={1}>{h}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Features */}
                  <View style={styles.featList}>
                    {plan.features.map(f => (
                      <View key={f} style={styles.featRow}>
                        <Feather name="check-circle" size={14} color="#34C759" />
                        <Text style={[styles.featTxt, { color: colors.foreground }]}>{f}</Text>
                      </View>
                    ))}
                    {plan.locked.slice(0, 2).map(f => (
                      <View key={f} style={styles.featRow}>
                        <Feather name="lock" size={13} color={colors.mutedForeground} />
                        <Text style={[styles.featTxt, { color: colors.mutedForeground }]}>{f}</Text>
                      </View>
                    ))}
                    {plan.locked.length > 2 && (
                      <Text style={[styles.moreLocked, { color: colors.mutedForeground }]}>+{plan.locked.length - 2} more locked features</Text>
                    )}
                  </View>

                  {/* Active badge on current plan */}
                  {activePlanId === plan.id && plan.id !== "free" && (
                    <View style={[styles.activeBanner, { backgroundColor: "#34C75918", borderColor: "#34C75940" }]}>
                      <Feather name="check-circle" size={14} color="#34C759" />
                      <Text style={[styles.activeBannerTxt, { color: "#34C759" }]}>Active · Renews {fmtDate(planExpiry)}</Text>
                    </View>
                  )}

                  {plan.id !== "free" && !unavail && activePlanId !== plan.id && (
                    <Pressable onPress={async () => {
                      if (Platform.OS === "ios" && isIapAvailable()) {
                        const ok = await handleIapPurchase(plan.id, billing);
                        if (ok) {
                          setPendingPlanId(plan.id);
                          setPendingBilling(billing);
                          setPendingBonus(plan.bonusCoins);
                          handlePlanSuccess("iap_" + Date.now());
                          return;
                        }
                        // IAP unavailable or plan not on App Store — fall through to Razorpay
                        setIapError("");
                      }
                      setPendingPlanId(plan.id);
                      setPendingBilling(billing);
                      setPendingBonus(plan.bonusCoins);
                      setPayAmount(priceNum!);
                      setPayLabel(`${plan.name} — ${priceStr}${periodStr}`);
                      setShowPayment(true);
                    }}>
                      <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subBtn}>
                        <Feather name="zap" size={15} color="#fff" />
                        <Text style={styles.subBtnTxt}>
                          {PLAN_RANK[activePlanId] > 0 && PLAN_RANK[plan.id] > PLAN_RANK[activePlanId]
                            ? `Upgrade to ${plan.name} — ${priceStr}${periodStr}`
                            : `Subscribe — ${priceStr}${periodStr}`}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                </Pressable>
              );
            })}

            {/* Compare Plans toggle */}
            <Pressable onPress={() => setShowCompare(v => !v)}
              style={[styles.compareToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="grid" size={16} color={colors.primary} />
              <Text style={[styles.compareToggleTxt, { color: colors.primary }]}>
                {showCompare ? "Hide" : "View"} Full Feature Comparison
              </Text>
              <Feather name={showCompare ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
            </Pressable>

            {showCompare && (
              <>
                <Text style={[styles.compareTitle, { color: colors.foreground }]}>Feature Comparison</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <CompareTable colors={colors} />
                </ScrollView>
              </>
            )}

            {/* Payment methods */}
            <View style={[styles.payCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.payTitle, { color: colors.foreground }]}>
                {Platform.OS === "ios" ? "Apple In-App Purchase" : "Secure Indian Payments"}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {Platform.OS === "ios" ? [
                  { label: "App Store", icon: "smartphone", color: "#007AFF" },
                ].map(pm => (
                  <View key={pm.label} style={[styles.payMethod, { backgroundColor: colors.muted }]}>
                    <Feather name={pm.icon as any} size={15} color={pm.color} />
                    <Text style={[styles.payMethodTxt, { color: colors.foreground }]}>{pm.label}</Text>
                  </View>
                )) : [
                  { label: "UPI",        icon: "smartphone",  color: "#00BCD4" },
                  { label: "Razorpay",   icon: "credit-card", color: "#2962FF" },
                  { label: "Google Pay", icon: "globe",       color: "#34A853" },
                  { label: "PhonePe",    icon: "zap",         color: "#5F259F" },
                  { label: "Paytm",      icon: "shopping-bag",color: "#00BAF2" },
                ].map(pm => (
                  <View key={pm.label} style={[styles.payMethod, { backgroundColor: colors.muted }]}>
                    <Feather name={pm.icon as any} size={15} color={pm.color} />
                    <Text style={[styles.payMethodTxt, { color: colors.foreground }]}>{pm.label}</Text>
                  </View>
                ))}
              </View>
              {!!iapError && (
                <Text style={[styles.payNote, { color: "#FF3B30" }]}>{iapError}</Text>
              )}
              <Text style={[styles.payNote, { color: colors.mutedForeground }]}>
                Auto-renews monthly. Cancel anytime. {Platform.OS === "ios" ? "Manage via Settings > Apple ID > Subscriptions." : ""}
              </Text>
            </View>
          </View>
        )}

        {/* ══════════════ CREATOR PLANS ══════════════ */}
        {section === "creator" && (
          <View style={styles.sectionWrap}>

            {/* Hero banner */}
            <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={{ borderRadius: 18, padding: 18 }}>
              <Text style={{ color: "#fff", fontSize: 19, fontFamily: "Inter_700Bold" }}>Creator Pass</Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 6, lineHeight: 19 }}>
                For streamers, podcasters, influencers & performers.{"\n"}Grow your audience and keep more of what you earn.
              </Text>
              {/* Commission callout */}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                {[
                  { tier: "Starter", pct: "10%", color: "#2196F3" },
                  { tier: "Pro",     pct: "17%", color: "#9C27B0" },
                  { tier: "Elite",   pct: "22%", color: "#E91E8C" },
                ].map(c => (
                  <View key={c.tier} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, padding: 8, alignItems: "center" }}>
                    <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" }}>{c.pct}</Text>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "Inter_400Regular" }}>commission</Text>
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Inter_500Medium", marginTop: 2 }}>saved on {c.tier}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            {/* Billing toggle — monthly / yearly */}
            <View style={[styles.billingRow, { backgroundColor: colors.muted }]}>
              {([
                { key: "monthly" as BillingPeriod, label: "Monthly",  badge: null       },
                { key: "yearly"  as BillingPeriod, label: "Yearly",   badge: "Save 17%" },
              ]).map(({ key, label, badge }) => (
                <Pressable key={key} onPress={() => setBilling(key)}
                  style={[styles.billingBtn, billing === key && { backgroundColor: colors.primary }]}>
                  {badge && <Text style={[styles.billingBadge, { color: "#34C759" }]}>{badge}</Text>}
                  <Text style={[styles.billingTxt, { color: billing === key ? "#fff" : colors.mutedForeground }]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {CREATOR_PLANS.map((plan) => {
              const price  = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
              const period = billing === "yearly" ? "/year" : "/month";
              return (
                <View key={plan.id} style={[styles.planCard, { backgroundColor: colors.card, borderColor: plan.color + "50", borderWidth: 1.5 }]}>
                  {plan.popular && (
                    <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.popularBanner}>
                      <Feather name="trending-up" size={11} color="#fff" />
                      <Text style={styles.popularText}>Most Popular for Creators</Text>
                    </LinearGradient>
                  )}
                  <View style={styles.planTop}>
                    <LinearGradient colors={plan.gradient} style={styles.planIconWrap}>
                      <Feather name={plan.icon} size={22} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{plan.tagline}</Text>
                      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                        <Text style={[styles.planPrice, { color: plan.color }]}>₹{price.toLocaleString("en-IN")}</Text>
                        <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>{period}</Text>
                        {billing === "yearly" && (
                          <View style={{ backgroundColor: "#34C75922", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text style={{ color: "#34C759", fontSize: 9, fontFamily: "Inter_700Bold" }}>SAVE {plan.yearlySaving}%</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Highlights */}
                  <View style={[styles.planHighlights, { backgroundColor: plan.color + "10", borderColor: plan.color + "25" }]}>
                    {plan.highlights.map((h) => (
                      <View key={h} style={styles.planHL}>
                        <Feather name="check" size={11} color={plan.color} />
                        <Text style={[styles.planHLTxt, { color: plan.color }]} numberOfLines={1}>{h}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.featList}>
                    {plan.features.map(f => (
                      <View key={f} style={styles.featRow}>
                        <Feather name="check-circle" size={14} color="#34C759" />
                        <Text style={[styles.featTxt, { color: colors.foreground }]}>{f}</Text>
                      </View>
                    ))}
                    {plan.locked.length > 0 && plan.locked.map(f => (
                      <View key={f} style={styles.featRow}>
                        <Feather name="lock" size={13} color={colors.mutedForeground} />
                        <Text style={[styles.featTxt, { color: colors.mutedForeground }]}>{f}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Active badge on current creator plan */}
                  {creatorPlanId === plan.id && (
                    <View style={[styles.activeBanner, { backgroundColor: "#34C75918", borderColor: "#34C75940" }]}>
                      <Feather name="check-circle" size={14} color="#34C759" />
                      <Text style={[styles.activeBannerTxt, { color: "#34C759" }]}>Active · Renews {fmtDate(creatorExpiry)}</Text>
                    </View>
                  )}

                  {creatorPlanId !== plan.id && (
                    <Pressable onPress={() => {
                      setPendingPlanId(plan.id);
                      setPendingBilling(billing);
                      setPendingBonus(0);
                      setPayAmount(price);
                      setPayLabel(`${plan.name} — ₹${price.toLocaleString("en-IN")}${period}`);
                      setShowPayment(true);
                    }}>
                      <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subBtn}>
                        <Feather name="zap" size={15} color="#fff" />
                        <Text style={styles.subBtnTxt}>Start {plan.name} — ₹{price.toLocaleString("en-IN")}{period}</Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                </View>
              );
            })}

            {/* Revenue model note */}
            <View style={[styles.payCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.payTitle, { color: colors.foreground }]}>How Creator Earnings Work</Text>
              <View style={{ gap: 10, marginTop: 10 }}>
                {[
                  { icon: "gift",        color: "#E91E8C", text: "Gifts from live streams → 70–92% goes to you" },
                  { icon: "users",       color: "#7B2FBE", text: "Fan Club coins → 70–92% revenue share"       },
                  { icon: "mic",         color: "#2196F3", text: "Paid podcast episodes → 70–92% revenue share" },
                  { icon: "credit-card", color: "#FFB800", text: "Minimum withdrawal: 1,000 coins (≈₹1,000)"    },
                ].map(({ icon, color, text }) => (
                  <View key={text} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: color + "20", alignItems: "center", justifyContent: "center" }}>
                      <Feather name={icon as any} size={14} color={color} />
                    </View>
                    <Text style={{ flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 19 }}>{text}</Text>
                  </View>
                ))}
              </View>
              <Pressable onPress={() => router.push("/creator-dashboard")} style={[styles.subBtn, { backgroundColor: colors.primary, margin: 0, marginTop: 14 }]}>
                <Text style={styles.subBtnTxt}>Go to Creator Dashboard</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ══════════════ BOOST & ADS ══════════════ */}
        {section === "boost" && (
          <View style={styles.sectionWrap}>
            {/* Hero */}
            <LinearGradient colors={["#7B2FBE15", "#E91E8C10"]} style={[styles.boostHero, { borderColor: "#7B2FBE30" }]}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.boostHeroIcon}>
                <Feather name="trending-up" size={26} color="#fff" />
              </LinearGradient>
              <Text style={[styles.boostTitle, { color: colors.foreground }]}>Grow Your Reach</Text>
              <Text style={[styles.boostSub, { color: colors.mutedForeground }]}>
                Promote your profile or posts to thousands of targeted Ridhi users — like Instagram Ads, built for India.
              </Text>
              <View style={{ flexDirection: "row", gap: 24 }}>
                {[
                  { val: "1.4Cr+", label: "Active Users" },
                  { val: "₹50/day", label: "Start From"  },
                  { val: "3 Goals", label: "Objectives"  },
                ].map(({ val, label }) => (
                  <View key={label} style={{ alignItems: "center" }}>
                    <Text style={[styles.boostStatVal, { color: colors.primary }]}>{val}</Text>
                    <Text style={[styles.boostStatLbl, { color: colors.mutedForeground }]}>{label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            {/* Want to run a Business Ad? */}
            <Pressable onPress={() => router.push("/ads-manager" as any)}
              style={[styles.bizAdBanner, { backgroundColor: "#7B2FBE12", borderColor: "#7B2FBE30" }]}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.bizAdIcon}>
                <Feather name="zap" size={18} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bizAdTitle, { color: colors.foreground }]}>Running a Business?</Text>
                <Text style={[styles.bizAdSub, { color: colors.mutedForeground }]}>
                  Launch full ad campaigns with targeting, budgets & analytics in Ridhi Ads Manager
                </Text>
              </View>
              <Feather name="arrow-right" size={16} color="#7B2FBE" />
            </Pressable>

            <BoostSection colors={colors} />
          </View>
        )}

        {/* ══════════════ FAN CLUBS ══════════════ */}
        {section === "fan" && (
          <View style={styles.sectionWrap}>

            {/* Explainer */}
            <LinearGradient colors={["#E91E8C22", "#7B2FBE11"]} style={{ borderRadius: 16, padding: 16, gap: 6 }}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: "Inter_700Bold" }}>Fan Club Memberships</Text>
              <Text style={[styles.fanDesc, { color: colors.mutedForeground, marginTop: 0 }]}>
                Support your favourite Ridhi creators using coins. Prices shown are per creator — join as many as you like!
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                {[
                  { icon: "credit-card", label: "1 Coin ≈ ₹1.00",    color: "#FFB800" },
                  { icon: "users",       label: "Creator gets 70%+",  color: "#34C759" },
                  { icon: "refresh-cw",  label: "Cancel anytime",     color: "#7B2FBE" },
                ].map(({ icon, label, color }) => (
                  <View key={label} style={{ flex: 1, backgroundColor: color + "15", borderRadius: 10, padding: 8, alignItems: "center", gap: 4 }}>
                    <Feather name={icon as any} size={14} color={color} />
                    <Text style={{ color: colors.foreground, fontSize: 9, fontFamily: "Inter_600SemiBold", textAlign: "center" }}>{label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            {FAN_TIERS.map((tier) => (
              <View key={tier.id} style={[styles.fanCard, { backgroundColor: colors.card, borderColor: tier.color + "50" }]}>
                <LinearGradient colors={[tier.color + "20", "transparent"]} style={styles.fanCardGrad} />
                <View style={styles.fanHead}>
                  <View style={[styles.fanIconCircle, { backgroundColor: tier.color + "20" }]}>
                    <Feather name={tier.icon as any} size={22} color={tier.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fanName, { color: colors.foreground }]}>{tier.name}</Text>
                    {/* Coin price + rupee approx */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: tier.color }}>
                          {tier.coinPrice}
                        </Text>
                        <RidhiCoin size={15} />
                        <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{tier.period}</Text>
                      </View>
                      <View style={{ backgroundColor: tier.color + "20", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: tier.color }}>{tier.rupeesApprox}</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    style={[styles.joinBtn, { backgroundColor: tier.color }]}
                    onPress={() => { setPayAmount(tier.coinPrice); setPayLabel(`${tier.name} Fan Club · ${tier.coinPrice} coins/month`); setShowPayment(true); }}
                  >
                    <Text style={styles.joinTxt}>Join</Text>
                  </Pressable>
                </View>
                <View style={styles.perksWrap}>
                  {tier.perks.map(p => (
                    <View key={p} style={styles.perkRow}>
                      <Feather name="check" size={13} color={tier.color} />
                      <Text style={[styles.perkTxt, { color: colors.foreground }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Creator CTA */}
            <LinearGradient colors={["#7B2FBE15", "#E91E8C10"]} style={[styles.creatorCTA, { borderColor: "#7B2FBE30" }]}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                <Image source={COIN_IMAGE} style={{ width: 18, height: 18 }} resizeMode="contain" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.creatorTitle, { color: colors.foreground }]}>Are you a Creator?</Text>
                <Text style={[styles.creatorSub, { color: colors.mutedForeground }]}>
                  Set up Fan Club tiers and earn coins from your followers every month
                </Text>
              </View>
              <Pressable onPress={() => setSection("creator")}
                style={[styles.creatorBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.creatorBtnTxt}>Creator Pass</Text>
              </Pressable>
            </LinearGradient>
          </View>
        )}

        {/* ══════════════ SHOP ══════════════ */}
        {section === "shop" && (
          <View style={styles.sectionWrap}>
            {/* Shop header */}
            <LinearGradient colors={[colors.primary + "20", colors.secondary + "10"]} style={{ borderRadius: 16, padding: 16, gap: 8, alignItems: "center" }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" }}>
                <Feather name="shopping-bag" size={24} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Ridhi Shop</Text>
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" }}>
                Browse curated products from Fashion, Beauty, Electronics & Home. Buy with coins and earn rewards!
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                {[
                  { icon: "award", label: "VIP discounts", color: "#7B2FBE" },
                  { icon: "truck", label: "Free shipping", color: "#34C759" },
                  { icon: "repeat", label: "Easy returns", color: "#FF6B35" },
                ].map(({ icon, label, color }) => (
                  <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: color + "15", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Feather name={icon as any} size={10} color={color} />
                    <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color }}>{label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            {/* Product grid */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {PRODUCTS.map((product) => (
                <Pressable
                  key={product.id}
                  style={{ width: (width - 52) / 2, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border + "50", overflow: "hidden" }}
                  onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id } })}
                >
                  <Image source={{ uri: product.image }} style={{ width: "100%", aspectRatio: 1, backgroundColor: colors.muted }} resizeMode="cover" />
                  <View style={{ padding: 10, gap: 4 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.primary, textTransform: "uppercase" }}>{product.category}</Text>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground }} numberOfLines={2}>{product.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>{product.price}</Text>
                        <RidhiCoin size={12} />
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                        <Feather name="star" size={10} color="#FFD700" />
                        <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>{product.rating}</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    style={{ backgroundColor: colors.primary, marginHorizontal: 10, marginBottom: 10, borderRadius: 10, paddingVertical: 8, alignItems: "center" }}
                    onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id } })}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" }}>View Details</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>

            {/* Open full shop CTA */}
            <Pressable onPress={() => router.push("/shop" as any)}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.primary + "12", borderRadius: 16, borderWidth: 1, borderColor: colors.primary + "30", padding: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" }}>
                <Feather name="shopping-cart" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>Open Full Shop</Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Search, cart, wishlist & more</Text>
              </View>
              <Feather name="arrow-right" size={16} color={colors.primary} />
            </Pressable>
          </View>
        )}
      </ScrollView>

      <PaymentSheet
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePlanSuccess}
        amount={payAmount}
        label={payLabel}
        sku={pendingPlanId ? `${pendingPlanId}_${pendingBilling}` : undefined}
      />

      {/* ── Plan Activated Success Modal ── */}
      <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={() => setShowSuccess(false)}>
        <View style={styles.successOverlay}>
          <View style={[styles.successCard, { backgroundColor: colors.card }]}>
            <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.successCircle}>
              <Feather name="check" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Plan Activated!</Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
              Your <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>{activatedPlan}</Text> is now active.{"\n"}All features are unlocked immediately.
            </Text>
            <View style={[styles.successFeatures, { backgroundColor: colors.muted }]}>
              {[
                { icon: "check-circle", text: "VIP badge on your profile" },
                { icon: "check-circle", text: "Bonus coins added to wallet" },
                { icon: "check-circle", text: "All plan features unlocked" },
                { icon: "check-circle", text: "Auto-renews until cancelled" },
              ].map(f => (
                <View key={f.text} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name={f.icon as any} size={14} color="#34C759" />
                  <Text style={[styles.successFeatureTxt, { color: colors.foreground }]}>{f.text}</Text>
                </View>
              ))}
            </View>
            <Pressable onPress={() => setShowSuccess(false)} style={{ width: "100%" }}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.successBtn}>
                <Text style={styles.successBtnTxt}>Awesome, let's go!</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Boost sub-styles ───────────────────────────────────────────────────────────
const bs = StyleSheet.create({
  chip:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipTxt:     { fontSize: 13, fontFamily: "Inter_500Medium" },
  progRow:     { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  progDot:     { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  progNum:     { fontSize: 12, fontFamily: "Inter_700Bold" },
  progLine:    { width: 40, height: 2, marginHorizontal: 4 },
  stepTitle:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  stepSub:     { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  miniLabel:   { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: -6 },
  objCard:     { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  objIcon:     { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  objLabel:    { fontSize: 15, fontFamily: "Inter_700Bold" },
  objSub:      { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 17 },
  objCheck:    { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  leadPrompt:  { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  leadIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  leadTitle:   { fontSize: 14, fontFamily: "Inter_700Bold" },
  leadSub:     { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  promBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  promBtnTxt:  { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nextGrad:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  nextTxt:     { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  backBtn:     { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1 },
  backTxt:     { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  budChip:     { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, alignItems: "center", minWidth: 80 },
  budLabel:    { fontSize: 14, fontFamily: "Inter_700Bold" },
  budSub:      { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  estCard:     { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  estVal:      { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 4 },
  estLbl:      { fontSize: 11, fontFamily: "Inter_400Regular" },
  estNote:     { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  sumCard:     { borderRadius: 14, padding: 14, gap: 8 },
  sumTitle:    { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  sumRow:      { flexDirection: "row", justifyContent: "space-between" },
  sumLabel:    { fontSize: 12, fontFamily: "Inter_400Regular" },
  sumVal:      { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  doneCtr:     { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 12 },
  doneCircle:  { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  doneTitle:   { fontSize: 20, fontFamily: "Inter_700Bold" },
  doneSub:     { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  doneStats:   { width: "100%", borderRadius: 14, padding: 14, flexDirection: "row", justifyContent: "space-around" },
  doneStat:    { alignItems: "center", gap: 4 },
  doneStatVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  doneStatLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  doneBtn:     { borderRadius: 12, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10 },
  doneBtnTxt:  { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

// ── Main styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { paddingHorizontal: 16, paddingBottom: 0 },
  headerRow:    { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backBtn:      { padding: 8 },
  headerTitle:  { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  heroWrap:     { alignItems: "center", gap: 8, marginBottom: 16 },
  crownBadge:   { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle:    { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center", lineHeight: 32 },
  heroSub:      { fontSize: 12, color: "rgba(255,255,255,0.82)", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17 },
  statsStrip:   { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, marginHorizontal: -16, paddingHorizontal: 16, backgroundColor: "rgba(0,0,0,0.12)", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.15)", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.15)" },
  statItem:     { alignItems: "center" },
  statVal:      { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel:    { fontSize: 10, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", marginTop: 1 },
  tabBar:       { flexDirection: "row", marginTop: 10, marginHorizontal: -16, paddingHorizontal: 8, borderRadius: 0, paddingVertical: 4 },
  tabBtn:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 8 },
  tabBtnActive: { backgroundColor: "rgba(255,255,255,0.92)" },
  tabTxt:       { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.8)" },
  tabTxtActive: { color: "#7B2FBE" },
  sectionWrap:  { padding: 16, gap: 14 },

  // Unlock card
  unlockCard:      { borderRadius: 18, borderWidth: 1, padding: 16, gap: 14 },
  unlockCardTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  unlockCardSub:   { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
  catTab:          { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catTabTxt:       { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  featGrid:        { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  featCell:        { width: (width - 64) / 2, borderRadius: 12, borderWidth: 1, padding: 11, gap: 6 },
  featIcon:        { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  featLabel:       { fontSize: 12, fontFamily: "Inter_600SemiBold", lineHeight: 15 },
  featPlanBadge:   { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  featPlanTxt:     { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },

  // Plan card
  planCard:      { borderRadius: 18, overflow: "hidden" },
  popularBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 7 },
  popularText:   { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  planTop:       { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 8 },
  planIconWrap:  { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  planName:      { fontSize: 17, fontFamily: "Inter_700Bold" },
  planPrice:     { fontSize: 24, fontFamily: "Inter_700Bold" },
  planPeriod:    { fontSize: 13, fontFamily: "Inter_400Regular" },
  selCheck:      { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  planHighlights:{ flexDirection: "row", justifyContent: "space-around", marginHorizontal: 12, borderRadius: 12, borderWidth: 1, paddingVertical: 9, marginBottom: 2 },
  planHL:        { flexDirection: "row", alignItems: "center", gap: 4 },
  planHLTxt:     { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  featList:      { paddingHorizontal: 16, paddingVertical: 10, gap: 7 },
  featRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  featTxt:       { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  moreLocked:    { fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: 22 },
  subBtn:        { margin: 12, marginTop: 4, borderRadius: 12, paddingVertical: 13, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 },
  subBtnTxt:     { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },

  // Active plan status
  activePlanCard:   { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1.5, padding: 14, overflow: "hidden" },
  activePlanLabel:  { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.5, textTransform: "uppercase" },
  activePlanName:   { fontSize: 16, fontFamily: "Inter_700Bold" },
  activePlanExpiry: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  cancelBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  cancelTxt:        { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  // Active banner on plan card
  activeBanner:    { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 12, marginBottom: 12, borderRadius: 8, borderWidth: 1, paddingVertical: 7, paddingHorizontal: 10 },
  activeBannerTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  // Success modal
  successOverlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center", padding: 24 },
  successCard:       { width: "100%", borderRadius: 24, padding: 24, alignItems: "center", gap: 16 },
  successCircle:     { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  successTitle:      { fontSize: 22, fontFamily: "Inter_700Bold" },
  successSub:        { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  successFeatures:   { width: "100%", borderRadius: 14, padding: 14, gap: 10 },
  successFeatureTxt: { fontSize: 13, fontFamily: "Inter_400Regular" },
  successBtn:        { width: "100%", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  successBtnTxt:     { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },

  // Compare
  compareToggle:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 13 },
  compareToggleTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  compareTitle:     { fontSize: 16, fontFamily: "Inter_700Bold" },
  tableWrap:        { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  tableRow:         { flexDirection: "row" },
  tableCell:        { paddingVertical: 9, paddingHorizontal: 5, alignItems: "center", justifyContent: "center" },
  tableHead:        { fontSize: 10, fontFamily: "Inter_700Bold", textAlign: "center" },
  tableTxt:         { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  tableCross:       { fontSize: 12, fontFamily: "Inter_400Regular" },

  // Billing toggle
  billingRow:   { flexDirection: "row", borderRadius: 14, padding: 4, gap: 2 },
  billingBtn:   { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 10, position: "relative" as const },
  billingTxt:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  billingBadge: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#34C759", position: "absolute" as const, top: 2, right: 4 },

  // Payment
  payCard:      { borderRadius: 16, borderWidth: 1, padding: 16 },
  payTitle:     { fontSize: 15, fontFamily: "Inter_700Bold" },
  payMethod:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  payMethodTxt: { fontSize: 12, fontFamily: "Inter_500Medium" },
  payNote:      { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 10, textAlign: "center" },

  // Boost
  boostHero:    { borderRadius: 20, borderWidth: 1, padding: 20, alignItems: "center", gap: 10 },
  boostHeroIcon:{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  boostTitle:   { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  boostSub:     { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  boostStatVal: { fontSize: 17, fontFamily: "Inter_700Bold" },
  boostStatLbl: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  bizAdBanner:  { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  bizAdIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bizAdTitle:   { fontSize: 14, fontFamily: "Inter_700Bold" },
  bizAdSub:     { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  // Fan
  fanDesc:       { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  fanCard:       { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  fanCardGrad:   { position: "absolute", top: 0, left: 0, right: 0, height: 60 },
  fanHead:       { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 10 },
  fanIconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  fanName:       { fontSize: 16, fontFamily: "Inter_700Bold" },
  fanPrice:      { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  joinBtn:       { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  joinTxt:       { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  perksWrap:     { paddingHorizontal: 16, paddingBottom: 14, gap: 6 },
  perkRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  perkTxt:       { fontSize: 13, fontFamily: "Inter_400Regular" },
  creatorCTA:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  creatorTitle:  { fontSize: 14, fontFamily: "Inter_700Bold" },
  creatorSub:    { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  creatorBtn:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  creatorBtnTxt: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
});

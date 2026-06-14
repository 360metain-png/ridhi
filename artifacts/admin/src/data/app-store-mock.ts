// ============================================================
// App Store Analytics Mock Data
// Simulates Google Play Console + App Store Connect data
// ============================================================

export type InstallRecord = {
  id: string;
  userId?: string;
  platform: "android" | "ios";
  osVersion: string;
  deviceBrand: string;
  deviceModel: string;
  deviceType: "phone" | "tablet";
  appVersion: string;
  installSource: string;
  campaignId?: string;
  referrerCode?: string;
  utmSource?: string;
  utmMedium?: string;
  country: string;
  state: string;
  city: string;
  installedAt: string;
  isUninstalled: boolean;
  uninstalledAt?: string;
  uninstallReason?: string;
  daysActiveBeforeUninstall?: number;
  sessionsBeforeUninstall?: number;
  firstOpenedAt: string;
  onboardingCompleted: boolean;
  onboardingDropoffStep?: string;
  isReinstall: boolean;
  lat: number;
  lng: number;
};

export type AppReview = {
  id: string;
  platform: "android" | "ios";
  storeReviewId: string;
  storeVersion: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  language: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  keyTopics: string[];
  deviceModel: string;
  osVersion: string;
  helpfulCount: number;
  isReplySent: boolean;
  replyText?: string;
  reviewDate: string;
  updatedAt?: string;
};

export type DailyMetric = {
  date: string;
  platform: "android" | "ios" | "combined";
  installs: number;
  uninstalls: number;
  netInstalls: number;
  reinstalls: number;
  firstTimeInstalls: number;
  activeDevices: number;
  newActiveDevices: number;
  storeListingViews: number;
  storeListingVisitors: number;
  conversionRate: number;
  ratingAvg: number;
  ratingCount: number;
  rating1: number; rating2: number; rating3: number; rating4: number; rating5: number;
  newReviews: number;
  crashes: number;
  crashRate: number;
  anrs: number;
  revenueInr: number;
  refunds: number;
  sourceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  deviceBreakdown: Record<string, number>;
};

// ── 30 days of metrics ──────────────────────────────────────────

const ANDROID_BRANDS = ["Samsung", "Xiaomi", "Vivo", "Oppo", "Realme", "OnePlus", "Motorola", "Nokia", "Google", "Nothing"];
const ANDROID_MODELS: Record<string, string[]> = {
  Samsung: ["Galaxy S24", "Galaxy S23", "Galaxy A54", "Galaxy M34", "Galaxy F54"],
  Xiaomi: ["Redmi Note 13", "Redmi 12", "Poco X6", "Mi 14", "Redmi 13C"],
  Vivo: ["V30", "V29", "Y200", "T3", "Y100"],
  Oppo: ["Reno 11", "F25 Pro", "A79", "A18", "Find X7"],
  Realme: ["12 Pro", "Narzo 70", "C67", "11x", "GT 6"],
  OnePlus: ["12", "12R", "Nord 4", "Open", "11"],
  Motorola: ["Edge 50", "G84", "G54", "Razr 40", "E13"],
  Nokia: ["G42", "C32", "G22", "XR21", "C12"],
  Google: ["Pixel 8", "Pixel 8a", "Pixel 7a", "Pixel 7", "Pixel 6a"],
  Nothing: ["Phone 2", "Phone 2a", "Phone 1"],
};
const IOS_MODELS = ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro", "iPhone 14", "iPhone 13", "iPhone SE", "iPhone 12", "iPhone 11"];
const IOS_VERSIONS = ["17.4", "17.3", "17.2", "17.1", "17.0", "16.7", "16.6", "16.5"];
const ANDROID_VERSIONS = ["14", "13", "12", "14", "13", "14", "13", "12"];
const SOURCES = ["organic", "play_store", "app_store", "referral", "facebook_ads", "google_ads", "instagram_ads", "influencer", "whatsapp_share", "sms_campaign", "qr_code", "website"];
const UNINSTALL_REASONS = ["storage_full", "app_crash", "not_useful", "too_many_ads", "found_alternative", "privacy_concern", "other", "buggy"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Vadodara", "Ghaziabad", "Ludhiana", "Agra"];
const STATES = ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "West Bengal", "Gujarat", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Andhra Pradesh", "Punjab", "Haryana", "Bihar", "Odisha", "Kerala", "Jharkhand", "Assam", "Chhattisgarh", "Goa"];

const REVIEW_TITLES: Record<string, string[]> = {
  positive: ["Great app!", "Love the dating feature", "Best social app", "Amazing community", "Super fun", "Highly recommended", "Clean UI", "Great for making friends"],
  neutral: ["Good but needs work", "Decent app", "Mixed feelings", "Okay experience", "Could be better", "Some bugs", "Not bad", "Average"],
  negative: ["Too many crashes", "Horrible experience", "Full of bugs", "Waste of time", "Too many ads", "Privacy issues", "Hate it", "Disappointing"],
};

const REVIEW_BODIES: Record<string, string[]> = {
  positive: [
    "The dating feature is genuinely useful. I've met some great people here!",
    "Love the reels and community features. Very engaging.",
    "Smooth UI, fast loading, and the coin system is fair. Keep it up!",
    "Best Indian social app I've used. The regional language support is a game changer.",
    "Great for networking and finding people with similar interests.",
  ],
  neutral: [
    "App is good but sometimes lags while scrolling reels.",
    "Nice features but the onboarding could be shorter.",
    "Decent app, but I wish there were more privacy controls.",
    "Works fine most of the time. Occasionally crashes on older phones.",
    "Good concept, but the matching algorithm needs improvement.",
  ],
  negative: [
    "Crashes every time I try to go live. Fix this ASAP!",
    "Too many ads in between reels. Uninstalling.",
    "My account was suspended for no reason. Support is terrible.",
    "App takes too much storage and battery. Not worth it.",
    "Found a better alternative. This one is too buggy.",
  ],
};

// ── Generate 200 install records ──────────────────────────────────────

export const mockInstalls: InstallRecord[] = Array.from({ length: 200 }, (_, i) => {
  const platform: "android" | "ios" = Math.random() > 0.3 ? "android" : "ios";
  const brand = platform === "android" ? ANDROID_BRANDS[i % ANDROID_BRANDS.length] : "Apple";
  const model = platform === "android" ? ANDROID_MODELS[brand][i % ANDROID_MODELS[brand].length] : IOS_MODELS[i % IOS_MODELS.length];
  const osVersion = platform === "android" ? ANDROID_VERSIONS[i % ANDROID_VERSIONS.length] : IOS_VERSIONS[i % IOS_VERSIONS.length];
  const source = SOURCES[i % SOURCES.length];
  const isUninstalled = Math.random() < 0.15;
  const daysAgo = Math.floor(Math.random() * 30);
  const installedAt = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000);
  const cityIdx = i % CITIES.length;
  const stateIdx = i % STATES.length;
  const onboardingCompleted = Math.random() > 0.2;

  return {
    id: `inst_${i + 1}`,
    userId: Math.random() > 0.3 ? `u${(i % 30) + 1}` : undefined,
    platform,
    osVersion,
    deviceBrand: brand,
    deviceModel: model,
    deviceType: Math.random() > 0.95 ? "tablet" : "phone",
    appVersion: ["1.4.2", "1.4.1", "1.4.0", "1.3.9"][i % 4],
    installSource: source,
    campaignId: source === "facebook_ads" || source === "google_ads" || source === "instagram_ads" ? `camp_${source}_${i % 5}` : undefined,
    referrerCode: source === "referral" ? `REF${(100 + i).toString().slice(1)}` : undefined,
    utmSource: source === "website" ? "ridhi_website" : undefined,
    country: "IN",
    state: STATES[stateIdx],
    city: CITIES[cityIdx],
    installedAt: installedAt.toISOString(),
    isUninstalled,
    uninstalledAt: isUninstalled
      ? new Date(installedAt.getTime() + Math.random() * 86400000 * 7).toISOString()
      : undefined,
    uninstallReason: isUninstalled ? UNINSTALL_REASONS[i % UNINSTALL_REASONS.length] : undefined,
    daysActiveBeforeUninstall: isUninstalled ? Math.floor(Math.random() * 5) + 1 : undefined,
    sessionsBeforeUninstall: isUninstalled ? Math.floor(Math.random() * 10) + 1 : undefined,
    firstOpenedAt: new Date(installedAt.getTime() + Math.random() * 60000).toISOString(),
    onboardingCompleted,
    onboardingDropoffStep: !onboardingCompleted ? ["phone_input", "otp", "name", "interests", "profile_photo"][i % 5] : undefined,
    isReinstall: Math.random() < 0.08,
    lat: 20 + Math.random() * 15, // Rough India lat range
    lng: 72 + Math.random() * 15, // Rough India lng range
  };
});

// ── Generate 80 reviews ───────────────────────────────────────────────

export const mockReviews: AppReview[] = Array.from({ length: 80 }, (_, i) => {
  const sentiments: ("positive" | "neutral" | "negative")[] = ["positive", "positive", "positive", "neutral", "negative", "negative"];
  const sentiment = sentiments[i % sentiments.length];
  const platform: "android" | "ios" = Math.random() > 0.3 ? "android" : "ios";
  const brand = platform === "android" ? ANDROID_BRANDS[i % ANDROID_BRANDS.length] : "Apple";
  const model = platform === "android" ? ANDROID_MODELS[brand][i % ANDROID_MODELS[brand].length] : IOS_MODELS[i % IOS_MODELS.length];
  const os = platform === "android" ? ANDROID_VERSIONS[i % ANDROID_VERSIONS.length] : IOS_VERSIONS[i % IOS_VERSIONS.length];
  const rating = sentiment === "positive" ? Math.floor(Math.random() * 2) + 4 : sentiment === "neutral" ? 3 : Math.floor(Math.random() * 2) + 1;
  const daysAgo = Math.floor(Math.random() * 30);

  const topicsMap: Record<string, string[]> = {
    positive: ["dating", "reels", "community", "ui", "coins"],
    neutral: ["performance", "onboarding", "privacy", "matching", "ads"],
    negative: ["crashes", "ads", "support", "storage", "bugs"],
  };

  return {
    id: `rev_${i + 1}`,
    platform,
    storeReviewId: `store_${platform}_${100000 + i}`,
    storeVersion: ["1.4.2", "1.4.1", "1.4.0", "1.3.9"][i % 4],
    reviewerName: ["Aarav", "Diya", "Vihaan", "Aditi", "Arjun", "Ananya", "Sai", "Priya", "Krishna", "Riya"][i % 10] + " " + ["S", "K", "P", "R"][i % 4],
    rating,
    title: REVIEW_TITLES[sentiment][i % REVIEW_TITLES[sentiment].length],
    body: REVIEW_BODIES[sentiment][i % REVIEW_BODIES[sentiment].length],
    language: ["en", "hi", "mr", "ta", "te"][i % 5],
    sentiment,
    sentimentScore: sentiment === "positive" ? 0.5 + Math.random() * 0.5 : sentiment === "neutral" ? -0.2 + Math.random() * 0.4 : -0.8 + Math.random() * 0.5,
    keyTopics: [topicsMap[sentiment][i % topicsMap[sentiment].length]],
    deviceModel: model,
    osVersion: os,
    helpfulCount: Math.floor(Math.random() * 20),
    isReplySent: Math.random() < 0.3,
    replyText: Math.random() < 0.3 ? "Thank you for your feedback. We're working on improvements!" : undefined,
    reviewDate: new Date(Date.now() - daysAgo * 86400000).toISOString().split("T")[0],
    updatedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  };
});

// ── Daily metrics (30 days) ──────────────────────────────────────────

function generateDailyMetrics(): DailyMetric[] {
  const metrics: DailyMetric[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const dateStr = date.toISOString().split("T")[0];
    const baseInstalls = 800 + Math.floor(Math.random() * 400);
    const baseUninstalls = Math.floor(baseInstalls * 0.12);
    const baseReinstalls = Math.floor(baseInstalls * 0.08);
    const baseFirstTime = baseInstalls - baseReinstalls;
    const androidRatio = 0.7;

    for (const platform of ["android", "ios"] as const) {
      const ratio = platform === "android" ? androidRatio : 1 - androidRatio;
      const installs = Math.floor(baseInstalls * ratio);
      const uninstalls = Math.floor(baseUninstalls * ratio);
      const reinstalls = Math.floor(baseReinstalls * ratio);
      const firstTime = installs - reinstalls;
      const active = Math.floor(installs * (3 + Math.random() * 2));
      const views = Math.floor(installs * (2.5 + Math.random() * 1.5));
      const conversion = Number((installs / views * 100).toFixed(2));
      const ratingAvg = Number((3.2 + Math.random() * 1.5).toFixed(2));
      const newReviews = Math.floor(Math.random() * 5);
      const crashes = Math.floor(installs * 0.005 * Math.random());
      const crashRate = Number((crashes / active * 100).toFixed(2));
      const anrs = Math.floor(crashes * 0.3);

      metrics.push({
        date: dateStr,
        platform,
        installs,
        uninstalls,
        netInstalls: installs - uninstalls,
        reinstalls,
        firstTimeInstalls: firstTime,
        activeDevices: active,
        newActiveDevices: Math.floor(active * 0.2),
        storeListingViews: views,
        storeListingVisitors: Math.floor(views * 0.7),
        conversionRate: conversion,
        ratingAvg,
        ratingCount: Math.floor(ratingAvg * 100 + Math.random() * 50),
        rating1: Math.floor(Math.random() * 3),
        rating2: Math.floor(Math.random() * 3),
        rating3: Math.floor(Math.random() * 4),
        rating4: Math.floor(Math.random() * 5),
        rating5: Math.floor(Math.random() * 6),
        newReviews,
        crashes,
        crashRate,
        anrs,
        revenueInr: Math.floor(installs * 0.15 * Math.random() * 100),
        refunds: Math.floor(Math.random() * 3),
        sourceBreakdown: {
          organic: Math.floor(installs * 0.4),
          google_ads: Math.floor(installs * 0.15),
          facebook_ads: Math.floor(installs * 0.1),
          referral: Math.floor(installs * 0.12),
          instagram_ads: Math.floor(installs * 0.08),
          whatsapp_share: Math.floor(installs * 0.05),
          influencer: Math.floor(installs * 0.04),
          sms_campaign: Math.floor(installs * 0.03),
          qr_code: Math.floor(installs * 0.02),
          website: Math.floor(installs * 0.01),
        },
        countryBreakdown: {
          IN: Math.floor(installs * 0.95),
          US: Math.floor(installs * 0.02),
          GB: Math.floor(installs * 0.01),
          AE: Math.floor(installs * 0.005),
          CA: Math.floor(installs * 0.005),
        },
        deviceBreakdown: {
          Samsung: Math.floor(installs * 0.22),
          Xiaomi: Math.floor(installs * 0.18),
          Vivo: Math.floor(installs * 0.12),
          Oppo: Math.floor(installs * 0.10),
          Realme: Math.floor(installs * 0.08),
          iPhone: Math.floor(installs * (platform === "ios" ? 0.25 : 0.02)),
          OnePlus: Math.floor(installs * 0.05),
          Motorola: Math.floor(installs * 0.03),
          Google: Math.floor(installs * 0.02),
          Other: Math.floor(installs * 0.08),
        },
      });
    }
  }
  return metrics;
}

export const mockDailyMetrics = generateDailyMetrics();

// ── Aggregated totals ─────────────────────────────────────────────

export function getAppStoreTotals() {
  const android = mockDailyMetrics.filter((m) => m.platform === "android");
  const ios = mockDailyMetrics.filter((m) => m.platform === "ios");

  const sum = (arr: DailyMetric[], key: keyof DailyMetric) =>
    arr.reduce((acc, m) => acc + (Number(m[key]) || 0), 0);

  const avg = (arr: DailyMetric[], key: keyof DailyMetric) =>
    arr.length ? Number((sum(arr, key) / arr.length).toFixed(2)) : 0;

  const totalInstalls = sum(android, "installs") + sum(ios, "installs");
  const totalUninstalls = sum(android, "uninstalls") + sum(ios, "uninstalls");
  const totalActive = sum(android, "activeDevices") + sum(ios, "activeDevices");

  // Merge source breakdowns
  const sourceBreakdown: Record<string, number> = {};
  const deviceBreakdown: Record<string, number> = {};
  const countryBreakdown: Record<string, number> = {};

  mockDailyMetrics.forEach((m) => {
    Object.entries(m.sourceBreakdown).forEach(([k, v]) => {
      sourceBreakdown[k] = (sourceBreakdown[k] || 0) + v;
    });
    Object.entries(m.deviceBreakdown).forEach(([k, v]) => {
      deviceBreakdown[k] = (deviceBreakdown[k] || 0) + v;
    });
    Object.entries(m.countryBreakdown).forEach(([k, v]) => {
      countryBreakdown[k] = (countryBreakdown[k] || 0) + v;
    });
  });

  return {
    totalInstalls,
    totalUninstalls,
    totalActive,
    netInstalls: totalInstalls - totalUninstalls,
    retentionRate: Number(((totalInstalls - totalUninstalls) / totalInstalls * 100).toFixed(1)),
    avgRating: avg([...android, ...ios], "ratingAvg"),
    totalReviews: mockReviews.length,
    android: {
      installs: sum(android, "installs"),
      uninstalls: sum(android, "uninstalls"),
      activeDevices: sum(android, "activeDevices"),
      avgRating: avg(android, "ratingAvg"),
    },
    ios: {
      installs: sum(ios, "installs"),
      uninstalls: sum(ios, "uninstalls"),
      activeDevices: sum(ios, "activeDevices"),
      avgRating: avg(ios, "ratingAvg"),
    },
    sourceBreakdown,
    deviceBreakdown,
    countryBreakdown,
  };
}

export function getInstallsByPlatform() {
  return mockDailyMetrics.reduce((acc, m) => {
    acc[m.platform] = (acc[m.platform] || 0) + m.installs;
    return acc;
  }, {} as Record<string, number>);
}

export function getInstallsBySource() {
  return getAppStoreTotals().sourceBreakdown;
}

export function getInstallsByDevice() {
  return getAppStoreTotals().deviceBreakdown;
}

export function getInstallsByLocation() {
  const loc: Record<string, number> = {};
  mockInstalls.forEach((i) => {
    loc[i.state] = (loc[i.state] || 0) + 1;
  });
  return Object.entries(loc)
    .sort((a, b) => b[1] - a[1])
    .map(([state, count]) => ({ state, count }));
}

export function getInstallsByCity() {
  const loc: Record<string, number> = {};
  mockInstalls.forEach((i) => {
    loc[i.city] = (loc[i.city] || 0) + 1;
  });
  return Object.entries(loc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([city, count]) => ({ city, count }));
}

export function getInstallTrends() {
  return mockDailyMetrics
    .filter((m) => m.platform === "android")
    .map((m) => ({
      date: m.date,
      android: m.installs,
      ios: mockDailyMetrics.find((d) => d.date === m.date && d.platform === "ios")?.installs || 0,
      uninstalls: m.uninstalls + (mockDailyMetrics.find((d) => d.date === m.date && d.platform === "ios")?.uninstalls || 0),
      net: m.netInstalls + (mockDailyMetrics.find((d) => d.date === m.date && d.platform === "ios")?.netInstalls || 0),
    }));
}

export function getUninstallReasons() {
  const reasons: Record<string, number> = {};
  mockInstalls.filter((i) => i.isUninstalled).forEach((i) => {
    reasons[i.uninstallReason || "other"] = (reasons[i.uninstallReason || "other"] || 0) + 1;
  });
  return Object.entries(reasons)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({ reason, count }));
}

export function getOnboardingDropoff() {
  const steps: Record<string, number> = {};
  mockInstalls.filter((i) => !i.onboardingCompleted).forEach((i) => {
    steps[i.onboardingDropoffStep || "unknown"] = (steps[i.onboardingDropoffStep || "unknown"] || 0) + 1;
  });
  return Object.entries(steps)
    .sort((a, b) => b[1] - a[1])
    .map(([step, count]) => ({ step, count }));
}

export function getRatingDistribution() {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  mockReviews.forEach((r) => {
    dist[r.rating as 1 | 2 | 3 | 4 | 5] = (dist[r.rating as 1 | 2 | 3 | 4 | 5] || 0) + 1;
  });
  return Object.entries(dist).map(([rating, count]) => ({ rating: Number(rating), count }));
}

export function getReviewSentiment() {
  const s = { positive: 0, neutral: 0, negative: 0 };
  mockReviews.forEach((r) => {
    s[r.sentiment] = (s[r.sentiment] || 0) + 1;
  });
  return Object.entries(s).map(([sentiment, count]) => ({ sentiment, count }));
}

export function getCrashStats() {
  const android = mockDailyMetrics.filter((m) => m.platform === "android");
  const ios = mockDailyMetrics.filter((m) => m.platform === "ios");
  const sum = (arr: DailyMetric[], key: keyof DailyMetric) =>
    arr.reduce((acc, m) => acc + (Number(m[key]) || 0), 0);
  return {
    android: {
      crashes: sum(android, "crashes"),
      anrs: sum(android, "anrs"),
      crashRate: Number((sum(android, "crashes") / sum(android, "activeDevices") * 100).toFixed(2)),
    },
    ios: {
      crashes: sum(ios, "crashes"),
      anrs: sum(ios, "anrs"),
      crashRate: Number((sum(ios, "crashes") / sum(ios, "activeDevices") * 100).toFixed(2)),
    },
  };
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";

export interface CallPersona {
  name?: string;
  city?: string;
  age?: number;
  bio?: string;
  avatar?: string;
  showAvatar: boolean;
  showCity: boolean;
  showAge: boolean;
  showBio: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname?: string;
  phone?: string;
  email?: string;
  age: number;
  birthday?: string;
  zodiacSign?: string;
  gender: "male" | "female" | "other";
  bio: string;
  city: string;
  state?: string;
  language: string;
  interests: string[];
  avatar?: string;
  coins: number;
  freeCoins?: number;
  paidCoins?: number;
  followers: number;
  following: number;
  posts: number;
  isVerified: boolean;
  plan?: "free" | "silver" | "gold" | "platinum" | "diamond";
  planBillingPeriod?: "weekly" | "monthly" | "yearly";
  planExpiresAt?: string;
  creatorPlan?: "creator_starter" | "creator_pro" | "creator_elite";
  creatorPlanExpiresAt?: string;
  createdAt: string;
  locationCoords?: { latitude: number; longitude: number };
  registeredAt?: string;
  isHost?: boolean;
  isAgent?: boolean;
  isAdUser?: boolean;
  isBrandRegistered?: boolean;
  brandRegisteredAt?: string;
  lastAdCampaignAt?: string;
  brandActiveUntil?: string;
  brandRevokedAt?: string;
  brandRevokedReason?: string;
  hostRegisteredAt?: string;
  hostMonthlyHours?: number;       // hours this month
  hostLastActivityAt?: string;      // last time host was active
  hostActiveUntil?: string;         // deadline for 30hr checkpoint
  hostRevokedAt?: string;
  hostRevokedReason?: string;
  agentRegisteredAt?: string;
  // Random Call Fake Profile
  callPersona?: CallPersona;
  // Host call preferences (for Random Calls)
  hostCallPrefs?: {
    acceptAudio: boolean;
    acceptVideo: boolean;
  };
  // KYC / Identity verification
  kycStatus?: "unverified" | "pending" | "verified" | "rejected";
  aadhaarVerified?: boolean;
  panVerified?: boolean;
  aadhaarNumber?: string; // masked: XXXX XXXX XXXX
  panNumber?: string;     // masked: XXXXX9999X
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  // PK Battle host approval
  pkBattleStatus?: "not_requested" | "requested" | "approved" | "rejected";
  // Activity Status
  isOnline?: boolean;
  lastSeen?: string;
  showActivityStatus?: boolean;
  showLastSeen?: boolean;
  // Feature Usage Tracking (for freemium limits)
  weeklyPollsCreated?: number;
  lastPollResetDate?: string;
  aiAssistantUsesToday?: number;
  lastAiResetDate?: string;
  pkBattleRequestedAt?: string;
  pkBattleApprovedAt?: string;
  pkBattleRejectionReason?: string;
  lastPostDate?: string;
  downloadEarnings?: number;
  // Free call trial (one-time, lifetime) — only for newly registered users
  callTrialUsed?: boolean;     // true = trial consumed (default false on signup)
  callTrialStartedAt?: string; // ISO timestamp when trial was used
  // Saved posts / Collections
  savedPosts?: string[];
  savedCollections?: { id: string; name: string; coverUri?: string; postIds: string[]; createdAt?: string }[];
  // Story highlights
  storyHighlights?: { id: string; title: string; coverUri?: string; storyIds: string[]; createdAt: string }[];
  // Dating features
  superLikesRemaining?: number;
  backtracksRemaining?: number;
  // Profile prompts
  profilePrompts?: { question: string; answer: string }[];
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (profile: Partial<UserProfile>, token?: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addCoins: (amount: number, source?: "free" | "paid") => Promise<void>;
  deductCoins: (amount: number, requirePaid?: boolean) => Promise<boolean>;
  cancelPlan: () => Promise<void>;
  syncKycStatus: (userId: string) => Promise<void>;
  syncPkBattleStatus: (userId: string) => Promise<void>;
  recordDownloadEarning: (amount: number) => Promise<void>;
  syncWallet: () => Promise<void>;
  // Saved posts
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  addCollection: (name: string) => Promise<void>;
  // Super likes & backtracks
  useSuperLike: () => Promise<boolean>;
  useBacktrack: () => Promise<boolean>;
  // Profile prompts
  addProfilePrompt: (question: string, answer: string) => Promise<void>;
  removeProfilePrompt: (index: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_USER: UserProfile = {
  id: "user_" + Date.now(),
  name: "Priya Sharma",
  phone: "+91 XXXXX XXXXX",
  age: 24,
  birthday: "2000-08-15",
  zodiacSign: "leo",
  gender: "female",
  bio: "Love music, travel and good conversations 🌸",
  city: "Mumbai",
  language: "Hindi",
  interests: ["Music", "Travel", "Food", "Fitness", "Books"],
  avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=priya&size=200&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  coins: 250,
  freeCoins: 250, // new users start with free coins (earnable, expire in 30 days)
  paidCoins: 0,    // paid coins only from real money recharges
  followers: 128,
  following: 94,
  posts: 12,
  plan: "free" as const,
  isVerified: false,
  lastPostDate: new Date().toISOString(),
  downloadEarnings: 0,
  savedPosts: [],
  savedCollections: [],
  storyHighlights: [],
  superLikesRemaining: 2,
  backtracksRemaining: 1,
  profilePrompts: [],
  callTrialUsed: false,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("ridhi_user").then(async (data) => {
      if (data) {
        const parsed = JSON.parse(data) as UserProfile;
        // Migrate legacy profiles that lack freeCoins/paidCoins fields
        if (parsed.freeCoins === undefined || parsed.paidCoins === undefined) {
          const migrated = {
            ...parsed,
            freeCoins: parsed.coins,
            paidCoins: 0,
          };
          AsyncStorage.setItem("ridhi_user", JSON.stringify(migrated));
          setUser(migrated);
          return;
        }
        // Check brand registration expiry (30-day rule)
        if (parsed.isBrandRegistered && parsed.brandActiveUntil) {
          const now = new Date();
          const activeUntil = new Date(parsed.brandActiveUntil);
          if (now > activeUntil) {
            const revoked = {
              ...parsed,
              isBrandRegistered: false,
              brandRevokedAt: now.toISOString(),
              brandRevokedReason: "No ad campaign in the last 30 days",
            };
            await AsyncStorage.setItem("ridhi_user", JSON.stringify(revoked));
            setUser(revoked);
            setIsLoading(false);
            return;
          }
        }
        // Check host activity checkpoint (30 hours per month)
        if (parsed.isHost && parsed.hostActiveUntil) {
          const now = new Date();
          const activeUntil = new Date(parsed.hostActiveUntil);
          if (now > activeUntil) {
            const monthlyHours = parsed.hostMonthlyHours ?? 0;
            if (monthlyHours < 30) {
              // Host didn't meet 30hr requirement — revoke
              const revoked = {
                ...parsed,
                isHost: false,
                hostRevokedAt: now.toISOString(),
                hostRevokedReason: `Only ${monthlyHours}h streamed this month. Minimum 30h required.`,
                hostMonthlyHours: 0,
              };
              await AsyncStorage.setItem("ridhi_user", JSON.stringify(revoked));
              setUser(revoked);
              setIsLoading(false);
              return;
            } else {
              // Met requirement — reset for next month
              const nextMonth = new Date();
              nextMonth.setDate(nextMonth.getDate() + 30);
              const renewed = {
                ...parsed,
                hostMonthlyHours: 0,
                hostActiveUntil: nextMonth.toISOString(),
              };
              await AsyncStorage.setItem("ridhi_user", JSON.stringify(renewed));
              setUser(renewed);
              setIsLoading(false);
              return;
            }
          }
        }
        // Do not trust local monetization state before server confirmation
        setUser({ ...parsed, coins: 0, plan: "free" });
        // Mandatory server-authoritative sync for monetization state (coins, plan)
        try {
          const resp = await apiFetch<{ coins?: number; plan?: string }>("/api/wallet");
          if (resp.coins !== undefined || resp.plan !== undefined) {
            const updated: Partial<UserProfile> = {};
            if (resp.coins !== undefined) updated.coins = resp.coins;
            if (resp.plan !== undefined) updated.plan = resp.plan as UserProfile["plan"];
            const authoritative = { ...parsed, ...updated };
            setUser(authoritative);
            AsyncStorage.setItem("ridhi_user", JSON.stringify(authoritative));
          }
        } catch {
          // Wallet sync failed — stay in safe mode (free/0 coins)
          // Non-monetization state (profile, name, etc.) is still usable
        }
        // Sync KYC status from backend on app load
        try {
          const resp = await apiFetch<{ success: boolean; kyc?: { status: string; aadhaarVerified: boolean; panVerified: boolean; bankVerified: boolean } }>(
            `/api/kyc/status/${encodeURIComponent(parsed.id)}`,
          );
          if (resp.success && resp.kyc) {
            const k = resp.kyc;
            const updated: Partial<UserProfile> = {
              kycStatus: k.status === "approved" ? "verified" : (k.status as UserProfile["kycStatus"]),
              aadhaarVerified: k.aadhaarVerified,
              panVerified: k.panVerified,
            };
            setUser((prev) => {
              if (!prev) return prev;
              const u = { ...prev, ...updated };
              AsyncStorage.setItem("ridhi_user", JSON.stringify(u));
              return u;
            });
          }
        } catch {
          // offline or error: keep local state
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (profile: Partial<UserProfile>, token?: string) => {
    const newUser: UserProfile = { ...DEFAULT_USER, ...profile };
    await AsyncStorage.setItem("ridhi_user", JSON.stringify(newUser));
    if (token) {
      await AsyncStorage.setItem("ridhi_token", token);
    }
    // Ensure all settings are ON for every login session
    await AsyncStorage.setItem("ridhi_app_settings", JSON.stringify({
      theme: "dark",
      notificationsEnabled: true,
      pushEnabled: true,
      matchNotifEnabled: true,
      coinNotifEnabled: true,
      messageNotifEnabled: true,
      liveNotifEnabled: true,
      profilePublic: true,
      showOnline: true,
      locationShared: true,
      twoFAEnabled: true,
      readReceipts: true,
      activityStatus: true,
      dataPersonalization: true,
    }));
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("ridhi_user");
    await AsyncStorage.removeItem("ridhi_token");
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const current = await AsyncStorage.getItem("ridhi_user");
      if (!current) return false;
      const u = JSON.parse(current) as UserProfile;
      await apiFetch<{ success: boolean }>("/api/account", {
        method: "DELETE",
        body: JSON.stringify({ userId: u.id }),
      });
      await AsyncStorage.removeItem("ridhi_user");
      setUser(null);
      return true;
    } catch {
      return false;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCoins = useCallback(async (amount: number, source: "free" | "paid" = "free") => {
    // Server-authoritative: coins are only added after verified payment on the server.
    // For non-payment credits (missions, ads, daily bonus), update locally as free coins.
    // For payment-related credits, the server auto-credits as paid coins.
    // For creator earnings (gifts, downloads), treat as paid coins (real monetary value).
    if (amount < 0) {
      throw new Error("addCoins does not support negative amounts. Use deductCoins instead.");
    }
    setUser((prev) => {
      if (!prev) return prev;
      const isPaid = source === "paid";
      const updated: UserProfile = {
        ...prev,
        coins: prev.coins + amount,
        freeCoins: Math.max(0, (prev.freeCoins ?? 0) + (isPaid ? 0 : amount)),
        paidCoins: Math.max(0, (prev.paidCoins ?? 0) + (isPaid ? amount : 0)),
      };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deductCoins = useCallback(async (amount: number, requirePaid = false): Promise<boolean> => {
    // Server-first: only deduct locally after server confirms
    let success = false;
    try {
      const resp = await apiFetch<{
        success: boolean;
        coins: number;
        freeCoins?: number;
        paidCoins?: number;
        error?: string;
      }>("/api/wallet/coins/deduct", {
        method: "POST",
        body: JSON.stringify({ amount, reason: "client", requirePaid }),
      });
      if (!resp.success || resp.error) {
        return false;
      }
      success = true;
      setUser((prev) => {
        if (!prev) return prev;
        const updated: UserProfile = { ...prev, coins: resp.coins };
        if (resp.freeCoins !== undefined) updated.freeCoins = resp.freeCoins;
        if (resp.paidCoins !== undefined) updated.paidCoins = resp.paidCoins;
        AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
        return updated;
      });
    } catch {
      // offline: cannot verify server deduction — reject
      return false;
    }
    return success;
  }, []);

  const cancelPlan = useCallback(async () => {
    // Optimistic local update
    setUser((prev) => {
      if (!prev) return prev;
      const updated: UserProfile = { ...prev, plan: "free", planExpiresAt: undefined, planBillingPeriod: undefined };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
    // Server-side sync
    try {
      await apiFetch<{ success: boolean; plan: string }>("/api/plan/cancel", { method: "POST" });
    } catch {
      // offline: keep optimistic local state
    }
  }, []);

  const syncKycStatus = useCallback(async (userId: string) => {
    try {
      const resp = await apiFetch<{ success: boolean; kyc?: { status: string; aadhaarVerified: boolean; panVerified: boolean; bankVerified: boolean } }>(
        `/api/kyc/status/${encodeURIComponent(userId)}`,
      );
      if (resp.success && resp.kyc) {
        const k = resp.kyc;
        setUser((prev) => {
          if (!prev) return prev;
          const updated: UserProfile = {
            ...prev,
            kycStatus: k.status === "approved" ? "verified" : (k.status as UserProfile["kycStatus"]),
            aadhaarVerified: k.aadhaarVerified,
            panVerified: k.panVerified,
          };
          AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // offline: keep local state
    }
  }, []);

  const syncWallet = useCallback(async () => {
    try {
      const resp = await apiFetch<{
        coins?: number;
        freeCoins?: number;
        paidCoins?: number;
        plan?: string;
      }>("/api/wallet");
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (resp.coins !== undefined) updated.coins = resp.coins;
        if (resp.freeCoins !== undefined) updated.freeCoins = resp.freeCoins;
        if (resp.paidCoins !== undefined) updated.paidCoins = resp.paidCoins;
        if (resp.plan !== undefined) updated.plan = resp.plan as UserProfile["plan"];
        AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
        return updated;
      });
    } catch {
      // offline: keep local state
    }
  }, []);

  const syncPkBattleStatus = useCallback(async (userId: string) => {
    try {
      const resp = await apiFetch<{
        success: boolean;
        pkBattleStatus?: "not_requested" | "requested" | "approved" | "rejected";
  // Activity Status
  isOnline?: boolean;
  lastSeen?: string;
  showActivityStatus?: boolean;
  showLastSeen?: boolean;
  // Feature Usage Tracking (for freemium limits)
  weeklyPollsCreated?: number;
  lastPollResetDate?: string;
  aiAssistantUsesToday?: number;
  lastAiResetDate?: string;
        requestedAt?: string;
        approvedAt?: string;
        rejectionReason?: string;
      }>(`/api/pk-battle/status`, { headers: { "X-User-Id": userId } });
      if (resp.success) {
        setUser((prev) => {
          if (!prev) return prev;
          const updated: UserProfile = {
            ...prev,
            pkBattleStatus: resp.pkBattleStatus,
            pkBattleRequestedAt: resp.requestedAt,
            pkBattleApprovedAt: resp.approvedAt,
            pkBattleRejectionReason: resp.rejectionReason,
          };
          AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // offline: keep local state
    }
  }, []);

  const recordDownloadEarning = useCallback(async (amount: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: UserProfile = {
        ...prev,
        coins: prev.coins + amount,
        paidCoins: (prev.paidCoins ?? 0) + amount, // creator earnings are real monetary value
        downloadEarnings: (prev.downloadEarnings ?? 0) + amount,
      };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const savePost = useCallback(async (postId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const saved = prev.savedPosts ?? [];
      if (saved.includes(postId)) return prev;
      const updated: UserProfile = { ...prev, savedPosts: [...saved, postId] };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unsavePost = useCallback(async (postId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const saved = prev.savedPosts ?? [];
      const updated: UserProfile = { ...prev, savedPosts: saved.filter((id) => id !== postId) };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCollection = useCallback(async (name: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const collections = prev.savedCollections ?? [];
      const updated: UserProfile = {
        ...prev,
        savedCollections: [...collections, { id: `col_${Date.now()}`, name, postIds: [], createdAt: new Date().toISOString() }],
      };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const useSuperLike = useCallback(async (): Promise<boolean> => {
    // Check free tier first (local-only state)
    let hasFree = false;
    setUser((prev) => {
      if (!prev) return prev;
      const plan = prev.plan || "free";
      const remainingFree = prev.superLikesRemaining ?? 0;
      if (remainingFree > 0) {
        hasFree = true;
        const updated: UserProfile = { ...prev, superLikesRemaining: remainingFree - 1 };
        AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
    if (hasFree) return true;
    // No free limit — deduct 5 coins via server (prevents local tampering)
    return await deductCoins(5);
  }, [deductCoins]);

  const useBacktrack = useCallback(async (): Promise<boolean> => {
    // Check free tier first (local-only state)
    let hasFree = false;
    setUser((prev) => {
      if (!prev) return prev;
      const plan = prev.plan || "free";
      const remainingFree = prev.backtracksRemaining ?? 0;
      if (plan === "diamond" || remainingFree > 0) {
        hasFree = true;
        const updated: UserProfile = { ...prev, backtracksRemaining: plan === "diamond" ? remainingFree : Math.max(0, remainingFree - 1) };
        AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
    if (hasFree) return true;
    // No free limit — deduct 1 coin via server (prevents local tampering)
    return await deductCoins(1);
  }, [deductCoins]);

  const addProfilePrompt = useCallback(async (question: string, answer: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const prompts = prev.profilePrompts ?? [];
      if (prompts.length >= 5) return prev;
      const updated: UserProfile = { ...prev, profilePrompts: [...prompts, { question, answer }] };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeProfilePrompt = useCallback(async (index: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const prompts = prev.profilePrompts ?? [];
      const updated: UserProfile = { ...prev, profilePrompts: prompts.filter((_, i) => i !== index) };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user, isLoading, isAuthenticated: !!user, login, logout, deleteAccount, updateProfile,
        addCoins, deductCoins, cancelPlan,
        syncKycStatus, syncPkBattleStatus, recordDownloadEarning, syncWallet,
        savePost, unsavePost, addCollection,
        useSuperLike, useBacktrack,
        addProfilePrompt, removeProfilePrompt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

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
  hostRegisteredAt?: string;
  agentRegisteredAt?: string;
  // KYC / Identity verification
  kycStatus?: "unverified" | "pending" | "verified" | "rejected";
  aadhaarVerified?: boolean;
  panVerified?: boolean;
  aadhaarNumber?: string; // masked: XXXX XXXX XXXX
  panNumber?: string;     // masked: XXXXX9999X
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (profile: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  deductCoins: (amount: number) => Promise<boolean>;
  subscribePlan: (planId: string, billing: string, bonusCoins: number) => Promise<void>;
  cancelPlan: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_USER: UserProfile = {
  id: "user_" + Date.now(),
  name: "Priya Sharma",
  phone: "+91 98765 43210",
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
  followers: 128,
  following: 94,
  posts: 12,
  plan: "gold" as const,
  isVerified: false,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("ridhi_user").then((data) => {
      if (data) {
        setUser(JSON.parse(data));
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (profile: Partial<UserProfile>) => {
    const newUser: UserProfile = { ...DEFAULT_USER, ...profile };
    await AsyncStorage.setItem("ridhi_user", JSON.stringify(newUser));
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
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCoins = useCallback(async (amount: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, coins: prev.coins + amount };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deductCoins = useCallback(async (amount: number): Promise<boolean> => {
    let success = false;
    setUser((prev) => {
      if (!prev || prev.coins < amount) return prev;
      success = true;
      const updated = { ...prev, coins: prev.coins - amount };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
    await new Promise((r) => setTimeout(r, 50));
    return success;
  }, []);

  const subscribePlan = useCallback(async (planId: string, billing: string, bonusCoins: number) => {
    const now = new Date();
    let expiresAt: Date;
    if (billing === "weekly")  { expiresAt = new Date(now); expiresAt.setDate(expiresAt.getDate() + 7); }
    else if (billing === "yearly") { expiresAt = new Date(now); expiresAt.setFullYear(expiresAt.getFullYear() + 1); }
    else { expiresAt = new Date(now); expiresAt.setMonth(expiresAt.getMonth() + 1); }

    const isCreator = planId.startsWith("creator_");
    setUser((prev) => {
      if (!prev) return prev;
      const updated: UserProfile = isCreator
        ? { ...prev, creatorPlan: planId as UserProfile["creatorPlan"], creatorPlanExpiresAt: expiresAt.toISOString(), coins: prev.coins + bonusCoins }
        : { ...prev, plan: planId as UserProfile["plan"], planBillingPeriod: billing as UserProfile["planBillingPeriod"], planExpiresAt: expiresAt.toISOString(), coins: prev.coins + bonusCoins };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const cancelPlan = useCallback(async () => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: UserProfile = { ...prev, plan: "free", planExpiresAt: undefined, planBillingPeriod: undefined };
      AsyncStorage.setItem("ridhi_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateProfile, addCoins, deductCoins, subscribePlan, cancelPlan }}
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

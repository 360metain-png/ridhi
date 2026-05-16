import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  age: number;
  gender: "male" | "female" | "other";
  bio: string;
  city: string;
  interests: string[];
  avatar?: string;
  coins: number;
  followers: number;
  following: number;
  posts: number;
  isVerified: boolean;
  createdAt: string;
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
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_USER: UserProfile = {
  id: "user_" + Date.now(),
  name: "Priya Sharma",
  phone: "+91 98765 43210",
  age: 24,
  gender: "female",
  bio: "Love music, travel and good conversations 🌸",
  city: "Mumbai",
  interests: ["Music", "Travel", "Food", "Fitness", "Books"],
  coins: 250,
  followers: 128,
  following: 94,
  posts: 12,
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

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateProfile, addCoins, deductCoins }}
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

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAIMatchSuggestions,
  suggestReplies,
  analyzeConversation,
  type AISuggestedMatch,
  type CompatibilityResult,
} from "@/data/aiMatchEngine";

export function useAIMatchSuggestions(count: number = 5): AISuggestedMatch[] {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return [];
    const userProfile = {
      id: user.id,
      name: user.name ?? "You",
      age: user.age ?? 25,
      gender: user.gender ?? "other",
      city: user.city ?? "Mumbai",
      language: user.language ?? "Hindi",
      bio: user.bio ?? "",
      interests: user.interests ?? [],
      imageUri: user.avatar,
      vipTier: user.plan,
    };
    return getAIMatchSuggestions(userProfile, count);
  }, [user, count]);
}

export function useAIReplySuggestions(
  lastMessage: string,
  otherUser: { name: string; interests?: string[]; language?: string }
): string[] {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return [];
    const userProfile = {
      id: user.id,
      name: user.name ?? "You",
      age: user.age ?? 25,
      gender: user.gender ?? "other",
      city: user.city ?? "Mumbai",
      language: user.language ?? "Hindi",
      bio: user.bio ?? "",
      interests: user.interests ?? [],
    };
    const otherProfile = {
      id: "other",
      name: otherUser.name,
      age: 25,
      gender: user.gender === "male" ? "female" : "male",
      city: "Mumbai",
      language: otherUser.language ?? "Hindi",
      bio: "",
      interests: otherUser.interests ?? [],
    };
    return suggestReplies(lastMessage, userProfile, otherProfile);
  }, [user, lastMessage, otherUser]);
}

export function useConversationAnalysis(
  messages: { text: string; fromMe: boolean }[]
): {
  quality: "good" | "stale" | "one_sided" | "new";
  suggestion: string;
  engagement: number;
} {
  return useMemo(() => {
    return analyzeConversation(messages);
  }, [messages]);
}

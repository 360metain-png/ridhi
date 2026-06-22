import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { type AISuggestedMatch } from "@/data/aiMatchEngine";

const { width } = Dimensions.get("window");
const AVATAR_SIZE = 64;

interface Props {
  suggestions: AISuggestedMatch[];
  onPressMatch: (profile: AISuggestedMatch["profile"]) => void;
}

export function AISuggestionPanel({ suggestions, onPressMatch }: Props) {
  const colors = useColors();

  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.aiIcon, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="zap" size={14} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            AI Picks for you
          </Text>
        </View>
        <View style={[styles.aiBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.aiBadgeText, { color: colors.primary }]}>
            {suggestions.length}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((s) => (
          <Pressable
            key={s.profile.id}
            onPress={() => onPressMatch(s.profile)}
            style={styles.avatarRowItem}
          >
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: s.profile.imageUri }}
                style={styles.avatar}
                contentFit="cover"
              />
              {/* Score ring */}
              <View style={[styles.scoreRing, { borderColor: s.compatibility.score >= 85 ? "#E91E8C" : colors.primary }]}>
                <View style={[styles.scoreDot, { backgroundColor: s.compatibility.score >= 85 ? "#E91E8C" : colors.primary }]} />
              </View>
            </View>
            <Text style={styles.avatarName} numberOfLines={1}>
              {s.profile.name}
            </Text>
            <Text style={[styles.avatarScore, { color: s.compatibility.score >= 85 ? "#E91E8C" : colors.primary }]}>
              {s.compatibility.score}% match
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  aiBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  avatarRowItem: {
    alignItems: "center",
    width: AVATAR_SIZE + 8,
    gap: 4,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: "relative",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  scoreRing: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avatarName: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginTop: 4,
  },
  avatarScore: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
});

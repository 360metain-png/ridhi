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
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { type AISuggestedMatch } from "@/data/aiMatchEngine";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.72;

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
          <Feather name="cpu" size={16} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            AI Suggested Matches
          </Text>
        </View>
        <View style={[styles.aiBadge, { backgroundColor: colors.primary + "18" }]}>
          <Text style={[styles.aiBadgeText, { color: colors.primary }]}>
            {suggestions.length} picks
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
      >
        {suggestions.map((s) => (
          <Pressable
            key={s.profile.id}
            onPress={() => onPressMatch(s.profile)}
            style={styles.card}
          >
            <Image
              source={{ uri: s.profile.imageUri }}
              style={styles.cardImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.85)"]}
              style={styles.cardGradient}
            />

            {/* AI Score Badge */}
            <View style={styles.scoreContainer}>
              <LinearGradient
                colors={
                  s.compatibility.score >= 85
                    ? ["#FF6B35", "#E91E8C"]
                    : ["#7B2FBE", "#E91E8C"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scoreBadge}
              >
                <Feather name="zap" size={10} color="#fff" />
                <Text style={styles.scoreText}>{s.compatibility.score}%</Text>
              </LinearGradient>
            </View>

            {/* Card Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>
                {s.profile.name}, {s.profile.age}
              </Text>
              <View style={styles.cardMeta}>
                <Feather name="map-pin" size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.cardMetaText}>
                  {s.profile.city} · {s.profile.language}
                </Text>
              </View>

              {/* AI Reasons */}
              <View style={styles.reasons}>
                {s.compatibility.matchReasons.slice(0, 2).map((r, i) => (
                  <Text key={i} style={styles.reasonText}>
                    ✨ {r}
                  </Text>
                ))}
              </View>

              {/* AI Icebreaker preview */}
              <View style={styles.icebreakerPreview}>
                <Text style={styles.icebreakerLabel}>AI Icebreaker:</Text>
                <Text style={styles.icebreakerText} numberOfLines={2}>
                  {s.aiIcebreaker}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  aiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  aiBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: 340,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1a1a2e",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },
  scoreContainer: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  scoreText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 6,
  },
  cardName: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardMetaText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  reasons: {
    gap: 2,
    marginTop: 2,
  },
  reasonText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  icebreakerPreview: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  icebreakerLabel: {
    color: "#E91E8C",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  icebreakerText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
});

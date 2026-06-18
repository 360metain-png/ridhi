import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  score: number;
  reasons: string[];
  matchType: "high" | "trending" | "nearby" | "interest";
  compact?: boolean;
}

export function AIMatchBadge({ score, reasons, matchType, compact }: Props) {
  const getGradient = () => {
    if (score >= 90) return ["#FF6B35", "#E91E8C"] as [string, string];
    if (score >= 75) return ["#7B2FBE", "#E91E8C"] as [string, string];
    return ["#4A90E2", "#7B2FBE"] as [string, string];
  };

  const getLabel = () => {
    if (matchType === "high") return "Perfect Match";
    if (matchType === "trending") return "Trending";
    if (matchType === "nearby") return "Nearby";
    return "Interest Match";
  };

  if (compact) {
    return (
      <LinearGradient
        colors={getGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.compactBadge}
      >
        <Feather name="cpu" size={10} color="#fff" />
        <Text style={styles.compactText}>{score}%</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.scoreBadge}
      >
        <Feather name="zap" size={14} color="#fff" />
        <Text style={styles.scoreText}>{score}% Match</Text>
      </LinearGradient>

      <View style={styles.reasons}>
        <Text style={styles.reasonLabel}>
          <Feather name="cpu" size={10} color="#E91E8C" /> AI Says:
        </Text>
        {reasons.slice(0, 2).map((r, i) => (
          <Text key={i} style={styles.reason}>
            • {r}
          </Text>
        ))}
      </View>

      <View style={styles.labelBadge}>
        <Text style={styles.labelText}>{getLabel()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  scoreText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  reasons: {
    gap: 2,
    paddingLeft: 4,
  },
  reasonLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#E91E8C",
    marginBottom: 2,
  },
  reason: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 16,
  },
  labelBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  labelText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  compactBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
});

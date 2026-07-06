import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTrackScreen } from "@/hooks/useAnalytics";
import { LudoGame } from "@/components/LudoGame";

const GAMES = [
  { id: "ludo", name: "Ludo", icon: "grid", color: "#E91E8C", desc: "Classic board game" },
  { id: "coming-soon-1", name: "Snake & Ladder", icon: "activity", color: "#7B2FBE", desc: "Coming soon" },
  { id: "coming-soon-2", name: "Trivia Quiz", icon: "help-circle", color: "#FFB800", desc: "Coming soon" },
  { id: "coming-soon-3", name: "Word Puzzle", icon: "type", color: "#34C759", desc: "Coming soon" },
];

export default function GamingScreen() {
  useTrackScreen("gaming");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 0 : 8) }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Games</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeGame === "ludo" ? (
          <View style={styles.gameContainer}>
            <View style={styles.gameHeader}>
              <Pressable onPress={() => setActiveGame(null)} style={styles.backBtn}>
                <Feather name="arrow-left" size={20} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.gameTitle, { color: colors.foreground }]}>Ludo</Text>
              <View style={{ width: 40 }} />
            </View>
            <LudoGame
              onWin={(winner) => {
                // Could award coins for winning here
              }}
            />
          </View>
        ) : (
          <View style={styles.grid}>
            {GAMES.map((game) => {
              const isReady = game.id === "ludo";
              return (
                <Pressable
                  key={game.id}
                  onPress={() => isReady && setActiveGame(game.id)}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: isReady ? 1 : 0.55,
                    },
                  ]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: game.color + "18" }]}>
                    <Feather name={game.icon as any} size={24} color={game.color} />
                  </View>
                  <Text style={[styles.cardName, { color: colors.foreground }]}>{game.name}</Text>
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{game.desc}</Text>
                  {!isReady && (
                    <View style={[styles.soonBadge, { backgroundColor: colors.muted }]}>
                      <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>SOON</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 8,
  },
  card: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 4 },
  cardDesc: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  gameContainer: { paddingHorizontal: 16, paddingTop: 8 },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  gameTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
});

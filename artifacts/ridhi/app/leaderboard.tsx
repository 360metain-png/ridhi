import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";

type Period = "daily" | "weekly" | "monthly";
type Category = "creators" | "gifters" | "earners" | "streamers";

const LEADERBOARD_DATA = {
  creators: [
    { rank: 1, name: "Priya Sharma", city: "Mumbai", value: 128400, badge: "diamond", language: "Hindi" },
    { rank: 2, name: "Rahul Verma", city: "Delhi", value: 98200, badge: "gold", language: "Hindi" },
    { rank: 3, name: "Kavya Reddy", city: "Hyderabad", value: 76800, badge: "silver", language: "Telugu" },
    { rank: 4, name: "Ananya Singh", city: "Delhi", value: 54300, badge: "bronze", language: "Hindi" },
    { rank: 5, name: "Dev Kumar", city: "Bangalore", value: 48900, badge: null, language: "English" },
    { rank: 6, name: "Meera Pillai", city: "Kochi", value: 41200, badge: null, language: "Malayalam" },
    { rank: 7, name: "Arjun Shah", city: "Surat", value: 38700, badge: null, language: "Gujarati" },
    { rank: 8, name: "Riya Das", city: "Kolkata", value: 32100, badge: null, language: "Bengali" },
    { rank: 9, name: "Vikram Rao", city: "Pune", value: 29800, badge: null, language: "Marathi" },
    { rank: 10, name: "Nisha Iyer", city: "Chennai", value: 26400, badge: null, language: "Tamil" },
  ],
  gifters: [
    { rank: 1, name: "Rohan Kapoor", city: "Delhi", value: 48200, badge: "diamond", language: "Hindi" },
    { rank: 2, name: "Sunita Joshi", city: "Jaipur", value: 32800, badge: "gold", language: "Hindi" },
    { rank: 3, name: "Kiran Nair", city: "Kochi", value: 28400, badge: "silver", language: "Malayalam" },
    { rank: 4, name: "Pooja Desai", city: "Ahmedabad", value: 21900, badge: "bronze", language: "Gujarati" },
    { rank: 5, name: "Suresh Kumar", city: "Chennai", value: 18200, badge: null, language: "Tamil" },
    { rank: 6, name: "Anjali Rao", city: "Bangalore", value: 15400, badge: null, language: "Kannada" },
    { rank: 7, name: "Manish Gupta", city: "Lucknow", value: 12800, badge: null, language: "Hindi" },
    { rank: 8, name: "Divya Menon", city: "Thrissur", value: 10200, badge: null, language: "Malayalam" },
    { rank: 9, name: "Rajesh Varma", city: "Hyderabad", value: 9400, badge: null, language: "Telugu" },
    { rank: 10, name: "Sonia Gill", city: "Chandigarh", value: 8200, badge: null, language: "Punjabi" },
  ],
  earners: [
    { rank: 1, name: "Priya Sharma", city: "Mumbai", value: 84200, badge: "diamond", language: "Hindi" },
    { rank: 2, name: "Dev Kumar", city: "Bangalore", value: 62400, badge: "gold", language: "English" },
    { rank: 3, name: "Kavya Reddy", city: "Hyderabad", value: 48800, badge: "silver", language: "Telugu" },
    { rank: 4, name: "Rahul Verma", city: "Delhi", value: 38200, badge: "bronze", language: "Hindi" },
    { rank: 5, name: "Meera Pillai", city: "Kochi", value: 31400, badge: null, language: "Malayalam" },
    { rank: 6, name: "Nisha Iyer", city: "Chennai", value: 24800, badge: null, language: "Tamil" },
    { rank: 7, name: "Arjun Shah", city: "Surat", value: 21200, badge: null, language: "Gujarati" },
    { rank: 8, name: "Ananya Singh", city: "Delhi", value: 18600, badge: null, language: "Hindi" },
    { rank: 9, name: "Riya Das", city: "Kolkata", value: 15200, badge: null, language: "Bengali" },
    { rank: 10, name: "Vikram Rao", city: "Pune", value: 12800, badge: null, language: "Marathi" },
  ],
  streamers: [
    { rank: 1, name: "Priya Sharma", city: "Mumbai", value: 284700, badge: "diamond", language: "Hindi" },
    { rank: 2, name: "Ravi Teja", city: "Hyderabad", value: 198400, badge: "gold", language: "Telugu" },
    { rank: 3, name: "Kavya Reddy", city: "Hyderabad", value: 142800, badge: "silver", language: "Telugu" },
    { rank: 4, name: "Dev Kumar", city: "Bangalore", value: 121000, badge: "bronze", language: "English" },
    { rank: 5, name: "Meera Pillai", city: "Kochi", value: 98200, badge: null, language: "Malayalam" },
    { rank: 6, name: "Sunita Joshi", city: "Jaipur", value: 84400, badge: null, language: "Hindi" },
    { rank: 7, name: "Rohan Kapoor", city: "Delhi", value: 72100, badge: null, language: "Hindi" },
    { rank: 8, name: "Anjali Rao", city: "Bangalore", value: 64800, badge: null, language: "Kannada" },
    { rank: 9, name: "Kiran Nair", city: "Kochi", value: 52400, badge: null, language: "Malayalam" },
    { rank: 10, name: "Nisha Iyer", city: "Chennai", value: 44200, badge: null, language: "Tamil" },
  ],
};

const BADGE_COLORS: Record<string, [string, string]> = {
  diamond: ["#00BCD4", "#0097A7"],
  gold: ["#FFB800", "#FF8C00"],
  silver: ["#9E9E9E", "#757575"],
  bronze: ["#CD7F32", "#A0522D"],
};

const CATEGORY_LABELS: Record<Category, { label: string; icon: string; unit: string }> = {
  creators: { label: "Top Creators", icon: "star", unit: "followers" },
  gifters: { label: "Top Gifters", icon: "gift", unit: "coins gifted" },
  earners: { label: "Top Earners", icon: "trending-up", unit: "coins earned" },
  streamers: { label: "Top Streamers", icon: "video", unit: "views" },
};

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("weekly");
  const [category, setCategory] = useState<Category>("creators");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const data = LEADERBOARD_DATA[category];
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const meta = CATEGORY_LABELS[category];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gold + "30", colors.primary + "15", "transparent"]}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={[styles.periodRow, { borderBottomColor: colors.border }]}>
        {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[
              styles.periodBtn,
              { backgroundColor: period === p ? colors.primary : colors.card, borderColor: period === p ? colors.primary : colors.border },
            ]}
          >
            <Text style={[styles.periodText, { color: period === p ? "#fff" : colors.mutedForeground }]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}
      >
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[
              styles.categoryBtn,
              { backgroundColor: category === c ? colors.secondary + "20" : "transparent", borderColor: category === c ? colors.secondary : colors.border },
            ]}
          >
            <Feather name={CATEGORY_LABELS[c].icon as any} size={14} color={category === c ? colors.secondary : colors.mutedForeground} />
            <Text style={[styles.categoryText, { color: category === c ? colors.secondary : colors.mutedForeground }]}>
              {CATEGORY_LABELS[c].label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.podium}>
          {[top3[1], top3[0], top3[2]].map((entry, i) => {
            const podiumOrder = [2, 1, 3];
            const rank = podiumOrder[i];
            const height = rank === 1 ? 120 : rank === 2 ? 90 : 70;
            const badgeKey = entry.badge ?? "bronze";
            return (
              <View key={entry.rank} style={styles.podiumItem}>
                <Avatar name={entry.name} size={rank === 1 ? 60 : 48} hasStory={rank === 1} />
                <Text style={[styles.podiumName, { color: colors.foreground }]} numberOfLines={1}>
                  {entry.name.split(" ")[0]}
                </Text>
                <LinearGradient
                  colors={BADGE_COLORS[badgeKey]}
                  style={[styles.podiumBlock, { height }]}
                >
                  <Text style={styles.podiumRank}>#{rank}</Text>
                  <Text style={styles.podiumValue}>{(entry.value / 1000).toFixed(0)}K</Text>
                </LinearGradient>
              </View>
            );
          })}
        </View>

        <View style={styles.listSection}>
          {rest.map((entry) => (
            <View key={entry.rank} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.listRank, { color: colors.mutedForeground }]}>#{entry.rank}</Text>
              <Avatar name={entry.name} size={42} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.listName, { color: colors.foreground }]}>{entry.name}</Text>
                <Text style={[styles.listMeta, { color: colors.mutedForeground }]}>{entry.city} · {entry.language}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.listValue, { color: colors.foreground }]}>
                  {entry.value.toLocaleString()}
                </Text>
                <Text style={[styles.listUnit, { color: colors.mutedForeground }]}>{meta.unit}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  periodRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  periodBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  periodText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  categoryScroll: { flexGrow: 0 },
  categoryRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  categoryBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  podium: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 10 },
  podiumItem: { alignItems: "center", flex: 1, gap: 4 },
  podiumName: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  podiumBlock: { width: "100%", borderRadius: 14, alignItems: "center", justifyContent: "flex-end", paddingBottom: 10, gap: 4 },
  podiumRank: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_700Bold" },
  podiumValue: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  listSection: { paddingHorizontal: 16, gap: 8 },
  listItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  listRank: { fontSize: 13, fontFamily: "Inter_700Bold", width: 28 },
  listName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  listMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  listValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  listUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
});

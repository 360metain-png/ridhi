import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { GIFTS } from "@/data/coinEconomy";

type Tab = "received" | "sent";

interface GiftRecord {
  id: string;
  giftId: string;
  user: string;
  avatar: string;
  date: string;
  note?: string;
}

const RECEIVED: GiftRecord[] = [
  { id: "r1",  giftId: "g15", user: "Priya Mehra",    avatar: "👩", date: "Today, 2:30 PM",      note: "You're amazing! 🔥" },
  { id: "r2",  giftId: "g06", user: "Arjun Singh",    avatar: "👨", date: "Today, 10:15 AM"                                  },
  { id: "r3",  giftId: "g12", user: "Neha Verma",     avatar: "👩", date: "Yesterday, 8:00 PM",  note: "Love your content!"  },
  { id: "r4",  giftId: "g03", user: "Rohit Sharma",   avatar: "👨", date: "Yesterday, 5:45 PM"                               },
  { id: "r5",  giftId: "g09", user: "Ananya Patel",   avatar: "👩", date: "20 May, 3:20 PM",     note: "Keep it up 💜"      },
  { id: "r6",  giftId: "g07", user: "Vikram Rao",     avatar: "👨", date: "20 May, 12:00 PM"                                 },
  { id: "r7",  giftId: "g14", user: "Simran Kaur",    avatar: "👩", date: "19 May, 9:30 PM",     note: "Best creator 🌟"    },
  { id: "r8",  giftId: "g05", user: "Dev Malhotra",   avatar: "👨", date: "19 May, 7:00 PM"                                  },
  { id: "r9",  giftId: "g02", user: "Kavya Reddy",    avatar: "👩", date: "18 May, 4:15 PM"                                  },
  { id: "r10", giftId: "g01", user: "Manish Gupta",   avatar: "👨", date: "18 May, 1:00 PM",     note: "Greetings! 👋"      },
];

const SENT: GiftRecord[] = [
  { id: "s1",  giftId: "g06", user: "Zara Khan",      avatar: "👩", date: "Today, 1:00 PM",      note: "Love your dance!" },
  { id: "s2",  giftId: "g03", user: "Ravi Punjabi",   avatar: "👨", date: "Yesterday, 9:00 PM"                             },
  { id: "s3",  giftId: "g11", user: "Ananya Patel",   avatar: "👩", date: "20 May, 6:30 PM",     note: "Great stream 🎙️" },
  { id: "s4",  giftId: "g04", user: "DJ Aryan",       avatar: "👨", date: "20 May, 2:00 PM"                                },
  { id: "s5",  giftId: "g07", user: "Zara Khan",      avatar: "👩", date: "19 May, 8:45 PM"                                },
  { id: "s6",  giftId: "g01", user: "Preet Bhatia",   avatar: "👩", date: "18 May, 5:30 PM",     note: "Hi! 👋"           },
];

function giftById(id: string) {
  return GIFTS.find(g => g.id === id) ?? GIFTS[0];
}

function totalCoins(records: GiftRecord[]) {
  return records.reduce((sum, r) => sum + (giftById(r.giftId).coins), 0);
}

const CAT_COLOR: Record<string, string> = {
  basic:   "#7B2FBE",
  premium: "#9C27B0",
  luxury:  "#E91E8C",
  special: "#FF6B35",
};

export default function MyGiftsScreen() {
  const colors = useColors();
  const router  = useRouter();
  const [tab, setTab] = useState<Tab>("received");

  const records = tab === "received" ? RECEIVED : SENT;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>My Gifts</Text>
        <Pressable onPress={() => router.push("/coin-store")} style={styles.shopBtn}>
          <Feather name="shopping-bag" size={20} color="#fff" />
        </Pressable>
      </LinearGradient>

      {/* Stats strip */}
      <View style={[styles.statsStrip, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { label: "Received",     value: RECEIVED.length,          icon: "inbox",       color: "#34C759" },
          { label: "Sent",         value: SENT.length,              icon: "send",        color: "#E91E8C" },
          { label: "Coins Earned", value: `+${totalCoins(RECEIVED)}🪙`, icon: "trending-up", color: "#FFB800" },
          { label: "Coins Spent",  value: `${totalCoins(SENT)}🪙`,  icon: "gift",        color: "#7B2FBE" },
        ].map(({ label, value, icon, color }) => (
          <View key={label} style={styles.stat}>
            <Feather name={icon as any} size={15} color={color} />
            <Text style={[styles.statVal, { color: colors.foreground }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Tab toggle */}
      <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
        {(["received", "sent"] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && { backgroundColor: colors.primary }]}>
            <Feather
              name={t === "received" ? "inbox" : "send"}
              size={13}
              color={tab === t ? "#fff" : colors.mutedForeground}
            />
            <Text style={[styles.tabTxt, { color: tab === t ? "#fff" : colors.mutedForeground }]}>
              {t === "received" ? "Received" : "Sent"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
            <Text style={{ fontSize: 48 }}>🎁</Text>
            <Text style={[{ fontSize: 16, fontFamily: "Inter_600SemiBold" }, { color: colors.foreground }]}>
              No gifts yet
            </Text>
            <Text style={[{ fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" }, { color: colors.mutedForeground }]}>
              {tab === "received"
                ? "Gifts from your fans will appear here"
                : "Gifts you send to creators will appear here"}
            </Text>
            <Pressable onPress={() => router.push("/coin-store")} style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 4 }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Open Gift Shop</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const gift = giftById(item.giftId);
          const catColor = CAT_COLOR[gift.category] ?? colors.primary;
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Gift emoji badge */}
              <LinearGradient
                colors={[catColor + "30", catColor + "10"]}
                style={styles.giftBadge}
              >
                <Text style={styles.giftEmoji}>{gift.emoji}</Text>
              </LinearGradient>

              <View style={{ flex: 1, gap: 3 }}>
                {/* Gift name + coins */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.giftName, { color: colors.foreground }]}>{gift.name}</Text>
                  <View style={[styles.coinPill, { backgroundColor: catColor + "20" }]}>
                    <Text style={[styles.coinPillTxt, { color: catColor }]}>
                      {tab === "received" ? "+" : "−"}{gift.coins}🪙
                    </Text>
                  </View>
                  {gift.animated && (
                    <View style={[styles.animPill, { backgroundColor: "#FFB80020" }]}>
                      <Feather name="zap" size={9} color="#FFB800" />
                      <Text style={{ fontSize: 9, color: "#FFB800", fontFamily: "Inter_600SemiBold" }}>Animated</Text>
                    </View>
                  )}
                </View>

                {/* Sender / recipient */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Text style={{ fontSize: 14 }}>{item.avatar}</Text>
                  <Text style={[styles.userName, { color: colors.mutedForeground }]}>
                    {tab === "received" ? "From " : "To "}
                    <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{item.user}</Text>
                  </Text>
                </View>

                {/* Note (if any) */}
                {item.note && (
                  <View style={[styles.noteWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Feather name="message-circle" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.noteTxt, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {item.note}
                    </Text>
                  </View>
                )}
              </View>

              {/* Date */}
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{item.date}</Text>
            </View>
          );
        }}
      />

      {/* FAB — go to gift shop */}
      <Pressable onPress={() => router.push("/coin-store")} style={styles.fab}>
        <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.fabGrad}>
          <Feather name="shopping-bag" size={20} color="#fff" />
          <Text style={styles.fabTxt}>Gift Shop</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:     { flex: 1 },
  header:     { flexDirection: "row", alignItems: "center", paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, gap: 12 },
  backBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle:{ flex: 1, color: "#fff", fontSize: 19, fontFamily: "Inter_700Bold" },
  shopBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },

  statsStrip: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  stat:       { flex: 1, alignItems: "center", gap: 3 },
  statVal:    { fontSize: 14, fontFamily: "Inter_700Bold" },
  statLabel:  { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },

  tabRow:     { flexDirection: "row", margin: 16, marginBottom: 0, borderRadius: 14, padding: 4 },
  tabBtn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 11 },
  tabTxt:     { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  card:       { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  giftBadge:  { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  giftEmoji:  { fontSize: 28 },
  giftName:   { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  coinPill:   { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  coinPillTxt:{ fontSize: 11, fontFamily: "Inter_700Bold" },
  animPill:   { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 },
  userName:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  noteWrap:   { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, marginTop: 2 },
  noteTxt:    { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  date:       { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },

  fab:        { position: "absolute", bottom: 28, alignSelf: "center" },
  fabGrad:    { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 30 },
  fabTxt:     { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
});

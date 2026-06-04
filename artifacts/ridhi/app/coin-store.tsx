import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { PrivateHead } from "@/components/PrivateHead";
import { GIFTS, GIFT_CATEGORIES, Gift } from "@/data/coinEconomy";

const COIN_IMAGE = require("../assets/images/ridhi_coin.png");
const { width } = Dimensions.get("window");

const RECENT_RECIPIENTS = [
  { id: "r1", name: "Priya S",   emoji: "👩" },
  { id: "r2", name: "Ananya R",  emoji: "👱‍♀️" },
  { id: "r3", name: "Dev K",     emoji: "👨" },
  { id: "r4", name: "Kavya M",   emoji: "👩‍🦱" },
  { id: "r5", name: "Rahul T",   emoji: "🧑" },
];

function CoinBal({ coins }: { coins: number }) {
  const colors = useColors();
  return (
    <View style={[styles.coinBal, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image source={COIN_IMAGE} style={{ width: 18, height: 18 }} resizeMode="contain" />
      <Text style={[styles.coinBalText, { color: colors.foreground }]}>{coins.toLocaleString()}</Text>
    </View>
  );
}

function GiftCard({ gift, onSend }: { gift: Gift; onSend: (g: Gift) => void }) {
  const colors = useColors();
  const catColor =
    gift.category === "luxury"  ? "#E91E8C" :
    gift.category === "premium" ? "#7B2FBE" :
    gift.category === "special" ? "#FF6B35" : colors.primary;

  return (
    <Pressable
      onPress={() => onSend(gift)}
      style={[styles.giftCard, { backgroundColor: colors.card, borderColor: gift.popular ? catColor + "60" : colors.border, borderWidth: gift.popular ? 1.5 : 1 }]}
    >
      {gift.popular && (
        <View style={[styles.hotBadge, { backgroundColor: catColor }]}>
          <Text style={styles.hotText}>🔥</Text>
        </View>
      )}
      {gift.animated && (
        <View style={[styles.animBadge, { backgroundColor: "#22C55E20" }]}>
          <Text style={styles.animText}>✨ Animated</Text>
        </View>
      )}
      <Text style={styles.giftEmoji}>{gift.emoji}</Text>
      <Text style={[styles.giftName, { color: colors.foreground }]} numberOfLines={1}>{gift.name}</Text>
      <View style={styles.giftCost}>
        <Image source={COIN_IMAGE} style={{ width: 12, height: 12 }} resizeMode="contain" />
        <Text style={[styles.giftCostText, { color: catColor }]}>{gift.coins.toLocaleString()}</Text>
      </View>
      <Text style={[styles.giftRs, { color: colors.mutedForeground }]}>= ₹{gift.coins}</Text>
    </Pressable>
  );
}

export default function CoinStoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [activeTab, setActiveTab] = useState("all");
  const [selectedRecipient, setSelectedRecipient] = useState(RECENT_RECIPIENTS[0].id);
  const [sentGift, setSentGift] = useState<Gift | null>(null);

  const filtered = activeTab === "all"
    ? GIFTS
    : GIFTS.filter((g) =>
        activeTab === "special" ? g.category === "special" : g.category === activeTab
      );

  const handleSend = (gift: Gift) => {
    if ((user?.coins ?? 0) < gift.coins) {
      Alert.alert(
        "Not enough coins",
        `You need ${gift.coins} coins. Recharge your wallet to send this gift.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Recharge Now", onPress: () => router.push("/wallet") },
        ]
      );
      return;
    }
    addCoins(-gift.coins);
    setSentGift(gift);
    setTimeout(() => setSentGift(null), 2200);
  };

  const coins = user?.coins ?? 0;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Gift Shop</Text>
            <Text style={styles.headerSub}>1 Coin = ₹1 • Instant delivery</Text>
          </View>
          <Pressable onPress={() => router.push("/wallet")} style={styles.rechargeBtn}>
            <Feather name="plus" size={14} color="#fff" />
            <Text style={styles.rechargeBtnText}>Recharge</Text>
          </Pressable>
        </View>

        {/* Balance strip */}
        <View style={styles.balanceStrip}>
          <CoinBal coins={coins} />
          <Text style={styles.balanceEq}>= ₹{coins.toLocaleString()}</Text>
          <View style={{ flex: 1 }} />
          <Text style={[styles.balanceNote, { color: "rgba(255,255,255,0.7)" }]}>Coins never expire</Text>
        </View>

        {/* Recipients */}
        <View style={{ marginTop: 12 }}>
          <Text style={styles.recipientLabel}>Send To</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection: "row", gap: 10, paddingRight: 16 }}>
              {RECENT_RECIPIENTS.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => setSelectedRecipient(r.id)}
                  style={[
                    styles.recipientChip,
                    { backgroundColor: selectedRecipient === r.id ? "#fff" : "rgba(255,255,255,0.2)" },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>{r.emoji}</Text>
                  <Text style={[styles.recipientName, { color: selectedRecipient === r.id ? colors.primary : "#fff" }]}>
                    {r.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsBar, { backgroundColor: colors.surface }]}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {GIFT_CATEGORIES.map((cat) => {
          const active = activeTab === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setActiveTab(cat.id)}
              style={[
                styles.tab,
                { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border },
              ]}
            >
              <Text style={[styles.tabText, { color: active ? "#fff" : colors.foreground }]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Gift grid */}
      <FlatList
        data={filtered}
        keyExtractor={(g) => g.id}
        numColumns={3}
        contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 24, gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => <GiftCard gift={item} onSend={handleSend} />}
        ListHeaderComponent={
          <View style={[styles.infoCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              All gifts cost Ridhi Coins. 1 Coin = ₹1. 70% goes directly to the creator.
            </Text>
          </View>
        }
      />

      {/* Sent toast */}
      {sentGift && (
        <View style={[styles.sentToast, { backgroundColor: "#22C55E" }]}>
          <Text style={styles.sentEmoji}>{sentGift.emoji}</Text>
          <Text style={styles.sentText}>
            {sentGift.name} sent! −{sentGift.coins} coins
          </Text>
        </View>
      )}
    </View>
  );
}

const CARD_W = (width - 44) / 3;

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  rechargeBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  rechargeBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  balanceStrip: { flexDirection: "row", alignItems: "center", gap: 8 },
  coinBal: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  coinBalText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  balanceEq: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular" },
  balanceNote: { fontSize: 11, fontFamily: "Inter_400Regular" },
  recipientLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_500Medium" },
  recipientChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  recipientName: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tabsBar: { flexGrow: 0 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  infoText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular" },
  giftCard: {
    width: CARD_W, alignItems: "center", padding: 10, borderRadius: 16,
    position: "relative", overflow: "hidden", gap: 4,
  },
  hotBadge: { position: "absolute", top: 0, right: 0, borderBottomLeftRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  hotText: { fontSize: 10 },
  animBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  animText: { fontSize: 8, fontFamily: "Inter_600SemiBold", color: "#22C55E" },
  giftEmoji: { fontSize: 36 },
  giftName: { fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  giftCost: { flexDirection: "row", alignItems: "center", gap: 3 },
  giftCostText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  giftRs: { fontSize: 9, fontFamily: "Inter_400Regular" },
  sentToast: {
    position: "absolute", bottom: 40, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30,
    shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 10, elevation: 8,
  },
  sentEmoji: { fontSize: 20 },
  sentText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
});

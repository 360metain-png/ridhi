import React from "react";
import {
  Dimensions,
  FlatList,
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
import { useAuth } from "@/contexts/AuthContext";
import { COIN_PACKAGES, COIN_TRANSACTIONS } from "@/data/mockData";

const { width } = Dimensions.get("window");

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.walletCard, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.walletHeader}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.walletTitle}>My Wallet</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.balanceSection}>
          <Feather name="star" size={40} color="rgba(255,255,255,0.8)" />
          <Text style={styles.balanceLabel}>Coin Balance</Text>
          <Text style={styles.balance}>{(user?.coins ?? 0).toLocaleString()}</Text>
          <Text style={styles.balanceSub}>coins</Text>
        </View>

        <View style={styles.quickStats}>
          {[
            { icon: "arrow-down-circle", label: "Earned", value: "890" },
            { icon: "arrow-up-circle", label: "Spent", value: "640" },
            { icon: "gift", label: "Gifted", value: "25" },
          ].map((s) => (
            <View key={s.label} style={styles.quickStat}>
              <Feather name={s.icon as any} size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.quickStatValue}>{s.value}</Text>
              <Text style={styles.quickStatLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Rewards</Text>
        <Pressable
          onPress={() => addCoins(10)}
          style={[styles.rewardCard, { backgroundColor: colors.gold + "18", borderColor: colors.gold + "40" }]}
        >
          <View style={[styles.rewardIcon, { backgroundColor: colors.gold + "30" }]}>
            <Feather name="gift" size={24} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rewardTitle, { color: colors.foreground }]}>Daily Login Reward</Text>
            <Text style={[styles.rewardSub, { color: colors.mutedForeground }]}>Claim 10 coins every day</Text>
          </View>
          <View style={[styles.claimBtn, { backgroundColor: colors.gold }]}>
            <Text style={styles.claimText}>Claim</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recharge Coins</Text>
        <View style={styles.packGrid}>
          {COIN_PACKAGES.map((pack) => (
            <Pressable
              key={pack.id}
              style={[
                styles.packCard,
                {
                  backgroundColor: pack.popular ? colors.primary : colors.card,
                  borderColor: pack.popular ? colors.primary : colors.border,
                },
              ]}
            >
              {pack.popular && (
                <View style={[styles.popularBadge, { backgroundColor: colors.gold }]}>
                  <Text style={styles.popularText}>Best Value</Text>
                </View>
              )}
              <Feather name="star" size={28} color={pack.popular ? "#fff" : colors.gold} />
              <Text style={[styles.packCoins, { color: pack.popular ? "#fff" : colors.foreground }]}>
                {pack.coins}
              </Text>
              <Text style={[styles.packLabel, { color: pack.popular ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                {pack.label}
              </Text>
              <View style={[styles.packPrice, { backgroundColor: pack.popular ? "rgba(255,255,255,0.2)" : colors.muted }]}>
                <Text style={[styles.packPriceText, { color: pack.popular ? "#fff" : colors.foreground }]}>
                  ₹{pack.price}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pay Via</Text>
        <View style={styles.paymentRow}>
          {[
            { label: "UPI", icon: "smartphone", color: "#00BCD4" },
            { label: "Razorpay", icon: "credit-card", color: "#2962FF" },
            { label: "GPay", icon: "globe", color: "#34A853" },
            { label: "PhonePe", icon: "zap", color: "#5F259F" },
            { label: "Paytm", icon: "shopping-bag", color: "#00BAF2" },
          ].map((pm) => (
            <Pressable
              key={pm.label}
              style={[styles.paymentMethod, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name={pm.icon as any} size={20} color={pm.color} />
              <Text style={[styles.paymentLabel, { color: colors.foreground }]}>{pm.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => router.push("/subscription")}
          style={[styles.vipBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
        >
          <Feather name="award" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.vipTitle, { color: colors.foreground }]}>Upgrade to VIP</Text>
            <Text style={[styles.vipSub, { color: colors.mutedForeground }]}>Get 500 coins/day + exclusive perks</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Transaction History</Text>
        {COIN_TRANSACTIONS.map((tx) => (
          <View
            key={tx.id}
            style={[styles.txItem, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.txIcon,
                {
                  backgroundColor:
                    tx.type === "credit" ? colors.success + "18" : colors.destructive + "18",
                },
              ]}
            >
              <Feather
                name={tx.type === "credit" ? "arrow-down-left" : "arrow-up-right"}
                size={16}
                color={tx.type === "credit" ? colors.success : colors.destructive}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.txDesc, { color: colors.foreground }]} numberOfLines={1}>
                {tx.desc}
              </Text>
              <Text style={[styles.txTime, { color: colors.mutedForeground }]}>{tx.time}</Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: tx.type === "credit" ? colors.success : colors.destructive },
              ]}
            >
              {tx.type === "credit" ? "+" : "-"}{tx.amount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  walletCard: { paddingHorizontal: 20, paddingBottom: 30 },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: { padding: 4 },
  walletTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  balanceSection: { alignItems: "center", gap: 4, marginBottom: 24 },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular" },
  balance: { color: "#fff", fontSize: 56, fontFamily: "Inter_700Bold", letterSpacing: -2 },
  balanceSub: { color: "rgba(255,255,255,0.7)", fontSize: 16, fontFamily: "Inter_400Regular" },
  quickStats: { flexDirection: "row", justifyContent: "space-around" },
  quickStat: { alignItems: "center", gap: 4 },
  quickStatValue: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  quickStatLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { paddingHorizontal: 20, paddingTop: 24, gap: 14 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  rewardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rewardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  rewardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  claimBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  claimText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  packGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  packCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 6,
    position: "relative",
    overflow: "hidden",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  popularText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  packCoins: { fontSize: 28, fontFamily: "Inter_700Bold" },
  packLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  packPrice: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginTop: 4 },
  packPriceText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txDesc: { fontSize: 14, fontFamily: "Inter_500Medium" },
  txTime: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  txAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  paymentRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  paymentMethod: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 64,
  },
  paymentLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  vipBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  vipTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  vipSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
});

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

const COIN_IMAGE = require("../assets/images/ridhi_coin.png");
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";

import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";
import { COIN_PACKAGES, COIN_TRANSACTIONS } from "@/data/mockData";
import { SPEND_CATEGORIES } from "@/data/coinEconomy";
import { CoinFountainOverlay, AnimatedCoinBalance, useCoinToasts } from "@/components/CoinFountain";
import { PaymentSheet } from "@/components/PaymentSheet";
import { isIapAvailable, purchasePackage, getOfferings, restorePurchases } from "@/lib/iap";

const { width } = Dimensions.get("window");

const LIVE_EVENTS = [
  { type: "credit" as const, amount: 50, label: "Gift Received", sublabel: "🌹 Rose from Riya", role: "Host" },
  { type: "debit" as const, amount: 100, label: "Gift Sent", sublabel: "💗 Heart to Priya", role: "User" },
  { type: "credit" as const, amount: 200, label: "Call Earnings", sublabel: "Audio Call · 20 min", role: "Host" },
  { type: "debit" as const, amount: 40, label: "Audio Call", sublabel: "Creator · 4 min", role: "User" },
  { type: "credit" as const, amount: 1000, label: "Recharge Bonus", sublabel: "Razorpay · +100 bonus", role: "User" },
  { type: "credit" as const, amount: 80, label: "Gift Received", sublabel: "🎂 Cake from Kavya", role: "Host" },
  { type: "debit" as const, amount: 250, label: "Gift Sent", sublabel: "🚗 Car to Dev", role: "User" },
  { type: "credit" as const, amount: 320, label: "Call Earnings", sublabel: "Video Call · 8 min", role: "Host" },
  { type: "credit" as const, amount: 3, label: "Download Earning", sublabel: "Reel · 60% split", role: "Creator" },
  { type: "debit" as const, amount: 10, label: "Download", sublabel: "Post · @neha_art", role: "User" },
  { type: "credit" as const, amount: 6, label: "Download Earning", sublabel: "Post · 60% split", role: "Creator" },
  { type: "debit" as const, amount: 5, label: "Download", sublabel: "Reel · @ravi_dance", role: "User" },
];

interface LiveTx {
  id: string;
  type: "credit" | "debit";
  amount: number;
  label: string;
  sublabel: string;
  role: string;
  ts: string;
  entryAnim: Animated.Value;
}

function LiveTxRow({ tx }: { tx: LiveTx }) {
  const colors = useColors();
  const isCredit = tx.type === "credit";
  const accentColor = isCredit ? "#22C55E" : "#F43F5E";
  const bgColor = isCredit ? "#22C55E18" : "#F43F5E18";

  return (
    <Animated.View
      style={[
        styles.liveTxRow,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: tx.entryAnim, transform: [{ translateX: tx.entryAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] },
      ]}
    >
      <View style={[styles.liveTxIcon, { backgroundColor: bgColor }]}>
        <Image source={COIN_IMAGE} style={{ width: 20, height: 20 }} resizeMode="contain" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.liveTxLabel, { color: colors.foreground }]}>{tx.label}</Text>
        <Text style={[styles.liveTxSub, { color: colors.mutedForeground }]}>{tx.sublabel}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.liveTxAmount, { color: accentColor }]}>
          {isCredit ? "+" : "−"}{tx.amount.toLocaleString()}
        </Text>
        <View style={styles.liveTxMeta}>
          <View style={[styles.liveRoleBadge, { backgroundColor: accentColor + "20" }]}>
            <Text style={[styles.liveRoleText, { color: accentColor }]}>{tx.role}</Text>
          </View>
          <Text style={[styles.liveTxTime, { color: colors.mutedForeground }]}>{tx.ts}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function LivePulseDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.6, duration: 500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.pulseDot, { transform: [{ scale }], opacity }]}
    />
  );
}

export default function WalletScreen() {
  useTrackScreen("wallet");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins, claimDailyReward, syncWallet } = useAuth();
  const { toasts, fire, remove } = useCoinToasts();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [liveTxs, setLiveTxs] = useState<LiveTx[]>([]);
  const eventIdx = useRef(0);

  // Auto-generate live transaction events
  useEffect(() => {
    const addEvent = () => {
      const ev = LIVE_EVENTS[eventIdx.current % LIVE_EVENTS.length];
      eventIdx.current += 1;
      const anim = new Animated.Value(0);
      const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const newTx: LiveTx = { ...ev, id: `lt_${Date.now()}`, ts, entryAnim: anim };

      setLiveTxs((prev) => [newTx, ...prev.slice(0, 11)]);
      Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }).start();

      // Fire coin toast for the live event
      fire({ type: ev.type, amount: ev.amount, label: ev.label, sublabel: ev.role, bottom: 280 });
    };

    const base = setTimeout(addEvent, 1200);
    const interval = setInterval(addEvent, 3200 + Math.random() * 1800);
    return () => { clearTimeout(base); clearInterval(interval); };
  }, []);

  const scrollRef = useRef<ScrollView>(null);
  const rechargeSectionY = useRef(0);

  const scrollToRecharge = useCallback(() => {
    scrollRef.current?.scrollTo({ y: rechargeSectionY.current, animated: true });
  }, []);

  const [dailyClaimed, setDailyClaimed] = useState(false);

  useEffect(() => {
    if (!user?.lastDailyRewardAt) return;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last = new Date(user.lastDailyRewardAt);
    const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    setDailyClaimed(lastDate.getTime() >= today.getTime());
  }, [user?.lastDailyRewardAt]);

  const onClaimReward = async () => {
    const claimed = await claimDailyReward();
    if (claimed) {
      setDailyClaimed(true);
      fire({ type: "credit", amount: 10, label: "Daily Reward", sublabel: "User", bottom: 200 });
    }
  };

  const [pendingPack, setPendingPack] = useState<typeof COIN_PACKAGES[0] | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const onRecharge = (pack: typeof COIN_PACKAGES[0]) => {
    if (Platform.OS === "ios" && isIapAvailable()) {
      handleIapCoinPurchase(pack);
      return;
    }
    setPendingPack(pack);
    setShowPayment(true);
  };

  const [iapLoading, setIapLoading] = useState(false);
  const [iapError, setIapError] = useState("");

  const handleIapCoinPurchase = async (pack: typeof COIN_PACKAGES[0]) => {
    if (!isIapAvailable()) return;
    setIapLoading(true);
    setIapError("");
    try {
      const offerings = await getOfferings();
      const packages = offerings?.coinPackages ?? [];
      const pkg = packages.find((p) => p.identifier.includes(String(pack.coins)));
      if (!pkg) {
        setIapError("This coin pack is not available on App Store yet.");
        setPendingPack(pack);
        setShowPayment(true);
        return;
      }
      const result = await purchasePackage(pkg);
      if (result.success) {
        const total = pack.coins + ((pack as any).bonus ?? 0);
        // Sync authoritative server wallet state after IAP success (server auto-credits)
        syncWallet().catch(() => {});
        fire({ type: "credit", amount: total, label: "Recharge", sublabel: pack.label, large: total >= 500, bottom: 200 });
        trackCoinRecharge(total);
      } else if (result.error && result.error !== "User cancelled") {
        setIapError(result.error);
        setPendingPack(pack);
        setShowPayment(true);
      }
    } catch {
      setIapError("Purchase failed. Please try again.");
      setPendingPack(pack);
      setShowPayment(true);
    } finally {
      setIapLoading(false);
    }
  };

  const { trackCoinRecharge } = useAnalytics();

  const handlePaySuccess = () => {
    if (!pendingPack) return;
    const total = pendingPack.coins + ((pendingPack as any).bonus ?? 0);
    // Sync authoritative server wallet state after payment success (server auto-credits)
    syncWallet().catch(() => {});
    fire({ type: "credit", amount: total, label: "Recharge", sublabel: pendingPack.label, large: total >= 500, bottom: 200 });
    trackCoinRecharge(total);
    setPendingPack(null);
  };

  return (
    <View style={[styles.outerWrap, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* ── Wallet Card ── */}
        <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.walletCard, { paddingTop: topPad + 16 }]}>
          <View style={styles.walletHeader}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.walletTitle}>My Wallet</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.balanceSection}>
            <Image source={COIN_IMAGE} style={styles.coinEmoji} resizeMode="contain" />
            <Text style={styles.balanceLabel}>Coin Balance</Text>
            <AnimatedCoinBalance
              value={user?.coins ?? 0}
              style={styles.balance}
            />
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

          {/* ── Quick Actions ── */}
          <View style={styles.quickActions}>
            <Pressable
              style={[styles.qaBtn, { backgroundColor: "rgba(255,255,255,0.22)" }]}
              onPress={scrollToRecharge}
            >
              <Feather name="plus-circle" size={16} color="#fff" />
              <Text style={styles.qaBtnText}>Recharge</Text>
            </Pressable>
            <Pressable
              style={[styles.qaBtn, { backgroundColor: "rgba(255,255,255,0.22)" }]}
              onPress={() => router.push("/withdraw")}
            >
              <Feather name="arrow-down-left" size={16} color="#fff" />
              <Text style={styles.qaBtnText}>Withdraw to Bank</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* ── Live Activity Feed ── */}
        <View style={[styles.section, { gap: 0 }]}>
          <View style={styles.liveSectionHeader}>
            <View style={styles.liveTitleRow}>
              <LivePulseDot />
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Live Coin Activity</Text>
            </View>
            <View style={styles.liveRoleRow}>
              {["User", "Host", "Creator"].map((r, i) => {
                const rc = ["#3B82F6", "#E91E8C", "#FFB800"][i];
                return (
                  <View key={r} style={[styles.roleChip, { backgroundColor: rc + "18", borderColor: rc + "40" }]}>
                    <Text style={[styles.roleChipText, { color: rc }]}>{r}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {liveTxs.length === 0 ? (
            <View style={[styles.liveEmpty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={COIN_IMAGE} style={{ width: 32, height: 32 }} resizeMode="contain" />
              <Text style={[styles.liveEmptyText, { color: colors.mutedForeground }]}>Waiting for live activity…</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {liveTxs.map((tx) => <LiveTxRow key={tx.id} tx={tx} />)}
            </View>
          )}
        </View>

        {/* ── Daily Rewards ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Rewards</Text>
          <Pressable
            onPress={dailyClaimed ? undefined : onClaimReward}
            style={[
              styles.rewardCard,
              { backgroundColor: colors.gold + "18", borderColor: colors.gold + "40" },
              dailyClaimed && { opacity: 0.6 },
            ]}
          >
            <View style={[styles.rewardIcon, { backgroundColor: colors.gold + "30" }]}>
              <Feather name="gift" size={24} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rewardTitle, { color: colors.foreground }]}>Daily Login Reward</Text>
              <Text style={[styles.rewardSub, { color: colors.mutedForeground }]}>
                {dailyClaimed ? "Come back tomorrow for 10 more coins" : "Claim 10 coins every day"}
              </Text>
            </View>
            <View style={[styles.claimBtn, { backgroundColor: dailyClaimed ? colors.muted : colors.gold }]}>
              <Text style={styles.claimText}>{dailyClaimed ? "Claimed" : "Claim"}</Text>
            </View>
          </Pressable>
        </View>

        {/* ── Earn Coins ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Earn Coins</Text>
          <View style={styles.earnRow}>
            <Pressable
              onPress={() => router.push("/missions")}
              style={[styles.earnCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "35" }]}
            >
              <View style={[styles.earnIcon, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="target" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.earnTitle, { color: colors.foreground }]}>Missions</Text>
              <Text style={[styles.earnSub, { color: colors.mutedForeground }]}>Up to 8 coins/day free</Text>
              <View style={[styles.earnBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.earnBtnText}>Go →</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => router.push("/referral")}
              style={[styles.earnCard, { backgroundColor: colors.gold + "12", borderColor: colors.gold + "35" }]}
            >
              <View style={[styles.earnIcon, { backgroundColor: colors.gold + "22" }]}>
                <Feather name="user-plus" size={22} color={colors.gold} />
              </View>
              <Text style={[styles.earnTitle, { color: colors.foreground }]}>Refer Friends</Text>
              <Text style={[styles.earnSub, { color: colors.mutedForeground }]}>100 coins per referral</Text>
              <View style={[styles.earnBtn, { backgroundColor: colors.gold }]}>
                <Text style={styles.earnBtnText}>Invite →</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => router.push("/creator-dashboard")}
              style={[styles.earnCard, { backgroundColor: "#22C55E12", borderColor: "#22C55E35" }]}
            >
              <View style={[styles.earnIcon, { backgroundColor: "#22C55E22" }]}>
                <Feather name="radio" size={22} color="#22C55E" />
              </View>
              <Text style={[styles.earnTitle, { color: colors.foreground }]}>Go Live</Text>
              <Text style={[styles.earnSub, { color: colors.mutedForeground }]}>Earn gifts from fans</Text>
              <View style={[styles.earnBtn, { backgroundColor: "#22C55E" }]}>
                <Text style={styles.earnBtnText}>Stream →</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ── Spend Coins ── */}
        <View style={styles.section}>
          <View style={styles.spendHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ways to Spend</Text>
            <View style={[styles.rateChip, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "35" }]}>
              <Image source={COIN_IMAGE} style={{ width: 13, height: 13 }} resizeMode="contain" />
              <Text style={[styles.rateChipText, { color: colors.primary }]}>1 Coin = ₹1.00</Text>
            </View>
          </View>
          <View style={styles.spendGrid}>
            {SPEND_CATEGORIES.map((sc) => (
              <Pressable
                key={sc.id}
                onPress={() => router.push(sc.route as any)}
                style={[styles.spendCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.spendIcon, { backgroundColor: sc.color + "18" }]}>
                  <Feather name={sc.icon as any} size={18} color={sc.color} />
                </View>
                <Text style={[styles.spendLabel, { color: colors.foreground }]}>{sc.label}</Text>
                <Text style={[styles.spendCost, { color: sc.color }]}>{sc.cost}</Text>
                <Text style={[styles.spendDesc, { color: colors.mutedForeground }]} numberOfLines={1}>{sc.desc}</Text>
              </Pressable>
            ))}
          </View>
          {/* Gift shop banner */}
          <Pressable
            onPress={() => router.push("/coin-store")}
            style={[styles.giftBanner, { backgroundColor: colors.secondary + "12", borderColor: colors.secondary + "35" }]}
          >
            <Text style={{ fontSize: 28 }}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.giftBannerTitle, { color: colors.foreground }]}>Gift Shop</Text>
              <Text style={[styles.giftBannerSub, { color: colors.mutedForeground }]}>Send gifts to creators • 5–10,000 coins • 70% goes to creator</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.secondary} />
          </Pressable>
        </View>

        {/* ── Recharge Coins ── */}
        <View
          style={styles.section}
          onLayout={(e) => { rechargeSectionY.current = e.nativeEvent.layout.y; }}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recharge Coins</Text>
          <View style={styles.packGrid}>
            {COIN_PACKAGES.map((pack) => (
              <Pressable
                key={pack.id}
                onPress={() => onRecharge(pack)}
                style={[
                  styles.packCard,
                  { backgroundColor: pack.popular ? colors.primary : colors.card, borderColor: pack.popular ? colors.primary : colors.border },
                ]}
              >
                {pack.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: colors.gold }]}>
                    <Text style={styles.popularText}>⭐ Best Value</Text>
                  </View>
                )}
                <Image source={COIN_IMAGE} style={{ width: 26, height: 26 }} resizeMode="contain" />
                <Text style={[styles.packCoins, { color: pack.popular ? "#fff" : colors.foreground }]}>
                  {pack.coins.toLocaleString()}
                </Text>
                {(pack as any).bonus > 0 && (
                  <View style={[styles.bonusBadge, { backgroundColor: pack.popular ? "rgba(255,255,255,0.25)" : colors.success + "20" }]}>
                    <Text style={[styles.bonusText, { color: pack.popular ? "#fff" : colors.success }]}>
                      +{(pack as any).bonus} bonus
                    </Text>
                  </View>
                )}
                <Text style={[styles.packLabel, { color: pack.popular ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                  {pack.label}
                </Text>
                <View style={[styles.packPrice, { backgroundColor: pack.popular ? "rgba(255,255,255,0.2)" : colors.muted }]}>
                  <Text style={[styles.packPriceText, { color: pack.popular ? "#fff" : colors.foreground }]}>
                    ₹{pack.price.toLocaleString()}
                  </Text>
                </View>
                {(pack as any).perCoin && (
                  <Text style={[styles.perCoinText, { color: pack.popular ? "rgba(255,255,255,0.65)" : colors.mutedForeground }]}>
                    {(pack as any).perCoin}/coin
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Pay Via ── */}
        <View style={styles.section}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {Platform.OS === "ios" ? "Apple In-App Purchase" : "Pay Via"}
            </Text>
            {Platform.OS === "ios" && isIapAvailable() && (
              <Pressable onPress={async () => {
                const result = await restorePurchases();
                Alert.alert(
                  result.success ? "Restored ✓" : "Restore Failed",
                  result.success ? "Your previous purchases have been restored." : (result.error || "Could not restore purchases."),
                );
              }}>
                <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium", fontSize: 13 }}>Restore Purchases</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.paymentRow}>
            {Platform.OS === "ios" ? [
              { label: "App Store", icon: "smartphone", color: "#007AFF" },
            ].map((pm) => (
              <Pressable
                key={pm.label}
                style={[styles.paymentMethod, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Feather name={pm.icon as any} size={18} color={pm.color} />
                <Text style={[styles.paymentLabel, { color: colors.foreground }]}>{pm.label}</Text>
              </Pressable>
            )) : [
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
              <Text style={[styles.vipSub, { color: colors.mutedForeground }]}>Get 3 coins/day + exclusive perks</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* ── Transaction History ── */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Transaction History</Text>
          {COIN_TRANSACTIONS.map((tx) => (
            <View key={tx.id} style={[styles.txItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === "credit" ? colors.success + "18" : colors.destructive + "18" }]}>
                <Feather
                  name={tx.type === "credit" ? "arrow-down-left" : "arrow-up-right"}
                  size={16}
                  color={tx.type === "credit" ? colors.success : colors.destructive}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.txDesc, { color: colors.foreground }]} numberOfLines={1}>{tx.desc}</Text>
                <Text style={[styles.txTime, { color: colors.mutedForeground }]}>{tx.time}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === "credit" ? colors.success : colors.destructive }]}>
                {tx.type === "credit" ? "+" : "-"}{tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Coin Fountain Overlay ── */}
      <CoinFountainOverlay toasts={toasts} onRemove={remove} />

      <PaymentSheet
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={() => { handlePaySuccess(); setShowPayment(false); }}
        amount={pendingPack ? parseInt(String(pendingPack.price).replace(/[^0-9]/g, "")) : 0}
        label={pendingPack ? pendingPack.label : ""}
        sublabel={pendingPack ? `${pendingPack.coins}${(pendingPack as any).bonus ? ` + ${(pendingPack as any).bonus} bonus` : ""} coins` : ""}
        noGst={true}
        sku={pendingPack?.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: { flex: 1 },
  walletCard: { paddingHorizontal: 20, paddingBottom: 30 },
  walletHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backBtn: { padding: 4 },
  walletTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  coinEmoji: { width: 56, height: 56, marginBottom: 4 },
  balanceSection: { alignItems: "center", gap: 4, marginBottom: 24 },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular" },
  balance: { color: "#fff", fontSize: 56, fontFamily: "Inter_700Bold", letterSpacing: -2 },
  balanceSub: { color: "rgba(255,255,255,0.7)", fontSize: 16, fontFamily: "Inter_400Regular" },
  quickStats: { flexDirection: "row", justifyContent: "space-around" },
  quickStat: { alignItems: "center", gap: 4 },
  quickStatValue: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  quickStatLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { paddingHorizontal: 16, paddingTop: 22, gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 2 },
  // Live feed
  liveSectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  liveTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pulseDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#22C55E" },
  liveRoleRow: { flexDirection: "row", gap: 6 },
  roleChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  roleChipText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  liveEmpty: { padding: 24, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 8 },
  liveEmptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  liveTxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  liveTxIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  liveTxLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  liveTxSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  liveTxAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  liveTxMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  liveRoleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  liveRoleText: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
  liveTxTime: { fontSize: 9, fontFamily: "Inter_400Regular" },
  // Reward
  rewardCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  rewardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rewardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  rewardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  claimBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  claimText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  // Recharge packs
  packGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  packCard: { width: (width - 52) / 2, padding: 16, borderRadius: 18, borderWidth: 1.5, alignItems: "center", gap: 6, position: "relative", overflow: "hidden" },
  popularBadge: { position: "absolute", top: 0, right: 0, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 12 },
  popularText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  packCoins: { fontSize: 26, fontFamily: "Inter_700Bold" },
  bonusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bonusText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  perCoinText: { fontSize: 9, fontFamily: "Inter_400Regular", marginTop: -2 },
  packLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  packPrice: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginTop: 4 },
  packPriceText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  // History
  txItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txDesc: { fontSize: 14, fontFamily: "Inter_500Medium" },
  txTime: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  txAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  // Payments
  paymentRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  paymentMethod: { alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, minWidth: 64 },
  paymentLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  vipBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 4 },
  vipTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  vipSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  earnRow: { flexDirection: "row", gap: 10 },
  earnCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 6 },
  earnIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  earnTitle: { fontSize: 12, fontFamily: "Inter_700Bold", textAlign: "center" },
  earnSub: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  earnBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 2 },
  earnBtnText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  spendHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  rateChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  rateChipText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  spendGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  spendCard: { width: (width - 52) / 2, padding: 13, borderRadius: 16, borderWidth: 1, gap: 5 },
  spendIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  spendLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  spendCost: { fontSize: 12, fontFamily: "Inter_700Bold" },
  spendDesc: { fontSize: 10, fontFamily: "Inter_400Regular" },
  giftBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginTop: 4 },
  giftBannerTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  giftBannerSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  quickActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  qaBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 11, borderRadius: 14 },
  qaBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
});

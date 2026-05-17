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

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    color: "#888",
    gradient: ["#555", "#333"] as const,
    features: [
      "Basic profile",
      "20 coins/day",
      "Standard feed",
      "Basic chat",
      "5 stories/day",
    ],
    missing: [
      "No audio/video calls",
      "No VIP badge",
      "No exclusive content",
      "Limited communities",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: "₹99",
    period: "/month",
    color: "#A0A0A0",
    gradient: ["#9E9E9E", "#616161"] as const,
    popular: false,
    features: [
      "50 coins/day",
      "5 random calls/day",
      "Silver VIP badge",
      "Priority feed",
      "Unlimited stories",
      "20 communities",
      "Chat translations",
    ],
    missing: [
      "No video calls",
      "Limited gifts",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: "₹249",
    period: "/month",
    color: "#FFB800",
    gradient: ["#FFB800", "#FF8F00"] as const,
    popular: true,
    features: [
      "150 coins/day",
      "Unlimited random calls",
      "Gold VIP badge",
      "AI feed recommendations",
      "Unlimited stories",
      "Unlimited communities",
      "AI captions & translations",
      "Creator fund access",
      "Priority support",
    ],
    missing: [],
  },
  {
    id: "vip",
    name: "VIP Diamond",
    price: "₹599",
    period: "/month",
    color: "#7B2FBE",
    gradient: ["#E91E8C", "#7B2FBE"] as const,
    features: [
      "500 coins/day",
      "Unlimited everything",
      "Diamond VIP badge",
      "Exclusive VIP content",
      "Featured creator status",
      "Advanced analytics",
      "Custom profile effects",
      "Dedicated account manager",
      "Early feature access",
      "Ad-free experience",
    ],
    missing: [],
  },
];

const FAN_TIERS = [
  {
    id: "supporter",
    name: "Supporter",
    price: "₹49/month",
    color: "#34C759",
    icon: "heart",
    perks: ["Exclusive badge", "Creator posts access", "Monthly shoutout"],
  },
  {
    id: "superfan",
    name: "Super Fan",
    price: "₹149/month",
    color: "#FF9500",
    icon: "star",
    perks: ["All Supporter perks", "Direct message creator", "Exclusive live access", "Monthly coin rewards"],
  },
  {
    id: "vipfan",
    name: "VIP Fan",
    price: "₹399/month",
    color: "#E91E8C",
    icon: "award",
    perks: ["All Super Fan perks", "1:1 video call/month", "Custom fan badge", "Featured in creator posts"],
  },
];

export default function SubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState<"plans" | "fan">("plans");
  const [selectedPlan, setSelectedPlan] = useState("free");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.topGrad, { paddingTop: topPad + 10 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Premium & Subscriptions</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSub}>Unlock the full Ridhi experience</Text>

        <View style={[styles.sectionTabs, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Pressable
            onPress={() => setActiveSection("plans")}
            style={[styles.sectionTab, activeSection === "plans" && styles.sectionTabActive]}
          >
            <Text style={[styles.sectionTabText, activeSection === "plans" && styles.sectionTabTextActive]}>
              VIP Plans
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveSection("fan")}
            style={[styles.sectionTab, activeSection === "fan" && styles.sectionTabActive]}
          >
            <Text style={[styles.sectionTabText, activeSection === "fan" && styles.sectionTabTextActive]}>
              Fan Memberships
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeSection === "plans" ? (
          <View style={styles.plansSection}>
            {PLANS.map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: selectedPlan === plan.id ? plan.color : colors.border,
                    borderWidth: selectedPlan === plan.id ? 2 : 1,
                  },
                ]}
              >
                {plan.popular && (
                  <LinearGradient
                    colors={[plan.gradient[0], plan.gradient[1]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.popularBadge}
                  >
                    <Text style={styles.popularText}>⭐ Most Popular</Text>
                  </LinearGradient>
                )}

                <View style={styles.planHeader}>
                  <LinearGradient
                    colors={[plan.gradient[0], plan.gradient[1]]}
                    style={styles.planIconCircle}
                  >
                    <Feather name="award" size={20} color="#fff" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                      <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>{plan.period}</Text>
                    </View>
                  </View>
                  {selectedPlan === plan.id && (
                    <View style={[styles.checkCircle, { backgroundColor: plan.color }]}>
                      <Feather name="check" size={14} color="#fff" />
                    </View>
                  )}
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <Feather name="check-circle" size={14} color="#34C759" />
                      <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
                    </View>
                  ))}
                  {plan.missing.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <Feather name="x-circle" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f}</Text>
                    </View>
                  ))}
                </View>

                {plan.id !== "free" && (
                  <LinearGradient
                    colors={[plan.gradient[0], plan.gradient[1]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.subscribeBtn}
                  >
                    <Text style={styles.subscribeBtnText}>
                      {selectedPlan === plan.id ? "Current Plan" : `Subscribe — ${plan.price}${plan.period}`}
                    </Text>
                  </LinearGradient>
                )}
              </Pressable>
            ))}

            <View style={[styles.paymentInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.paymentTitle, { color: colors.foreground }]}>Payment Methods</Text>
              <View style={styles.paymentMethods}>
                {[
                  { label: "UPI", icon: "smartphone", color: "#00BCD4" },
                  { label: "Razorpay", icon: "credit-card", color: "#2962FF" },
                  { label: "Google Pay", icon: "globe", color: "#34A853" },
                  { label: "PhonePe", icon: "zap", color: "#5F259F" },
                  { label: "Paytm", icon: "shopping-bag", color: "#00BAF2" },
                ].map((pm) => (
                  <View key={pm.label} style={[styles.paymentMethod, { backgroundColor: colors.muted }]}>
                    <Feather name={pm.icon as any} size={16} color={pm.color} />
                    <Text style={[styles.paymentMethodLabel, { color: colors.foreground }]}>{pm.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.fanSection}>
            <Text style={[styles.fanDesc, { color: colors.mutedForeground }]}>
              Become a fan member of your favourite creators and unlock exclusive content, perks and direct access.
            </Text>
            {FAN_TIERS.map((tier) => (
              <View
                key={tier.id}
                style={[styles.fanCard, { backgroundColor: colors.card, borderColor: tier.color + "50" }]}
              >
                <LinearGradient
                  colors={[tier.color + "20", "transparent"]}
                  style={styles.fanCardGrad}
                />
                <View style={styles.fanCardHeader}>
                  <View style={[styles.fanIconCircle, { backgroundColor: tier.color + "20" }]}>
                    <Feather name={tier.icon as any} size={22} color={tier.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fanName, { color: colors.foreground }]}>{tier.name}</Text>
                    <Text style={[styles.fanPrice, { color: tier.color }]}>{tier.price}</Text>
                  </View>
                  <Pressable style={[styles.joinBtn, { backgroundColor: tier.color }]}>
                    <Text style={styles.joinBtnText}>Join</Text>
                  </Pressable>
                </View>
                <View style={styles.fanPerks}>
                  {tier.perks.map((p) => (
                    <View key={p} style={styles.perkRow}>
                      <Feather name="check" size={13} color={tier.color} />
                      <Text style={[styles.perkText, { color: colors.foreground }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <View style={[styles.creatorCTA, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Feather name="zap" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Are you a Creator?</Text>
                <Text style={[styles.ctaSub, { color: colors.mutedForeground }]}>
                  Set up your own fan membership tiers and earn from your fans
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/creator-dashboard")}
                style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.ctaBtnText}>Set Up</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGrad: { paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", marginBottom: 14 },
  sectionTabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 3,
  },
  sectionTab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  sectionTabActive: { backgroundColor: "rgba(255,255,255,0.9)" },
  sectionTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.75)" },
  sectionTabTextActive: { color: "#7B2FBE" },
  plansSection: { padding: 16, gap: 14 },
  planCard: { borderRadius: 18, overflow: "hidden" },
  popularBadge: { paddingVertical: 6, paddingHorizontal: 16 },
  popularText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 8 },
  planIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  planName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  planPrice: { fontSize: 22, fontFamily: "Inter_700Bold" },
  planPeriod: { fontSize: 13, fontFamily: "Inter_400Regular" },
  checkCircle: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featuresList: { paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  subscribeBtn: { margin: 12, marginTop: 4, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  subscribeBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  paymentInfo: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  paymentTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  paymentMethods: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  paymentMethod: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  paymentMethodLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  fanSection: { padding: 16, gap: 14 },
  fanDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  fanCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  fanCardGrad: { position: "absolute", top: 0, left: 0, right: 0, height: 60 },
  fanCardHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 10 },
  fanIconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  fanName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  fanPrice: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  joinBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  joinBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  fanPerks: { paddingHorizontal: 16, paddingBottom: 14, gap: 6 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  creatorCTA: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  ctaTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  ctaSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  ctaBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  ctaBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
});

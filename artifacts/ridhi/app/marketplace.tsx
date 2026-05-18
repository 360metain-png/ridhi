import React, { useState } from "react";
import {
  Dimensions, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

// ── Types ──────────────────────────────────────────────────────────────────────
type Category =
  | "all" | "electronics" | "fashion" | "books" | "home"
  | "beauty" | "sports" | "food" | "services" | "vehicles" | "toys";

export interface Product {
  id: string;
  title: string;
  price: number;
  negotiable: boolean;
  category: Category;
  condition: "New" | "Like New" | "Good" | "Fair";
  city: string;
  seller: string;
  sellerAvatar: string;
  description: string;
  emoji: string;
  postedAgo: string;
  views: number;
}

// ── Mock products ──────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  { id: "m1",  title: "iPhone 12 Pro 256GB",         price: 45000, negotiable: true,  category: "electronics", condition: "Good",     city: "Mumbai",    seller: "Rahul Kumar",  sellerAvatar: "RK", description: "iPhone 12 Pro in Pacific Blue. Battery health 87%. All accessories included. No scratches on screen.", emoji: "📱", postedAgo: "2h ago",  views: 128 },
  { id: "m2",  title: "Bridal Lehenga Choli",         price: 3500,  negotiable: true,  category: "fashion",     condition: "Like New", city: "Delhi",     seller: "Priya Sharma", sellerAvatar: "PS", description: "Beautiful red lehenga with heavy embroidery. Worn once for wedding. Size M. Dry cleaned.", emoji: "👗", postedAgo: "5h ago",  views: 84 },
  { id: "m3",  title: "Python Crash Course Book",     price: 399,   negotiable: false, category: "books",       condition: "Good",     city: "Bangalore", seller: "Dev Raj",      sellerAvatar: "DR", description: "2nd edition, Eric Matthes. Minimal highlighting. Great for beginners.", emoji: "📚", postedAgo: "1d ago",  views: 42 },
  { id: "m4",  title: "5-Seater Sofa Set",            price: 12000, negotiable: true,  category: "home",        condition: "Good",     city: "Chennai",   seller: "Kavya K.",     sellerAvatar: "KK", description: "L-shaped sofa, fabric material, brown color. 2 years old. Self-pickup only.", emoji: "🛋️", postedAgo: "2d ago",  views: 211 },
  { id: "m5",  title: "MAC Makeup Kit (Full Set)",    price: 1800,  negotiable: false, category: "beauty",      condition: "New",      city: "Pune",      seller: "Ananya M.",    sellerAvatar: "AM", description: "Imported MAC kit, unopened. Includes foundation, eyeshadow palette, lipstick, brushes.", emoji: "💄", postedAgo: "3h ago",  views: 97 },
  { id: "m6",  title: "SG Cricket Bat + Pads",        price: 2200,  negotiable: true,  category: "sports",      condition: "Like New", city: "Hyderabad", seller: "Rohan Singh",  sellerAvatar: "RS", description: "SG Strokemaster bat, 2.8 lbs. Pads barely used. Good for amateur play.", emoji: "🏏", postedAgo: "6h ago",  views: 55 },
  { id: "m7",  title: "Homemade Biryani (1 kg)",      price: 280,   negotiable: false, category: "food",        condition: "New",      city: "Mumbai",    seller: "Fatima B.",    sellerAvatar: "FB", description: "Authentic Hyderabadi dum biryani. Fresh made to order. Delivery within 5 km.", emoji: "🍛", postedAgo: "30m ago", views: 33 },
  { id: "m8",  title: "Web Design Service",           price: 5000,  negotiable: true,  category: "services",    condition: "New",      city: "Remote",    seller: "Aditya Shah",  sellerAvatar: "AS", description: "Complete website design + development. Responsive, fast. Portfolio available. 7-day delivery.", emoji: "💻", postedAgo: "1d ago",  views: 156 },
  { id: "m9",  title: "Honda Activa 6G (2022)",       price: 72000, negotiable: true,  category: "vehicles",    condition: "Good",     city: "Delhi",     seller: "Vikram S.",    sellerAvatar: "VS", description: "Single owner, 18K km driven. Insurance valid till 2025. All docs clear. Serviced.", emoji: "🛵", postedAgo: "4h ago",  views: 302 },
  { id: "m10", title: "LEGO Technic Set 42128",       price: 2999,  negotiable: false, category: "toys",        condition: "New",      city: "Kolkata",   seller: "Sneha Joshi",  sellerAvatar: "SJ", description: "Brand new sealed box. Heavy Duty Tow Truck set. Age 10+. Perfect gift.", emoji: "🧩", postedAgo: "8h ago",  views: 71 },
  { id: "m11", title: "Samsung 43\" Smart TV",        price: 22000, negotiable: true,  category: "electronics", condition: "Good",     city: "Bangalore", seller: "Rahul Kumar",  sellerAvatar: "RK", description: "Samsung Crystal UHD 4K. 2 years old, works perfectly. Remote and stand included.", emoji: "📺", postedAgo: "12h ago", views: 189 },
  { id: "m12", title: "Yoga Mat + Resistance Bands",  price: 650,   negotiable: false, category: "sports",      condition: "Like New", city: "Pune",      seller: "Ananya M.",    sellerAvatar: "AM", description: "Premium anti-slip yoga mat (6mm) + set of 5 resistance bands. Used 3 times.", emoji: "🧘", postedAgo: "2d ago",  views: 44 },
];

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "all",         label: "All",         emoji: "🛍️" },
  { key: "electronics", label: "Electronics", emoji: "📱" },
  { key: "fashion",     label: "Fashion",     emoji: "👗" },
  { key: "books",       label: "Books",       emoji: "📚" },
  { key: "home",        label: "Home",        emoji: "🛋️" },
  { key: "beauty",      label: "Beauty",      emoji: "💄" },
  { key: "sports",      label: "Sports",      emoji: "🏏" },
  { key: "food",        label: "Food",        emoji: "🍛" },
  { key: "services",    label: "Services",    emoji: "💻" },
  { key: "vehicles",    label: "Vehicles",    emoji: "🛵" },
  { key: "toys",        label: "Toys",        emoji: "🧩" },
];

const COND_COLOR: Record<string, string> = {
  "New":      "#34C759",
  "Like New": "#2196F3",
  "Good":     "#FFB800",
  "Fair":     "#FF6B35",
};

export default function MarketplaceScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const [cat,    setCat]    = useState<Category>("all");
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter(p =>
    (cat === "all" || p.category === cat) &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Ridhi Marketplace</Text>
            <Text style={styles.headerSub}>Buy & Sell · Secure Payments</Text>
          </View>
          <Pressable
            onPress={() => router.push("/marketplace-sell" as any)}
            style={styles.sellBtn}
          >
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.sellBtnText}>Sell</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="search" size={16} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, services, city…"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color="rgba(255,255,255,0.8)" />
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.catScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map((c) => {
          const active = cat === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setCat(c.key)}
              style={[styles.catChip, {
                backgroundColor: active ? colors.primary : colors.muted,
                borderColor: active ? colors.primary : colors.border,
              }]}
            >
              <Text style={styles.catEmoji}>{c.emoji}</Text>
              <Text style={[styles.catLabel, { color: active ? "#fff" : colors.foreground }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.statsText, { color: colors.mutedForeground }]}>
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
          {cat !== "all" ? ` · ${CATEGORIES.find(c => c.key === cat)?.label}` : ""}
        </Text>
        <View style={[styles.commBadge, { backgroundColor: "#34C75920", borderColor: "#34C75940" }]}>
          <Feather name="shield" size={11} color="#34C759" />
          <Text style={[styles.commText, { color: "#34C759" }]}>Ridhi Buyer Protection</Text>
        </View>
      </View>

      {/* Product grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No listings found</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Be the first to sell in this category!</Text>
            <Pressable
              onPress={() => router.push("/marketplace-sell" as any)}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.emptyBtnText}>List a Product</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.row}>
            {filtered.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push({ pathname: "/marketplace-product", params: { id: p.id } } as any)}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, width: CARD_W }]}
              >
                {/* Photo placeholder */}
                <View style={[styles.cardImg, { backgroundColor: colors.muted }]}>
                  <Text style={styles.cardEmoji}>{p.emoji}</Text>
                  <View style={[styles.condBadge, { backgroundColor: COND_COLOR[p.condition] + "20", borderColor: COND_COLOR[p.condition] + "60" }]}>
                    <Text style={[styles.condText, { color: COND_COLOR[p.condition] }]}>{p.condition}</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>{p.title}</Text>
                  <Text style={[styles.cardPrice, { color: colors.primary }]}>
                    ₹{p.price.toLocaleString()}
                    {p.negotiable && <Text style={[styles.nego, { color: colors.mutedForeground }]}> · Nego</Text>}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Feather name="map-pin" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>{p.city}</Text>
                    <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>· {p.postedAgo}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Sell CTA */}
        <Pressable
          onPress={() => router.push("/marketplace-sell" as any)}
          style={styles.sellCTA}
        >
          <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sellCTAGrad}>
            <Feather name="tag" size={20} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.sellCTATitle}>Have something to sell?</Text>
              <Text style={styles.sellCTASub}>List for free · Get paid via Ridhi Wallet</Text>
            </View>
            <Feather name="arrow-right" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  headerRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn:      { padding: 6 },
  headerTitle:  { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  headerSub:    { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_400Regular" },
  sellBtn:      { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  sellBtnText:  { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  searchRow:    { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput:  { flex: 1, color: "#fff", fontSize: 14, fontFamily: "Inter_400Regular" },
  catScroll:    { borderBottomWidth: StyleSheet.hairlineWidth, flexGrow: 0 },
  catContent:   { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: "row" },
  catChip:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catEmoji:     { fontSize: 14 },
  catLabel:     { fontSize: 12, fontFamily: "Inter_500Medium" },
  statsBar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  statsText:    { fontSize: 12, fontFamily: "Inter_400Regular" },
  commBadge:    { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  commText:     { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  grid:         { padding: 12, paddingBottom: 80, gap: 16 },
  row:          { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card:         { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardImg:      { width: "100%", height: 140, alignItems: "center", justifyContent: "center" },
  cardEmoji:    { fontSize: 56 },
  condBadge:    { position: "absolute", top: 8, right: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  condText:     { fontSize: 9, fontFamily: "Inter_700Bold" },
  cardBody:     { padding: 10, gap: 4 },
  cardTitle:    { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 17 },
  cardPrice:    { fontSize: 15, fontFamily: "Inter_700Bold" },
  nego:         { fontSize: 11, fontFamily: "Inter_400Regular" },
  cardMeta:     { flexDirection: "row", alignItems: "center", gap: 3 },
  cardMetaText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  empty:        { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyEmoji:   { fontSize: 56 },
  emptyTitle:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub:     { fontSize: 13, fontFamily: "Inter_400Regular" },
  emptyBtn:     { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 4 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  sellCTA:      { marginTop: 8 },
  sellCTAGrad:  { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, padding: 16 },
  sellCTATitle: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  sellCTASub:   { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});

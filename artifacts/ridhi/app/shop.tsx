import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PRODUCTS } from "@/data/mockData";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const CART_KEY = "ridhi_cart";

const CATEGORIES = ["All", "Fashion", "Beauty", "Electronics", "Home"];

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
    } catch { setCartCount(0); }
  }, []);

  useEffect(() => {
    loadCartCount();
    const interval = setInterval(loadCartCount, 2000);
    return () => clearInterval(interval);
  }, [loadCartCount]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                           p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => (
    <Pressable
      style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={[styles.categoryTag, { color: colors.primary }]}>{item.category}</Text>
        <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.foreground }]}>{item.price} Coins</Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={10} color="#FFD700" />
            <Text style={[styles.rating, { color: colors.mutedForeground }]}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <Pressable 
        style={[styles.buyBtn, { backgroundColor: colors.primary }]}
        onPress={() => router.push({ pathname: "/product-detail", params: { id: item.id } })}
      >
        <Text style={styles.buyBtnText}>View Details</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ridhi Shop</Text>
        <Pressable onPress={() => router.push("/cart")} style={styles.cartBtn}>
          <Feather name="shopping-cart" size={22} color={colors.foreground} />
          {cartCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.secondary }]}>
              <Text style={styles.cartBadgeText}>{cartCount > 99 ? "99+" : cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryBtn,
                { backgroundColor: selectedCategory === cat ? colors.primary : colors.muted },
              ]}
            >
              <Text style={[styles.categoryText, { color: selectedCategory === cat ? "#fff" : colors.foreground }]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No products found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 15, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  cartBtn: { padding: 4, position: "relative" },
  cartBadge: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  cartBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  searchContainer: { padding: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 44, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, height: "100%", fontSize: 15, fontFamily: "Inter_400Regular" },
  categoryContainer: { marginBottom: 8 },
  categoryScroll: { paddingHorizontal: 16, gap: 10 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  categoryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  listContainer: { padding: 8 },
  productCard: { flex: 1, margin: 8, borderRadius: 16, borderWidth: 1, overflow: "hidden", paddingBottom: 12 },
  productImage: { width: "100%", aspectRatio: 1, backgroundColor: "#eee" },
  productInfo: { padding: 10, flex: 1 },
  categoryTag: { fontSize: 10, fontFamily: "Inter_700Bold", marginBottom: 4, textTransform: "uppercase" },
  productName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: 15, fontFamily: "Inter_700Bold" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontSize: 12, fontFamily: "Inter_500Medium" },
  buyBtn: { marginHorizontal: 10, marginTop: 8, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  buyBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium" },
});

import React, { useState, useEffect } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PRODUCTS } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CART_KEY = "ridhi_cart";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, deductCoins } = useAuth();

  const product = PRODUCTS.find((p) => p.id === id);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    checkWishlist();
    checkCart();
    setSelectedSize(product?.sizes?.[0]);
    setSelectedColor(product?.colors?.[0]);
  }, [id]);

  const checkWishlist = async () => {
    try {
      const raw = await AsyncStorage.getItem("ridhi_wishlist");
      const wishlist = raw ? JSON.parse(raw) : [];
      setIsWishlisted(wishlist.includes(id));
    } catch (e) {}
  };

  const checkCart = async () => {
    try {
      const raw = await AsyncStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      setInCart(cart.some((item: any) => item.id === id));
    } catch { setInCart(false); }
  };

  const toggleCart = async () => {
    try {
      const raw = await AsyncStorage.getItem(CART_KEY);
      let cart: any[] = raw ? JSON.parse(raw) : [];
      if (inCart) {
        cart = cart.filter((item: any) => item.id !== id);
      } else {
        cart.push({ id, quantity: 1, addedAt: new Date().toISOString() });
      }
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
      setInCart(!inCart);
    } catch {}
  };

  const toggleWishlist = async () => {
    try {
      const raw = await AsyncStorage.getItem("ridhi_wishlist");
      let wishlist = raw ? JSON.parse(raw) : [];
      if (isWishlisted) {
        wishlist = wishlist.filter((item: string) => item !== id);
      } else {
        wishlist.push(id);
      }
      await AsyncStorage.setItem("ridhi_wishlist", JSON.stringify(wishlist));
      setIsWishlisted(!isWishlisted);
    } catch (e) {}
  };

  const handleBuy = async () => {
    if (!product) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.coins < product.price) {
      Alert.alert("Insufficient Coins", "You don't have enough coins to buy this product.", [
        { text: "Earn Coins", onPress: () => router.push("/missions") },
        { text: "Buy Coins", onPress: () => router.push("/wallet") },
        { text: "Cancel", style: "cancel" }
      ]);
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Are you sure you want to buy ${product.name} for ${product.price} Coins?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy Now",
          onPress: async () => {
            setLoading(true);
            const success = await deductCoins(product.price, false);
            setLoading(false);
            if (success) {
              Alert.alert("Purchase Successful! 🎉", "Your order has been placed. You will receive a notification shortly.", [
                { text: "Awesome!", onPress: () => router.back() }
              ]);
            } else {
              Alert.alert("Error", "Something went wrong. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.foreground }}>Product not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const relatedProducts = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.mainImage} resizeMode="cover" />
          <View style={[styles.headerActions, { top: insets.top + 10 }]}>
            <Pressable onPress={() => router.back()} style={[styles.circleBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={toggleCart} style={[styles.circleBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
                <Feather name="shopping-cart" size={22} color={inCart ? "#FF9500" : "#fff"} />
              </Pressable>
              <Pressable onPress={toggleWishlist} style={[styles.circleBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
                <Feather name="heart" size={22} color={isWishlisted ? "#FF3B30" : "#fff"} fill={isWishlisted ? "#FF3B30" : "transparent"} />
              </Pressable>
              <Pressable style={[styles.circleBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]} onPress={() => Alert.alert("Share", "Share this product with friends")}>
                <Feather name="share-2" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Brand + Discount */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {product.brand && (
              <View style={[styles.brandChip, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.brandChipText, { color: colors.primary }]}>{product.brand}</Text>
              </View>
            )}
            {(product.discount ?? 0) > 0 && (
              <View style={[styles.discountChip, { backgroundColor: colors.secondary }]}>
                <Text style={styles.discountChipText}>{product.discount}% OFF</Text>
              </View>
            )}
          </View>

          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.category, { color: colors.primary }]}>{product.category}</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>{product.name}</Text>
            </View>
          </View>

          {/* Price with MRP */}
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <Text style={[styles.priceValue, { color: colors.foreground }]}>{product.price} Coins</Text>
            {(product.mrp ?? 0) > 0 && (
              <Text style={[styles.mrpValue, { color: colors.mutedForeground }]}>
                <Text style={{ textDecorationLine: "line-through" }}>{product.mrp} Coins</Text>
              </Text>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Feather name="star" size={14} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.foreground }]}>{product.rating}</Text>
              <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>({product.reviews} reviews)</Text>
            </View>
            <View style={[styles.stockBadge, {
              backgroundColor: (product.stock ?? 0) <= 0 ? "#FF3B30" + "20" : (product.stock ?? 0) < 10 ? "#FF9500" + "20" : colors.success + "15"
            }]}>
              <Text style={[styles.stockText, {
                color: (product.stock ?? 0) <= 0 ? "#FF3B30" : (product.stock ?? 0) < 10 ? "#FF9500" : (colors.success ?? "#34C759")
              }]}>
                {(product.stock ?? 0) <= 0 ? "Out of Stock" : (product.stock ?? 0) < 10 ? `Low Stock (${product.stock})` : "In Stock"}
              </Text>
            </View>
          </View>

          {/* Size selector */}
          {product.sizes && product.sizes.length > 0 && product.sizes[0] !== "Set" && product.sizes[0] !== "One Size" && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Size</Text>
              <View style={styles.selectorRow}>
                {product.sizes.map((sz) => (
                  <Pressable
                    key={sz}
                    onPress={() => setSelectedSize(sz)}
                    style={[styles.sizeChip, {
                      borderColor: selectedSize === sz ? colors.primary : colors.border,
                      backgroundColor: selectedSize === sz ? colors.primary + "15" : colors.card,
                    }]}
                  >
                    <Text style={[styles.sizeChipText, { color: selectedSize === sz ? colors.primary : colors.foreground }]}>
                      {sz}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Color selector */}
          {product.colors && product.colors.length > 0 && product.colors[0] !== "Amber" && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Color</Text>
              <View style={styles.selectorRow}>
                {product.colors.map((col) => (
                  <Pressable
                    key={col}
                    onPress={() => setSelectedColor(col)}
                    style={[styles.colorChip, {
                      borderColor: selectedColor === col ? colors.primary : colors.border,
                      backgroundColor: selectedColor === col ? colors.primary + "15" : colors.card,
                    }]}
                  >
                    <Text style={[styles.colorChipText, { color: selectedColor === col ? colors.primary : colors.foreground }]}>
                      {col}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {product.description}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 16 }]}>Related Products</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                {relatedProducts.map((p) => (
                  <Pressable
                    key={p.id}
                    style={[styles.relatedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => router.push({ pathname: "/product-detail", params: { id: p.id } })}
                  >
                    <Image source={{ uri: p.image }} style={styles.relatedImage} />
                    <Text style={[styles.relatedName, { color: colors.foreground }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.relatedPrice, { color: colors.primary }]}>{p.price} Coins</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.coinBalance}>
          <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Your Balance</Text>
          <View style={styles.balanceRow}>
            <Image source={require("../assets/images/ridhi_coin.png")} style={styles.coinIcon} />
            <Text style={[styles.balanceValue, { color: colors.foreground }]}>{user?.coins ?? 0}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10, flex: 2 }}>
          <Pressable
            style={[styles.addCartBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "50" }]}
            onPress={toggleCart}
          >
            <Text style={[styles.addCartText, { color: colors.primary }]}>
              {inCart ? "Added" : "+ Cart"}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.buyButton, {
              backgroundColor: (product.stock ?? 0) > 0 ? colors.primary : "#999",
              opacity: (product.stock ?? 0) > 0 ? 1 : 0.6
            }]}
            onPress={handleBuy}
            disabled={loading || (product.stock ?? 0) <= 0}
          >
            <LinearGradient colors={(product.stock ?? 0) > 0 ? [colors.primary, colors.secondary] : ["#999", "#999"]} style={styles.buyGradient}>
              <Text style={styles.buyButtonText}>
                {(product.stock ?? 0) <= 0 ? "Out of Stock" : loading ? "Processing..." : "Buy with Coins"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { width: width, height: width * 1.2, position: "relative" },
  mainImage: { width: "100%", height: "100%" },
  headerActions: { position: "absolute", left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" },
  circleBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  content: { padding: 20 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  category: { fontSize: 12, fontFamily: "Inter_700Bold", textTransform: "uppercase", marginBottom: 4 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  priceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: "#FF9500" },
  priceText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  ratingBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  reviewText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stockText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 10 },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  relatedSection: { marginTop: 10 },
  relatedCard: { width: 140, borderRadius: 12, borderWidth: 1, padding: 8 },
  relatedImage: { width: "100%", aspectRatio: 1, borderRadius: 8, marginBottom: 8 },
  relatedName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  relatedPrice: { fontSize: 12, fontFamily: "Inter_700Bold" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", padding: 16, borderTopWidth: StyleSheet.hairlineWidth, gap: 16 },
  coinBalance: { flex: 1 },
  balanceLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  balanceRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  coinIcon: { width: 16, height: 16 },
  balanceValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  addCartBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  addCartText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  buyButton: { flex: 2, height: 50, borderRadius: 14, overflow: "hidden" },
  buyGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  buyButtonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  brandChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  brandChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  discountChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  discountChipText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  priceValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  mrpValue: { fontSize: 16, fontFamily: "Inter_500Medium" },
  selectorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sizeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  sizeChipText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  colorChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  colorChipText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

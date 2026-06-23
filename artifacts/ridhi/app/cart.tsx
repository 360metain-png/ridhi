import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { PRODUCTS } from "@/data/mockData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

interface CartItem {
  id: string;
  quantity: number;
  addedAt: string;
}

const CART_KEY = "ridhi_cart";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, deductCoins } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CART_KEY);
      setCartItems(raw ? JSON.parse(raw) : []);
    } catch { setCartItems([]); }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useFocusEffect(useCallback(() => {
    loadCart();
  }, [loadCart]));

  const saveCart = async (items: CartItem[]) => {
    setCartItems(items);
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const removeItem = async (productId: string) => {
    const next = cartItems.filter((i) => i.id !== productId);
    await saveCart(next);
  };

  const updateQty = async (productId: string, delta: number) => {
    const next = cartItems.map((i) => {
      if (i.id !== productId) return i;
      const nextQty = Math.max(1, i.quantity + delta);
      return { ...i, quantity: nextQty };
    });
    await saveCart(next);
  };

  const clearCart = async () => {
    await saveCart([]);
  };

  const products = cartItems.map((ci) => {
    const p = PRODUCTS.find((pr) => pr.id === ci.id);
    return p ? { ...p, quantity: ci.quantity } : null;
  }).filter(Boolean) as (typeof PRODUCTS[0] & { quantity: number })[];

  const totalCoins = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleBuyAll = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.coins < totalCoins) {
      Alert.alert(
        "Insufficient Coins",
        `You need ${totalCoins} coins but have ${user.coins}.`,
        [
          { text: "Earn Coins", onPress: () => router.push("/missions") },
          { text: "Buy Coins", onPress: () => router.push("/wallet") },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Buy ${totalItems} item${totalItems > 1 ? "s" : ""} for ${totalCoins} Coins?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy Now",
          onPress: async () => {
            setLoading(true);
            const success = await deductCoins(totalCoins);
            setLoading(false);
            if (success) {
              await clearCart();
              Alert.alert(
                "Order Placed!",
                "Your order has been placed successfully. You'll receive a notification shortly.",
                [{ text: "Awesome!", onPress: () => router.back() }]
              );
            } else {
              Alert.alert("Error", "Something went wrong. Please try again.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: typeof PRODUCTS[0] & { quantity: number } }) => (
    <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.itemCategory, { color: colors.primary }]}>{item.category}</Text>
        <Text style={[styles.itemPrice, { color: colors.foreground }]}>
          {item.price} Coins × {item.quantity}
        </Text>
        <Text style={[styles.itemTotal, { color: colors.primary }]}>
          = {item.price * item.quantity} Coins
        </Text>
      </View>
      <View style={styles.itemActions}>
        <View style={styles.qtyRow}>
          <Pressable style={[styles.qtyBtn, { borderColor: colors.border }]} onPress={() => updateQty(item.id, -1)}>
            <Feather name="minus" size={14} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.qtyText, { color: colors.foreground }]}>{item.quantity}</Text>
          <Pressable style={[styles.qtyBtn, { borderColor: colors.border }]} onPress={() => updateQty(item.id, 1)}>
            <Feather name="plus" size={14} color={colors.foreground} />
          </Pressable>
        </View>
        <Pressable onPress={() => removeItem(item.id)} style={styles.removeBtn}>
          <Feather name="trash-2" size={16} color="#FF3B30" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Shopping Cart</Text>
        {products.length > 0 && (
          <Pressable onPress={clearCart} style={styles.clearBtn}>
            <Text style={[styles.clearText, { color: colors.mutedForeground }]}>Clear</Text>
          </Pressable>
        )}
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="shopping-cart" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Browse the shop and add products you like
          </Text>
          <Pressable
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/shop")}
          >
            <Text style={styles.shopBtnText}>Browse Shop</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total ({totalItems} items)</Text>
              <Text style={[styles.totalValue, { color: colors.foreground }]}>{totalCoins} Coins</Text>
            </View>
            <Pressable onPress={handleBuyAll} disabled={loading} style={styles.buyBtn}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.buyGradient}>
                <Text style={styles.buyBtnText}>
                  {loading ? "Processing..." : `Buy All — ${totalCoins} Coins`}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 15, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  itemCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 16, borderWidth: 1, gap: 12 },
  itemImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#eee" },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  itemCategory: { fontSize: 11, fontFamily: "Inter_700Bold", textTransform: "uppercase", marginBottom: 4 },
  itemPrice: { fontSize: 13, fontFamily: "Inter_400Regular" },
  itemTotal: { fontSize: 14, fontFamily: "Inter_700Bold", marginTop: 2 },
  itemActions: { alignItems: "center", gap: 8 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 14, fontFamily: "Inter_700Bold", minWidth: 20, textAlign: "center" },
  removeBtn: { padding: 4 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 4 },
  shopBtn: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  bottomBar: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, gap: 12 },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  buyBtn: { height: 52, borderRadius: 14, overflow: "hidden" },
  buyGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  buyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});

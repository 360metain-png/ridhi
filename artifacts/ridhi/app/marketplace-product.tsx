import React, { useState } from "react";
import {
  Platform, Pressable, ScrollView, StyleSheet,
  Text, View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PaymentSheet } from "@/components/PaymentSheet";
import { PRODUCTS, type Product } from "./marketplace";

const COND_COLOR: Record<string, string> = {
  "New":      "#34C759",
  "Like New": "#2196F3",
  "Good":     "#FFB800",
  "Fair":     "#FF6B35",
};

export default function MarketplaceProductScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const { id }    = useLocalSearchParams<{ id: string }>();
  const product: Product = PRODUCTS.find(p => p.id === id) ?? PRODUCTS[0];

  const [showPaySheet, setShowPaySheet] = useState(false);
  const [saved,        setSaved]        = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={[styles.topGrad, { paddingTop: topPad + 8 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={[styles.topTitle, { color: "#fff" }]}>Product Details</Text>
          <Pressable onPress={() => setSaved(s => !s)} style={styles.saveBtn}>
            <Feather name={saved ? "heart" : "heart"} size={20} color={saved ? "#FFB800" : "#fff"} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Photo placeholder */}
        <View style={[styles.photoPlaceholder, { backgroundColor: colors.muted }]}>
          <Text style={styles.productEmoji}>{product.emoji}</Text>
          <View style={[styles.condTag, { backgroundColor: COND_COLOR[product.condition] + "25", borderColor: COND_COLOR[product.condition] + "60" }]}>
            <View style={[styles.condDot, { backgroundColor: COND_COLOR[product.condition] }]} />
            <Text style={[styles.condTagText, { color: COND_COLOR[product.condition] }]}>{product.condition}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Price + title */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.productTitle, { color: colors.foreground }]}>{product.title}</Text>
              <View style={styles.metaRow}>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{product.city}</Text>
                <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>·</Text>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{product.postedAgo}</Text>
                <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>·</Text>
                <Feather name="eye" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{product.views} views</Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.price, { color: colors.primary }]}>₹{product.price.toLocaleString()}</Text>
              {product.negotiable && (
                <View style={[styles.negoBadge, { backgroundColor: "#FFB80020", borderColor: "#FFB80050" }]}>
                  <Text style={styles.negoText}>Negotiable</Text>
                </View>
              )}
            </View>
          </View>

          {/* Verified listing badge */}
          <View style={[styles.protectionBadge, { backgroundColor: "#2196F312", borderColor: "#2196F340" }]}>
            <Feather name="check-circle" size={14} color="#2196F3" />
            <Text style={[styles.protectionText, { color: "#2196F3" }]}>Verified Listing · Secure Payment Gateway</Text>
          </View>

          {/* Seller card */}
          <View style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.sellerAvatar, { backgroundColor: colors.primary + "25" }]}>
              <Text style={[styles.sellerAvatarText, { color: colors.primary }]}>{product.sellerAvatar}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sellerName, { color: colors.foreground }]}>{product.seller}</Text>
              <Text style={[styles.sellerSub, { color: colors.mutedForeground }]}>Seller · {product.city}</Text>
            </View>
            <Pressable style={[styles.chatBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
              <Feather name="message-circle" size={14} color={colors.primary} />
              <Text style={[styles.chatBtnText, { color: colors.primary }]}>Chat</Text>
            </Pressable>
          </View>

          {/* Description */}
          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.descLabel, { color: colors.mutedForeground }]}>DESCRIPTION</Text>
            <Text style={[styles.descText, { color: colors.foreground }]}>{product.description}</Text>
          </View>

          {/* Details */}
          <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.descLabel, { color: colors.mutedForeground }]}>DETAILS</Text>
            {[
              { label: "Category",  val: product.category.charAt(0).toUpperCase() + product.category.slice(1) },
              { label: "Condition", val: product.condition },
              { label: "Location",  val: product.city },
              { label: "Listed",    val: product.postedAgo },
            ].map(({ label, val }) => (
              <View key={label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.detailVal, { color: colors.foreground }]}>{val}</Text>
              </View>
            ))}
          </View>

          {/* T&C note */}
          <View style={[styles.commNote, { backgroundColor: colors.muted }]}>
            <Feather name="alert-circle" size={13} color={colors.mutedForeground} />
            <Text style={[styles.commNoteText, { color: colors.mutedForeground }]}>
              Ridhi is a platform to connect buyers and sellers. Ridhi will not and never be responsible for any buying & selling transactions. All transactions are at your own discretion.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Buy Now bar */}
      <View style={[styles.buyBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={[styles.buyBarPrice, { color: colors.primary }]}>₹{product.price.toLocaleString()}</Text>
          {product.negotiable && <Text style={[styles.buyBarNego, { color: colors.mutedForeground }]}>Negotiable</Text>}
        </View>
        <Pressable onPress={() => setShowPaySheet(true)} style={styles.buyNowBtn}>
          <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buyNowBtnGrad}>
            <Feather name="shopping-bag" size={16} color="#fff" />
            <Text style={styles.buyNowText}>Buy Now</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <PaymentSheet
        visible={showPaySheet}
        onClose={() => setShowPaySheet(false)}
        onSuccess={() => { setShowPaySheet(false); router.back(); }}
        amount={product.price}
        label={product.title}
        sublabel={`Seller: ${product.seller}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  topGrad:    { paddingHorizontal: 16, paddingBottom: 14 },
  topBar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn:    { padding: 6 },
  saveBtn:    { padding: 6 },
  topTitle:   { fontSize: 17, fontFamily: "Inter_700Bold" },
  photoPlaceholder: { height: 260, alignItems: "center", justifyContent: "center" },
  productEmoji:     { fontSize: 100 },
  condTag:    { position: "absolute", top: 14, right: 14, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  condDot:    { width: 7, height: 7, borderRadius: 4 },
  condTagText:{ fontSize: 11, fontFamily: "Inter_700Bold" },
  content:    { padding: 16, gap: 14 },
  titleRow:   { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  productTitle:{ fontSize: 18, fontFamily: "Inter_700Bold", flex: 1, lineHeight: 24 },
  metaRow:    { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, flexWrap: "wrap" },
  metaText:   { fontSize: 11, fontFamily: "Inter_400Regular" },
  metaDot:    { fontSize: 11 },
  price:      { fontSize: 22, fontFamily: "Inter_700Bold" },
  negoBadge:  { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1, marginTop: 3 },
  negoText:   { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#FFB800" },
  protectionBadge:{ flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 12, borderWidth: 1, padding: 10 },
  protectionText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sellerCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  sellerAvatar:{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  sellerAvatarText:{ fontSize: 15, fontFamily: "Inter_700Bold" },
  sellerName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  sellerSub:  { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  chatBtn:    { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chatBtnText:{ fontSize: 12, fontFamily: "Inter_600SemiBold" },
  descCard:   { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  descLabel:  { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  descText:   { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  detailsCard:{ borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  detailRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth },
  detailLabel:{ fontSize: 13, fontFamily: "Inter_400Regular" },
  detailVal:  { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  commNote:   { flexDirection: "row", alignItems: "flex-start", gap: 7, borderRadius: 12, padding: 12 },
  commNoteText:{ fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 17 },

  buyBar:     { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  buyBarPrice:{ fontSize: 20, fontFamily: "Inter_700Bold" },
  buyBarNego: { fontSize: 11, fontFamily: "Inter_400Regular" },
  buyNowBtn:  { flex: 1, marginLeft: 16 },
  buyNowBtnGrad:{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  buyNowText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  // Modal
  modalRoot:   { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle:  { fontSize: 17, fontFamily: "Inter_700Bold" },
  modalClose:  { padding: 4 },
  modalScroll: { padding: 16, gap: 14, paddingBottom: 40 },

  orderSummary:    { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  orderSummaryTitle:{ fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  orderItem:       { flexDirection: "row", alignItems: "center", gap: 10 },
  orderEmoji:      { fontSize: 28 },
  orderName:       { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  orderPrice:      { fontSize: 15, fontFamily: "Inter_700Bold" },
  orderDivider:    { height: StyleSheet.hairlineWidth },
  orderRow:        { flexDirection: "row", justifyContent: "space-between" },
  orderRowLabel:   { fontSize: 13, fontFamily: "Inter_400Regular" },
  orderRowVal:     { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  orderTotal:      { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, marginTop: 4 },

  payMethodLabel:  { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, marginBottom: -6 },
  payMethodCard:   { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 13 },
  payMethodIcon:   { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payMethodName:   { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payMethodDesc:   { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  payRadio:        { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  payBtn:          {},
  payBtnGrad:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  payBtnText:      { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  payFooter:       { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17 },

  confirmWrap:     { gap: 14, alignItems: "stretch" },
  confirmBox:      { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center", gap: 8 },
  confirmEmoji:    { fontSize: 48 },
  confirmTitle:    { fontSize: 18, fontFamily: "Inter_700Bold" },
  confirmSub:      { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  confirmAmount:   { fontSize: 28, fontFamily: "Inter_700Bold" },
  confirmBreakdown:{ flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, padding: 12 },
  confirmBreakdownText:{ flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  cancelBtn:       { borderRadius: 12, borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  cancelBtnText:   { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  successWrap:     { gap: 16, alignItems: "center" },
  successIcon:     { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  successTitle:    { fontSize: 22, fontFamily: "Inter_700Bold" },
  successSub:      { fontSize: 14, fontFamily: "Inter_400Regular" },
  receiptCard:     { width: "100%", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  receiptLabel:    { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, padding: 12, paddingBottom: 8 },
  receiptRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  receiptRowLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  receiptRowVal:   { fontSize: 12, fontFamily: "Inter_600SemiBold", flexShrink: 1, textAlign: "right", paddingLeft: 8 },
  sellerCreditNote:{ width: "100%", flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12 },
  sellerCreditText:{ flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 17 },
});

import React, { useState } from "react";
import {
  Modal, Platform, Pressable, ScrollView, StyleSheet,
  Text, View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PRODUCTS, type Product } from "./marketplace";

type PayMethod = "upi" | "card" | "netbanking" | "wallet";

const COND_COLOR: Record<string, string> = {
  "New":      "#34C759",
  "Like New": "#2196F3",
  "Good":     "#FFB800",
  "Fair":     "#FF6B35",
};

const PAY_METHODS: { key: PayMethod; label: string; icon: string; desc: string }[] = [
  { key: "upi",        label: "UPI",            icon: "zap",        desc: "PhonePe, GPay, Paytm" },
  { key: "card",       label: "Credit/Debit Card",icon: "credit-card",desc: "Visa, Mastercard, RuPay" },
  { key: "netbanking", label: "Net Banking",    icon: "globe",      desc: "All major banks" },
  { key: "wallet",     label: "Ridhi Wallet",   icon: "star",       desc: `Balance: ₹2,450` },
];

export default function MarketplaceProductScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const { id }    = useLocalSearchParams<{ id: string }>();
  const product: Product = PRODUCTS.find(p => p.id === id) ?? PRODUCTS[0];

  const [showPayModal,  setShowPayModal]  = useState(false);
  const [payMethod,     setPayMethod]     = useState<PayMethod>("upi");
  const [payStep,       setPayStep]       = useState<"select" | "confirm" | "success">("select");
  const [saved,         setSaved]         = useState(false);

  const GST_RATE    = 0.18;
  const gstAmount   = Math.round(product.price * GST_RATE);
  const totalPayable= product.price + gstAmount;
  const commission  = Math.ceil(product.price * 0.05);
  const sellerGets  = product.price - commission;

  const handlePay = () => {
    if (payStep === "select")  { setPayStep("confirm"); return; }
    if (payStep === "confirm") { setPayStep("success"); return; }
  };

  const closeModal = () => {
    setShowPayModal(false);
    setPayStep("select");
  };

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

          {/* Protection badge */}
          <View style={[styles.protectionBadge, { backgroundColor: "#34C75912", borderColor: "#34C75940" }]}>
            <Feather name="shield" size={14} color="#34C759" />
            <Text style={[styles.protectionText, { color: "#34C759" }]}>Ridhi Buyer Protection · Secure Payment</Text>
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

          {/* Commission note */}
          <View style={[styles.commNote, { backgroundColor: colors.muted }]}>
            <Feather name="info" size={13} color={colors.mutedForeground} />
            <Text style={[styles.commNoteText, { color: colors.mutedForeground }]}>
              Ridhi charges a 5% platform fee on successful sales. The buyer pays ₹{totalPayable.toLocaleString()} (incl. 18% GST). The seller receives ₹{sellerGets.toLocaleString()}.
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
        <Pressable onPress={() => setShowPayModal(true)} style={styles.buyNowBtn}>
          <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buyNowBtnGrad}>
            <Feather name="shopping-bag" size={16} color="#fff" />
            <Text style={styles.buyNowText}>Buy Now</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* ── Payment Modal ── */}
      <Modal visible={showPayModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {payStep === "success" ? "Payment Successful" : "Complete Payment"}
            </Text>
            {payStep !== "success" && (
              <Pressable onPress={closeModal} style={styles.modalClose}>
                <Feather name="x" size={22} color={colors.foreground} />
              </Pressable>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* SELECT method */}
            {payStep === "select" && (
              <>
                {/* Order summary */}
                <View style={[styles.orderSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.orderSummaryTitle, { color: colors.mutedForeground }]}>ORDER SUMMARY</Text>
                  <View style={styles.orderItem}>
                    <Text style={styles.orderEmoji}>{product.emoji}</Text>
                    <Text style={[styles.orderName, { color: colors.foreground }]} numberOfLines={1}>{product.title}</Text>
                    <Text style={[styles.orderPrice, { color: colors.primary }]}>₹{product.price.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.orderRow}>
                    <Text style={[styles.orderRowLabel, { color: colors.mutedForeground }]}>Item price</Text>
                    <Text style={[styles.orderRowVal, { color: colors.foreground }]}>₹{product.price.toLocaleString()}</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text style={[styles.orderRowLabel, { color: "#FF8C42" }]}>GST (18%)</Text>
                    <Text style={[styles.orderRowVal, { color: "#FF8C42" }]}>+₹{gstAmount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text style={[styles.orderRowLabel, { color: colors.mutedForeground }]}>Platform service fee</Text>
                    <Text style={[styles.orderRowVal, { color: colors.foreground }]}>₹0</Text>
                  </View>
                  <View style={[styles.orderRow, styles.orderTotal, { borderTopColor: colors.border }]}>
                    <Text style={[styles.orderRowLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total payable</Text>
                    <Text style={[styles.orderRowVal, { color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 18 }]}>₹{totalPayable.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Payment methods */}
                <Text style={[styles.payMethodLabel, { color: colors.mutedForeground }]}>PAYMENT METHOD</Text>
                {PAY_METHODS.map((m) => {
                  const sel = payMethod === m.key;
                  return (
                    <Pressable
                      key={m.key}
                      onPress={() => setPayMethod(m.key)}
                      style={[styles.payMethodCard, {
                        backgroundColor: sel ? colors.primary + "12" : colors.card,
                        borderColor: sel ? colors.primary : colors.border,
                        borderWidth: sel ? 1.5 : 1,
                      }]}
                    >
                      <View style={[styles.payMethodIcon, { backgroundColor: sel ? colors.primary + "20" : colors.muted }]}>
                        <Feather name={m.icon as any} size={18} color={sel ? colors.primary : colors.mutedForeground} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.payMethodName, { color: colors.foreground }]}>{m.label}</Text>
                        <Text style={[styles.payMethodDesc, { color: colors.mutedForeground }]}>{m.desc}</Text>
                      </View>
                      <View style={[styles.payRadio, { borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primary : "transparent" }]}>
                        {sel && <Feather name="check" size={10} color="#fff" />}
                      </View>
                    </Pressable>
                  );
                })}

                <Pressable onPress={handlePay} style={styles.payBtn}>
                  <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.payBtnGrad}>
                    <Feather name="lock" size={15} color="#fff" />
                    <Text style={styles.payBtnText}>Pay Securely  ₹{totalPayable.toLocaleString()}</Text>
                  </LinearGradient>
                </Pressable>
                <Text style={[styles.payFooter, { color: colors.mutedForeground }]}>
                  🔒 Payments are encrypted and secured by Ridhi. Your card details are never stored.
                </Text>
              </>
            )}

            {/* CONFIRM */}
            {payStep === "confirm" && (
              <View style={styles.confirmWrap}>
                <View style={[styles.confirmBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={styles.confirmEmoji}>{product.emoji}</Text>
                  <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Confirm Payment</Text>
                  <Text style={[styles.confirmSub, { color: colors.mutedForeground }]}>
                    You are about to pay
                  </Text>
                  <Text style={[styles.confirmAmount, { color: colors.primary }]}>₹{totalPayable.toLocaleString()}</Text>
                  <Text style={{ fontSize: 11, color: "#FF8C42", fontFamily: "Inter_400Regular", marginTop: 2 }}>incl. ₹{gstAmount.toLocaleString()} GST (18%)</Text>
                  <Text style={[styles.confirmSub, { color: colors.mutedForeground }]}>
                    via {PAY_METHODS.find(m => m.key === payMethod)?.label}
                    {"\n"}to {product.seller} for "{product.title}"
                  </Text>
                </View>

                <View style={[styles.confirmBreakdown, { backgroundColor: colors.muted }]}>
                  <Feather name="shield" size={14} color="#34C759" />
                  <Text style={[styles.confirmBreakdownText, { color: colors.mutedForeground }]}>
                    Payment is held by Ridhi until you confirm receipt. Seller receives ₹{sellerGets.toLocaleString()} after 5% platform commission.
                  </Text>
                </View>

                <Pressable onPress={handlePay} style={styles.payBtn}>
                  <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.payBtnGrad}>
                    <Feather name="check" size={15} color="#fff" />
                    <Text style={styles.payBtnText}>Confirm & Pay ₹{totalPayable.toLocaleString()}</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={() => setPayStep("select")} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                  <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Back</Text>
                </Pressable>
              </View>
            )}

            {/* SUCCESS */}
            {payStep === "success" && (
              <View style={styles.successWrap}>
                <LinearGradient colors={["#34C759", "#2196F3"]} style={styles.successIcon}>
                  <Feather name="check" size={40} color="#fff" />
                </LinearGradient>
                <Text style={[styles.successTitle, { color: colors.foreground }]}>Payment Successful!</Text>
                <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                  ₹{totalPayable.toLocaleString()} paid to {product.seller} (incl. ₹{gstAmount.toLocaleString()} GST)
                </Text>

                <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>TRANSACTION DETAILS</Text>
                  {[
                    { label: "Item",           val: product.title },
                    { label: "Amount Paid",    val: `₹${totalPayable.toLocaleString()} (incl. GST)` },
                    { label: "Payment Method", val: PAY_METHODS.find(m => m.key === payMethod)?.label ?? "" },
                    { label: "Transaction ID", val: "TXN" + Math.random().toString(36).slice(2, 10).toUpperCase() },
                    { label: "Seller",         val: product.seller },
                    { label: "Status",         val: "✅ Confirmed" },
                  ].map(({ label, val }) => (
                    <View key={label} style={[styles.receiptRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.receiptRowLabel, { color: colors.mutedForeground }]}>{label}</Text>
                      <Text style={[styles.receiptRowVal, { color: colors.foreground }]}>{val}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.sellerCreditNote, { backgroundColor: "#34C75912", borderColor: "#34C75940" }]}>
                  <Feather name="trending-up" size={14} color="#34C759" />
                  <Text style={[styles.sellerCreditText, { color: "#34C759" }]}>
                    ₹{sellerGets.toLocaleString()} will be credited to {product.seller}'s Ridhi Wallet within 24 hours (after 5% platform fee). GST of ₹{gstAmount.toLocaleString()} will be remitted to the government.
                  </Text>
                </View>

                <Pressable onPress={() => { closeModal(); router.back(); }} style={styles.payBtn}>
                  <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.payBtnGrad}>
                    <Text style={styles.payBtnText}>Back to Marketplace</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
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

import React, { useState } from "react";
import {
  Alert, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Category = "electronics" | "fashion" | "books" | "home" | "beauty" | "sports" | "food" | "services" | "vehicles" | "toys";
type Condition = "New" | "Like New" | "Good" | "Fair";

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
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

const CONDITIONS: { key: Condition; label: string; desc: string; color: string }[] = [
  { key: "New",      label: "Brand New",  desc: "Unused, sealed",          color: "#34C759" },
  { key: "Like New", label: "Like New",   desc: "Used 1–2 times",          color: "#2196F3" },
  { key: "Good",     label: "Good",       desc: "Minor signs of use",      color: "#FFB800" },
  { key: "Fair",     label: "Fair",       desc: "Visible wear, functional",color: "#FF6B35" },
];

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Remote"];

export default function MarketplaceSellScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep] = useState<1 | 2 | 3 | "done">(1);

  // Step 1 — Basic info
  const [title,      setTitle]      = useState("");
  const [description,setDescription]= useState("");
  const [category,   setCategory]   = useState<Category | null>(null);

  // Step 1 — Photos
  const [photoCount, setPhotoCount] = useState(0);

  // Step 2 — Price & condition
  const [price,      setPrice]      = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [condition,  setCondition]  = useState<Condition | null>(null);
  const [city,       setCity]       = useState<string | null>(null);
  const [address,    setAddress]    = useState("");
  const [pincode,    setPincode]    = useState("");
  const [kycDone,    setKycDone]    = useState(false);

  // Step 3 — Review & submit
  const [agreed, setAgreed] = useState(false);

  const canStep1 = title.trim().length >= 3 && category !== null;
  const canStep2 = price.trim() !== "" && condition !== null && city !== null && address.trim().length >= 5 && pincode.length === 6 && kycDone;
  const canStep3 = agreed;

  // ── Done ──────────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.doneWrap}>
          <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.doneIcon}>
            <Feather name="check" size={36} color="#fff" />
          </LinearGradient>
          <Text style={[styles.doneTitle, { color: colors.foreground }]}>Ad Submitted!</Text>
          <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
            Your listing for "{title}" is under review. Once approved by the Ridhi team, it will go live in the Marketplace.
          </Text>

          <View style={[styles.doneCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: "Product",   val: title },
              { label: "Price",     val: `₹${Number(price).toLocaleString()}${negotiable ? " (Negotiable)" : ""}` },
              { label: "Category",  val: CATEGORIES.find(c => c.key === category)?.label ?? "" },
              { label: "Condition", val: condition ?? "" },
              { label: "City",      val: city ?? "" },
              { label: "Status",    val: "⏳ Pending Admin Review" },
            ].map(({ label, val }) => (
              <View key={label} style={[styles.doneRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.doneLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.doneVal, { color: colors.foreground }]}>{val}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.commCard, { backgroundColor: "#34C75912", borderColor: "#34C75940" }]}>
            <Feather name="shield" size={16} color="#34C759" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.commTitle, { color: colors.foreground }]}>Ridhi Seller Protection</Text>
              <Text style={[styles.commSub, { color: colors.mutedForeground }]}>
                When your item sells, 95% of the sale price is credited to your Ridhi Wallet within 24 hours. Ridhi retains a 5% platform commission.
              </Text>
            </View>
          </View>

          {/* ── Boost CTA ── */}
          <View style={[styles.boostCard, { backgroundColor: colors.card, borderColor: "#7B2FBE40" }]}>
            <LinearGradient colors={["#7B2FBE20", "#E91E8C20"]} style={styles.boostCardBg}>
              <View style={styles.boostCardTop}>
                <View style={[styles.boostIconWrap, { backgroundColor: "#7B2FBE25" }]}>
                  <Feather name="zap" size={22} color="#7B2FBE" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.boostCardTitle, { color: colors.foreground }]}>Sell Faster with Ridhi Ads</Text>
                  <Text style={[styles.boostCardSub, { color: colors.mutedForeground }]}>
                    Promote "{title.length > 28 ? title.slice(0, 28) + "…" : title}" to thousands of buyers. Drive more enquiries and sell quicker.
                  </Text>
                </View>
              </View>

              <View style={styles.boostStats}>
                {[
                  { icon: "users",       label: "Wider Reach",     color: "#7B2FBE" },
                  { icon: "trending-up", label: "More Enquiries",   color: "#E91E8C" },
                  { icon: "clock",       label: "Sell Faster",      color: "#FFB800" },
                ].map(({ icon, label, color }) => (
                  <View key={label} style={styles.boostStat}>
                    <Feather name={icon as any} size={16} color={color} />
                    <Text style={[styles.boostStatTxt, { color: colors.mutedForeground }]}>{label}</Text>
                  </View>
                ))}
              </View>

              <Pressable onPress={() => router.push("/ads-create" as any)}>
                <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.boostBtn}>
                  <Feather name="zap" size={16} color="#fff" />
                  <Text style={styles.boostBtnTxt}>Run an Ad for This Product</Text>
                  <Feather name="arrow-right" size={14} color="#fff" />
                </LinearGradient>
              </Pressable>

              <Pressable onPress={() => router.push("/subscription" as any)} style={styles.boostAltBtn}>
                <Feather name="trending-up" size={14} color="#7B2FBE" />
                <Text style={[styles.boostAltTxt, { color: "#7B2FBE" }]}>Or Boost your Profile / Listing</Text>
              </Pressable>
            </LinearGradient>
          </View>

          <Pressable onPress={() => router.push("/marketplace" as any)} style={styles.browseBtn}>
            <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.browseBtnGrad}>
              <Text style={styles.browseBtnText}>Browse Marketplace</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => { setStep(1); setTitle(""); setDescription(""); setCategory(null); setPhotoCount(0); setPrice(""); setNegotiable(false); setCondition(null); setCity(null); setAddress(""); setPincode(""); setKycDone(false); setAgreed(false); }}
            style={[styles.anotherBtn, { borderColor: colors.border }]}>
            <Text style={[styles.anotherBtnText, { color: colors.foreground }]}>List Another Item</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={[styles.headerGrad, { paddingTop: topPad + 10 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={[styles.headerTitle, { color: "#fff" }]}>List a Product</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.headerSub}>Free listing · Get paid via Ridhi Wallet</Text>

        {/* Step bar */}
        <View style={styles.stepBar}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepDot, {
                backgroundColor: s <= step ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
              }]}>
                {(s as number) < (step as number)
                  ? <Feather name="check" size={11} color="#E91E8C" />
                  : <Text style={[styles.stepNum, { color: (s as number) <= (step as number) ? "#E91E8C" : "rgba(255,255,255,0.7)" }]}>{s}</Text>}
              </View>
              {s < 3 && <View style={[styles.stepLine, { backgroundColor: (s as number) < (step as number) ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }]} />}
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>What are you selling?</Text>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. iPhone 12 Pro 256GB Blue"
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{title.length}/80</Text>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Describe your item — condition details, reason for selling, what's included…"
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={400}
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Category *</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((c) => {
                const sel = category === c.key;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setCategory(c.key)}
                    style={[styles.catCard, {
                      backgroundColor: sel ? colors.primary + "18" : colors.card,
                      borderColor: sel ? colors.primary : colors.border,
                      borderWidth: sel ? 1.5 : 1,
                    }]}
                  >
                    <Text style={styles.catEmoji}>{c.emoji}</Text>
                    <Text style={[styles.catLabel, { color: sel ? colors.primary : colors.foreground }]}>{c.label}</Text>
                    {sel && <Feather name="check-circle" size={13} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </View>

            {/* Product Photos */}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Product Photos *</Text>
            <Text style={[styles.photHint, { color: colors.mutedForeground }]}>Add clear photos to attract more buyers. Min 1 required.</Text>

            <View style={styles.photoRow}>
              <Pressable
                style={[styles.photoBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}
                onPress={() => {
                  Alert.alert("Upload from Gallery", "Select photos from your gallery", [{ text: "OK", onPress: () => setPhotoCount(p => Math.min(p + 1, 6)) }]);
                }}
              >
                <Feather name="image" size={22} color={colors.primary} />
                <Text style={[styles.photoBtnTxt, { color: colors.foreground }]}>Upload from Gallery</Text>
              </Pressable>
              <Pressable
                style={[styles.photoBtn, { backgroundColor: colors.card, borderColor: "#7B2FBE" }]}
                onPress={() => {
                  Alert.alert("Take a Photo", "Open camera to capture product photos", [{ text: "OK", onPress: () => setPhotoCount(p => Math.min(p + 1, 6)) }]);
                }}
              >
                <Feather name="camera" size={22} color="#7B2FBE" />
                <Text style={[styles.photoBtnTxt, { color: colors.foreground }]}>Take a Photo</Text>
              </Pressable>
            </View>

            {photoCount > 0 && (
              <View style={[styles.photoCount, { backgroundColor: "#34C75912", borderColor: "#34C75940" }]}>
                <Feather name="check-circle" size={14} color="#34C759" />
                <Text style={[styles.photoCountTxt, { color: "#34C759" }]}>{photoCount} photo{photoCount > 1 ? "s" : ""} added</Text>
                <Pressable onPress={() => setPhotoCount(0)} style={{ marginLeft: "auto" }}>
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </Pressable>
              </View>
            )}

            <Pressable
              onPress={() => { if (canStep1) setStep(2); }}
              style={[styles.nextBtn, { opacity: canStep1 ? 1 : 0.4 }]}
            >
              <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                <Text style={styles.nextBtnText}>Next: Price & Details</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* ── Step 2: Price & Condition ── */}
        {step === 2 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Price & Details</Text>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Price (₹) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. 5000"
              placeholderTextColor={colors.mutedForeground}
              value={price}
              onChangeText={v => setPrice(v.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
            />

            {/* Earnings preview */}
            {price !== "" && Number(price) > 0 && (
              <View style={[styles.earningsPreview, { backgroundColor: "#34C75910", borderColor: "#34C75940" }]}>
                <Feather name="info" size={13} color="#34C759" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.earningsLabel, { color: colors.foreground }]}>
                    You'll receive: <Text style={{ color: "#34C759", fontFamily: "Inter_700Bold" }}>
                      ₹{Math.floor(Number(price) * 0.95).toLocaleString()}
                    </Text>
                  </Text>
                  <Text style={[styles.earningsSub, { color: colors.mutedForeground }]}>
                    Ridhi 5% commission: ₹{Math.ceil(Number(price) * 0.05).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            <Pressable onPress={() => setNegotiable(n => !n)}
              style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Price is Negotiable</Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>Buyers can make offers</Text>
              </View>
              <View style={[styles.toggleKnob, { backgroundColor: negotiable ? colors.primary : colors.muted }]}>
                {negotiable && <Feather name="check" size={12} color="#fff" />}
              </View>
            </Pressable>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Item Condition *</Text>
            {CONDITIONS.map((c) => {
              const sel = condition === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCondition(c.key)}
                  style={[styles.condRow, {
                    backgroundColor: sel ? c.color + "15" : colors.card,
                    borderColor: sel ? c.color : colors.border,
                    borderWidth: sel ? 1.5 : 1,
                  }]}
                >
                  <View style={[styles.condDot, { backgroundColor: c.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.condLabel, { color: colors.foreground }]}>{c.label}</Text>
                    <Text style={[styles.condDesc, { color: colors.mutedForeground }]}>{c.desc}</Text>
                  </View>
                  {sel && <Feather name="check-circle" size={16} color={c.color} />}
                </Pressable>
              );
            })}

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>City *</Text>
            <View style={styles.cityGrid}>
              {CITIES.map((c) => {
                const sel = city === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCity(c)}
                    style={[styles.cityChip, {
                      backgroundColor: sel ? colors.primary : colors.card,
                      borderColor: sel ? colors.primary : colors.border,
                    }]}
                  >
                    <Text style={[styles.cityText, { color: sel ? "#fff" : colors.foreground }]}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Full Address */}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Full Address *</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="House/Flat No., Street, Area, Locality"
              placeholderTextColor={colors.mutedForeground}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Pincode *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="6-digit pincode"
              placeholderTextColor={colors.mutedForeground}
              value={pincode}
              onChangeText={v => setPincode(v.replace(/[^0-9]/g, "").slice(0, 6))}
              keyboardType="numeric"
              maxLength={6}
            />

            {/* KYC / Identity Verification */}
            <View style={[styles.kycCard, { backgroundColor: kycDone ? "#34C75912" : "#2196F312", borderColor: kycDone ? "#34C75940" : "#2196F340" }]}>
              <View style={styles.kycTop}>
                <Feather name={kycDone ? "check-circle" : "shield"} size={20} color={kycDone ? "#34C759" : "#2196F3"} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.kycTitle, { color: colors.foreground }]}>
                    {kycDone ? "Identity Verified ✓" : "Seller Identity Verification Required"}
                  </Text>
                  <Text style={[styles.kycSub, { color: colors.mutedForeground }]}>
                    {kycDone
                      ? "Your Aadhaar/PAN has been verified successfully."
                      : "Upload a valid government ID (Aadhaar / PAN Card / Passport) to list your product."}
                  </Text>
                </View>
              </View>
              {!kycDone && (
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Upload Identity Proof",
                      "Choose document to upload",
                      [
                        { text: "Aadhaar Card", onPress: () => setKycDone(true) },
                        { text: "PAN Card",     onPress: () => setKycDone(true) },
                        { text: "Passport",     onPress: () => setKycDone(true) },
                        { text: "Cancel", style: "cancel" },
                      ]
                    );
                  }}
                  style={[styles.kycBtn, { backgroundColor: "#2196F3" }]}
                >
                  <Feather name="upload" size={14} color="#fff" />
                  <Text style={styles.kycBtnTxt}>Upload ID Proof</Text>
                </Pressable>
              )}
            </View>

            {!canStep2 && (
              <View style={[styles.verifyHint, { backgroundColor: colors.muted }]}>
                <Feather name="info" size={12} color={colors.mutedForeground} />
                <Text style={[styles.verifyHintTxt, { color: colors.mutedForeground }]}>
                  Fill address, 6-digit pincode, and verify your identity to proceed.
                </Text>
              </View>
            )}

            <View style={styles.navRow}>
              <Pressable onPress={() => setStep(1)} style={[styles.backStepBtn, { borderColor: colors.border }]}>
                <Feather name="arrow-left" size={16} color={colors.foreground} />
                <Text style={[styles.backStepText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable onPress={() => { if (canStep2) setStep(3); }} style={[styles.nextFlex, { opacity: canStep2 ? 1 : 0.4 }]}>
                <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                  <Text style={styles.nextBtnText}>Next: Review</Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Step 3: Review & Submit ── */}
        {step === 3 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review Your Listing</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Check everything before submitting for admin review</Text>

            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Product emoji + title */}
              <View style={[styles.reviewHeader, { borderBottomColor: colors.border }]}>
                <Text style={styles.reviewEmoji}>
                  {CATEGORIES.find(c => c.key === category)?.emoji ?? "📦"}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reviewTitle, { color: colors.foreground }]}>{title}</Text>
                  <Text style={[styles.reviewPrice, { color: colors.primary }]}>
                    ₹{Number(price).toLocaleString()}{negotiable ? " · Negotiable" : ""}
                  </Text>
                </View>
              </View>
              {[
                { label: "Category",  val: CATEGORIES.find(c => c.key === category)?.label ?? "" },
                { label: "Condition", val: condition ?? "" },
                { label: "City",      val: city ?? "" },
                { label: "Description", val: description || "—" },
              ].map(({ label, val }) => (
                <View key={label} style={[styles.reviewRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{label}</Text>
                  <Text style={[styles.reviewVal, { color: colors.foreground }]}>{val}</Text>
                </View>
              ))}
            </View>

            {/* Commission info */}
            <View style={[styles.commInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.commRow}>
                <Text style={[styles.commRowLabel, { color: colors.mutedForeground }]}>Sale price</Text>
                <Text style={[styles.commRowVal, { color: colors.foreground }]}>₹{Number(price).toLocaleString()}</Text>
              </View>
              <View style={styles.commRow}>
                <Text style={[styles.commRowLabel, { color: colors.mutedForeground }]}>Ridhi commission (5%)</Text>
                <Text style={[styles.commRowVal, { color: "#FF6B35" }]}>− ₹{Math.ceil(Number(price) * 0.05).toLocaleString()}</Text>
              </View>
              <View style={[styles.commRow, styles.commTotal, { borderTopColor: colors.border }]}>
                <Text style={[styles.commRowLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>You receive</Text>
                <Text style={[styles.commRowVal, { color: "#34C759", fontFamily: "Inter_700Bold", fontSize: 16 }]}>
                  ₹{Math.floor(Number(price) * 0.95).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Buyer verification notice */}
            <View style={[styles.buyerVerifyNote, { backgroundColor: "#FFB80012", borderColor: "#FFB80040" }]}>
              <Feather name="users" size={14} color="#FFB800" />
              <Text style={[styles.buyerVerifyTxt, { color: colors.mutedForeground }]}>
                Only buyers with verified identity and address can purchase your listing.
              </Text>
            </View>

            {/* Terms */}
            <Pressable onPress={() => setAgreed(a => !a)}
              style={[styles.termsRow, { backgroundColor: agreed ? "#34C75912" : colors.card, borderColor: agreed ? "#34C75950" : colors.border }]}>
              <View style={[styles.termsCheck, { backgroundColor: agreed ? "#34C759" : colors.muted, borderColor: agreed ? "#34C759" : colors.border }]}>
                {agreed && <Feather name="check" size={12} color="#fff" />}
              </View>
              <Text style={[styles.termsText, { color: colors.mutedForeground }]}>
                I agree to Ridhi Marketplace Terms. My listing is genuine, legal, and accurately described. Ridhi will retain 5% on each successful sale.{"\n\n"}
                <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Important: </Text>
                Ridhi will not and never be responsible for any buying & selling transactions on this platform. All transactions are entirely between buyer and seller at their own risk and discretion.
              </Text>
            </Pressable>

            <View style={styles.navRow}>
              <Pressable onPress={() => setStep(2)} style={[styles.backStepBtn, { borderColor: colors.border }]}>
                <Feather name="arrow-left" size={16} color={colors.foreground} />
                <Text style={[styles.backStepText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable onPress={() => { if (canStep3) setStep("done"); }} style={[styles.nextFlex, { opacity: canStep3 ? 1 : 0.4 }]}>
                <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                  <Feather name="send" size={15} color="#fff" />
                  <Text style={styles.nextBtnText}>Submit for Review</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  headerGrad: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  topBar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn:    { padding: 6 },
  headerTitle:{ fontSize: 17, fontFamily: "Inter_700Bold" },
  headerSub:  { fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", textAlign: "center" },
  stepBar:    { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  stepItem:   { flexDirection: "row", alignItems: "center" },
  stepDot:    { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepNum:    { fontSize: 12, fontFamily: "Inter_700Bold" },
  stepLine:   { width: 40, height: 2, marginHorizontal: 4 },
  scroll:     { padding: 16, paddingBottom: 48 },
  stepWrap:   { gap: 14 },
  stepTitle:  { fontSize: 20, fontFamily: "Inter_700Bold" },
  stepSub:    { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8, lineHeight: 19 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: -6 },
  charCount:  { fontSize: 11, textAlign: "right", marginTop: -10 },
  input:      { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: "Inter_400Regular" },
  textarea:   { minHeight: 90, textAlignVertical: "top" },
  catGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catCard:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  catEmoji:   { fontSize: 16 },
  catLabel:   { fontSize: 13, fontFamily: "Inter_500Medium" },
  earningsPreview:{ flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12 },
  earningsLabel:  { fontSize: 13, fontFamily: "Inter_500Medium" },
  earningsSub:    { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  toggleRow:  { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  toggleLabel:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toggleSub:  { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  condRow:    { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 13 },
  condDot:    { width: 10, height: 10, borderRadius: 5 },
  condLabel:  { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  condDesc:   { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  cityGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cityChip:   { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  cityText:   { fontSize: 13, fontFamily: "Inter_500Medium" },
  navRow:     { flexDirection: "row", gap: 10, alignItems: "stretch" },
  backStepBtn:{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
  backStepText:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nextBtn:    {},
  nextFlex:   { flex: 1 },
  nextBtnGrad:{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13 },
  nextBtnText:{ color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  reviewCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  reviewHeader:{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  reviewEmoji:{ fontSize: 36 },
  reviewTitle:{ fontSize: 15, fontFamily: "Inter_700Bold" },
  reviewPrice:{ fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 2 },
  reviewRow:  { flexDirection: "row", justifyContent: "space-between", padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  reviewLabel:{ fontSize: 12, fontFamily: "Inter_400Regular" },
  reviewVal:  { fontSize: 12, fontFamily: "Inter_600SemiBold", flexShrink: 1, textAlign: "right" },
  commInfo:   { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  commRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11 },
  commRowLabel:{ fontSize: 13, fontFamily: "Inter_400Regular" },
  commRowVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  commTotal:  { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 13 },
  photHint:       { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginTop: -8 },
  photoRow:       { flexDirection: "row", gap: 10 },
  photoBtn:       { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderRadius: 14, borderStyle: "dashed", paddingVertical: 18 },
  photoBtnTxt:    { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  photoCount:     { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  photoCountTxt:  { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  kycCard:        { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  kycTop:         { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  kycTitle:       { fontSize: 14, fontFamily: "Inter_700Bold" },
  kycSub:         { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 17 },
  kycBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 10 },
  kycBtnTxt:      { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  verifyHint:     { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, padding: 10 },
  verifyHintTxt:  { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  buyerVerifyNote:{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  buyerVerifyTxt: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  termsRow:   { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12 },
  termsCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 },
  termsText:  { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  // Done
  doneWrap:   { alignItems: "center", padding: 24, gap: 16, paddingTop: 40 },
  doneIcon:   { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  doneTitle:  { fontSize: 24, fontFamily: "Inter_700Bold" },
  doneSub:    { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  doneCard:   { width: "100%", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  doneRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  doneLabel:  { fontSize: 12, fontFamily: "Inter_400Regular" },
  doneVal:    { fontSize: 12, fontFamily: "Inter_600SemiBold", flexShrink: 1, textAlign: "right", paddingLeft: 8 },
  commCard:   { flexDirection: "row", alignItems: "flex-start", gap: 10, width: "100%", borderRadius: 14, borderWidth: 1, padding: 14 },
  commTitle:  { fontSize: 13, fontFamily: "Inter_700Bold" },
  commSub:    { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 17 },
  boostCard:      { width: "100%", borderRadius: 18, borderWidth: 1.5, overflow: "hidden" },
  boostCardBg:    { padding: 16, gap: 14 },
  boostCardTop:   { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  boostIconWrap:  { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  boostCardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 3 },
  boostCardSub:   { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  boostStats:     { flexDirection: "row", justifyContent: "space-around" },
  boostStat:      { alignItems: "center", gap: 4 },
  boostStatTxt:   { fontSize: 11, fontFamily: "Inter_500Medium" },
  boostBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13 },
  boostBtnTxt:    { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  boostAltBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  boostAltTxt:    { fontSize: 13, fontFamily: "Inter_500Medium" },
  browseBtn:  { width: "100%" },
  browseBtnGrad:{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 14 },
  browseBtnText:{ color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  anotherBtn: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10 },
  anotherBtnText:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

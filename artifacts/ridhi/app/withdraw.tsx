import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/utils/api";

const COIN_IMAGE = require("../assets/images/ridhi_coin.png");

const INR_PER_COIN = 0.5;
const PLATFORM_FEE_PCT = 30;
const GST_RATE = 0.18;          // 18% GST on platform fee (SAC 998314)
const MIN_COINS = 1000;
const MAX_COINS_PER_DAY = 50000;

type Step = "kyc_gate" | "amount" | "method" | "details" | "review" | "success";
type Method = "UPI" | "Bank";

function calc(coins: number) {
  const gross        = coins * INR_PER_COIN;
  const platformFee  = gross * (PLATFORM_FEE_PCT / 100);
  const gst          = platformFee * GST_RATE;          // GST on platform service fee
  const totalDeduct  = platformFee + gst;
  const net          = gross - totalDeduct;
  return { gross, platformFee, gst, totalDeduct, net };
}

function StepDot({ active, done, n }: { active: boolean; done: boolean; n: number }) {
  const bg = done ? "#22C55E" : active ? "#E91E8C" : "rgba(255,255,255,0.25)";
  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View style={[st.stepDot, { backgroundColor: bg, borderColor: done ? "#22C55E" : active ? "#E91E8C" : "rgba(255,255,255,0.3)" }]}>
        {done
          ? <Feather name="check" size={12} color="#fff" />
          : <Text style={st.stepDotText}>{n}</Text>}
      </View>
    </View>
  );
}

function ProgressBar({ step }: { step: Step }) {
  const steps: Step[] = ["amount", "method", "details", "review"];
  const idx = steps.indexOf(step);
  return (
    <View style={st.progressBar}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <StepDot active={idx === i} done={idx > i} n={i + 1} />
          {i < steps.length - 1 && (
            <View style={[st.progressLine, { backgroundColor: idx > i ? "#22C55E" : "rgba(255,255,255,0.25)" }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

function KycGateScreen({ colors }: { colors: any }) {
  return (
    <ScrollView contentContainerStyle={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 20 }}>
      <View style={[st.kycIconWrap, { backgroundColor: "#F43F5E18", borderColor: "#F43F5E30" }]}>
        <Feather name="shield-off" size={44} color="#F43F5E" />
      </View>
      <Text style={[st.kycTitle, { color: colors.foreground }]}>E-KYC Required</Text>
      <Text style={[st.kycSub, { color: colors.mutedForeground }]}>
        You must complete E-KYC verification before withdrawing coins to your bank account. This protects your earnings and ensures compliance with RBI guidelines.
      </Text>
      <View style={[st.kycInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { icon: "upload", text: "Upload Aadhaar + PAN + Bank Proof" },
          { icon: "check-circle", text: "One verification for Creator & Host" },
          { icon: "shield", text: "Super Admin review — usually 1-2 days" },
        ].map((item) => (
          <View key={item.text} style={st.kycInfoRow}>
            <View style={[st.kycInfoIcon, { backgroundColor: "#7B2FBE20" }]}>
              <Feather name={item.icon as any} size={14} color="#7B2FBE" />
            </View>
            <Text style={[st.kycInfoText, { color: colors.foreground }]}>{item.text}</Text>
          </View>
        ))}
      </View>
      <Pressable onPress={() => router.push("/kyc")}>
        <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.kycBtn}>
          <Feather name="shield" size={18} color="#fff" />
          <Text style={st.kycBtnText}>Complete E-KYC Now</Text>
        </LinearGradient>
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={[st.kycSkip, { color: colors.mutedForeground }]}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

export default function WithdrawScreen() {
  useTrackScreen("withdraw");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep] = useState<Step>("amount");
  const [kycChecked, setKycChecked] = useState(false);
  const [coins, setCoins] = useState("");
  const [method, setMethod] = useState<Method>("UPI");
  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successAnim] = useState(new Animated.Value(0));

  const balance = user?.coins ?? 0;
  const coinAmt = parseInt(coins) || 0;
  const { gross, platformFee, gst, totalDeduct, net } = calc(coinAmt);

  useEffect(() => {
    // Fetch real KYC status from backend
    async function checkKyc() {
      if (!user?.id) { setKycChecked(true); return; }
      try {
        const resp = await apiFetch<{ success: boolean; kyc?: { status: string; aadhaarVerified: boolean; panVerified: boolean; bankVerified: boolean } }>(
          `/api/kyc/status/${encodeURIComponent(user.id)}`,
        );
        const verified = resp.success && resp.kyc?.status === "approved";
        if (!verified) setStep("kyc_gate");
      } catch {
        // offline: fall back to local profile
        const verified = user?.kycStatus === "verified";
        if (!verified) setStep("kyc_gate");
      }
      setKycChecked(true);
    }
    checkKyc();
  }, [user?.id, user?.kycStatus]);

  useEffect(() => {
    if (step === "success") {
      Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }).start();
    }
  }, [step]);

  const canProceedAmount = coinAmt >= MIN_COINS && coinAmt <= balance;
  const canProceedDetails = method === "UPI"
    ? upiId.includes("@") && upiId.length >= 5
    : accountHolder.length >= 2 && accountNumber.length >= 9 && confirmAccount === accountNumber && ifsc.length === 11;

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep("success");
    }, 2200);
  };

  if (!kycChecked) {
    return (
      <View style={[st.screen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <PrivateHead />
      <View style={[st.screen, { backgroundColor: colors.background }]}>
        {/* Header */}
        <LinearGradient colors={[colors.primary, colors.secondary]} style={[st.header, { paddingTop: topPad + 10 }]}>
          <View style={st.headerRow}>
            <Pressable onPress={() => { if (step === "amount" || step === "kyc_gate") router.back(); else setStep(step === "method" ? "amount" : step === "details" ? "method" : step === "review" ? "details" : "amount"); }} style={st.backBtn}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>
            <Text style={st.headerTitle}>Withdraw Coins</Text>
            <View style={{ width: 36 }} />
          </View>
          {step !== "kyc_gate" && step !== "success" && <ProgressBar step={step} />}
          {step !== "kyc_gate" && step !== "success" && (
            <View style={st.balancePill}>
              <Image source={COIN_IMAGE} style={{ width: 18, height: 18 }} resizeMode="contain" />
              <Text style={st.balancePillText}>{balance.toLocaleString()} coins available</Text>
            </View>
          )}
        </LinearGradient>

        {/* Content */}
        {step === "kyc_gate" && <KycGateScreen colors={colors} />}

        {step === "amount" && (
          <ScrollView contentContainerStyle={st.body}>
            <Text style={[st.stepHeading, { color: colors.foreground }]}>How many coins to withdraw?</Text>
            <Text style={[st.stepSub, { color: colors.mutedForeground }]}>Minimum {MIN_COINS.toLocaleString()} coins · 30% platform fee applies</Text>

            <View style={[st.amountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={st.amountInputRow}>
                <Image source={COIN_IMAGE} style={{ width: 28, height: 28 }} resizeMode="contain" />
                <TextInput
                  style={[st.amountInput, { color: colors.foreground }]}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  value={coins}
                  onChangeText={setCoins}
                  maxLength={6}
                />
                <Text style={[st.amountSuffix, { color: colors.mutedForeground }]}>coins</Text>
              </View>
              <View style={[st.divider, { backgroundColor: colors.border }]} />
              <View style={st.calcRows}>
                <View style={[st.calcRow, st.calcRowNet]}>
                  <Text style={[st.calcLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>You receive</Text>
                  <Text style={[st.calcValue, { color: "#22C55E", fontSize: 18, fontFamily: "Inter_700Bold" }]}>₹{net.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</Text>
                </View>
              </View>
            </View>

            <View style={st.quickAmtRow}>
              {[1000, 2500, 5000, 10000].map((q) => (
                <Pressable key={q} onPress={() => setCoins(String(q))} style={[st.quickAmt, { backgroundColor: coins === String(q) ? colors.primary : colors.card, borderColor: coins === String(q) ? colors.primary : colors.border }]}>
                  <Text style={[st.quickAmtText, { color: coins === String(q) ? "#fff" : colors.foreground }]}>{q >= 1000 ? `${q / 1000}K` : q}</Text>
                </Pressable>
              ))}
            </View>

            {coinAmt > 0 && coinAmt < MIN_COINS && (
              <View style={[st.warnBox, { backgroundColor: "#F43F5E10", borderColor: "#F43F5E30" }]}>
                <Feather name="alert-circle" size={14} color="#F43F5E" />
                <Text style={st.warnText}>Minimum withdrawal is {MIN_COINS.toLocaleString()} coins (₹{(MIN_COINS * INR_PER_COIN * 0.7).toLocaleString()})</Text>
              </View>
            )}
            {coinAmt > balance && (
              <View style={[st.warnBox, { backgroundColor: "#F43F5E10", borderColor: "#F43F5E30" }]}>
                <Feather name="alert-circle" size={14} color="#F43F5E" />
                <Text style={st.warnText}>You only have {balance.toLocaleString()} coins in your wallet</Text>
              </View>
            )}

            <Pressable onPress={() => canProceedAmount && setStep("method")} style={{ opacity: canProceedAmount ? 1 : 0.45 }}>
              <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.nextBtn}>
                <Text style={st.nextBtnText}>Continue</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          </ScrollView>
        )}

        {step === "method" && (
          <ScrollView contentContainerStyle={st.body}>
            <Text style={[st.stepHeading, { color: colors.foreground }]}>Choose payment method</Text>
            <Text style={[st.stepSub, { color: colors.mutedForeground }]}>Select how you want to receive ₹{net.toLocaleString("en-IN", { maximumFractionDigits: 0 })} (after 30% platform fee)</Text>

            {(["UPI", "Bank"] as Method[]).map((m) => (
              <Pressable key={m} onPress={() => setMethod(m)} style={[st.methodCard, { backgroundColor: colors.card, borderColor: method === m ? colors.primary : colors.border, borderWidth: method === m ? 2 : 1 }]}>
                <View style={[st.methodIcon, { backgroundColor: method === m ? colors.primary + "20" : colors.muted }]}>
                  <Feather name={m === "UPI" ? "smartphone" : "credit-card"} size={22} color={method === m ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[st.methodTitle, { color: colors.foreground }]}>{m === "UPI" ? "UPI Transfer" : "Bank Transfer"}</Text>
                  <Text style={[st.methodSub, { color: colors.mutedForeground }]}>
                    {m === "UPI" ? "Instant · GPay, PhonePe, Paytm, BHIM" : "1–3 working days · IMPS / NEFT"}
                  </Text>
                </View>
                <View style={[st.methodRadio, { borderColor: method === m ? colors.primary : colors.border }]}>
                  {method === m && <View style={[st.methodRadioFill, { backgroundColor: colors.primary }]} />}
                </View>
              </Pressable>
            ))}

            <View style={[st.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="info" size={14} color={colors.mutedForeground} />
              <Text style={[st.infoText, { color: colors.mutedForeground }]}>
                {method === "UPI" ? "Funds will be credited to your UPI ID instantly after admin approval." : "Funds will be credited via NEFT/IMPS within 1–3 working days after admin approval."}
              </Text>
            </View>

            <Pressable onPress={() => setStep("details")}>
              <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.nextBtn}>
                <Text style={st.nextBtnText}>Continue with {method}</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          </ScrollView>
        )}

        {step === "details" && (
          <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
            <Text style={[st.stepHeading, { color: colors.foreground }]}>{method === "UPI" ? "Enter your UPI ID" : "Enter bank details"}</Text>
            <Text style={[st.stepSub, { color: colors.mutedForeground }]}>This is where ₹{net.toLocaleString("en-IN", { maximumFractionDigits: 0 })} will be sent</Text>

            {method === "UPI" ? (
              <View style={[st.fieldCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={st.fieldRow}>
                  <Text style={[st.fieldLabel, { color: colors.mutedForeground }]}>UPI ID</Text>
                  <TextInput
                    style={[st.fieldInput, { color: colors.foreground, borderColor: colors.border }]}
                    placeholder="yourname@upi"
                    placeholderTextColor={colors.mutedForeground}
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                <View style={[st.fieldHint, { backgroundColor: "#7B2FBE12", borderColor: "#7B2FBE25" }]}>
                  <Feather name="info" size={12} color="#7B2FBE" />
                  <Text style={[st.fieldHintText, { color: "#7B2FBE" }]}>Accepted: @okaxis, @ybl, @paytm, @oksbi, @okicici</Text>
                </View>
              </View>
            ) : (
              <View style={[st.fieldCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {[
                  { label: "Account Holder", placeholder: "As per bank records", value: accountHolder, set: setAccountHolder, type: "default" as const },
                  { label: "Account Number", placeholder: "Enter 9–18 digit number", value: accountNumber, set: setAccountNumber, type: "number-pad" as const },
                  { label: "Confirm Account", placeholder: "Re-enter account number", value: confirmAccount, set: setConfirmAccount, type: "number-pad" as const },
                  { label: "IFSC Code", placeholder: "e.g. SBIN0001234", value: ifsc, set: setIfsc, type: "default" as const },
                  { label: "Bank Name", placeholder: "Optional", value: bankName, set: setBankName, type: "default" as const },
                ].map((f, i) => (
                  <View key={f.label} style={[st.fieldRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                    <Text style={[st.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                    <TextInput
                      style={[st.fieldInput, { color: colors.foreground, borderColor: colors.border }]}
                      placeholder={f.placeholder}
                      placeholderTextColor={colors.mutedForeground}
                      value={f.value}
                      onChangeText={f.set}
                      keyboardType={f.type}
                      autoCapitalize={f.label === "IFSC Code" ? "characters" : "words"}
                      secureTextEntry={false}
                    />
                  </View>
                ))}
                {confirmAccount.length > 0 && confirmAccount !== accountNumber && (
                  <View style={[st.fieldError, { backgroundColor: "#F43F5E10" }]}>
                    <Text style={{ color: "#F43F5E", fontSize: 12, fontFamily: "Inter_400Regular" }}>Account numbers do not match</Text>
                  </View>
                )}
              </View>
            )}

            <Pressable onPress={() => canProceedDetails && setStep("review")} style={{ opacity: canProceedDetails ? 1 : 0.45 }}>
              <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.nextBtn}>
                <Text style={st.nextBtnText}>Review Withdrawal</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          </ScrollView>
        )}

        {step === "review" && (
          <ScrollView contentContainerStyle={st.body}>
            <Text style={[st.stepHeading, { color: colors.foreground }]}>Review & Confirm</Text>
            <Text style={[st.stepSub, { color: colors.mutedForeground }]}>Please verify all details before submitting</Text>

            <View style={[st.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[st.reviewSection, { color: colors.mutedForeground }]}>WITHDRAWAL AMOUNT</Text>
              <View style={st.reviewAmtRow}>
                <Image source={COIN_IMAGE} style={{ width: 36, height: 36 }} resizeMode="contain" />
                <View>
                  <Text style={[st.reviewCoins, { color: colors.foreground }]}>{coinAmt.toLocaleString()} coins</Text>
                  <Text style={[st.reviewInr, { color: "#22C55E" }]}>You receive ₹{net.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</Text>
                </View>
              </View>
              <View style={[st.divider, { backgroundColor: colors.border }]} />
              <View style={st.reviewRow}>
                <Text style={[st.reviewLabel, { color: colors.mutedForeground }]}>You receive</Text>
                <Text style={[st.reviewVal, { color: "#22C55E" }]}>₹{net.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</Text>
              </View>
            </View>

            <View style={[st.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[st.reviewSection, { color: colors.mutedForeground }]}>PAYMENT DESTINATION</Text>
              {method === "UPI" ? (
                <View style={st.reviewRow}>
                  <Text style={[st.reviewLabel, { color: colors.mutedForeground }]}>UPI ID</Text>
                  <Text style={[st.reviewVal, { color: colors.foreground }]}>{upiId}</Text>
                </View>
              ) : (
                <>
                  {[
                    { label: "Account Holder", val: accountHolder },
                    { label: "Account Number", val: `****${accountNumber.slice(-4)}` },
                    { label: "IFSC Code", val: ifsc.toUpperCase() },
                    ...(bankName ? [{ label: "Bank", val: bankName }] : []),
                  ].map((r) => (
                    <View key={r.label} style={st.reviewRow}>
                      <Text style={[st.reviewLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                      <Text style={[st.reviewVal, { color: colors.foreground }]}>{r.val}</Text>
                    </View>
                  ))}
                </>
              )}
              <View style={st.reviewRow}>
                <Text style={[st.reviewLabel, { color: colors.mutedForeground }]}>Transfer Mode</Text>
                <Text style={[st.reviewVal, { color: colors.foreground }]}>{method === "UPI" ? "UPI (Instant)" : "NEFT / IMPS"}</Text>
              </View>
            </View>

            <View style={[st.infoBox, { backgroundColor: "#FFB80010", borderColor: "#FFB80030" }]}>
              <Feather name="alert-triangle" size={14} color="#FFB800" />
              <Text style={[st.infoText, { color: "#FFB800" }]}>
                Once submitted, the request will be reviewed within 24–48 hours. Coins will be deducted only after admin approval.
              </Text>
            </View>

            <Pressable onPress={!submitting ? handleSubmit : undefined} style={{ opacity: submitting ? 0.7 : 1 }}>
              <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.nextBtn}>
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="send" size={18} color="#fff" />}
                <Text style={st.nextBtnText}>{submitting ? "Submitting…" : "Submit Withdrawal Request"}</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        )}

        {step === "success" && (
          <ScrollView contentContainerStyle={[st.body, { alignItems: "center", justifyContent: "center", flex: 1 }]}>
            <Animated.View style={{ transform: [{ scale: successAnim }], opacity: successAnim, alignItems: "center", gap: 18 }}>
              <View style={[st.successCircle, { backgroundColor: "#22C55E15", borderColor: "#22C55E30" }]}>
                <Feather name="check-circle" size={60} color="#22C55E" />
              </View>
              <Text style={[st.successTitle, { color: colors.foreground }]}>Request Submitted!</Text>
              <Text style={[st.successSub, { color: colors.mutedForeground }]}>
                Your withdrawal of {coinAmt.toLocaleString()} coins (₹{net.toLocaleString("en-IN", { maximumFractionDigits: 0 })}) has been submitted and is under review.
              </Text>

              <View style={[st.reviewCard, { backgroundColor: colors.card, borderColor: colors.border, width: "100%" }]}>
                {[
                  { label: "Status", val: "Under Review", color: "#FFB800" },
                  { label: "Expected payout", val: method === "UPI" ? "Instant after approval" : "1–3 working days", color: colors.foreground },
                  { label: "Destination", val: method === "UPI" ? upiId : `****${accountNumber.slice(-4)}`, color: colors.foreground },
                ].map((r) => (
                  <View key={r.label} style={st.reviewRow}>
                    <Text style={[st.reviewLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                    <Text style={[st.reviewVal, { color: r.color }]}>{r.val}</Text>
                  </View>
                ))}
              </View>

              <Pressable onPress={() => router.replace("/wallet")} style={{ width: "100%" }}>
                <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.nextBtn}>
                  <Text style={st.nextBtnText}>Back to Wallet</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  progressBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 14 },
  stepDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  stepDotText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  progressLine: { flex: 1, height: 2, maxWidth: 40 },
  balancePill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center", backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  balancePillText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  body: { padding: 20, gap: 16 },
  stepHeading: { fontSize: 22, fontFamily: "Inter_700Bold" },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: -8, lineHeight: 22 },
  // Amount
  amountCard: { borderRadius: 18, borderWidth: 1, padding: 20, gap: 0 },
  amountInputRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  amountInput: { flex: 1, fontSize: 40, fontFamily: "Inter_700Bold" },
  amountSuffix: { fontSize: 16, fontFamily: "Inter_400Regular" },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 14 },
  calcRows: { gap: 10 },
  calcRow: { flexDirection: "row", justifyContent: "space-between" },
  calcRowNet: { paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(128,128,128,0.2)", marginTop: 4 },
  calcLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  calcValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  quickAmtRow: { flexDirection: "row", gap: 10 },
  quickAmt: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  quickAmtText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  warnBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  warnText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#F43F5E", flex: 1, lineHeight: 18 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 4 },
  nextBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  // Method
  methodCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16 },
  methodIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  methodTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  methodSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  methodRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  methodRadioFill: { width: 11, height: 11, borderRadius: 6 },
  infoBox: { flexDirection: "row", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  infoText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  // Details
  fieldCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  fieldRow: { padding: 14 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, fontFamily: "Inter_400Regular" },
  fieldHint: { margin: 14, marginTop: 0, padding: 10, borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 6 },
  fieldHintText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  fieldError: { margin: 12, padding: 10, borderRadius: 10 },
  // Review
  reviewCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  reviewSection: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
  reviewAmtRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  reviewCoins: { fontSize: 22, fontFamily: "Inter_700Bold" },
  reviewInr: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(128,128,128,0.15)" },
  reviewLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  reviewVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", maxWidth: "55%", textAlign: "right" },
  // KYC Gate
  kycIconWrap: { width: 100, height: 100, borderRadius: 28, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  kycTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  kycSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, maxWidth: 320 },
  kycInfoCard: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  kycInfoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  kycInfoIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  kycInfoText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  kycBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 },
  kycBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  kycSkip: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", padding: 8 },
  // Success
  successCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, maxWidth: 300 },
});

import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/utils/api";

// ─── constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  "Personal Info",
  "Aadhaar OTP",
  "PAN Card",
  "Bank Details",
  "Review & Submit",
];

// IFSC prefix → Bank name lookup (top Indian banks)
const IFSC_MAP: Record<string, { name: string; icon: string }> = {
  SBIN: { name: "State Bank of India",   icon: "🏦" },
  HDFC: { name: "HDFC Bank",             icon: "🏦" },
  ICIC: { name: "ICICI Bank",            icon: "🏦" },
  AXIS: { name: "Axis Bank",             icon: "🏦" },
  KKBK: { name: "Kotak Mahindra Bank",   icon: "🏦" },
  PUNB: { name: "Punjab National Bank",  icon: "🏦" },
  BKID: { name: "Bank of India",         icon: "🏦" },
  UBIN: { name: "Union Bank of India",   icon: "🏦" },
  CNRB: { name: "Canara Bank",           icon: "🏦" },
  IOBA: { name: "Indian Overseas Bank",  icon: "🏦" },
  IDFC: { name: "IDFC FIRST Bank",       icon: "🏦" },
  YESB: { name: "Yes Bank",              icon: "🏦" },
  RATN: { name: "RBL Bank",              icon: "🏦" },
  FDRL: { name: "Federal Bank",          icon: "🏦" },
  KARB: { name: "Karnataka Bank",        icon: "🏦" },
  UTIB: { name: "Axis Bank",             icon: "🏦" },
  BARB: { name: "Bank of Baroda",        icon: "🏦" },
};

function lookupBankFromIFSC(ifsc: string): { name: string; icon: string } | null {
  if (ifsc.length < 4) return null;
  const prefix = ifsc.slice(0, 4).toUpperCase();
  return IFSC_MAP[prefix] ?? null;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseDOB(dob: string): Date | null {
  const parts = dob.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 1900 || y > new Date().getFullYear()) return null;
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

function calcAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function formatAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ current, colors }: { current: number; colors: any }) {
  return (
    <View style={styles.stepBarWrap}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: done ? "#22C55E" : active ? colors.primary : colors.border,
                  borderColor: done ? "#22C55E" : active ? colors.primary : colors.border,
                  width: active ? 32 : 22,
                },
              ]}
            >
              {done ? (
                <Feather name="check" size={12} color="#fff" />
              ) : (
                <Text style={[styles.stepDotText, { color: active ? "#fff" : colors.mutedForeground }]}>{step}</Text>
              )}
            </View>
            {step < TOTAL_STEPS && (
              <View style={[styles.stepLine, { backgroundColor: done ? "#22C55E" : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── OTP Box ─────────────────────────────────────────────────────────────────

function OtpInput({ value, onChange, colors }: { value: string; onChange: (v: string) => void; colors: any }) {
  const digits = value.padEnd(6, "").split("").slice(0, 6);
  const inputRef = useRef<TextInput>(null);
  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.otpRow}>
      <TextInput
        ref={inputRef}
        style={styles.otpHidden}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />
      {digits.map((d, i) => {
        const isActive = value.length === i;
        const isFilled = !!d;
        return (
          <View
            key={i}
            style={[
              styles.otpCell,
              {
                backgroundColor: isActive ? colors.primary + "28" : isFilled ? colors.primary + "18" : "#1A1A30",
                borderColor: isActive ? colors.primary : isFilled ? colors.primary : "#555580",
                borderWidth: isActive ? 3 : isFilled ? 2.5 : 2,
              },
            ]}
          >
            <Text style={[styles.otpCellText, { color: isFilled ? "#fff" : "#66668C" }]}>
              {d || "\u2014"}
            </Text>
            {isActive && (
              <View style={[styles.otpCursor, { backgroundColor: colors.primary }]} />
            )}
          </View>
        );
      })}
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function KYCScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep]           = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // ── Step 1: Personal Info ────────────────────────────────────────────────
  const [fullName, setFullName]   = useState(user?.name ?? "");
  const [dob, setDob]             = useState("");
  const [dobAge, setDobAge]       = useState<number | null>(null);
  const [dobError, setDobError]   = useState("");
  const [gender, setGender]       = useState<"male" | "female" | "">("");

  // Auto-format and calculate age from DOB
  const handleDob = (raw: string) => {
    // Auto-insert slashes
    let cleaned = raw.replace(/[^0-9/]/g, "");
    if (cleaned.length === 2 && dob.length === 1) cleaned += "/";
    if (cleaned.length === 5 && dob.length === 4) cleaned += "/";
    setDob(cleaned);
    setDobError("");
    setDobAge(null);

    const parsed = parseDOB(cleaned);
    if (cleaned.length === 10) {
      if (!parsed) {
        setDobError("Invalid date. Please use DD/MM/YYYY.");
      } else {
        const age = calcAge(parsed);
        if (age < 18) {
          setDobError("You must be at least 18 years old.");
          setDobAge(age);
        } else if (age > 100) {
          setDobError("Please check your date of birth.");
        } else {
          setDobAge(age);
        }
      }
    }
  };

  // ── Step 2: Aadhaar OTP ──────────────────────────────────────────────────
  const [aadhaar, setAadhaar]           = useState("");
  const [otpSent, setOtpSent]           = useState(false);
  const [otpValue, setOtpValue]         = useState("");
  const [sendingOtp, setSendingOtp]     = useState(false);
  const [otpVerified, setOtpVerified]   = useState(false);
  const [otpError, setOtpError]         = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Step 3: PAN Card ─────────────────────────────────────────────────────
  const [panNumber, setPanNumber]       = useState("");
  const [panVerified, setPanVerified]   = useState(false);
  const [panError, setPanError]         = useState("");
  const [verifyingPan, setVerifyingPan] = useState(false);
  const [panHolderName, setPanHolderName] = useState(user?.name ?? "");

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const aadhaarDigits = aadhaar.replace(/\s/g, "");

  const sendOtp = async () => {
    if (aadhaarDigits.length !== 12) return;
    setSendingOtp(true);
    setOtpError("");
    try {
      const resp = await apiFetch<{ success: boolean; message: string; demo?: boolean }>(
        "/api/kyc/aadhaar/send-otp",
        {
          method: "POST",
          body: JSON.stringify({ aadhaarNumber: aadhaarDigits }),
        },
      );
      setSendingOtp(false);
      if (resp.success) {
        setOtpSent(true);
        setResendCooldown(30);
        setOtpValue("");
        // In demo mode the response includes the OTP in the message
        if (resp.demo) {
          setOtpError(resp.message); // show as a helpful hint in demo mode
        }
      } else {
        setOtpError(resp.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setSendingOtp(false);
      setOtpError(err.message || "Failed to send OTP. Please try again.");
    }
  };

  const verifyOtp = async () => {
    if (otpValue.length !== 6 || !aadhaarDigits) return;
    setSendingOtp(true);
    setOtpError("");
    try {
      const resp = await apiFetch<{ success: boolean; message: string }>(
        "/api/kyc/aadhaar/verify-otp",
        {
          method: "POST",
          body: JSON.stringify({ aadhaarNumber: aadhaarDigits, otp: otpValue }),
        },
      );
      setSendingOtp(false);
      if (resp.success) {
        setOtpVerified(true);
        setOtpError("");
      } else {
        setOtpError(resp.message || "Incorrect OTP. Please try again.");
      }
    } catch (err: any) {
      setSendingOtp(false);
      setOtpError(err.message || "Verification failed. Please try again.");
    }
  };

  // ── Step 3: Bank Account ─────────────────────────────────────────────────
  const [accNumber, setAccNumber]         = useState("");
  const [accConfirm, setAccConfirm]       = useState("");
  const [ifsc, setIfsc]                   = useState("");
  const [bankInfo, setBankInfo]           = useState<{ name: string; icon: string } | null>(null);
  const [holderName, setHolderName]       = useState(user?.name ?? "");
  const [accType, setAccType]             = useState<"savings" | "current" | "">("");
  const [verifyingBank, setVerifyingBank] = useState(false);
  const [bankVerified, setBankVerified]   = useState(false);
  const [bankError, setBankError]         = useState("");

  const handleIfsc = (raw: string) => {
    const val = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    setIfsc(val);
    setBankInfo(lookupBankFromIFSC(val));
    setBankVerified(false);
    setBankError("");
  };

  const verifyBank = async () => {
    if (!accNumber || accNumber !== accConfirm || ifsc.length !== 11 || !holderName || !accType) return;
    setVerifyingBank(true);
    setBankError("");
    try {
      const resp = await apiFetch<{ success: boolean; message: string; accountName?: string; bankName?: string }>(
        "/api/kyc/bank/verify",
        {
          method: "POST",
          body: JSON.stringify({ accountNumber: accNumber, ifsc }),
        },
      );
      setVerifyingBank(false);
      if (resp.success) {
        setBankVerified(true);
        setBankError("");
        if (resp.accountName) setHolderName(resp.accountName);
        if (resp.bankName && !bankInfo) setBankInfo({ name: resp.bankName, icon: "🏦" });
      } else {
        setBankError(resp.message || "Bank verification failed. Please check details and try again.");
      }
    } catch (err: any) {
      setVerifyingBank(false);
      setBankError(err.message || "Bank verification failed. Please try again.");
    }
  };

  // ── PAN helpers ─────────────────────────────────────────────────────────
  function formatPan(raw: string): string {
    return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  }
  function validatePan(raw: string): boolean {
    // Indian PAN: AAAAA9999A (5 letters + 4 digits + 1 letter)
    const pan = formatPan(raw);
    if (pan.length !== 10) return false;
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  }

  const verifyPan = async () => {
    const clean = formatPan(panNumber);
    if (!validatePan(clean)) { setPanError("Invalid PAN format. Use: ABCDE1234F"); return; }
    if (!panHolderName.trim()) { setPanError("Please enter the name as on PAN card."); return; }
    setVerifyingPan(true);
    setPanError("");
    try {
      const resp = await apiFetch<{ success: boolean; message: string }>(
        "/api/kyc/pan/verify",
        {
          method: "POST",
          body: JSON.stringify({ panNumber: clean, name: panHolderName.trim() }),
        },
      );
      setVerifyingPan(false);
      if (resp.success) {
        setPanVerified(true);
        setPanError("");
      } else {
        setPanError(resp.message || "PAN verification failed. Please check the number and try again.");
      }
    } catch (err: any) {
      setVerifyingPan(false);
      setPanError(err.message || "PAN verification failed. Please try again.");
    }
  };

  // ── Can proceed? ──────────────────────────────────────────────────────────
  const canNext = (): boolean => {
    if (step === 1) return !!(fullName.trim() && dob.length === 10 && dobAge !== null && dobAge >= 18 && gender);
    if (step === 2) return otpVerified;
    if (step === 3) return panVerified;
    if (step === 4) return bankVerified;
    return true;
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) { setStep(step + 1); return; }
    // Submit KYC to backend
    try {
      const resp = await apiFetch<{ success: boolean; status: string; message: string }>(
        "/api/kyc/submit",
        {
          method: "POST",
          body: JSON.stringify({
            userId: user?.id,
            aadhaarNumber: aadhaarDigits,
            aadhaarVerified: otpVerified,
            panNumber: formatPan(panNumber),
            panVerified,
            bankAccountNumber: accNumber,
            bankIfsc: ifsc,
            bankName: bankInfo?.name,
            bankHolderName: holderName,
            bankVerified,
          }),
        },
      );
      if (resp.success) {
        updateProfile({
          kycStatus: resp.status === "approved" ? "verified" : "pending",
          aadhaarVerified: otpVerified,
          panVerified,
          aadhaarNumber: `XXXX XXXX ${aadhaarDigits.slice(-4)}`,
          panNumber: `${formatPan(panNumber).slice(0, 2)}XXXX${formatPan(panNumber).slice(6, 7)}XX${formatPan(panNumber).slice(9, 10)}`,
          kycSubmittedAt: new Date().toISOString(),
        });
        setSubmitted(true);
      } else {
        setOtpError(resp.message || "KYC submission failed. Please try again.");
      }
    } catch (err: any) {
      setOtpError(err.message || "KYC submission failed. Please try again.");
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#22C55E20", "#22C55E08", "transparent"]} style={[styles.successGlow, { paddingTop: topPad, pointerEvents: "none" }]} />
        <ScrollView contentContainerStyle={[styles.successWrap, { paddingTop: topPad + 20 }]}>
          <View style={[styles.successIcon, { backgroundColor: "#22C55E20" }]}>
            <Feather name="shield" size={48} color="#22C55E" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>E-KYC Submitted!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Aadhaar, PAN & Bank verification complete. Your earnings will be unlocked within 24 hours after admin review.
          </Text>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: "#22C55E40" }]}>
            <View style={styles.summaryRow}>
              <Feather name="user" size={14} color={colors.mutedForeground} />
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Name</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{fullName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Feather name="calendar" size={14} color={colors.mutedForeground} />
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>DOB / Age</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{dob} · {dobAge} yrs</Text>
            </View>
            <View style={styles.summaryRow}>
              <Feather name="credit-card" size={14} color={colors.mutedForeground} />
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Aadhaar</Text>
              <Text style={[styles.summaryValue, { color: "#22C55E" }]}>✓ OTP Verified</Text>
            </View>
            <View style={styles.summaryRow}>
              <Feather name="file-text" size={14} color={colors.mutedForeground} />
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>PAN</Text>
              <Text style={[styles.summaryValue, { color: "#22C55E" }]}>✓ NSDL Verified</Text>
            </View>
            <View style={styles.summaryRow}>
              <Feather name="home" size={14} color={colors.mutedForeground} />
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Bank A/C</Text>
              <Text style={[styles.summaryValue, { color: "#22C55E" }]}>✓ Penny-Drop Verified</Text>
            </View>
          </View>

          <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { icon: "check-circle", label: "KYC Submitted",         sub: "Just now",         done: true  },
              { icon: "clock",        label: "Admin Review",           sub: "Within 24 hrs",    done: false, active: true },
              { icon: "user-check",   label: "Super Admin Approval",   sub: "After review",     done: false },
              { icon: "unlock",       label: "Earnings Unlocked",      sub: "Post approval",    done: false },
            ].map((item, i, arr) => (
              <View key={i} style={styles.tlRow}>
                <View style={styles.tlLeft}>
                  <View style={[styles.tlDot, { backgroundColor: item.done ? "#22C55E" : item.active ? colors.primary : colors.muted, borderColor: item.done ? "#22C55E" : item.active ? colors.primary : colors.border }]}>
                    <Feather name={item.icon as any} size={13} color={item.done || item.active ? "#fff" : colors.mutedForeground} />
                  </View>
                  {i < arr.length - 1 && <View style={[styles.tlLine, { backgroundColor: item.done ? "#22C55E40" : colors.border }]} />}
                </View>
                <View style={styles.tlContent}>
                  <Text style={[styles.tlLabel, { color: item.done || item.active ? colors.foreground : colors.mutedForeground }]}>{item.label}</Text>
                  <Text style={[styles.tlSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                  {item.active && (
                    <View style={[styles.pendingBadge, { backgroundColor: colors.primary + "20" }]}>
                      <View style={[styles.pendingDot, { backgroundColor: colors.primary }]} />
                      <Text style={[styles.pendingText, { color: colors.primary }]}>In Progress</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          <Pressable onPress={() => router.back()} style={[styles.doneBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.doneBtnText}>Back to Profile</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ── Main flow ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <LinearGradient colors={[colors.secondary + "20", colors.primary + "10", "transparent"]} style={[styles.headerGlow, { height: topPad + 140, pointerEvents: "none" }]} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.background + "F8" }]}>
        <Pressable onPress={() => (step > 1 ? setStep(step - 1) : router.back())} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>E-KYC Verification</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Step {step} of {TOTAL_STEPS} · {STEP_LABELS[step - 1]}
          </Text>
        </View>
        <View style={[styles.kycBadge, { backgroundColor: "#FFB80020", borderColor: "#FFB80040" }]}>
          <Feather name="shield" size={14} color="#FFB800" />
          <Text style={[styles.kycBadgeText, { color: "#FFB800" }]}>Required</Text>
        </View>
      </View>

      <StepBar current={step} colors={colors} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>

        {/* ── STEP 1: Personal Info ─────────────────────────────────── */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Personal Information</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Enter your legal details exactly as they appear on your Aadhaar card.
            </Text>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Full Name (as on Aadhaar) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Enter your legal full name"
                placeholderTextColor={colors.mutedForeground}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Date of Birth with auto-age */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Date of Birth *</Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: dobError ? colors.destructive : dobAge !== null && dobAge >= 18 ? "#22C55E80" : colors.border,
                      color: colors.foreground,
                      letterSpacing: 1.5,
                    },
                  ]}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={colors.mutedForeground}
                  value={dob}
                  onChangeText={handleDob}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {dobAge !== null && dobAge >= 18 && (
                  <View style={[styles.ageBadge, { backgroundColor: "#22C55E20", borderColor: "#22C55E50" }]}>
                    <Feather name="check-circle" size={12} color="#22C55E" />
                    <Text style={[styles.ageBadgeText, { color: "#22C55E" }]}>Age: {dobAge} years</Text>
                  </View>
                )}
              </View>
              {dobError ? (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={12} color={colors.destructive} />
                  <Text style={[styles.errorText, { color: colors.destructive }]}>{dobError}</Text>
                </View>
              ) : dob.length === 10 && dobAge === null ? null : null}
              <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
                Must be 18+. Age is auto-calculated from your DOB.
              </Text>
            </View>

            {/* Gender */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Gender *</Text>
              <View style={styles.genderRow}>
                {(["male", "female"] as const).map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    style={[
                      styles.genderChip,
                      { backgroundColor: gender === g ? colors.primary + "20" : colors.card, borderColor: gender === g ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={[styles.genderChipText, { color: gender === g ? colors.primary : colors.foreground }]}>
                      {g === "male" ? "👨 Male" : "👩 Female"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: colors.secondary + "30" }]}>
              <Feather name="info" size={14} color={colors.secondary} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                Your personal information is encrypted and only used for identity verification. It is never shared with third parties.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 2: Aadhaar OTP ───────────────────────────────────── */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Aadhaar Verification</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              We'll send a 6-digit OTP to the mobile number linked to your Aadhaar via UIDAI.
            </Text>

            {/* Aadhaar number */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Aadhaar Number *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: otpVerified ? "#22C55E80" : aadhaarDigits.length === 12 ? colors.primary + "60" : colors.border,
                    color: colors.foreground,
                    letterSpacing: 2,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 18,
                  },
                ]}
                placeholder="XXXX  XXXX  XXXX"
                placeholderTextColor={colors.mutedForeground}
                value={formatAadhaar(aadhaar)}
                onChangeText={(t) => {
                  if (!otpVerified) setAadhaar(t.replace(/\D/g, "").slice(0, 12));
                }}
                keyboardType="number-pad"
                maxLength={14}
                editable={!otpVerified}
              />
              {aadhaarDigits.length === 12 && (
                <View style={styles.maskedNote}>
                  <Feather name="lock" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.maskedNoteText, { color: colors.mutedForeground }]}>
                    Stored masked: XXXX XXXX {aadhaarDigits.slice(-4)}
                  </Text>
                </View>
              )}
            </View>

            {/* Send OTP */}
            {!otpVerified && (
              <>
                {!otpSent ? (
                  <Pressable
                    onPress={sendOtp}
                    disabled={aadhaarDigits.length !== 12 || sendingOtp}
                    style={[
                      styles.otpSendBtn,
                      {
                        backgroundColor: aadhaarDigits.length === 12 ? colors.primary : colors.muted,
                        opacity: aadhaarDigits.length !== 12 ? 0.5 : 1,
                      },
                    ]}
                  >
                    {sendingOtp ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Feather name="send" size={16} color="#fff" />
                        <Text style={styles.otpSendBtnText}>Send OTP to Aadhaar-linked Mobile</Text>
                      </>
                    )}
                  </Pressable>
                ) : (
                  <View style={styles.fieldGroup}>
                    <View style={[styles.otpSentBanner, { backgroundColor: "#22C55E12", borderColor: "#22C55E40" }]}>
                      <Feather name="check-circle" size={14} color="#22C55E" />
                      <Text style={[styles.otpSentText, { color: "#22C55E" }]}>
                        OTP sent to the mobile number linked to XXXX XXXX {aadhaarDigits.slice(-4)}
                      </Text>
                    </View>

                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                      Enter 6-Digit OTP *
                    </Text>
                    <OtpInput value={otpValue} onChange={setOtpValue} colors={colors} />

                    {otpError ? (
                      <View style={[styles.errorRow, { marginTop: 8 }]}>
                        <Feather name="alert-circle" size={12} color={colors.destructive} />
                        <Text style={[styles.errorText, { color: colors.destructive }]}>{otpError}</Text>
                      </View>
                    ) : null}

                    <Pressable
                      onPress={verifyOtp}
                      disabled={otpValue.length !== 6 || sendingOtp}
                      style={[
                        styles.otpSendBtn,
                        {
                          backgroundColor: otpValue.length === 6 ? colors.primary : colors.muted,
                          marginTop: 16,
                          opacity: otpValue.length !== 6 ? 0.5 : 1,
                        },
                      ]}
                    >
                      {sendingOtp ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Feather name="check-circle" size={16} color="#fff" />
                          <Text style={styles.otpSendBtnText}>Verify OTP</Text>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={resendCooldown > 0 ? undefined : sendOtp}
                      disabled={resendCooldown > 0}
                      style={styles.resendRow}
                    >
                      <Text style={[styles.resendText, { color: resendCooldown > 0 ? colors.mutedForeground : colors.primary }]}>
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}

            {/* Verified state */}
            {otpVerified && (
              <View style={[styles.verifiedBanner, { backgroundColor: "#22C55E12", borderColor: "#22C55E40" }]}>
                <View style={styles.verifiedIconWrap}>
                  <Feather name="shield" size={28} color="#22C55E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.verifiedTitle, { color: "#22C55E" }]}>Aadhaar Verified ✓</Text>
                  <Text style={[styles.verifiedSub, { color: colors.mutedForeground }]}>
                    Identity confirmed via UIDAI OTP. Your Aadhaar is masked and stored securely.
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.tipBox, { backgroundColor: "#FFB80010", borderColor: "#FFB80030", marginTop: 16 }]}>
              <Feather name="lock" size={14} color="#FFB800" />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                We never store your full Aadhaar number. Only the last 4 digits are retained for reference.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 3: PAN Card ────────────────────────────────────── */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>PAN Card Verification</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Enter your Permanent Account Number (PAN) as on your income-tax card. This is mandatory for earnings & withdrawals above ₹10,000/year.
            </Text>

            {/* PAN Holder Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Name (as on PAN Card) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Enter name exactly as on PAN"
                placeholderTextColor={colors.mutedForeground}
                value={panHolderName}
                onChangeText={setPanHolderName}
                editable={!panVerified}
              />
            </View>

            {/* PAN Number */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>PAN Number *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: panVerified
                      ? "#22C55E80"
                      : validatePan(formatPan(panNumber))
                        ? colors.primary + "60"
                        : panNumber.length >= 5
                          ? colors.destructive
                          : colors.border,
                    color: colors.foreground,
                    letterSpacing: 2,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 17,
                  },
                ]}
                placeholder="ABCDE1234F"
                placeholderTextColor={colors.mutedForeground}
                value={formatPan(panNumber)}
                onChangeText={(t) => {
                  if (!panVerified) setPanNumber(formatPan(t));
                }}
                autoCapitalize="characters"
                maxLength={10}
                editable={!panVerified}
              />
              {panNumber.length >= 5 && !validatePan(formatPan(panNumber)) && (
                <View style={[styles.errorRow, { marginTop: 4 }]}>
                  <Feather name="alert-circle" size={12} color={colors.destructive} />
                  <Text style={[styles.errorText, { color: colors.destructive }]}>Format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)</Text>
                </View>
              )}
              {panNumber.length === 10 && validatePan(formatPan(panNumber)) && (
                <View style={styles.maskedNote}>
                  <Feather name="lock" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.maskedNoteText, { color: colors.mutedForeground }]}>
                    Stored masked: {panNumber.slice(0, 2)}XXXX{panNumber.slice(6, 7)}XX{panNumber.slice(9, 10)}
                  </Text>
                </View>
              )}
            </View>

            {/* Verify PAN */}
            {!panVerified && (
              <>
                {panError ? (
                  <View style={[styles.errorRow, { marginBottom: 12 }]}>
                    <Feather name="alert-circle" size={12} color={colors.destructive} />
                    <Text style={[styles.errorText, { color: colors.destructive }]}>{panError}</Text>
                  </View>
                ) : null}
                <Pressable
                  onPress={verifyPan}
                  disabled={!validatePan(formatPan(panNumber)) || !panHolderName.trim() || verifyingPan}
                  style={[
                    styles.otpSendBtn,
                    {
                      backgroundColor:
                        validatePan(formatPan(panNumber)) && panHolderName.trim()
                          ? colors.primary
                          : colors.muted,
                      opacity: validatePan(formatPan(panNumber)) && panHolderName.trim() ? 1 : 0.5,
                    },
                  ]}
                >
                  {verifyingPan ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.otpSendBtnText}>Verifying with NSDL…</Text>
                    </>
                  ) : (
                    <>
                      <Feather name="check-circle" size={16} color="#fff" />
                      <Text style={styles.otpSendBtnText}>Verify PAN</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}

            {panVerified && (
              <View style={[styles.verifiedBanner, { backgroundColor: "#22C55E12", borderColor: "#22C55E40" }]}>
                <View style={styles.verifiedIconWrap}>
                  <Feather name="file-text" size={28} color="#22C55E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.verifiedTitle, { color: "#22C55E" }]}>PAN Verified ✓</Text>
                  <Text style={[styles.verifiedSub, { color: colors.mutedForeground }]}>
                    Identity confirmed via NSDL. Your PAN is masked and stored securely.
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.tipBox, { backgroundColor: "#FFB80010", borderColor: "#FFB80030", marginTop: 16 }]}>
              <Feather name="lock" size={14} color="#FFB800" />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                We never store your full PAN. Only a masked reference is retained. Your PAN is used solely for tax compliance (TDS reporting) as per RBI & IT Dept guidelines.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 4: Bank Account ──────────────────────────────────── */}
        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Bank Account Verification</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Add your bank account. We verify it instantly via a ₹1 penny-drop (refunded immediately).
            </Text>

            {/* Account holder name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Account Holder Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Exactly as in bank records"
                placeholderTextColor={colors.mutedForeground}
                value={holderName}
                onChangeText={setHolderName}
                editable={!bankVerified}
              />
            </View>

            {/* Account number */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Account Number *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_600SemiBold", letterSpacing: 1 }]}
                placeholder="Enter account number"
                placeholderTextColor={colors.mutedForeground}
                value={accNumber}
                onChangeText={(t) => { if (!bankVerified) setAccNumber(t.replace(/\D/g, "")); }}
                keyboardType="number-pad"
                maxLength={18}
                secureTextEntry={false}
              />
            </View>

            {/* Confirm account number */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Confirm Account Number *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: accConfirm && accNumber !== accConfirm ? colors.destructive : accConfirm && accNumber === accConfirm ? "#22C55E80" : colors.border,
                    color: colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    letterSpacing: 1,
                  },
                ]}
                placeholder="Re-enter account number"
                placeholderTextColor={colors.mutedForeground}
                value={accConfirm}
                onChangeText={(t) => { if (!bankVerified) setAccConfirm(t.replace(/\D/g, "")); }}
                keyboardType="number-pad"
                maxLength={18}
              />
              {accConfirm && accNumber !== accConfirm && (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={12} color={colors.destructive} />
                  <Text style={[styles.errorText, { color: colors.destructive }]}>Account numbers do not match.</Text>
                </View>
              )}
            </View>

            {/* IFSC Code with bank auto-detect */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>IFSC Code *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: bankInfo ? colors.primary + "60" : colors.border,
                    color: colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    letterSpacing: 2,
                  },
                ]}
                placeholder="e.g. SBIN0001234"
                placeholderTextColor={colors.mutedForeground}
                value={ifsc}
                onChangeText={handleIfsc}
                autoCapitalize="characters"
                maxLength={11}
                editable={!bankVerified}
              />
              {bankInfo && (
                <View style={[styles.bankDetected, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
                  <Text style={styles.bankDetectedEmoji}>{bankInfo.icon}</Text>
                  <Text style={[styles.bankDetectedName, { color: colors.primary }]}>{bankInfo.name}</Text>
                  <Feather name="check-circle" size={14} color={colors.primary} />
                </View>
              )}
              <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
                Bank name is auto-detected from your IFSC code.
              </Text>
            </View>

            {/* Account type */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Account Type *</Text>
              <View style={styles.genderRow}>
                {(["savings", "current"] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => { if (!bankVerified) setAccType(t); }}
                    style={[
                      styles.genderChip,
                      { flex: 1, backgroundColor: accType === t ? colors.primary + "20" : colors.card, borderColor: accType === t ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={[styles.genderChipText, { color: accType === t ? colors.primary : colors.foreground }]}>
                      {t === "savings" ? "💰 Savings" : "🏢 Current"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Verify button */}
            {!bankVerified && (
              <>
                {bankError ? (
                  <View style={[styles.errorRow, { marginBottom: 12 }]}>
                    <Feather name="alert-circle" size={12} color={colors.destructive} />
                    <Text style={[styles.errorText, { color: colors.destructive }]}>{bankError}</Text>
                  </View>
                ) : null}
                <Pressable
                  onPress={verifyBank}
                  disabled={
                    !accNumber || accNumber !== accConfirm || ifsc.length !== 11 || !holderName || !accType || verifyingBank
                  }
                  style={[
                    styles.otpSendBtn,
                    {
                      backgroundColor:
                        accNumber && accNumber === accConfirm && ifsc.length === 11 && holderName && accType
                          ? colors.primary
                          : colors.muted,
                      opacity: !accNumber || accNumber !== accConfirm || ifsc.length !== 11 || !holderName || !accType ? 0.5 : 1,
                    },
                  ]}
                >
                  {verifyingBank ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.otpSendBtnText}>Verifying via Penny-Drop…</Text>
                    </>
                  ) : (
                    <>
                      <Feather name="check-circle" size={16} color="#fff" />
                      <Text style={styles.otpSendBtnText}>Verify Bank Account</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}

            {bankVerified && (
              <View style={[styles.verifiedBanner, { backgroundColor: "#22C55E12", borderColor: "#22C55E40" }]}>
                <View style={styles.verifiedIconWrap}>
                  <Feather name="home" size={28} color="#22C55E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.verifiedTitle, { color: "#22C55E" }]}>Bank Account Verified ✓</Text>
                  <Text style={[styles.verifiedSub, { color: colors.mutedForeground }]}>
                    {bankInfo?.name || "Your bank"} · {accType ? accType.charAt(0).toUpperCase() + accType.slice(1) : ""} A/C ending in {accNumber.slice(-4)}
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.tipBox, { backgroundColor: "#22C55E10", borderColor: "#22C55E30", marginTop: 16 }]}>
              <Feather name="shield" size={14} color="#22C55E" />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                A ₹1 verification credit is sent and refunded instantly. Your account details are encrypted with bank-grade AES-256 encryption.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 5: Review & Submit ───────────────────────────────── */}
        {step === 5 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Submit</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Please confirm your details before submitting. Once submitted, details cannot be changed for 30 days.
            </Text>

            {/* Personal info summary */}
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.reviewCardHeader}>
                <Feather name="user" size={15} color={colors.primary} />
                <Text style={[styles.reviewCardTitle, { color: colors.foreground }]}>Personal Information</Text>
                <View style={[styles.reviewVerifiedBadge, { backgroundColor: "#22C55E20" }]}>
                  <Feather name="check" size={10} color="#22C55E" />
                  <Text style={[styles.reviewVerifiedText, { color: "#22C55E" }]}>Confirmed</Text>
                </View>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Full Name</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground }]}>{fullName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Date of Birth</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground }]}>{dob}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Age</Text>
                <Text style={[styles.reviewVal, { color: "#22C55E" }]}>{dobAge} years</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Gender</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground }]}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</Text>
              </View>
            </View>

            {/* PAN summary */}
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: "#22C55E40" }]}>
              <View style={styles.reviewCardHeader}>
                <Feather name="file-text" size={15} color="#22C55E" />
                <Text style={[styles.reviewCardTitle, { color: colors.foreground }]}>PAN Card</Text>
                <View style={[styles.reviewVerifiedBadge, { backgroundColor: "#22C55E20" }]}>
                  <Feather name="check" size={10} color="#22C55E" />
                  <Text style={[styles.reviewVerifiedText, { color: "#22C55E" }]}>NSDL Verified</Text>
                </View>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>PAN Holder</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground }]}>{panHolderName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>PAN (masked)</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {panNumber.slice(0, 2)}XXXX{panNumber.slice(6, 7)}XX{panNumber.slice(9, 10)}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Status</Text>
                <Text style={[styles.reviewVal, { color: "#22C55E" }]}>✓ Verified via NSDL</Text>
              </View>
            </View>

            {/* Aadhaar summary */}
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: "#22C55E40" }]}>
              <View style={styles.reviewCardHeader}>
                <Feather name="credit-card" size={15} color="#22C55E" />
                <Text style={[styles.reviewCardTitle, { color: colors.foreground }]}>Aadhaar Verification</Text>
                <View style={[styles.reviewVerifiedBadge, { backgroundColor: "#22C55E20" }]}>
                  <Feather name="check" size={10} color="#22C55E" />
                  <Text style={[styles.reviewVerifiedText, { color: "#22C55E" }]}>OTP Verified</Text>
                </View>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Aadhaar (masked)</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  XXXX XXXX {aadhaarDigits.slice(-4)}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>OTP Status</Text>
                <Text style={[styles.reviewVal, { color: "#22C55E" }]}>✓ Verified via UIDAI</Text>
              </View>
            </View>

            {/* Bank summary */}
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: "#22C55E40" }]}>
              <View style={styles.reviewCardHeader}>
                <Feather name="home" size={15} color="#22C55E" />
                <Text style={[styles.reviewCardTitle, { color: colors.foreground }]}>Bank Account</Text>
                <View style={[styles.reviewVerifiedBadge, { backgroundColor: "#22C55E20" }]}>
                  <Feather name="check" size={10} color="#22C55E" />
                  <Text style={[styles.reviewVerifiedText, { color: "#22C55E" }]}>Penny-Drop OK</Text>
                </View>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Account Holder</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground }]}>{holderName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Account No.</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {"•".repeat(Math.max(0, accNumber.length - 4))}{accNumber.slice(-4)}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Bank</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground }]}>{bankInfo?.name || "—"}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>IFSC</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{ifsc}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewKey, { color: colors.mutedForeground }]}>Type</Text>
                <Text style={[styles.reviewVal, { color: colors.foreground }]}>{accType.charAt(0).toUpperCase() + accType.slice(1)}</Text>
              </View>
            </View>

            <View style={[styles.tipBox, { backgroundColor: "#7B2FBE10", borderColor: "#7B2FBE30", marginTop: 4 }]}>
              <Feather name="info" size={14} color={colors.secondary} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                By submitting, you confirm that all details are accurate and you consent to identity verification as per UIDAI, NSDL & RBI guidelines. Your PAN is required for TDS compliance on earnings.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, borderTopColor: colors.border, backgroundColor: colors.background + "F8" }]}>
        <Pressable
          onPress={handleNext}
          disabled={!canNext()}
          style={[styles.nextBtn, { backgroundColor: canNext() ? colors.primary : colors.muted, opacity: canNext() ? 1 : 0.5 }]}
        >
          <LinearGradient
            colors={canNext() ? [colors.primary, colors.secondary] : [colors.muted, colors.muted]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.nextBtnGrad}
          >
            <Text style={styles.nextBtnText}>
              {step === TOTAL_STEPS ? "Submit E-KYC" : step === 2 && !otpVerified ? "Verify Aadhaar First" : step === 3 && !panVerified ? "Verify PAN First" : "Continue →"}
            </Text>
            {step < TOTAL_STEPS && canNext() && <Feather name="arrow-right" size={18} color="#fff" />}
            {step === TOTAL_STEPS && <Feather name="shield" size={18} color="#fff" />}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlow: { position: "absolute", left: 0, right: 0, top: 0 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 6 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  kycBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  kycBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  stepBarWrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 24 },
  stepDot: { height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  stepDotText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4 },

  stepContent: { padding: 20, gap: 20 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  stepDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: -12 },

  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  fieldHint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  input: {
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: "Inter_400Regular",
  },

  ageBadge: {
    position: "absolute", right: 12, top: "50%", marginTop: -14,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1,
  },
  ageBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  errorRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular" },

  genderRow: { flexDirection: "row", gap: 10 },
  genderChip: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  genderChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Aadhaar OTP
  otpSendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 15, borderRadius: 16 },
  otpSendBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  otpSentBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  otpSentText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
  maskedNote: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  maskedNoteText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  resendRow: { alignItems: "center", paddingVertical: 10 },
  resendText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  otpRow: { flexDirection: "row", gap: 10, justifyContent: "center", paddingVertical: 8 },
  otpHidden: { position: "absolute", opacity: 0, width: 1, height: 1 },
  otpCell: { width: 52, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  otpCellText: { fontSize: 24, fontFamily: "Inter_700Bold", lineHeight: 30 },
  otpCursor: { position: "absolute", bottom: 10, width: 20, height: 2, borderRadius: 1 },

  verifiedBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1.5 },
  verifiedIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#22C55E20", alignItems: "center", justifyContent: "center" },
  verifiedTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  verifiedSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },

  // Bank
  bankDetected: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  bankDetectedEmoji: { fontSize: 18 },
  bankDetectedName: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Review
  reviewCard: { borderRadius: 16, borderWidth: 1.5, overflow: "hidden" },
  reviewCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.08)" },
  reviewCardTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold" },
  reviewVerifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  reviewVerifiedText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  reviewRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.05)" },
  reviewKey: { width: 130, fontSize: 12, fontFamily: "Inter_500Medium" },
  reviewVal: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },

  tipBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  tipText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  nextBtn: { borderRadius: 16, overflow: "hidden" },
  nextBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },

  // Success
  successGlow: { position: "absolute", left: 0, right: 0, top: 0, height: 300 },
  successWrap: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 40, gap: 20 },
  successIcon: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  summaryCard: { width: "100%", borderRadius: 16, borderWidth: 1.5, overflow: "hidden" },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.06)" },
  summaryLabel: { width: 100, fontSize: 12, fontFamily: "Inter_500Medium" },
  summaryValue: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  timelineCard: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16 },
  tlRow: { flexDirection: "row", gap: 12 },
  tlLeft: { alignItems: "center", gap: 0 },
  tlDot: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  tlLine: { width: 2, flex: 1, minHeight: 20, marginVertical: 2 },
  tlContent: { flex: 1, paddingBottom: 18, gap: 2 },
  tlLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tlSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  pendingBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start", marginTop: 4 },
  pendingDot: { width: 6, height: 6, borderRadius: 3 },
  pendingText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  doneBtn: { paddingVertical: 16, paddingHorizontal: 48, borderRadius: 16 },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});

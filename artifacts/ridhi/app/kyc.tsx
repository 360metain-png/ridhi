import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/utils/api";
import * as ImagePicker from "expo-image-picker";

const TOTAL_STEPS = 4;
const STEP_LABELS = ["Select Roles", "Upload Documents", "Review & Submit", "Status"];

const ROLE_META: { key: "host" | "creator" | "agent"; label: string; desc: string; color: string }[] = [
  { key: "host", label: "Host", desc: "Go live, receive gifts & coins", color: "#E91E8C" },
  { key: "creator", label: "Creator", desc: "Monetize content & posts", color: "#FFB800" },
  { key: "agent", label: "Agent", desc: "Recruit hosts & earn commission", color: "#00BCD4" },
];

const DOC_TYPES: { key: string; label: string; sublabel: string; required: boolean; mode: "camera" | "gallery" }[] = [
  { key: "aadhaarFront", label: "Aadhaar Card — Front", sublabel: "Take a live photo of the front side", required: true, mode: "camera" },
  { key: "aadhaarBack", label: "Aadhaar Card — Back", sublabel: "Take a live photo of the back side", required: true, mode: "camera" },
  { key: "pan", label: "PAN Card", sublabel: "Take a live photo of your PAN card", required: true, mode: "camera" },
  { key: "bankProof", label: "Bank Proof", sublabel: "Upload passbook page or cancelled cheque", required: true, mode: "gallery" },
];

interface DocImage {
  uri: string;
  base64: string;
}

// ── Helpers ─────────────────────────────────────────────────────

function formatAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function maskAadhaar(formatted: string): string {
  const digits = formatted.replace(/\s/g, "");
  return `XXXX XXXX ${digits.slice(-4)}`;
}

function isValidAadhaar(v: string): boolean {
  return /^\d{4}\s\d{4}\s\d{4}$/.test(v) && v.replace(/\s/g, "").length === 12;
}

function isValidPan(v: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase());
}

function isValidIfsc(v: string): boolean {
  return /^[A-Z]{4}[0-9]{7}$/.test(v.toUpperCase());
}

function isValidAccount(v: string): boolean {
  return /^\d{9,18}$/.test(v);
}

// ── Step Bar ────────────────────────────────────────────────────────────

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

// ── Status Badge ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const meta: Record<string, { bg: string; border: string; text: string; label: string; icon: string }> = {
    pending: { bg: "#FFB80018", border: "#FFB80040", text: "#FFB800", label: "Pending Review", icon: "clock" },
    under_review: { bg: "#E91E8C18", border: "#E91E8C40", text: "#E91E8C", label: "Under Review", icon: "loader" },
    approved: { bg: "#22C55E18", border: "#22C55E40", text: "#22C55E", label: "Approved", icon: "check-circle" },
    rejected: { bg: "#FF3B3018", border: "#FF3B3040", text: "#FF3B30", label: "Rejected", icon: "x-circle" },
    not_started: { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", text: "#888", label: "Not Started", icon: "circle" },
  };
  const m = meta[status] || meta.not_started;
  return (
    <View style={[styles.statusBadge, { backgroundColor: m.bg, borderColor: m.border }]}>
      <Feather name={m.icon as any} size={13} color={m.text} />
      <Text style={[styles.statusBadgeText, { color: m.text }]}>{m.label}</Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────

export default function KYCScreen() {
  useTrackScreen("kyc");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Roles
  const [roles, setRoles] = useState<("host" | "creator" | "agent")[]>([]);

  // Step 2: Documents
  const [docs, setDocs] = useState<Record<string, DocImage | null>>({
    aadhaarFront: null,
    aadhaarBack: null,
    pan: null,
    bankProof: null,
  });

  // Step 2: Manual info
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankHolder, setBankHolder] = useState(user?.name ?? "");

  // Status
  const [kycStatus, setKycStatus] = useState<any>(null);

  // Fetch existing status on mount
  useEffect(() => {
    if (!user?.id) return;
    setFetching(true);
    apiFetch<{ success: boolean; kyc: any }>(`/api/kyc/status/${user.id}`)
      .then((res) => {
        if (res.success && res.kyc) {
          setKycStatus(res.kyc);
          // If already submitted, jump to status step
          if (res.kyc.status !== "not_started") {
            setStep(4);
          }
          // Pre-fill roles if they exist
          if (res.kyc.roles?.length) {
            setRoles(res.kyc.roles);
          }
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user?.id]);

  const toggleRole = (role: "host" | "creator" | "agent") => {
    setRoles((prev) => {
      if (prev.includes(role)) return prev.filter((r) => r !== role);
      // Host and Agent are mutually exclusive — pick one, not both
      let next = [...prev, role];
      if (role === "host" && next.includes("agent")) next = next.filter((r) => r !== "agent");
      if (role === "agent" && next.includes("host")) next = next.filter((r) => r !== "host");
      return next;
    });
    setError("");
  };

  const pickCamera = async (docKey: string) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow camera access to take live photos of your documents.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];
      setDocs((prev) => ({
        ...prev,
        [docKey]: { uri: asset.uri, base64: asset.base64 ?? "" },
      }));
      setError("");
    } catch {
      Alert.alert("Camera Error", "Could not take a photo. Please try again.");
    }
  };

  const pickGallery = async (docKey: string) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow access to your gallery to upload the bank document.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];
      setDocs((prev) => ({
        ...prev,
        [docKey]: { uri: asset.uri, base64: asset.base64 ?? "" },
      }));
      setError("");
    } catch {
      Alert.alert("Gallery Error", "Could not select photo. Please try again.");
    }
  };

  const removeImage = (docKey: string) => {
    setDocs((prev) => ({ ...prev, [docKey]: null }));
  };

  const canProceedStep1 = roles.length > 0;

  const canProceedStep2 =
    docs.aadhaarFront &&
    docs.aadhaarBack &&
    docs.pan &&
    docs.bankProof &&
    isValidAadhaar(aadhaarNumber) &&
    isValidPan(panNumber) &&
    isValidAccount(bankAccount) &&
    isValidIfsc(bankIfsc) &&
    bankName.trim().length > 0 &&
    bankHolder.trim().length > 0;

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Please log in to submit KYC.");
      return;
    }
    if (!canProceedStep2) {
      setError("Please fill all required fields and upload all documents.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; message: string; status: string }>("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          roles,
          aadhaarNumber: maskAadhaar(aadhaarNumber),
          aadhaarFrontImage: docs.aadhaarFront?.base64,
          aadhaarBackImage: docs.aadhaarBack?.base64,
          panNumber: panNumber.toUpperCase(),
          panImage: docs.pan?.base64,
          bankAccountNumber: bankAccount,
          bankIfsc: bankIfsc.toUpperCase(),
          bankName: bankName.trim(),
          bankHolderName: bankHolder.trim(),
          bankProofImage: docs.bankProof?.base64,
        }),
      });
      if (res.success) {
        setKycStatus({
          status: "pending",
          reviewStatus: "pending",
          roles,
          aadhaarNumber: maskAadhaar(aadhaarNumber),
          panNumber: panNumber.toUpperCase(),
          bankName,
          bankIfsc: bankIfsc.toUpperCase(),
          submittedAt: new Date().toISOString(),
        });
        setStep(4);
        Alert.alert("Submitted", "Your KYC documents have been submitted for admin review.");
      } else {
        setError(res.message || "Submission failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = useCallback(async () => {
    if (!user?.id) return;
    setFetching(true);
    try {
      const res = await apiFetch<{ success: boolean; kyc: any }>(`/api/kyc/status/${user.id}`);
      if (res.success && res.kyc) setKycStatus(res.kyc);
    } catch {}
    setFetching(false);
  }, [user?.id]);

  // ── Render ────────────────────────────────────────────────────────

  if (fetching && step === 1 && !kycStatus) {
    return (
      <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.background }]}>
      <PrivateHead />

      {/* ── Navigation Header ── */}
      <View style={styles.navHeader}>
        <Pressable onPress={() => router.back()} style={styles.navBackBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>E-Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <StepBar current={step} colors={colors} />
        <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
          Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
        </Text>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: "#FF3B3018", borderColor: "#FF3B3030" }]}>
            <Feather name="alert-circle" size={16} color="#FF3B30" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* ─── Step 1: Role Selection ─── */}
        {step === 1 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>I want to earn as</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Select one or more roles to start earning.
            </Text>

            {/* Locked banner when resubmitting */}
            {kycStatus && kycStatus.roles?.length > 0 && (
              <View style={[styles.reviewCard, { backgroundColor: "#FFB80010", borderColor: "#FFB80030", marginBottom: 12 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="lock" size={16} color="#FFB800" />
                  <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#FFB800" }}>
                    Roles locked — resubmitting same roles
                  </Text>
                </View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 4 }}>
                  Roles cannot be changed after first submission. To switch roles, delete your account in Settings and start fresh.
                </Text>
              </View>
            )}

            <View style={{ gap: 12, marginTop: 16 }}>
              {ROLE_META.map((role) => {
                const active = roles.includes(role.key);
                const locked = kycStatus && kycStatus.roles?.length > 0;
                return (
                  <Pressable
                    key={role.key}
                    onPress={() => !locked && toggleRole(role.key)}
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: active ? role.color + "15" : "rgba(255,255,255,0.04)",
                        borderColor: active ? role.color + "50" : "rgba(255,255,255,0.08)",
                        borderWidth: active ? 1.5 : 1,
                        opacity: locked ? 0.55 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.roleIcon, { backgroundColor: role.color + "20" }]}>
                      <Feather
                        name={role.key === "host" ? "video" : "pen-tool"}
                        size={20}
                        color={role.color}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.roleLabel, { color: colors.foreground }]}>{role.label}</Text>
                      <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{role.desc}</Text>
                    </View>
                    <View
                      style={[
                        styles.roleCheck,
                        {
                          backgroundColor: active ? role.color : "transparent",
                          borderColor: active ? role.color : "rgba(255,255,255,0.2)",
                        },
                      ]}
                    >
                      {active && (locked ? <Feather name="lock" size={10} color="#fff" /> : <Feather name="check" size={12} color="#fff" />)}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => {
                if (!canProceedStep1) {
                  setError("Please select at least one role to continue.");
                  return;
                }
                setError("");
                setStep(2);
              }}
              style={[styles.actionBtn, { backgroundColor: colors.primary, opacity: canProceedStep1 ? 1 : 0.5 }]}>
              <Text style={styles.actionBtnText}>Continue</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </Pressable>
          </>
        )}

        {/* ─── Step 2: Document Upload + Details ─── */}
        {step === 2 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upload Documents</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              All documents are required for verification. We never share them with third parties.
            </Text>

            <View style={{ gap: 14, marginTop: 16 }}>
              {DOC_TYPES.map((doc) => {
                const img = docs[doc.key];
                return (
                  <View key={doc.key} style={[styles.docCard, { backgroundColor: "rgba(255,255,255,0.03)", borderColor: img ? "#22C55E40" : "rgba(255,255,255,0.08)" }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: img ? 10 : 0 }}>
                      <Feather name={img ? "check-circle" : "image"} size={16} color={img ? "#22C55E" : colors.mutedForeground} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.docLabel, { color: colors.foreground }]}>
                          {doc.label} {doc.required && <Text style={{ color: "#FF3B30" }}>*</Text>}
                        </Text>
                        <Text style={[styles.docSublabel, { color: colors.mutedForeground }]}>{doc.sublabel}</Text>
                      </View>
                      {img && (
                        <Pressable onPress={() => removeImage(doc.key)} style={{ padding: 4 }}>
                          <Feather name="trash-2" size={16} color="#FF3B30" />
                        </Pressable>
                      )}
                    </View>

                    {img ? (
                      <Image source={{ uri: img.uri }} style={styles.docPreview} resizeMode="cover" />
                    ) : (
                      <Pressable
                        onPress={() => doc.mode === "camera" ? pickCamera(doc.key) : pickGallery(doc.key)}
                        style={[styles.docUploadBtn, { borderColor: "rgba(255,255,255,0.15)" }]}
                      >
                        <Feather name={doc.mode === "camera" ? "camera" : "upload"} size={22} color={colors.mutedForeground} />
                        <Text style={[styles.docUploadText, { color: colors.mutedForeground }]}>
                          {doc.mode === "camera" ? "Tap to take photo" : "Tap to upload"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Manual Info */}
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Document Details</Text>

            <View style={{ gap: 14, marginTop: 10 }}>
              {/* Aadhaar */}
              <View>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Aadhaar Number *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: isValidAadhaar(aadhaarNumber) ? "#22C55E40" : "rgba(255,255,255,0.1)" }]}
                  keyboardType="number-pad"
                  maxLength={14}
                  placeholder="XXXX XXXX XXXX"
                  placeholderTextColor={colors.mutedForeground}
                  value={aadhaarNumber}
                  onChangeText={(t) => setAadhaarNumber(formatAadhaar(t))}
                />
              </View>

              {/* PAN */}
              <View>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>PAN Number *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: isValidPan(panNumber) ? "#22C55E40" : "rgba(255,255,255,0.1)" }]}
                  autoCapitalize="characters"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  placeholderTextColor={colors.mutedForeground}
                  value={panNumber}
                  onChangeText={setPanNumber}
                />
              </View>

              {/* Bank Account */}
              <View>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Bank Account Number *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: isValidAccount(bankAccount) ? "#22C55E40" : "rgba(255,255,255,0.1)" }]}
                  keyboardType="number-pad"
                  placeholder="Enter account number"
                  placeholderTextColor={colors.mutedForeground}
                  value={bankAccount}
                  onChangeText={setBankAccount}
                />
              </View>

              {/* IFSC */}
              <View>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>IFSC Code *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: isValidIfsc(bankIfsc) ? "#22C55E40" : "rgba(255,255,255,0.1)" }]}
                  autoCapitalize="characters"
                  maxLength={11}
                  placeholder="SBIN0001234"
                  placeholderTextColor={colors.mutedForeground}
                  value={bankIfsc}
                  onChangeText={setBankIfsc}
                />
              </View>

              {/* Bank Name */}
              <View>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Bank Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: bankName.trim() ? "#22C55E40" : "rgba(255,255,255,0.1)" }]}
                  placeholder="e.g. State Bank of India"
                  placeholderTextColor={colors.mutedForeground}
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              {/* Holder Name */}
              <View>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Account Holder Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: bankHolder.trim() ? "#22C55E40" : "rgba(255,255,255,0.1)" }]}
                  placeholder="Full name as per bank records"
                  placeholderTextColor={colors.mutedForeground}
                  value={bankHolder}
                  onChangeText={setBankHolder}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
              <Pressable onPress={() => setStep(1)} style={[styles.backBtn, { borderColor: "rgba(255,255,255,0.15)" }]}>
                <Feather name="arrow-left" size={16} color={colors.foreground} />
                <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!canProceedStep2) {
                    setError("Please upload all documents and fill all required fields correctly.");
                    return;
                  }
                  setError("");
                  setStep(3);
                }}
                style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 1, opacity: canProceedStep2 ? 1 : 0.5 }]}
              >
                <Text style={styles.actionBtnText}>Review</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </Pressable>
            </View>
          </>
        )}

        {/* ─── Step 3: Review ─── */}
        {step === 3 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Review Your Submission</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Please verify everything is correct before submitting for admin review.
            </Text>

            {/* Roles */}
            <View style={[styles.reviewCard, { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }]}>
              <Text style={[styles.reviewSectionTitle, { color: colors.foreground }]}>Selected Roles</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {roles.map((r) => {
                  const meta = ROLE_META.find((m) => m.key === r)!;
                  return (
                    <View key={r} style={[styles.reviewRoleChip, { backgroundColor: meta.color + "18", borderColor: meta.color + "30" }]}>
                      <Feather name={r === "host" ? "video" : "pen-tool"} size={12} color={meta.color} />
                      <Text style={[styles.reviewRoleText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Documents */}
            <View style={[styles.reviewCard, { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }]}>
              <Text style={[styles.reviewSectionTitle, { color: colors.foreground }]}>Documents</Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                {DOC_TYPES.map((doc) => (
                  <View key={doc.key} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Feather name={docs[doc.key] ? "check" : "x"} size={14} color={docs[doc.key] ? "#22C55E" : "#FF3B30"} />
                    <Text style={[styles.reviewItem, { color: colors.foreground }]}>{doc.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Details */}
            <View style={[styles.reviewCard, { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }]}>
              <Text style={[styles.reviewSectionTitle, { color: colors.foreground }]}>Details</Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                <ReviewRow label="Aadhaar" value={maskAadhaar(aadhaarNumber)} />
                <ReviewRow label="PAN" value={panNumber.toUpperCase()} />
                <ReviewRow label="Account" value={bankAccount} />
                <ReviewRow label="IFSC" value={bankIfsc.toUpperCase()} />
                <ReviewRow label="Bank" value={bankName} />
                <ReviewRow label="Holder" value={bankHolder} />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
              <Pressable onPress={() => setStep(2)} style={[styles.backBtn, { borderColor: "rgba(255,255,255,0.15)" }]}>
                <Feather name="arrow-left" size={16} color={colors.foreground} />
                <Text style={[styles.backBtnText, { color: colors.foreground }]}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.actionBtn, { backgroundColor: "#22C55E", flex: 1, opacity: loading ? 0.6 : 1 }]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="check-circle" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Submit for Review</Text>
                  </>
                )}
              </Pressable>
            </View>
          </>
        )}

        {/* ─── Step 4: Status ─── */}
        {step === 4 && (
          <>
            {kycStatus ? (
              <View style={{ alignItems: "center", marginTop: 8 }}>
                <StatusBadge status={kycStatus.reviewStatus || kycStatus.status} />

                {kycStatus.roles?.length > 0 && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 14, justifyContent: "center" }}>
                    {kycStatus.roles.map((r: string) => {
                      const meta = ROLE_META.find((m) => m.key === r);
                      if (!meta) return null;
                      return (
                        <View key={r} style={[styles.reviewRoleChip, { backgroundColor: meta.color + "18", borderColor: meta.color + "30" }]}>
                          <Text style={[styles.reviewRoleText, { color: meta.color }]}>{meta.label}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={[styles.statusCard, { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }]}>
                  <Text style={[styles.statusTitle, { color: colors.foreground }]}>
                    {kycStatus.reviewStatus === "approved"
                      ? "You are verified and ready to earn!"
                      : kycStatus.reviewStatus === "rejected"
                      ? "Your verification was rejected"
                      : kycStatus.reviewStatus === "under_review"
                      ? "Your documents are being reviewed"
                      : "Your documents are queued for review"}
                  </Text>
                  <Text style={[styles.statusDesc, { color: colors.mutedForeground }]}>
                    {kycStatus.reviewStatus === "approved"
                      ? "Super Admin has approved your E-Verification. You can now start earning as a Host and/or Creator."
                      : kycStatus.reviewStatus === "rejected"
                      ? "Please review the admin comment below and resubmit your corrected documents."
                      : "Super Admin will review your documents shortly. This usually takes 1-2 business days."}
                  </Text>
                </View>

                {/* Admin Comment */}
                {kycStatus.adminComment && (
                  <View style={[styles.adminCommentCard, { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }]}>
                    <Text style={[styles.adminCommentTitle, { color: colors.foreground }]}>
                      <Feather name="message-square" size={14} color={colors.primary} /> Admin Note
                    </Text>
                    <Text style={[styles.adminCommentText, { color: colors.mutedForeground }]}>{kycStatus.adminComment}</Text>
                    {kycStatus.reviewedBy && (
                      <Text style={[styles.adminCommentMeta, { color: colors.mutedForeground }]}>
                        — {kycStatus.reviewedBy}
                        {kycStatus.reviewedAt ? " · " + new Date(kycStatus.reviewedAt).toLocaleDateString() : ""}
                      </Text>
                    )}
                  </View>
                )}

                {kycStatus.reviewStatus === "rejected" && (
                  <View style={{ marginTop: 16, gap: 12 }}>
                    <Text style={[styles.sectionSub, { color: colors.mutedForeground, textAlign: "center", fontSize: 12 }]}>
                      Roles are permanently locked. You may only re-upload corrected documents for the same roles.
                    </Text>
                    <Pressable
                      onPress={() => {
                        setStep(1);
                        setKycStatus(null);
                      }}
                      style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    >
                      <Feather name="refresh-cw" size={16} color="#fff" />
                      <Text style={styles.actionBtnText}>Resubmit Documents</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push("/settings" as any)}
                      style={{ alignItems: "center", paddingVertical: 8 }}
                    >
                      <Text style={[styles.sectionSub, { color: colors.primary, fontSize: 12 }]}>
                        Want different roles? Go to Settings to delete your account and start fresh.
                      </Text>
                    </Pressable>
                  </View>
                )}

                <Pressable
                  onPress={refreshStatus}
                  disabled={fetching}
                  style={[styles.backBtn, { borderColor: "rgba(255,255,255,0.15)", marginTop: 10 }]}
                >
                  <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.backBtnText, { color: colors.mutedForeground }]}>
                    {fetching ? "Refreshing..." : "Refresh Status"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Feather name="shield" size={48} color={colors.mutedForeground} />
                <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 16 }]}>No Verification Yet</Text>
                <Text style={[styles.sectionSub, { color: colors.mutedForeground, textAlign: "center" }]}>
                  Complete your E-Verification to start earning as a Host or Creator.
                </Text>
                <Pressable onPress={() => setStep(1)} style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 20 }]}>
                  <Feather name="shield" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Start Verification</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" }}>{label}</Text>
      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff", textAlign: "right" }}>{value}</Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  navBackBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  stepBarWrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12, paddingHorizontal: 20 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4, borderRadius: 1 },
  stepLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center", marginBottom: 16 },

  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 4 },

  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  errorBannerText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#FF3B30", flex: 1 },

  roleCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16 },
  roleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  roleLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  roleDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  roleCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },

  docCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  docLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  docSublabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  docUploadBtn: { borderWidth: 1, borderStyle: "dashed", borderRadius: 12, paddingVertical: 24, alignItems: "center", gap: 6, marginTop: 8 },
  docUploadText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  docPreview: { width: "100%", height: 160, borderRadius: 12, marginTop: 8 },

  inputLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, fontFamily: "Inter_500Medium" },

  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 20 },
  actionBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  backBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, marginTop: 20 },
  backBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  reviewCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 14 },
  reviewSectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  reviewRoleChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  reviewRoleText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  reviewItem: { fontSize: 13, fontFamily: "Inter_500Medium" },

  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  statusBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },

  statusCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 16, width: "100%" },
  statusTitle: { fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "center" },
  statusDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, textAlign: "center", marginTop: 8 },

  adminCommentCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 14, width: "100%" },
  adminCommentTitle: { fontSize: 13, fontFamily: "Inter_700Bold", gap: 6 },
  adminCommentText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginTop: 8 },
  adminCommentMeta: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 8 },
});

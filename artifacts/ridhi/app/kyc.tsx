import React, { useState } from "react";
import {
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
import { useAuth } from "@/contexts/AuthContext";

const TOTAL_STEPS = 5;

const ID_TYPES = [
  { id: "aadhaar", label: "Aadhaar Card", icon: "credit-card", hint: "12-digit number", hasBack: true },
  { id: "pan", label: "PAN Card", icon: "credit-card", hint: "ABCDE1234F format", hasBack: false },
  { id: "passport", label: "Passport", icon: "book-open", hint: "Letter + 7 digits", hasBack: true },
  { id: "voter", label: "Voter ID", icon: "check-square", hint: "Voter card number", hasBack: true },
  { id: "driving", label: "Driving Licence", icon: "truck", hint: "DL number", hasBack: true },
];

const ADDR_TYPES = [
  { id: "utility", label: "Electricity / Water Bill", icon: "zap" },
  { id: "bank", label: "Bank Statement", icon: "home" },
  { id: "rent", label: "Rent Agreement", icon: "file-text" },
  { id: "property", label: "Property Tax Receipt", icon: "map-pin" },
  { id: "ration", label: "Ration Card", icon: "list" },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala",
  "Maharashtra", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "West Bengal", "Punjab", "Haryana", "Bihar", "Odisha",
];

type UploadState = "idle" | "uploading" | "done";

function UploadBox({
  label,
  icon,
  state,
  onPress,
  colors,
}: {
  label: string;
  icon: string;
  state: UploadState;
  onPress: () => void;
  colors: any;
}) {
  const isDone = state === "done";
  const isUploading = state === "uploading";
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.uploadBox,
        {
          backgroundColor: isDone ? "#22C55E10" : colors.card,
          borderColor: isDone ? "#22C55E60" : isUploading ? colors.primary + "80" : colors.border,
          borderStyle: isDone ? "solid" : "dashed",
        },
      ]}
    >
      {isDone ? (
        <>
          <View style={[styles.uploadDoneIcon, { backgroundColor: "#22C55E20" }]}>
            <Feather name="check-circle" size={26} color="#22C55E" />
          </View>
          <Text style={[styles.uploadLabel, { color: "#22C55E" }]}>Uploaded ✓</Text>
          <Text style={[styles.uploadHint, { color: colors.mutedForeground }]}>Tap to replace</Text>
        </>
      ) : isUploading ? (
        <>
          <View style={[styles.uploadDoneIcon, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="loader" size={26} color={colors.primary} />
          </View>
          <Text style={[styles.uploadLabel, { color: colors.primary }]}>Uploading…</Text>
        </>
      ) : (
        <>
          <View style={[styles.uploadDoneIcon, { backgroundColor: colors.muted }]}>
            <Feather name={icon as any} size={26} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.uploadLabel, { color: colors.foreground }]}>{label}</Text>
          <Text style={[styles.uploadHint, { color: colors.mutedForeground }]}>
            Camera or Gallery
          </Text>
          <View style={styles.uploadBtnRow}>
            <View style={[styles.uploadMiniBtn, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="camera" size={13} color={colors.primary} />
              <Text style={[styles.uploadMiniBtnText, { color: colors.primary }]}>Camera</Text>
            </View>
            <View style={[styles.uploadMiniBtn, { backgroundColor: colors.secondary + "15" }]}>
              <Feather name="image" size={13} color={colors.secondary} />
              <Text style={[styles.uploadMiniBtnText, { color: colors.secondary }]}>Gallery</Text>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}

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
                <Text style={[styles.stepDotText, { color: active ? "#fff" : colors.mutedForeground }]}>
                  {step}
                </Text>
              )}
            </View>
            {step < TOTAL_STEPS && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: done ? "#22C55E" : colors.border },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const STEP_LABELS = [
  "Personal Info",
  "Identity Proof",
  "Address Proof",
  "Selfie Verify",
  "Review & Submit",
];

export default function KYCScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 — Personal Info
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Step 2 — Identity Proof
  const [idType, setIdType] = useState(ID_TYPES[0].id);
  const [idNumber, setIdNumber] = useState("");
  const [idFront, setIdFront] = useState<UploadState>("idle");
  const [idBack, setIdBack] = useState<UploadState>("idle");

  // Step 3 — Address Proof
  const [addrType, setAddrType] = useState(ADDR_TYPES[0].id);
  const [addrDoc, setAddrDoc] = useState<UploadState>("idle");

  // Step 4 — Selfie
  const [selfie, setSelfie] = useState<UploadState>("idle");

  const selectedId = ID_TYPES.find((t) => t.id === idType)!;

  const simulateUpload = (setter: React.Dispatch<React.SetStateAction<UploadState>>) => {
    setter("uploading");
    setTimeout(() => setter("done"), 1500 + Math.random() * 800);
  };

  const canNext = () => {
    if (step === 1) return fullName && dob && gender && address1 && city && state && pincode.length === 6;
    if (step === 2) return idNumber && idFront === "done" && (!selectedId.hasBack || idBack === "done");
    if (step === 3) return addrDoc === "done";
    if (step === 4) return selfie === "done";
    return true;
  };

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={["#22C55E20", "#22C55E08", "transparent"]}
          style={[styles.successGlow, { paddingTop: topPad }]}
          pointerEvents="none"
        />
        <ScrollView contentContainerStyle={[styles.successWrap, { paddingTop: topPad + 20 }]}>
          <View style={[styles.successIcon, { backgroundColor: "#22C55E20" }]}>
            <Feather name="shield" size={48} color="#22C55E" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>KYC Submitted!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your documents are under review. Earnings will be unlocked within 24–48 hours after approval.
          </Text>

          {/* Timeline */}
          <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { icon: "check-circle", label: "Documents Submitted", sub: "Just now", done: true },
              { icon: "clock", label: "Admin Review", sub: "Within 24 hrs", done: false, active: true },
              { icon: "user-check", label: "Super Admin Approval", sub: "After admin review", done: false },
              { icon: "unlock", label: "Earnings Unlocked", sub: "Post approval", done: false },
            ].map((item, i, arr) => (
              <View key={i} style={styles.tlRow}>
                <View style={styles.tlLeft}>
                  <View
                    style={[
                      styles.tlDot,
                      {
                        backgroundColor: item.done ? "#22C55E" : item.active ? colors.primary : colors.muted,
                        borderColor: item.done ? "#22C55E" : item.active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Feather name={item.icon as any} size={13} color={item.done || item.active ? "#fff" : colors.mutedForeground} />
                  </View>
                  {i < arr.length - 1 && (
                    <View style={[styles.tlLine, { backgroundColor: item.done ? "#22C55E40" : colors.border }]} />
                  )}
                </View>
                <View style={styles.tlContent}>
                  <Text style={[styles.tlLabel, { color: item.done || item.active ? colors.foreground : colors.mutedForeground }]}>
                    {item.label}
                  </Text>
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

          <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: "#FFB80040" }]}>
            <Feather name="info" size={16} color="#FFB800" />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              You will receive a notification once your KYC is approved or if additional documents are required.
            </Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.doneBtnText}>Back to Profile</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.secondary + "20", colors.primary + "10", "transparent"]}
        style={[styles.headerGlow, { height: topPad + 140 }]}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.surface + "F8" }]}>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── STEP 1: Personal Info ─────────────────────────── */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Personal Information</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Enter your legal details exactly as they appear on your government-issued ID.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Full Name (as on ID) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Enter your legal full name"
                placeholderTextColor={colors.mutedForeground}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Date of Birth *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.mutedForeground}
                value={dob}
                onChangeText={setDob}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Gender *</Text>
              <View style={styles.genderRow}>
                {(["male", "female", "other"] as const).map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    style={[
                      styles.genderChip,
                      {
                        backgroundColor: gender === g ? colors.primary + "20" : colors.card,
                        borderColor: gender === g ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.genderChipText, { color: gender === g ? colors.primary : colors.foreground }]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={[styles.fieldGroup, { gap: 10 }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Current Address *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="House / Flat / Building, Street"
                placeholderTextColor={colors.mutedForeground}
                value={address1}
                onChangeText={setAddress1}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Area / Landmark (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={address2}
                onChangeText={setAddress2}
              />
              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="City *"
                  placeholderTextColor={colors.mutedForeground}
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Pincode *"
                  placeholderTextColor={colors.mutedForeground}
                  value={pincode}
                  onChangeText={(t) => setPincode(t.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>State *</Text>
              <View style={styles.stateGrid}>
                {INDIAN_STATES.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setState(s)}
                    style={[
                      styles.stateChip,
                      { backgroundColor: state === s ? colors.primary : colors.card, borderColor: state === s ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={[styles.stateChipText, { color: state === s ? "#fff" : colors.foreground }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── STEP 2: Identity Proof ────────────────────────── */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Identity Proof</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Upload a clear, unedited photo of your government ID. All 4 corners must be visible.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Select Document Type *</Text>
            <View style={styles.docTypeGrid}>
              {ID_TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => { setIdType(t.id); setIdNumber(""); setIdFront("idle"); setIdBack("idle"); }}
                  style={[
                    styles.docTypeCard,
                    { backgroundColor: idType === t.id ? colors.primary + "15" : colors.card, borderColor: idType === t.id ? colors.primary : colors.border },
                  ]}
                >
                  <Feather name={t.icon as any} size={18} color={idType === t.id ? colors.primary : colors.mutedForeground} />
                  <Text style={[styles.docTypeLabel, { color: idType === t.id ? colors.primary : colors.foreground }]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                {selectedId.label} Number * <Text style={{ fontFamily: "Inter_400Regular" }}>({selectedId.hint})</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 }]}
                placeholder={selectedId.hint}
                placeholderTextColor={colors.mutedForeground}
                value={idNumber}
                onChangeText={setIdNumber}
                autoCapitalize="characters"
              />
            </View>

            <UploadBox label="Front Side" icon="camera" state={idFront} onPress={() => simulateUpload(setIdFront)} colors={colors} />
            {selectedId.hasBack && (
              <UploadBox label="Back Side" icon="camera" state={idBack} onPress={() => simulateUpload(setIdBack)} colors={colors} />
            )}

            <View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: colors.primary + "30" }]}>
              <Feather name="info" size={14} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                Accepted formats: JPG, PNG, PDF. Max size 5 MB. Ensure the photo is well-lit and not blurry.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 3: Address Proof ─────────────────────────── */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Address Proof</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              The document must match the address entered in Step 1 and be issued within the last 3 months.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Document Type *</Text>
            <View style={styles.addrTypeList}>
              {ADDR_TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setAddrType(t.id)}
                  style={[
                    styles.addrTypeRow,
                    { backgroundColor: addrType === t.id ? colors.primary + "12" : colors.card, borderColor: addrType === t.id ? colors.primary : colors.border },
                  ]}
                >
                  <View style={[styles.addrTypeIcon, { backgroundColor: addrType === t.id ? colors.primary + "20" : colors.muted }]}>
                    <Feather name={t.icon as any} size={16} color={addrType === t.id ? colors.primary : colors.mutedForeground} />
                  </View>
                  <Text style={[styles.addrTypeLabel, { color: addrType === t.id ? colors.primary : colors.foreground }]}>{t.label}</Text>
                  {addrType === t.id && <Feather name="check-circle" size={16} color={colors.primary} />}
                </Pressable>
              ))}
            </View>

            <View style={{ marginTop: 16 }}>
              <UploadBox label="Upload Document" icon="file-text" state={addrDoc} onPress={() => simulateUpload(setAddrDoc)} colors={colors} />
            </View>

            <View style={[styles.tipBox, { backgroundColor: "#FFB80010", borderColor: "#FFB80030" }]}>
              <Feather name="alert-circle" size={14} color="#FFB800" />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                Name and address on the document must match exactly. Edited or cropped documents will be rejected.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 4: Selfie Verification ──────────────────── */}
        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Live Selfie Verification</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Take a live photo holding your identity document next to your face. This confirms you are the document holder.
            </Text>

            <View style={[styles.selfieGuideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.selfieGuideEmoji}>🤳</Text>
              <Text style={[styles.selfieGuideTitle, { color: colors.foreground }]}>Instructions</Text>
              {[
                "Hold your ID document beside your face",
                "Ensure your face and ID are clearly visible",
                "Good lighting — avoid shadows",
                "Do not wear sunglasses or cap",
                "Look directly at the camera",
              ].map((tip, i) => (
                <View key={i} style={styles.selfieGuideTip}>
                  <View style={[styles.selfieGuideDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.selfieGuideTipText, { color: colors.mutedForeground }]}>{tip}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => simulateUpload(setSelfie)}
              style={[
                styles.selfieBtn,
                {
                  backgroundColor: selfie === "done" ? "#22C55E15" : colors.primary + "15",
                  borderColor: selfie === "done" ? "#22C55E50" : colors.primary + "40",
                },
              ]}
            >
              <Feather
                name={selfie === "done" ? "check-circle" : selfie === "uploading" ? "loader" : "camera"}
                size={36}
                color={selfie === "done" ? "#22C55E" : colors.primary}
              />
              <Text style={[styles.selfieBtnText, { color: selfie === "done" ? "#22C55E" : colors.primary }]}>
                {selfie === "done" ? "Selfie Captured ✓" : selfie === "uploading" ? "Capturing…" : "Take Selfie"}
              </Text>
              {selfie === "idle" && (
                <Text style={[styles.selfieBtnHint, { color: colors.mutedForeground }]}>Tap to open camera</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* ── STEP 5: Review & Submit ───────────────────────── */}
        {step === 5 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Submit</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Please verify all details before submitting. Incorrect information may result in rejection.
            </Text>

            {[
              {
                title: "Personal Information",
                icon: "user",
                color: colors.primary,
                fields: [
                  { label: "Full Name", value: fullName },
                  { label: "Date of Birth", value: dob },
                  { label: "Gender", value: gender },
                  { label: "Address", value: [address1, address2, city, state, pincode].filter(Boolean).join(", ") },
                ],
              },
              {
                title: "Identity Proof",
                icon: "credit-card",
                color: "#3B82F6",
                fields: [
                  { label: "Document Type", value: selectedId.label },
                  { label: "Document Number", value: idNumber },
                  { label: "Front Side", value: idFront === "done" ? "Uploaded ✓" : "—" },
                  ...(selectedId.hasBack ? [{ label: "Back Side", value: idBack === "done" ? "Uploaded ✓" : "—" }] : []),
                ],
              },
              {
                title: "Address Proof",
                icon: "home",
                color: "#10B981",
                fields: [
                  { label: "Document Type", value: ADDR_TYPES.find((t) => t.id === addrType)?.label ?? "—" },
                  { label: "Document", value: addrDoc === "done" ? "Uploaded ✓" : "—" },
                ],
              },
              {
                title: "Selfie Verification",
                icon: "camera",
                color: "#F59E0B",
                fields: [{ label: "Live Selfie", value: selfie === "done" ? "Captured ✓" : "—" }],
              },
            ].map((section) => (
              <View key={section.title} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewCardHeader}>
                  <View style={[styles.reviewCardIcon, { backgroundColor: section.color + "20" }]}>
                    <Feather name={section.icon as any} size={15} color={section.color} />
                  </View>
                  <Text style={[styles.reviewCardTitle, { color: colors.foreground }]}>{section.title}</Text>
                  <Feather name="check-circle" size={15} color="#22C55E" />
                </View>
                {section.fields.map((f) => (
                  <View key={f.label} style={[styles.reviewFieldRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.reviewFieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                    <Text style={[styles.reviewFieldValue, { color: f.value?.includes("✓") ? "#22C55E" : colors.foreground }]} numberOfLines={1}>
                      {f.value || "—"}
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={[styles.consentCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <Feather name="shield" size={16} color={colors.primary} />
              <Text style={[styles.consentText, { color: colors.mutedForeground }]}>
                By submitting, I certify that all information and documents provided are genuine and accurate. I consent to Ridhi verifying my identity as per applicable laws.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        {step < TOTAL_STEPS ? (
          <Pressable
            onPress={() => canNext() && setStep(step + 1)}
            style={[styles.nextBtn, { backgroundColor: canNext() ? colors.primary : colors.muted, opacity: canNext() ? 1 : 0.6 }]}
          >
            <Text style={[styles.nextBtnText, { color: canNext() ? "#fff" : colors.mutedForeground }]}>
              Continue to {STEP_LABELS[step]}
            </Text>
            <Feather name="arrow-right" size={18} color={canNext() ? "#fff" : colors.mutedForeground} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSubmit}
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="shield" size={18} color="#fff" />
            <Text style={[styles.nextBtnText, { color: "#fff" }]}>Submit for Verification</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlow: { position: "absolute", top: 0, left: 0, right: 0 },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingBottom: 12, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  kycBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  kycBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  // Step bar
  stepBarWrap: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
  stepDot: { height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  stepDotText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  stepLine: { flex: 1, height: 2 },
  // Step content
  stepContent: { padding: 20, gap: 16 },
  stepTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  stepDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: -8 },
  // Fields
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  rowInputs: { flexDirection: "row", gap: 10 },
  genderRow: { flexDirection: "row", gap: 10 },
  genderChip: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  genderChipText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  stateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stateChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  stateChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  // Doc type
  docTypeGrid: { gap: 8 },
  docTypeCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  docTypeLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  // Address type
  addrTypeList: { gap: 8 },
  addrTypeRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  addrTypeIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  addrTypeLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  // Upload box
  uploadBox: { borderRadius: 16, borderWidth: 1.5, padding: 20, alignItems: "center", gap: 8, marginVertical: 4 },
  uploadDoneIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  uploadLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  uploadHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  uploadBtnRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  uploadMiniBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  uploadMiniBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  // Selfie
  selfieGuideCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10, alignItems: "center" },
  selfieGuideEmoji: { fontSize: 36 },
  selfieGuideTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  selfieGuideTip: { flexDirection: "row", alignItems: "flex-start", gap: 8, alignSelf: "stretch" },
  selfieGuideDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  selfieGuideTipText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  selfieBtn: { borderRadius: 20, borderWidth: 1.5, padding: 28, alignItems: "center", gap: 10 },
  selfieBtnText: { fontSize: 17, fontFamily: "Inter_700Bold" },
  selfieBtnHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  // Tips
  tipBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  tipText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, flex: 1 },
  // Review
  reviewCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  reviewCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  reviewCardIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  reviewCardTitle: { flex: 1, fontSize: 13, fontFamily: "Inter_700Bold" },
  reviewFieldRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 9, borderTopWidth: StyleSheet.hairlineWidth },
  reviewFieldLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  reviewFieldValue: { fontSize: 12, fontFamily: "Inter_600SemiBold", maxWidth: "55%", textAlign: "right" },
  consentCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  consentText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, flex: 1 },
  // Bottom
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 16 },
  nextBtnText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  // Success
  successGlow: { position: "absolute", top: 0, left: 0, right: 0 },
  successWrap: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  successIcon: { width: 100, height: 100, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  timelineCard: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16, gap: 0 },
  tlRow: { flexDirection: "row", gap: 12, minHeight: 64 },
  tlLeft: { alignItems: "center", width: 32 },
  tlDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tlLine: { width: 2, flex: 1, marginVertical: 4 },
  tlContent: { flex: 1, paddingBottom: 12 },
  tlLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tlSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  pendingBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 6, alignSelf: "flex-start" },
  pendingDot: { width: 6, height: 6, borderRadius: 3 },
  pendingText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  infoBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, width: "100%", backgroundColor: "transparent" },
  infoText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, flex: 1 },
  doneBtn: { width: "100%", paddingVertical: 15, borderRadius: 16, alignItems: "center", marginTop: 8 },
  doneBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});

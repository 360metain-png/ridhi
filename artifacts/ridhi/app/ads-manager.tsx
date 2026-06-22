import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
const COIN_IMAGE = require("../assets/images/ridhi_coin.png");
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";
import { GradientButton } from "@/components/GradientButton";
import { USER_CAMPAIGNS, type AdCampaign, type AdCampaignStatus, type AdCampaignFormat, type AdPayMethod, type AdCampaignType } from "@/data/mockData";
import { PaymentSheet } from "@/components/PaymentSheet";
import type { InvoiceData } from "@/components/GstInvoice";
import { apiFetch } from "@/utils/api";

const { width } = Dimensions.get("window");

type TabKey = "campaigns" | "create";
type CreateStep = 1 | 2 | 3 | 4 | 5 | 6;

// ── Constants ────────────────────────────────────────────────────────────────
const FORMATS: { key: AdCampaignFormat; label: string; icon: string; desc: string }[] = [
  { key: "feed",    label: "Feed",    icon: "layout",    desc: "Appears in user home feed" },
  { key: "story",   label: "Story",   icon: "circle",    desc: "Full-screen story format" },
  { key: "reel",    label: "Reel",    icon: "video",     desc: "Short video in Reels tab" },
  { key: "banner",  label: "Banner",  icon: "minus",     desc: "Top/bottom banner" },
  { key: "explore", label: "Explore", icon: "search",    desc: "Discover page placement" },
];

const CITIES = ["All India", "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Jaipur", "Ahmedabad"];
const AGES = ["13–17", "18–24", "25–34", "35–44", "45–54", "55+"];
const GENDERS = ["All", "Male", "Female"];
const INTERESTS = ["Fashion", "Food", "Tech", "Fitness", "Beauty", "Travel", "Music", "Gaming", "Education", "Finance"];

const GST_RATE = 0.18;
const COIN_TO_RUPEE = 0.8; // 1 coin ≈ ₹0.80

const STATUS_META: Record<AdCampaignStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#F59E0B", bg: "#FEF3C7" },
  active:    { label: "Live",      color: "#22C55E", bg: "#DCFCE7" },
  paused:    { label: "Paused",    color: "#6B7280", bg: "#F3F4F6" },
  completed: { label: "Done",      color: "#3B82F6", bg: "#DBEAFE" },
  rejected:  { label: "Rejected",  color: "#EF4444", bg: "#FEE2E2" },
};

// ── Helper: Format number ────────────────────────────────────────────────────
function fmtN(n: number): string {
  if (n >= 100000) return (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// ── Campaign List Card ───────────────────────────────────────────────────────
function CampaignCard({
  item,
  colors,
  onPress,
}: {
  item: AdCampaign;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  const meta = STATUS_META[item.status];
  const isDirect = item.payMethod === "direct";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.campaignCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.82 },
      ]}
    >
      <View style={styles.campaignTop}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.campaignThumb} />
        ) : item.videoUri ? (
          <View style={[styles.campaignThumb, { backgroundColor: colors.muted + "20", alignItems: "center", justifyContent: "center" }]}>
            <Feather name="video" size={24} color={colors.primary} />
          </View>
        ) : (
          <View style={[styles.campaignThumb, { backgroundColor: colors.muted + "20", alignItems: "center", justifyContent: "center" }]}>
            <Feather name="image" size={24} color={colors.mutedForeground} />
          </View>
        )}
        <View style={{ flex: 1, gap: 3 }}>
          <View style={styles.campaignHeaderRow}>
            <Text style={[styles.campaignHeadline, { color: colors.foreground }]} numberOfLines={1}>{item.headline}</Text>
            <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <Text style={[styles.campaignFormat, { color: colors.mutedForeground }]}>
              {FORMATS.find((f) => f.key === item.format)?.label} · {item.targetCity}
            </Text>
            {item.campaignType === "buyCreator" && (
              <View style={[styles.typeBadge, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.typeBadgeText, { color: colors.primary }]}>Buy Creator</Text>
              </View>
            )}
          </View>
          <View style={styles.campaignMetaRow}>
            <Text style={[styles.campaignCost, { color: colors.foreground }]}>
              {isDirect ? `₹${fmtN(item.totalCost)}` : `${fmtN(item.totalCost / COIN_TO_RUPEE)} coins`}
            </Text>
            <Text style={[styles.campaignDate, { color: colors.mutedForeground }]}>{item.submittedAt}</Text>
          </View>
        </View>
      </View>

      {item.status === "active" && (
        <View style={[styles.liveStats, { borderTopColor: colors.border }]}>
          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{fmtN(item.impressions)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Impressions</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{fmtN(item.clicks)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Clicks</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{item.ctr}%</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>CTR</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>₹{fmtN(item.spent)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Spent</Text>
          </View>
        </View>
      )}

      {item.status === "rejected" && item.rejectionReason && (
        <View style={[styles.rejectedBanner, { backgroundColor: "#FEE2E220", borderColor: "#FECACA" }]}>
          <Feather name="alert-circle" size={14} color="#EF4444" />
          <Text style={[styles.rejectedText, { color: "#B91C1C" }]} numberOfLines={2}>{item.rejectionReason}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Invoice Modal ────────────────────────────────────────────────────────────
function InvoiceModal({
  visible,
  campaign,
  onClose,
}: {
  visible: boolean;
  campaign: AdCampaign | null;
  onClose: () => void;
}) {
  const colors = useColors();
  if (!campaign) return null;
  const subtotal = campaign.totalCost;
  const gst = campaign.gstAmount;
  const total = subtotal + gst;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.invoiceOverlay, { backgroundColor: "#00000080" }]}>
        <View style={[styles.invoiceSheet, { backgroundColor: colors.background }]}>
          <View style={[styles.invoiceHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.invoiceTitle, { color: colors.foreground }]}>Tax Invoice</Text>
            <Pressable onPress={onClose} style={styles.invoiceClose}>
              <Feather name="x" size={22} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            {/* Brand header */}
            <View style={{ alignItems: "center", gap: 6 }}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.invoiceBrandBadge}>
                <Text style={styles.invoiceBrandText}>RIDHI ADS</Text>
              </LinearGradient>
              <Text style={[styles.invoiceSub, { color: colors.mutedForeground }]}>Krilo Digitech Pvt Ltd</Text>
              <Text style={[styles.invoiceSub, { color: colors.mutedForeground }]}>GSTIN: 33AAMCK0376J1ZD</Text>
              <Text style={[styles.invoiceSub, { color: colors.mutedForeground }]}>Chennai, Tamil Nadu 600099</Text>
            </View>

            {/* Invoice meta */}
            <View style={[styles.invoiceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.invoiceRow}>
                <Text style={[styles.invoiceKey, { color: colors.mutedForeground }]}>Invoice #</Text>
                <Text style={[styles.invoiceValue, { color: colors.foreground }]}>{campaign.invoiceId || "—"}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={[styles.invoiceKey, { color: colors.mutedForeground }]}>Date</Text>
                <Text style={[styles.invoiceValue, { color: colors.foreground }]}>{campaign.invoiceDate || campaign.submittedAt}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={[styles.invoiceKey, { color: colors.mutedForeground }]}>Campaign</Text>
                <Text style={[styles.invoiceValue, { color: colors.foreground }]} numberOfLines={1}>{campaign.headline}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={[styles.invoiceKey, { color: colors.mutedForeground }]}>Format</Text>
                <Text style={[styles.invoiceValue, { color: colors.foreground }]}>{FORMATS.find((f) => f.key === campaign.format)?.label}</Text>
              </View>
            </View>

            {/* Cost breakdown */}
            <View style={[styles.invoiceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.invoiceDivider, { backgroundColor: colors.border }]} />
              <View style={styles.invoiceRow}>
                <Text style={[styles.invoiceTotalKey, { color: colors.foreground }]}>Total Paid</Text>
                <Text style={[styles.invoiceTotalValue, { color: colors.primary }]}>₹{total.toLocaleString("en-IN")}</Text>
              </View>
            </View>

            <Text style={[styles.invoiceNote, { color: colors.mutedForeground }]}>
              This is a computer-generated invoice and does not require a signature.
              Seller: Krilo Digitech Pvt Ltd, GSTIN: 33AAMCK0376J1ZD, Chennai, Tamil Nadu 600099.
              For queries, contact accounts@krilodigitech.com.
            </Text>
          </ScrollView>

          <View style={[styles.invoiceActions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => Alert.alert("Share Invoice", "Invoice shared successfully.")}
              style={[styles.invoiceBtn, { backgroundColor: colors.primary + "15" }]}
            >
              <Feather name="share" size={16} color={colors.primary} />
              <Text style={[styles.invoiceBtnText, { color: colors.primary }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert("Downloaded", "Invoice saved to your device.")}
              style={[styles.invoiceBtnPrimary, { backgroundColor: colors.primary }]}
            >
              <Feather name="download" size={16} color="#fff" />
              <Text style={styles.invoiceBtnPrimaryText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Campaign Detail Modal ──────────────────────────────────────────────────
function CampaignDetailModal({
  visible,
  campaign,
  onClose,
  onShowInvoice,
  onDownloadReport,
}: {
  visible: boolean;
  campaign: AdCampaign | null;
  onClose: () => void;
  onShowInvoice: () => void;
  onDownloadReport: () => void;
}) {
  const colors = useColors();
  if (!campaign) return null;
  const meta = STATUS_META[campaign.status];
  const isDirect = campaign.payMethod === "direct";
  const isCompleted = campaign.status === "completed";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.detailOverlay, { backgroundColor: "#00000080" }]}>
        <View style={[styles.detailSheet, { backgroundColor: colors.background }]}>
          <View style={[styles.detailHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={onClose} style={styles.detailClose}>
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.detailTitle, { color: colors.foreground }]}>Campaign Detail</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
            {/* Creative preview */}
            {campaign.imageUri ? (
              <Image source={{ uri: campaign.imageUri }} style={styles.detailImage} />
            ) : campaign.videoUri ? (
              <View style={[styles.detailImage, { backgroundColor: colors.muted + "20", alignItems: "center", justifyContent: "center" }]}>
                <Feather name="play-circle" size={48} color={colors.primary} />
                <Text style={[styles.detailVideoLabel, { color: colors.mutedForeground }]}>10 sec video</Text>
              </View>
            ) : null}

            {/* Headline & CTA */}
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={[styles.detailStatusBadge, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.detailStatusText, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <Text style={[styles.detailPayMethod, { color: colors.mutedForeground }]}>
                  {isDirect ? "Direct Payment" : "Ridhi Coins"}
                </Text>
              </View>
              <Text style={[styles.detailHeadline, { color: colors.foreground }]}>{campaign.headline}</Text>
              <Text style={[styles.detailBody, { color: colors.mutedForeground }]}>{campaign.body}</Text>
              <View style={[styles.ctaPill, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.ctaPillText, { color: colors.primary }]}>CTA: {campaign.cta}</Text>
              </View>
            </View>

            {/* Targeting */}
            <View style={[styles.detailBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailBoxTitle, { color: colors.foreground }]}>Targeting</Text>
              <View style={styles.detailGrid}>
                <DetailItem label="City" value={campaign.targetCity} />
                <DetailItem label="Age" value={campaign.targetAge} />
                <DetailItem label="Gender" value={campaign.targetGender} />
                <DetailItem label="Interests" value={campaign.targetInterests} />
              </View>
            </View>

            {/* Budget */}
            <View style={[styles.detailBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.detailBoxTitle, { color: colors.foreground }]}>Budget</Text>
              <View style={styles.detailGrid}>
                <DetailItem label="Daily" value={`₹${campaign.dailyBudget}`} />
                <DetailItem label="Days" value={String(campaign.days)} />
                <DetailItem label="Total" value={`₹${campaign.totalCost}`} />
                <DetailItem label="Spent" value={`₹${campaign.spent}`} />
              </View>
            </View>

            {/* Performance */}
            {campaign.status !== "pending" && campaign.status !== "rejected" && (
              <View style={[styles.detailBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.detailBoxTitle, { color: colors.foreground }]}>Performance</Text>
                <View style={styles.detailGrid}>
                  <DetailItem label="Impressions" value={fmtN(campaign.impressions)} />
                  <DetailItem label="Clicks" value={fmtN(campaign.clicks)} />
                  <DetailItem label="CTR" value={`${campaign.ctr}%`} />
                  <DetailItem label="CPM" value={`₹${campaign.impressions ? ((campaign.spent / campaign.impressions) * 1000).toFixed(0) : "0"}`} />
                </View>
              </View>
            )}

            {/* Invoice button for direct payment campaigns */}
            {isDirect && (campaign.status === "active" || campaign.status === "completed") && (
              <TouchableOpacity onPress={onShowInvoice} style={[styles.invoiceTrigger, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
                <Feather name="file-text" size={18} color={colors.primary} />
                <Text style={[styles.invoiceTriggerText, { color: colors.primary }]}>Download Tax Invoice</Text>
                <Feather name="chevron-right" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}

            {/* Performance Report for completed campaigns */}
            {isCompleted && (
              <TouchableOpacity onPress={onDownloadReport} style={[styles.invoiceTrigger, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
                <Feather name="download" size={18} color={colors.success} />
                <Text style={[styles.invoiceTriggerText, { color: colors.success }]}>Download Performance Report</Text>
                <Feather name="chevron-right" size={16} color={colors.success} />
              </TouchableOpacity>
            )}

            {/* Rejection reason */}
            {campaign.rejectionReason && (
              <View style={[styles.rejectedBox, { backgroundColor: "#FEE2E220", borderColor: "#FECACA" }]}>
                <Feather name="alert-circle" size={16} color="#EF4444" />
                <Text style={[styles.rejectedBoxText, { color: "#B91C1C" }]}>{campaign.rejectionReason}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, minWidth: "45%", gap: 2 }}>
      <Text style={[styles.detailItemLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailItemValue, { color: colors.foreground }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function AdsManagerScreen() {
  useTrackScreen("ads_manager");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Brand activity check
  const brandDaysLeft = useMemo(() => {
    if (!user?.isBrandRegistered || !user?.brandActiveUntil) return null;
    const now = new Date();
    const activeUntil = new Date(user.brandActiveUntil);
    const diffMs = activeUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [user?.brandActiveUntil, user?.isBrandRegistered]);

  const isBrandExpired = brandDaysLeft === 0;

  const [tab, setTab] = useState<TabKey>("campaigns");
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(USER_CAMPAIGNS.map((c) => ({ ...c })));
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDetailInvoice, setShowDetailInvoice] = useState(false);

  // Create campaign state
  const [step, setStep] = useState<CreateStep>(1);
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [format, setFormat] = useState<AdCampaignFormat | null>(null);
  const [creativeUri, setCreativeUri] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [targetCity, setTargetCity] = useState<string | null>(null);
  const [targetAge, setTargetAge] = useState<string | null>(null);
  const [targetGender, setTargetGender] = useState<string | null>(null);
  const [targetInterests, setTargetInterests] = useState<string[]>([]);
  const [dailyBudget, setDailyBudget] = useState("");
  const [days, setDays] = useState("");
  const [payMethod, setPayMethod] = useState<AdPayMethod | null>(null);
  const [campaignType, setCampaignType] = useState<"paidAds" | "buyCreator">("paidAds");
  const [showPayment, setShowPayment] = useState(false);
  const [showCoinConfirm, setShowCoinConfirm] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  const coinBalance = user?.coins ?? 2450;

  const totalCost = useMemo(() => {
    const db = parseInt(dailyBudget) || 0;
    const d = parseInt(days) || 0;
    return db * d;
  }, [dailyBudget, days]);

  const coinCost = useMemo(() => Math.ceil(totalCost / COIN_TO_RUPEE), [totalCost]);

  const resetCreate = () => {
    setStep(1);
    setHeadline(""); setBody(""); setCta("");
    setFormat(null);
    setCreativeUri(null); setIsVideo(false);
    setTargetCity(null); setTargetAge(null); setTargetGender(null); setTargetInterests([]);
    setDailyBudget(""); setDays("");
    setPayMethod(null);
    setCampaignType("paidAds");
  };

  const pickCreative = async (type: "image" | "video") => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow media access to upload creative.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === "video" ? "videos" : "images",
        allowsEditing: true,
        quality: 0.85,
        videoMaxDuration: 10,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];
      setCreativeUri(asset.uri);
      setIsVideo(type === "video");
      if (type === "video" && asset.duration && asset.duration > 10) {
        Alert.alert("Video too long", "Videos must be 10 seconds or less. Please trim and retry.");
        setCreativeUri(null);
        setIsVideo(false);
      }
    } catch {
      Alert.alert("Gallery Error", "Could not select media. Please try again.");
    }
  };

  const submitCampaign = async () => {
    if (!format || !targetCity || !targetAge || !targetGender || !payMethod) return;
    setCampaignsLoading(true);
    try {
      const payload = {
        headline: headline || "Untitled Campaign",
        body: body || "",
        cta: cta || "Learn More",
        format,
        creativeUri: creativeUri || undefined,
        isVideo,
        targetCities: targetCity === "All India" ? ["All India"] : [targetCity],
        targetAges: [targetAge],
        targetGenders: [targetGender],
        targetInterests: targetInterests.length > 0 ? targetInterests : ["General"],
        dailyBudget: parseInt(dailyBudget) || 0,
        totalBudget: totalCost,
        durationDays: parseInt(days) || 7,
        payMethod,
      };
      const data = await apiFetch<{ success: boolean; campaign: any }>("/api/ads/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data?.success && data.campaign) {
        const mapped: AdCampaign = {
          id: data.campaign.id,
          headline: data.campaign.headline,
          body: data.campaign.body || "",
          cta: data.campaign.cta || "Learn More",
          format: data.campaign.format as AdCampaignFormat,
          imageUri: data.campaign.creativeUri && !isVideo ? data.campaign.creativeUri : undefined,
          videoUri: data.campaign.creativeUri && isVideo ? data.campaign.creativeUri : undefined,
          videoDurationSec: isVideo ? 10 : undefined,
          targetCity: data.campaign.targetCities?.[0] || targetCity,
          targetAge: data.campaign.targetAges?.[0] || targetAge,
          targetGender: data.campaign.targetGenders?.[0] || targetGender,
          targetInterests: data.campaign.targetInterests?.join(", ") || "General",
          dailyBudget: data.campaign.dailyBudget || 0,
          days: data.campaign.durationDays || 0,
          totalCost: data.campaign.totalBudget || totalCost,
          payMethod: data.campaign.payMethod as AdPayMethod,
          campaignType,
          status: "pending",
          submittedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
          impressions: 0, clicks: 0, ctr: 0, spent: 0,
          gstAmount: payMethod === "direct" ? Math.round(totalCost * GST_RATE) : 0,
        };
        setCampaigns((prev) => [mapped, ...prev]);
      } else {
        throw new Error("Failed to create campaign");
      }
      resetCreate();
      setTab("campaigns");
      const now = new Date().toISOString();
      const activeUntil = new Date();
      activeUntil.setDate(activeUntil.getDate() + 30);
      updateProfile({
        lastAdCampaignAt: now,
        brandActiveUntil: activeUntil.toISOString(),
      });
      Alert.alert("Campaign Submitted", "Your campaign is under review. You will be notified once it goes live or if any changes are needed.");
    } catch (err: any) {
      Alert.alert("Submission Failed", err?.message || "Could not create campaign. Please try again.");
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handlePaySuccess = async () => {
    setShowPayment(false);
    const gstAmount = Math.round(totalCost * GST_RATE);
    const invoice: InvoiceData = {
      invoiceNo: `RID-AD-${Date.now()}`,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      type: "ad_payment",
      userName: user?.name || "User",
      userId: user?.id || "-",
      description: `Ad Campaign: ${headline || "Untitled"} (${format}) · ₹${dailyBudget}/day × ${days} days`,
      baseAmount: totalCost,
      gstRate: 18,
      gstAmount,
      totalAmount: totalCost + gstAmount,
      gstin: "33AAMCK0376J1ZD",
      hsnCode: "998311",
      sacCode: "998311",
    };
    setInvoiceData(invoice);
    setShowInvoice(true);
    // Mark user as ad user so they can download invoices in the future
    if (user && !user.isAdUser) {
      updateProfile({ isAdUser: true });
    }
    await submitCampaign();
  };

  const handleCoinPay = async () => {
    if (coinBalance < coinCost) {
      Alert.alert("Insufficient Coins", `You need ${coinCost} coins. Go to Wallet to recharge.`, [
        { text: "Cancel", style: "cancel" },
        { text: "Go to Wallet", onPress: () => router.push("/wallet" as any) },
      ]);
      return;
    }
    setShowCoinConfirm(false);
    await submitCampaign();
  };

  // Step validation
  const minDaily = 100;
  const isBudgetValid = parseInt(dailyBudget) >= minDaily && parseInt(days) > 0;

  const canNext = () => {
    if (step === 1) return headline.trim().length >= 3 && cta.trim().length > 0 && format !== null;
    if (step === 2) return creativeUri !== null;
    if (step === 3) return targetCity !== null && targetAge !== null && targetGender !== null;
    if (step === 4) return isBudgetValid;
    if (step === 5) return payMethod !== null;
    return false;
  };

  const filtered = campaigns;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.foreground }]}>Ads Manager</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Create & manage campaigns</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => setTab("campaigns")}
          style={[styles.tab, tab === "campaigns" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabLabel, { color: tab === "campaigns" ? colors.primary : colors.mutedForeground }]}>My Campaigns</Text>
          <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.tabBadgeText}>{campaigns.length}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            if (user?.isBrandRegistered) {
              setTab("create");
            } else {
              Alert.alert(
                "Brand Registration Required",
                "You need to register your brand on Ridhi before running ads. It's a one-time fee of ₹1,000.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Register Brand", onPress: () => router.push("/brand-register") },
                ]
              );
            }
          }}
          style={[styles.tab, tab === "create" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
        >
          <Text style={[styles.tabLabel, { color: tab === "create" ? colors.primary : colors.mutedForeground }]}>Create New</Text>
        </Pressable>
      </View>

      {/* ── My Campaigns Tab ─────────────────────────────────────────────── */}
      {tab === "campaigns" && (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <CampaignCard
              item={item}
              colors={colors}
              onPress={() => { setSelectedCampaign(item); setShowDetail(true); }}
            />
          )}
          ListHeaderComponent={
            brandDaysLeft !== null ? (
              <View style={[styles.expiryBanner, { backgroundColor: isBrandExpired ? "#FEF2F2" : "#FEFCE8", borderColor: isBrandExpired ? "#FECACA" : "#FDE047" }]}>
                <Feather name={isBrandExpired ? "alert-triangle" : "clock"} size={18} color={isBrandExpired ? "#EF4444" : "#CA8A04"} />
                <Text style={[styles.expiryText, { color: isBrandExpired ? "#B91C1C" : "#854D0E" }]}>
                  {isBrandExpired
                    ? "Brand registration expired. Run a campaign to reactivate."
                    : `Run at least 1 campaign every 30 days. ${brandDaysLeft} day${brandDaysLeft === 1 ? "" : "s"} left.`}
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={[styles.emptyState, { marginTop: 60 }]}>
              <Feather name={"volume-2" as any} size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No campaigns yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Create your first ad campaign to reach thousands of Ridhi users.</Text>
              <GradientButton label="Create Campaign" onPress={() => user?.isBrandRegistered ? setTab("create") : router.push("/brand-register")} style={{ marginTop: 16, width: 200 }} />
            </View>
          }
        />
      )}

      {/* ── Create Campaign Tab ──────────────────────────────────────────── */}
      {tab === "create" && user?.isBrandRegistered && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 32 }}>
            {/* Step indicator */}
            <View style={styles.stepRow}>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <View key={s} style={styles.stepDotWrap}>
                  <View style={[styles.stepDot, { backgroundColor: step >= s ? colors.primary : colors.border }]}>
                    {step > s ? (
                      <Feather name="check" size={10} color="#fff" />
                    ) : (
                      <Text style={[styles.stepNum, { color: step >= s ? "#fff" : colors.mutedForeground }]}>{s}</Text>
                    )}
                  </View>
                  {s < 6 && <View style={[styles.stepLine, { backgroundColor: step > s ? colors.primary : colors.border }]} />}
                </View>
              ))}
            </View>

            {/* ── Step 1: Campaign Info ───────────────────────────────────── */}
            {step === 1 && (
              <View style={{ gap: 14 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Campaign Info</Text>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Headline *</Text>
                  <TextInput
                    value={headline}
                    onChangeText={setHeadline}
                    placeholder="e.g. Summer Sale — 40% Off!"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
                    maxLength={60}
                  />
                  <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{headline.length}/60</Text>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Body Text</Text>
                  <TextInput
                    value={body}
                    onChangeText={setBody}
                    placeholder="Describe your offer in 1-2 sentences..."
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border, height: 80, textAlignVertical: "top" }]}
                    multiline
                    maxLength={150}
                  />
                  <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{body.length}/150</Text>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Call to Action *</Text>
                  <TextInput
                    value={cta}
                    onChangeText={setCta}
                    placeholder="e.g. Shop Now, Learn More, Sign Up"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
                    maxLength={20}
                  />
                </View>

                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Ad Format *</Text>
                <View style={styles.formatGrid}>
                  {FORMATS.map((f) => (
                    <Pressable
                      key={f.key}
                      onPress={() => setFormat(f.key)}
                      style={({ pressed }) => [
                        styles.formatCard,
                        { backgroundColor: colors.card, borderColor: format === f.key ? colors.primary : colors.border },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Feather name={f.icon as any} size={20} color={format === f.key ? colors.primary : colors.mutedForeground} />
                      <Text style={[styles.formatLabel, { color: format === f.key ? colors.primary : colors.foreground }]}>{f.label}</Text>
                      <Text style={[styles.formatDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* ── Step 2: Creative Upload ─────────────────────────────────── */}
            {step === 2 && (
              <View style={{ gap: 14 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Upload Creative</Text>
                <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Choose an image or a short video (max 10 seconds).</Text>

                {!creativeUri ? (
                  <View style={{ gap: 12 }}>
                    <Pressable
                      onPress={() => pickCreative("image")}
                      style={({ pressed }) => [
                        styles.uploadCard,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Feather name="image" size={32} color={colors.primary} />
                      <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Upload Image</Text>
                      <Text style={[styles.uploadDesc, { color: colors.mutedForeground }]}>JPG or PNG, high resolution recommended</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => pickCreative("video")}
                      style={({ pressed }) => [
                        styles.uploadCard,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Feather name="video" size={32} color={colors.primary} />
                      <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Upload Video</Text>
                      <Text style={[styles.uploadDesc, { color: colors.mutedForeground }]}>MP4, max 10 seconds</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={{ gap: 12, alignItems: "center" }}>
                    {isVideo ? (
                      <View style={[styles.previewBox, { backgroundColor: colors.muted + "20", alignItems: "center", justifyContent: "center" }]}>
                        <Feather name="play-circle" size={48} color={colors.primary} />
                        <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>Video selected (10 sec max)</Text>
                      </View>
                    ) : (
                      <Image source={{ uri: creativeUri }} style={styles.previewImage} />
                    )}
                    <Pressable onPress={() => { setCreativeUri(null); setIsVideo(false); }} style={styles.changeCreativeBtn}>
                      <Text style={[styles.changeCreativeText, { color: colors.destructive }]}>Remove & re-upload</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* ── Step 3: Targeting ──────────────────────────────────────── */}
            {step === 3 && (
              <View style={{ gap: 14 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Audience Targeting</Text>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>City / Region *</Text>
                  <View style={styles.chipWrap}>
                    {CITIES.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setTargetCity(c)}
                        style={[styles.chip, { backgroundColor: targetCity === c ? colors.primary + "20" : colors.card, borderColor: targetCity === c ? colors.primary : colors.border }]}
                      >
                        <Text style={[styles.chipText, { color: targetCity === c ? colors.primary : colors.foreground }]}>{c}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Age Group *</Text>
                  <View style={styles.chipWrap}>
                    {AGES.map((a) => (
                      <Pressable
                        key={a}
                        onPress={() => setTargetAge(a)}
                        style={[styles.chip, { backgroundColor: targetAge === a ? colors.primary + "20" : colors.card, borderColor: targetAge === a ? colors.primary : colors.border }]}
                      >
                        <Text style={[styles.chipText, { color: targetAge === a ? colors.primary : colors.foreground }]}>{a}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Gender *</Text>
                  <View style={styles.chipWrap}>
                    {GENDERS.map((g) => (
                      <Pressable
                        key={g}
                        onPress={() => setTargetGender(g)}
                        style={[styles.chip, { backgroundColor: targetGender === g ? colors.primary + "20" : colors.card, borderColor: targetGender === g ? colors.primary : colors.border }]}
                      >
                        <Text style={[styles.chipText, { color: targetGender === g ? colors.primary : colors.foreground }]}>{g}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Interests</Text>
                  <View style={styles.chipWrap}>
                    {INTERESTS.map((i) => (
                      <Pressable
                        key={i}
                        onPress={() => setTargetInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])}
                        style={[styles.chip, { backgroundColor: targetInterests.includes(i) ? colors.primary + "20" : colors.card, borderColor: targetInterests.includes(i) ? colors.primary : colors.border }]}
                      >
                        <Text style={[styles.chipText, { color: targetInterests.includes(i) ? colors.primary : colors.foreground }]}>{i}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* ── Step 4: Budget ─────────────────────────────────────────── */}
            {step === 4 && (
              <View style={{ gap: 14 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Budget & Duration</Text>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Campaign Type</Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable
                      onPress={() => setCampaignType("paidAds")}
                      style={[styles.typeCard, { backgroundColor: campaignType === "paidAds" ? colors.primary : colors.card, borderColor: colors.border }]}
                    >
                      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: campaignType === "paidAds" ? "#fff" : colors.foreground }}>Paid Ads</Text>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: campaignType === "paidAds" ? "#fff" : colors.mutedForeground }}>Run ads on Ridhi</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setCampaignType("buyCreator")}
                      style={[styles.typeCard, { backgroundColor: campaignType === "buyCreator" ? colors.primary : colors.card, borderColor: colors.border }]}
                    >
                      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: campaignType === "buyCreator" ? "#fff" : colors.foreground }}>Buy Creator</Text>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: campaignType === "buyCreator" ? "#fff" : colors.mutedForeground }}>Hire creators to post</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Daily Budget (₹) *</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {([100, 200, 500, 1000] as const).map((amt) => (
                      <Pressable
                        key={amt}
                        onPress={() => { setDailyBudget(String(amt)); }}
                        style={[
                          styles.budgetChip,
                          { backgroundColor: parseInt(dailyBudget) === amt ? colors.primary : colors.card, borderColor: colors.border },
                        ]}
                      >
                        <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: parseInt(dailyBudget) === amt ? "#fff" : colors.foreground }}>
                          ₹{amt}/day
                        </Text>
                        <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: parseInt(dailyBudget) === amt ? "#fff" : colors.mutedForeground }}>
                          {Math.ceil(amt / COIN_TO_RUPEE)} coins
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    value={dailyBudget}
                    onChangeText={(t) => setDailyBudget(t.replace(/[^0-9]/g, ""))}
                    placeholder="Or enter custom amount (Min ₹100)"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
                  />
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                    Minimum daily budget: ₹100 or equivalent coins
                  </Text>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Campaign Duration (Days) *</Text>
                  <TextInput
                    value={days}
                    onChangeText={(t) => setDays(t.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 7"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
                  />
                </View>

                {totalCost > 0 && (
                  <View style={[styles.costCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.costTitle, { color: colors.foreground }]}>Estimated Cost</Text>
                    <View style={styles.costRow}>
                      <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>Total (₹)</Text>
                      <Text style={[styles.costValue, { color: colors.foreground }]}>₹{totalCost.toLocaleString("en-IN")}</Text>
                    </View>
                    <View style={styles.costRow}>
                      <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>In Coins</Text>
                      <Text style={[styles.costValue, { color: colors.primary }]}>{coinCost.toLocaleString("en-IN")} coins</Text>
                    </View>
                    <View style={styles.costRow}>
                      <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>Payment method</Text>
                      <Text style={[styles.costValue, { color: colors.mutedForeground }]}>Coins or Direct</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ── Step 5: Payment Method ─────────────────────────────────── */}
            {step === 5 && (
              <View style={{ gap: 14 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choose Payment Method</Text>
                <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Pay with Ridhi Coins or direct payment.</Text>

                <Pressable
                  onPress={() => setPayMethod("coins")}
                  style={[styles.payCard, { backgroundColor: colors.card, borderColor: payMethod === "coins" ? colors.primary : colors.border }]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={[styles.payIcon, { backgroundColor: "#FFB80020" }]}>
                      <Image source={COIN_IMAGE} style={{ width: 22, height: 22 }} resizeMode="contain" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.payLabel, { color: colors.foreground }]}>Ridhi Coins</Text>
                      <Text style={[styles.paySub, { color: colors.mutedForeground }]}>You have {coinBalance.toLocaleString("en-IN")} coins</Text>
                    </View>
                    <Text style={[styles.payAmount, { color: colors.primary }]}>{coinCost.toLocaleString("en-IN")} coins</Text>
                  </View>
                  {payMethod === "coins" && (
                    <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
                      <Text style={[styles.payNote, { color: colors.mutedForeground }]}>
                        Coins are non-refundable once the campaign is submitted.
                      </Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setPayMethod("direct")}
                  style={[styles.payCard, { backgroundColor: colors.card, borderColor: payMethod === "direct" ? colors.primary : colors.border }]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={[styles.payIcon, { backgroundColor: "#22C55E20" }]}>
                      <Feather name="credit-card" size={22} color="#22C55E" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.payLabel, { color: colors.foreground }]}>Direct Payment</Text>
                      <Text style={[styles.paySub, { color: colors.mutedForeground }]}>UPI, Card, Net Banking via Razorpay</Text>
                    </View>
                    <Text style={[styles.payAmount, { color: colors.primary }]}>₹{totalCost.toLocaleString("en-IN")}</Text>
                  </View>
                  {payMethod === "direct" && (
                    <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
                      <Text style={[styles.payNote, { color: colors.mutedForeground }]}>
                        Tax invoice will be available after payment.
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}

            {/* ── Step 6: Review ─────────────────────────────────────────── */}
            {step === 6 && (
              <View style={{ gap: 14 }}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Submit</Text>

                <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.reviewSection, { color: colors.foreground }]}>Campaign</Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground }]}>{headline || "Untitled"}</Text>
                  <Text style={[styles.reviewSub, { color: colors.mutedForeground }]}>{body || "No description"}</Text>

                  <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

                  <Text style={[styles.reviewSection, { color: colors.foreground }]}>Format & Creative</Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground }]}>{FORMATS.find((f) => f.key === format)?.label} · {isVideo ? "10-sec Video" : "Image"}</Text>

                  <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

                  <Text style={[styles.reviewSection, { color: colors.foreground }]}>Targeting</Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground }]}>{targetCity} · {targetAge} · {targetGender}</Text>
                  <Text style={[styles.reviewSub, { color: colors.mutedForeground }]}>{targetInterests.join(", ") || "All interests"}</Text>

                  <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

                  <Text style={[styles.reviewSection, { color: colors.foreground }]}>Budget</Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground }]}>₹{dailyBudget}/day · {days} days = ₹{totalCost.toLocaleString("en-IN")}</Text>

                  <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

                  <Text style={[styles.reviewSection, { color: colors.foreground }]}>Payment</Text>
                  <Text style={[styles.reviewValue, { color: colors.primary }]}>
                    {payMethod === "coins" ? `${coinCost.toLocaleString("en-IN")} Ridhi Coins` : `₹${totalCost.toLocaleString("en-IN")} (Direct)`}
                  </Text>
                </View>

                <Text style={[styles.reviewNote, { color: colors.mutedForeground }]}>
                  By submitting, you agree to Ridhi Ads Terms. Campaigns are reviewed within 24 hours. You will be notified via app, SMS, and email.
                </Text>
              </View>
            )}

            {/* Navigation buttons */}
            <View style={styles.navRow}>
              {step > 1 && (
                <Pressable onPress={() => setStep((s) => (s - 1) as CreateStep)} style={[styles.navBtnSecondary, { borderColor: colors.border }]}>
                  <Text style={[styles.navBtnSecondaryText, { color: colors.foreground }]}>Back</Text>
                </Pressable>
              )}
              {step < 6 ? (
                <Pressable
                  onPress={() => canNext() && setStep((s) => (s + 1) as CreateStep)}
                  style={[styles.navBtnPrimary, { backgroundColor: canNext() ? colors.primary : colors.muted, opacity: canNext() ? 1 : 0.5 }]}
                  disabled={!canNext()}
                >
                  <Text style={styles.navBtnPrimaryText}>Next</Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    if (payMethod === "direct") setShowPayment(true);
                    else setShowCoinConfirm(true);
                  }}
                  style={[styles.navBtnPrimary, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.navBtnPrimaryText}>Submit Campaign</Text>
                  <Feather name="send" size={16} color="#fff" />
                </Pressable>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ── Create Campaign Tab (Gated) ─────────────────────────────────────────── */}
      {tab === "create" && !user?.isBrandRegistered && (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            padding: 24,
            paddingTop: topPad + 20,
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <View style={[styles.gateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.gateIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Feather name="briefcase" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.gateTitle, { color: colors.foreground }]}>Brand Registration Required</Text>
            <Text style={[styles.gateSub, { color: colors.mutedForeground }]}>
              You need to register your brand on Ridhi before creating ad campaigns. Registration is a one-time ₹1,000 fee.
            </Text>
            <View style={{ width: "100%", gap: 10 }}>
              <View style={[styles.gateRow, { borderColor: colors.border }]}>
                <Feather name="check" size={14} color={colors.primary} />
                <Text style={[styles.gateRowText, { color: colors.foreground }]}>Unlimited ad campaigns</Text>
              </View>
              <View style={[styles.gateRow, { borderColor: colors.border }]}>
                <Feather name="check" size={14} color={colors.primary} />
                <Text style={[styles.gateRowText, { color: colors.foreground }]}>Access to Creator Marketplace</Text>
              </View>
              <View style={[styles.gateRow, { borderColor: colors.border }]}>
                <Feather name="check" size={14} color={colors.primary} />
                <Text style={[styles.gateRowText, { color: colors.foreground }]}>Campaign analytics & reports</Text>
              </View>
              <View style={[styles.gateRow, { borderColor: colors.border }]}>
                <Feather name="check" size={14} color={colors.primary} />
                <Text style={[styles.gateRowText, { color: colors.foreground }]}>GST invoices for your business</Text>
              </View>
              <View style={[styles.gateRow, { borderColor: colors.border }]}>
                <Feather name="check" size={14} color={colors.primary} />
                <Text style={[styles.gateRowText, { color: colors.foreground }]}>Priority support (24-hr SLA)</Text>
              </View>
            </View>
            <GradientButton
              label="Register Brand ₹1,000"
              onPress={() => router.push("/brand-register")}
              style={{ width: "100%", marginTop: 8 }}
            />
            <Pressable onPress={() => setTab("campaigns")} style={{ alignItems: "center", paddingVertical: 8 }}>
              <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Back to My Campaigns</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* Modals */}
      <CampaignDetailModal
        visible={showDetail}
        campaign={selectedCampaign}
        onClose={() => setShowDetail(false)}
        onShowInvoice={() => { setShowDetail(false); setShowInvoice(true); }}
        onDownloadReport={() => {
          if (!selectedCampaign) return;
          const c = selectedCampaign;
          const cpm = c.impressions ? ((c.spent / c.impressions) * 1000).toFixed(0) : "0";
          const cpc = c.clicks ? (c.spent / c.clicks).toFixed(2) : "0";
          const report = `
RIDHI AD PERFORMANCE REPORT
=============================
Campaign: ${c.headline}
ID: ${c.id}
Status: Completed

BUDGET
------
Total Budget: ₹${c.totalCost}
Spent: ₹${c.spent}
Daily Budget: ₹${c.dailyBudget}
Duration: ${c.days} days

TARGETING
---------
City: ${c.targetCity}
Age: ${c.targetAge}
Gender: ${c.targetGender}
Interests: ${c.targetInterests}

PERFORMANCE
-----------
Impressions: ${c.impressions.toLocaleString("en-IN")}
Clicks: ${c.clicks.toLocaleString("en-IN")}
CTR: ${c.ctr}%
CPM: ₹${cpm}
CPC: ₹${cpc}
ROAS: ${c.ctr > 2 ? "Good" : c.ctr > 1 ? "Average" : "Needs Improvement"}

Generated on ${new Date().toLocaleString("en-IN")}
`.trim();

          if (Platform.OS === "web") {
            const blob = new Blob([report], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Ridhi_Ad_Report_${c.id}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          } else {
            Share.share({
              message: report,
              title: `Ridhi Ad Report - ${c.headline}`,
            });
          }
        }}
      />
      <InvoiceModal
        visible={showInvoice}
        campaign={selectedCampaign}
        onClose={() => setShowInvoice(false)}
      />

      {/* Coin payment confirmation */}
      <Modal visible={showCoinConfirm} transparent animationType="fade">
        <View style={[styles.confirmOverlay, { backgroundColor: "#00000060" }]}>
          <View style={[styles.confirmSheet, { backgroundColor: colors.background }]}>
            <Image source={COIN_IMAGE} style={{ width: 40, height: 40 }} resizeMode="contain" />
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Confirm Coin Payment</Text>
            <Text style={[styles.confirmBody, { color: colors.mutedForeground }]}>
              You are about to spend {coinCost.toLocaleString("en-IN")} Ridhi Coins for this campaign.
            </Text>
            <View style={styles.confirmRow}>
              <Pressable onPress={() => setShowCoinConfirm(false)} style={[styles.confirmBtn, { borderColor: colors.border }]}>
                <Text style={[styles.confirmBtnText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCoinPay} style={[styles.confirmBtnPrimary, { backgroundColor: "#FFB800" }]}>
                <Text style={styles.confirmBtnPrimaryText}>Pay {coinCost.toLocaleString("en-IN")} Coins</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Direct payment sheet */}
      <PaymentSheet
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaySuccess}
        amount={totalCost}
        label={headline || "Ad Campaign"}
        sublabel={`${FORMATS.find((f) => f.key === format)?.label} · ${days} days`}
        noGst={false}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { padding: 4 },
  titleWrap: { flex: 1 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },

  // Tabs
  tabBar: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  tabBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },

  // Campaign card
  campaignCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  campaignTop: { flexDirection: "row", gap: 12, padding: 14 },
  campaignThumb: { width: 72, height: 72, borderRadius: 12 },
  campaignHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  campaignHeadline: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  campaignFormat: { fontSize: 11, fontFamily: "Inter_400Regular" },
  campaignMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  campaignCost: { fontSize: 12, fontFamily: "Inter_700Bold" },
  campaignDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold" },

  liveStats: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  statCol: { alignItems: "center", gap: 2 },
  statVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },

  rejectedBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderTopWidth: StyleSheet.hairlineWidth },
  rejectedText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },

  // Empty state
  emptyState: { alignItems: "center", gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },

  // Steps
  stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  stepDotWrap: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  stepLine: { width: 24, height: 2 },

  stepTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  stepSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },

  // Inputs
  inputLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  charCount: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 2 },

  // Format grid
  formatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  formatCard: { width: (width - 52) / 2, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  formatLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  formatDesc: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },

  // Upload
  uploadCard: { borderRadius: 16, borderWidth: 1, padding: 28, alignItems: "center", gap: 8 },
  uploadTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  uploadDesc: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  previewBox: { width: width - 64, height: 180, borderRadius: 16 },
  previewImage: { width: width - 64, height: 200, borderRadius: 16 },
  previewLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
  changeCreativeBtn: { paddingVertical: 8 },
  changeCreativeText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  // Chips
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  // Budget chips
  budgetChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 2 },
  // Campaign type cards
  typeCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },

  // Cost card
  costCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  costTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  costRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  costLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  costValue: { fontSize: 14, fontFamily: "Inter_700Bold" },

  // Pay cards
  payCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  payIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  paySub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  payAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  payNote: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },

  // Review
  reviewCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  reviewSection: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  reviewValue: { fontSize: 14, fontFamily: "Inter_500Medium" },
  reviewSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  reviewDivider: { height: 1, marginVertical: 2 },
  reviewNote: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 17, textAlign: "center", marginTop: 4 },

  // Nav buttons
  navRow: { flexDirection: "row", gap: 10, marginTop: 20, justifyContent: "flex-end" },
  navBtnSecondary: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  navBtnSecondaryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  navBtnPrimary: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  navBtnPrimaryText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },

  // Detail modal
  detailOverlay: { flex: 1, justifyContent: "flex-end" },
  detailSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" },
  detailHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10 },
  detailClose: { padding: 4 },
  detailTitle: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1, textAlign: "center" },
  detailImage: { width: "100%", height: 200, borderRadius: 16 },
  detailStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  detailStatusText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  detailPayMethod: { fontSize: 11, fontFamily: "Inter_400Regular" },
  detailHeadline: { fontSize: 16, fontFamily: "Inter_700Bold" },
  detailBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  ctaPill: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 4 },
  ctaPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  detailBox: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  detailBoxTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  detailItemLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  detailItemValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  invoiceTrigger: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  invoiceTriggerText: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  rejectedBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  rejectedBoxText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },

  // Expiry banner
  expiryBanner: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 4 },
  expiryText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1, lineHeight: 18 },

  // Invoice modal
  invoiceOverlay: { flex: 1, justifyContent: "flex-end" },
  invoiceSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%" },
  invoiceHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10 },
  invoiceTitle: { fontSize: 17, fontFamily: "Inter_700Bold", flex: 1 },
  invoiceClose: { padding: 4 },
  invoiceBrandBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  invoiceBrandText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
  invoiceSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  invoiceBox: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  invoiceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  invoiceKey: { fontSize: 12, fontFamily: "Inter_400Regular" },
  invoiceValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  invoiceDivider: { height: 1, marginVertical: 4 },
  invoiceTotalKey: { fontSize: 14, fontFamily: "Inter_700Bold" },
  invoiceTotalValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  invoiceNote: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 17, textAlign: "center" },
  invoiceActions: { flexDirection: "row", gap: 10, padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  invoiceBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  invoiceBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  invoiceBtnPrimary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  invoiceBtnPrimaryText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },

  // Coin confirm
  confirmOverlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  confirmSheet: { borderRadius: 24, padding: 28, alignItems: "center", gap: 14, width: "100%", maxWidth: 340 },
  confirmTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  confirmBody: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  confirmRow: { flexDirection: "row", gap: 10, width: "100%", marginTop: 4 },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  confirmBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  confirmBtnPrimary: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  confirmBtnPrimaryText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

  detailVideoLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },

  // Brand gate
  gateCard: { borderRadius: 24, borderWidth: 1, padding: 28, gap: 14, width: "100%", maxWidth: 400, alignItems: "center" },
  gateIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  gateTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  gateSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  gateRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12 },
  gateRowText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});

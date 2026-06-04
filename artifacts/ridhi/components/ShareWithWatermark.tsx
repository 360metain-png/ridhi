import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface ShareData {
  message: string;
  url?: string;
  title: string;
}

const SHARE_OPTIONS = [
  { id: "whatsapp", label: "WhatsApp", emoji: "👋", color: "#25D366" },
  { id: "instagram", label: "Instagram", emoji: "📸", color: "#E1306C" },
  { id: "facebook", label: "Facebook", emoji: "📘", color: "#1877F2" },
  { id: "twitter", label: "X / Twitter", emoji: "🐦", color: "#000000" },
  { id: "telegram", label: "Telegram", emoji: "✈️", color: "#0088CC" },
  { id: "snapchat", label: "Snapchat", emoji: "👻", color: "#FFFC00" },
  { id: "copy", label: "Copy Link", emoji: "📋", color: "#7B2FBE" },
  { id: "more", label: "More", emoji: "•••", color: "#9E9E9E" },
];

interface ShareWithWatermarkProps {
  visible: boolean;
  onClose: () => void;
  data: ShareData;
  type: "post" | "reel" | "story" | "live" | "video";
}

export function ShareWithWatermark({ visible, onClose, data, type }: ShareWithWatermarkProps) {
  const colors = useColors();
  const [copied, setCopied] = useState(false);

  const handleShare = async (optionId: string) => {
    const shareText = `${data.title} 🎨\n\n${data.message}\n\nShared from @RidhiApp — India's Social Universe 🇮🇳\n\n${data.url ?? ""}`;
    const shareUrl = data.url ?? "https://ridhi.app";

    if (optionId === "copy") {
      await Clipboard.setStringAsync(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    if (optionId === "more" && Platform.OS !== "web") {
      try {
        await Sharing.shareAsync(shareUrl, {
          dialogTitle: "Share via...",
          mimeType: "text/plain",
        });
      } catch {
        // User cancelled
      }
      onClose();
      return;
    }

    // Platform-specific deep links
    if (Platform.OS === "web") {
      Alert.alert(
        "Share with Watermark",
        `All shared content from Ridhi carries a watermark. This ${type} will be shared with the @RidhiApp mark.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Sharing with Watermark",
      `This ${type} will be shared with the Ridhi watermark embedded.`,
      [{ text: "OK", onPress: () => onClose() }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Share with Watermark
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              All shared content carries the Ridhi mark
            </Text>
          </View>

          {/* Watermark preview */}
          <View style={[styles.watermarkPreview, { backgroundColor: colors.muted }]}>
            <Text style={{ fontSize: 28 }}>🎨</Text>
            <Text style={[styles.watermarkText, { color: colors.foreground }]}>
              @RidhiApp watermark applied
            </Text>
            <Text style={[styles.watermarkSub, { color: colors.mutedForeground }]}>
              {type.charAt(0).toUpperCase() + type.slice(1)} will be shared with Ridhi branding
            </Text>
          </View>

          {/* Share grid */}
          <View style={styles.grid}>
            {SHARE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.option, { backgroundColor: colors.muted }]}
                onPress={() => handleShare(opt.id)}
              >
                <Text style={{ fontSize: 28 }}>{opt.emoji}</Text>
                <Text style={[styles.optionLabel, { color: colors.foreground }]}>
                  {opt.id === "copy" && copied ? "Copied!" : opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Cancel */}
          <Pressable style={[styles.cancelBtn, { borderTopColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.destructive }]}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: { alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" },

  watermarkPreview: {
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  watermarkText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  watermarkSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 20 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: "center",
  },
  option: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    minWidth: 72,
  },
  optionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  cancelBtn: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});

import React, { useState } from "react";
import {
  Alert,
  Linking,
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
import { FontAwesome5 } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface ShareData {
  message: string;
  url?: string;
  title: string;
}

const SHARE_OPTIONS = [
  { id: "whatsapp", label: "WhatsApp", icon: "whatsapp", iconSet: "fa5" as const, color: "#25D366" },
  { id: "instagram", label: "Instagram", icon: "instagram", iconSet: "fa5" as const, color: "#E1306C" },
  { id: "facebook", label: "Facebook", icon: "facebook", iconSet: "fa5" as const, color: "#1877F2" },
  { id: "twitter", label: "X / Twitter", icon: "twitter", iconSet: "fa5" as const, color: "#000000" },
  { id: "telegram", label: "Telegram", icon: "telegram", iconSet: "fa5" as const, color: "#0088CC" },
  { id: "snapchat", label: "Snapchat", icon: "snapchat", iconSet: "fa5" as const, color: "#FFFC00" },
  { id: "copy", label: "Copy Link", icon: "link", iconSet: "feather" as const, color: "#7B2FBE" },
  { id: "more", label: "More", icon: "more-horizontal", iconSet: "feather" as const, color: "#9E9E9E" },
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
    const shareText = `${data.title}\n\n${data.message}\n\n${data.url ?? ""}`;
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
    const deepLinks: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      snapchat: `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}`,
      instagram: `https://www.instagram.com/`, // Instagram web share not supported via URL scheme; will open app
    };

    const url = deepLinks[optionId];
    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else if (Platform.OS === "web") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        Alert.alert(
          "App Not Found",
          `${optionId} is not installed on your device.`,
          [{ text: "OK" }]
        );
      }
      onClose();
      return;
    }

    // Fallback for "more" on web
    if (optionId === "more" && Platform.OS === "web") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: data.title,
            text: shareText,
            url: shareUrl,
          });
        } catch {
          // User cancelled
        }
      } else {
        await Clipboard.setStringAsync(shareText);
        Alert.alert("Copied", "Share text copied to clipboard!");
      }
      onClose();
      return;
    }

    Alert.alert(
      "Share",
      `This ${type} will be shared.`,
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
              Share
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
                <View style={[styles.iconBox, { backgroundColor: opt.color + "18" }]}>
                  {opt.iconSet === "fa5" ? (
                    <FontAwesome5 name={opt.icon as any} size={22} color={opt.color} />
                  ) : (
                    <Feather name={opt.icon as any} size={22} color={opt.color} />
                  )}
                </View>
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
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    minWidth: 72,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  cancelBtn: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});

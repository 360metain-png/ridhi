import React, { useState, useCallback } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { DOWNLOAD_PRICING, type ContentType } from "@/data/coinEconomy";

interface DownloadServiceProps {
  visible: boolean;
  onClose: () => void;
  contentId: string;
  contentType: ContentType;
  contentTitle: string;
  ownerName: string;
  ownerId: string;
  onDownloadComplete?: () => void;
}

export function DownloadService({
  visible,
  onClose,
  contentId,
  contentType,
  contentTitle,
  ownerName,
  ownerId,
  onDownloadComplete,
}: DownloadServiceProps) {
  const { user, deductCoins, recordDownloadEarning } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const price = DOWNLOAD_PRICING[contentType]?.price ?? 5;
  const creatorShare = Math.floor(price * 0.6);
  const platformShare = price - creatorShare;

  const handleDownload = useCallback(async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to download content.");
      onClose();
      return;
    }

    if (user.coins < price) {
      Alert.alert(
        "Not Enough Coins",
        `You need ${price} coins to download this. Your balance: ${user.coins} coins.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Recharge", onPress: () => onClose() },
        ]
      );
      return;
    }

    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 800));

    // Deduct from downloader
    const deducted = await deductCoins(price);
    if (!deducted) {
      setProcessing(false);
      Alert.alert("Error", "Could not process payment. Please try again.");
      return;
    }

    // Credit creator via API (60% goes to creator)
    try {
      const { apiFetch } = await import("@/utils/api");
      await apiFetch("/api/downloads", {
        method: "POST",
        body: JSON.stringify({ contentId, contentType, ownerId, price }),
      });
    } catch {
      // API logging failed, but coins already deducted — continue
    }

    // If downloading own content, credit self
    if (user.id === ownerId) {
      await recordDownloadEarning(creatorShare);
    }

    // Record download transaction in AsyncStorage
    try {
      const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
      const tx = {
        id: `dl_${Date.now()}`,
        contentId,
        contentType,
        contentTitle,
        ownerName,
        ownerId,
        price,
        creatorShare,
        platformShare,
        timestamp: new Date().toISOString(),
      };
      const raw = await AsyncStorage.getItem("ridhi_downloads");
      const existing = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem("ridhi_downloads", JSON.stringify([tx, ...existing]));
    } catch {
      // Silent fail for analytics
    }

    setProcessing(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      setSuccess(false);
      onClose();
      onDownloadComplete?.();
      Alert.alert(
        "Download Complete",
        `${contentTitle} downloaded successfully!\n\n• ${price} coins deducted\n• ${ownerName} earned ${creatorShare} coins\n• Ridhi fee: ${platformShare} coins`,
      );
    }, 1200);
  }, [user, deductCoins, contentId, contentType, contentTitle, ownerName, ownerId, price, creatorShare, platformShare, onClose, onDownloadComplete]);

  if (success) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Feather name="check-circle" size={48} color="#34C759" />
            </View>
            <Text style={styles.successTitle}>Downloaded!</Text>
            <Text style={styles.successSub}>{contentTitle}</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>Download Content</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{contentTitle}</Text>

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Download Price</Text>
            <Text style={styles.priceValue}>{price} coins</Text>
          </View>
          <View style={styles.splitRow}>
            <Feather name="user" size={14} color="#8E8E93" />
            <Text style={styles.splitText}>{ownerName} (creator)</Text>
            <Text style={styles.splitValue}>+{creatorShare} coins</Text>
          </View>
          <View style={styles.splitRow}>
            <Feather name="box" size={14} color="#8E8E93" />
            <Text style={styles.splitText}>Ridhi platform</Text>
            <Text style={styles.splitValue}>+{platformShare} coins</Text>
          </View>
        </View>

        {/* Balance */}
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceValue}>{user?.coins ?? 0} coins</Text>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>After Download</Text>
          <Text style={[styles.balanceValue, (user?.coins ?? 0) < price && { color: "#F43F5E" }]}>
            {(user?.coins ?? 0) - price} coins
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.btnRow}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.downloadBtn, processing && { opacity: 0.6 }]}
            onPress={handleDownload}
            disabled={processing || (user?.coins ?? 0) < price}
          >
            {processing ? (
              <Text style={styles.downloadText}>Processing...</Text>
            ) : (
              <>
                <Feather name="download" size={16} color="#fff" />
                <Text style={styles.downloadText}>Download ({price} coins)</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3A3A3C",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  priceCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
  },
  priceLabel: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    color: "#E91E8C",
    fontWeight: "700",
  },
  splitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  splitText: {
    fontSize: 13,
    color: "#8E8E93",
    flex: 1,
  },
  splitValue: {
    fontSize: 13,
    color: "#34C759",
    fontWeight: "600",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  balanceValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#3A3A3C",
  },
  cancelText: {
    color: "#8E8E93",
    fontWeight: "600",
    fontSize: 14,
  },
  downloadBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E91E8C",
  },
  downloadText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  successCard: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#34C75918",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  successSub: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
  },
});

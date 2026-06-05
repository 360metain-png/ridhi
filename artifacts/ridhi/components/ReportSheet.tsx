import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import {
  ReportReason,
  ReportTargetType,
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  createReportTicket,
  STORAGE_KEY,
} from "@/data/reportTickets";

interface ReportSheetProps {
  visible: boolean;
  onClose: () => void;
  targetId: string;
  targetType: ReportTargetType;
  targetTitle?: string;
  targetUser?: string;
  reporterId: string;
}

export function ReportSheet({
  visible,
  onClose,
  targetId,
  targetType,
  targetTitle,
  targetUser,
  reporterId,
}: ReportSheetProps) {
  const colors = useColors();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    const ticket = createReportTicket(reporterId, targetId, targetType, selectedReason, {
      targetTitle,
      targetUser,
      description: description.trim() || undefined,
    });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [ticket, ...existing];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedReason(null);
        setDescription("");
        onClose();
      }, 2000);
    } catch {
      Alert.alert("Error", "Could not submit report. Please try again.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.handle} />

          {submitted ? (
            <View style={styles.success}>
              <View style={[styles.successIcon, { backgroundColor: colors.success + "20" }]}>
                <Feather name="check-circle" size={36} color={colors.success} />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>Report Submitted</Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                Our team will review this and take action within 24 hours.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.foreground }]}>Report Content</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  {targetTitle ? `"${targetTitle}"` : targetUser ? `@${targetUser}` : "This content"}
                </Text>
              </View>

              <ScrollView style={styles.reasons} showsVerticalScrollIndicator={false}>
                {REPORT_REASONS.map((reason) => {
                  const active = selectedReason === reason;
                  return (
                    <Pressable
                      key={reason}
                      style={[
                        styles.reasonRow,
                        {
                          backgroundColor: active ? colors.primary + "15" : colors.muted,
                          borderColor: active ? colors.primary + "50" : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedReason(reason)}
                    >
                      <Text style={[styles.reasonText, { color: colors.foreground }]}>
                        {REPORT_REASON_LABELS[reason]}
                      </Text>
                      {active && <Feather name="check" size={16} color={colors.primary} />}
                    </Pressable>
                  );
                })}
              </ScrollView>

              <TextInput
                style={[
                  styles.descInput,
                  {
                    backgroundColor: colors.muted,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Add more details (optional)..."
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
              />

              <Pressable
                style={[styles.submitBtn, { backgroundColor: selectedReason ? colors.destructive : colors.muted }]}
                onPress={handleSubmit}
                disabled={!selectedReason}
              >
                <Feather name="flag" size={16} color={selectedReason ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.submitText, { color: selectedReason ? "#fff" : colors.mutedForeground }]}>
                  Submit Report
                </Text>
              </Pressable>

              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
            </>
          )}
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
    maxHeight: "85%",
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
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" },

  reasons: { paddingHorizontal: 16, maxHeight: 320 },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  reasonText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  descInput: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: "top",
  },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  submitText: { fontSize: 15, fontFamily: "Inter_700Bold" },

  cancelBtn: { alignItems: "center", paddingVertical: 14 },
  cancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  success: { alignItems: "center", padding: 30, gap: 12 },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  successSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 20 },
});

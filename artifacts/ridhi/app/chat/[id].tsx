import React, { useState, useRef } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { CHATS } from "@/data/mockData";
import { Avatar } from "@/components/Avatar";

interface Message {
  id: string;
  text?: string;
  type: "text" | "voice" | "image" | "gif" | "sticker";
  fromMe: boolean;
  time: string;
  duration?: string;
  translated?: string;
  showTranslation?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id: "m1", text: "Hey! How are you doing?", type: "text", fromMe: false, time: "3:45 PM" },
  { id: "m2", text: "I'm great! Just got back from a run 😄", type: "text", fromMe: true, time: "3:46 PM" },
  { id: "m3", text: "Oh nice! Where do you usually run?", type: "text", fromMe: false, time: "3:47 PM" },
  { id: "m4", text: "Cubbon Park mostly. The vibe there is amazing in the morning!", type: "text", fromMe: true, time: "3:48 PM" },
  { id: "m5", type: "voice", duration: "0:12", fromMe: false, time: "3:50 PM" },
  { id: "m6", text: "That sounds like so much fun! When are you free?", type: "text", fromMe: false, time: "3:51 PM" },
];

const QUICK_REPLIES = ["👍 Sounds good!", "😂 Haha", "❤️ Love it!", "🔥 Amazing!", "👋 Hey!"];
const STICKERS = ["😂", "❤️", "🔥", "💯", "🎉", "😍", "😭", "👏", "🙏", "😎"];

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [disappearMode, setDisappearMode] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const chat = CHATS.find((c) => c.id === id);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const send = (text?: string, type: Message["type"] = "text") => {
    const msgText = text ?? input.trim();
    if (type === "text" && !msgText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg: Message = {
      id: "m" + Date.now(),
      text: type === "text" ? msgText : undefined,
      type,
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      duration: type === "voice" ? "0:05" : undefined,
    };
    setMessages((prev) => [msg, ...prev]);
    setInput("");
    setShowStickers(false);
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      send(undefined, "voice");
    } else {
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const toggleTranslation = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              translated: m.translated ?? "Translation: " + (m.text ?? "Voice message"),
              showTranslation: !m.showTranslation,
            }
          : m
      )
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.fromMe && styles.msgRowMe]}>
      {item.fromMe ? (
        <View style={styles.msgGroup}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.bubble, styles.bubbleMe]}
          >
            {item.type === "voice" ? (
              <View style={styles.voiceBubble}>
                <Feather name="mic" size={14} color="#fff" />
                <View style={styles.waveform}>
                  {[0.4, 0.8, 0.5, 1.0, 0.6, 0.9, 0.3, 0.7].map((h, i) => (
                    <View key={i} style={[styles.waveBar, { height: 14 * h, backgroundColor: "rgba(255,255,255,0.8)" }]} />
                  ))}
                </View>
                <Text style={styles.voiceDuration}>{item.duration}</Text>
              </View>
            ) : (
              <Text style={styles.bubbleTextMe}>{item.text}</Text>
            )}
            <Text style={styles.bubbleTime}>{item.time}</Text>
          </LinearGradient>
          {item.showTranslation && item.translated && (
            <View style={[styles.translationBox, { backgroundColor: colors.muted }]}>
              <Text style={[styles.translationText, { color: colors.mutedForeground }]}>{item.translated}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.msgGroup}>
          <View style={[styles.bubble, { backgroundColor: colors.muted }]}>
            {item.type === "voice" ? (
              <View style={styles.voiceBubble}>
                <Feather name="mic" size={14} color={colors.primary} />
                <View style={styles.waveform}>
                  {[0.4, 0.8, 0.5, 1.0, 0.6, 0.9, 0.3, 0.7].map((h, i) => (
                    <View key={i} style={[styles.waveBar, { height: 14 * h, backgroundColor: colors.primary + "80" }]} />
                  ))}
                </View>
                <Text style={[styles.voiceDuration, { color: colors.mutedForeground }]}>{item.duration}</Text>
              </View>
            ) : (
              <Text style={[styles.bubbleText, { color: colors.foreground }]}>{item.text}</Text>
            )}
            <View style={styles.bubbleFooter}>
              <Text style={[styles.bubbleTimeOther, { color: colors.mutedForeground }]}>{item.time}</Text>
              <Pressable onPress={() => toggleTranslation(item.id)} style={styles.translateBtn}>
                <Feather name="globe" size={10} color={colors.primary} />
                <Text style={[styles.translateLabel, { color: colors.primary }]}>
                  {item.showTranslation ? "Original" : "Translate"}
                </Text>
              </Pressable>
            </View>
          </View>
          {item.showTranslation && item.translated && (
            <View style={[styles.translationBox, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.translationText, { color: colors.foreground }]}>{item.translated}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerUser}>
          <Avatar name={chat?.userName ?? "User"} size={36} />
          <View>
            <View style={styles.nameRow}>
              <Text style={[styles.headerName, { color: colors.foreground }]}>{chat?.userName}</Text>
              {disappearMode && (
                <View style={[styles.disappearBadge, { backgroundColor: colors.primary + "20" }]}>
                  <Feather name="clock" size={10} color={colors.primary} />
                  <Text style={[styles.disappearText, { color: colors.primary }]}>Disappear</Text>
                </View>
              )}
            </View>
            <Text style={[styles.headerStatus, { color: chat?.isOnline ? colors.success : colors.mutedForeground }]}>
              {chat?.isOnline ? "● Online" : "Offline"}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setDisappearMode(!disappearMode)}
            style={[styles.headerBtn, disappearMode && { backgroundColor: colors.primary + "15" }]}
          >
            <Feather name="clock" size={18} color={disappearMode ? colors.primary : colors.mutedForeground} />
          </Pressable>
          <Pressable style={styles.headerBtn}>
            <Feather name="phone" size={20} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.headerBtn}>
            <Feather name="video" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        inverted
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          <View style={styles.quickReplies}>
            {QUICK_REPLIES.map((qr) => (
              <Pressable
                key={qr}
                onPress={() => send(qr)}
                style={[styles.quickReply, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Text style={[styles.quickReplyText, { color: colors.foreground }]}>{qr}</Text>
              </Pressable>
            ))}
          </View>
        }
        renderItem={renderMessage}
      />

      {showStickers && (
        <View style={[styles.stickerPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.stickerGrid}>
            {STICKERS.map((s) => (
              <Pressable key={s} onPress={() => send(s)} style={styles.stickerBtn}>
                <Text style={styles.stickerText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.inputBar, { borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
        <Pressable
          onPress={() => { setShowAttach(!showAttach); setShowStickers(false); }}
          style={[styles.attachBtn, { backgroundColor: showAttach ? colors.primary + "20" : colors.muted }]}
        >
          <Feather name="plus" size={20} color={showAttach ? colors.primary : colors.mutedForeground} />
        </Pressable>

        {showAttach && (
          <View style={[styles.attachMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { icon: "image", label: "Photo", color: "#E91E8C" },
              { icon: "video", label: "Video", color: "#7B2FBE" },
              { icon: "file", label: "File", color: "#2196F3" },
              { icon: "map-pin", label: "Location", color: "#34C759" },
              { icon: "gift", label: "Gift", color: "#FFB800" },
            ].map((a) => (
              <Pressable
                key={a.label}
                onPress={() => setShowAttach(false)}
                style={styles.attachItem}
              >
                <View style={[styles.attachIcon, { backgroundColor: a.color + "18" }]}>
                  <Feather name={a.icon as any} size={18} color={a.color} />
                </View>
                <Text style={[styles.attachLabel, { color: colors.foreground }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.foreground }]}
            placeholder={isRecording ? "Recording…" : "Type a message..."}
            placeholderTextColor={isRecording ? colors.destructive : colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            editable={!isRecording}
          />
          <Pressable onPress={() => { setShowStickers(!showStickers); setShowAttach(false); }} style={styles.emojiBtn}>
            <Feather name="smile" size={20} color={showStickers ? colors.primary : colors.mutedForeground} />
          </Pressable>
        </View>

        {input.trim() ? (
          <Pressable onPress={() => send()} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
            <Feather name="send" size={18} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleVoiceRecord}
            style={[
              styles.sendBtn,
              { backgroundColor: isRecording ? colors.destructive : colors.primary },
            ]}
          >
            <Feather name={isRecording ? "square" : "mic"} size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerUser: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  disappearBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  disappearText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  headerStatus: { fontSize: 12, fontFamily: "Inter_400Regular" },
  headerActions: { flexDirection: "row", gap: 4 },
  headerBtn: { padding: 6, borderRadius: 8 },
  msgRow: { flexDirection: "row" },
  msgRowMe: { justifyContent: "flex-end" },
  msgGroup: { maxWidth: "75%", gap: 3 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bubbleTextMe: { color: "#fff", fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "flex-end", color: "rgba(255,255,255,0.7)" },
  bubbleFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  bubbleTimeOther: { fontSize: 10, fontFamily: "Inter_400Regular" },
  translateBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  translateLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  translationBox: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  translationText: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  voiceBubble: { flexDirection: "row", alignItems: "center", gap: 8 },
  waveform: { flexDirection: "row", alignItems: "center", gap: 2, height: 20 },
  waveBar: { width: 3, borderRadius: 2 },
  voiceDuration: { fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_400Regular" },
  quickReplies: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 16, paddingBottom: 4 },
  quickReply: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  quickReplyText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  stickerPanel: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 8 },
  stickerGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 4 },
  stickerBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  stickerText: { fontSize: 28 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  attachBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  attachMenu: {
    position: "absolute",
    bottom: 64,
    left: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  attachItem: { alignItems: "center", gap: 4 },
  attachIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  attachLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 42,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  emojiBtn: { padding: 2 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});

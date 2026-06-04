import React, { useState, useRef, useEffect } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { CHATROOMS, getDefaultMessages, type RoomMessage } from "@/data/chatrooms";
import { Avatar } from "@/components/Avatar";
import { PrivateHead } from "@/components/PrivateHead";

const STICKERS = [
  "😂", "❤️", "🔥", "💯", "🎉", "😍", "😭", "👏", "🙏", "😎", "🤯", "👑",
  "🥰", "💀", "😱", "🤩", "💪", "🫶", "🌹", "✨", "🎶", "🏆", "🤣", "😘",
];
const QUICK_REPLIES = ["👍", "🔥 Facts!", "Agree!", "😂", "❤️", "🙏 Thanks"];
const REACTION_EMOJIS = [
  "❤️", "😂", "😯", "👏", "🔥", "💯",
  "😍", "🥰", "😭", "🤯", "🎉", "💪",
  "👑", "🙏", "🤩", "💀", "😱", "🫶",
];

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function SystemBubble({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={styles.systemRow}>
      <View style={[styles.systemBubble, { backgroundColor: colors.muted }]}>
        <Feather name="info" size={11} color={colors.mutedForeground} />
        <Text style={[styles.systemText, { color: colors.mutedForeground }]}>{text}</Text>
      </View>
    </View>
  );
}

function MessageBubble({
  msg,
  isMe,
  onReact,
  onLongPress,
}: {
  msg: RoomMessage;
  isMe: boolean;
  onReact: (msgId: string, emoji: string) => void;
  onLongPress: (msgId: string) => void;
}) {
  const colors = useColors();
  const [showReact, setShowReact] = useState(false);

  return (
    <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
      {!isMe && (
        <View style={styles.avatar}>
          <Avatar name={msg.userName} size={28} />
        </View>
      )}
      <View style={[styles.msgGroup, isMe && { alignItems: "flex-end" }]}>
        {!isMe && (
          <Text style={[styles.msgUser, { color: colors.primary }]}>{msg.userName}</Text>
        )}
        <Pressable
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onLongPress(msg.id);
            setShowReact(true);
          }}
          delayLongPress={300}
        >
          {isMe ? (
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.bubble, styles.bubbleMe]}
            >
              <Text style={styles.bubbleTextMe}>{msg.text}</Text>
              <Text style={styles.bubbleTimeMe}>{msg.time}</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, { backgroundColor: colors.muted }]}>
              <Text style={[styles.bubbleText, { color: colors.foreground }]}>{msg.text}</Text>
              <Text style={[styles.bubbleTime, { color: colors.mutedForeground }]}>{msg.time}</Text>
            </View>
          )}
        </Pressable>

        {showReact && (
          <View style={[styles.reactPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {REACTION_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => {
                  onReact(msg.id, e);
                  setShowReact(false);
                }}
                style={styles.reactPickerBtn}
              >
                <Text style={styles.reactPickerEmoji}>{e}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setShowReact(false)} style={styles.reactPickerBtn}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}

        {msg.reactions && msg.reactions.length > 0 && (
          <View style={styles.reactionsRow}>
            {msg.reactions.map((r) => (
              <Pressable
                key={r.emoji}
                onPress={() => onReact(msg.id, r.emoji)}
                style={[styles.reactionChip, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                <Text style={[styles.reactionCount, { color: colors.mutedForeground }]}>{r.count}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {msg.isPinned && (
          <View style={[styles.pinnedBadge, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="bookmark" size={10} color={colors.primary} />
            <Text style={[styles.pinnedText, { color: colors.primary }]}>Pinned</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ChatroomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const room = CHATROOMS.find((r) => r.id === id);
  const [messages, setMessages] = useState<RoomMessage[]>(getDefaultMessages(id ?? ""));
  const [input, setInput] = useState("");
  const [isJoined, setIsJoined] = useState(room?.isJoined ?? false);
  const [showStickers, setShowStickers] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [memberCount, setMemberCount] = useState(room?.memberCount ?? 0);
  const [onlineCount] = useState(room?.onlineCount ?? 0);
  const flatRef = useRef<FlatList>(null);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleJoin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsJoined(true);
    setMemberCount((c) => c + 1);
    const sys: RoomMessage = {
      id: "sys_" + Date.now(),
      userId: "system",
      userName: "",
      text: "You joined the room! Say hello 👋",
      time: "",
      type: "system",
    };
    setMessages((prev) => [...prev, sys]);
  };

  const send = (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg: RoomMessage = {
      id: "m_" + Date.now(),
      userId: "me",
      userName: "You",
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    setShowStickers(false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleReact = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const existing = m.reactions?.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: m.reactions!.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            ),
          };
        }
        return { ...m, reactions: [...(m.reactions ?? []), { emoji, count: 1 }] };
      })
    );
  };

  if (!room) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.mutedForeground }}>Room not found</Text>
      </View>
    );
  }

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
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <LinearGradient
          colors={[room.gradientStart + "30", room.gradientEnd + "18"]}
          style={styles.roomEmojiSmall}
        >
          <Text style={{ fontSize: 18 }}>{room.emoji}</Text>
        </LinearGradient>
        <Pressable style={{ flex: 1 }} onPress={() => setShowInfo(true)}>
          <Text style={[styles.headerName, { color: colors.foreground }]} numberOfLines={1}>
            {room.name}
          </Text>
          <View style={styles.headerMeta}>
            <View style={[styles.onlineDot, { backgroundColor: "#34C759" }]} />
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {formatCount(onlineCount)} online · {formatCount(memberCount)} members
            </Text>
          </View>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowInfo(true)}
            style={styles.headerBtn}
            accessibilityLabel="Room info"
          >
            <Feather name="users" size={20} color={colors.mutedForeground} />
          </Pressable>
          <Pressable style={styles.headerBtn} accessibilityLabel="Search in room">
            <Feather name="search" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, gap: 6 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          if (item.type === "system") return <SystemBubble text={item.text} />;
          return (
            <MessageBubble
              msg={item}
              isMe={item.userId === "me"}
              onReact={handleReact}
              onLongPress={() => {}}
            />
          );
        }}
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

      {!isJoined ? (
        <View style={[styles.joinBar, { borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.joinTitle, { color: colors.foreground }]}>Join to chat</Text>
            <Text style={[styles.joinSub, { color: colors.mutedForeground }]}>
              {formatCount(memberCount)} members already here
            </Text>
          </View>
          <Pressable onPress={handleJoin} accessibilityLabel="Join chatroom">
            <LinearGradient
              colors={[room.gradientStart, room.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.joinBtn}
            >
              <Feather name="user-plus" size={16} color="#fff" />
              <Text style={styles.joinBtnText}>Join Room</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickReplies}
          >
            {QUICK_REPLIES.map((qr) => (
              <Pressable
                key={qr}
                onPress={() => send(qr)}
                style={[styles.quickReply, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Text style={[styles.quickReplyText, { color: colors.foreground }]}>{qr}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.inputBar, { borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
            <Pressable
              onPress={() => setShowStickers(!showStickers)}
              style={[styles.iconBtn, { backgroundColor: showStickers ? colors.primary + "20" : colors.muted }]}
            >
              <Feather name="smile" size={20} color={showStickers ? colors.primary : colors.mutedForeground} />
            </Pressable>
            <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.foreground }]}
                placeholder={`Message ${room.name}...`}
                placeholderTextColor={colors.mutedForeground}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />
            </View>
            <Pressable
              onPress={() => send()}
              disabled={!input.trim()}
              style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
              accessibilityLabel="Send message"
            >
              <Feather name="send" size={18} color={input.trim() ? "#fff" : colors.mutedForeground} />
            </Pressable>
          </View>
        </>
      )}

      <Modal visible={showInfo} animationType="slide" transparent onRequestClose={() => setShowInfo(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowInfo(false)} />
        <View style={[styles.infoSheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.infoHandle, { backgroundColor: colors.border }]} />
          <LinearGradient
            colors={[room.gradientStart + "30", room.gradientEnd + "10"]}
            style={styles.infoBanner}
          >
            <Text style={styles.infoBannerEmoji}>{room.emoji}</Text>
            <Text style={[styles.infoBannerName, { color: colors.foreground }]}>{room.name}</Text>
            <Text style={[styles.infoBannerDesc, { color: colors.mutedForeground }]}>{room.description}</Text>
          </LinearGradient>

          <View style={styles.infoStats}>
            {[
              { icon: "users", label: "Members", value: formatCount(memberCount) },
              { icon: "activity", label: "Online", value: formatCount(onlineCount) },
              { icon: "globe", label: "Language", value: room.language },
              { icon: "tag", label: "Category", value: room.category },
            ].map((s) => (
              <View key={s.label} style={[styles.infoStat, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name={s.icon as any} size={18} color={colors.primary} />
                <Text style={[styles.infoStatValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.infoStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoActions}>
            <Pressable
              accessibilityLabel={isJoined ? "Leave Room" : "Join Room"}
              accessibilityRole="button"
              onPress={() => {
                if (isJoined) {
                  setIsJoined(false);
                  setMemberCount((c) => c - 1);
                  setShowInfo(false);
                } else {
                  handleJoin();
                  setShowInfo(false);
                }
              }}
              style={[
                styles.infoActionBtn,
                isJoined
                  ? { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "40" }
                  : { backgroundColor: room.gradientStart + "20", borderColor: room.gradientStart + "40" },
              ]}
            >
              <Feather
                name={isJoined ? "log-out" : "user-plus"}
                size={16}
                color={isJoined ? colors.destructive : room.gradientStart}
              />
              <Text
                style={[
                  styles.infoActionText,
                  { color: isJoined ? colors.destructive : room.gradientStart },
                ]}
              >
                {isJoined ? "Leave Room" : "Join Room"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.infoActionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              onPress={() => setShowInfo(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Feather name="x" size={16} color={colors.foreground} />
              <Text style={[styles.infoActionText, { color: colors.foreground }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  roomEmojiSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  headerActions: { flexDirection: "row", gap: 2 },
  headerBtn: { padding: 6 },
  msgRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  msgRowMe: { justifyContent: "flex-end" },
  avatar: { marginBottom: 4 },
  msgGroup: { maxWidth: "75%", gap: 3 },
  msgUser: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginLeft: 2, marginBottom: 2 },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 3,
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 19 },
  bubbleTextMe: { color: "#fff", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 19 },
  bubbleTime: { fontSize: 9, fontFamily: "Inter_400Regular", alignSelf: "flex-end" },
  bubbleTimeMe: { fontSize: 9, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", alignSelf: "flex-end" },
  reactPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
    marginTop: 2,
    maxWidth: 240,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  reactPickerBtn: { padding: 4 },
  reactPickerEmoji: { fontSize: 18 },
  reactionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 3 },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  reactionEmoji: { fontSize: 12 },
  reactionCount: { fontSize: 11, fontFamily: "Inter_500Medium" },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  pinnedText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  systemRow: { alignItems: "center", marginVertical: 4 },
  systemBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  systemText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  stickerPanel: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  stickerGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 4 },
  stickerBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  stickerText: { fontSize: 26 },
  quickReplies: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  quickReply: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickReplyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  joinBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  joinTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  joinSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  joinBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  inputWrap: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    maxHeight: 80,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  infoSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    overflow: "hidden",
  },
  infoHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  infoBanner: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 6,
  },
  infoBannerEmoji: { fontSize: 40 },
  infoBannerName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  infoBannerDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  infoStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 8,
  },
  infoStat: {
    flex: 1,
    minWidth: "40%",
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoStatValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  infoStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  infoActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  infoActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoActionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  infoJoinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
  },
  infoJoinText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

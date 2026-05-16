import React, { useState, useRef } from "react";
import {
  FlatList,
  Platform,
  Pressable,
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
import { CHATS } from "@/data/mockData";
import { Avatar } from "@/components/Avatar";

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: "m1", text: "Hey! How are you doing?", fromMe: false, time: "3:45 PM" },
  { id: "m2", text: "I'm great! Just got back from a run 😄", fromMe: true, time: "3:46 PM" },
  { id: "m3", text: "Oh nice! Where do you usually run?", fromMe: false, time: "3:47 PM" },
  { id: "m4", text: "Cubbon Park mostly. The vibe there is amazing in the morning!", fromMe: true, time: "3:48 PM" },
  { id: "m5", text: "That sounds like so much fun! When are you free?", fromMe: false, time: "3:50 PM" },
];

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const flatRef = useRef<FlatList>(null);

  const chat = CHATS.find((c) => c.id === id);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const send = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg: Message = {
      id: "m" + Date.now(),
      text: input.trim(),
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [msg, ...prev]);
    setInput("");
  };

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
            <Text style={[styles.headerName, { color: colors.foreground }]}>{chat?.userName}</Text>
            <Text style={[styles.headerStatus, { color: chat?.isOnline ? colors.success : colors.mutedForeground }]}>
              {chat?.isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
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
        renderItem={({ item }) => (
          <View style={[styles.msgRow, item.fromMe && styles.msgRowMe]}>
            {item.fromMe ? (
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.bubble, styles.bubbleMe]}
              >
                <Text style={styles.bubbleTextMe}>{item.text}</Text>
                <Text style={styles.bubbleTime}>{item.time}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.bubble, { backgroundColor: colors.muted }]}>
                <Text style={[styles.bubbleText, { color: colors.foreground }]}>{item.text}</Text>
                <Text style={[styles.bubbleTime, { color: colors.mutedForeground }]}>{item.time}</Text>
              </View>
            )}
          </View>
        )}
      />

      <View style={[styles.inputBar, { borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
        <Pressable style={[styles.attachBtn, { backgroundColor: colors.muted }]}>
          <Feather name="paperclip" size={20} color={colors.mutedForeground} />
        </Pressable>
        <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.foreground }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />
          <Pressable style={styles.emojiBtn}>
            <Feather name="smile" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>
        <Pressable
          onPress={send}
          style={[
            styles.sendBtn,
            { backgroundColor: input.trim() ? colors.primary : colors.muted },
          ]}
        >
          <Feather name="send" size={20} color={input.trim() ? "#fff" : colors.mutedForeground} />
        </Pressable>
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
  headerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  headerStatus: { fontSize: 12, fontFamily: "Inter_400Regular" },
  headerActions: { flexDirection: "row", gap: 4 },
  headerBtn: { padding: 8 },
  msgRow: { flexDirection: "row" },
  msgRowMe: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bubbleTextMe: { color: "#fff", fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "flex-end", color: "rgba(255,255,255,0.7)" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  attachBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
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

import React, { useState, useRef } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_CHANNELS } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

export default function ChannelDetailScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const channel = MOCK_CHANNELS.find(c => c.id === id);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  if (!channel) return null;

  const isCreator = channel.creatorName === user?.name;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerInfo}>
             <Text style={styles.channelName}>{channel.name}</Text>
             <Text style={styles.subscriberCount}>{channel.subscribers.toLocaleString()} subscribers</Text>
          </View>
          <Pressable style={styles.iconBtn} onPress={() => Alert.alert("Channel Options", "Subscribe, notifications, report")}>
            <Feather name="more-vertical" size={24} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView 
        ref={scrollRef}
        style={styles.chatScroll} 
        contentContainerStyle={{ padding: 16, gap: 16 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.introCard}>
           <View style={[styles.introIcon, { backgroundColor: colors.primary + "20" }]}>
             <Text style={{ fontSize: 32 }}>📢</Text>
           </View>
           <Text style={[styles.introTitle, { color: colors.foreground }]}>Welcome to {channel.name}</Text>
           <Text style={[styles.introDesc, { color: colors.mutedForeground }]}>{channel.description}</Text>
           <View style={[styles.introCreator, { backgroundColor: colors.muted }]}>
             <Text style={[styles.creatorLabel, { color: colors.mutedForeground }]}>Created by {channel.creatorName}</Text>
           </View>
        </View>

        {channel.messages.map((msg) => (
          <View key={msg.id} style={styles.messageRow}>
             <View style={[styles.messageBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.messageText, { color: colors.foreground }]}>{msg.text}</Text>
                <Text style={[styles.messageTime, { color: colors.mutedForeground }]}>{msg.time}</Text>
                
                {/* Reactions */}
                <View style={styles.reactionsRow}>
                   {msg.reactions.map((reaction, ri) => (
                     <Pressable key={ri} style={[styles.reactionBadge, { backgroundColor: colors.muted }]}>
                        <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                        <Text style={[styles.reactionCount, { color: colors.foreground }]}>{reaction.count}</Text>
                     </Pressable>
                   ))}
                   {!isCreator && (
                     <Pressable style={[styles.addReaction, { backgroundColor: colors.muted }]}>
                        <Feather name="plus" size={12} color={colors.mutedForeground} />
                     </Pressable>
                   )}
                </View>
             </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area (Only for Creator) */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
          {isCreator ? (
            <View style={styles.creatorInputRow}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Send a broadcast..."
                  placeholderTextColor={colors.muted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />
              </View>
              <Pressable style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={() => Alert.alert("Broadcast", "Send broadcast message to all subscribers")}>
                <Feather name="send" size={20} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.readOnlyNote}>
               <Feather name="lock" size={14} color={colors.mutedForeground} />
               <Text style={[styles.readOnlyText, { color: colors.mutedForeground }]}>Only creators can send messages here.</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1, alignItems: "center" },
  channelName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  subscriberCount: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  chatScroll: { flex: 1 },
  introCard: { alignItems: "center", padding: 24, marginBottom: 20 },
  introIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  introTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  introDesc: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  introCreator: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  creatorLabel: { fontSize: 12, fontWeight: "500" },
  messageRow: { alignSelf: "flex-start", maxWidth: "85%" },
  messageBubble: { padding: 12, borderRadius: 20, borderTopLeftRadius: 4, borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 20, marginBottom: 4 },
  messageTime: { fontSize: 10, alignSelf: "flex-end" },
  reactionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  reactionBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  reactionEmoji: { fontSize: 12 },
  reactionCount: { fontSize: 10, fontWeight: "bold" },
  addReaction: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  inputContainer: { padding: 12, borderTopWidth: 1 },
  creatorInputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  inputWrapper: { flex: 1, borderRadius: 24, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100 },
  input: { fontSize: 15, padding: 0 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  readOnlyNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 8 },
  readOnlyText: { fontSize: 13 },
});

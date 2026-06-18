import React from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAIReplySuggestions } from "@/hooks/useAIMatch";

interface Props {
  lastMessage: string;
  otherUser: { name: string; interests?: string[]; language?: string };
  onSelectReply: (reply: string) => void;
}

export function AIReplySuggestions({ lastMessage, otherUser, onSelectReply }: Props) {
  const colors = useColors();
  const suggestions = useAIReplySuggestions(lastMessage, otherUser);

  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="cpu" size={12} color={colors.primary} />
        <Text style={[styles.headerText, { color: colors.primary }]}>
          AI Suggestions
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((reply, i) => (
          <Pressable
            key={i}
            onPress={() => onSelectReply(reply)}
            style={[styles.suggestionChip, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
          >
            <Text style={[styles.suggestionText, { color: colors.primary }]} numberOfLines={1}>
              {reply}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  headerText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 280,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});

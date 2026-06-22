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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((reply, i) => (
          <Pressable
            key={i}
            onPress={() => onSelectReply(reply)}
            style={[
              styles.suggestionChip,
              { backgroundColor: colors.muted + "60", borderColor: colors.border },
            ]}
          >
            <Text style={[styles.suggestionText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {reply}
            </Text>
          </Pressable>
        ))}
        <View style={styles.ghostLabel}>
          <Feather name="zap" size={10} color={colors.mutedForeground} />
          <Text style={[styles.ghostLabelText, { color: colors.mutedForeground }]}>AI</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: "center",
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 280,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  ghostLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingLeft: 4,
    opacity: 0.6,
  },
  ghostLabelText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
});

import React from "react";
import { View, StyleSheet } from "react-native";

// ── Filter definitions ──────────────────────────────────────────────────────
export interface FilterDef {
  id: string;
  name: string;
  emoji: string;
  overlayColor: string;
  overlayOpacity: number;
  tintColor?: string;
  saturation?: number;
}

export const VIDEO_FILTERS: FilterDef[] = [
  { id: "none",     name: "Original", emoji: "☀️", overlayColor: "transparent", overlayOpacity: 0 },
  { id: "warm",     name: "Warm",     emoji: "🌅", overlayColor: "#FF8C00", overlayOpacity: 0.18, tintColor: "#FF8C00" },
  { id: "cool",     name: "Cool",     emoji: "❄️", overlayColor: "#4A90E2", overlayOpacity: 0.18, tintColor: "#4A90E2" },
  { id: "vivid",    name: "Vivid",    emoji: "🎨", overlayColor: "#E91E8C", overlayOpacity: 0.12, tintColor: "#FF1493" },
  { id: "soft",     name: "Soft",     emoji: "🌸", overlayColor: "#FFB6C1", overlayOpacity: 0.22, tintColor: "#FFB6C1" },
  { id: "noir",     name: "Noir",     emoji: "🖼️", overlayColor: "#000000", overlayOpacity: 0.35, tintColor: "#333333" },
  { id: "vintage",  name: "Vintage",  emoji: "🖼️", overlayColor: "#D4A574", overlayOpacity: 0.25, tintColor: "#D4A574" },
  { id: "dramatic", name: "Dramatic", emoji: "⚡", overlayColor: "#4B0082", overlayOpacity: 0.20, tintColor: "#4B0082" },
  { id: "golden",   name: "Golden",   emoji: "✨", overlayColor: "#FFD700", overlayOpacity: 0.15, tintColor: "#FFD700" },
  { id: "pastel",   name: "Pastel",   emoji: "🌈", overlayColor: "#E6E6FA", overlayOpacity: 0.20, tintColor: "#DDA0DD" },
  { id: "crimson",  name: "Crimson",  emoji: "🐴", overlayColor: "#DC143C", overlayOpacity: 0.18, tintColor: "#DC143C" },
  { id: "forest",   name: "Forest",   emoji: "🌳", overlayColor: "#228B22", overlayOpacity: 0.15, tintColor: "#228B22" },
  { id: "ocean",    name: "Ocean",    emoji: "🌊", overlayColor: "#008080", overlayOpacity: 0.18, tintColor: "#008080" },
  { id: "sunset",   name: "Sunset",   emoji: "🌇", overlayColor: "#FF6B35", overlayOpacity: 0.22, tintColor: "#FF6B35" },
  { id: "moon",     name: "Moon",     emoji: "🌙", overlayColor: "#191970", overlayOpacity: 0.25, tintColor: "#191970" },
  { id: "desi",     name: "Desi",     emoji: "🇮🇳", overlayColor: "#FF9933", overlayOpacity: 0.15, tintColor: "#FF9933" },
];

interface VideoFilterProps {
  filterId: string;
  children: React.ReactNode;
  style?: any;
}

export function VideoFilter({ filterId, children, style }: VideoFilterProps) {
  const filter = VIDEO_FILTERS.find((f) => f.id === filterId) ?? VIDEO_FILTERS[0];
  return (
    <View style={[style, { position: "relative", overflow: "hidden" }]}>
      {children}
      {/* Filter overlay */}
      {filter.id !== "none" && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: filter.overlayColor,
              opacity: filter.overlayOpacity,
            },
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

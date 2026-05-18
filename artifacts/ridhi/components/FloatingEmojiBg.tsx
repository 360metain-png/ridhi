/**
 * FloatingEmojiBg — contextual floating emoji/heart background animation.
 * Drop as first child of any screen's root container.
 * Uses absolute fill + pointerEvents="none" so it never blocks interaction.
 */
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

export interface EmojiItem {
  emoji: string;
  x: number;    // 0–1 fraction of screen width
  size: number; // font size in px
  dur: number;  // full rise duration ms
  delay: number;// start delay ms
  spin: number; // degrees of rotation over full rise
}

/* ── Per-screen preset definitions ────────────────────────────────────────── */
export const EMOJI_PRESETS: Record<string, EmojiItem[]> = {

  // Onboarding + Login: already hardcoded there — not needed as a preset

  /** OTP verification */
  otp: [
    { emoji: "🔐", x: 0.08, size: 20, dur: 8000, delay: 0,    spin: 10  },
    { emoji: "✅", x: 0.24, size: 16, dur: 9500, delay: 800,  spin: -8  },
    { emoji: "💫", x: 0.42, size: 22, dur: 7000, delay: 1600, spin: 18  },
    { emoji: "🔑", x: 0.60, size: 18, dur: 8800, delay: 300,  spin: -15 },
    { emoji: "🛡️", x: 0.78, size: 16, dur: 9200, delay: 2200, spin: 12  },
    { emoji: "✨", x: 0.92, size: 20, dur: 7500, delay: 1200, spin: -6  },
    { emoji: "📱", x: 0.14, size: 18, dur: 8500, delay: 3000, spin: 22  },
    { emoji: "💌", x: 0.50, size: 14, dur: 9000, delay: 450,  spin: -20 },
    { emoji: "🌟", x: 0.68, size: 22, dur: 7200, delay: 3500, spin: 8   },
    { emoji: "🔓", x: 0.85, size: 18, dur: 8200, delay: 4000, spin: -25 },
  ],

  /** Profile setup wizard */
  profileSetup: [
    { emoji: "👤", x: 0.07, size: 20, dur: 8500, delay: 0,    spin: 12  },
    { emoji: "🎨", x: 0.22, size: 18, dur: 9000, delay: 700,  spin: -10 },
    { emoji: "📸", x: 0.40, size: 22, dur: 7000, delay: 1500, spin: 20  },
    { emoji: "✨", x: 0.58, size: 16, dur: 9500, delay: 400,  spin: -18 },
    { emoji: "🌟", x: 0.76, size: 20, dur: 8000, delay: 2000, spin: 10  },
    { emoji: "💫", x: 0.90, size: 18, dur: 9200, delay: 1100, spin: -8  },
    { emoji: "🎭", x: 0.14, size: 16, dur: 8800, delay: 2900, spin: 28  },
    { emoji: "🌈", x: 0.48, size: 22, dur: 7500, delay: 500,  spin: -22 },
    { emoji: "🎯", x: 0.68, size: 18, dur: 8300, delay: 3300, spin: 16  },
    { emoji: "💡", x: 0.32, size: 16, dur: 9800, delay: 2600, spin: 20  },
    { emoji: "🌸", x: 0.83, size: 20, dur: 7800, delay: 4000, spin: -14 },
  ],

  /** Home Feed — social reactions */
  feed: [
    { emoji: "❤️", x: 0.06, size: 22, dur: 7200, delay: 0,    spin: 8   },
    { emoji: "😍", x: 0.20, size: 18, dur: 9000, delay: 600,  spin: -10 },
    { emoji: "👏", x: 0.38, size: 22, dur: 6800, delay: 1400, spin: 15  },
    { emoji: "🔥", x: 0.55, size: 20, dur: 8500, delay: 300,  spin: -5  },
    { emoji: "😂", x: 0.72, size: 18, dur: 7500, delay: 2000, spin: 12  },
    { emoji: "💯", x: 0.88, size: 16, dur: 9200, delay: 1100, spin: -18 },
    { emoji: "🎉", x: 0.14, size: 20, dur: 8000, delay: 2800, spin: 22  },
    { emoji: "👀", x: 0.46, size: 16, dur: 9500, delay: 500,  spin: -12 },
    { emoji: "💬", x: 0.64, size: 20, dur: 7000, delay: 3300, spin: 8   },
    { emoji: "🤩", x: 0.30, size: 22, dur: 8800, delay: 1700, spin: -20 },
    { emoji: "🌟", x: 0.80, size: 16, dur: 7800, delay: 4000, spin: 14  },
    { emoji: "✨", x: 0.10, size: 18, dur: 9000, delay: 3600, spin: -6  },
  ],

  /** Reels — entertainment / creator energy */
  reels: [
    { emoji: "🎬", x: 0.07, size: 22, dur: 7500, delay: 0,    spin: 10  },
    { emoji: "🔥", x: 0.22, size: 20, dur: 9000, delay: 700,  spin: -8  },
    { emoji: "💃", x: 0.40, size: 24, dur: 6800, delay: 1500, spin: 20  },
    { emoji: "🎵", x: 0.58, size: 18, dur: 8500, delay: 300,  spin: -15 },
    { emoji: "🎶", x: 0.76, size: 20, dur: 7200, delay: 2200, spin: 12  },
    { emoji: "✨", x: 0.90, size: 16, dur: 9500, delay: 1200, spin: -6  },
    { emoji: "🤩", x: 0.14, size: 20, dur: 8200, delay: 3000, spin: 28  },
    { emoji: "👏", x: 0.50, size: 18, dur: 7000, delay: 450,  spin: -18 },
    { emoji: "🌟", x: 0.68, size: 22, dur: 8800, delay: 3500, spin: 14  },
    { emoji: "🎤", x: 0.32, size: 20, dur: 9200, delay: 2600, spin: 20  },
    { emoji: "🎸", x: 0.84, size: 18, dur: 7800, delay: 4200, spin: -22 },
    { emoji: "💥", x: 0.05, size: 16, dur: 8500, delay: 1800, spin: 16  },
  ],

  /** Match / Dating — love & romance */
  match: [
    { emoji: "❤️", x: 0.07, size: 24, dur: 7000, delay: 0,    spin: 12  },
    { emoji: "💕", x: 0.22, size: 18, dur: 9000, delay: 700,  spin: -10 },
    { emoji: "💗", x: 0.40, size: 28, dur: 6500, delay: 1500, spin: 20  },
    { emoji: "💖", x: 0.58, size: 16, dur: 8500, delay: 300,  spin: -22 },
    { emoji: "💘", x: 0.76, size: 22, dur: 7800, delay: 2200, spin: 10  },
    { emoji: "🌹", x: 0.90, size: 20, dur: 9500, delay: 1100, spin: -6  },
    { emoji: "😍", x: 0.14, size: 18, dur: 8000, delay: 2900, spin: 28  },
    { emoji: "💋", x: 0.50, size: 22, dur: 7000, delay: 450,  spin: -14 },
    { emoji: "🥰", x: 0.68, size: 20, dur: 9000, delay: 3500, spin: 16  },
    { emoji: "💞", x: 0.32, size: 16, dur: 8200, delay: 2600, spin: 22  },
    { emoji: "💝", x: 0.84, size: 24, dur: 7500, delay: 4000, spin: -18 },
    { emoji: "💫", x: 0.08, size: 16, dur: 8800, delay: 1800, spin: 12  },
  ],

  /** Chat list — messaging & warmth */
  chatList: [
    { emoji: "💬", x: 0.08, size: 20, dur: 8000, delay: 0,    spin: 10  },
    { emoji: "😊", x: 0.24, size: 18, dur: 9000, delay: 600,  spin: -8  },
    { emoji: "💕", x: 0.42, size: 22, dur: 7000, delay: 1400, spin: 18  },
    { emoji: "🤗", x: 0.60, size: 18, dur: 8800, delay: 300,  spin: -15 },
    { emoji: "😂", x: 0.78, size: 16, dur: 7500, delay: 2000, spin: 12  },
    { emoji: "🎉", x: 0.92, size: 20, dur: 9500, delay: 1100, spin: -6  },
    { emoji: "❤️", x: 0.14, size: 18, dur: 8200, delay: 2800, spin: 22  },
    { emoji: "👋", x: 0.50, size: 16, dur: 7000, delay: 450,  spin: -20 },
    { emoji: "😘", x: 0.68, size: 20, dur: 9200, delay: 3300, spin: 8   },
    { emoji: "💌", x: 0.32, size: 18, dur: 8500, delay: 1700, spin: -14 },
    { emoji: "✨", x: 0.84, size: 16, dur: 7800, delay: 4000, spin: 16  },
    { emoji: "🌟", x: 0.05, size: 22, dur: 8800, delay: 3600, spin: -10 },
  ],

  /** Chat detail — intimate conversation */
  chatDetail: [
    { emoji: "💬", x: 0.06, size: 16, dur: 8500, delay: 0,    spin: 8   },
    { emoji: "❤️", x: 0.20, size: 14, dur: 9000, delay: 800,  spin: -6  },
    { emoji: "😊", x: 0.38, size: 18, dur: 7200, delay: 1600, spin: 14  },
    { emoji: "🤗", x: 0.55, size: 14, dur: 9500, delay: 400,  spin: -10 },
    { emoji: "😂", x: 0.72, size: 16, dur: 8000, delay: 2200, spin: 10  },
    { emoji: "💕", x: 0.88, size: 14, dur: 9200, delay: 1200, spin: -8  },
    { emoji: "💌", x: 0.14, size: 16, dur: 8800, delay: 3000, spin: 18  },
    { emoji: "✨", x: 0.46, size: 14, dur: 7500, delay: 500,  spin: -16 },
    { emoji: "🌟", x: 0.64, size: 18, dur: 8200, delay: 3500, spin: 8   },
    { emoji: "😘", x: 0.30, size: 14, dur: 9800, delay: 2700, spin: -12 },
    { emoji: "🎉", x: 0.80, size: 16, dur: 7800, delay: 4000, spin: 14  },
  ],

  /** Profile — achievements & personality */
  profile: [
    { emoji: "⭐", x: 0.07, size: 20, dur: 8000, delay: 0,    spin: 10  },
    { emoji: "🌟", x: 0.22, size: 18, dur: 9000, delay: 700,  spin: -8  },
    { emoji: "💪", x: 0.40, size: 22, dur: 7000, delay: 1500, spin: 18  },
    { emoji: "🔥", x: 0.58, size: 18, dur: 8500, delay: 300,  spin: -12 },
    { emoji: "🎯", x: 0.76, size: 16, dur: 7500, delay: 2200, spin: 10  },
    { emoji: "👑", x: 0.90, size: 22, dur: 9500, delay: 1100, spin: -6  },
    { emoji: "💫", x: 0.14, size: 18, dur: 8200, delay: 2900, spin: 22  },
    { emoji: "🏆", x: 0.50, size: 20, dur: 7000, delay: 450,  spin: -18 },
    { emoji: "✨", x: 0.68, size: 16, dur: 9200, delay: 3500, spin: 14  },
    { emoji: "🙌", x: 0.32, size: 22, dur: 8800, delay: 1700, spin: 20  },
    { emoji: "💎", x: 0.84, size: 18, dur: 7800, delay: 4200, spin: -24 },
    { emoji: "🚀", x: 0.05, size: 16, dur: 8500, delay: 3600, spin: 16  },
  ],

  /** Explore — discovery & curiosity */
  explore: [
    { emoji: "🔍", x: 0.07, size: 18, dur: 8000, delay: 0,    spin: 10  },
    { emoji: "🌍", x: 0.22, size: 20, dur: 9000, delay: 700,  spin: -8  },
    { emoji: "✨", x: 0.40, size: 22, dur: 7000, delay: 1500, spin: 20  },
    { emoji: "🌟", x: 0.58, size: 18, dur: 8500, delay: 300,  spin: -15 },
    { emoji: "💫", x: 0.76, size: 20, dur: 7500, delay: 2200, spin: 12  },
    { emoji: "🎨", x: 0.90, size: 18, dur: 9500, delay: 1100, spin: -6  },
    { emoji: "🎭", x: 0.14, size: 16, dur: 8200, delay: 2900, spin: 28  },
    { emoji: "🌈", x: 0.50, size: 20, dur: 7000, delay: 450,  spin: -22 },
    { emoji: "🎯", x: 0.68, size: 18, dur: 9200, delay: 3500, spin: 16  },
    { emoji: "🔎", x: 0.32, size: 16, dur: 8800, delay: 1700, spin: 20  },
    { emoji: "🌐", x: 0.84, size: 20, dur: 7800, delay: 4200, spin: -14 },
    { emoji: "🎪", x: 0.05, size: 18, dur: 8500, delay: 3600, spin: 12  },
  ],

  /** Communities — togetherness */
  communities: [
    { emoji: "🤝", x: 0.07, size: 20, dur: 8000, delay: 0,    spin: 10  },
    { emoji: "👥", x: 0.22, size: 18, dur: 9000, delay: 700,  spin: -8  },
    { emoji: "🌍", x: 0.40, size: 22, dur: 7000, delay: 1500, spin: 18  },
    { emoji: "💪", x: 0.58, size: 18, dur: 8500, delay: 300,  spin: -12 },
    { emoji: "🤗", x: 0.76, size: 20, dur: 7500, delay: 2200, spin: 10  },
    { emoji: "🎊", x: 0.90, size: 18, dur: 9500, delay: 1100, spin: -6  },
    { emoji: "🌟", x: 0.14, size: 20, dur: 8200, delay: 2900, spin: 22  },
    { emoji: "❤️", x: 0.50, size: 16, dur: 7000, delay: 450,  spin: -18 },
    { emoji: "🎉", x: 0.68, size: 22, dur: 9200, delay: 3500, spin: 14  },
    { emoji: "🏠", x: 0.32, size: 18, dur: 8800, delay: 1700, spin: 20  },
    { emoji: "💞", x: 0.84, size: 16, dur: 7800, delay: 4200, spin: -22 },
    { emoji: "🌺", x: 0.05, size: 20, dur: 8500, delay: 3600, spin: 12  },
  ],

  /** Notifications — alerts & engagement */
  notifications: [
    { emoji: "🔔", x: 0.07, size: 20, dur: 8000, delay: 0,    spin: 8   },
    { emoji: "❤️", x: 0.22, size: 18, dur: 9000, delay: 700,  spin: -10 },
    { emoji: "💬", x: 0.40, size: 22, dur: 7000, delay: 1500, spin: 18  },
    { emoji: "👏", x: 0.58, size: 18, dur: 8500, delay: 300,  spin: -12 },
    { emoji: "🔥", x: 0.76, size: 16, dur: 7500, delay: 2200, spin: 10  },
    { emoji: "✨", x: 0.90, size: 20, dur: 9500, delay: 1100, spin: -6  },
    { emoji: "🎉", x: 0.14, size: 18, dur: 8200, delay: 2900, spin: 22  },
    { emoji: "💌", x: 0.50, size: 16, dur: 7000, delay: 450,  spin: -20 },
    { emoji: "🌟", x: 0.68, size: 22, dur: 9200, delay: 3500, spin: 8   },
    { emoji: "😊", x: 0.32, size: 18, dur: 8800, delay: 1700, spin: -14 },
    { emoji: "💕", x: 0.84, size: 16, dur: 7800, delay: 4000, spin: 16  },
    { emoji: "🎊", x: 0.05, size: 20, dur: 8500, delay: 3600, spin: -10 },
  ],

  /** Wallet — coins & rewards */
  wallet: [
    { emoji: "💰", x: 0.07, size: 20, dur: 8000, delay: 0,    spin: 10  },
    { emoji: "🪙", x: 0.22, size: 18, dur: 9000, delay: 700,  spin: -8  },
    { emoji: "💎", x: 0.40, size: 22, dur: 7000, delay: 1500, spin: 18  },
    { emoji: "🤑", x: 0.58, size: 18, dur: 8500, delay: 300,  spin: -12 },
    { emoji: "⭐", x: 0.76, size: 20, dur: 7500, delay: 2200, spin: 10  },
    { emoji: "🏆", x: 0.90, size: 18, dur: 9500, delay: 1100, spin: -6  },
    { emoji: "✨", x: 0.14, size: 20, dur: 8200, delay: 2900, spin: 22  },
    { emoji: "💫", x: 0.50, size: 16, dur: 7000, delay: 450,  spin: -18 },
    { emoji: "🎯", x: 0.68, size: 22, dur: 9200, delay: 3500, spin: 14  },
    { emoji: "💸", x: 0.32, size: 18, dur: 8800, delay: 1700, spin: 20  },
    { emoji: "🤩", x: 0.84, size: 16, dur: 7800, delay: 4200, spin: -22 },
    { emoji: "🌟", x: 0.05, size: 20, dur: 8500, delay: 3600, spin: 12  },
  ],

  /** Creator Dashboard — success & growth */
  creator: [
    { emoji: "🎬", x: 0.07, size: 20, dur: 8000, delay: 0,    spin: 10  },
    { emoji: "💰", x: 0.22, size: 18, dur: 9000, delay: 700,  spin: -8  },
    { emoji: "📊", x: 0.40, size: 22, dur: 7000, delay: 1500, spin: 18  },
    { emoji: "🔥", x: 0.58, size: 18, dur: 8500, delay: 300,  spin: -12 },
    { emoji: "⭐", x: 0.76, size: 20, dur: 7500, delay: 2200, spin: 10  },
    { emoji: "🏆", x: 0.90, size: 18, dur: 9500, delay: 1100, spin: -6  },
    { emoji: "💎", x: 0.14, size: 20, dur: 8200, delay: 2900, spin: 22  },
    { emoji: "🚀", x: 0.50, size: 18, dur: 7000, delay: 450,  spin: -18 },
    { emoji: "🎯", x: 0.68, size: 22, dur: 9200, delay: 3500, spin: 14  },
    { emoji: "👑", x: 0.32, size: 18, dur: 8800, delay: 1700, spin: 20  },
    { emoji: "📈", x: 0.84, size: 16, dur: 7800, delay: 4200, spin: -22 },
    { emoji: "🌟", x: 0.05, size: 20, dur: 8500, delay: 3600, spin: 12  },
  ],

  /** Settings — subtle utility */
  settings: [
    { emoji: "⚙️", x: 0.08, size: 16, dur: 9000, delay: 0,    spin: 8   },
    { emoji: "🔧", x: 0.24, size: 14, dur: 10000,delay: 800,  spin: -6  },
    { emoji: "💡", x: 0.42, size: 18, dur: 8500, delay: 1600, spin: 14  },
    { emoji: "✨", x: 0.60, size: 14, dur: 9500, delay: 400,  spin: -10 },
    { emoji: "🌟", x: 0.78, size: 16, dur: 8000, delay: 2200, spin: 8   },
    { emoji: "🔑", x: 0.92, size: 14, dur: 10000,delay: 1200, spin: -6  },
    { emoji: "🛡️", x: 0.14, size: 16, dur: 9200, delay: 3000, spin: 18  },
    { emoji: "🎨", x: 0.50, size: 14, dur: 8800, delay: 500,  spin: -16 },
    { emoji: "💫", x: 0.68, size: 16, dur: 9800, delay: 3500, spin: 8   },
    { emoji: "🌙", x: 0.32, size: 18, dur: 8500, delay: 2600, spin: -12 },
  ],
};

/* ── Individual floating emoji ─────────────────────────────────────────────── */
function FloatingEmoji({
  item, screenWidth, screenHeight,
}: {
  item: EmojiItem; screenWidth: number; screenHeight: number;
}) {
  const anim   = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: item.dur,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(wiggle, { toValue: 1,  duration: item.dur * 0.4, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: -1, duration: item.dur * 0.4, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: 0,  duration: item.dur * 0.2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, item.delay);
    return () => clearTimeout(t);
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight + item.size, -item.size * 2],
  });
  const translateX = wiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-14, 0, 14],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.07, 0.88, 1],
    outputRange: [0, 0.55, 0.55, 0],
  });
  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${item.spin}deg`],
  });
  const scale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 1.1, 0.7],
  });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: item.x * screenWidth,
        fontSize: item.size,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }, { scale }],
      } as object}
      selectable={false}
    >
      {item.emoji}
    </Animated.Text>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────────*/
export type EmojiPreset = keyof typeof EMOJI_PRESETS;

interface FloatingEmojiBgProps {
  /** Name of the preset from EMOJI_PRESETS, or pass custom items */
  preset?: EmojiPreset;
  items?: EmojiItem[];
}

export function FloatingEmojiBg({ preset, items }: FloatingEmojiBgProps) {
  const { width, height } = useWindowDimensions();
  const list = items ?? (preset ? EMOJI_PRESETS[preset] ?? [] : []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {list.map((item, i) => (
        <FloatingEmoji key={i} item={item} screenWidth={width} screenHeight={height} />
      ))}
    </View>
  );
}

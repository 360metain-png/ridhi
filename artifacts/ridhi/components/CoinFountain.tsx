import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

const COIN_IMAGE = require("@/assets/images/ridhi_coin.png");

export interface CoinToastData {
  id: string;
  type: "credit" | "debit";
  amount: number;
  label?: string;
  sublabel?: string;
  large?: boolean;
  bottom?: number;
}

// ── Single floating coin particle ──────────────────────────────────────────────
function CoinParticle({ offsetX, delay, large }: { offsetX: number; delay: number; large: boolean }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(y, {
          toValue: -(80 + Math.random() * 70),
          duration: 900 + Math.random() * 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.timing(spin, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View
      style={[
        styles.particle,
        large ? styles.particleLg : styles.particleSm,
        { transform: [{ translateX: offsetX }, { translateY: y }, { rotate }], opacity },
      ]}
    >
      <Image source={COIN_IMAGE} style={{ width: large ? 20 : 16, height: large ? 20 : 16 }} resizeMode="contain" />
    </Animated.View>
  );
}

// ── Sparkle dot ────────────────────────────────────────────────────────────────
function Sparkle({ offsetX, offsetY, delay, color }: { offsetX: number; offsetY: number; delay: number; color: string }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 5 }),
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { backgroundColor: color, transform: [{ translateX: offsetX }, { translateY: offsetY }, { scale }], opacity },
      ]}
    />
  );
}

// ── Pulse ring ─────────────────────────────────────────────────────────────────
function PulseRing({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.8, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
      { iterations: 3 }
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.pulseRing, { borderColor: color, transform: [{ scale }], opacity }]}
      pointerEvents="none"
    />
  );
}

// ── Individual toast ───────────────────────────────────────────────────────────
function CoinToastItem({ data, onDone }: { data: CoinToastData; onDone: () => void }) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  const isCredit = data.type === "credit";
  const accentColor = isCredit ? "#22C55E" : "#F43F5E";
  const bgColor = isCredit ? "rgba(34,197,94,0.18)" : "rgba(244,63,94,0.18)";
  const borderColor = isCredit ? "rgba(34,197,94,0.45)" : "rgba(244,63,94,0.45)";
  const sparkleColors = isCredit
    ? ["#22C55E", "#FFB800", "#A855F7", "#22C55E"]
    : ["#F43F5E", "#E91E8C", "#FFB800", "#F43F5E"];
  const particleCount = data.large ? 10 : 5;
  const sparklePositions = [
    { x: -60, y: -30 }, { x: 60, y: -30 }, { x: -40, y: 20 },
    { x: 40, y: 20 }, { x: 0, y: -50 }, { x: -70, y: 0 }, { x: 70, y: 0 },
  ];

  useEffect(() => {
    // Entrance burst
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 90, friction: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.back(2)) }),
    ]).start();

    // Float up + fade out after hold
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -90, duration: 700, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
        Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.8, duration: 700, useNativeDriver: true }),
      ]).start(() => onDone());
    }, 1600);

    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View
      style={[styles.toastInner, { transform: [{ translateY }, { scale }], opacity }]}
      pointerEvents="none"
    >
      <PulseRing color={accentColor} />

      {/* Sparkles */}
      {sparklePositions.slice(0, data.large ? 7 : 4).map((sp, i) => (
        <Sparkle
          key={i}
          offsetX={sp.x}
          offsetY={sp.y}
          delay={i * 40}
          color={sparkleColors[i % sparkleColors.length]}
        />
      ))}

      {/* Floating coin particles */}
      {Array.from({ length: particleCount }, (_, i) => (
        <CoinParticle
          key={i}
          offsetX={(i - (particleCount - 1) / 2) * 24 + (Math.random() - 0.5) * 14}
          delay={i * 50}
          large={data.large ?? false}
        />
      ))}

      {/* Main pill */}
      <View style={[styles.pill, { backgroundColor: bgColor, borderColor }]}>
        <Image source={COIN_IMAGE} style={styles.pillCoin} resizeMode="contain" />
        <View style={styles.pillTextCol}>
          <Text style={[styles.pillAmount, { color: accentColor }]}>
            {isCredit ? "+" : "−"}{data.amount.toLocaleString()}
          </Text>
          {(data.label || data.sublabel) && (
            <Text style={[styles.pillLabel, { color: accentColor + "BB" }]}>
              {data.label}{data.sublabel ? ` · ${data.sublabel}` : ""}
            </Text>
          )}
        </View>
        <Text style={[styles.pillArrow, { color: accentColor }]}>
          {isCredit ? "▲" : "▼"}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── Overlay — render all active toasts ─────────────────────────────────────────
export function CoinFountainOverlay({
  toasts,
  onRemove,
}: {
  toasts: CoinToastData[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {toasts.map((toast) => (
        <View
          key={toast.id}
          style={[styles.toastWrapper, { bottom: toast.bottom ?? 180 }]}
        >
          <CoinToastItem data={toast} onDone={() => onRemove(toast.id)} />
        </View>
      ))}
    </View>
  );
}

// ── Hook to manage the toast queue ────────────────────────────────────────────
let _counter = 0;

export function useCoinToasts() {
  const [toasts, setToasts] = useState<CoinToastData[]>([]);

  const fire = useCallback(
    (opts: Omit<CoinToastData, "id">) => {
      const id = `ct_${Date.now()}_${++_counter}`;
      setToasts((prev) => [...prev.slice(-3), { ...opts, id }]);
    },
    []
  );

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, fire, remove };
}

// ── Animated rolling number (balance counter) ─────────────────────────────────
export function AnimatedCoinBalance({ value, style }: { value: number; style?: object }) {
  const anim = useRef(new Animated.Value(value)).current;
  const displayed = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = displayed.current;
    const end = value;
    if (start === end) return;

    const duration = Math.min(1200, Math.abs(end - start) * 2 + 300);
    anim.setValue(start);
    Animated.timing(anim, { toValue: end, duration, useNativeDriver: false, easing: Easing.out(Easing.cubic) }).start();

    const id = anim.addListener(({ value: v }) => {
      const rounded = Math.round(v);
      if (rounded !== displayed.current) {
        displayed.current = rounded;
        setDisplay(rounded);
      }
    });
    displayed.current = start;

    return () => anim.removeListener(id);
  }, [value]);

  return <Text style={style}>{display.toLocaleString()}</Text>;
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toastInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  sparkle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  particle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  particleSm: { width: 20, height: 20 },
  particleLg: { width: 26, height: 26 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 36,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  pillCoin: { width: 24, height: 24 },
  pillTextCol: { alignItems: "flex-start" },
  pillAmount: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  pillLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 1 },
  pillArrow: { fontSize: 14, fontFamily: "Inter_700Bold", marginLeft: 2 },
});

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

const COIN_IMAGE = require("../assets/images/ridhi_coin.png");

export interface CoinToastData {
  id: string;
  type: "credit" | "debit";
  amount: number;
  label?: string;
  sublabel?: string;
  large?: boolean;
  bottom?: number;
}

// ── 3D flipping coin particle ──────────────────────────────────────────────────
function CoinParticle({
  offsetX,
  delay,
  large,
  isCredit,
}: {
  offsetX: number;
  delay: number;
  large: boolean;
  isCredit: boolean;
}) {
  const y = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const entryScale = useRef(new Animated.Value(0)).current;
  const flipX = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      const direction = isCredit ? -1 : 1;
      const driftX = (Math.random() - 0.5) * 70;
      const travelY = direction * (85 + Math.random() * 80);
      const dur = 750 + Math.random() * 350;

      Animated.spring(entryScale, { toValue: 1, useNativeDriver: true, tension: 260, friction: 7 }).start();
      Animated.parallel([
        Animated.timing(y, { toValue: travelY, duration: dur, easing: isCredit ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(x, { toValue: driftX, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.delay(dur * 0.55),
          Animated.timing(opacity, { toValue: 0, duration: dur * 0.45, useNativeDriver: true }),
        ]),
        // 3D coin flip via scaleX ping-pong
        Animated.loop(
          Animated.sequence([
            Animated.timing(flipX, { toValue: -1, duration: 220, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            Animated.timing(flipX, { toValue: 1, duration: 220, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          ]),
          { iterations: 10 }
        ),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const size = large ? 20 : 15;
  return (
    <Animated.View
      style={[
        styles.particle,
        {
          opacity,
          transform: [
            { translateX: offsetX },
            { translateY: y },
            { translateX: x },
            { scaleX: flipX },
            { scale: entryScale },
          ],
        },
      ]}
    >
      <Image source={COIN_IMAGE} style={{ width: size, height: size }} resizeMode="contain" />
    </Animated.View>
  );
}

// ── Starburst sparkle — shoots out at a given angle ────────────────────────────
function StarSparkle({
  angle,
  distance,
  delay,
  color,
  size,
}: {
  angle: number;
  distance: number;
  delay: number;
  color: string;
  size: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * distance;
  const ty = Math.sin(rad) * distance;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(progress, { toValue: 1, duration: 480, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 70, useNativeDriver: true }),
          Animated.delay(200),
          Animated.timing(opacity, { toValue: 0, duration: 210, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 6 }),
          Animated.timing(scale, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, tx] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, ty] });

  return (
    <Animated.View
      style={[
        styles.sparkle,
        {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        },
      ]}
    />
  );
}

// ── Expanding burst ring ───────────────────────────────────────────────────────
function BurstRing({ delay, color, maxScale }: { delay: number; color: string; maxScale: number }) {
  const scale = useRef(new Animated.Value(0.15)).current;
  const opacity = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scale, { toValue: maxScale, duration: 580, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(opacity, { toValue: 0, duration: 580, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View
      style={[styles.burstRing, { borderColor: color, transform: [{ scale }], opacity, pointerEvents: "none" }]}
    />
  );
}

// ── Floating "CREDITED" / "DEBITED" label ──────────────────────────────────────
function FloatLabel({ isCredit }: { isCredit: boolean }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 130, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
      Animated.delay(750),
      Animated.parallel([
        Animated.timing(y, { toValue: isCredit ? -28 : 28, duration: 480, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
        Animated.timing(opacity, { toValue: 0, duration: 480, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.floatLabel,
        {
          color: isCredit ? "#22C55E" : "#F43F5E",
          transform: [{ translateY: y }, { scale }],
          opacity,
          ...(isCredit ? { top: -42 } : { bottom: -42 }),
        },
      ]}
    >
      {isCredit ? "💰 CREDITED" : "💸 DEBITED"}
    </Animated.Text>
  );
}

// ── Individual toast ───────────────────────────────────────────────────────────
function CoinToastItem({ data, onDone }: { data: CoinToastData; onDone: () => void }) {
  const translateY = useRef(new Animated.Value(data.type === "credit" ? 55 : -55)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.25)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const amountScale = useRef(new Animated.Value(1)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const isCredit = data.type === "credit";
  const accentColor = isCredit ? "#22C55E" : "#F43F5E";
  const bgColor = isCredit ? "rgba(34,197,94,0.14)" : "rgba(244,63,94,0.14)";
  const borderColor = isCredit ? "rgba(34,197,94,0.55)" : "rgba(244,63,94,0.55)";
  const glowColor = isCredit ? "rgba(34,197,94,0.35)" : "rgba(244,63,94,0.35)";

  const particleCount = data.large ? 12 : 7;
  const sparkleCount = data.large ? 12 : 8;
  const sparkleAngles = Array.from({ length: 12 }, (_, i) => i * 30);
  const sparkleColors = isCredit
    ? ["#22C55E", "#FFB800", "#A855F7", "#00D4FF", "#4ADE80", "#FFD700"]
    : ["#F43F5E", "#E91E8C", "#FF6B35", "#FF3CAC", "#FB923C", "#F472B6"];

  useEffect(() => {
    // ENTRANCE
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 110, friction: 5 }),
      Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 90, friction: 8 }),
      Animated.sequence([
        Animated.parallel([
          Animated.spring(glowScale, { toValue: 1.4, useNativeDriver: true, tension: 80, friction: 6 }),
          Animated.timing(glowOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, { toValue: 1.1, duration: 400, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.45, duration: 400, useNativeDriver: true }),
        ]),
      ]),
    ]).start(() => {
      // Wiggle shake after landing
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 5, duration: 55, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -5, duration: 55, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 4, duration: 55, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -4, duration: 55, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 2, duration: 55, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();

      // Amount number pop
      Animated.sequence([
        Animated.spring(amountScale, { toValue: 1.3, useNativeDriver: true, tension: 220, friction: 5 }),
        Animated.spring(amountScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 9 }),
      ]).start();
    });

    // EXIT
    const hold = data.large ? 2300 : 1900;
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: isCredit ? -110 : 90,
          duration: 550,
          useNativeDriver: true,
          easing: isCredit ? Easing.in(Easing.cubic) : Easing.in(Easing.back(1.3)),
        }),
        Animated.timing(opacity, { toValue: 0, duration: 550, useNativeDriver: true }),
        Animated.timing(scale, { toValue: isCredit ? 0.75 : 0.55, duration: 550, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onDone());
    }, hold);

    return () => clearTimeout(t);
  }, []);

  const rotate = wiggle.interpolate({ inputRange: [-10, 10], outputRange: ["-10deg", "10deg"] });

  return (
    <Animated.View
      style={[styles.toastInner, { transform: [{ translateY }, { scale }], opacity, pointerEvents: "none" }]}
    >
      {/* Glow halo */}
      <Animated.View
        style={[
          styles.glow,
          { backgroundColor: glowColor, transform: [{ scale: glowScale }], opacity: glowOpacity },
        ]}
      />

      {/* Triple burst rings */}
      <BurstRing delay={0}   color={accentColor}        maxScale={2.4} />
      <BurstRing delay={140} color={accentColor}        maxScale={1.9} />
      <BurstRing delay={300} color={accentColor + "60"} maxScale={3.2} />

      {/* Starburst sparkles */}
      {sparkleAngles.slice(0, sparkleCount).map((angle, i) => (
        <StarSparkle
          key={i}
          angle={angle}
          distance={52 + (i % 4) * 16}
          delay={i * 22}
          color={sparkleColors[i % sparkleColors.length]}
          size={data.large ? 11 : 7}
        />
      ))}

      {/* Directional coin particles */}
      {Array.from({ length: particleCount }, (_, i) => (
        <CoinParticle
          key={i}
          offsetX={(i - (particleCount - 1) / 2) * 19 + (Math.random() - 0.5) * 8}
          delay={i * 40}
          large={data.large ?? false}
          isCredit={isCredit}
        />
      ))}

      {/* Float label */}
      <FloatLabel isCredit={isCredit} />

      {/* Main pill */}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: bgColor, borderColor },
          { transform: [{ rotate }] },
        ]}
      >
        <Image source={COIN_IMAGE} style={styles.pillCoin} resizeMode="contain" />
        <View style={styles.pillTextCol}>
          <Animated.Text
            style={[
              styles.pillAmount,
              { color: accentColor, transform: [{ scale: amountScale }] },
            ]}
          >
            {isCredit ? "+" : "−"}{data.amount.toLocaleString()}
          </Animated.Text>
          {(data.label || data.sublabel) && (
            <Text style={[styles.pillLabel, { color: accentColor + "CC" }]}>
              {data.label}{data.sublabel ? ` · ${data.sublabel}` : ""}
            </Text>
          )}
        </View>
        <Text style={[styles.pillArrow, { color: accentColor }]}>
          {isCredit ? "▲" : "▼"}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── Overlay ────────────────────────────────────────────────────────────────────
export function CoinFountainOverlay({
  toasts,
  onRemove,
}: {
  toasts: CoinToastData[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none" }]}>
      {toasts.map((toast) => (
        <View key={toast.id} style={[styles.toastWrapper, { bottom: toast.bottom ?? 180 }]}>
          <CoinToastItem data={toast} onDone={() => onRemove(toast.id)} />
        </View>
      ))}
    </View>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
let _counter = 0;

export function useCoinToasts() {
  const [toasts, setToasts] = useState<CoinToastData[]>([]);

  const fire = useCallback((opts: Omit<CoinToastData, "id">) => {
    const id = `ct_${Date.now()}_${++_counter}`;
    setToasts((prev) => [...prev.slice(-3), { ...opts, id }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, fire, remove };
}

// ── Animated rolling balance ───────────────────────────────────────────────────
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
    Animated.timing(anim, {
      toValue: end,
      duration,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();

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

  // Glow halo
  glow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
  },

  // Burst rings
  burstRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
  },

  // Sparkles
  sparkle: {
    position: "absolute",
  },

  // Coin particles
  particle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  // Float label
  floatLabel: {
    position: "absolute",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },

  // Main pill
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 40,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
  },
  pillCoin: { width: 26, height: 26 },
  pillTextCol: { alignItems: "flex-start" },
  pillAmount: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  pillLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 1,
  },
  pillArrow: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginLeft: 2,
  },
});

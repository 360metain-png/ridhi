import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const LOGO      = require("../assets/images/ridhi_logo_new.png");
const PRIMARY   = "#E91E8C";
const SECONDARY = "#7B2FBE";
const BG        = "#04040A";
const LOGO_SIZE = Math.min(width * 0.34, 140);
const RING1_R   = LOGO_SIZE * 0.75;   // inner orbit radius
const RING2_R   = LOGO_SIZE * 1.05;   // outer orbit radius

// ── Pre-computed particle layout (deterministic, avoids re-render jitter) ──
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle  = (i / 18) * Math.PI * 2;
  const spread = 0.32 + (i % 3) * 0.15;
  return {
    startX: Math.cos(angle) * width  * spread,
    startY: Math.sin(angle) * height * spread * 0.55,
    driftY: -(40 + (i % 5) * 22),
    driftX: (i % 2 === 0 ? 1 : -1) * (6 + (i % 4) * 5),
    size:   1.5 + (i % 4) * 0.9,
    dur:    2600 + (i % 6) * 400,
    delay:  i * 80,
    pink:   i % 3 !== 1,
  };
});

// ── Title letters for staggered entrance ──
const LETTERS = ["R", "i", "d", "h", "i"];

function cssShadow(color: string, r: number) {
  if (Platform.OS === "web") return { boxShadow: `0 0 ${r}px ${color}` } as object;
  return { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: r, elevation: r / 2 };
}
function cssTextShadow(color: string, r: number) {
  if (Platform.OS === "web") return { textShadow: `0 0 ${r}px ${color}` } as object;
  return { textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: r };
}

interface Props {
  onAnimationComplete: () => void;
  isReady: boolean;
}

export function SplashAnimation({ onAnimationComplete, isReady }: Props) {
  // ── Safety timeout: always dismiss after 6s regardless of animation ──
  useEffect(() => {
    const t = setTimeout(() => onAnimationComplete(), 6000);
    return () => clearTimeout(t);
  }, []);

  // ── Animation values ──────────────────────────────────────────────────────
  const bgOpacity      = useRef(new Animated.Value(0)).current;
  const blobScale      = useRef(new Animated.Value(0.5)).current;
  const blobOpacity    = useRef(new Animated.Value(0)).current;

  const shockScale     = useRef(new Animated.Value(0.3)).current;
  const shockOpacity   = useRef(new Animated.Value(0)).current;
  const shockScale2    = useRef(new Animated.Value(0.3)).current;
  const shockOpacity2  = useRef(new Animated.Value(0)).current;

  const logoScale      = useRef(new Animated.Value(0)).current;
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const glowOpacity    = useRef(new Animated.Value(0)).current;
  const breathe        = useRef(new Animated.Value(1)).current;

  const ring1Rot       = useRef(new Animated.Value(0)).current;
  const ring2Rot       = useRef(new Animated.Value(0)).current;
  const ringOpacity    = useRef(new Animated.Value(0)).current;

  const letterAnims    = useRef(LETTERS.map(() => ({
    opacity: new Animated.Value(0),
    y:       new Animated.Value(28),
    scale:   new Animated.Value(0.6),
  }))).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY       = useRef(new Animated.Value(14)).current;

  const progressWidth  = useRef(new Animated.Value(0)).current;

  const badgeOpacity   = useRef(new Animated.Value(0)).current;

  const particleAnims  = useRef(
    PARTICLES.map(() => ({
      opacity: new Animated.Value(0),
      y:       new Animated.Value(0),
      x:       new Animated.Value(0),
    }))
  ).current;

  const exitOpacity    = useRef(new Animated.Value(1)).current;
  const exitScale      = useRef(new Animated.Value(1)).current;

  const loopsRef       = useRef<Animated.CompositeAnimation[]>([]);

  // ── Stop all loops ────────────────────────────────────────────────────────
  const stopLoops = useCallback(() => {
    loopsRef.current.forEach((l) => l.stop());
    loopsRef.current = [];
  }, []);

  // ── Start idle loops ──────────────────────────────────────────────────────
  const startLoops = useCallback(() => {
    // Breathe
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.06, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1,    duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    // Ring 1 — clockwise, faster
    const ring1Loop = Animated.loop(
      Animated.timing(ring1Rot, { toValue: 1, duration: 4200, easing: Easing.linear, useNativeDriver: true })
    );

    // Ring 2 — counter-clockwise, slower
    const ring2Loop = Animated.loop(
      Animated.timing(ring2Rot, { toValue: -1, duration: 7000, easing: Easing.linear, useNativeDriver: true })
    );

    // Blob pulse
    const blobPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(blobScale, { toValue: 1.12, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(blobScale, { toValue: 1,    duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    // Particle loops
    const particleLoops = particleAnims.map((anim, i) => {
      const p = PARTICLES[i];
      return Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.parallel([
            Animated.timing(anim.opacity, { toValue: 0.85, duration: 500, useNativeDriver: true }),
            Animated.timing(anim.y,       { toValue: p.driftY, duration: p.dur, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(anim.x,       { toValue: p.driftX, duration: p.dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.timing(anim.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(anim.y, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(anim.x, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
    });

    loopsRef.current = [breatheLoop, ring1Loop, ring2Loop, blobPulse, ...particleLoops];
    loopsRef.current.forEach((l) => l.start());
  }, [breathe, ring1Rot, ring2Rot, blobScale, particleAnims]);

  // ── Entrance sequence ─────────────────────────────────────────────────────
  useEffect(() => {
    Animated.sequence([
      // Background
      Animated.parallel([
        Animated.timing(bgOpacity,   { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(blobOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(blobScale,   { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      ]),

      // Shockwave blast + logo entrance
      Animated.parallel([
        // Wave 1
        Animated.sequence([
          Animated.timing(shockOpacity, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(shockScale,   { toValue: 3.2, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(shockOpacity, { toValue: 0,   duration: 520, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          ]),
        ]),
        // Wave 2 (delayed)
        Animated.sequence([
          Animated.delay(120),
          Animated.timing(shockOpacity2, { toValue: 0.6, duration: 60, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(shockScale2,   { toValue: 2.4, duration: 480, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(shockOpacity2, { toValue: 0,   duration: 480, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          ]),
        ]),
        // Logo
        Animated.sequence([
          Animated.spring(logoScale,   { toValue: 1.18, friction: 4, tension: 120, useNativeDriver: true }),
          Animated.spring(logoScale,   { toValue: 1,    friction: 8, tension: 80,  useNativeDriver: true }),
        ]),
        Animated.timing(logoOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        // Rings fade in
        Animated.timing(ringOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),

      // Title letters staggered
      Animated.stagger(70, LETTERS.map((_, i) =>
        Animated.parallel([
          Animated.spring(letterAnims[i].scale,   { toValue: 1,  friction: 6, tension: 100, useNativeDriver: true }),
          Animated.timing(letterAnims[i].opacity, { toValue: 1,  duration: 200,              useNativeDriver: true }),
          Animated.timing(letterAnims[i].y,       { toValue: 0,  duration: 260, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        ])
      )),

      // Tagline
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(taglineY,       { toValue: 0, duration: 320, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),

      // Progress bar + badge
      Animated.parallel([
        Animated.timing(progressWidth, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(badgeOpacity,  { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => startLoops());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Exit when ready ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;
    stopLoops();
    Animated.parallel([
      Animated.timing(exitOpacity, { toValue: 0, duration: 320, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(exitScale,   { toValue: 1.06, duration: 320, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onAnimationComplete(); });
  }, [isReady, stopLoops, onAnimationComplete]);

  // ── Derived interpolations ────────────────────────────────────────────────
  const ring1Deg = ring1Rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const ring2Deg = ring2Rot.interpolate({ inputRange: [-1, 0], outputRange: ["-360deg", "0deg"] });
  const progressScaleX = progressWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        { opacity: exitOpacity, transform: [{ scale: exitScale }] },
      ]}
    >
      {/* ── Dark background ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <LinearGradient
          colors={[BG, "#07071A", "#0C0416"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ── Ambient blobs ── */}
      <Animated.View
        style={[
          styles.blobTL,
          { opacity: Animated.multiply(blobOpacity, 0.28 as unknown as Animated.Value), transform: [{ scale: blobScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.blobBR,
          { opacity: Animated.multiply(blobOpacity, 0.20 as unknown as Animated.Value), transform: [{ scale: blobScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.blobMid,
          { opacity: Animated.multiply(blobOpacity, 0.12 as unknown as Animated.Value), transform: [{ scale: blobScale }] },
        ]}
      />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.pink ? PRIMARY : SECONDARY,
              left: width / 2 + p.startX - p.size / 2,
              top:  height / 2 + p.startY - p.size / 2,
              opacity: particleAnims[i].opacity,
              transform: [
                { translateX: particleAnims[i].x },
                { translateY: particleAnims[i].y },
              ],
            },
          ]}
        />
      ))}

      {/* ── Centre group ── */}
      <View style={styles.center}>

        {/* Shockwave rings */}
        <Animated.View style={[styles.shockwave, { opacity: shockOpacity, transform: [{ scale: shockScale }] }]} />
        <Animated.View style={[styles.shockwave2, { opacity: shockOpacity2, transform: [{ scale: shockScale2 }] }]} />

        {/* Outer glow halo */}
        <Animated.View
          style={[
            styles.haloOuter,
            { opacity: glowOpacity, transform: [{ scale: Animated.multiply(breathe, 1 as unknown as Animated.Value) }] },
            cssShadow(SECONDARY, 60),
          ]}
        />
        <Animated.View
          style={[
            styles.haloInner,
            { opacity: glowOpacity, transform: [{ scale: breathe }] },
            cssShadow(PRIMARY, 36),
          ]}
        />

        {/* Orbit ring 1 — clockwise (3 dots) */}
        <Animated.View
          style={[styles.orbitWrap, { width: RING1_R * 2, height: RING1_R * 2, opacity: ringOpacity, transform: [{ rotate: ring1Deg }] }]}
        >
          {[0, 120, 240].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <View
                key={i}
                style={[
                  styles.orbitDot,
                  {
                    backgroundColor: i === 0 ? PRIMARY : i === 1 ? SECONDARY : "#FF6B35",
                    width: i === 0 ? 9 : 6,
                    height: i === 0 ? 9 : 6,
                    borderRadius: i === 0 ? 4.5 : 3,
                    left: RING1_R + Math.cos(rad) * RING1_R - (i === 0 ? 4.5 : 3),
                    top:  RING1_R + Math.sin(rad) * RING1_R - (i === 0 ? 4.5 : 3),
                  },
                  cssShadow(i === 0 ? PRIMARY : SECONDARY, 12),
                ]}
              />
            );
          })}
        </Animated.View>

        {/* Orbit ring 2 — counter-clockwise (2 dots + arc) */}
        <Animated.View
          style={[styles.orbitWrap, { width: RING2_R * 2, height: RING2_R * 2, opacity: ringOpacity, transform: [{ rotate: ring2Deg }] }]}
        >
          {/* Arc border (partial circle effect via solid border with low opacity) */}
          <View style={[styles.arcRing, { width: RING2_R * 2, height: RING2_R * 2, borderRadius: RING2_R }]} />
          {[0, 180].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <View
                key={i}
                style={[
                  styles.orbitDot,
                  {
                    backgroundColor: i === 0 ? "#FFB800" : PRIMARY,
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    left: RING2_R + Math.cos(rad) * RING2_R - 3.5,
                    top:  RING2_R + Math.sin(rad) * RING2_R - 3.5,
                  },
                  cssShadow(i === 0 ? "#FFB800" : PRIMARY, 10),
                ]}
              />
            );
          })}
        </Animated.View>

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity:   logoOpacity,
              transform: [{ scale: Animated.multiply(logoScale, breathe) }],
            },
            cssShadow(PRIMARY, 44),
          ]}
        >
          <LinearGradient
            colors={["#16031F", "#0C0218"]}
            style={styles.logoGradBg}
          />
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        {/* Staggered title letters */}
        <View style={styles.titleRow}>
          {LETTERS.map((letter, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.titleLetter,
                {
                  opacity:   letterAnims[i].opacity,
                  transform: [
                    { translateY: letterAnims[i].y },
                    { scale: letterAnims[i].scale },
                  ],
                },
                cssTextShadow(PRIMARY + "BB", 28),
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity:   taglineOpacity,
              transform: [{ translateY: taglineY }],
            },
          ]}
        >
          India's Social Universe
        </Animated.Text>
      </View>

      {/* ── Progress bar ── */}
      <Animated.View style={[styles.progressTrack, { opacity: taglineOpacity }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              transform: [{ scaleX: progressScaleX }],
            },
          ]}
        >
          <LinearGradient
            colors={[SECONDARY, PRIMARY, "#FF6B35"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>

      {/* ── Made in India ── */}
      <Animated.Text style={[styles.badge, { opacity: badgeOpacity }]}>
        🇮🇳  Made in India
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    overflow: "hidden",
  },

  // Ambient blobs
  blobTL: {
    position: "absolute",
    width:  width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    backgroundColor: PRIMARY,
    top:  -width * 0.3,
    left: -width * 0.22,
    ...(Platform.OS === "web"
      ? { boxShadow: `0 0 140px ${PRIMARY}` }
      : { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 140 }),
  },
  blobBR: {
    position: "absolute",
    width:  width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    backgroundColor: SECONDARY,
    bottom: -width * 0.22,
    right:  -width * 0.18,
    ...(Platform.OS === "web"
      ? { boxShadow: `0 0 120px ${SECONDARY}` }
      : { shadowColor: SECONDARY, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 120 }),
  },
  blobMid: {
    position: "absolute",
    width:  width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "#FF6B35",
    top:   height * 0.35,
    left:  width  * 0.55,
    ...(Platform.OS === "web"
      ? { boxShadow: `0 0 80px #FF6B35` }
      : { shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 80 }),
  },

  // Particles
  particle: {
    position: "absolute",
  },

  // Center layout
  center: {
    alignItems: "center",
    gap: 16,
  },

  // Shockwave
  shockwave: {
    position: "absolute",
    width:  LOGO_SIZE + 20,
    height: LOGO_SIZE + 20,
    borderRadius: (LOGO_SIZE + 20) / 2,
    borderWidth: 2,
    borderColor: PRIMARY + "99",
    backgroundColor: "transparent",
  },
  shockwave2: {
    position: "absolute",
    width:  LOGO_SIZE + 20,
    height: LOGO_SIZE + 20,
    borderRadius: (LOGO_SIZE + 20) / 2,
    borderWidth: 1.5,
    borderColor: SECONDARY + "77",
    backgroundColor: "transparent",
  },

  // Halos
  haloOuter: {
    position: "absolute",
    width:  RING2_R * 2 + 30,
    height: RING2_R * 2 + 30,
    borderRadius: RING2_R + 15,
    backgroundColor: SECONDARY + "08",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SECONDARY + "30",
  },
  haloInner: {
    position: "absolute",
    width:  LOGO_SIZE + 28,
    height: LOGO_SIZE + 28,
    borderRadius: (LOGO_SIZE + 28) / 2,
    backgroundColor: PRIMARY + "10",
    borderWidth: 1,
    borderColor: PRIMARY + "40",
  },

  // Orbit rings
  orbitWrap: {
    position: "absolute",
  },
  orbitDot: {
    position: "absolute",
  },
  arcRing: {
    position: "absolute",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "transparent",
  },

  // Logo
  logoWrap: {
    width:        LOGO_SIZE,
    height:       LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow:     "hidden",
    alignItems:   "center",
    justifyContent: "center",
  },
  logoGradBg: {
    ...StyleSheet.absoluteFillObject,
  },
  logo: {
    width:  LOGO_SIZE * 0.88,
    height: LOGO_SIZE * 0.88,
  },

  // Title
  titleRow: {
    flexDirection: "row",
    alignItems:    "flex-end",
    gap: 1,
  },
  titleLetter: {
    fontSize:       52,
    color:          "#FFFFFF",
    fontWeight:     "800",
    letterSpacing:  -0.5,
    lineHeight:     58,
  },

  // Tagline
  tagline: {
    fontSize:      12,
    color:         "rgba(255,255,255,0.38)",
    letterSpacing: 3.2,
    textTransform: "uppercase",
    fontWeight:    "500",
    marginTop:     -4,
  },

  // Progress bar
  progressTrack: {
    position:        "absolute",
    bottom:          height * 0.13,
    width:           width * 0.52,
    height:          2.5,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius:    2,
    overflow:        "hidden",
  },
  progressFill: {
    height:           "100%",
    width:            "100%",
    transformOrigin:  "left center",
    borderRadius:     2,
    overflow:         "hidden",
  },

  // Badge
  badge: {
    position:      "absolute",
    bottom:        height * 0.06,
    fontSize:      12,
    color:         "rgba(255,255,255,0.20)",
    letterSpacing: 0.5,
  },
});

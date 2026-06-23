// InfasCareSplash.tsx
// Detecta o tema do sistema automaticamente:
//   → Modo Claro  = versão branca (fundo transiciona de roxo escuro → branco)
//   → Modo Escuro = versão roxa   (fundo roxo escuro fixo)
//
// Paleta: #6A5AE0 | #A78BFA | #4A90E2 | #FFFFFF | #F2F3F7

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  withSpring,
  Easing,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import Svg, {
  Path,
  Polyline,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

// ─── Paleta ───────────────────────────────────────────────────────────────────
const P = {
  purple:  '#6A5AE0',
  lilac:   '#A78BFA',
  blue:    '#4A90E2',
  white:   '#FFFFFF',
  bgLight: '#F2F3F7',
  bgDark:  '#0D0B1E',
};

// Cores que mudam dependendo do tema final (quando o splash termina)
const THEME = {
  light: {
    // Versão branca: textos ficam escuros no final
    titleColor:   '#1a1a2e',
    subColor:     '#8B8BA7',
    dotInactive:  '#E4E4EF',
    dotActive:    P.purple,
    barFill:      P.purple,
    barTrack:     'rgba(200,200,220,0.5)',
    statusBar:    'light-content' as const, // começa claro (fundo roxo)
    // Interpolação do fundo: roxo → branco
    bgStart: '#0D0B1E',
    bgEnd:   '#FFFFFF',
    // Flag para animar a cor do texto
    animateText: true,
  },
  dark: {
    // Versão roxa: textos sempre claros
    titleColor:   '#FFFFFF',
    subColor:     'rgba(200,185,255,0.75)',
    dotInactive:  'rgba(255,255,255,0.2)',
    dotActive:    P.lilac,
    barFill:      P.lilac,
    barTrack:     'rgba(255,255,255,0.12)',
    statusBar:    'light-content' as const,
    bgStart: '#0D0B1E',
    bgEnd:   '#0D0B1E', // mesmo valor = sem transição = fixo
    animateText: false,
  },
};

// ─── Ícones SVG ───────────────────────────────────────────────────────────────
function HeartIcon({ size }: { size: number }) {
  return (
    <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="#fff">
      <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
    </Svg>
  );
}
function ShieldIcon({ size }: { size: number }) {
  return (
    <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="#fff">
      <Path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" />
    </Svg>
  );
}
function StarIcon({ size }: { size: number }) {
  return (
    <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="#fff">
      <Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Svg>
  );
}
function CheckIcon({ size }: { size: number }) {
  return (
    <Svg
      width={size * 0.55}
      height={size * 0.55}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Polyline points="20,6 9,17 4,12" />
    </Svg>
  );
}

// ─── HexShield SVG ────────────────────────────────────────────────────────────
function HexShield() {
  return (
    <Svg width={210} height={210} viewBox="0 0 100 115">
      <Defs>
        <LinearGradient id="sg" x1="5" y1="3" x2="95" y2="112" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#A78BFA" stopOpacity={0.7} />
          <Stop offset="100%" stopColor="#4A90E2" stopOpacity={0.4} />
        </LinearGradient>
        <LinearGradient id="sf" x1="5" y1="3" x2="95" y2="112" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#6A5AE0" stopOpacity={0.15} />
          <Stop offset="100%" stopColor="#4A90E2" stopOpacity={0.05} />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 3 L95 27 L95 88 L50 112 L5 88 L5 27 Z"
        stroke="url(#sg)"
        strokeWidth={2}
        fill="url(#sf)"
      />
    </Svg>
  );
}

// ─── SpinRing ─────────────────────────────────────────────────────────────────
const SPIN_SIZE = 150;

function SpinRing() {
  const rotate = useSharedValue(0);
  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 2800, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
  return <Animated.View style={[styles.spinRing, style]} />;
}

// ─── PulseRing ────────────────────────────────────────────────────────────────
function PulseRing({ delay: d, color }: { delay: number; color: string }) {
  const scale = useSharedValue(0);
  const op    = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1.8, { duration: 1300, easing: Easing.out(Easing.cubic) }),
        ),
        3,
        false,
      ),
    );
    op.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 80 }),
          withTiming(0, { duration: 1220, easing: Easing.out(Easing.cubic) }),
        ),
        3,
        false,
      ),
    );
  }, []);
  const sz    = Math.min(W, H) * 0.45;
  const style = useAnimatedStyle(() => ({
    width:        sz,
    height:       sz,
    borderRadius: sz / 2,
    borderWidth:  2,
    borderColor:  color,
    opacity:      op.value,
    transform:    [{ scale: scale.value }],
  }));
  return <Animated.View style={[styles.pulseRing, style]} />;
}

// ─── Orbiter ──────────────────────────────────────────────────────────────────
const ORBITERS = [
  { startAngle: 0,   bg: P.purple,  Icon: HeartIcon  },
  { startAngle: 90,  bg: P.lilac,   Icon: ShieldIcon },
  { startAngle: 180, bg: P.blue,    Icon: StarIcon   },
  { startAngle: 270, bg: '#7B6CE8', Icon: CheckIcon  },
];
const ORBIT_RX = W * 0.34;
const ORBIT_RY = W * 0.105;
const ORB_SIZE = 40;
const SEAT_CX  = W / 2;
const SEAT_CY  = H / 2 - H * 0.075;

function Orbiter({
  cfg,
  visible,
  angle,
}: {
  cfg: (typeof ORBITERS)[0];
  visible: boolean;
  angle: Animated.SharedValue<number>;
}) {
  const op = useSharedValue(0);
  useEffect(() => {
    if (visible) op.value = withSpring(1, { damping: 12, stiffness: 150 });
  }, [visible]);

  const style = useAnimatedStyle(() => {
    const rad   = (angle.value * Math.PI) / 180;
    const x     = Math.cos(rad) * ORBIT_RX;
    const y     = Math.sin(rad) * ORBIT_RY;
    const z     = Math.sin(rad);
    const scale = 0.65 + 0.35 * ((z + 1) / 2);
    return {
      opacity:   (0.6 + 0.4 * ((z + 1) / 2)) * op.value,
      transform: [{ scale }],
      zIndex:    z > 0 ? 8 : 2,
      left:      SEAT_CX + x - ORB_SIZE / 2,
      top:       SEAT_CY + y - ORB_SIZE / 2,
    };
  });
  if (!visible) return null;
  return (
    <Animated.View style={[styles.orbiter, { backgroundColor: cfg.bg }, style]}>
      <cfg.Icon size={ORB_SIZE} />
    </Animated.View>
  );
}

// ─── ShimmerBar ───────────────────────────────────────────────────────────────
function ShimmerBar({ visible, fillColor }: { visible: boolean; fillColor: string }) {
  const w = useSharedValue(0);
  const s = useSharedValue(-1);
  useEffect(() => {
    if (!visible) return;
    w.value = withTiming(1, { duration: 2400, easing: Easing.bezier(0.4, 0, 0.2, 1) });
    s.value = withRepeat(
      withTiming(2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [visible]);

  const fillStyle = useAnimatedStyle(() => ({
    width:           `${w.value * 100}%` as any,
    backgroundColor: fillColor,
  }));
  const shimmerStyle = useAnimatedStyle(() => ({
    position:        'absolute',
    top:             0,
    bottom:          0,
    width:           60,
    left:            `${(s.value / 2) * 100}%` as any,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius:    3,
  }));
  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFillBase, fillStyle]}>
        <Animated.View style={shimmerStyle} />
      </Animated.View>
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
const SEAT_SIZE = 170;
const HEX_SIZE  = 210;

export default function InfasCareSplash({ onFinish }: { onFinish?: () => void }) {
  // ── Detecta o esquema de cores do sistema ──────────────────────────────────
  const colorScheme = useColorScheme();           // 'light' | 'dark' | null
  const isDark      = colorScheme === 'dark';
  const theme       = isDark ? THEME.dark : THEME.light;

  // ── Estado ─────────────────────────────────────────────────────────────────
  const [activeDot,  setActiveDot]  = useState(0);
  const [orbVisible, setOrbVisible] = useState([false, false, false, false]);
  const [showBar,    setShowBar]    = useState(false);

  const angles      = ORBITERS.map((o) => useSharedValue(o.startAngle));
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // ── Shared values ──────────────────────────────────────────────────────────
  const bgProgress = useSharedValue(0);   // 0 → 1: controla a cor de fundo (só usado no modo claro)
  const seatOp     = useSharedValue(0);
  const seatSc     = useSharedValue(0.5);
  const hexOp      = useSharedValue(0);
  const spinOp     = useSharedValue(0);
  const textOp     = useSharedValue(0);
  const textY      = useSharedValue(16);
  const splashOp   = useSharedValue(1);
  const splashSc   = useSharedValue(1);

  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  useEffect(() => {
    // Animação de fundo: no modo escuro bgEnd == bgStart, então a cor não muda
    bgProgress.value = withDelay(
      300,
      withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
    );

    async function sequence() {
      await wait(300);
      seatOp.value = withSpring(1, { damping: 14, stiffness: 120 });
      seatSc.value = withSpring(1, { damping: 6,  stiffness: 90 });
      hexOp.value  = withTiming(1, { duration: 800 });
      spinOp.value = withDelay(300, withTiming(1, { duration: 500 }));

      await wait(580);
      textOp.value = withTiming(1, { duration: 600 });
      textY.value  = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
      setShowBar(true);

      await wait(480);
      setOrbVisible((v) => { const n = [...v]; n[0] = true; return n; });
      setActiveDot(1);

      intervalRef.current = setInterval(() => {
        angles.forEach((a) => { a.value = (a.value + 0.45) % 360; });
      }, 16);

      await wait(900);
      setOrbVisible((v) => { const n = [...v]; n[1] = true; return n; });
      setActiveDot(2);

      await wait(900);
      setOrbVisible((v) => { const n = [...v]; n[2] = true; return n; });
      setActiveDot(3);

      await wait(700);
      setOrbVisible((v) => { const n = [...v]; n[3] = true; return n; });

      await wait(1200);
      splashOp.value = withTiming(0, { duration: 700 });
      splashSc.value = withTiming(1.04, { duration: 700 }, (done) => {
        if (done) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (onFinish) runOnJS(onFinish)();
        }
      });
    }

    sequence();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // ── Estilos animados ───────────────────────────────────────────────────────

  // Fundo: interpola bgStart → bgEnd
  // No modo escuro bgStart == bgEnd == '#0D0B1E' → cor fixa
  // No modo claro  bgStart == '#0D0B1E', bgEnd == '#FFFFFF' → transição
  const bgStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      [theme.bgStart, theme.bgEnd],
    ),
  }));

  // Cor do título: no modo escuro sempre branco; no modo claro anima para escuro
  const titleStyle = useAnimatedStyle(() => ({
    color: theme.animateText
      ? interpolateColor(bgProgress.value, [0, 0.7], ['#FFFFFF', theme.titleColor])
      : theme.titleColor,
  }));

  // Cor do subtítulo
  const subStyle = useAnimatedStyle(() => ({
    color: theme.animateText
      ? interpolateColor(bgProgress.value, [0, 0.7], ['rgba(255,255,255,0.7)', theme.subColor])
      : theme.subColor,
  }));

  const seatStyle   = useAnimatedStyle(() => ({ opacity: seatOp.value, transform: [{ scale: seatSc.value }] }));
  const hexStyle    = useAnimatedStyle(() => ({ opacity: hexOp.value }));
  const spinStyle   = useAnimatedStyle(() => ({ opacity: spinOp.value }));
  const textStyle   = useAnimatedStyle(() => ({ opacity: textOp.value, transform: [{ translateY: textY.value }] }));
  const splashStyle = useAnimatedStyle(() => ({ opacity: splashOp.value, transform: [{ scale: splashSc.value }] }));

  // Cor de fundo do container (o "app por trás" do splash)
  const rootBg = isDark ? P.bgDark : P.bgLight;

  return (
    <View style={[styles.root, { backgroundColor: rootBg }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={P.bgDark} />

      <Animated.View
        style={[StyleSheet.absoluteFillObject, splashStyle]}
        pointerEvents="none"
      >
        {/* Fundo animado */}
        <Animated.View style={bgStyle} />

        {/* Glow central */}
        <View style={styles.glowCenter} />

        {/* Pulse rings */}
        <PulseRing delay={150} color={P.purple} />
        <PulseRing delay={500} color={P.lilac}  />
        <PulseRing delay={850} color={P.blue}   />

        {/* Cadeirinha + hex shield + spin ring */}
        <View style={styles.seatScene}>
          <Animated.View style={[styles.hexWrap, hexStyle]}>
            <HexShield />
          </Animated.View>
          <Animated.View style={[styles.spinWrap, spinStyle]}>
            <SpinRing />
          </Animated.View>
          <Animated.View style={[styles.seatWrap, seatStyle]}>
            <Image
              source={require('../assets/images/icon_cadeirinhainicio.png')}
              style={styles.seatImg}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Orbiters */}
        {ORBITERS.map((cfg, i) => (
          <Orbiter key={i} cfg={cfg} visible={orbVisible[i]} angle={angles[i]} />
        ))}

        {/* Texto inferior */}
        <Animated.View style={[styles.bottomText, textStyle]}>
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: activeDot === i ? theme.dotActive : theme.dotInactive },
                  activeDot === i && styles.dotActiveShape,
                ]}
              />
            ))}
          </View>

          <Animated.Text style={[styles.title, titleStyle]}>
            Carregando com cuidado...
          </Animated.Text>

          <Animated.Text style={[styles.sub, subStyle]}>
            {'Conectando o que importa,\nprotegendo o que você ama.'}
          </Animated.Text>

          {showBar && (
            <View style={styles.barWrap}>
              <ShimmerBar visible={showBar} fillColor={theme.barFill} />
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  glowCenter: {
    position:        'absolute',
    width:           220,
    height:          220,
    borderRadius:    110,
    backgroundColor: 'rgba(106,90,224,0.2)',
    top:             H / 2 - 110 - H * 0.075,
    left:            W / 2 - 110,
  },

  pulseRing: {
    position: 'absolute',
    left:     W / 2,
    top:      H / 2 - H * 0.075,
  },

  seatScene: {
    position:       'absolute',
    width:          HEX_SIZE,
    height:         HEX_SIZE,
    left:           W / 2 - HEX_SIZE / 2,
    top:            H / 2 - HEX_SIZE / 2 - H * 0.075,
    alignItems:     'center',
    justifyContent: 'center',
  },
  hexWrap:  { position: 'absolute' },
  spinWrap: {
    position:       'absolute',
    width:          SPIN_SIZE,
    height:         SPIN_SIZE,
    alignItems:     'center',
    justifyContent: 'center',
  },
  spinRing: {
    width:            SPIN_SIZE,
    height:           SPIN_SIZE,
    borderRadius:     SPIN_SIZE / 2,
    borderWidth:      3,
    borderColor:      'transparent',
    borderTopColor:   '#A78BFA',
    borderRightColor: '#4A90E2',
  },
  seatWrap: {
    width:          SEAT_SIZE,
    height:         SEAT_SIZE,
    alignItems:     'center',
    justifyContent: 'center',
  },
  seatImg: { width: SEAT_SIZE, height: SEAT_SIZE },

  orbiter: {
    position:      'absolute',
    width:         40,
    height:        40,
    borderRadius:  20,
    alignItems:    'center',
    justifyContent:'center',
    shadowColor:   '#6A5AE0',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius:  8,
    elevation:     8,
  },

  bottomText: {
    position:   'absolute',
    bottom:     H * 0.11,
    left:       0,
    right:      0,
    alignItems: 'center',
    gap:        8,
  },
  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  dot: {
    width:        7,
    height:       7,
    borderRadius: 3.5,
  },
  dotActiveShape: {
    width:        22,
    borderRadius: 4,
  },

  title: { fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  sub:   { fontSize: 12, textAlign: 'center', lineHeight: 20 },

  barWrap: { marginTop: 2 },
  barTrack: {
    width:           180,
    height:          3,
    backgroundColor: 'rgba(200,200,220,0.3)',
    borderRadius:    2,
    overflow:        'hidden',
  },
  barFillBase: {
    height:       '100%',
    borderRadius: 2,
    overflow:     'hidden',
  },
});
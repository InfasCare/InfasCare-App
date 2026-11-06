import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Easing, useColorScheme, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { ChevronLeft, Baby, Thermometer, User, BatteryMedium } from 'lucide-react-native';
import { Colors, Brand } from '@/constants/theme';
import { useI18n } from '@/contexts/I18nContext';
import { useDispositivoPrincipal } from '@/hooks/useDispositivoPrincipal';
import { formatarDuracao } from '@/services/dispositivos';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── Entrada animada (fade + slide-up) ────────────────────────────────────────
function FadeInUp({ delay = 0, style, children }: { delay?: number; style?: any; children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 550, delay,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── Anel de status: rotação lenta + glow "respirando" atrás ──────────────────
function StatusRing({ isDark, title, subtitle }: { isDark: boolean; title: string; subtitle: string }) {
  const spinVal = useRef(new Animated.Value(0)).current;
  const breath = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.85)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleIn, { toValue: 1, useNativeDriver: true, friction: 7, tension: 60 }),
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    const spinLoop = Animated.loop(
      Animated.timing(spinVal, { toValue: 1, duration: 14000, easing: Easing.linear, useNativeDriver: true }),
    );
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    spinLoop.start();
    breathLoop.start();
    return () => { spinLoop.stop(); breathLoop.stop(); };
  }, []);

  const rotate = spinVal.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glowOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.55] });

  const size = 224;
  const stroke = 16;
  const r = (size - stroke) / 2;

  return (
    <Animated.View style={[styles.ringOuterWrap, { opacity: fadeIn, transform: [{ scale: scaleIn }] }]}>
      <Animated.View
        style={[
          styles.ringGlow,
          { width: size + 30, height: size + 30, borderRadius: (size + 30) / 2, opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />

      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={Brand.purple} />
              <Stop offset="1" stopColor={Brand.lilac} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2} cy={size / 2} r={r}
            stroke="url(#ringGrad)" strokeWidth={stroke} fill="none" strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      <View style={[styles.ringInner, { backgroundColor: isDark ? '#1C1835' : '#FFFFFF' }]}>
        <Baby size={38} color={Brand.purple} strokeWidth={1.8} />
        <Text style={[styles.ringTitle, { color: isDark ? '#F0EEFF' : '#1a1a2e' }]} numberOfLines={2}>{title}</Text>
        <Text style={styles.ringSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Mini-gráfico (sparkline) com animação de "desenhar" ao entrar ────────────
function Sparkline({ color, delay = 0 }: { color: string; delay?: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const pathLength = 130;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1, duration: 1100, delay: delay + 300,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, []);

  const strokeDashoffset = progress.interpolate({ inputRange: [0, 1], outputRange: [pathLength, 0] });

  return (
    <Svg width={92} height={32} viewBox="0 0 92 32">
      <AnimatedPath
        d="M2,20 C10,7 18,29 26,17 C34,5 42,27 50,15 C58,4 66,26 74,14 C79,8 84,16 90,11"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={strokeDashoffset}
      />
    </Svg>
  );
}

// ─── Barra de bateria com preenchimento animado ───────────────────────────────
function BatteryBar({ percent, color, delay = 0 }: { percent: number; color: string; delay?: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent, duration: 1000, delay: delay + 250,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [percent]);

  const w = widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.batteryTrack}>
      <Animated.View style={[styles.batteryFill, { width: w, backgroundColor: color }]} />
    </View>
  );
}

// ─── Linha de sensor (card) ────────────────────────────────────────────────────
function SensorRow({
  icon, iconBg, label, value, valueColor, right, C, delay,
}: {
  icon: React.ReactNode; iconBg: string; label: string; value: string;
  valueColor: string; right: React.ReactNode; C: typeof Colors.light; delay: number;
}) {
  const shadow = Platform.select({
    ios: { shadowColor: '#2B1E63', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 10 },
    android: { elevation: 2 },
  });

  return (
    <FadeInUp delay={delay}>
      <View style={[styles.sensorRow, { backgroundColor: C.backgroundCard }, shadow]}>
        <View style={styles.sensorLeft}>
          <View style={[styles.sensorIcon, { backgroundColor: iconBg }]}>{icon}</View>
          <View>
            <Text style={[styles.sensorLabel, { color: C.textSecondary }]}>{label}</Text>
            <Text style={[styles.sensorValue, { color: valueColor }]}>{value}</Text>
          </View>
        </View>
        {right}
      </View>
    </FadeInUp>
  );
}

// ─── Tela principal ────────────────────────────────────────────────────────────
export default function MonitoramentoScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const isDark = scheme === 'dark';
  const router = useRouter();
  const { t } = useI18n();
  const { dispositivo } = useDispositivoPrincipal();

  // ── Dados reais (ESP32 -> Firestore) ──
  const online   = !!dispositivo?.online;
  const temp     = online ? dispositivo?.temperature ?? null : null;
  // Fonte única de presença (presente/ausente só com leitura recente; offline/desconhecido => null)
  const presenca = dispositivo?.estadoPresenca === 'presente' ? true
                 : dispositivo?.estadoPresenca === 'ausente' ? false : null;
  const bateria  = online ? dispositivo?.battery ?? null : null;
  const risco    = presenca === true && temp != null && temp >= 35;
  const duracao  = dispositivo?.msDesdeUltimaLeitura != null ? formatarDuracao(dispositivo.msDesdeUltimaLeitura) : null;
  const visto    = duracao ? t('devices_ago').replace('{n}', duracao) : '—';

  const ringTitle = !dispositivo ? t('home_noDevice')
    : !online ? t('home_offlineTitle')
    : risco ? t('monitoring_riskTitle')
    : presenca === true ? t('devices_presenceYes')
    : presenca === false ? t('devices_presenceNo')
    : t('home_noReading');
  const ringSub = !dispositivo ? t('monitoring_noDeviceSub')
    : `${t('home_lastSeenLabel')}: ${visto}`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: C.backgroundSoft }]}
          onPress={() => router.back()}
        >
          <ChevronLeft size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.text }]}>Monitoramento</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Anel de status ── */}
        <View style={styles.ringSection}>
          <StatusRing isDark={isDark} title={ringTitle} subtitle={ringSub} />
        </View>

        {/* ── Sensores ── */}
        <View style={{ gap: 12 }}>
          <SensorRow
            delay={100}
            C={C}
            icon={<Thermometer size={20} color={Brand.purple} />}
            iconBg={C.accentSoft}
            label="Temperatura"
            value={temp != null ? `${Math.round(temp)}°C` : '—'}
            valueColor={temp != null && temp >= 35 ? '#E6485E' : '#22B573'}
            right={<Sparkline color={Brand.purple} delay={100} />}
          />

          <SensorRow
            delay={170}
            C={C}
            icon={<User size={20} color={Brand.purple} />}
            iconBg={C.accentSoft}
            label="Presença"
            value={presenca === true ? t('home_detected') : presenca === false ? t('home_notDetected') : '—'}
            valueColor={presenca === true ? Brand.purple : C.textSecondary}
            right={<Sparkline color={Brand.purple} delay={170} />}
          />

          <SensorRow
            delay={240}
            C={C}
            icon={<BatteryMedium size={20} color={Brand.purple} />}
            iconBg={C.accentSoft}
            label="Bateria do dispositivo"
            value={bateria != null ? `${Math.round(bateria)}%` : '—'}
            valueColor={C.text}
            right={<BatteryBar percent={bateria ?? 0} color={Brand.purple} delay={240} />}
          />
        </View>

        {/* ── Botão: Ver histórico ── */}
        <FadeInUp delay={340} style={{ marginTop: 28 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.historyBtn}
            onPress={() => router.push('/(tabs)/historico' as any)}
          >
            <Text style={styles.historyBtnText}>Ver histórico</Text>
          </TouchableOpacity>
        </FadeInUp>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },

  ringSection: { alignItems: 'center', justifyContent: 'center', marginVertical: 24 },
  ringOuterWrap: { alignItems: 'center', justifyContent: 'center', width: 224, height: 224 },
  ringGlow: { position: 'absolute', backgroundColor: Brand.lilac },
  ringInner: {
    position: 'absolute', width: 168, height: 168, borderRadius: 84,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#2B1E63', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 4 },
    }),
  },
  ringTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold', marginTop: 10 },
  ringSubtitle: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9090A8', marginTop: 2 },

  sensorRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 18, padding: 16,
  },
  sensorLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  sensorIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  sensorLabel: { fontSize: 12.5, fontFamily: 'Poppins-Regular' },
  sensorValue: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginTop: 3 },

  batteryTrack: {
    width: 100, height: 8, borderRadius: 4,
    backgroundColor: '#E8E6F0', overflow: 'hidden',
  },
  batteryFill: { height: '100%', borderRadius: 4 },

  historyBtn: {
    backgroundColor: Brand.purple, borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: Brand.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 4 },
    }),
  },
  historyBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Poppins-SemiBold' },
});

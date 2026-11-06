// app/(tabs)/index.tsx
// Tela de Início – InfasCare
// Status da cadeirinha em tempo real + resumo de sensores + atalho para monitoramento

import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Animated, Easing, useColorScheme, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Menu, Bell, Check, Thermometer, User, MapPin, ShieldCheck, ChevronRight,
} from 'lucide-react-native';
import { Colors, Brand } from '@/constants/theme';
import { useI18n } from '@/contexts/I18nContext';
import { useDispositivoPrincipal } from '@/hooks/useDispositivoPrincipal';
import { formatarDuracao } from '@/services/dispositivos';

// ─── Entrada animada (fade + slide-up) ────────────────────────────────────────
function FadeInUp({
  delay = 0,
  style,
  children,
}: {
  delay?: number;
  style?: any;
  children: React.ReactNode;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 550,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── Ponto pulsante (usado no badge "Conectada") ──────────────────────────────
function PulseDot({ color, size = 7 }: { color: string; size?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 2.2, duration: 1100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.9, duration: 0, useNativeDriver: true }),
        Animated.delay(400),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: color, opacity, transform: [{ scale }],
        }}
      />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

// ─── Glow pulsante atrás do círculo de "check" ────────────────────────────────
function GlowPulse({ color, size }: { color: string; size: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.35, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity, transform: [{ scale }],
      }}
    />
  );
}

// ─── Flutuação suave (usada na ilustração da cadeirinha) ──────────────────────
function Floating({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -7, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>;
}

// ─── Card com efeito de "press" (escala ao tocar) ─────────────────────────────
function Pressable({
  onPress,
  style,
  children,
}: {
  onPress?: () => void;
  style?: any;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={style}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Tela principal ────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const isDark = scheme === 'dark';
  const router = useRouter();
  const { t } = useI18n();
  const { dispositivo } = useDispositivoPrincipal();

  // ── Dados reais da cadeirinha (ESP32 -> Firestore) ──
  const online      = !!dispositivo?.online;
  const temp        = online ? dispositivo?.temperature ?? null : null;
  // Fonte única de presença (presente/ausente só com leitura recente; offline/desconhecido => null)
  const presenca    = dispositivo?.estadoPresenca === 'presente' ? true
                    : dispositivo?.estadoPresenca === 'ausente' ? false : null;
  const risco       = presenca === true && temp != null && temp >= 35;
  const tempAlta    = temp != null && temp >= 35;
  const duracao     = dispositivo?.msDesdeUltimaLeitura != null ? formatarDuracao(dispositivo.msDesdeUltimaLeitura) : null;
  const visto       = duracao ? t('devices_ago').replace('{n}', duracao) : '—';

  const pillLabel   = !dispositivo ? t('home_noDevice') : online ? t('home_connected') : t('home_offline');
  const pillColor   = online ? '#4ADE80' : '#F87171';
  const estado      = dispositivo?.estadoPresenca;
  // O cartão principal reflete a presença REAL (antes mostrava "Tudo seguro" fixo)
  const heroTitle   = !dispositivo ? t('home_noDevice')
    : estado === 'offline' ? t('home_offlineTitle')
    : risco ? t('home_heroRisk')
    : estado === 'presente' ? t('devices_presenceYes')
    : estado === 'ausente' ? t('devices_presenceNo')
    : t('home_noReading');
  const heroSub     = !dispositivo ? t('home_noDeviceHint')
    : estado === 'ausente' ? `${t('home_presence')}: ${t('home_notDetected')} · ${t('home_lastSeenLabel')}: ${visto}`
    : `${t('home_lastSeenLabel')}: ${visto}`;

  const cardShadow = Platform.select({
    ios: { shadowColor: '#2B1E63', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.25 : 0.06, shadowRadius: 14 },
    android: { elevation: 3 },
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.background} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: C.backgroundSoft }]}
            onPress={() => router.push('/(settings)/configuracoes' as any)}
          >
            <Menu size={20} color={C.text} />
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={[styles.greeting, { color: C.text }]}>{t('home_greeting')}</Text>
            <Text style={[styles.greetingSub, { color: C.textSecondary }]}>{t('home_greetingSub')}</Text>
          </View>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: C.backgroundSoft }]}
            onPress={() => router.push('/(tabs)/alertas' as any)}
          >
            <Bell size={20} color={C.text} />
            <View style={[styles.notifDot, { borderColor: C.background }]} />
          </TouchableOpacity>
        </View>

        {/* ── Card hero: Status da cadeirinha ── */}
        <FadeInUp delay={50}>
          <Pressable
            style={[styles.heroCard, cardShadow]}
            onPress={() => router.push('/(settings)/monitoramento' as any)}
          >
            <View style={styles.heroBg}>
              <View style={styles.heroGradientA} />
              <View style={styles.heroGradientB} />
            </View>

            <View style={styles.heroTopRow}>
              <Text style={styles.heroLabel}>{t('home_heroLabel')}</Text>
              <View style={styles.heroPill}>
                <PulseDot color={pillColor} />
                <Text style={styles.heroPillText}>{pillLabel}</Text>
              </View>
            </View>

            <View style={styles.heroMainRow}>
              <View style={styles.heroCheckWrap}>
                <GlowPulse color="rgba(255,255,255,0.9)" size={56} />
                <View style={styles.heroCheckCircle}>
                  <Check size={26} color={Brand.purple} strokeWidth={3} />
                </View>
              </View>
              <View style={{ marginLeft: 14, flexShrink: 1 }}>
                <Text style={styles.heroTitle}>{heroTitle}</Text>
                <Text style={styles.heroSubtitle}>{heroSub}</Text>
              </View>
            </View>

            <Floating>
              <Image
                source={require('@/assets/images/icon_cadeirinhainicio.png')}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </Floating>
          </Pressable>
        </FadeInUp>

        {/* ── Linha: Temperatura + Presença ── */}
        <View style={styles.row}>
          <FadeInUp delay={130} style={{ flex: 1 }}>
            <View style={[styles.smallCard, { backgroundColor: C.backgroundCard }, cardShadow]}>
              <View style={[styles.smallIconCircle, { backgroundColor: C.accentSoft }]}>
                <Thermometer size={20} color={Brand.purple} />
              </View>
              <Text style={[styles.smallLabel, { color: C.textSecondary }]}>{t('home_temperature')}</Text>
              <Text style={[styles.smallValue, { color: C.text }]}>{temp != null ? `${Math.round(temp)}°C` : '—'}</Text>
              {temp == null
                ? <Text style={[styles.smallStatusInfo, { color: C.textMuted }]}>{t('home_noReading')}</Text>
                : tempAlta
                  ? <Text style={[styles.smallStatusInfo, { color: '#E6485E' }]}>{t('home_high')}</Text>
                  : <Text style={styles.smallStatusGood}>{t('home_normal')}</Text>}
            </View>
          </FadeInUp>

          <FadeInUp delay={190} style={{ flex: 1 }}>
            <View style={[styles.smallCard, { backgroundColor: C.backgroundCard }, cardShadow]}>
              <View style={[styles.smallIconCircle, { backgroundColor: C.accentSoft }]}>
                <User size={20} color={Brand.purple} />
              </View>
              <Text style={[styles.smallLabel, { color: C.textSecondary }]}>{t('home_presence')}</Text>
              <Text style={[styles.smallValue, { color: C.text }]}>
                {presenca === true ? t('home_child') : presenca === false ? t('home_empty') : '—'}
              </Text>
              <Text style={[styles.smallStatusInfo, { color: presenca === true ? Brand.purple : C.textMuted }]}>
                {presenca === true ? t('home_detected') : presenca === false ? t('home_notDetected') : estado === 'offline' ? t('home_offline') : t('home_noReading')}
              </Text>
            </View>
          </FadeInUp>
        </View>

        {/* ── Banner: Viagem tranquila ── */}
        <FadeInUp delay={310}>
          <Pressable
            style={[styles.tripBanner, { backgroundColor: C.backgroundCard }, cardShadow]}
            onPress={() => router.push('/(settings)/monitoramento' as any)}
          >
            <View style={styles.tripIconCircle}>
              <ShieldCheck size={22} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.tripTitle, { color: C.text }]}>{t('home_tripTitle')}</Text>
              <Text style={[styles.tripSubtitle, { color: C.textSecondary }]}>{t('home_tripSubtitle')}</Text>
            </View>
            <ChevronRight size={20} color={C.textMuted} />
          </Pressable>
        </FadeInUp>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconBtn: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 9,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: Brand.error, borderWidth: 2,
  },
  headerTextWrap: { flex: 1, alignItems: 'center' },
  greeting: { fontSize: 17, fontFamily: 'Poppins-SemiBold' },
  greetingSub: { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 2 },

  // Hero card
  heroCard: {
    borderRadius: 26, padding: 22, marginBottom: 16,
    overflow: 'hidden', position: 'relative', minHeight: 168,
  },
  heroBg: { ...StyleSheet.absoluteFillObject, backgroundColor: Brand.purple },
  heroGradientA: {
    position: 'absolute', width: '140%', height: '140%', borderRadius: 999,
    top: '-45%', left: '-25%', backgroundColor: '#5847D6',
  },
  heroGradientB: {
    position: 'absolute', width: '120%', height: '120%', borderRadius: 999,
    bottom: '-55%', right: '-30%', backgroundColor: Brand.lilac, opacity: 0.55,
  },
  heroTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'Poppins-Medium' },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20,
    paddingHorizontal: 11, paddingVertical: 6,
  },
  heroPillText: { color: '#fff', fontSize: 11.5, fontFamily: 'Poppins-SemiBold' },
  heroMainRow: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  heroCheckWrap: {
    width: 56, height: 56, alignItems: 'center', justifyContent: 'center',
  },
  heroCheckCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { color: '#fff', fontSize: 21, fontFamily: 'Poppins-SemiBold' },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 3 },
  heroImage: {
    position: 'absolute', right: 4, bottom: 6,
    width: 88, height: 108, opacity: 0.95,
  },

  // Linha de dois cards
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  smallCard: { borderRadius: 20, padding: 16 },
  smallIconCircle: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  smallLabel: { fontSize: 12.5, fontFamily: 'Poppins-Regular' },
  smallValue: { fontSize: 21, fontFamily: 'Poppins-SemiBold', marginTop: 4 },
  smallStatusGood: { fontSize: 12.5, fontFamily: 'Poppins-SemiBold', color: '#22B573', marginTop: 3 },
  smallStatusInfo: { fontSize: 12.5, fontFamily: 'Poppins-SemiBold', marginTop: 3 },

  // Distância
  wideCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, padding: 16, marginBottom: 12,
  },

  // Banner viagem
  tripBanner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, padding: 16,
  },
  tripIconCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Brand.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  tripTitle: { fontSize: 15, fontFamily: 'Poppins-SemiBold' },
  tripSubtitle: { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 2 },
});
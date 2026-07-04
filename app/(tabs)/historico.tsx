// app/(tabs)/historico.tsx
// Tela de Histórico – InfasCare
// Layout profissional seguindo o design do app + animações de entrada,
// gráfico animado, filtros por período e timeline de eventos.

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  useColorScheme,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CalendarDays,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  MapPin,
  BatteryMedium,
  Wifi,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from 'react-native-svg';
import { Colors, Brand } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 190;
const BAR_WIDTH = 22;

type Period = '7d' | '15d' | '30d';
type EventType = 'critico' | 'temperatura' | 'viagem' | 'bateria' | 'conexao' | 'seguro';

interface HistoryEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  time: string;
  date: string;
}

const periods: { key: Period; label: string }[] = [
  { key: '7d', label: '7 dias' },
  { key: '15d', label: '15 dias' },
  { key: '30d', label: '30 dias' },
];

const chartData = [
  { day: '12/05', value: 20 },
  { day: '13/05', value: 25 },
  { day: '15/05', value: 18 },
  { day: '16/05', value: 27 },
  { day: '17/05', value: 12 },
  { day: '18/05', value: 21 },
];

const historyEvents: HistoryEvent[] = [
  {
    id: '1',
    type: 'critico',
    title: 'Alerta crítico',
    description: 'Criança deixada na cadeirinha.',
    time: '09:41',
    date: 'Hoje',
  },
  {
    id: '2',
    type: 'temperatura',
    title: 'Temperatura alta',
    description: 'Temperatura interna acima do normal.',
    time: '09:20',
    date: 'Hoje',
  },
  {
    id: '3',
    type: 'viagem',
    title: 'Viagem finalizada',
    description: 'Viagem concluída com sucesso.',
    time: 'Ontem',
    date: 'Ontem',
  },
  {
    id: '4',
    type: 'bateria',
    title: 'Bateria do dispositivo',
    description: 'Dispositivo carregado até 85%.',
    time: 'Ontem',
    date: 'Ontem',
  },
  {
    id: '5',
    type: 'conexao',
    title: 'Cadeirinha conectada',
    description: 'Conexão estabelecida com o aplicativo.',
    time: 'Seg 16:10',
    date: 'Esta semana',
  },
  {
    id: '6',
    type: 'seguro',
    title: 'Monitoramento seguro',
    description: 'Nenhuma anormalidade encontrada.',
    time: 'Seg 08:30',
    date: 'Esta semana',
  },
];

const eventConfig: Record<EventType, { color: string; bg: string; icon: any }> = {
  critico: { color: '#E6485E', bg: '#FFF1F3', icon: AlertTriangle },
  temperatura: { color: '#FF8A34', bg: '#FFF6ED', icon: Thermometer },
  viagem: { color: '#3B82F6', bg: '#EEF5FF', icon: MapPin },
  bateria: { color: '#6A5AE0', bg: '#F0EEFF', icon: BatteryMedium },
  conexao: { color: '#38A169', bg: '#ECFFF4', icon: Wifi },
  seguro: { color: '#45B46B', bg: '#F0FFF5', icon: ShieldCheck },
};

function FadeInUp({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: React.ReactNode;
  style?: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 560,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });

  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const listener = progress.addListener(({ value: current }) => {
      setDisplay(Math.round(current));
    });

    Animated.timing(progress, {
      toValue: value,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => progress.removeListener(listener);
  }, [value]);

  return <Text>{display}{suffix}</Text>;
}

function MetricCard({
  icon,
  label,
  value,
  suffix,
  color,
  C,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  C: typeof Colors.light;
  delay: number;
}) {
  const shadow = Platform.select({
    ios: {
      shadowColor: '#2B1E63',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
    android: { elevation: 2 },
  });

  return (
    <FadeInUp delay={delay} style={styles.metricFlex}>
      <View style={[styles.metricCard, { backgroundColor: C.backgroundCard, borderColor: C.border }, shadow]}>
        <View style={[styles.metricIcon, { backgroundColor: color + '18' }]}>
          {icon}
        </View>
        <Text style={[styles.metricValue, { color: C.text }]}>
          <AnimatedCounter value={value} suffix={suffix} />
        </Text>
        <Text style={[styles.metricLabel, { color: C.textSecondary }]}>{label}</Text>
      </View>
    </FadeInUp>
  );
}

function HistoryChart({ C, isDark }: { C: typeof Colors.light; isDark: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const maxValue = Math.max(...chartData.map(item => item.value));
  const chartWidth = width - 64;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1000,
      delay: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, []);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-chartWidth, chartWidth],
  });

  const shadow = Platform.select({
    ios: {
      shadowColor: '#2B1E63',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.18 : 0.07,
      shadowRadius: 22,
    },
    android: { elevation: 3 },
  });

  return (
    <FadeInUp delay={170}>
      <View style={[styles.chartCard, { backgroundColor: C.backgroundCard, borderColor: C.border }, shadow]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Atividades por dia</Text>
            <Text style={[styles.sectionSubtitle, { color: C.textSecondary }]}>Resumo dos últimos registros</Text>
          </View>

          <View style={[styles.chartBadge, { backgroundColor: Brand.purple + '14' }]}>
            <TrendingUp size={15} color={Brand.purple} />
            <Text style={styles.chartBadgeText}>+12%</Text>
          </View>
        </View>

        <View style={styles.chartArea}>
          <Svg width="100%" height={CHART_HEIGHT} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={Brand.lilac} />
                <Stop offset="1" stopColor={Brand.purple} />
              </LinearGradient>
            </Defs>

            {[0, 1, 2, 3].map(index => (
              <Line
                key={index}
                x1="0"
                x2="100%"
                y1={32 + index * 38}
                y2={32 + index * 38}
                stroke={isDark ? '#2D2850' : '#EEEAF8'}
                strokeWidth="1"
                strokeDasharray="5 8"
              />
            ))}
          </Svg>

          <View style={styles.yAxis}>
            {[30, 20, 10, 0].map(item => (
              <Text key={item} style={[styles.axisText, { color: C.textMuted }]}>{item}</Text>
            ))}
          </View>

          <View style={styles.barsWrap}>
            {chartData.map((item, index) => {
              const height = (item.value / maxValue) * 112 + 12;
              const animatedHeight = progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, height],
              });

              return (
                <View key={item.day} style={styles.barItem}>
                  <View style={styles.barTrack}>
                    <Animated.View
                      style={[
                        styles.bar,
                        {
                          height: animatedHeight,
                          opacity: progress,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: C.textSecondary }]}>{item.day}</Text>
                </View>
              );
            })}
          </View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslate }, { rotate: '18deg' }],
                opacity: isDark ? 0.12 : 0.2,
              },
            ]}
          />
        </View>
      </View>
    </FadeInUp>
  );
}

function EventCard({
  item,
  C,
  isDark,
  delay,
}: {
  item: HistoryEvent;
  C: typeof Colors.light;
  isDark: boolean;
  delay: number;
}) {
  const cfg = eventConfig[item.type];
  const Icon = cfg.icon;
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, speed: 45, useNativeDriver: true }).start();

  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, speed: 45, useNativeDriver: true }).start();

  return (
    <FadeInUp delay={delay}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={[
            styles.eventCard,
            {
              backgroundColor: C.backgroundCard,
              borderColor: C.border,
            },
          ]}
        >
          <View style={[styles.eventIconWrap, { backgroundColor: isDark ? cfg.color + '22' : cfg.bg }]}>
            <Icon size={20} color={cfg.color} strokeWidth={2.2} />
          </View>

          <View style={styles.eventText}>
            <Text style={[styles.eventTitle, { color: C.text }]}>{item.title}</Text>
            <Text style={[styles.eventDescription, { color: C.textSecondary }]}>{item.description}</Text>
          </View>

          <View style={styles.eventTimeWrap}>
            <Text style={[styles.eventTime, { color: C.textMuted }]}>{item.time}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </FadeInUp>
  );
}

export default function HistoricoScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const isDark = scheme === 'dark';
  const [period, setPeriod] = useState<Period>('7d');

  const groupedEvents = useMemo(() => {
    return historyEvents.reduce<Record<string, HistoryEvent[]>>((acc, event) => {
      if (!acc[event.date]) acc[event.date] = [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FadeInUp>
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: C.text }]}>Histórico</Text>
              <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>Acompanhe os registros da cadeirinha</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.headerButton, { backgroundColor: C.backgroundSoft, borderColor: C.border }]}
            >
              <CalendarDays size={21} color={Brand.purple} />
            </TouchableOpacity>
          </View>
        </FadeInUp>

        <FadeInUp delay={80}>
          <View style={[styles.periodCard, { backgroundColor: C.backgroundSoft }]}>
            {periods.map(item => {
              const active = period === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.85}
                  onPress={() => setPeriod(item.key)}
                  style={[styles.periodButton, active && styles.periodButtonActive]}
                >
                  <Text style={[styles.periodText, { color: active ? '#FFFFFF' : C.textSecondary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </FadeInUp>

        <View style={styles.metricsRow}>
          <MetricCard
            C={C}
            delay={120}
            value={103}
            label="Registros"
            color={Brand.purple}
            icon={<Clock3 size={19} color={Brand.purple} />}
          />
          <MetricCard
            C={C}
            delay={170}
            value={96}
            suffix="%"
            label="Segurança"
            color="#45B46B"
            icon={<CheckCircle2 size={19} color="#45B46B" />}
          />
          <MetricCard
            C={C}
            delay={220}
            value={2}
            label="Alertas"
            color="#E6485E"
            icon={<AlertTriangle size={19} color="#E6485E" />}
          />
        </View>

        <HistoryChart C={C} isDark={isDark} />

        <FadeInUp delay={260}>
          <View style={styles.sectionRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Eventos recentes</Text>
              <Text style={[styles.sectionSubtitle, { color: C.textSecondary }]}>Linha do tempo do monitoramento</Text>
            </View>

            <TouchableOpacity style={[styles.filterButton, { borderColor: C.border }]}>
              <Text style={[styles.filterText, { color: Brand.purple }]}>Todos</Text>
              <ChevronDown size={16} color={Brand.purple} />
            </TouchableOpacity>
          </View>
        </FadeInUp>

        {Object.entries(groupedEvents).map(([date, events], groupIndex) => (
          <View key={date} style={styles.timelineGroup}>
            <FadeInUp delay={300 + groupIndex * 70}>
              <Text style={[styles.groupTitle, { color: C.textSecondary }]}>{date}</Text>
            </FadeInUp>

            {events.map((event, index) => (
              <EventCard
                key={event.id}
                item={event}
                C={C}
                isDark={isDark}
                delay={330 + groupIndex * 90 + index * 55}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12.5,
    marginTop: 2,
  },
  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  periodCard: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 18,
    marginBottom: 14,
  },
  periodButton: {
    flex: 1,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: Brand.purple,
    shadowColor: Brand.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  periodText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricFlex: {
    flex: 1,
  },
  metricCard: {
    minHeight: 112,
    borderRadius: 22,
    borderWidth: 1,
    padding: 13,
    justifyContent: 'space-between',
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 21,
    marginTop: 8,
  },
  metricLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
  },
  chartCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    marginBottom: 22,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chartBadgeText: {
    fontFamily: 'Poppins-SemiBold',
    color: Brand.purple,
    fontSize: 12,
  },
  chartArea: {
    height: CHART_HEIGHT,
    overflow: 'hidden',
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 20,
    bottom: 36,
    justifyContent: 'space-between',
    width: 30,
  },
  axisText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
  },
  barsWrap: {
    flex: 1,
    marginLeft: 33,
    paddingTop: 30,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barItem: {
    alignItems: 'center',
    width: 40,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: 128,
    borderRadius: 999,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#EEEAF8',
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 999,
    backgroundColor: Brand.purple,
  },
  barLabel: {
    marginTop: 10,
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
  },
  shimmer: {
    position: 'absolute',
    top: -50,
    left: 0,
    width: 70,
    height: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  filterButton: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  timelineGroup: {
    marginBottom: 14,
  },
  groupTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  eventCard: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventText: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13.5,
  },
  eventDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 2,
  },
  eventTimeWrap: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginTop: 2,
  },
  eventTime: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10.5,
  },
});

// app/(tabs)/alertas.tsx
// Tela de Alertas – InfasCare
// Dark/Light mode automático pelo sistema + LED glow por tipo + filtro com modal

import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useColorScheme, Animated, Modal, Pressable, Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertTriangle, Thermometer, Info, CheckCircle2,
  BatteryLow, Wifi, MapPin, Bell, SlidersHorizontal, X, Check,
} from 'lucide-react-native';
import { Colors, Brand } from '@/constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type AlertType = 'critico' | 'temperatura' | 'informativo' | 'sucesso' | 'bateria' | 'conexao' | 'localizacao';
type FilterTab = 'todos' | 'criticos' | 'informativos';

interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// ─── Configuração visual por tipo ─────────────────────────────────────────────
const ALERT_CONFIG: Record<AlertType, {
  icon: any;
  color: string;
  bgLight: string;
  bgDark: string;
  ledColor: string;
  label: string;
}> = {
  critico: {
    icon: AlertTriangle,
    color: '#E53E3E',
    bgLight: '#FFF5F5',
    bgDark: '#2D1515',
    ledColor: '#FF4444',
    label: 'Crítico',
  },
  temperatura: {
    icon: Thermometer,
    color: '#ED8936',
    bgLight: '#FFFAF0',
    bgDark: '#2D1F0A',
    ledColor: '#FF8C00',
    label: 'Temperatura',
  },
  informativo: {
    icon: Info,
    color: '#4A90E2',
    bgLight: '#EBF4FF',
    bgDark: '#0D1F35',
    ledColor: '#4A90E2',
    label: 'Informativo',
  },
  sucesso: {
    icon: CheckCircle2,
    color: '#38A169',
    bgLight: '#F0FFF4',
    bgDark: '#0D2D1A',
    ledColor: '#38D675',
    label: 'Sucesso',
  },
  bateria: {
    icon: BatteryLow,
    color: '#D69E2E',
    bgLight: '#FFFFF0',
    bgDark: '#2D2A00',
    ledColor: '#FFD700',
    label: 'Bateria',
  },
  conexao: {
    icon: Wifi,
    color: '#6A5AE0',
    bgLight: '#EBE9FF',
    bgDark: '#12103A',
    ledColor: '#8B7FFF',
    label: 'Conexão',
  },
  localizacao: {
    icon: MapPin,
    color: '#38A169',
    bgLight: '#F0FFF4',
    bgDark: '#0D2D1A',
    ledColor: '#38D675',
    label: 'Localização',
  },
};

// ─── Dados mockados ───────────────────────────────────────────────────────────
const MOCK_ALERTS: AlertItem[] = [
  {
    id: '1', type: 'critico', read: false,
    title: 'Alerta crítico',
    description: 'Criança deixada na cadeirinha! Verifique imediatamente.',
    time: '09:41',
  },
  {
    id: '2', type: 'temperatura', read: false,
    title: 'Temperatura elevada',
    description: 'Temperatura interna acima do normal.',
    time: '09:20',
  },
  {
    id: '3', type: 'informativo', read: true,
    title: 'Viagem finalizada',
    description: 'Viagem concluída com sucesso.',
    time: 'Ontem 18:30',
  },
  {
    id: '4', type: 'bateria', read: true,
    title: 'Bateria fraca',
    description: 'Nível de bateria do dispositivo abaixo de 20%.',
    time: 'Ontem 14:15',
  },
  {
    id: '5', type: 'sucesso', read: true,
    title: 'Dispositivo conectado',
    description: 'Cadeirinha reconectada com sucesso ao seu celular.',
    time: 'Ontem 08:00',
  },
  {
    id: '6', type: 'localizacao', read: true,
    title: 'Chegou ao destino',
    description: 'Cadeirinha chegou ao endereço de destino definido.',
    time: 'Sex 17:42',
  },
  {
    id: '7', type: 'conexao', read: true,
    title: 'Sinal fraco detectado',
    description: 'A conexão Bluetooth está com sinal abaixo do esperado.',
    time: 'Sex 11:10',
  },
];

// ─── Opções de filtro avançado ────────────────────────────────────────────────
const FILTER_OPTIONS: { key: AlertType; label: string }[] = [
  { key: 'critico',      label: '🔴  Críticos'      },
  { key: 'temperatura',  label: '🟠  Temperatura'   },
  { key: 'bateria',      label: '🟡  Bateria'       },
  { key: 'informativo',  label: 'ℹ️   Informativos'  },
  { key: 'sucesso',      label: '✅  Sucesso'       },
  { key: 'localizacao',  label: '📍  Localização'   },
  { key: 'conexao',      label: '📶  Conexão'       },
];

// ─── Componente: Glow pulsante atrás do card ─────────────────────────────────
function CardGlow({ color }: { color: string }) {
  const glowOpacity = useRef(new Animated.Value(0.55)).current;
  const glowScale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 1,    duration: 1000, useNativeDriver: true }),
          Animated.timing(glowScale,   { toValue: 1.04, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.4,  duration: 1000, useNativeDriver: true }),
          Animated.timing(glowScale,   { toValue: 0.98, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cardGlow,
        {
          backgroundColor: color,
          shadowColor: color,
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        },
      ]}
    />
  );
}

// ─── Componente: Card de alerta ───────────────────────────────────────────────
function AlertCard({
  alert,
  isDark,
  onPress,
}: {
  alert: AlertItem;
  isDark: boolean;
  onPress: () => void;
}) {
  const cfg    = ALERT_CONFIG[alert.type];
  const Icon   = cfg.icon;
  const bgCard = isDark ? cfg.bgDark : cfg.bgLight;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      {/* ── Glow pulsante atrás do card ── */}
      {!alert.read && <CardGlow color={cfg.ledColor} />}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: bgCard,
            borderColor: alert.read
              ? 'transparent'
              : cfg.color + (isDark ? '55' : '33'),
            borderWidth: alert.read ? 0 : 1.5,
          },
        ]}
      >
        {/* Indicador lateral colorido */}
        {!alert.read && (
          <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />
        )}

        <View style={[styles.iconCircle, { backgroundColor: cfg.color + '22' }]}>
          <Icon size={22} color={cfg.color} strokeWidth={2.2} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: cfg.color }]} numberOfLines={1}>
              {alert.title}
            </Text>
            <Text style={[styles.cardTime, { color: isDark ? '#7A7595' : '#9898B3' }]}>
              {alert.time}
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: isDark ? '#C0BAD8' : '#5A5A7A' }]} numberOfLines={2}>
            {alert.description}
          </Text>
        </View>

        {/* Ponto de status não-lido */}
        {!alert.read && (
          <View style={[styles.unreadDot, { backgroundColor: cfg.ledColor, shadowColor: cfg.ledColor }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Componente: Modal de filtro ──────────────────────────────────────────────
function FilterModal({
  visible,
  isDark,
  C,
  selected,
  onToggle,
  onApply,
  onClose,
  onClear,
}: {
  visible: boolean;
  isDark: boolean;
  C: typeof Colors.light;
  selected: AlertType[];
  onToggle: (k: AlertType) => void;
  onApply: () => void;
  onClose: () => void;
  onClear: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const bgAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const bgOpacity = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Overlay */}
      <Animated.View style={[styles.modalOverlay, { opacity: bgOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.filterSheet,
          { backgroundColor: C.backgroundCard, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={[styles.sheetHandle, { backgroundColor: C.border }]} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: C.text }]}>Filtrar alertas</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
            <X size={20} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sheetSubtitle, { color: C.textSecondary }]}>
          Selecione os tipos de alerta que deseja ver
        </Text>

        {/* Opções */}
        <View style={styles.filterGrid}>
          {FILTER_OPTIONS.map(opt => {
            const isOn = selected.includes(opt.key);
            const cfg  = ALERT_CONFIG[opt.key];
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => onToggle(opt.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isOn ? cfg.color + '20' : C.backgroundSoft,
                    borderColor:     isOn ? cfg.color         : C.border,
                    borderWidth:     isOn ? 1.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: isOn ? cfg.color : C.textSecondary }]}>
                  {opt.label}
                </Text>
                {isOn && (
                  <View style={[styles.filterCheckIcon, { backgroundColor: cfg.color }]}>
                    <Check size={10} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botões */}
        <View style={styles.filterBtnRow}>
          <TouchableOpacity
            style={[styles.filterBtnSecondary, { borderColor: C.border, backgroundColor: C.backgroundSoft }]}
            onPress={onClear}
          >
            <Text style={[styles.filterBtnSecondaryText, { color: C.textSecondary }]}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtnPrimary, { backgroundColor: Brand.purple }]}
            onPress={onApply}
          >
            <Text style={styles.filterBtnPrimaryText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function AlertasScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C      = Colors[scheme];
  const isDark = scheme === 'dark';

  const [activeTab,       setActiveTab]       = useState<FilterTab>('todos');
  const [filterVisible,   setFilterVisible]   = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<AlertType[]>([]);
  const [appliedFilters,  setAppliedFilters]  = useState<AlertType[]>([]);
  const [alerts,          setAlerts]          = useState<AlertItem[]>(MOCK_ALERTS);

  // Contagem de não-lidos
  const unreadCount = alerts.filter(a => !a.read).length;

  // Filtragem
  const filteredAlerts = alerts.filter(a => {
    const tabOk =
      activeTab === 'todos'        ? true :
      activeTab === 'criticos'     ? a.type === 'critico' || a.type === 'temperatura' || a.type === 'bateria' :
                                     a.type === 'informativo' || a.type === 'sucesso' || a.type === 'localizacao' || a.type === 'conexao';
    const filterOk = appliedFilters.length === 0 || appliedFilters.includes(a.type);
    return tabOk && filterOk;
  });

  // Marca como lido
  const handleAlertPress = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const toggleFilter = (key: AlertType) => {
    setSelectedFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const applyFilters = () => {
    setAppliedFilters(selectedFilters);
    setFilterVisible(false);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setAppliedFilters([]);
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'todos',        label: 'Todos'       },
    { key: 'criticos',     label: 'Críticos'    },
    { key: 'informativos', label: 'Informativos' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.background }]} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={C.background}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: C.background, borderBottomColor: C.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Alertas</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => { setSelectedFilters(appliedFilters); setFilterVisible(true); }}
          style={[
            styles.filterBtn,
            {
              backgroundColor: appliedFilters.length > 0 ? Brand.purple + '18' : C.backgroundSoft,
              borderColor:     appliedFilters.length > 0 ? Brand.purple         : C.border,
            },
          ]}
        >
          <SlidersHorizontal
            size={18}
            color={appliedFilters.length > 0 ? Brand.purple : C.textSecondary}
          />
          {appliedFilters.length > 0 && (
            <View style={styles.filterCountDot}>
              <Text style={styles.filterCountText}>{appliedFilters.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Tabs ── */}
      <View style={[styles.tabBar, { backgroundColor: C.background, borderBottomColor: C.border }]}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                isActive && [styles.tabActive, { backgroundColor: Brand.purple }],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? '#fff' : C.textSecondary },
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Lista ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.listContent, { backgroundColor: C.backgroundSoft }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color={C.textMuted} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>Nenhum alerta</Text>
            <Text style={[styles.emptyDesc, { color: C.textSecondary }]}>
              Não há alertas para os filtros selecionados.
            </Text>
          </View>
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isDark={isDark}
              onPress={() => handleAlertPress(alert.id)}
            />
          ))
        )}

        {/* Nota de rodapé */}
        {filteredAlerts.length > 0 && (
          <Text style={[styles.footerNote, { color: C.textMuted }]}>
            Toque em um alerta para marcá-lo como lido
          </Text>
        )}
      </ScrollView>

      {/* ── Modal de filtro ── */}
      <FilterModal
        visible={filterVisible}
        isDark={isDark}
        C={C}
        selected={selectedFilters}
        onToggle={toggleFilter}
        onApply={applyFilters}
        onClose={() => setFilterVisible(false)}
        onClear={clearFilters}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontFamily: 'Poppins-SemiBold' },
  badge: {
    backgroundColor: Brand.error,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontFamily: 'Poppins-SemiBold' },

  // Filter button
  filterBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12, borderWidth: 1,
    gap: 6,
  },
  filterCountDot: {
    backgroundColor: Brand.purple, width: 17, height: 17,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  filterCountText: { color: '#fff', fontSize: 10, fontFamily: 'Poppins-SemiBold' },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20,
  },
  tabActive:     { },
  tabText:       { fontSize: 13, fontFamily: 'Poppins-Medium' },
  tabTextActive: { fontFamily: 'Poppins-SemiBold' },

  // List
  listContent: { padding: 16, paddingBottom: 40, gap: 12, flexGrow: 1 },

  // Card
  card: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  cardAccent: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  iconCircle: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody:   { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle:  { fontSize: 14, fontFamily: 'Poppins-SemiBold', flex: 1, marginRight: 8 },
  cardTime:   { fontSize: 11, fontFamily: 'Poppins-Regular' },
  cardDesc:   { fontSize: 12, fontFamily: 'Poppins-Regular', lineHeight: 18 },

  // Card wrapper para o glow ficar atrás
  cardWrapper: {
    position: 'relative',
  },

  // Glow atrás do card — cobre toda a área do card com blur forte
  cardGlow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: -6,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.85,
        shadowRadius: 18,
      },
      android: { elevation: 12 },
    }),
  },

  // Ponto de status no canto do card
  unreadDot: {
    width: 9, height: 9,
    borderRadius: 5,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 5,
      },
      android: { elevation: 4 },
    }),
  },

  // Empty state
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, gap: 12,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  emptyDesc:  { fontSize: 13, fontFamily: 'Poppins-Regular', textAlign: 'center', paddingHorizontal: 40 },

  footerNote: { textAlign: 'center', fontSize: 11, fontFamily: 'Poppins-Regular', marginTop: 8 },

  // Filter Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0B1E',
  },
  filterSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 24 },
    }),
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  sheetTitle:    { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  sheetClose:    { padding: 4 },
  sheetSubtitle: { fontSize: 13, fontFamily: 'Poppins-Regular', marginBottom: 20 },

  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20,
  },
  filterChipText:  { fontSize: 13, fontFamily: 'Poppins-Medium' },
  filterCheckIcon: {
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  filterBtnRow:      { flexDirection: 'row', gap: 12 },
  filterBtnPrimary:  { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  filterBtnPrimaryText: { color: '#fff', fontSize: 15, fontFamily: 'Poppins-SemiBold' },
  filterBtnSecondary: {
    flex: 0.45, padding: 16, borderRadius: 16,
    alignItems: 'center', borderWidth: 1,
  },
  filterBtnSecondaryText: { fontSize: 15, fontFamily: 'Poppins-SemiBold' },
});
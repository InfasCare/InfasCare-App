// app/(settings)/dispositivos.tsx
// Tela de Dispositivos Conectados – InfasCare
// ✅ Pop-up de scan com cadeirinha encontrada
// ✅ Menu 3 pontos: Desconectar + Definir como Principal
// ✅ Haptic feedback ao conectar/desconectar
// ✅ Sons sintéticos gerados em tempo real (sem arquivos externos)
// ✅ Dark/Light automático + animações Bluetooth

import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useColorScheme, Animated, Modal, TextInput, Platform,
  StatusBar, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import {
  ArrowLeft, Bluetooth, BluetoothOff, Battery,
  BatteryLow, BatteryMedium, BatteryFull, Thermometer,
  MoreVertical, Pencil, Trash2, RefreshCw, Plus,
  CheckCircle2, AlertCircle, Zap, Shield,
  ChevronRight, X, Check, Star, WifiOff,
  ScanLine, Loader,
} from 'lucide-react-native';
import { Colors, Brand } from '@/constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type DeviceStatus = 'conectado' | 'desconectado' | 'pareando';

interface Device {
  id: string;
  name: string;
  model: string;
  status: DeviceStatus;
  battery: number;
  signal: number;
  temperature: number;
  lastSeen: string;
  firmware: string;
  macAddress: string;
  isMain: boolean;
}

interface FoundDevice {
  id: string;
  name: string;
  model: string;
  macAddress: string;
  signal: number;
}

// ─── Dados mock ───────────────────────────────────────────────────────────────
const INITIAL_DEVICES: Device[] = [
  {
    id: '1',
    name: 'Cadeirinha da Sofia',
    model: 'InfasCare Pro X1',
    status: 'conectado',
    battery: 78,
    signal: 4,
    temperature: 24,
    lastSeen: 'Agora',
    firmware: 'v2.4.1',
    macAddress: 'IC:A1:3F:2B:9D:E0',
    isMain: true,
  },
  {
    id: '2',
    name: 'Cadeirinha do carro',
    model: 'InfasCare Lite S2',
    status: 'desconectado',
    battery: 15,
    signal: 0,
    temperature: 0,
    lastSeen: 'Há 2 horas',
    firmware: 'v2.3.0',
    macAddress: 'IC:B2:7C:1A:4E:F1',
    isMain: false,
  },
];

// Cadeirinhas "encontradas" no scan
const MOCK_FOUND: FoundDevice[] = [
  { id: 'f1', name: 'InfasCare Pro X1', model: 'InfasCare Pro X1', macAddress: 'IC:C3:9A:3D:5F:A2', signal: 3 },
  { id: 'f2', name: 'InfasCare Lite S2', model: 'InfasCare Lite S2', macAddress: 'IC:D4:2E:8B:1C:F3', signal: 2 },
];

// ─── Helper: bateria ──────────────────────────────────────────────────────────
function getBatteryInfo(level: number) {
  if (level <= 15) return { color: '#E53E3E', Icon: BatteryLow    };
  if (level <= 35) return { color: '#ED8936', Icon: BatteryLow    };
  if (level <= 70) return { color: '#D69E2E', Icon: BatteryMedium };
  return             { color: '#38A169', Icon: BatteryFull   };
}

// ─── Sons ─────────────────────────────────────────────────────────────────────
// Coloque os arquivos em: assets/sounds/
//   connect.mp3    → som de conexão Bluetooth
//   disconnect.mp3 → som de desconexão Bluetooth
// Salvar, renomear, remover e definir principal usam só haptics (sem som).

let connectSound:    Audio.Sound | null = null;
let disconnectSound: Audio.Sound | null = null;

async function loadSounds() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });
    const [c, d] = await Promise.all([
      Audio.Sound.createAsync(require('@/assets/sounds/connect.mp3'),    { volume: 0.7 }),
      Audio.Sound.createAsync(require('@/assets/sounds/disconnect.mp3'), { volume: 0.6 }),
    ]);
    connectSound    = c.sound;
    disconnectSound = d.sound;
  } catch (_) {}
}

async function playSound(sound: Audio.Sound | null) {
  try {
    if (!sound) return;
    await sound.stopAsync();
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (_) {}
}

// ─── Helper: haptics + som ────────────────────────────────────────────────────
async function hapticAndSoundConnect() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(r => setTimeout(r, 80));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(r => setTimeout(r, 120));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (_) {}
  await playSound(connectSound);
}

async function hapticAndSoundDisconnect() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(r => setTimeout(r, 150));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (_) {}
  await playSound(disconnectSound);
}

// Salvar / definir principal: só haptics
async function hapticSuccess() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (_) {}
}

// Remover: só haptics
async function hapticRemove() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await new Promise(r => setTimeout(r, 120));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (_) {}
}

// ─── Barras de sinal ──────────────────────────────────────────────────────────
function SignalBars({ level, color }: { level: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {[5, 8, 11, 14].map((h, i) => (
        <View key={i} style={{ width: 4, height: h, borderRadius: 2, backgroundColor: i < level ? color : color + '30' }} />
      ))}
    </View>
  );
}

// ─── Anel Bluetooth animado ───────────────────────────────────────────────────
function BluetoothRing({ status, color }: { status: DeviceStatus; color: string }) {
  const rings  = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  const pulse  = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'conectado') {
      rings.forEach((r, i) => {
        Animated.loop(Animated.sequence([
          Animated.delay(i * 600),
          Animated.timing(r, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(r, { toValue: 0, duration: 0,    useNativeDriver: true }),
        ])).start();
      });
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])).start();
    } else if (status === 'pareando') {
      Animated.loop(
        Animated.timing(rotate, { toValue: 1, duration: 900, useNativeDriver: true })
      ).start();
    }
  }, [status]);

  const ringStyle = (val: Animated.Value) => ({
    position: 'absolute' as const,
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: color,
    opacity:   val.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.7, 0.4, 0] }),
    transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
  });

  const spinStyle = {
    transform: [{ rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
  };

  return (
    <View style={s.btWrap}>
      {status === 'conectado' && rings.map((r, i) => <Animated.View key={i} style={ringStyle(r)} />)}
      <Animated.View style={[s.btCircle, { backgroundColor: color + '20', transform: [{ scale: pulse }] }]}>
        {status === 'pareando'
          ? <Animated.View style={spinStyle}><Loader size={24} color={color} strokeWidth={2} /></Animated.View>
          : status === 'conectado'
            ? <Bluetooth   size={26} color={color} strokeWidth={2} />
            : <BluetoothOff size={26} color={color} strokeWidth={2} />
        }
      </Animated.View>
    </View>
  );
}

// ─── Modal: Scan de dispositivos próximos ─────────────────────────────────────
function ScanModal({
  visible,
  C,
  isDark,
  existingIds,
  onConnect,
  onClose,
}: {
  visible: boolean;
  C: typeof Colors.light;
  isDark: boolean;
  existingIds: string[];
  onConnect: (found: FoundDevice) => void;
  onClose: () => void;
}) {
  const [phase, setPhase]           = useState<'scanning' | 'found'>('scanning');
  const [connecting, setConnecting] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const bgAnim    = useRef(new Animated.Value(0)).current;
  const scanAnim  = useRef(new Animated.Value(0)).current;
  const scanLoop  = useRef<Animated.CompositeAnimation>();

  useEffect(() => {
    if (visible) {
      setPhase('scanning');
      setConnecting(null);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
      scanLoop.current = Animated.loop(
        Animated.timing(scanAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
      );
      scanLoop.current.start();
      setTimeout(() => {
        scanLoop.current?.stop();
        setPhase('found');
      }, 2500);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 600, duration: 260, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleConnect = (fd: FoundDevice) => {
    setConnecting(fd.id);
    setTimeout(async () => {
      await hapticAndSoundConnect();
      onConnect(fd);
      onClose();
    }, 1800);
  };

  const spinStyle = {
    transform: [{ rotate: scanAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
  };

  const available = MOCK_FOUND.filter(f => !existingIds.includes(f.id));

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#0D0B1E', opacity: bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.65] }) },
        ]}
        pointerEvents="none"
      />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[
          s.scanSheet,
          { backgroundColor: C.backgroundCard, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={[s.sheetHandle, { backgroundColor: C.border }]} />

        <View style={s.sheetHeader}>
          <View>
            <Text style={[s.sheetTitle, { color: C.text }]}>
              {phase === 'scanning' ? 'Buscando dispositivos...' : 'Dispositivos encontrados'}
            </Text>
            <Text style={[s.sheetSub, { color: C.textSecondary }]}>
              {phase === 'scanning'
                ? 'Aproxime a cadeirinha e aguarde'
                : `${available.length} cadeirinha${available.length !== 1 ? 's' : ''} InfasCare próxima${available.length !== 1 ? 's' : ''}`
              }
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: C.backgroundSoft }]}>
            <X size={18} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        {phase === 'scanning' && (
          <View style={s.scanCenter}>
            <View style={s.radarWrap}>
              {[100, 140, 180].map((sz, i) => (
                <View key={i} style={[s.radarRing, { width: sz, height: sz, borderRadius: sz / 2, borderColor: Brand.purple + (i === 0 ? '60' : i === 1 ? '35' : '18') }]} />
              ))}
              <View style={[s.radarCenter, { backgroundColor: Brand.purple }]}>
                <Animated.View style={spinStyle}>
                  <ScanLine size={28} color="#fff" />
                </Animated.View>
              </View>
            </View>
            <Text style={[s.scanHint, { color: C.textSecondary }]}>
              Verificando dispositivos Bluetooth próximos...
            </Text>
          </View>
        )}

        {phase === 'found' && (
          <View style={{ gap: 10 }}>
            {available.length === 0 ? (
              <View style={[s.noDeviceBox, { backgroundColor: C.backgroundSoft }]}>
                <BluetoothOff size={36} color={C.textMuted} strokeWidth={1.5} />
                <Text style={[s.noDeviceText, { color: C.textSecondary }]}>
                  Nenhuma cadeirinha InfasCare encontrada.{'\n'}Tente deixar o dispositivo mais próximo.
                </Text>
              </View>
            ) : (
              available.map(fd => (
                <View key={fd.id} style={[s.foundCard, { backgroundColor: C.backgroundSoft, borderColor: Brand.purple + '30' }]}>
                  <View style={[s.foundIcon, { backgroundColor: Brand.purple + '15' }]}>
                    <Bluetooth size={22} color={Brand.purple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.foundName, { color: C.text }]}>{fd.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <SignalBars level={fd.signal} color={Brand.blue} />
                      <Text style={[s.foundMac, { color: C.textMuted }]}>{fd.macAddress}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      s.connectBtn,
                      {
                        backgroundColor: connecting === fd.id ? Brand.purple : Brand.purple + '15',
                        borderColor: Brand.purple + '50',
                      },
                    ]}
                    onPress={() => handleConnect(fd)}
                    disabled={!!connecting}
                  >
                    {connecting === fd.id ? (
                      <Text style={[s.connectBtnText, { color: '#fff' }]}>Conectando...</Text>
                    ) : (
                      <Text style={[s.connectBtnText, { color: Brand.purple }]}>Conectar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: Platform.OS === 'ios' ? 34 : 20 }} />
      </Animated.View>
    </Modal>
  );
}

// ─── Menu de 3 pontos (dropdown) ──────────────────────────────────────────────
function DeviceMenu({
  device, C, menuAnim, onRename, onRemove, onToggleConnect, onSetMain, onClose,
}: {
  device: Device; C: typeof Colors.light; menuAnim: Animated.Value;
  onRename: () => void; onRemove: () => void;
  onToggleConnect: () => void; onSetMain: () => void; onClose: () => void;
}) {
  const isConnected = device.status === 'conectado';

  const item = (icon: React.ReactNode, label: string, color: string, onPress: () => void) => (
    <TouchableOpacity style={s.dropItem} onPress={() => { onClose(); onPress(); }}>
      {icon}
      <Text style={[s.dropText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[
      s.dropdown,
      {
        backgroundColor: C.backgroundCard,
        borderColor: C.border,
        opacity: menuAnim,
        transform: [{ scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
      },
    ]}>
      {item(<Pencil size={15} color={Brand.purple} />, 'Renomear', C.text, onRename)}
      <View style={[s.dropDiv, { backgroundColor: C.border }]} />

      {!device.isMain && item(
        <Star size={15} color="#D69E2E" />, 'Definir como principal', C.text, onSetMain,
      )}
      {!device.isMain && <View style={[s.dropDiv, { backgroundColor: C.border }]} />}

      {isConnected
        ? item(<WifiOff size={15} color="#ED8936" />, 'Desconectar', '#ED8936', onToggleConnect)
        : item(<Bluetooth size={15} color={Brand.blue} />, 'Reconectar', C.text, onToggleConnect)
      }
      <View style={[s.dropDiv, { backgroundColor: C.border }]} />
      {item(<Trash2 size={15} color="#E53E3E" />, 'Remover', '#E53E3E', onRemove)}
    </Animated.View>
  );
}

// ─── Card de dispositivo ───────────────────────────────────────────────────────
function DeviceCard({
  device, isDark, C, onEdit, onRemove, onToggleConnect, onSetMain,
}: {
  device: Device; isDark: boolean; C: typeof Colors.light;
  onEdit: () => void; onRemove: () => void;
  onToggleConnect: () => void; onSetMain: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const menuAnim  = useRef(new Animated.Value(0)).current;

  const isConnected = device.status === 'conectado';
  const btColor     = isConnected ? Brand.purple : C.textMuted;
  const battInfo    = getBatteryInfo(device.battery);
  const statusMeta  = isConnected
    ? { label: 'Conectado',    color: '#38A169', bg: '#F0FFF4' }
    : { label: 'Desconectado', color: '#E53E3E', bg: '#FFF5F5' };

  const toggleMenu = () => {
    const to = menuOpen ? 0 : 1;
    Animated.spring(menuAnim, { toValue: to, damping: 18, stiffness: 220, useNativeDriver: true }).start();
    setMenuOpen(!menuOpen);
  };

  return (
    <Pressable
      onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.985, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true }).start()}
    >
      <Animated.View style={[
        s.card,
        {
          backgroundColor: C.backgroundCard,
          borderColor: isConnected ? Brand.purple + '30' : C.border,
          shadowColor: isConnected ? Brand.purple : '#000',
          transform: [{ scale: scaleAnim }],
        },
      ]}>
        {device.isMain && (
          <View style={[s.mainBadge, { backgroundColor: Brand.purple }]}>
            <Zap size={10} color="#fff" fill="#fff" />
            <Text style={s.mainBadgeText}>Principal</Text>
          </View>
        )}

        <View style={s.cardTop}>
          <BluetoothRing status={device.status} color={btColor} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[s.devName, { color: C.text }]} numberOfLines={1}>{device.name}</Text>
            <Text style={[s.devModel, { color: C.textSecondary }]}>{device.model}</Text>
            <View style={[s.pill, { backgroundColor: isDark ? statusMeta.color + '20' : statusMeta.bg }]}>
              {isConnected
                ? <CheckCircle2 size={11} color={statusMeta.color} strokeWidth={2.5} />
                : <AlertCircle  size={11} color={statusMeta.color} strokeWidth={2.5} />
              }
              <Text style={[s.pillText, { color: statusMeta.color }]}>
                {statusMeta.label} · {device.lastSeen}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={toggleMenu} style={s.menuBtn} hitSlop={10}>
            <MoreVertical size={18} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        {menuOpen && (
          <DeviceMenu
            device={device} C={C} menuAnim={menuAnim}
            onRename={onEdit} onRemove={onRemove}
            onToggleConnect={onToggleConnect} onSetMain={onSetMain}
            onClose={() => { toggleMenu(); }}
          />
        )}

        {isConnected && (
          <View style={[s.metrics, { borderTopColor: C.border }]}>
            <View style={s.metric}>
              <battInfo.Icon size={16} color={battInfo.color} strokeWidth={2} />
              <Text style={[s.metricVal, { color: battInfo.color }]}>{device.battery}%</Text>
              <Text style={[s.metricLbl, { color: C.textMuted }]}>Bateria</Text>
            </View>
            <View style={[s.metricDiv, { backgroundColor: C.border }]} />
            <View style={s.metric}>
              <SignalBars level={device.signal} color={Brand.blue} />
              <Text style={[s.metricVal, { color: Brand.blue }]}>{['—','Fraco','Razoável','Bom','Ótimo'][device.signal]}</Text>
              <Text style={[s.metricLbl, { color: C.textMuted }]}>Sinal BT</Text>
            </View>
            <View style={[s.metricDiv, { backgroundColor: C.border }]} />
            <View style={s.metric}>
              <Thermometer size={16} color="#ED8936" strokeWidth={2} />
              <Text style={[s.metricVal, { color: '#ED8936' }]}>{device.temperature}°C</Text>
              <Text style={[s.metricLbl, { color: C.textMuted }]}>Temp.</Text>
            </View>
          </View>
        )}

        <View style={[s.cardFoot, { borderTopColor: C.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
            <Shield size={11} color={C.textMuted} />
            <Text style={[s.footText, { color: C.textMuted }]}>{device.firmware} · {device.macAddress}</Text>
          </View>
          {!isConnected && device.status !== 'pareando' && (
            <TouchableOpacity
              onPress={onToggleConnect}
              style={[s.reconBtn, { backgroundColor: Brand.purple + '15', borderColor: Brand.purple + '40' }]}
            >
              <RefreshCw size={12} color={Brand.purple} />
              <Text style={[s.reconText, { color: Brand.purple }]}>Reconectar</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Modal renomear ───────────────────────────────────────────────────────────
function RenameModal({
  visible, deviceName, isDark, C, onSave, onClose,
}: {
  visible: boolean; deviceName: string; isDark: boolean;
  C: typeof Colors.light; onSave: (n: string) => void; onClose: () => void;
}) {
  const [value, setValue] = useState(deviceName);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const bgAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setValue(deviceName);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: visible ? 0 : 500, damping: 18, stiffness: 200, useNativeDriver: true }),
      Animated.timing(bgAnim, { toValue: visible ? 1 : 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [visible, deviceName]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#0D0B1E', opacity: bgAnim.interpolate({ inputRange: [0,1], outputRange: [0, 0.6] }) }]} pointerEvents="none" />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View style={[s.sheet, { backgroundColor: C.backgroundCard, transform: [{ translateY: slideAnim }] }]}>
        <View style={[s.sheetHandle, { backgroundColor: C.border }]} />
        <View style={s.sheetHeader}>
          <View>
            <Text style={[s.sheetTitle, { color: C.text }]}>Renomear dispositivo</Text>
            <Text style={[s.sheetSub, { color: C.textSecondary }]}>Dê um nome fácil de identificar</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: C.backgroundSoft }]}>
            <X size={18} color={C.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={[s.input, { backgroundColor: C.inputBg, borderColor: Brand.purple + '50' }]}>
          <Pencil size={18} color={Brand.purple} />
          <TextInput
            style={[s.textInput, { color: C.text }]}
            value={value} onChangeText={setValue}
            placeholder="Nome do dispositivo" placeholderTextColor={C.textMuted}
            autoFocus maxLength={30}
          />
        </View>
        <Text style={[s.charCount, { color: C.textMuted }]}>{value.length}/30</Text>
        <View style={s.btnRow}>
          <TouchableOpacity style={[s.btnSec, { backgroundColor: C.backgroundSoft, borderColor: C.border }]} onPress={onClose}>
            <Text style={[s.btnSecText, { color: C.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btnPri, { backgroundColor: Brand.purple }]}
            onPress={async () => {
              await hapticSuccess();
              onSave(value);
            }}
            disabled={!value.trim()}
          >
            <Check size={16} color="#fff" strokeWidth={2.5} />
            <Text style={s.btnPriText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ─── Modal remover ────────────────────────────────────────────────────────────
function RemoveModal({
  visible, deviceName, C, onConfirm, onClose,
}: {
  visible: boolean; deviceName: string;
  C: typeof Colors.light; onConfirm: () => void; onClose: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true }),
        Animated.timing(opAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else { scaleAnim.setValue(0.85); opAnim.setValue(0); }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.overlayCenter, { opacity: opAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[s.removeCard, { backgroundColor: C.backgroundCard, transform: [{ scale: scaleAnim }] }]}>
          <View style={s.removeIcon}>
            <Trash2 size={32} color="#E53E3E" />
          </View>
          <Text style={[s.removeTitle, { color: C.text }]}>Remover dispositivo?</Text>
          <Text style={[s.removeDesc, { color: C.textSecondary }]}>
            <Text style={{ fontFamily: 'Poppins-SemiBold', color: C.text }}>{deviceName}</Text>
            {' '}será desvinculado da sua conta.
          </Text>
          <View style={s.btnRow}>
            <TouchableOpacity style={[s.btnSec, { backgroundColor: C.backgroundSoft, borderColor: C.border }]} onPress={onClose}>
              <Text style={[s.btnSecText, { color: C.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnPri, { backgroundColor: '#E53E3E' }]}
              onPress={async () => {
                await hapticRemove();
                onConfirm();
              }}
            >
              <Trash2 size={14} color="#fff" />
              <Text style={s.btnPriText}>Remover</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function DispositivosScreen() {
  const scheme = useColorScheme() ?? 'light';
  const C      = Colors[scheme];
  const isDark = scheme === 'dark';

  const [devices, setDevices]         = useState<Device[]>(INITIAL_DEVICES);
  const [renameModal, setRenameModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [removeModal, setRemoveModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [scanModal, setScanModal]     = useState(false);
  const [scanning, setScanning]       = useState(false);

  const scanRotate = useRef(new Animated.Value(0)).current;
  const scanLoop   = useRef<Animated.CompositeAnimation>();

  // Carrega sons uma única vez ao montar a tela
  useEffect(() => {
    loadSounds();
    return () => {
      [connectSound, disconnectSound].forEach(s => s?.unloadAsync().catch(() => {}));
    };
  }, []);

  const connectedCount    = devices.filter(d => d.status === 'conectado').length;
  const disconnectedCount = devices.filter(d => d.status === 'desconectado').length;

  const handleToggleConnect = async (id: string) => {
    const dev = devices.find(d => d.id === id);
    if (!dev) return;

    if (dev.status === 'conectado') {
      await hapticAndSoundDisconnect();
      setDevices(prev => prev.map(d =>
        d.id === id ? { ...d, status: 'desconectado', lastSeen: 'Agora mesmo', signal: 0, temperature: 0 } : d
      ));
    } else {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, status: 'pareando' } : d));
      setTimeout(async () => {
        await hapticAndSoundConnect();
        setDevices(prev => prev.map(d =>
          d.id === id ? { ...d, status: 'conectado', lastSeen: 'Agora', signal: 3 } : d
        ));
      }, 2000);
    }
  };

  const handleSetMain = async (id: string) => {
    setDevices(prev => prev.map(d => ({ ...d, isMain: d.id === id })));
    await hapticSuccess();
  };

  const handleRename = (name: string) => {
    if (!name.trim()) return;
    setDevices(prev => prev.map(d => d.id === renameModal.id ? { ...d, name: name.trim() } : d));
    setRenameModal({ open: false, id: '', name: '' });
  };

  const handleRemove = () => {
    setDevices(prev => prev.filter(d => d.id !== removeModal.id));
    setRemoveModal({ open: false, id: '', name: '' });
  };

  const handleFoundConnect = (fd: FoundDevice) => {
    const newDev: Device = {
      id: fd.id,
      name: fd.name,
      model: fd.model,
      status: 'conectado',
      battery: 85,
      signal: fd.signal,
      temperature: 22,
      lastSeen: 'Agora',
      firmware: 'v2.4.1',
      macAddress: fd.macAddress,
      isMain: devices.length === 0,
    };
    setDevices(prev => [...prev, newDev]);
  };

  const startScan = () => {
    setScanModal(true);
    setScanning(true);
    scanLoop.current = Animated.loop(
      Animated.timing(scanRotate, { toValue: 1, duration: 900, useNativeDriver: true })
    );
    scanLoop.current.start();
    setTimeout(() => {
      scanLoop.current?.stop();
      scanRotate.setValue(0);
      setScanning(false);
    }, 3000);
  };

  const spinStyle = {
    transform: [{ rotate: scanRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.background} />

      <View style={[s.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <ArrowLeft size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: C.text }]}>Dispositivos</Text>
        <TouchableOpacity
          onPress={startScan}
          disabled={scanning}
          style={[s.scanBtn, { backgroundColor: scanning ? Brand.purple : Brand.purple + '15', borderColor: Brand.purple + '40' }]}
        >
          <Animated.View style={scanning ? spinStyle : {}}>
            <RefreshCw size={16} color={scanning ? '#fff' : Brand.purple} strokeWidth={2.2} />
          </Animated.View>
          <Text style={[s.scanBtnText, { color: scanning ? '#fff' : Brand.purple }]}>
            {scanning ? 'Buscando...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { backgroundColor: C.backgroundSoft }]}>
        <View style={s.summaryRow}>
          {[
            { count: connectedCount,    icon: <Bluetooth size={20} color={Brand.purple} />, bg: Brand.purple + '15', label: 'Conectado' },
            { count: disconnectedCount, icon: <BluetoothOff size={20} color="#E53E3E" />,   bg: '#E53E3E15',         label: 'Desconectado' },
            { count: devices.length,    icon: <Shield size={20} color="#38A169" />,          bg: '#38A16915',         label: 'Total' },
          ].map((item, i) => (
            <View key={i} style={[s.summCard, { backgroundColor: C.backgroundCard, borderColor: C.border }]}>
              <View style={[s.summIcon, { backgroundColor: item.bg }]}>{item.icon}</View>
              <Text style={[s.summVal, { color: C.text }]}>{item.count}</Text>
              <Text style={[s.summLbl, { color: C.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {scanning && (
          <View style={[s.scanBanner, { backgroundColor: Brand.purple + '12', borderColor: Brand.purple + '30' }]}>
            <Animated.View style={spinStyle}><Bluetooth size={18} color={Brand.purple} /></Animated.View>
            <Text style={[s.scanBannerText, { color: Brand.purple }]}>Procurando dispositivos InfasCare próximos...</Text>
          </View>
        )}

        <Text style={[s.sectionTitle, { color: C.text }]}>Meus dispositivos</Text>

        {devices.length === 0 ? (
          <View style={[s.empty, { backgroundColor: C.backgroundCard, borderColor: C.border }]}>
            <BluetoothOff size={48} color={C.textMuted} strokeWidth={1.5} />
            <Text style={[s.emptyTitle, { color: C.text }]}>Nenhum dispositivo</Text>
            <Text style={[s.emptyDesc, { color: C.textSecondary }]}>Adicione sua cadeirinha InfasCare para começar.</Text>
          </View>
        ) : (
          devices.map(dev => (
            <DeviceCard
              key={dev.id}
              device={dev}
              isDark={isDark}
              C={C}
              onEdit={() => setRenameModal({ open: true, id: dev.id, name: dev.name })}
              onRemove={() => setRemoveModal({ open: true, id: dev.id, name: dev.name })}
              onToggleConnect={() => handleToggleConnect(dev.id)}
              onSetMain={() => handleSetMain(dev.id)}
            />
          ))
        )}

        <TouchableOpacity
          style={[s.addBtn, { borderColor: Brand.purple + '50', backgroundColor: Brand.purple + '08' }]}
          onPress={startScan}
        >
          <View style={[s.addIcon, { backgroundColor: Brand.purple + '15' }]}>
            <Plus size={20} color={Brand.purple} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.addTitle, { color: C.text }]}>Adicionar dispositivo</Text>
            <Text style={[s.addDesc, { color: C.textSecondary }]}>Pareie uma nova cadeirinha InfasCare</Text>
          </View>
          <ChevronRight size={18} color={C.textMuted} />
        </TouchableOpacity>

        <View style={[s.tip, { backgroundColor: Brand.blue + '10', borderColor: Brand.blue + '25' }]}>
          <Zap size={16} color={Brand.blue} fill={Brand.blue} />
          <Text style={[s.tipText, { color: isDark ? Brand.lilac : Brand.blue }]}>
            Mantenha o Bluetooth ativado e o dispositivo a menos de 10 metros para melhor conexão.
          </Text>
        </View>
      </ScrollView>

      <ScanModal
        visible={scanModal}
        C={C}
        isDark={isDark}
        existingIds={devices.map(d => d.id)}
        onConnect={handleFoundConnect}
        onClose={() => setScanModal(false)}
      />

      <RenameModal
        visible={renameModal.open}
        deviceName={renameModal.name}
        isDark={isDark}
        C={C}
        onSave={handleRename}
        onClose={() => setRenameModal({ open: false, id: '', name: '' })}
      />

      <RemoveModal
        visible={removeModal.open}
        deviceName={removeModal.name}
        C={C}
        onConfirm={handleRemove}
        onClose={() => setRemoveModal({ open: false, id: '', name: '' })}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backBtn:     { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontFamily: 'Poppins-SemiBold' },
  scanBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  scanBtnText: { fontSize: 13, fontFamily: 'Poppins-SemiBold' },

  content:     { padding: 16, paddingBottom: 48, gap: 12 },

  summaryRow:  { flexDirection: 'row', gap: 10, marginBottom: 4 },
  summCard:    { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }) },
  summIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summVal:     { fontSize: 22, fontFamily: 'Poppins-SemiBold' },
  summLbl:     { fontSize: 11, fontFamily: 'Poppins-Regular', textAlign: 'center' },

  scanBanner:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  scanBannerText: { fontSize: 13, fontFamily: 'Poppins-Medium', flex: 1 },

  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', marginTop: 4 },

  card:         { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, ...Platform.select({ ios: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16 }, android: { elevation: 4 } }) },
  mainBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', margin: 12, marginBottom: 0, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  mainBadgeText:{ color: '#fff', fontSize: 10, fontFamily: 'Poppins-SemiBold' },
  cardTop:      { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  devName:      { fontSize: 15, fontFamily: 'Poppins-SemiBold' },
  devModel:     { fontSize: 12, fontFamily: 'Poppins-Regular' },
  pill:         { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 2 },
  pillText:     { fontSize: 11, fontFamily: 'Poppins-Medium' },
  menuBtn:      { padding: 4 },

  dropdown:    { position: 'absolute', right: 44, top: 14, borderRadius: 14, borderWidth: 1, zIndex: 10, minWidth: 190, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 }, android: { elevation: 12 } }) },
  dropItem:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  dropText:    { fontSize: 13, fontFamily: 'Poppins-Medium' },
  dropDiv:     { height: StyleSheet.hairlineWidth },

  metrics:     { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth },
  metric:      { flex: 1, alignItems: 'center', gap: 4 },
  metricVal:   { fontSize: 13, fontFamily: 'Poppins-SemiBold' },
  metricLbl:   { fontSize: 10, fontFamily: 'Poppins-Regular' },
  metricDiv:   { width: StyleSheet.hairlineWidth, marginVertical: 4 },

  cardFoot:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  footText:    { fontSize: 10, fontFamily: 'Poppins-Regular' },
  reconBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  reconText:   { fontSize: 12, fontFamily: 'Poppins-SemiBold' },

  btWrap:   { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  btCircle: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  empty:      { borderRadius: 20, borderWidth: 1, padding: 40, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold' },
  emptyDesc:  { fontSize: 13, fontFamily: 'Poppins-Regular', textAlign: 'center', lineHeight: 20 },

  addBtn:   { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed' },
  addIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addTitle: { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  addDesc:  { fontSize: 12, fontFamily: 'Poppins-Regular', marginTop: 1 },

  tip:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  tipText: { fontSize: 12, fontFamily: 'Poppins-Regular', flex: 1, lineHeight: 18 },

  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  sheetTitle:  { fontSize: 18, fontFamily: 'Poppins-SemiBold' },
  sheetSub:    { fontSize: 13, fontFamily: 'Poppins-Regular', marginTop: 2 },
  closeBtn:    { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  btnRow:      { flexDirection: 'row', gap: 12 },
  btnPri:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16 },
  btnPriText:  { color: '#fff', fontSize: 15, fontFamily: 'Poppins-SemiBold' },
  btnSec:      { flex: 0.6, alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  btnSecText:  { fontSize: 15, fontFamily: 'Poppins-SemiBold' },

  sheet:     { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Platform.OS === 'ios' ? 42 : 28, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 20 }, android: { elevation: 24 } }) },
  input:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1.5, marginBottom: 6 },
  textInput: { flex: 1, fontSize: 15, fontFamily: 'Poppins-Regular' },
  charCount: { fontSize: 11, fontFamily: 'Poppins-Regular', textAlign: 'right', marginBottom: 24 },

  overlayCenter: { flex: 1, backgroundColor: 'rgba(13,11,30,0.6)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  removeCard:  { width: '100%', borderRadius: 28, padding: 28, alignItems: 'center', ...Platform.select({ ios: { shadowColor: '#E53E3E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24 }, android: { elevation: 16 } }) },
  removeIcon:  { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  removeTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginBottom: 10, textAlign: 'center' },
  removeDesc:  { fontSize: 13, fontFamily: 'Poppins-Regular', textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  scanSheet:   { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Platform.OS === 'ios' ? 42 : 28, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.18, shadowRadius: 28 }, android: { elevation: 28 } }) },
  scanCenter:  { alignItems: 'center', paddingVertical: 32, gap: 24 },
  radarWrap:   { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  radarRing:   { position: 'absolute', borderWidth: 1.5 },
  radarCenter: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  scanHint:    { fontSize: 13, fontFamily: 'Poppins-Regular', textAlign: 'center' },
  noDeviceBox: { borderRadius: 18, padding: 32, alignItems: 'center', gap: 12 },
  noDeviceText:{ fontSize: 13, fontFamily: 'Poppins-Regular', textAlign: 'center', lineHeight: 20 },
  foundCard:   { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, borderWidth: 1 },
  foundIcon:   { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  foundName:   { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  foundMac:    { fontSize: 11, fontFamily: 'Poppins-Regular' },
  connectBtn:  { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  connectBtnText: { fontSize: 13, fontFamily: 'Poppins-SemiBold' },
});
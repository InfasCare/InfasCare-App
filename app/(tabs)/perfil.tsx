import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useI18n } from '@/contexts/I18nContext';

if (Platform.OS === 'android') {
  const AndroidUIManager = UIManager as unknown as {
    setLayoutAnimationEnabled?: (enabled: boolean) => void;
  };

  AndroidUIManager.setLayoutAnimationEnabled?.(true);
}

type PerfilData = {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  responsavel: string;
};

export default function Perfil() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  // Dados reais da conta (Auth + coleção "usuarios"); nada de dados de exemplo.
  const [perfil, setPerfil] = useState<PerfilData>({
    nome: user?.displayName ?? '',
    email: user?.email ?? '',
    telefone: '',
    endereco: '',
    responsavel: 'Responsável principal',
  });

  useEffect(() => {
    if (!user) return;
    let ativo = true;
    getDoc(doc(db, 'usuarios', user.uid))
      .then((snap) => {
        if (!ativo || !snap.exists()) return;
        const d = snap.data();
        setPerfil((atual) => ({
          ...atual,
          nome: d.nome ?? atual.nome,
          telefone: d.telefone ?? '',
          endereco: d.endereco ?? '',
        }));
      })
      .catch((error) => console.error('Erro ao carregar perfil (InfasCare):', error));
    return () => { ativo = false; };
  }, [user]);

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(perfil);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [mostrarToast, setMostrarToast] = useState(false);

  const modalAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;

  function abrirEdicao() {
    setForm(perfil);
    setEditando(true);
  }

  function fecharEdicao() {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setEditando(false));
  }

  async function salvarPerfil() {
    if (!user) return;
    try {
      // Persiste no Firestore (antes a edição só valia até fechar o app)
      await setDoc(
        doc(db, 'usuarios', user.uid),
        { nome: form.nome.trim(), telefone: form.telefone.trim(), endereco: form.endereco.trim() },
        { merge: true },
      );
    } catch (error) {
      console.error('Erro ao salvar perfil (InfasCare):', error);
      return;
    }
    setPerfil({ ...form, email: perfil.email });
    fecharEdicao();

    setMostrarToast(true);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setMostrarToast(false));
  }

  function alternarInfo() {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        260,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );
    setMostrarInfo((atual) => !atual);
  }

  async function sair() {
    // O AuthGate (app/_layout.tsx) detecta o logout e redireciona para (auth)
    await logout();
  }

  useEffect(() => {
    if (editando) {
      modalAnim.setValue(0);
      Animated.spring(modalAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start();
    }
  }, [editando]);

  const modalTranslateY = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 0],
  });

  const toastTranslateY = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundSoft }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <FadeSlideIn delay={0}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: theme.text }]}>{t('profile_title')}</Text>

            <TouchableOpacity onPress={abrirEdicao}>
              <Ionicons name="pencil" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={70}>
          <View style={styles.profileCard}>
            <AnimatedAvatar />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{perfil.nome}</Text>
              <Text style={styles.email}>{perfil.email}</Text>
            </View>

            <PressScale onPress={abrirEdicao} style={styles.editCircle}>
              <Ionicons name="create-outline" size={18} color="#7B4DFF" />
            </PressScale>
          </View>
        </FadeSlideIn>

        <View style={styles.quickInfo}>
          <FadeSlideIn delay={140} style={{ flex: 1 }}>
            <InfoBox icon="shield-checkmark-outline" title={t('profile_status')} value={t('profile_secure')} theme={theme} />
          </FadeSlideIn>

          <FadeSlideIn delay={200} style={{ flex: 1 }}>
            <InfoBox icon="heart-outline" title={t('profile_account')} value={t('profile_active')} theme={theme} />
          </FadeSlideIn>
        </View>

        <View style={styles.menu}>
          <FadeSlideIn delay={250}>
            <MenuItem
              icon="person-outline"
              title={t('profile_myProfile')}
              onPress={alternarInfo}
              theme={theme}
              expanded={mostrarInfo}
            />
          </FadeSlideIn>

          {mostrarInfo && (
            <View style={[styles.infoCard, { backgroundColor: theme.backgroundCard }]}>
              <Detail icon="person" label={t('profile_name')} value={perfil.nome} theme={theme} />
              <Detail icon="mail" label={t('profile_email')} value={perfil.email} theme={theme} />
              <Detail icon="call" label={t('profile_phone')} value={perfil.telefone || '—'} theme={theme} />
              <Detail icon="location" label={t('profile_address')} value={perfil.endereco || '—'} theme={theme} />
              <Detail icon="star" label={t('profile_type')} value={perfil.responsavel} theme={theme} />
            </View>
          )}

          <FadeSlideIn delay={300}>
            <MenuItem
              icon="people-outline"
              title={t('profile_registeredChildren')}
              onPress={() => router.push('/(settings)/criancas')}
              theme={theme}
            />
          </FadeSlideIn>

          <FadeSlideIn delay={340}>
            <MenuItem
              icon="people-circle-outline"
              title={t('profile_registeredCaregivers')}
              onPress={() => router.push('/(settings)/responsaveis')}
              theme={theme}
            />
          </FadeSlideIn>

          <FadeSlideIn delay={380}>
            <MenuItem
              icon="bluetooth-outline"
              title={t('profile_connectedDevices')}
              onPress={() => router.push('/(settings)/dispositivos')}
              theme={theme}
            />
          </FadeSlideIn>

          <FadeSlideIn delay={420}>
            <MenuItem
              icon="settings-outline"
              title={t('settings')}
              onPress={() => router.push('/(settings)/configuracoes')}
              theme={theme}
            />
          </FadeSlideIn>

          <FadeSlideIn delay={460}>
            <MenuItem
              icon="information-circle-outline"
              title={t('aboutApp')}
              onPress={() => router.push('/(settings)/sobre')}
              theme={theme}
            />
          </FadeSlideIn>
        </View>

        <FadeSlideIn delay={510}>
          <PressScale onPress={sair} style={[styles.logoutButton, { backgroundColor: theme.backgroundCard }]} scaleTo={0.97}>
            <Ionicons name="log-out-outline" size={19} color="#FF4D4D" />
            <Text style={styles.logoutText}>{t('profile_logout')}</Text>
          </PressScale>
        </FadeSlideIn>
      </ScrollView>

      <Modal visible={editando} transparent animationType="none" onRequestClose={fecharEdicao}>
        <Animated.View style={[styles.modalOverlay, { opacity: modalAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={fecharEdicao} />

          <Animated.View
            style={[
              styles.modalBox,
              { backgroundColor: theme.backgroundCard, transform: [{ translateY: modalTranslateY }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('profile_editTitle')}</Text>

              <TouchableOpacity onPress={fecharEdicao}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Input
              label={t('profile_name')}
              value={form.nome}
              onChangeText={(v: string) => setForm({ ...form, nome: v })}
              theme={theme}
            />

            <Input
              label={t('profile_email')}
              value={form.email}
              onChangeText={(v: string) => setForm({ ...form, email: v })}
              theme={theme}
            />

            <Input
              label={t('profile_phone')}
              value={form.telefone}
              onChangeText={(v: string) => setForm({ ...form, telefone: v })}
              theme={theme}
            />

            <Input
              label={t('profile_address')}
              value={form.endereco}
              onChangeText={(v: string) => setForm({ ...form, endereco: v })}
              theme={theme}
            />

            <PressScale onPress={salvarPerfil} style={styles.saveButton} scaleTo={0.97}>
              <Text style={styles.saveText}>{t('profile_saveChanges')}</Text>
            </PressScale>
          </Animated.View>
        </Animated.View>
      </Modal>

      {mostrarToast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              backgroundColor: theme.backgroundCard,
              opacity: toastAnim,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <View style={styles.toastIcon}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
          <Text style={[styles.toastText, { color: theme.text }]}>{t('profile_updated')}</Text>
        </Animated.View>
      )}
    </View>
  );
}

function FadeSlideIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 460,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

function PressScale({
  children,
  onPress,
  style,
  scaleTo = 0.96,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  scaleTo?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: scaleTo,
          useNativeDriver: true,
          friction: 6,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }).start()
      }
      onPress={onPress}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

function AnimatedAvatar() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  return (
    <View style={styles.avatarWrapper}>
      <Animated.View style={[styles.avatarPulse, { opacity, transform: [{ scale }] }]} />
      <View style={styles.avatar}>
        <Ionicons name="person" size={34} color="#8B5CF6" />
      </View>
      <View style={styles.onlineDot} />
    </View>
  );
}

function MenuItem({
  icon,
  title,
  onPress,
  theme,
  expanded,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
  theme: any;
  expanded?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    if (expanded === undefined) return;

    Animated.spring(rotate, {
      toValue: expanded ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [expanded]);

  const rotateDeg = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.97,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start()
      }
      onPress={onPress}
    >
      <Animated.View style={[styles.menuItem, { backgroundColor: theme.backgroundCard, transform: [{ scale }] }]}>
        <View style={styles.menuLeft}>
          <Ionicons name={icon} size={19} color={theme.icon} />
          <Text style={[styles.menuText, { color: theme.text }]}>{title}</Text>
        </View>

        <Animated.View style={{ transform: [{ rotate: rotateDeg }] }}>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function InfoBox({
  icon,
  title,
  value,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={[styles.infoBox, { backgroundColor: theme.backgroundCard }]}>
      <Ionicons name={icon} size={22} color="#7B4DFF" />
      <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>{title}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function Detail({
  icon,
  label,
  value,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={18} color="#7B4DFF" />
      <View>
        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function Input({
  label,
  value,
  onChangeText,
  theme,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  theme: any;
}) {
  const [focado, setFocado] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focado ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [focado]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.borderInput ?? 'transparent', '#7B4DFF'],
  });

  return (
    <View style={styles.inputArea}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Animated.View style={[styles.inputBorder, { borderColor }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={theme.textMuted}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 58,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },

  profileCard: {
    minHeight: 92,
    borderRadius: 18,
    backgroundColor: '#7B4DFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#7B4DFF',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  avatarWrapper: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  avatarPulse: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#7B4DFF',
  },

  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },

  email: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#E8DEFF',
    marginTop: 2,
  },

  editCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  infoBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    elevation: 1,
  },

  infoTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginTop: 6,
  },

  infoValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },

  menu: {
    gap: 13,
  },

  menuItem: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  menuText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },

  infoCard: {
    borderRadius: 18,
    padding: 16,
    gap: 14,
    marginTop: -4,
  },

  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  detailLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
  },

  detailValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },

  logoutButton: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    marginBottom: 36,
  },

  logoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#FF4D4D',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 22, 77, 0.35)',
    justifyContent: 'flex-end',
  },

  modalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 14,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },

  inputArea: {
    gap: 6,
  },

  inputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },

  inputBorder: {
    borderRadius: 14,
    borderWidth: 1.5,
  },

  input: {
    height: 48,
    borderRadius: 12.5,
    paddingHorizontal: 14,
    fontFamily: 'Poppins-Regular',
  },

  saveButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  saveText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  toast: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#21164D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },

  toastIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
  },

  toastText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
});

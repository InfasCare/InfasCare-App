import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, Platform, ScrollView,
  Modal, Animated, Easing, useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, Check, ArrowLeft, AlertCircle } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import AnimatedRN, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  Easing as REasing,
} from 'react-native-reanimated';
import { Colors, Brand } from '@/constants/theme';

// ─── Custom Alert de erro ─────────────────────────────────────────────────────
function ErrorAlert({ visible, title, message, onClose, C }) {
  const scaleAnim   = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim,   { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[eStyles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[eStyles.card, { backgroundColor: C.backgroundCard, transform: [{ scale: scaleAnim }] }]}>
          <View style={eStyles.iconWrap}>
            <AlertCircle size={40} color={Brand.error} />
          </View>
          <View style={eStyles.badge}>
            <Text style={eStyles.badgeText}>⚠ ATENÇÃO</Text>
          </View>
          <Text style={[eStyles.title, { color: C.text }]}>{title}</Text>
          <Text style={[eStyles.message, { color: C.textSecondary }]}>{message}</Text>
          <View style={eStyles.btnRow}>
            <TouchableOpacity style={[eStyles.btnSecondary, { backgroundColor: C.backgroundSoft }]} onPress={onClose}>
              <Text style={[eStyles.btnSecondaryText, { color: Brand.purple }]}>Revisar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={eStyles.btnPrimary} onPress={onClose}>
              <Text style={eStyles.btnPrimaryText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const eStyles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(20,10,40,0.55)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card:           { borderRadius: 28, padding: 28, width: '100%', maxWidth: 340, alignItems: 'center', shadowColor: Brand.error, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 18 },
  iconWrap:       { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  badge:          { backgroundColor: '#FFF0F0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 12 },
  badgeText:      { color: Brand.error, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  title:          { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  message:        { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  btnRow:         { flexDirection: 'row', gap: 10, width: '100%' },
  btnPrimary:     { flex: 1, backgroundColor: Brand.error, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary:   { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600' },
});

// ─── Tela de Login ────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];
  const isDark = scheme === 'dark';

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,  setRememberMe]  = useState(false);
  const [errors,      setErrors]      = useState<any>({});
  const [errorAlert,  setErrorAlert]  = useState({ visible: false, title: '', message: '' });
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  const offset = useSharedValue(0);
  useEffect(() => {
    offset.value = withRepeat(
      withTiming(100, { duration: 4000, easing: REasing.linear }), -1, true,
    );
  }, []);
  const animatedWaveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -offset.value }],
  }));

  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim  = useRef(new Animated.Value(0)).current;
  const ripple2Anim = useRef(new Animated.Value(0)).current;
  const floatAnim   = useRef(new Animated.Value(0)).current;
  const barAnim     = useRef(new Animated.Value(0)).current;
  const sparkAnim   = useRef(new Animated.Value(0)).current;

  const runModalAnimations = () => {
    [scaleAnim, opacityAnim, rippleAnim, ripple2Anim, floatAnim, barAnim, sparkAnim]
      .forEach(a => a.setValue(0));
    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.timing(rippleAnim,  { toValue: 1, duration: 1800, delay: 500, easing: Easing.out(Easing.ease), useNativeDriver: true })).start();
    Animated.loop(Animated.timing(ripple2Anim, { toValue: 1, duration: 1800, delay: 900, easing: Easing.out(Easing.ease), useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -8, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0,  duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
    Animated.timing(barAnim, { toValue: 1, duration: 2000, delay: 800, easing: Easing.linear, useNativeDriver: false }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(sparkAnim, { toValue: 1, duration: 600, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(sparkAnim, { toValue: 0, duration: 600, easing: Easing.linear, useNativeDriver: true }),
    ])).start();
  };

  const rippleScale    = rippleAnim.interpolate({ inputRange: [0,1], outputRange: [1, 2.4] });
  const rippleOpacity  = rippleAnim.interpolate({ inputRange: [0,1], outputRange: [0.5, 0] });
  const ripple2Scale   = ripple2Anim.interpolate({ inputRange: [0,1], outputRange: [1, 2.4] });
  const ripple2Opacity = ripple2Anim.interpolate({ inputRange: [0,1], outputRange: [0.4, 0] });
  const barWidth       = barAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] });
  const spark1Opacity  = sparkAnim.interpolate({ inputRange: [0,0.5,1], outputRange: [0,1,0] });
  const spark2Opacity  = sparkAnim.interpolate({ inputRange: [0,0.3,0.6,1], outputRange: [0,0,1,0] });

  function validate() {
    const e: any = {};
    if (!email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido';
    if (!password) e.password = 'Senha é obrigatória';
    else if (password.length < 6) e.password = 'Mínimo de 6 caracteres';
    return e;
  }

  function handleLogin() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = Object.keys(e)[0] as any;
      const msgs: any = { email: e.email, password: e.password };
      setErrorAlert({ visible: true, title: 'Campos incompletos', message: msgs[first] });
      return;
    }
    setSuccessModalVisible(true);
    runModalAnimations();
    setTimeout(() => { setSuccessModalVisible(false); router.push('/(tabs)'); }, 3000);
  }

  // Cor da onda: modo escuro usa roxo translúcido
  const waveColor = isDark ? 'rgba(106,90,224,0.25)' : '#EBE9FF';
  const gradientColor = isDark ? '#2D1F6E' : '#C4B5FD';

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <ErrorAlert
        visible={errorAlert.visible}
        title={errorAlert.title}
        message={errorAlert.message}
        onClose={() => setErrorAlert(a => ({ ...a, visible: false }))}
        C={C}
      />

      {/* Modal de sucesso */}
      <Modal visible={isSuccessModalVisible} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { backgroundColor: C.backgroundCard, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
            <Animated.View style={[styles.iconWrap, { transform: [{ translateY: floatAnim }] }]}>
              <Animated.View style={[styles.rippleRing,  { transform: [{ scale: rippleScale  }], opacity: rippleOpacity  }]} />
              <Animated.View style={[styles.rippleRing2, { transform: [{ scale: ripple2Scale }], opacity: ripple2Opacity }]} />
              <View style={styles.iconCircle}>
                <Check size={40} color="#fff" strokeWidth={3} />
              </View>
              <Animated.View style={[styles.spark, styles.spark1, { opacity: spark1Opacity }]} />
              <Animated.View style={[styles.spark, styles.spark2, { opacity: spark2Opacity }]} />
              <Animated.View style={[styles.spark, styles.spark3, { opacity: spark1Opacity }]} />
              <Animated.View style={[styles.spark, styles.spark4, { opacity: spark2Opacity }]} />
            </Animated.View>
            <View style={[styles.modalTag, { backgroundColor: C.accentSoft }]}>
              <Text style={[styles.modalTagText, { color: isDark ? Brand.lilac : '#534AB7' }]}>LOGIN EFETUADO</Text>
            </View>
            <Text style={[styles.modalTitle, { color: C.text }]}>Bem-vindo de volta!</Text>
            <Text style={[styles.modalSub, { color: C.textSecondary }]}>Sua conta foi verificada com sucesso. Redirecionando...</Text>
            <View style={[styles.barWrap, { backgroundColor: C.backgroundSoft }]}>
              <Animated.View style={[styles.bar, { width: barWidth }]} />
            </View>
            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, { backgroundColor: C.border }]} />
            </View>
          </Animated.View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={Brand.purple} />
      </TouchableOpacity>

      {/* Fundo decorativo inferior */}
      <View style={[styles.gradientBackground, { backgroundColor: gradientColor }]} />
      <View style={styles.waveLayer}>
        <AnimatedRN.View style={[styles.waveWrapper, animatedWaveStyle]}>
          <Svg width="200%" height="200" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <Path
              fill={waveColor}
              d="M0,192L48,176C96,160,192,128,288,144C384,160,480,224,576,213.3C672,203,768,139,864,122.7C960,107,1056,149,1152,170.7C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </Svg>
        </AnimatedRN.View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/icone2.png')} style={styles.logo} />
            <Text style={styles.logoText}>
              <Text style={{ color: Brand.purple, fontFamily: 'Poppins-SemiBold' }}>Infas</Text>
              <Text style={{ color: Brand.blue,   fontFamily: 'Poppins-SemiBold' }}>Care</Text>
            </Text>
            <Text style={[styles.subtitle, { color: C.textSecondary }]}>
              Segurança e cuidado que conectam você ao que mais importa.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: C.backgroundCard, shadowColor: Brand.purple, borderColor: C.border, borderWidth: isDark ? 1 : 0 }]}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Entrar</Text>
            <Text style={[styles.cardSubtitle, { color: C.textSecondary }]}>Acesse sua conta</Text>

            {/* E-mail */}
            <View style={[styles.inputWrapper, { borderColor: errors.email ? Brand.error : C.borderInput, backgroundColor: errors.email ? '#FFF7F7' : C.inputBg }]}>
              <Mail size={20} color={errors.email ? Brand.error : Brand.purple} />
              <TextInput
                placeholder="E-mail" placeholderTextColor={C.textMuted}
                style={[styles.input, { color: C.text }]}
                keyboardType="email-address" autoCapitalize="none"
                value={email}
                onChangeText={v => { setEmail(v); setErrors((e: any) => ({ ...e, email: undefined })); }}
              />
            </View>
            {!!errors.email && (
              <View style={styles.errorRow}>
                <AlertCircle size={13} color={Brand.error} />
                <Text style={styles.errorText}>{errors.email}</Text>
              </View>
            )}

            {/* Senha */}
            <View style={[styles.inputWrapper, { borderColor: errors.password ? Brand.error : C.borderInput, backgroundColor: errors.password ? '#FFF7F7' : C.inputBg }]}>
              <Lock size={20} color={errors.password ? Brand.error : Brand.purple} />
              <TextInput
                placeholder="Senha" placeholderTextColor={C.textMuted}
                style={[styles.input, { color: C.text }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={v => { setPassword(v); setErrors((e: any) => ({ ...e, password: undefined })); }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color={Brand.purple} /> : <Eye size={20} color={Brand.purple} />}
              </TouchableOpacity>
            </View>
            {!!errors.password && (
              <View style={styles.errorRow}>
                <AlertCircle size={13} color={Brand.error} />
                <Text style={styles.errorText}>{errors.password}</Text>
              </View>
            )}

            <View style={styles.row}>
              <TouchableOpacity style={styles.checkboxArea} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, { borderColor: C.border }, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Check size={14} color="#fff" />}
                </View>
                <Text style={[styles.rememberText, { color: C.textSecondary }]}>Lembrar-me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.forgotPassword, { color: Brand.purple }]}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: Brand.purple }]} onPress={handleLogin}>
              <Text style={styles.buttonTextPrimary}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonSecondary, { borderColor: Brand.purple }]} onPress={() => router.push('/(auth)/cadastro')}>
              <Text style={[styles.buttonTextSecondary, { color: Brand.purple }]}>Criar conta</Text>
            </TouchableOpacity>
          </View>

          <Image source={require('../../assets/images/icon_cadeirinhaLado.png')} style={styles.cadeirinha} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1 },
  backButton:           { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 10 },
  gradientBackground:   { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', zIndex: 0 },
  waveLayer:            { position: 'absolute', bottom: '40%', width: '100%', height: 200, zIndex: 1 },
  waveWrapper:          { width: '200%' },
  contentContainer:     { flex: 1, zIndex: 2 },
  scrollContent:        { padding: 20, paddingTop: 60, alignItems: 'center' },
  logoContainer:        { alignItems: 'center', marginBottom: 20 },
  logo:                 { width: 110, height: 69 },
  logoText:             { fontSize: 24, fontFamily: 'Poppins-SemiBold' },
  subtitle:             { textAlign: 'center', fontFamily: 'Poppins-Regular', fontSize: 13, marginTop: 5, width: 220 },
  card:                 { width: '100%', borderRadius: 24, padding: 24, elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  cardTitle:            { fontSize: 20, fontFamily: 'Poppins-SemiBold', textAlign: 'center' },
  cardSubtitle:         { fontFamily: 'Poppins-Regular', textAlign: 'center', marginBottom: 20 },
  inputWrapper:         { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 15, height: 55, marginBottom: 6 },
  input:                { flex: 1, marginLeft: 10, fontSize: 16, fontFamily: 'Poppins-Regular' },
  errorRow:             { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10, marginLeft: 4 },
  errorText:            { fontSize: 12, color: Brand.error, fontFamily: 'Poppins-Regular', flex: 1 },
  row:                  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 6 },
  checkboxArea:         { flexDirection: 'row', alignItems: 'center' },
  checkbox:             { width: 20, height: 20, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxActive:       { backgroundColor: Brand.purple, borderColor: Brand.purple },
  rememberText:         { marginLeft: 8, fontFamily: 'Poppins-Regular', fontSize: 14 },
  forgotPassword:       { fontFamily: 'Poppins-SemiBold', fontSize: 14 },
  buttonPrimary:        { padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  buttonTextPrimary:    { color: '#fff', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  buttonSecondary:      { borderWidth: 1.5, padding: 18, borderRadius: 16, alignItems: 'center' },
  buttonTextSecondary:  { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  cadeirinha:           { width: 182, height: 130, alignSelf: 'center', marginTop: 30 },
  modalOverlay:         { flex: 1, backgroundColor: 'rgba(106,90,224,0.20)', justifyContent: 'center', alignItems: 'center' },
  modalCard:            { width: '82%', borderRadius: 28, padding: 32, alignItems: 'center', shadowColor: Brand.purple, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 16 },
  iconWrap:             { width: 90, height: 90, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  rippleRing:           { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: Brand.purple },
  rippleRing2:          { position: 'absolute', width: 106, height: 106, borderRadius: 53, borderWidth: 2, borderColor: Brand.lilac, top: -8, left: -8 },
  iconCircle:           { width: 90, height: 90, borderRadius: 45, backgroundColor: Brand.purple, alignItems: 'center', justifyContent: 'center' },
  spark:                { position: 'absolute', width: 9, height: 9, borderRadius: 5 },
  spark1:               { backgroundColor: Brand.purple, top: -4,  left: 41 },
  spark2:               { backgroundColor: Brand.blue,   top: 41,  right: -4 },
  spark3:               { backgroundColor: Brand.lilac,  bottom: -4, left: 41 },
  spark4:               { backgroundColor: Brand.purple, top: 41,  left: -4 },
  modalTag:             { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 12 },
  modalTagText:         { fontSize: 11, fontFamily: 'Poppins-SemiBold', letterSpacing: 1 },
  modalTitle:           { fontFamily: 'Poppins-SemiBold', fontSize: 22, marginBottom: 8, textAlign: 'center' },
  modalSub:             { fontFamily: 'Poppins-Regular', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  barWrap:              { width: '100%', height: 6, borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  bar:                  { height: 6, borderRadius: 8, backgroundColor: Brand.purple },
  dots:                 { flexDirection: 'row', gap: 6 },
  dot:                  { width: 7, height: 7, borderRadius: 4 },
  dotActive:            { backgroundColor: Brand.purple },
});
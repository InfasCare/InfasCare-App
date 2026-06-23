import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Switch,
  Linking, Animated, Modal, Easing, useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextInputMask } from 'react-native-masked-text';
import { Colors, Brand } from '@/constants/theme';

// ─── Partícula de confetti ────────────────────────────────────────────────────
function Particle({ color, startX, delay, size = 8 }) {
  const y = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 80;
    const loop = () => {
      y.setValue(0); x.setValue(0); opacity.setValue(0); rotate.setValue(0); scale.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1, duration: 300, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
          Animated.timing(y,       { toValue: 180, duration: 1800, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(x,       { toValue: drift, duration: 1800, useNativeDriver: true }),
          Animated.timing(rotate,  { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(1200),
            Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
          ]),
        ]),
      ]).start(loop);
    };
    loop();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0,1], outputRange: ['0deg','540deg'] });
  return (
    <Animated.View style={{
      position: 'absolute', top: 0, left: startX, width: size, height: size,
      borderRadius: Math.random() > 0.5 ? size / 2 : 2, backgroundColor: color,
      transform: [{ translateY: y }, { translateX: x }, { rotate: spin }, { scale }],
      opacity,
    }} />
  );
}

// ─── RippleRing ───────────────────────────────────────────────────────────────
function RippleRing({ delay, color = Brand.purple }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  const sc = anim.interpolate({ inputRange: [0,1], outputRange: [1, 2.4] });
  const op = anim.interpolate({ inputRange: [0,0.6,1], outputRange: [0.5,0.2,0] });
  return (
    <Animated.View style={{
      position: 'absolute', width: 90, height: 90, borderRadius: 45,
      borderWidth: 2, borderColor: color, transform: [{ scale: sc }], opacity: op,
    }} />
  );
}

// ─── AnimatedCheck ────────────────────────────────────────────────────────────
function AnimatedCheck({ visible }) {
  const circleScale  = useRef(new Animated.Value(0)).current;
  const checkScale   = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const bgOpacity    = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    Animated.sequence([
      Animated.parallel([
        Animated.spring(circleScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(bgOpacity,   { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(checkScale,   { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  }, [visible]);
  return (
    <View style={{ width: 100, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
      <RippleRing delay={200} color={Brand.purple} />
      <RippleRing delay={700} color={Brand.lilac} />
      <Animated.View style={{
        width: 90, height: 90, borderRadius: 45, backgroundColor: Brand.purple,
        justifyContent: 'center', alignItems: 'center',
        transform: [{ scale: circleScale }], opacity: bgOpacity,
        shadowColor: Brand.purple, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45, shadowRadius: 20, elevation: 12,
      }}>
        <Animated.View style={{ transform: [{ scale: checkScale }], opacity: checkOpacity }}>
          <Ionicons name="checkmark" size={46} color="#fff" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── SuccessModal ─────────────────────────────────────────────────────────────
function SuccessModal({ visible, onDone, C }) {
  const slideUp  = useRef(new Animated.Value(60)).current;
  const fadeIn   = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const COLORS = ['#6A5AE0','#A78BFA','#4A90E2','#F4A261','#E76F51','#6A5AE0','#4A90E2','#A78BFA','#F4A261','#6A5AE0','#E76F51','#4A90E2'];
  const particles = COLORS.map((c, i) => ({ color: c, startX: 20 + i * 26, delay: i * 80, size: 6 + (i % 3) * 3 }));
  useEffect(() => {
    if (!visible) { slideUp.setValue(60); fadeIn.setValue(0); barWidth.setValue(0); return; }
    Animated.parallel([
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeIn,  { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.timing(barWidth, { toValue: 1, duration: 2800, easing: Easing.linear, useNativeDriver: false })
        .start(() => { onDone && onDone(); });
    }, 600);
  }, [visible]);
  const barInterp = barWidth.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] });
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <Animated.View style={[sStyles.overlay, { opacity: fadeIn }]}>
        <View style={sStyles.particleContainer} pointerEvents="none">
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </View>
        <Animated.View style={[sStyles.card, { backgroundColor: C.backgroundCard, transform: [{ translateY: slideUp }] }]}>
          <AnimatedCheck visible={visible} />
          <View style={[sStyles.badge, { backgroundColor: C.accentSoft }]}>
            <Text style={[sStyles.badgeText, { color: '#534AB7' }]}>✦ CONTA CRIADA</Text>
          </View>
          <Text style={[sStyles.title, { color: C.text }]}>Tudo pronto!</Text>
          <Text style={[sStyles.sub, { color: C.textSecondary }]}>
            Sua conta foi criada com sucesso.{'\n'}Bem-vindo à família InfasCare!
          </Text>
          <View style={[sStyles.barTrack, { backgroundColor: C.border }]}>
            <Animated.View style={[sStyles.barFill, { width: barInterp }]} />
          </View>
          <Text style={[sStyles.barHint, { color: C.textMuted }]}>Entrando automaticamente…</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const sStyles = StyleSheet.create({
  overlay:           { flex: 1, backgroundColor: 'rgba(15,10,40,0.65)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  particleContainer: { position: 'absolute', top: '25%', left: 0, right: 0, height: 220, flexDirection: 'row' },
  card:              { borderRadius: 30, padding: 30, width: '100%', maxWidth: 340, alignItems: 'center', shadowColor: Brand.purple, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.22, shadowRadius: 48, elevation: 24 },
  badge:             { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 14 },
  badgeText:         { fontSize: 11, fontWeight: '700', letterSpacing: 0.9 },
  title:             { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  sub:               { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 26 },
  barTrack:          { width: '100%', height: 6, borderRadius: 8, overflow: 'hidden', marginBottom: 10 },
  barFill:           { height: 6, backgroundColor: Brand.purple, borderRadius: 8 },
  barHint:           { fontSize: 12, fontFamily: 'Poppins-Regular' },
});

// ─── ErrorAlert ───────────────────────────────────────────────────────────────
function ErrorAlert({ visible, title, message, onClose, C }) {
  const scaleAnim   = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim,   { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else { scaleAnim.setValue(0.85); opacityAnim.setValue(0); }
  }, [visible]);
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[eStyles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[eStyles.card, { backgroundColor: C.backgroundCard, transform: [{ scale: scaleAnim }] }]}>
          <View style={eStyles.iconWrap}><Ionicons name="alert-circle" size={40} color={Brand.error} /></View>
          <View style={eStyles.badge}><Text style={eStyles.badgeText}>⚠ ATENÇÃO</Text></View>
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
  overlay:          { flex: 1, backgroundColor: 'rgba(20,10,40,0.55)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card:             { borderRadius: 28, padding: 28, width: '100%', maxWidth: 340, alignItems: 'center', shadowColor: Brand.error, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 18 },
  iconWrap:         { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  badge:            { backgroundColor: '#FFF0F0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 12 },
  badgeText:        { color: Brand.error, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  title:            { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  message:          { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  btnRow:           { flexDirection: 'row', gap: 10, width: '100%' },
  btnPrimary:       { flex: 1, backgroundColor: Brand.error, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnPrimaryText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondary:     { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '600' },
});

// ─── Campo com validação ──────────────────────────────────────────────────────
function Field({ icon, placeholder, error, children, C, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={[styles.inputContainer, { borderColor: error ? Brand.error : C.borderInput, backgroundColor: error ? '#FFF7F7' : C.inputBg }]}>
        <Ionicons name={icon} size={20} color={error ? Brand.error : Brand.purple} />
        {children
          ? <View style={{ flex: 1, marginLeft: 10 }}>{children}</View>
          : <TextInput placeholder={placeholder} placeholderTextColor={C.textMuted} style={[styles.input, { color: C.text }]} {...props} />
        }
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={Brand.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Tela Principal ───────────────────────────────────────────────────────────
export default function CadastroScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const [form, setForm] = useState({ name: '', email: '', cpf: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<any>({});
  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorAlert, setErrorAlert] = useState({ visible: false, title: '', message: '' });

  function validate() {
    const e: any = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    const rawCpf = form.cpf.replace(/\D/g, '');
    if (!rawCpf) e.cpf = 'CPF é obrigatório';
    else if (rawCpf.length !== 11) e.cpf = 'CPF incompleto';
    const rawPhone = form.phone.replace(/\D/g, '');
    if (!rawPhone) e.phone = 'Telefone é obrigatório';
    else if (rawPhone.length < 10) e.phone = 'Telefone incompleto';
    if (!form.password) e.password = 'Senha é obrigatória';
    else if (form.password.length < 6) e.password = 'Mínimo de 6 caracteres';
    if (!form.confirm) e.confirm = 'Confirme sua senha';
    else if (form.confirm !== form.password) e.confirm = 'As senhas não coincidem';
    if (!acceptedTerms) e.terms = 'Aceite os termos para continuar';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const msgs: any = {
        name: 'Preencha seu nome completo.', email: e.email, cpf: e.cpf,
        phone: e.phone, password: e.password, confirm: e.confirm,
        terms: 'Aceite os Termos de Uso e a Política de Privacidade.',
      };
      const first = Object.keys(e)[0];
      setErrorAlert({ visible: true, title: 'Campos incompletos', message: msgs[first] });
      return;
    }
    setShowSuccess(true);
  }

  return (
    <>
      <SuccessModal visible={showSuccess} onDone={() => { setShowSuccess(false); router.replace('/(tabs)'); }} C={C} />
      <ErrorAlert
        visible={errorAlert.visible} title={errorAlert.title} message={errorAlert.message}
        onClose={() => setErrorAlert(a => ({ ...a, visible: false }))} C={C}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: C.backgroundSoft }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <View style={[styles.backCircle, { backgroundColor: C.accentSoft }]}>
              <Ionicons name="arrow-back" size={20} color={Brand.purple} />
            </View>
          </TouchableOpacity>

          <View style={styles.headerArea}>
            <Text style={[styles.title, { color: C.text }]}>Criar conta</Text>
            <Text style={[styles.subtitle, { color: C.textMuted }]}>Protegendo quem mais importa.</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: C.textMuted }]}>Informações pessoais</Text>

          <Field icon="person-outline" placeholder="Nome completo" error={errors.name} C={C}
            value={form.name} onChangeText={(v: string) => setForm(f => ({ ...f, name: v }))} />
          <Field icon="mail-outline" placeholder="E-mail" error={errors.email} C={C}
            keyboardType="email-address" autoCapitalize="none"
            value={form.email} onChangeText={(v: string) => setForm(f => ({ ...f, email: v }))} />

          {/* CPF */}
          <View style={{ marginBottom: 14 }}>
            <View style={[styles.inputContainer, { borderColor: errors.cpf ? Brand.error : C.borderInput, backgroundColor: errors.cpf ? '#FFF7F7' : C.inputBg }]}>
              <Ionicons name="card-outline" size={20} color={errors.cpf ? Brand.error : Brand.purple} />
              <TextInputMask type={'cpf'} value={form.cpf} onChangeText={(v: string) => setForm(f => ({ ...f, cpf: v }))}
                placeholder="CPF" placeholderTextColor={C.textMuted}
                style={[styles.input, { color: C.text }]} keyboardType="numeric" />
            </View>
            {!!errors.cpf && <View style={styles.errorRow}><Ionicons name="alert-circle-outline" size={13} color={Brand.error} /><Text style={styles.errorText}>{errors.cpf}</Text></View>}
          </View>

          {/* Telefone */}
          <View style={{ marginBottom: 14 }}>
            <View style={[styles.inputContainer, { borderColor: errors.phone ? Brand.error : C.borderInput, backgroundColor: errors.phone ? '#FFF7F7' : C.inputBg }]}>
              <Ionicons name="call-outline" size={20} color={errors.phone ? Brand.error : Brand.purple} />
              <TextInputMask type={'cel-phone'} options={{ maskType: 'BRL', withDDD: true, dddMask: '(99) ' }}
                value={form.phone} onChangeText={(v: string) => setForm(f => ({ ...f, phone: v }))}
                placeholder="Telefone" placeholderTextColor={C.textMuted}
                style={[styles.input, { color: C.text }]} keyboardType="phone-pad" />
            </View>
            {!!errors.phone && <View style={styles.errorRow}><Ionicons name="alert-circle-outline" size={13} color={Brand.error} /><Text style={styles.errorText}>{errors.phone}</Text></View>}
          </View>

          <Text style={[styles.sectionLabel, { color: C.textMuted }]}>Segurança</Text>

          {/* Senha */}
          <View style={{ marginBottom: 14 }}>
            <View style={[styles.inputContainer, { borderColor: errors.password ? Brand.error : C.borderInput, backgroundColor: errors.password ? '#FFF7F7' : C.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} color={errors.password ? Brand.error : Brand.purple} />
              <TextInput placeholder="Senha" placeholderTextColor={C.textMuted} style={[styles.input, { color: C.text }]}
                secureTextEntry={secureText} value={form.password} onChangeText={(v: string) => setForm(f => ({ ...f, password: v }))} />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <Ionicons name={secureText ? 'eye-off-outline' : 'eye-outline'} size={20} color={Brand.purple} />
              </TouchableOpacity>
            </View>
            {!!errors.password && <View style={styles.errorRow}><Ionicons name="alert-circle-outline" size={13} color={Brand.error} /><Text style={styles.errorText}>{errors.password}</Text></View>}
          </View>

          {/* Confirmar senha */}
          <View style={{ marginBottom: 14 }}>
            <View style={[styles.inputContainer, { borderColor: errors.confirm ? Brand.error : C.borderInput, backgroundColor: errors.confirm ? '#FFF7F7' : C.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} color={errors.confirm ? Brand.error : Brand.purple} />
              <TextInput placeholder="Confirmar senha" placeholderTextColor={C.textMuted} style={[styles.input, { color: C.text }]}
                secureTextEntry={secureConfirm} value={form.confirm} onChangeText={(v: string) => setForm(f => ({ ...f, confirm: v }))} />
              <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
                <Ionicons name={secureConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={Brand.purple} />
              </TouchableOpacity>
            </View>
            {!!errors.confirm && <View style={styles.errorRow}><Ionicons name="alert-circle-outline" size={13} color={Brand.error} /><Text style={styles.errorText}>{errors.confirm}</Text></View>}
          </View>

          <Text style={[styles.sectionLabel, { color: C.textMuted }]}>Preferências</Text>

          <View style={[styles.switchRow, { backgroundColor: C.backgroundCard, borderColor: C.border }]}>
            <View style={styles.switchInfo}>
              <View style={[styles.switchIconWrap, { backgroundColor: C.accentSoft }]}>
                <Ionicons name="notifications-outline" size={18} color={Brand.purple} />
              </View>
              <View>
                <Text style={[styles.switchLabel, { color: C.text }]}>Alertas críticos</Text>
                <Text style={[styles.switchSub, { color: C.textMuted }]}>Notificações importantes sobre seu filho</Text>
              </View>
            </View>
            <Switch value={notifications} onValueChange={setNotifications}
              trackColor={{ false: C.border, true: Brand.purple }} thumbColor="#fff" />
          </View>

          <TouchableOpacity
            style={[styles.termsRow, { backgroundColor: C.backgroundCard, borderColor: errors.terms ? Brand.error : C.border }]}
            onPress={() => setAcceptedTerms(!acceptedTerms)} activeOpacity={0.8}
          >
            <View style={[styles.checkbox, { borderColor: C.border }, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={[styles.termsText, { color: C.textSecondary }]}>
              Li e concordo com os{' '}
              <Text style={styles.linkText} onPress={() => Linking.openURL('https://seu-site.com/termos')}>Termos de Uso</Text>
              {' '}e a{' '}
              <Text style={styles.linkText} onPress={() => Linking.openURL('https://seu-site.com/privacidade')}>Política de Privacidade (LGPD)</Text>.
            </Text>
          </TouchableOpacity>
          {!!errors.terms && (
            <View style={[styles.errorRow, { marginTop: -6, marginBottom: 12 }]}>
              <Ionicons name="alert-circle-outline" size={13} color={Brand.error} />
              <Text style={styles.errorText}>{errors.terms}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
            <Ionicons name="person-add-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Criar conta</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ paddingVertical: 4 }}>
            <Text style={[styles.footerText, { color: C.textMuted }]}>
              Já possui conta?{'  '}
              <Text style={[styles.loginLink, { color: Brand.purple }]}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  scrollContent:   { padding: 20, paddingTop: 56, paddingBottom: 40 },
  backButton:      { marginBottom: 24 },
  backCircle:      { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerArea:      { alignItems: 'flex-start', marginBottom: 28 },
  title:           { fontSize: 28, fontFamily: 'Poppins-SemiBold', marginBottom: 4 },
  subtitle:        { fontFamily: 'Poppins-Regular', fontSize: 14 },
  sectionLabel:    { fontSize: 11, fontFamily: 'Poppins-SemiBold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 4 },
  inputContainer:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 56 },
  input:           { flex: 1, marginLeft: 10, fontSize: 15, fontFamily: 'Poppins-Regular' },
  errorRow:        { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 2, gap: 4 },
  errorText:       { fontSize: 12, color: Brand.error, fontFamily: 'Poppins-Regular', flex: 1 },
  switchRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1.5 },
  switchInfo:      { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  switchIconWrap:  { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  switchLabel:     { fontSize: 14, fontFamily: 'Poppins-Medium' },
  switchSub:       { fontSize: 11, fontFamily: 'Poppins-Regular' },
  termsRow:        { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1.5, gap: 10 },
  checkbox:        { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: Brand.purple, borderColor: Brand.purple },
  termsText:       { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', lineHeight: 20 },
  linkText:        { color: Brand.purple, fontFamily: 'Poppins-SemiBold', textDecorationLine: 'underline' },
  button:          { backgroundColor: Brand.purple, paddingVertical: 17, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 20, shadowColor: Brand.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  buttonText:      { color: '#fff', fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  footerText:      { textAlign: 'center', fontFamily: 'Poppins-Regular', fontSize: 14 },
  loginLink:       { fontFamily: 'Poppins-SemiBold' },
});
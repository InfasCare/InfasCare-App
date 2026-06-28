import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme-color';

type SocialLink = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  url: string;
  color: string;
};

// ─── Substitua pelos requires das fotos reais quando tiver ───────────────────
// Exemplo: photo: require('@/assets/images/team/yasmin.jpg')
const TEAM = [
  {
    nome: 'Yasmin Oliveira',
    genero: 'f' as const,
    photo: { uri: 'https://ui-avatars.com/api/?name=Yasmin+Oliveira&background=7B4DFF&color=fff&size=200' },
    roles: [
      { icon: 'brush-outline' as const, label: 'Design UI/UX', highlight: true },
      { icon: 'code-slash-outline' as const, label: 'Desenvolvimento' },
      { icon: 'hardware-chip-outline' as const, label: 'IoT & Hardware' },
      { icon: 'sparkles-outline' as const, label: 'Backend & IA' },
    ],
    socials: [
      { icon: 'logo-instagram' as const, label: 'Instagram', url: 'https://www.instagram.com/whoisminz_/', color: '#E1306C' },
      { icon: 'logo-github'    as const, label: 'GitHub',    url: 'https://github.com/whoismin',         color: '#333333' },
      { icon: 'logo-linkedin'  as const, label: 'LinkedIn',  url: 'https://www.linkedin.com/in/yasmin-oliveira-3a596234a/', color: '#0A66C2' },
    ] as SocialLink[],
  },
  {
    nome: 'Letícia Borges',
    genero: 'f' as const,
    photo: { uri: 'https://ui-avatars.com/api/?name=Leticia+Borges&background=A78BFA&color=fff&size=200' },
    roles: [
      { icon: 'code-slash-outline' as const, label: 'Desenvolvimento' },
      { icon: 'hardware-chip-outline' as const, label: 'IoT & Hardware' },
      { icon: 'sparkles-outline' as const, label: 'Backend & IA' },
    ],
    socials: [
      { icon: 'logo-instagram' as const, label: 'Instagram', url: 'https://www.instagram.com/leti_borgees/', color: '#E1306C' },
      { icon: 'logo-github'    as const, label: 'GitHub',    url: 'https://github.com/letiborges2510',       color: '#333333' },
      { icon: 'logo-linkedin'  as const, label: 'LinkedIn',  url: 'https://www.linkedin.com/in/let%C3%ADcia-borges-da-silva-184150219/', color: '#0A66C2' },
    ] as SocialLink[],
  },
  {
    nome: 'João Machado',
    genero: 'm' as const,
    photo: { uri: 'https://ui-avatars.com/api/?name=Joao+Machado&background=4A90E2&color=fff&size=200' },
    roles: [
      { icon: 'code-slash-outline' as const, label: 'Desenvolvimento' },
      { icon: 'hardware-chip-outline' as const, label: 'IoT & Hardware' },
      { icon: 'sparkles-outline' as const, label: 'Backend & IA' },
    ],
    socials: [
      { icon: 'logo-instagram' as const, label: 'Instagram', url: 'https://www.instagram.com/j.jo4n/',              color: '#E1306C' },
      { icon: 'logo-github'    as const, label: 'GitHub',    url: 'https://github.com/Joaozin54P',                  color: '#333333' },
      { icon: 'logo-linkedin'  as const, label: 'LinkedIn',  url: 'https://www.linkedin.com/in/jo4n/',              color: '#0A66C2' },
      { icon: 'globe-outline'  as const, label: 'Portfólio', url: 'https://joao-pedro-da-machado-dev.vercel.app/',  color: '#7B4DFF' },
    ] as SocialLink[],
  },
];

// Foto da equipe completa — substitua por: require('@/assets/images/team/equipe.jpg')
const TEAM_PHOTO = { uri: 'https://ui-avatars.com/api/?name=InfasCare+Team&background=1C1835&color=7B4DFF&size=800' };

const FEATURES = [
  {
    icon: 'hardware-chip-outline' as const,
    title: 'IoT Embarcado',
    desc: 'Sensor de presença e temperatura via ESP32 com comunicação em tempo real.',
    color: '#7B4DFF',
  },
  {
    icon: 'location-outline' as const,
    title: 'Geolocalização',
    desc: 'Monitoramento da distância do responsável pelo GPS do smartphone.',
    color: '#3B82F6',
  },
  {
    icon: 'cloud-outline' as const,
    title: 'Nuvem Firebase',
    desc: 'Armazenamento e processamento em tempo real com Firebase Cloud.',
    color: '#22C55E',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'Inteligência Artificial',
    desc: 'Análise de padrões de rotina para prevenção de situações de risco.',
    color: '#F59E0B',
  },
];

const RISK_LEVELS = [
  { label: 'Normal',  desc: 'Criança presente + responsável próximo',        color: '#22C55E', icon: 'checkmark-circle' as const },
  { label: 'Atenção', desc: 'Criança presente + horário fora da rotina',     color: '#F59E0B', icon: 'alert-circle'     as const },
  { label: 'Risco',   desc: 'Criança presente + responsável distante',       color: '#F97316', icon: 'warning'          as const },
  { label: 'Crítico', desc: 'Responsável distante + temperatura elevada',    color: '#EF4444', icon: 'flame'            as const },
];

const TECH_STACK = [
  { label: 'ESP32',        sublabel: 'Hardware', icon: 'hardware-chip-outline'   as const },
  { label: 'React Native', sublabel: 'Mobile',   icon: 'phone-portrait-outline'  as const },
  { label: 'Firebase',     sublabel: 'Backend',  icon: 'cloud-outline'           as const },
  { label: 'BLE',          sublabel: 'Wireless', icon: 'bluetooth-outline'       as const },
];

export default function Sobre() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundSoft }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.backgroundCard }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Sobre</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* ── Hero Card Redesenhado ── */}
      <View style={styles.heroCard}>
        {/* Círculos decorativos de fundo */}
        <View style={styles.heroBgCircle1} />
        <View style={styles.heroBgCircle2} />
        <View style={styles.heroBgCircle3} />

        {/* Linha de status no topo */}
        <View style={styles.heroStatusBar}>
          <View style={styles.heroStatusDot} />
          <Text style={styles.heroStatusText}>Sistema ativo</Text>
        </View>

        {/* Ícone principal com camadas */}
        <View style={styles.heroIconStack}>
          <View style={styles.heroIconRing3} />
          <View style={styles.heroIconRing2} />
          <View style={styles.heroIconRing1}>
            <Ionicons name="car-sport" size={36} color="#FFFFFF" />
          </View>
          {/* Badge de segurança */}
          <View style={styles.heroShieldBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
          </View>
          {/* Ícone de criança */}
          <View style={styles.heroBabyBadge}>
            <Ionicons name="happy-outline" size={14} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.heroTitle}>InfasCare IoT</Text>
        <Text style={styles.heroSubtitle}>
          Segurança infantil inteligente para veículos
        </Text>

        {/* Stats row */}
        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Ionicons name="hardware-chip-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroStatText}>IoT</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroStatText}>GPS</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Ionicons name="cloud-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroStatText}>Cloud</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Ionicons name="sparkles-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroStatText}>IA</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadge}>
            <Ionicons name="school-outline" size={11} color="#E8DEFF" />
            <Text style={styles.heroBadgeText}>Projeto Acadêmico</Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="code-slash-outline" size={11} color="#E8DEFF" />
            <Text style={styles.heroBadgeText}>v1.0.0</Text>
          </View>
        </View>
      </View>

      {/* ── Missão ── */}
      <View style={[styles.card, { backgroundColor: theme.backgroundCard }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconCircle, { backgroundColor: '#7B4DFF18' }]}>
            <Ionicons name="heart" size={18} color="#7B4DFF" />
          </View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Nossa Missão</Text>
        </View>
        <Text style={[styles.cardText, { color: theme.textSecondary }]}>
          Prevenir o abandono infantil em veículos através de tecnologia IoT, geolocalização
          e inteligência artificial — atuando de forma preventiva antes que situações de risco
          se tornem críticas.
        </Text>
      </View>

      {/* ── Tecnologias ── */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Tecnologias</Text>
      <View style={styles.featuresGrid}>
        {FEATURES.map((f) => (
          <View key={f.title} style={[styles.featureCard, { backgroundColor: theme.backgroundCard }]}>
            <View style={[styles.featureIconCircle, { backgroundColor: `${f.color}18` }]}>
              <Ionicons name={f.icon} size={22} color={f.color} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>{f.title}</Text>
            <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* ── Stack ── */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Stack</Text>
      <View style={[styles.stackRow, { backgroundColor: theme.backgroundCard }]}>
        {TECH_STACK.map((t, i) => (
          <View key={t.label} style={styles.stackItemWrapper}>
            {i > 0 && <View style={[styles.stackDivider, { backgroundColor: theme.border }]} />}
            <View style={styles.stackItem}>
              <View style={[styles.stackIconCircle, { backgroundColor: theme.accentSoft }]}>
                <Ionicons name={t.icon} size={20} color={theme.tint} />
              </View>
              <Text style={[styles.stackLabel, { color: theme.text }]}>{t.label}</Text>
              <Text style={[styles.stackSublabel, { color: theme.textMuted }]}>{t.sublabel}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Níveis de Risco ── */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Níveis de Risco</Text>
      <View style={[styles.card, { backgroundColor: theme.backgroundCard, gap: 0, paddingHorizontal: 0 }]}>
        {RISK_LEVELS.map((r, i) => (
          <View key={r.label}>
            <View style={styles.riskRow}>
              <View style={[styles.riskDot, { backgroundColor: r.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.riskLabel, { color: theme.text }]}>{r.label}</Text>
                <Text style={[styles.riskDesc, { color: theme.textSecondary }]}>{r.desc}</Text>
              </View>
              <Ionicons name={r.icon} size={20} color={r.color} />
            </View>
            {i < RISK_LEVELS.length - 1 && (
              <View style={[styles.riskDivider, { backgroundColor: theme.border }]} />
            )}
          </View>
        ))}
      </View>

      {/* ── Como funciona ── */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Como funciona</Text>
      <View style={[styles.card, { backgroundColor: theme.backgroundCard }]}>
        {[
          { n: '1', text: 'Sensor detecta presença da criança na cadeirinha', icon: 'body-outline'          as const },
          { n: '2', text: 'ESP32 envia dados para a nuvem via Wi-Fi',         icon: 'wifi-outline'          as const },
          { n: '3', text: 'App compartilha localização do responsável',       icon: 'location-outline'      as const },
          { n: '4', text: 'IA analisa padrões e identifica riscos',           icon: 'sparkles-outline'      as const },
          { n: '5', text: 'Firebase dispara alertas em tempo real',           icon: 'notifications-outline' as const },
        ].map((step, i, arr) => (
          <View key={step.n} style={styles.flowStep}>
            <View style={styles.flowLeft}>
              <View style={[styles.flowCircle, { backgroundColor: theme.tint }]}>
                <Text style={styles.flowNum}>{step.n}</Text>
              </View>
              {i < arr.length - 1 && (
                <View style={[styles.flowLine, { backgroundColor: theme.accentSoft }]} />
              )}
            </View>
            <View style={[styles.flowContent, { backgroundColor: theme.backgroundSoft }]}>
              <Ionicons name={step.icon} size={16} color={theme.tint} />
              <Text style={[styles.flowText, { color: theme.text }]}>{step.text}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Foto da Equipe Completa ── */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Nossa Equipe</Text>
      <View style={[styles.teamPhotoCard, { backgroundColor: theme.backgroundCard }]}>
        {/* Instrução: substitua TEAM_PHOTO por require('@/assets/images/team/equipe.jpg') */}
        <Image source={TEAM_PHOTO} style={styles.teamPhoto} resizeMode="cover" />
        <View style={[styles.teamPhotoOverlay, { backgroundColor: theme.backgroundCard }]}>
          <View style={styles.teamPhotoTextRow}>
            <View style={[styles.teamPhotoIconCircle, { backgroundColor: theme.accentSoft }]}>
              <Ionicons name="people" size={18} color={theme.tint} />
            </View>
            <View>
              <Text style={[styles.teamPhotoTitle, { color: theme.text }]}>InfasCare Team</Text>
              <Text style={[styles.teamPhotoSub, { color: theme.textSecondary }]}>
                3 desenvolvedores · São Paulo, SP
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Cards individuais da equipe ── */}
      <View style={{ gap: 12, marginBottom: 20 }}>
        {TEAM.map((member) => (
          <View key={member.nome} style={[styles.teamCard, { backgroundColor: theme.backgroundCard }]}>
            {/* Topo: foto + nome */}
            <View style={styles.teamTop}>
              <Image source={member.photo} style={styles.teamMemberPhoto} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.teamName, { color: theme.text }]}>{member.nome}</Text>
                <Text style={[styles.teamMainRole, { color: theme.tint }]}>
                  {member.genero === 'f' ? 'Desenvolvedora' : 'Desenvolvedor'} · InfasCare
                </Text>
              </View>
            </View>

            {/* Chips de função */}
            <View style={styles.rolesRow}>
              {member.roles.map((role) => (
                <View
                  key={role.label}
                  style={[
                    styles.roleChip,
                    { backgroundColor: role.highlight ? theme.tint : theme.accentSoft },
                  ]}
                >
                  <Ionicons
                    name={role.icon}
                    size={11}
                    color={role.highlight ? '#FFFFFF' : theme.tint}
                  />
                  <Text style={[styles.roleChipText, { color: role.highlight ? '#FFFFFF' : theme.tint }]}>
                    {role.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Divisor + Redes Sociais */}
            <View style={[styles.teamInnerDivider, { backgroundColor: theme.border, marginTop: 12 }]} />

            <View style={styles.socialsRow}>
              {member.socials.map((s) => (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.socialBtn, { backgroundColor: `${s.color}15`, borderColor: `${s.color}30` }]}
                  onPress={() => Linking.openURL(s.url)}
                  activeOpacity={0.75}
                >
                  <Ionicons name={s.icon} size={16} color={s.color} />
                  <Text style={[styles.socialLabel, { color: s.color }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* ── Footer ── */}
      <View style={[styles.footerCard, { backgroundColor: theme.backgroundCard }]}>
        <View style={[styles.footerIconCircle, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name="lock-closed" size={20} color={theme.tint} />
        </View>
        <Text style={[styles.footerTitle, { color: theme.text }]}>Segurança & Privacidade</Text>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Autenticação segura · HTTPS · Criptografia de ponta a ponta
        </Text>
        <Text style={[styles.footerLicense, { color: theme.textMuted }]}>
          Projeto acadêmico · Fins educacionais e de pesquisa
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 58,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },

  // ─── Hero Card Redesenhado ────────────────────────────────────────────────
  heroCard: {
    borderRadius: 28,
    backgroundColor: '#6A5AE0',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#6A5AE0',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },

  heroBgCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -70,
    right: -70,
  },

  heroBgCircle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0,0,0,0.06)',
    bottom: -50,
    left: -50,
  },

  heroBgCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 30,
    right: 20,
  },

  heroStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.35)',
  },

  heroStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },

  heroStatusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#86EFAC',
  },

  heroIconStack: {
    width: 96,
    height: 96,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroIconRing3: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  heroIconRing2: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  heroIconRing1: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  heroShieldBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6A5AE0',
  },

  heroBabyBadge: {
    position: 'absolute',
    left: 2,
    top: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6A5AE0',
  },

  heroTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  heroSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },

  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 18,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  heroStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },

  heroStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  heroStatText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },

  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  heroBadgeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#E8DEFF',
  },

  // ─── Comum ───────────────────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    marginBottom: 12,
    marginTop: 4,
  },

  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    gap: 12,
  },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  cardIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 15 },

  cardText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 20,
  },

  // ─── Features ────────────────────────────────────────────────────────────
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  featureCard: {
    width: '47.5%',
    borderRadius: 18,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  featureIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  featureTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 13, marginBottom: 4 },

  featureDesc: { fontFamily: 'Poppins-Regular', fontSize: 10, lineHeight: 15 },

  // ─── Stack ───────────────────────────────────────────────────────────────
  stackRow: {
    borderRadius: 18,
    flexDirection: 'row',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  stackItemWrapper: { flex: 1, flexDirection: 'row' },

  stackDivider: { width: 1, marginVertical: 12 },

  stackItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },

  stackIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  stackLabel:    { fontFamily: 'Poppins-SemiBold', fontSize: 11, textAlign: 'center' },
  stackSublabel: { fontFamily: 'Poppins-Regular',  fontSize: 10, textAlign: 'center', marginTop: 2 },

  // ─── Risk ────────────────────────────────────────────────────────────────
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  riskDot:     { width: 10, height: 10, borderRadius: 5 },
  riskLabel:   { fontFamily: 'Poppins-SemiBold', fontSize: 13 },
  riskDesc:    { fontFamily: 'Poppins-Regular',  fontSize: 10, marginTop: 2 },
  riskDivider: { height: StyleSheet.hairlineWidth, marginLeft: 40 },

  // ─── Flow ────────────────────────────────────────────────────────────────
  flowStep:    { flexDirection: 'row', gap: 12, minHeight: 52 },
  flowLeft:    { alignItems: 'center', width: 28 },

  flowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  flowNum:  { fontFamily: 'Poppins-SemiBold', fontSize: 12, color: '#FFFFFF' },
  flowLine: { flex: 1, width: 2, marginVertical: 3, borderRadius: 1 },

  flowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },

  flowText: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: 12, lineHeight: 17 },

  // ─── Foto da Equipe Completa ──────────────────────────────────────────────
  teamPhotoCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  teamPhoto: {
    width: '100%',
    height: 200,
  },

  teamPhotoOverlay: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  teamPhotoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  teamPhotoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  teamPhotoTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },

  teamPhotoSub: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    marginTop: 2,
  },

  // ─── Cards individuais ────────────────────────────────────────────────────
  teamCard: {
    borderRadius: 18,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  teamTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  teamMemberPhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },

  teamName:     { fontFamily: 'Poppins-SemiBold', fontSize: 15 },
  teamMainRole: { fontFamily: 'Poppins-Regular',  fontSize: 11, marginTop: 2 },

  teamInnerDivider: { height: StyleSheet.hairlineWidth, marginBottom: 12 },

  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },

  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  roleChipText: { fontFamily: 'Poppins-Medium', fontSize: 11 },

  socialsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },

  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },

  socialLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
  },

  // ─── Footer ──────────────────────────────────────────────────────────────
  footerCard: {
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  footerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  footerTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 15, marginBottom: 6 },

  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  footerLicense: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
  },
});
import FeedbackModal from '@/components/FeedbackModal';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Linking } from 'react-native';
import { ouvirResponsaveis, type Responsavel } from '@/services/responsaveis';
import { ouvirCriancas, adicionarCrianca, removerCrianca, type Crianca } from '@/services/criancas';

type FeedbackState = {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
};

const AVATARES = ['👶🏻', '👶🏼', '👶🏽', '👶🏾', '👶🏿', '👧🏻', '👧🏽', '👧🏿', '👦🏻', '👦🏽', '👦🏿'];

export default function Criancas() {
  const theme = useTheme();
  const pageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pageAnim, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [pageAnim]);

  const pageStyle = {
    opacity: pageAnim,
    transform: [{ translateY: pageAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  };
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const telaPequena = width < 380;
  const paddingHorizontal = telaPequena ? 16 : 24;

  const { user } = useAuth();
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  useEffect(() => {
    if (!user) return;
    return ouvirResponsaveis(user.uid, setResponsaveis);
  }, [user]);
  const { t } = useI18n();

  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = ouvirCriancas(
      user.uid,
      (lista) => {
        setCriancas(lista);
        setCarregando(false);
      },
      () => setCarregando(false),
    );

    return unsubscribe;
  }, [user]);

  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalAvatar, setModalAvatar] = useState(false);
  const [modalLigacao, setModalLigacao] = useState(false);

  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [foto, setFoto] = useState('👶🏻');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/perfil');
  }

  async function cadastrarCrianca() {
    if (!nome || !idade || !nascimento || !sexo) {
      setFeedback({
        visible: true,
        title: t('children_incompleteFields'),
        message: t('children_incompleteFieldsMsg'),
        type: 'warning',
      });
      return;
    }

    if (!user) return;

    try {
      setIsSubmitting(true);
      await adicionarCrianca(user.uid, { nome, idade, nascimento, sexo, foto });

      setNome('');
      setIdade('');
      setNascimento('');
      setSexo('');
      setFoto('👶🏻');
      setModalCadastro(false);

      setFeedback({
        visible: true,
        title: t('children_registered'),
        message: `${nome} ${t('children_registeredMsg')}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao cadastrar criança (InfasCare):', error);
      setFeedback({
        visible: true,
        title: t('children_registerError'),
        message: t('children_registerErrorMsg'),
        type: 'warning',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.backgroundSoft }]}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal,
            paddingTop: Math.max(insets.top + 16, 48),
            paddingBottom: Math.max(insets.bottom + 28, 42),
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={voltar}
            style={[styles.backButton, { backgroundColor: theme.backgroundCard }]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>{t('children_title')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('children_subtitle')}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setModalCadastro(true)}>
            <Ionicons name="add-circle" size={28} color="#7B4DFF" />
          </TouchableOpacity>
        </View>

        {carregando && (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 24 }}>
            {t('children_loading')}
          </Text>
        )}

        {!carregando && criancas.length === 0 && (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 24 }}>
            {t('children_empty')}
          </Text>
        )}

        {criancas.map((crianca) => (
          <Animated.View
            key={crianca.id}
            style={[pageStyle, styles.childCard, { backgroundColor: theme.backgroundCard }]}
          >
            <View style={styles.childTop}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: theme.accentSoft },
                ]}
              >
                <Text style={styles.avatarText}>{crianca.foto}</Text>
              </View>

              <View style={styles.childInformation}>
                <View style={styles.nameRow}>
                  <View style={styles.nameContent}>
                    <Text
                      style={[styles.nome, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {crianca.nome}
                    </Text>

                    <Text style={styles.info}>
                      {crianca.idade} · {crianca.sexo}
                    </Text>
                  </View>

                  <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>{t('children_active')}</Text>
                  </View>
                </View>

                <View style={styles.birthRow}>
                  <View
                    style={[
                      styles.smallIcon,
                      { backgroundColor: theme.accentSoft },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={15}
                      color="#7B4DFF"
                    />
                  </View>

                  <View style={styles.birthContent}>
                    <Text
                      style={[
                        styles.birthLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t('children_birthLabel')}
                    </Text>

                    <Text
                      style={[
                        styles.birthValue,
                        { color: theme.text },
                      ]}
                    >
                      {crianca.nascimento}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.cardDivider,
                { backgroundColor: theme.borderInput },
              ]}
            />

            <View
              style={[
                styles.actions,
                telaPequena && styles.actionsSmall,
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.82}
                style={[
                  styles.primaryAction,
                  telaPequena && styles.fullAction,
                ]}
                onPress={() => router.push('/(tabs)/localizacao')}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="location" size={18} color="#FFFFFF" />
                </View>

                <View style={styles.actionContent}>
                  <Text style={styles.primaryActionTitle}>
                    {t('children_viewLocation')}
                  </Text>
                  <Text style={styles.primaryActionSubtitle}>
                    {t('children_trackDevice')}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.82}
                style={[
                  styles.secondaryAction,
                  {
                    backgroundColor: theme.backgroundSoft,
                    borderColor: theme.borderInput,
                  },
                  telaPequena && styles.fullAction,
                ]}
                onPress={() => setModalLigacao(true)}
              >
                <View
                  style={[
                    styles.secondaryActionIcon,
                    { backgroundColor: theme.accentSoft },
                  ]}
                >
                  <Ionicons name="call" size={17} color="#7B4DFF" />
                </View>

                <Text
                  style={[
                    styles.secondaryActionText,
                    { color: theme.text },
                  ]}
                >
                  {t('children_call')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}

        <TouchableOpacity
          style={[styles.addBox, { backgroundColor: theme.backgroundCard }]}
          onPress={() => setModalCadastro(true)}
        >
          <View style={styles.plusCircle}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.addTitle}>{t('children_addTitle')}</Text>
          <Text style={[styles.addSubtitle, { color: theme.textSecondary }]}>
            {t('children_addSubtitle')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalCadastro} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('children_addTitle')}</Text>
              <TouchableOpacity onPress={() => setModalCadastro(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.avatarArea} onPress={() => setModalAvatar(true)}>
              <View style={[styles.avatarLarge, { backgroundColor: theme.accentSoft }]}>
                <Text style={styles.avatarLargeText}>{foto}</Text>
              </View>
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={15} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Input label={t('children_nameLabel')} value={nome} onChangeText={setNome} placeholder={t('children_namePlaceholder')} theme={theme} />
            <Input label={t('children_ageLabel')} value={idade} onChangeText={setIdade} placeholder={t('children_agePlaceholder')} theme={theme} />
            <Input label={t('children_birthLabel')} value={nascimento} onChangeText={setNascimento} placeholder={t('children_birthDatePlaceholder')} theme={theme} />
            <Input label={t('children_sexLabel')} value={sexo} onChangeText={setSexo} placeholder={t('children_sexPlaceholder')} theme={theme} />

            <TouchableOpacity
              style={[styles.saveButton, { opacity: isSubmitting ? 0.7 : 1 }]}
              onPress={cadastrarCrianca}
              disabled={isSubmitting}
            >
              <Text style={styles.saveText}>{isSubmitting ? t('children_saving') : t('children_saveChild')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalAvatar} transparent animationType="fade">
        <View style={styles.permissionOverlay}>
          <View style={[styles.avatarModal, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('children_choosePhoto')}</Text>
              <TouchableOpacity onPress={() => setModalAvatar(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarGrid}>
              {AVATARES.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.avatarOption,
                    { backgroundColor: theme.accentSoft },
                    foto === item && styles.avatarOptionActive,
                  ]}
                  onPress={() => {
                    setFoto(item);
                    setModalAvatar(false);
                  }}
                >
                  <Text style={styles.avatarOptionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalLigacao} transparent animationType="fade">
        <View style={styles.permissionOverlay}>
          <View style={[styles.callModal, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('children_callResponsible')}</Text>
              <TouchableOpacity onPress={() => setModalLigacao(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {responsaveis.length === 0 && (
              <Text style={[styles.responsavelTel, { color: theme.textSecondary }]}>
                Nenhum responsável cadastrado. Adicione em Configurações › Responsáveis.
              </Text>
            )}
            {responsaveis.map((resp) => (
              <TouchableOpacity
                key={resp.id}
                style={[styles.responsavelItem, { backgroundColor: theme.backgroundSoft }]}
                onPress={() => {
                  setModalLigacao(false);
                  // Abre o discador do aparelho com o número real do responsável
                  Linking.openURL(`tel:${resp.telefoneE164 || resp.telefone.replace(/\D/g, '')}`).catch(() =>
                    setFeedback({
                      visible: true,
                      title: resp.nome,
                      message: `${t('children_phoneLabel')}: ${resp.telefone}`,
                      type: 'info',
                    }),
                  );
                }}
              >
                <Ionicons name="call" size={20} color="#7B4DFF" />
                <View>
                  <Text style={[styles.responsavelNome, { color: theme.text }]}>{resp.nome}</Text>
                  <Text style={[styles.responsavelTel, { color: theme.textSecondary }]}>{resp.telefone}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <FeedbackModal
        visible={feedback.visible}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        confirmText={t('understood')}
        theme={theme}
        onConfirm={() =>
          setFeedback((current) => ({
            ...current,
            visible: false,
          }))
        }
      />
    </View>
  );
}

function Input({ label, value, onChangeText, placeholder, theme }: any) {
  return (
    <View style={styles.inputArea}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundSoft,
            color: theme.text,
            borderColor: theme.borderInput,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  headerText: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#21164D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 19,
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 3,
  },

  childCard: {
    width: '100%',
    borderRadius: 24,
    padding: 17,
    marginBottom: 16,
    shadowColor: '#21164D',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  childTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  childInformation: {
    flex: 1,
    minWidth: 0,
  },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  avatarText: {
    fontSize: 38,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  nameContent: {
    flex: 1,
    minWidth: 0,
  },

  nome: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },

  info: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#7B4DFF',
    marginTop: 2,
  },

  activeBadge: {
    minHeight: 25,
    borderRadius: 13,
    backgroundColor: '#EAF9F0',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2ECC71',
  },

  activeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 9,
    color: '#239B56',
  },

  birthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  smallIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  birthContent: {
    flex: 1,
  },

  birthLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
  },

  birthValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    marginTop: 1,
  },

  cardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 15,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },

  actionsSmall: {
    flexDirection: 'column',
  },

  fullAction: {
    width: '100%',
  },

  primaryAction: {
    flex: 1,
    minHeight: 58,
    borderRadius: 17,
    backgroundColor: '#7B4DFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#7B4DFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 4,
  },

  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  actionContent: {
    flex: 1,
    minWidth: 0,
  },

  primaryActionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },

  primaryActionSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 8,
    color: '#EDE7FF',
    marginTop: 1,
  },

  secondaryAction: {
    minWidth: 92,
    minHeight: 58,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  secondaryActionText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },

  addBox: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#A678FF',
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 22,
    marginTop: 6,
    marginBottom: 12,
  },

  plusCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#7B4DFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },

  addTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#7B4DFF',
  },

  addSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 22, 77, 0.38)',
    justifyContent: 'flex-end',
  },

  modalBox: {
    width: '100%',
    maxHeight: '92%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 26,
    gap: 13,
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

  avatarArea: {
    alignItems: 'center',
    marginVertical: 8,
  },

  avatarLarge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarLargeText: {
    fontSize: 44,
  },

  cameraButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    marginLeft: 54,
    borderWidth: 3,
    borderColor: 'transparent',
  },

  inputArea: {
    gap: 6,
  },

  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },

  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },

  saveButton: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#7B4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 11,
    elevation: 5,
  },

  saveText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  permissionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 22, 77, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  avatarModal: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 26,
    padding: 22,
  },

  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },

  avatarOption: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarOptionActive: {
    borderWidth: 2,
    borderColor: '#7B4DFF',
  },

  avatarOptionText: {
    fontSize: 31,
  },

  callModal: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 26,
    padding: 22,
  },

  responsavelItem: {
    minHeight: 64,
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },

  responsavelNome: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },

  responsavelTel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    marginTop: 2,
  },
});
import FeedbackModal from '@/components/FeedbackModal';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import {
  adicionarResponsavel,
  ALERTAS_PADRAO,
  emailValido,
  normalizarTelefoneBR,
} from '@/services/responsaveis';

const EMOJIS = [
  '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿',
  '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿',
  '👧🏻', '👧🏼', '👧🏽', '👧🏾', '👧🏿',
  '👦🏻', '👦🏼', '👦🏽', '👦🏾', '👦🏿',
  '👵🏻', '👵🏼', '👵🏽', '👵🏾', '👵🏿',
  '👴🏻', '👴🏼', '👴🏽', '👴🏾', '👴🏿',
  '🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿',
];

const PERMISSOES = [
  {
    titulo: 'Visualizar',
    descricao: 'Pode visualizar informações e receber alertas.',
    icon: 'eye-outline',
  },
  {
    titulo: 'Receber alertas',
    descricao: 'Recebe alertas importantes, sem acessar o app.',
    icon: 'notifications-outline',
  },
  {
    titulo: 'Controle total',
    descricao: 'Acesso completo para visualizar e gerenciar tudo.',
    icon: 'shield-checkmark-outline',
  },
];

export default function AdicionarResponsavel() {
  const theme = useTheme();
  const { user } = useAuth();

  const [nome, setNome] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const [tipoAcesso, setTipoAcesso] = useState('Visualizar');
  const [consentimento, setConsentimento] = useState(false);
  const [alertaCriticos, setAlertaCriticos] = useState(ALERTAS_PADRAO.criticos);
  const [alertaPresenca, setAlertaPresenca] = useState(ALERTAS_PADRAO.presenca);
  const [emoji, setEmoji] = useState('👩🏻');
  const [modalEmoji, setModalEmoji] = useState(false);
  const [modalPermissao, setModalPermissao] = useState(false);

  const [conviteEnviado, setConviteEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erroAlerta, setErroAlerta] = useState({ visible: false, title: '', message: '' });

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/(settings)/responsaveis');
  }

  async function handleConvidar() {
    const telefoneE164 = normalizarTelefoneBR(telefone);
    const aviso = (message: string) =>
      setErroAlerta({ visible: true, title: 'Verifique os dados', message });

    if (!nome.trim() || !parentesco.trim()) return aviso('Preencha o nome e o parentesco.');
    if (!telefoneE164) return aviso('Informe um telefone válido com DDD, ex.: (11) 99999-0000.');
    if (!emailValido(email)) {
      return aviso('Informe o e-mail da conta do responsável no InfasCare. É por ele que os alertas chegam.');
    }
    if (!consentimento) {
      return aviso('Confirme que o responsável concordou em receber comunicações do InfasCare.');
    }

    if (!user) return;

    try {
      setIsSubmitting(true);
      await adicionarResponsavel(user.uid, {
        emoji,
        nome: nome.trim(),
        parentesco: parentesco.trim(),
        permissao: tipoAcesso,
        conectado: false,
        telefone: telefone.trim(),
        telefoneE164,
        email: email.trim().toLowerCase(),
        localizacao: '',
        consentimento: true,
        alertas: { criticos: alertaCriticos, presenca: alertaPresenca },
      });
      setConviteEnviado(true);
    } catch (error) {
      console.error('Erro ao convidar responsável (InfasCare):', error);
      setErroAlerta({
        visible: true,
        title: 'Erro ao convidar',
        message: 'Não foi possível salvar. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const permissaoAtual = PERMISSOES.find((item) => item.titulo === tipoAcesso);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundSoft }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={voltar}
          style={[styles.backButton, { backgroundColor: theme.backgroundCard }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>
            Adicionar responsável
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Convide familiares ou cuidadores para receber alertas importantes.
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <TouchableOpacity
        style={styles.avatarArea}
        onPress={() => setModalEmoji(true)}
        activeOpacity={0.8}
      >
        <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
          <Text style={styles.avatarEmoji}>{emoji}</Text>
        </View>

        <View style={styles.cameraButton}>
          <Ionicons name="camera" size={15} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <Input label="Nome completo" icon="person-outline" placeholder="Digite o nome completo" theme={theme} value={nome} onChangeText={setNome} />
      <Input label="Parentesco" icon="heart-outline" placeholder="Ex: Mãe, Pai, Avó..." theme={theme} value={parentesco} onChangeText={setParentesco} />
      <Input label="Telefone" icon="call-outline" placeholder="(00) 00000-0000" theme={theme} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      <Input label="E-mail da conta no InfasCare" icon="mail-outline" placeholder="email@exemplo.com" theme={theme} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Tipo de acesso
      </Text>

      <TouchableOpacity
        style={[styles.permissionSelect, { backgroundColor: theme.backgroundCard, borderColor: theme.borderInput }]}
        onPress={() => setModalPermissao(true)}
        activeOpacity={0.8}
      >
        <View style={[styles.permissionIcon, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name={permissaoAtual?.icon as any} size={20} color="#7B4DFF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.permissionSelectTitle, { color: theme.text }]}>
            {tipoAcesso}
          </Text>
          <Text style={[styles.permissionSelectSubtitle, { color: theme.textSecondary }]}>
            Toque para alterar a permissão
          </Text>
        </View>

        <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Alertas que este responsável recebe
      </Text>

      <View style={[styles.locationCard, { backgroundColor: theme.backgroundCard }]}>
        <View style={[styles.locationIcon, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name="alert-circle-outline" size={18} color="#7B4DFF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.locationTitle, { color: theme.text }]}>
            Alertas críticos
          </Text>
          <Text style={[styles.locationSubtitle, { color: theme.textSecondary }]}>
            Temperatura alta com criança na cadeirinha.
          </Text>
        </View>

        <Switch
          value={alertaCriticos}
          onValueChange={setAlertaCriticos}
          accessibilityLabel="Alertas críticos"
          thumbColor="#FFFFFF"
          trackColor={{ false: theme.border, true: '#7B4DFF' }}
        />
      </View>

      <View style={[styles.locationCard, { backgroundColor: theme.backgroundCard }]}>
        <View style={[styles.locationIcon, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name="person-outline" size={18} color="#7B4DFF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.locationTitle, { color: theme.text }]}>
            Presença da criança
          </Text>
          <Text style={[styles.locationSubtitle, { color: theme.textSecondary }]}>
            Quando a criança é colocada ou retirada.
          </Text>
        </View>

        <Switch
          value={alertaPresenca}
          onValueChange={setAlertaPresenca}
          accessibilityLabel="Presença da criança"
          thumbColor="#FFFFFF"
          trackColor={{ false: theme.border, true: '#7B4DFF' }}
        />
      </View>

      <View style={[styles.locationCard, { backgroundColor: theme.backgroundCard }]}>
        <View style={[styles.locationIcon, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#7B4DFF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.locationTitle, { color: theme.text }]}>
            Consentimento do responsável
          </Text>
          <Text style={[styles.locationSubtitle, { color: theme.textSecondary }]}>
            Confirmo que esta pessoa concordou em receber comunicações do InfasCare no e-mail e telefone informados.
          </Text>
        </View>

        <Switch
          value={consentimento}
          onValueChange={setConsentimento}
          accessibilityLabel="Consentimento do responsável"
          thumbColor="#FFFFFF"
          trackColor={{ false: theme.border, true: '#7B4DFF' }}
        />
      </View>

      <TouchableOpacity
        style={[styles.inviteButton, { opacity: isSubmitting ? 0.7 : 1 }]}
        onPress={handleConvidar}
        disabled={isSubmitting}
      >
        <Text style={styles.inviteText}>{isSubmitting ? 'Enviando...' : 'Convidar responsável'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={voltar}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>

      <Modal visible={modalEmoji} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.emojiModal, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Escolha um avatar
              </Text>

              <TouchableOpacity onPress={() => setModalEmoji(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.emojiGrid}>
              {EMOJIS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.emojiOption,
                    { backgroundColor: theme.accentSoft },
                    emoji === item && styles.emojiOptionActive,
                  ]}
                  onPress={() => {
                    setEmoji(item);
                    setModalEmoji(false);
                  }}
                >
                  <Text style={styles.emojiText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalPermissao} transparent animationType="fade">
        <View style={styles.permissionOverlay}>
          <View style={[styles.permissionModal, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Escolha a permissão
              </Text>

              <TouchableOpacity onPress={() => setModalPermissao(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {PERMISSOES.map((item) => {
              const ativo = tipoAcesso === item.titulo;

              return (
                <TouchableOpacity
                  key={item.titulo}
                  style={[
                    styles.permissionItem,
                    {
                      backgroundColor: ativo ? theme.accentSoft : theme.backgroundSoft,
                      borderColor: ativo ? '#7B4DFF' : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setTipoAcesso(item.titulo);
                    setModalPermissao(false);
                  }}
                >
                  <View style={styles.permissionIcon}>
                    <Ionicons name={item.icon as any} size={20} color="#7B4DFF" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.permissionName, { color: theme.text }]}>
                      {item.titulo}
                    </Text>
                    <Text style={[styles.permissionDescription, { color: theme.textSecondary }]}>
                      {item.descricao}
                    </Text>
                  </View>

                  {ativo && (
                    <Ionicons name="checkmark-circle" size={24} color="#7B4DFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <FeedbackModal
        visible={conviteEnviado}
        title="Responsável cadastrado"
        message="Responsável cadastrado. Ele receberá os alertas ao entrar no app InfasCare com o e-mail informado e ativar as notificações."
        type="success"
        confirmText="Concluir"
        theme={theme}
        onConfirm={() => {
          setConviteEnviado(false);
          voltar();
        }}
      />

      <FeedbackModal
        visible={erroAlerta.visible}
        title={erroAlerta.title}
        message={erroAlerta.message}
        type="warning"
        confirmText="Entendi"
        theme={theme}
        onConfirm={() => setErroAlerta((atual) => ({ ...atual, visible: false }))}
      />
    </ScrollView>
  );
}

function Input({ label, icon, placeholder, arrow, theme, value, onChangeText, keyboardType, autoCapitalize }: any) {
  return (
    <View style={styles.inputArea}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View style={[styles.inputBox, { backgroundColor: theme.backgroundCard, borderColor: theme.borderInput }]}>
        <Ionicons name={icon} size={18} color="#9B75FF" />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />

        {arrow && <Ionicons name="chevron-down" size={18} color={theme.textMuted} />}
      </View>
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
    marginBottom: 24,
  },

  headerText: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },

  avatarArea: {
    alignItems: 'center',
    marginBottom: 18,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarEmoji: {
    fontSize: 42,
  },

  cameraButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    marginLeft: 52,
    borderWidth: 3,
    borderColor: 'transparent',
  },

  inputArea: {
    marginBottom: 13,
  },

  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginBottom: 7,
  },

  inputBox: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },

  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 9,
  },

  permissionSelect: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  permissionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  permissionSelectTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },

  permissionSelectSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    marginTop: 2,
  },

  locationCard: {
    minHeight: 64,
    borderRadius: 16,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 22,
    elevation: 1,
  },

  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  locationTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },

  locationSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    marginTop: 2,
  },

  inviteButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    elevation: 4,
  },

  inviteText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  cancelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#7B4DFF',
    textAlign: 'center',
    marginBottom: 40,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 22, 77, 0.35)',
    justifyContent: 'flex-end',
  },

  emojiModal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
  },

  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },

  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiOptionActive: {
    borderWidth: 2,
    borderColor: '#7B4DFF',
  },

  emojiText: {
    fontSize: 28,
  },

  permissionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 22, 77, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  permissionModal: {
    width: '100%',
    borderRadius: 24,
    padding: 22,
  },

  permissionItem: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1.5,
  },

  permissionName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },

  permissionDescription: {
    marginTop: 3,
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
});
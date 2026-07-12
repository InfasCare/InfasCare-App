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

  const [tipoAcesso, setTipoAcesso] = useState('Visualizar');
  const [compartilharLocalizacao, setCompartilharLocalizacao] = useState(true);
  const [emoji, setEmoji] = useState('👩🏻');
  const [modalEmoji, setModalEmoji] = useState(false);
  const [modalPermissao, setModalPermissao] = useState(false);

  const [conviteEnviado, setConviteEnviado] = useState(false);

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/(settings)/responsaveis');
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

      <Input label="Nome completo" icon="person-outline" placeholder="Digite o nome completo" theme={theme} />
      <Input label="Parentesco" icon="heart-outline" placeholder="Selecione o parentesco" arrow theme={theme} />
      <Input label="Telefone" icon="call-outline" placeholder="(00) 00000-0000" theme={theme} />
      <Input label="E-mail (opcional)" icon="mail-outline" placeholder="email@exemplo.com" theme={theme} />

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

      <View style={[styles.locationCard, { backgroundColor: theme.backgroundCard }]}>
        <View style={[styles.locationIcon, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name="lock-closed" size={18} color="#7B4DFF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.locationTitle, { color: theme.text }]}>
            Compartilhar localização
          </Text>
          <Text style={[styles.locationSubtitle, { color: theme.textSecondary }]}>
            Permitir que este responsável veja a localização.
          </Text>
        </View>

        <Switch
          value={compartilharLocalizacao}
          onValueChange={setCompartilharLocalizacao}
          thumbColor="#FFFFFF"
          trackColor={{ false: theme.border, true: '#7B4DFF' }}
        />
      </View>

      <TouchableOpacity
        style={styles.inviteButton}
        onPress={() => setConviteEnviado(true)}
      >
        <Text style={styles.inviteText}>Convidar responsável</Text>
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
        title="Convite enviado"
        message="O convite foi preparado com sucesso. O responsável receberá as instruções para acessar o InfantCare."
        type="success"
        confirmText="Concluir"
        theme={theme}
        onConfirm={() => {
          setConviteEnviado(false);
          voltar();
        }}
      />
    </ScrollView>
  );
}

function Input({ label, icon, placeholder, arrow, theme }: any) {
  return (
    <View style={styles.inputArea}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View style={[styles.inputBox, { backgroundColor: theme.backgroundCard, borderColor: theme.borderInput }]}>
        <Ionicons name={icon} size={18} color="#9B75FF" />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
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
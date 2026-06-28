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

const ACESSOS = [
  {
    key: 'Visualizar',
    icon: 'eye-outline' as const,
    title: 'Visualizar',
    subtitle: 'Pode visualizar informações e receber alertas.',
  },
  {
    key: 'Receber alertas',
    icon: 'notifications-outline' as const,
    title: 'Receber alertas',
    subtitle: 'Recebe alertas importantes, sem acessar o app.',
  },
  {
    key: 'Controle total',
    icon: 'shield-checkmark-outline' as const,
    title: 'Controle total',
    subtitle: 'Acesso completo para visualizar e gerenciar tudo.',
  },
];

export default function AdicionarResponsavel() {
  const theme = useTheme();

  const [tipoAcesso, setTipoAcesso] = useState('Visualizar');
  const [compartilharLocalizacao, setCompartilharLocalizacao] = useState(true);
  const [emoji, setEmoji] = useState('👩🏻');
  const [modalEmoji, setModalEmoji] = useState(false);

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/(settings)/responsaveis');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundSoft }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.backgroundCard }]}
          onPress={voltar}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>Novo responsável</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Convide para receber alertas importantes
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Avatar Picker */}
      <TouchableOpacity
        style={styles.avatarArea}
        onPress={() => setModalEmoji(true)}
        activeOpacity={0.8}
      >
        <View style={[styles.avatarRing, { borderColor: theme.tint }]}>
          <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          </View>
        </View>

        <View style={styles.cameraButton}>
          <Ionicons name="camera" size={14} color="#FFFFFF" />
        </View>

        <Text style={[styles.avatarHint, { color: theme.textMuted }]}>Toque para escolher</Text>
      </TouchableOpacity>

      {/* Form */}
      <View style={[styles.formCard, { backgroundColor: theme.backgroundCard }]}>
        <InputField
          theme={theme}
          label="Nome completo"
          icon="person-outline"
          placeholder="Digite o nome completo"
        />
        <InputField
          theme={theme}
          label="Parentesco"
          icon="heart-outline"
          placeholder="Selecione o parentesco"
          arrow
        />
        <InputField
          theme={theme}
          label="Telefone"
          icon="call-outline"
          placeholder="(00) 00000-0000"
        />
        <InputField
          theme={theme}
          label="E-mail (opcional)"
          icon="mail-outline"
          placeholder="email@exemplo.com"
          last
        />
      </View>

      {/* Access Type */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Tipo de acesso</Text>

      <View style={[styles.accessGroup, { backgroundColor: theme.backgroundCard }]}>
        {ACESSOS.map((a, i) => (
          <View key={a.key}>
            <AccessOption
              theme={theme}
              active={tipoAcesso === a.key}
              icon={a.icon}
              title={a.title}
              subtitle={a.subtitle}
              onPress={() => setTipoAcesso(a.key)}
            />
            {i < ACESSOS.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.border, marginLeft: 58 }]} />
            )}
          </View>
        ))}
      </View>

      {/* Location Toggle */}
      <View style={[styles.locationCard, { backgroundColor: theme.backgroundCard }]}>
        <View style={[styles.locationIcon, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name="location" size={18} color={theme.tint} />
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

      {/* Actions */}
      <TouchableOpacity style={styles.inviteButton} onPress={voltar}>
        <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
        <Text style={styles.inviteText}>Convidar responsável</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={voltar}>
        <Text style={[styles.cancelText, { color: theme.tint }]}>Cancelar</Text>
      </TouchableOpacity>

      {/* Emoji Modal */}
      <Modal visible={modalEmoji} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.emojiModal, { backgroundColor: theme.backgroundCard }]}>
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Escolha um avatar</Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: theme.backgroundSoft }]}
                onPress={() => setModalEmoji(false)}
              >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
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
    </ScrollView>
  );
}

function InputField({
  theme,
  label,
  icon,
  placeholder,
  arrow,
  last,
}: {
  theme: any;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  arrow?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.inputArea, last ? {} : styles.inputBorder]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color={theme.tint} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
        />
        {arrow && <Ionicons name="chevron-down" size={16} color={theme.textMuted} />}
      </View>
    </View>
  );
}

function AccessOption({
  theme,
  active,
  icon,
  title,
  subtitle,
  onPress,
}: {
  theme: any;
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.accessCard} onPress={onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.radio,
          { borderColor: active ? theme.tint : theme.border },
        ]}
      >
        {active && <View style={[styles.radioDot, { backgroundColor: theme.tint }]} />}
      </View>

      <View style={[styles.accessIcon, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={icon} size={18} color={theme.tint} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.accessTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.accessSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>

      {active && <Ionicons name="checkmark-circle" size={20} color={theme.tint} />}
    </TouchableOpacity>
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
    marginBottom: 24,
  },

  headerText: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
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

  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
  },

  avatarArea: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarEmoji: { fontSize: 44 },

  cameraButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    marginLeft: 58,
    borderWidth: 3,
    borderColor: 'transparent',
  },

  avatarHint: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    marginTop: 10,
  },

  formCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  inputArea: {
    paddingVertical: 14,
  },

  inputBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },

  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    height: 32,
  },

  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginBottom: 10,
  },

  accessGroup: {
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  accessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  accessIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  accessTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },

  accessSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    marginTop: 2,
  },

  locationCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
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
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#7B4DFF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  inviteText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  cancelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  emojiModal: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
  },

  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },

  emojiOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiOptionActive: {
    borderWidth: 2.5,
    borderColor: '#7B4DFF',
  },

  emojiText: { fontSize: 28 },
});
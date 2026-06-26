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

const EMOJIS = [
  '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿',
  '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿',
  '👧🏻', '👧🏼', '👧🏽', '👧🏾', '👧🏿',
  '👦🏻', '👦🏼', '👦🏽', '👦🏾', '👦🏿',
  '👵🏻', '👵🏼', '👵🏽', '👵🏾', '👵🏿',
  '👴🏻', '👴🏼', '👴🏽', '👴🏾', '👴🏿',
  '🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿',
];

export default function AdicionarResponsavel() {
  const [tipoAcesso, setTipoAcesso] = useState('Visualizar');
  const [compartilharLocalizacao, setCompartilharLocalizacao] = useState(true);
  const [emoji, setEmoji] = useState('👩🏻');
  const [modalEmoji, setModalEmoji] = useState(false);

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/(settings)/responsaveis');
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={voltar} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#21164D" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>Adicionar responsável</Text>
          <Text style={styles.subtitle}>
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
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{emoji}</Text>
        </View>

        <View style={styles.cameraButton}>
          <Ionicons name="camera" size={15} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <Input label="Nome completo" icon="person-outline" placeholder="Digite o nome completo" />
      <Input label="Parentesco" icon="heart-outline" placeholder="Selecione o parentesco" arrow />
      <Input label="Telefone" icon="call-outline" placeholder="(00) 00000-0000" />
      <Input label="E-mail (opcional)" icon="mail-outline" placeholder="email@exemplo.com" />

      <Text style={styles.sectionTitle}>Tipo de acesso</Text>

      <AccessOption
        active={tipoAcesso === 'Visualizar'}
        icon="eye-outline"
        title="Visualizar"
        subtitle="Pode visualizar informações e receber alertas."
        onPress={() => setTipoAcesso('Visualizar')}
      />

      <AccessOption
        active={tipoAcesso === 'Receber alertas'}
        icon="notifications-outline"
        title="Receber alertas"
        subtitle="Recebe alertas importantes, sem acessar o app."
        onPress={() => setTipoAcesso('Receber alertas')}
      />

      <AccessOption
        active={tipoAcesso === 'Controle total'}
        icon="shield-checkmark-outline"
        title="Controle total"
        subtitle="Acesso completo para visualizar e gerenciar tudo."
        onPress={() => setTipoAcesso('Controle total')}
      />

      <View style={styles.locationCard}>
        <View style={styles.locationIcon}>
          <Ionicons name="lock-closed" size={18} color="#7B4DFF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.locationTitle}>Compartilhar localização</Text>
          <Text style={styles.locationSubtitle}>
            Permitir que este responsável veja a localização.
          </Text>
        </View>

        <Switch
          value={compartilharLocalizacao}
          onValueChange={setCompartilharLocalizacao}
          thumbColor="#FFFFFF"
          trackColor={{ false: '#DCD7EA', true: '#7B4DFF' }}
        />
      </View>

      <TouchableOpacity style={styles.inviteButton} onPress={voltar}>
        <Text style={styles.inviteText}>Convidar responsável</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={voltar}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>

      <Modal visible={modalEmoji} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.emojiModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha um avatar</Text>

              <TouchableOpacity onPress={() => setModalEmoji(false)}>
                <Ionicons name="close" size={24} color="#21164D" />
              </TouchableOpacity>
            </View>

            <View style={styles.emojiGrid}>
              {EMOJIS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.emojiOption,
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

function Input({ label, icon, placeholder, arrow }: any) {
  return (
    <View style={styles.inputArea}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputBox}>
        <Ionicons name={icon} size={18} color="#9B75FF" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#B8B5C7"
        />

        {arrow && <Ionicons name="chevron-down" size={18} color="#B8B5C7" />}
      </View>
    </View>
  );
}

function AccessOption({ active, icon, title, subtitle, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.accessCard, active && styles.accessCardActive]}
    >
      <View style={[styles.radio, active && styles.radioActive]}>
        {active && <View style={styles.radioDot} />}
      </View>

      <View style={styles.accessIcon}>
        <Ionicons name={icon} size={19} color="#8B5CF6" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.accessTitle}>{title}</Text>
        <Text style={styles.accessSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FC',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#21164D',
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#6D6A80',
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
    backgroundColor: '#EFE8FF',
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
    borderColor: '#F8F7FC',
  },

  inputArea: {
    marginBottom: 13,
  },

  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#21164D',
    marginBottom: 7,
  },

  inputBox: {
    height: 50,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE8F6',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#21164D',
  },

  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#21164D',
    marginTop: 4,
    marginBottom: 9,
  },

  accessCard: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE8F6',
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  accessCardActive: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D3CEE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  radioActive: {
    borderColor: '#7B4DFF',
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7B4DFF',
  },

  accessIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  accessTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#21164D',
  },

  accessSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#8B879D',
    marginTop: 2,
  },

  locationCard: {
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F3EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  locationTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#21164D',
  },

  locationSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#8B879D',
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
    backgroundColor: '#FFFFFF',
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
    color: '#21164D',
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
    backgroundColor: '#F3EDFF',
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
});
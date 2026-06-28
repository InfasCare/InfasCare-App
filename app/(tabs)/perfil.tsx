import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme-color';

type PerfilData = {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  responsavel: string;
};

export default function Perfil() {
  const theme = useTheme();

  const [perfil, setPerfil] = useState<PerfilData>({
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    telefone: '(11) 99999-0000',
    endereco: 'São Paulo - SP',
    responsavel: 'Responsável principal',
  });

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(perfil);
  const [mostrarInfo, setMostrarInfo] = useState(false);

  function abrirEdicao() {
    setForm(perfil);
    setEditando(true);
  }

  function salvarPerfil() {
    setPerfil(form);
    setEditando(false);
  }

  function sair() {
    router.replace('/(auth)');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundSoft }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerIconBtn, { backgroundColor: theme.backgroundCard }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>Perfil</Text>

        <TouchableOpacity
          style={[styles.headerIconBtn, { backgroundColor: theme.backgroundCard }]}
          onPress={abrirEdicao}
        >
          <Ionicons name="pencil" size={18} color={theme.tint} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={34} color="#8B5CF6" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{perfil.nome}</Text>
          <Text style={styles.profileEmail}>{perfil.email}</Text>
        </View>

        <TouchableOpacity style={styles.editCircle} onPress={abrirEdicao}>
          <Ionicons name="create-outline" size={18} color="#7B4DFF" />
        </TouchableOpacity>
      </View>

      {/* Quick Info */}
      <View style={styles.quickInfo}>
        <InfoBox
          theme={theme}
          icon="shield-checkmark-outline"
          title="Status"
          value="Seguro"
          color="#22C55E"
        />
        <InfoBox
          theme={theme}
          icon="heart-outline"
          title="Conta"
          value="Ativa"
          color="#7B4DFF"
        />
      </View>

      {/* Menu */}
      <View style={[styles.menuSection, { backgroundColor: theme.backgroundCard }]}>
        <MenuItem
          theme={theme}
          icon="person-outline"
          title="Meu perfil"
          onPress={() => setMostrarInfo(!mostrarInfo)}
        />

        {mostrarInfo && (
          <View style={[styles.infoCard, { backgroundColor: theme.backgroundSoft }]}>
            <Detail theme={theme} icon="person" label="Nome" value={perfil.nome} />
            <Detail theme={theme} icon="mail" label="E-mail" value={perfil.email} />
            <Detail theme={theme} icon="call" label="Telefone" value={perfil.telefone} />
            <Detail theme={theme} icon="location" label="Endereço" value={perfil.endereco} />
            <Detail theme={theme} icon="star" label="Tipo" value={perfil.responsavel} />
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <MenuItem
          theme={theme}
          icon="people-outline"
          title="Crianças cadastradas"
          onPress={() => router.push('/(settings)/criancas')}
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <MenuItem
          theme={theme}
          icon="people-circle-outline"
          title="Responsáveis cadastrados"
          onPress={() => router.push('/(settings)/responsaveis')}
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <MenuItem
          theme={theme}
          icon="bluetooth-outline"
          title="Dispositivos conectados"
          onPress={() => router.push('/(settings)/dispositivos')}
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <MenuItem
          theme={theme}
          icon="settings-outline"
          title="Configurações"
          onPress={() => router.push('/(settings)/configuracoes')}
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <MenuItem
          theme={theme}
          icon="information-circle-outline"
          title="Sobre o aplicativo"
          onPress={() => router.push('/(settings)/sobre')}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.backgroundCard }]}
        onPress={sair}
      >
        <Ionicons name="log-out-outline" size={19} color="#FF4D4D" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal visible={editando} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.backgroundCard }]}>
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Editar perfil</Text>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: theme.backgroundSoft }]}
                onPress={() => setEditando(false)}
              >
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <InputField
              theme={theme}
              label="Nome"
              value={form.nome}
              onChangeText={(v: string) => setForm({ ...form, nome: v })}
            />
            <InputField
              theme={theme}
              label="E-mail"
              value={form.email}
              onChangeText={(v: string) => setForm({ ...form, email: v })}
            />
            <InputField
              theme={theme}
              label="Telefone"
              value={form.telefone}
              onChangeText={(v: string) => setForm({ ...form, telefone: v })}
            />
            <InputField
              theme={theme}
              label="Endereço"
              value={form.endereco}
              onChangeText={(v: string) => setForm({ ...form, endereco: v })}
            />

            <TouchableOpacity style={styles.saveButton} onPress={salvarPerfil}>
              <Text style={styles.saveText}>Salvar alterações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function MenuItem({
  theme,
  icon,
  title,
  onPress,
}: {
  theme: any;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
      }
      onPress={onPress}
    >
      <Animated.View style={[styles.menuItem, { transform: [{ scale }] }]}>
        <View style={[styles.menuIconCircle, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name={icon} size={17} color={theme.tint} />
        </View>
        <Text style={[styles.menuText, { color: theme.text }]}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      </Animated.View>
    </Pressable>
  );
}

function InfoBox({
  theme,
  icon,
  title,
  value,
  color,
}: {
  theme: any;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.infoBox, { backgroundColor: theme.backgroundCard }]}>
      <View style={[styles.infoIconCircle, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>{title}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function Detail({
  theme,
  icon,
  label,
  value,
}: {
  theme: any;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={16} color={theme.tint} />
      <View>
        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function InputField({
  theme,
  label,
  value,
  onChangeText,
}: {
  theme: any;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.inputArea}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBg,
            borderColor: theme.borderInput,
            color: theme.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={theme.textMuted}
      />
    </View>
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

  headerIconBtn: {
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

  profileCard: {
    borderRadius: 22,
    backgroundColor: '#7B4DFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#7B4DFF',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  profileName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },

  profileEmail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  editCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  infoBox: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  infoTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
  },

  infoValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginTop: 2,
  },

  menuSection: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },

  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    flex: 1,
  },

  divider: {
    height: 1,
    marginLeft: 46,
  },

  infoCard: {
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 4,
  },

  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  detailLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
  },

  detailValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },

  logoutButton: {
    height: 54,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  logoutText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#FF4D4D',
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalBox: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    gap: 14,
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputArea: {
    gap: 6,
  },

  inputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },

  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },

  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#7B4DFF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  saveText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
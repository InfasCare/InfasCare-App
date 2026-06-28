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
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundSoft }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>Perfil</Text>

        <TouchableOpacity onPress={abrirEdicao}>
          <Ionicons name="pencil" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={34} color="#8B5CF6" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{perfil.nome}</Text>
          <Text style={styles.email}>{perfil.email}</Text>
        </View>

        <TouchableOpacity style={styles.editCircle} onPress={abrirEdicao}>
          <Ionicons name="create-outline" size={18} color="#7B4DFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.quickInfo}>
        <InfoBox icon="shield-checkmark-outline" title="Status" value="Seguro" theme={theme} />
        <InfoBox icon="heart-outline" title="Conta" value="Ativa" theme={theme} />
      </View>

      <View style={styles.menu}>
        <MenuItem
          icon="person-outline"
          title="Meu perfil"
          onPress={() => setMostrarInfo(!mostrarInfo)}
          theme={theme}
        />

        {mostrarInfo && (
          <View style={[styles.infoCard, { backgroundColor: theme.backgroundCard }]}>
            <Detail icon="person" label="Nome" value={perfil.nome} theme={theme} />
            <Detail icon="mail" label="E-mail" value={perfil.email} theme={theme} />
            <Detail icon="call" label="Telefone" value={perfil.telefone} theme={theme} />
            <Detail icon="location" label="Endereço" value={perfil.endereco} theme={theme} />
            <Detail icon="star" label="Tipo" value={perfil.responsavel} theme={theme} />
          </View>
        )}

        <MenuItem
          icon="people-outline"
          title="Crianças cadastradas"
          onPress={() => router.push('/(settings)/criancas')}
          theme={theme}
        />

        <MenuItem
          icon="people-circle-outline"
          title="Responsáveis cadastrados"
          onPress={() => router.push('/(settings)/responsaveis')}
          theme={theme}
        />

        <MenuItem
          icon="bluetooth-outline"
          title="Dispositivos conectados"
          onPress={() => router.push('/(settings)/dispositivos')}
          theme={theme}
        />

        <MenuItem
          icon="settings-outline"
          title="Configurações"
          onPress={() => router.push('/(settings)/configuracoes')}
          theme={theme}
        />

        <MenuItem
          icon="information-circle-outline"
          title="Sobre o aplicativo"
          onPress={() => router.push('/(settings)/sobre')}
          theme={theme}
        />
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.backgroundCard }]} onPress={sair}>
        <Ionicons name="log-out-outline" size={19} color="#FF4D4D" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

      <Modal visible={editando} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Editar perfil</Text>

              <TouchableOpacity onPress={() => setEditando(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Input
              label="Nome"
              value={form.nome}
              onChangeText={(v: string) => setForm({ ...form, nome: v })}
              theme={theme}
            />

            <Input
              label="E-mail"
              value={form.email}
              onChangeText={(v: string) => setForm({ ...form, email: v })}
              theme={theme}
            />

            <Input
              label="Telefone"
              value={form.telefone}
              onChangeText={(v: string) => setForm({ ...form, telefone: v })}
              theme={theme}
            />

            <Input
              label="Endereço"
              value={form.endereco}
              onChangeText={(v: string) => setForm({ ...form, endereco: v })}
              theme={theme}
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
  icon,
  title,
  onPress,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
  theme: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;

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

        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
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
  return (
    <View style={styles.inputArea}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
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

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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

  input: {
    height: 48,
    borderRadius: 14,
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
});
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme-color';

type Responsavel = {
  id: number;
  emoji: string;
  nome: string;
  parentesco: string;
  permissao: string;
  conectado: boolean;
  telefone: string;
  email: string;
  localizacao: string;
};

export default function Responsaveis() {
  const theme = useTheme();

  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([
    {
      id: 1,
      emoji: '👩🏻',
      nome: 'Maria Oliveira',
      parentesco: 'Mãe',
      permissao: 'Principal',
      conectado: true,
      telefone: '(11) 99999-0000',
      email: 'maria@email.com',
      localizacao: 'Rua das Flores, Vila Carrão - SP',
    },
    {
      id: 2,
      emoji: '👨🏻',
      nome: 'Carlos Oliveira',
      parentesco: 'Pai',
      permissao: 'Emergência',
      conectado: true,
      telefone: '(11) 98888-0000',
      email: 'carlos@email.com',
      localizacao: 'Avenida Principal, Tatuapé - SP',
    },
    {
      id: 3,
      emoji: '👵🏻',
      nome: 'Ana Oliveira',
      parentesco: 'Avó',
      permissao: 'Visualização',
      conectado: false,
      telefone: '(11) 97777-0000',
      email: 'ana@email.com',
      localizacao: 'Praça Central, Penha - SP',
    },
  ]);

  const [selecionado, setSelecionado] = useState<Responsavel | null>(null);

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/(settings)/responsaveis');
  }

  function alternarConexao(id: number) {
    setResponsaveis((lista) =>
      lista.map((item) =>
        item.id === id ? { ...item, conectado: !item.conectado } : item
      )
    );

    setSelecionado((atual) =>
      atual && atual.id === id ? { ...atual, conectado: !atual.conectado } : atual
    );
  }

  function editarPermissao(id: number) {
    const opcoes = ['Principal', 'Emergência', 'Visualização', 'Controle total'];
    const atual = responsaveis.find((r) => r.id === id);
    if (!atual) return;

    const index = opcoes.indexOf(atual.permissao);
    const novaPermissao = opcoes[(index + 1) % opcoes.length];

    setResponsaveis((lista) =>
      lista.map((item) =>
        item.id === id ? { ...item, permissao: novaPermissao } : item
      )
    );

    setSelecionado((atualSelecionado) =>
      atualSelecionado && atualSelecionado.id === id
        ? { ...atualSelecionado, permissao: novaPermissao }
        : atualSelecionado
    );
  }

  function excluirResponsavel(id: number) {
    Alert.alert('Excluir responsável', 'Deseja remover este responsável?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          setResponsaveis((lista) => lista.filter((item) => item.id !== id));
          setSelecionado(null);
        },
      },
    ]);
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.backgroundSoft }]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={voltar} style={[styles.backButton, { backgroundColor: theme.backgroundCard }]}>
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>Responsáveis vinculados</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Compartilhe o monitoramento com segurança.
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/(settings)/adicionar-responsavel')}>
            <Ionicons name="add-circle" size={28} color="#7B4DFF" />
          </TouchableOpacity>
        </View>

        {responsaveis.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, { backgroundColor: theme.backgroundCard }]}
            activeOpacity={0.8}
            onPress={() => setSelecionado(item)}
          >
            <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.nome, { color: theme.text }]}>{item.nome}</Text>
              <Text style={[styles.parentesco, { color: '#7B4DFF' }]}>
                {item.parentesco} · {item.permissao}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color="#8B5CF6" />
                <Text style={[styles.locationText, { color: theme.textMuted }]}>
                  {item.conectado ? 'Localização ativa' : 'Última conexão: 2h atrás'}
                </Text>
              </View>
            </View>

            <View style={styles.statusArea}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.conectado ? '#2ECC71' : theme.textMuted },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: item.conectado ? '#2ECC71' : theme.textMuted },
                ]}
              >
                {item.conectado ? 'Conectado' : 'Offline'}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.addBox, { borderColor: '#A678FF', backgroundColor: theme.backgroundCard }]}
          onPress={() => router.push('/(settings)/adicionar-responsavel')}
        >
          <View style={styles.plusCircle}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>

          <Text style={styles.addTitle}>Adicionar responsável</Text>
          <Text style={[styles.addSubtitle, { color: theme.textSecondary }]}>
            Convide familiares ou cuidadores para receber alertas importantes.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={!!selecionado} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.backgroundCard }]}>
            {selecionado && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Informações do responsável</Text>
                  <TouchableOpacity onPress={() => setSelecionado(null)}>
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalEmoji}>{selecionado.emoji}</Text>
                <Text style={[styles.modalName, { color: theme.text }]}>{selecionado.nome}</Text>
                <Text style={[styles.modalSub, { color: '#7B4DFF' }]}>
                  {selecionado.parentesco} · {selecionado.permissao}
                </Text>

                <Info icon="call-outline" label="Telefone" value={selecionado.telefone} theme={theme} />
                <Info icon="mail-outline" label="E-mail" value={selecionado.email} theme={theme} />
                <Info icon="location-outline" label="Localização" value={selecionado.localizacao} theme={theme} />

                <View style={[styles.switchCard, { backgroundColor: theme.backgroundSoft }]}>
                  <Text style={[styles.switchText, { color: theme.text }]}>
                    {selecionado.conectado ? 'Conectado' : 'Desconectado'}
                  </Text>

                  <Switch
                    value={selecionado.conectado}
                    onValueChange={() => alternarConexao(selecionado.id)}
                    thumbColor="#FFFFFF"
                    trackColor={{ false: theme.border, true: '#7B4DFF' }}
                  />
                </View>

                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={() => editarPermissao(selecionado.id)}
                >
                  <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.permissionText}>Editar permissão</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: theme.backgroundSoft }]}
                  onPress={() => excluirResponsavel(selecionado.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
                  <Text style={styles.deleteText}>Excluir responsável</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Info({ icon, label, value, theme }: any) {
  return (
    <View style={[styles.infoRow, { backgroundColor: theme.backgroundSoft }]}>
      <Ionicons name={icon} size={19} color="#7B4DFF" />
      <View>
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 58 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
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
    fontSize: 18,
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },

  card: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  emoji: { fontSize: 30 },

  nome: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },

  parentesco: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginTop: 2,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },

  locationText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
  },

  statusArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    gap: 4,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
  },

  addBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 40,
  },

  plusCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  addTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#7B4DFF',
  },

  addSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
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
    fontSize: 17,
  },

  modalEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },

  modalName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },

  modalSub: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    textAlign: 'center',
  },

  infoRow: {
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  infoLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
  },

  infoValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },

  switchCard: {
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  switchText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },

  permissionButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  permissionText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  deleteButton: {
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },

  deleteText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#FF4D4D',
  },
});
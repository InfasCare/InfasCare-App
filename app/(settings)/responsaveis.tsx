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
      lista.map((item) => (item.id === id ? { ...item, conectado: !item.conectado } : item))
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
      lista.map((item) => (item.id === id ? { ...item, permissao: novaPermissao } : item))
    );
    setSelecionado((s) =>
      s && s.id === id ? { ...s, permissao: novaPermissao } : s
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

  const permissaoColor: Record<string, string> = {
    Principal: '#7B4DFF',
    Emergência: '#F59E0B',
    Visualização: '#3B82F6',
    'Controle total': '#22C55E',
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.backgroundSoft }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.backgroundCard }]}
            onPress={voltar}
          >
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>Responsáveis</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Compartilhe o monitoramento
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addIconBtn, { backgroundColor: theme.accentSoft }]}
            onPress={() => router.push('/(settings)/adicionar-responsavel')}
          >
            <Ionicons name="add" size={22} color={theme.tint} />
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View style={[styles.statsBar, { backgroundColor: theme.backgroundCard }]}>
          <StatItem theme={theme} value={`${responsaveis.length}`} label="Total" />
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <StatItem
            theme={theme}
            value={`${responsaveis.filter((r) => r.conectado).length}`}
            label="Online"
            valueColor="#22C55E"
          />
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <StatItem
            theme={theme}
            value={`${responsaveis.filter((r) => !r.conectado).length}`}
            label="Offline"
            valueColor={theme.textMuted}
          />
        </View>

        {/* Cards */}
        {responsaveis.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, { backgroundColor: theme.backgroundCard }]}
            activeOpacity={0.85}
            onPress={() => setSelecionado(item)}
          >
            <View style={[styles.emojiCircle, { backgroundColor: theme.accentSoft }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.nome, { color: theme.text }]}>{item.nome}</Text>

              <View style={styles.tagRow}>
                <Text style={[styles.parentescoTag, { color: theme.textSecondary }]}>
                  {item.parentesco}
                </Text>
                <View
                  style={[
                    styles.permissaoBadge,
                    { backgroundColor: `${permissaoColor[item.permissao]}18` },
                  ]}
                >
                  <Text
                    style={[
                      styles.permissaoText,
                      { color: permissaoColor[item.permissao] ?? theme.tint },
                    ]}
                  >
                    {item.permissao}
                  </Text>
                </View>
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={11} color={theme.tint} />
                <Text style={[styles.locationText, { color: theme.textMuted }]}>
                  {item.conectado ? 'Localização ativa' : 'Última conexão: 2h atrás'}
                </Text>
              </View>
            </View>

            <View style={styles.statusArea}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.conectado ? '#22C55E' : theme.textMuted },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: item.conectado ? '#22C55E' : theme.textMuted },
                ]}
              >
                {item.conectado ? 'Online' : 'Offline'}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Add Box */}
        <TouchableOpacity
          style={[styles.addBox, { borderColor: theme.tint, backgroundColor: theme.accentSoft }]}
          onPress={() => router.push('/(settings)/adicionar-responsavel')}
        >
          <View style={styles.plusCircle}>
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </View>
          <Text style={[styles.addTitle, { color: theme.tint }]}>Adicionar responsável</Text>
          <Text style={[styles.addSubtitle, { color: theme.textSecondary }]}>
            Convide familiares ou cuidadores para receber alertas importantes.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selecionado} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.backgroundCard }]}>
            {selecionado && (
              <>
                <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />

                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Detalhes do responsável
                  </Text>
                  <TouchableOpacity
                    style={[styles.closeBtn, { backgroundColor: theme.backgroundSoft }]}
                    onPress={() => setSelecionado(null)}
                  >
                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalProfile}>
                  <View style={[styles.modalEmojiCircle, { backgroundColor: theme.accentSoft }]}>
                    <Text style={styles.modalEmoji}>{selecionado.emoji}</Text>
                  </View>
                  <Text style={[styles.modalName, { color: theme.text }]}>{selecionado.nome}</Text>
                  <View
                    style={[
                      styles.permissaoBadge,
                      {
                        backgroundColor: `${permissaoColor[selecionado.permissao]}18`,
                        alignSelf: 'center',
                        marginTop: 4,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.permissaoText,
                        { color: permissaoColor[selecionado.permissao] ?? theme.tint },
                      ]}
                    >
                      {selecionado.parentesco} · {selecionado.permissao}
                    </Text>
                  </View>
                </View>

                <InfoRow theme={theme} icon="call-outline" label="Telefone" value={selecionado.telefone} />
                <InfoRow theme={theme} icon="mail-outline" label="E-mail" value={selecionado.email} />
                <InfoRow theme={theme} icon="location-outline" label="Localização" value={selecionado.localizacao} />

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
                  <Ionicons name="shield-checkmark-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.permissionText}>Alterar permissão</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: `#FF4D4D18` }]}
                  onPress={() => excluirResponsavel(selecionado.id)}
                >
                  <Ionicons name="trash-outline" size={17} color="#FF4D4D" />
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

function StatItem({
  theme,
  value,
  label,
  valueColor,
}: {
  theme: any;
  value: string;
  label: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: valueColor ?? theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function InfoRow({ theme, icon, label, value }: any) {
  return (
    <View style={[styles.infoRow, { backgroundColor: theme.backgroundSoft }]}>
      <View style={[styles.infoIconCircle, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={icon} size={17} color={theme.tint} />
      </View>
      <View>
        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 58, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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

  addIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 2,
  },

  statsBar: {
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },

  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 32,
  },

  card: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  emoji: { fontSize: 28 },

  nome: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },

  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },

  parentescoTag: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
  },

  permissaoBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  permissaoText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 3,
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 8,
  },

  plusCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#7B4DFF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  addTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },

  addSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalBox: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    gap: 12,
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
  },

  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },

  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalProfile: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  modalEmojiCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  modalEmoji: { fontSize: 40 },

  modalName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },

  infoRow: {
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  infoIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
  },

  infoValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },

  switchCard: {
    borderRadius: 14,
    padding: 14,
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
    borderRadius: 14,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#7B4DFF',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  permissionText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  deleteButton: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  deleteText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#FF4D4D',
  },
});
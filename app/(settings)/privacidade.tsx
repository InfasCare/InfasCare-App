import FeedbackModal from '@/components/FeedbackModal';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Privacidade() {
  const theme = useTheme();
  const { settings, updateSetting, resetSettings } = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/(settings)/configuracoes');
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.backgroundSoft }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.backgroundCard }]}
            onPress={voltar}
          >
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: theme.text }]}>Privacidade</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Gerencie dados e permissões
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundCard }]}>
          <Item
            icon="analytics-outline"
            title="Dados de uso"
            description="Permitir coleta anônima para melhorar o aplicativo"
            value={settings.usageAnalyticsEnabled}
            onChange={(value: boolean) =>
              updateSetting('usageAnalyticsEnabled', value)
            }
            theme={theme}
          />
          <Divider theme={theme} />
          <Item
            icon="time-outline"
            title="Salvar histórico"
            description="Guardar registros de alertas e localizações"
            value={settings.saveHistoryEnabled}
            onChange={(value: boolean) =>
              updateSetting('saveHistoryEnabled', value)
            }
            theme={theme}
          />
          <Divider theme={theme} />
          <Item
            icon="people-outline"
            title="Compartilhar com responsáveis"
            description="Permitir que responsáveis vinculados vejam informações"
            value={settings.shareWithGuardiansEnabled}
            onChange={(value: boolean) =>
              updateSetting('shareWithGuardiansEnabled', value)
            }
            theme={theme}
          />
        </View>

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: theme.backgroundCard }]}
          onPress={() => setConfirmReset(true)}
        >
          <Ionicons name="refresh-outline" size={20} color={theme.danger} />
          <Text style={[styles.resetText, { color: theme.danger }]}>
            Restaurar configurações
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FeedbackModal
        visible={confirmReset}
        title="Restaurar configurações"
        message="Todas as preferências locais voltarão ao padrão. Deseja continuar?"
        type="warning"
        confirmText="Restaurar"
        cancelText="Cancelar"
        showCancel
        theme={theme}
        onConfirm={async () => {
          await resetSettings();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </View>
  );
}

function Item({ icon, title, description, value, onChange, theme }: any) {
  return (
    <View style={styles.item}>
      <View style={[styles.icon, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={icon} size={20} color={theme.accent} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: theme.border, true: theme.accent }}
      />
    </View>
  );
}

function Divider({ theme }: any) {
  return <View style={[styles.divider, { backgroundColor: theme.borderInput }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 19 },
  subtitle: { fontFamily: 'Poppins-Regular', fontSize: 10, marginTop: 3 },
  card: { borderRadius: 22, paddingHorizontal: 15, elevation: 2 },
  item: { minHeight: 78, flexDirection: 'row', alignItems: 'center' },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: { flex: 1, paddingRight: 8 },
  itemTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 13 },
  itemDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
  resetButton: {
    minHeight: 54,
    borderRadius: 17,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    elevation: 2,
  },
  resetText: { fontFamily: 'Poppins-SemiBold', fontSize: 12 },
});

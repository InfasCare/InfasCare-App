import { useTheme } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Sobre() {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.backgroundSoft }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.back, { backgroundColor: theme.backgroundCard }]}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace('/(settings)/configuracoes')
            }
          >
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Sobre o aplicativo</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundCard }]}>
          <View style={[styles.logo, { backgroundColor: theme.accentSoft }]}>
            <Ionicons name="shield-checkmark-outline" size={38} color={theme.accent} />
          </View>
          <Text style={[styles.name, { color: theme.text }]}>InfantCare</Text>
          <Text style={[styles.version, { color: theme.textSecondary }]}>
            Versão 1.0.0
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Segurança, cuidado e tecnologia para acompanhar a cadeirinha e proteger quem mais importa.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 19,
  },
  card: { borderRadius: 24, padding: 24, alignItems: 'center', elevation: 2 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: 'Poppins-SemiBold', fontSize: 21, marginTop: 14 },
  version: { fontFamily: 'Poppins-Regular', fontSize: 10, marginTop: 2 },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 14,
  },
});

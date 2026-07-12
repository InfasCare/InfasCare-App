import { useTheme } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FAQ = [
  ['Como acompanho a localização?', 'Abra a aba Localização ou use o botão na tela da criança.'],
  ['Como adiciono um responsável?', 'Acesse Perfil, Responsáveis cadastrados e toque no botão de adicionar.'],
  ['Como altero as notificações?', 'Use os controles na tela de Configurações.'],
];

export default function Suporte() {
  const theme = useTheme();
  const [open, setOpen] = useState<number | null>(0);

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
          <Text style={[styles.title, { color: theme.text }]}>Central de ajuda</Text>
          <View style={{ width: 40 }} />
        </View>

        {FAQ.map(([question, answer], index) => (
          <TouchableOpacity
            key={question}
            style={[styles.card, { backgroundColor: theme.backgroundCard }]}
            onPress={() => setOpen(open === index ? null : index)}
          >
            <View style={styles.row}>
              <Text style={[styles.question, { color: theme.text }]}>{question}</Text>
              <Ionicons
                name={open === index ? 'chevron-up' : 'chevron-down'}
                size={19}
                color={theme.accent}
              />
            </View>
            {open === index && (
              <Text style={[styles.answer, { color: theme.textSecondary }]}>
                {answer}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.feedback, { backgroundColor: theme.backgroundCard }]}
          onPress={() => router.push('/(settings)/feedback')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.accent} />
          <Text style={[styles.feedbackText, { color: theme.text }]}>
            Enviar feedback
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>
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
  card: { borderRadius: 18, padding: 16, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  question: { flex: 1, fontFamily: 'Poppins-SemiBold', fontSize: 12 },
  answer: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 10,
  },
  feedback: {
    minHeight: 64,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    elevation: 1,
  },
  feedbackText: { flex: 1, fontFamily: 'Poppins-SemiBold', fontSize: 12 },
});

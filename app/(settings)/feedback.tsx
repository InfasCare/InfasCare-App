import FeedbackModal from '@/components/FeedbackModal';
import { useTheme } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Feedback() {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

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
          <Text style={[styles.title, { color: theme.text }]}>Enviar feedback</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundCard }]}>
          <Text style={[styles.label, { color: theme.text }]}>
            Conte como podemos melhorar
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            placeholder="Digite sua mensagem..."
            placeholderTextColor={theme.textMuted}
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.backgroundSoft,
                borderColor: theme.borderInput,
              },
            ]}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (message.trim().length >= 5) {
                setSent(true);
                setMessage('');
              }
            }}
          >
            <Ionicons name="send-outline" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FeedbackModal
        visible={sent}
        title="Feedback enviado"
        message="Obrigada por ajudar a melhorar o InfantCare."
        type="success"
        theme={theme}
        onConfirm={() => setSent(false)}
      />
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
  card: { borderRadius: 22, padding: 20, elevation: 2 },
  label: { fontFamily: 'Poppins-SemiBold', fontSize: 13, marginBottom: 10 },
  input: {
    minHeight: 180,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  button: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: '#7B4DFF',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
});

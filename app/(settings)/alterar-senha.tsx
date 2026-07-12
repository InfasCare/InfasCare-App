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

export default function AlterarSenha() {
  const theme = useTheme();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [message, setMessage] = useState<null | {
    title: string;
    body: string;
    type: 'success' | 'warning' | 'error';
  }>(null);

  function salvar() {
    if (!atual || !nova || !confirmar) {
      setMessage({
        title: 'Campos incompletos',
        body: 'Preencha todos os campos.',
        type: 'warning',
      });
      return;
    }

    if (nova.length < 8) {
      setMessage({
        title: 'Senha muito curta',
        body: 'Use pelo menos 8 caracteres.',
        type: 'warning',
      });
      return;
    }

    if (nova !== confirmar) {
      setMessage({
        title: 'Senhas diferentes',
        body: 'A confirmação precisa ser igual à nova senha.',
        type: 'error',
      });
      return;
    }

    // Conecte aqui ao endpoint real de alteração de senha do seu backend.
    setAtual('');
    setNova('');
    setConfirmar('');
    setMessage({
      title: 'Senha validada',
      body:
        'Os dados estão válidos. Para concluir no servidor, conecte esta função ao endpoint de alteração de senha.',
      type: 'success',
    });
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.backgroundSoft }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.backgroundCard }]}>
          <Field label="Senha atual" value={atual} onChange={setAtual} theme={theme} />
          <Field label="Nova senha" value={nova} onChange={setNova} theme={theme} />
          <Field
            label="Confirmar nova senha"
            value={confirmar}
            onChange={setConfirmar}
            theme={theme}
          />
          <TouchableOpacity style={styles.button} onPress={salvar}>
            <Text style={styles.buttonText}>Salvar nova senha</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FeedbackModal
        visible={Boolean(message)}
        title={message?.title ?? ''}
        message={message?.body ?? ''}
        type={message?.type ?? 'info'}
        theme={theme}
        onConfirm={() => setMessage(null)}
      />
    </View>
  );
}

function Header({ theme }: any) {
  return (
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
      <Text style={[styles.title, { color: theme.text }]}>Alterar senha</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

function Field({ label, value, onChange, theme }: any) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        secureTextEntry
        value={value}
        onChangeText={onChange}
        placeholder="••••••••"
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
  field: { marginBottom: 15 },
  label: { fontFamily: 'Poppins-Medium', fontSize: 12, marginBottom: 7 },
  input: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
});

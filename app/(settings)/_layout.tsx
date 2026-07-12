import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="configuracoes" />
      <Stack.Screen name="alterar-senha" />
      <Stack.Screen name="privacidade" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="sobre" />
      <Stack.Screen name="suporte" />
      <Stack.Screen name="criancas" />
      <Stack.Screen name="responsaveis" />
      <Stack.Screen name="adicionar-responsavel" />
      <Stack.Screen name="dispositivos" />
      <Stack.Screen name="localizacao-cadeirinha" />
      <Stack.Screen name="monitoramento" />
    </Stack>
  );
}
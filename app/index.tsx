// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Isso obriga o app a redirecionar para a tela inicial do grupo (auth)
  return <Redirect href="/(auth)" />;
}
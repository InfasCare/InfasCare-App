// app/_layout.tsx  ← substitua o seu arquivo existente por este

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import InfasCareSplash from '../components/AnimatedSplash';

// Mantém a splash nativa do Expo visível até as fontes carregarem
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular':  require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium':   require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  // Controla se o nosso splash animado já terminou
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      // Esconde a splash nativa do Expo assim que as fontes carregam,
      // nosso componente animado assume a partir daí.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Enquanto as fontes não carregam, não renderiza nada
  if (!fontsLoaded) return null;

  // Fontes prontas mas splash animado ainda rodando
  if (!splashDone) {
    return <InfasCareSplash onFinish={() => setSplashDone(true)} />;
  }

  // Splash terminou → app normal
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(settings)" />
</Stack>
  );
}
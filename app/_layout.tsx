import AppProviders from '@/components/AppProviders';
import { useAuth } from '@/contexts/AuthContext';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import InfasCareSplash from '../components/AnimatedSplash';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Evita erro caso a splash já tenha sido controlada anteriormente.
});

// Controla o acesso às rotas com base no estado de autenticação do Firebase:
// usuário deslogado é levado para (auth); usuário logado é tirado de (auth)/raiz.
function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(tabs)' || segments[0] === '(settings)';
    const naRaiz = segments[0] === undefined;

    if (!user && (inProtectedGroup || naRaiz)) {
      router.replace('/(auth)');
    } else if (user && (inAuthGroup || naRaiz)) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(settings)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync().catch(() => {
        // Evita interromper o aplicativo caso a splash já esteja escondida.
      });
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  if (!splashDone) {
    return (
      <InfasCareSplash
        onFinish={() => setSplashDone(true)}
      />
    );
  }

  return (
    <AppProviders>
      <AuthGate />
    </AppProviders>
  );
}
import AppProviders from '@/components/AppProviders';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import InfasCareSplash from '../components/AnimatedSplash';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Evita erro caso a splash já tenha sido controlada anteriormente.
});

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
    </AppProviders>
  );
}
import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, withRepeat, withSequence, withTiming, useAnimatedStyle,
} from 'react-native-reanimated';
import { Colors, Brand } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const C = Colors[scheme];

  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 1500 }),
        withTiming(0,  { duration: 1500 }),
      ), -1, true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/images/icone2.png')} style={styles.icon} />
        <Text style={styles.logoText}>
          <Text style={{ color: Brand.purple, fontFamily: 'Poppins-SemiBold' }}>Infas</Text>
          <Text style={{ color: Brand.blue,   fontFamily: 'Poppins-SemiBold' }}>Care</Text>
        </Text>
      </View>

      <Animated.View style={animatedStyle}>
        <Image
          source={require('../../assets/images/icone_cadeirinha.png')}
          style={styles.cadeirinhaImage}
        />
      </Animated.View>

      <Text style={[styles.title, { color: C.text }]}>Bem-vindo(a)!</Text>
      <Text style={[styles.subtitle, { color: C.textSecondary }]}>
        Acompanhe e proteja seu maior amor em tempo real.
      </Text>

      <TouchableOpacity
        style={[styles.buttonPrimary, { backgroundColor: Brand.purple }]}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.buttonTextPrimary}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonSecondary, { borderColor: Brand.purple }]}
        onPress={() => router.push('/(auth)/cadastro')}
      >
        <Text style={[styles.buttonTextSecondary, { color: Brand.purple }]}>Criar conta</Text>
      </TouchableOpacity>

      <Text style={[styles.footerLink, { color: Brand.purple }]}>Esqueci minha senha</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logoContainer:    { alignItems: 'center', marginBottom: 40 },
  icon:             { width: 150, height: 100, marginBottom: -20 },
  logoText:         { fontSize: 32, fontFamily: 'Poppins-SemiBold' },
  cadeirinhaImage:  { width: 250, height: 175, marginBottom: 5 },
  title:            { fontSize: 24, fontFamily: 'Poppins-SemiBold', marginBottom: 10, textAlign: 'center' },
  subtitle:         { textAlign: 'center', fontFamily: 'Poppins-Regular', marginBottom: 40 },
  buttonPrimary:    { width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  buttonTextPrimary:{ color: '#fff', fontFamily: 'Poppins-Medium' },
  buttonSecondary:  { borderWidth: 1, width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonTextSecondary: { fontFamily: 'Poppins-Medium' },
  footerLink:       { marginTop: 20, fontFamily: 'Poppins-Regular' },
});
import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming, 
  useAnimatedStyle 
} from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();
  
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 1500 }), 
        withTiming(0, { duration: 1500 })    
      ),
      -1, 
      true 
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Logo e Texto */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icone.png')} 
          style={styles.icon} 
        />
        <Text style={styles.logoText}>
          <Text style={{ color: '#6A5AE0', fontFamily: 'Poppins-SemiBold' }}>Infas</Text>
          <Text style={{ color: '#4A90E2', fontFamily: 'Poppins-SemiBold' }}>Care</Text>
        </Text>
      </View>

      {/* Imagem da cadeirinha com animação */}
      <Animated.View style={animatedStyle}>
        <Image 
          source={require('../../assets/images/icon_cadeirinha.png')} 
          style={styles.cadeirinhaImage} 
        />
      </Animated.View>

      <Text style={styles.title}>Bem-vindo(a)!</Text>
      <Text style={styles.subtitle}>Acompanhe e proteja seu maior amor em tempo real.</Text>

      <TouchableOpacity 
        style={styles.buttonPrimary} 
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.buttonTextPrimary}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.buttonSecondary} 
        onPress={() => router.push('/(auth)/cadastro')}
      >
        <Text style={styles.buttonTextSecondary}>Criar conta</Text>
      </TouchableOpacity>

      <Text style={styles.footerLink}>Esqueci minha senha</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  icon: { 
    width: 150, 
    height: 100, 
    marginBottom: -20 
  },
  logoText: { 
    fontSize: 32, 
    fontFamily: 'Poppins-SemiBold' 
  },
  cadeirinhaImage: { 
    width: 250, 
    height: 175, 
    marginBottom: 5 
  },
  title: { 
    fontSize: 24, 
    fontFamily: 'Poppins-SemiBold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  subtitle: { 
    textAlign: 'center', 
    color: '#8e8e93', 
    fontFamily: 'Poppins-Regular', 
    marginBottom: 40 
  },
  buttonPrimary: { 
    backgroundColor: '#6A5AE0', 
    width: '100%', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  buttonTextPrimary: { 
    color: '#fff', 
    fontFamily: 'Poppins-Medium' 
  },
  buttonSecondary: { 
    borderWidth: 1, 
    borderColor: '#6A5AE0', 
    width: '100%', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  buttonTextSecondary: { 
    color: '#6A5AE0', 
    fontFamily: 'Poppins-Medium' 
  },
  footerLink: { 
    marginTop: 20, 
    color: '#6A5AE0', 
    fontFamily: 'Poppins-Regular' 
  }
});
import { useTheme } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Sobre() {
  const theme = useTheme();

  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 0],
  });

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(settings)/configuracoes');
    }
  }

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.backgroundSoft },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.back,
              { backgroundColor: theme.backgroundCard },
            ]}
            onPress={voltar}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            Sobre o aplicativo
          </Text>

          <View style={{ width: 40 }} />
        </View>

        {/* CARD */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.backgroundCard,
              opacity: entrance,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* LOGO */}
          <Animated.View
            style={[
              styles.logoWrapper,
              { transform: [{ scale: pulse }] },
            ]}
          >
            <View
              style={[
                styles.logoGlow,
                { backgroundColor: theme.accentSoft },
              ]}
            />

            <View
              style={[
                styles.logo,
                { backgroundColor: theme.accentSoft },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={38}
                color={theme.accent}
              />
            </View>
          </Animated.View>

          <Text
            style={[
              styles.name,
              { color: theme.text },
            ]}
          >
            InfasCare
          </Text>

          <View
            style={[
              styles.versionBadge,
              { backgroundColor: theme.accentSoft },
            ]}
          >
            <Ionicons
              name="sparkles-outline"
              size={12}
              color={theme.accent}
            />

            <Text
              style={[
                styles.version,
                { color: theme.accent },
              ]}
            >
              Versão 1.0.0
            </Text>
          </View>

          <Text
            style={[
              styles.description,
              { color: theme.textSecondary },
            ]}
          >
            Segurança, cuidado e tecnologia para acompanhar
            a cadeirinha e proteger quem mais importa.
          </Text>

          {/* LINHA */}
          <View
            style={[
              styles.line,
              { backgroundColor: theme.borderInput },
            ]}
          />

          {/* STATUS */}
          <View style={styles.status}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: theme.accent },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                { color: theme.textSecondary },
              ]}
            >
              Aplicativo desenvolvido para facilitar o cuidado
              e o monitoramento.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

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

  card: {
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    elevation: 3,
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  logoWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    opacity: 0.45,
  },

  logo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    marginTop: 8,
  },

  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 6,
  },

  version: {
    fontFamily: 'Poppins-Medium',
    fontSize: 9,
  },

  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 18,
  },

  line: {
    width: '80%',
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 5,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  statusText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
    lineHeight: 14,
  },
});
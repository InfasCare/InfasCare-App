import { useTheme } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const FAQ = [
  [
    'Como acompanho a localização?',
    'Abra a aba Localização ou use o botão na tela da criança.',
    'location-outline',
  ],
  [
    'Como adiciono um responsável?',
    'Acesse Perfil, Responsáveis cadastrados e toque no botão de adicionar.',
    'people-outline',
  ],
  [
    'Como altero as notificações?',
    'Use os controles na tela de Configurações.',
    'notifications-outline',
  ],
];

export default function Suporte() {
  const theme = useTheme();

  const [open, setOpen] = useState<number | null>(0);

  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
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
        <Animated.View
          style={{
            opacity: entrance,
            transform: [{ translateY }],
          }}
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
              Central de ajuda
            </Text>

            <View style={{ width: 40 }} />
          </View>

          {/* INTRO */}
          <View
            style={[
              styles.intro,
              { backgroundColor: theme.accentSoft },
            ]}
          >
            <View
              style={[
                styles.introIcon,
                { backgroundColor: theme.backgroundCard },
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={23}
                color={theme.accent}
              />
            </View>

            <View style={styles.introContent}>
              <Text
                style={[
                  styles.introTitle,
                  { color: theme.text },
                ]}
              >
                Como podemos ajudar?
              </Text>

              <Text
                style={[
                  styles.introText,
                  { color: theme.textSecondary },
                ]}
              >
                Encontre respostas rápidas para as principais dúvidas.
              </Text>
            </View>
          </View>

          {/* FAQ */}
          {FAQ.map(([question, answer, icon], index) => {
            const isOpen = open === index;

            return (
              <FAQItem
                key={question}
                question={question}
                answer={answer}
                icon={icon}
                isOpen={isOpen}
                onPress={() =>
                  setOpen(isOpen ? null : index)
                }
                theme={theme}
              />
            );
          })}

          {/* FEEDBACK */}
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.feedback,
              { backgroundColor: theme.backgroundCard },
            ]}
            onPress={() =>
              router.push('/(settings)/feedback')
            }
          >
            <View
              style={[
                styles.feedbackIcon,
                { backgroundColor: theme.accentSoft },
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={theme.accent}
              />
            </View>

            <View style={styles.feedbackContent}>
              <Text
                style={[
                  styles.feedbackText,
                  { color: theme.text },
                ]}
              >
                Enviar feedback
              </Text>

              <Text
                style={[
                  styles.feedbackSub,
                  { color: theme.textSecondary },
                ]}
              >
                Ajude-nos a melhorar o InfasCare
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function FAQItem({
  question,
  answer,
  icon,
  isOpen,
  onPress,
  theme,
}: any) {
  const rotation = useRef(
    new Animated.Value(isOpen ? 1 : 0)
  ).current;

  const contentHeight = useRef(
    new Animated.Value(isOpen ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(rotation, {
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 3,
      }),

      Animated.timing(contentHeight, {
        toValue: isOpen ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const contentOpacity = contentHeight;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundCard,
          borderColor: isOpen
            ? theme.accent
            : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.questionIcon,
            {
              backgroundColor: isOpen
                ? theme.accent
                : theme.accentSoft,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={
              isOpen
                ? '#FFFFFF'
                : theme.accent
            }
          />
        </View>

        <Text
          style={[
            styles.question,
            { color: theme.text },
          ]}
        >
          {question}
        </Text>

        <Animated.View
          style={{
            transform: [{ rotate }],
          }}
        >
          <Ionicons
            name="chevron-down"
            size={19}
            color={theme.accent}
          />
        </Animated.View>
      </View>

      {isOpen && (
        <Animated.View
          style={{
            opacity: contentOpacity,
          }}
        >
          <View
            style={[
              styles.answerLine,
              { backgroundColor: theme.borderInput },
            ]}
          />

          <Text
            style={[
              styles.answer,
              { color: theme.textSecondary },
            ]}
          >
            {answer}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
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
    marginBottom: 22,
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

  intro: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  introIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },

  introText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  card: {
    borderRadius: 19,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  questionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  question: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    lineHeight: 17,
    paddingRight: 8,
  },

  answerLine: {
    height: StyleSheet.hairlineWidth,
    marginTop: 13,
    marginBottom: 11,
  },

  answer: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 16,
  },

  feedback: {
    minHeight: 68,
    borderRadius: 19,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    elevation: 2,
  },

  feedbackIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  feedbackContent: {
    flex: 1,
  },

  feedbackText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },

  feedbackSub: {
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
    marginTop: 2,
  },
});
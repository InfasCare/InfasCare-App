import FeedbackModal from '@/components/FeedbackModal';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Privacidade() {
  const theme = useTheme();
  const { settings, updateSetting, resetSettings } = useSettings();

  const [confirmReset, setConfirmReset] = useState(false);

  const screenAnim = useRef(new Animated.Value(0)).current;
  const resetRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(screenAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(settings)/configuracoes');
    }
  }

  function animarReset() {
    resetRotation.setValue(0);

    Animated.timing(resetRotation, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    setConfirmReset(true);
  }

  const translateY = screenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 0],
  });

  const resetRotate = resetRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
            opacity: screenAnim,
            transform: [{ translateY }],
          }}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.backButton,
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

            <View style={styles.headerCenter}>
              <Text
                style={[
                  styles.title,
                  { color: theme.text },
                ]}
              >
                Privacidade
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  { color: theme.textSecondary },
                ]}
              >
                Gerencie dados e permissões
              </Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* CARD PRINCIPAL */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundCard },
            ]}
          >
            <Item
              icon="analytics-outline"
              title="Dados de uso"
              description="Permitir coleta anônima para melhorar o aplicativo"
              value={settings.usageAnalyticsEnabled}
              onChange={(value: boolean) =>
                updateSetting(
                  'usageAnalyticsEnabled',
                  value
                )
              }
              theme={theme}
            />

            <Divider theme={theme} />

            <Item
              icon="time-outline"
              title="Salvar histórico"
              description="Guardar registros de alertas e localizações"
              value={settings.saveHistoryEnabled}
              onChange={(value: boolean) =>
                updateSetting(
                  'saveHistoryEnabled',
                  value
                )
              }
              theme={theme}
            />

            <Divider theme={theme} />

            <Item
              icon="people-outline"
              title="Compartilhar com responsáveis"
              description="Permitir que responsáveis vinculados vejam informações"
              value={settings.shareWithGuardiansEnabled}
              onChange={(value: boolean) =>
                updateSetting(
                  'shareWithGuardiansEnabled',
                  value
                )
              }
              theme={theme}
            />
          </View>

          {/* INFORMAÇÃO */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.accentSoft },
            ]}
          >
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: theme.backgroundCard },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color={theme.accent}
              />
            </View>

            <View style={styles.infoContent}>
              <Text
                style={[
                  styles.infoTitle,
                  { color: theme.text },
                ]}
              >
                Seus dados estão protegidos
              </Text>

              <Text
                style={[
                  styles.infoText,
                  { color: theme.textSecondary },
                ]}
              >
                Você pode alterar essas preferências a qualquer momento.
              </Text>
            </View>
          </View>

          {/* RESTAURAR */}
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.resetButton,
              { backgroundColor: theme.backgroundCard },
            ]}
            onPress={animarReset}
          >
            <Animated.View
              style={{
                transform: [{ rotate: resetRotate }],
              }}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={theme.danger}
              />
            </Animated.View>

            <Text
              style={[
                styles.resetText,
                { color: theme.danger },
              ]}
            >
              Restaurar configurações
            </Text>

            <Ionicons
              name="chevron-forward"
              size={17}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <FeedbackModal
        visible={confirmReset}
        title="Restaurar configurações"
        message="Todas as preferências locais voltarão ao padrão. Deseja continuar?"
        type="warning"
        confirmText="Restaurar"
        cancelText="Cancelar"
        showCancel
        theme={theme}
        onConfirm={async () => {
          await resetSettings();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </View>
  );
}

function Item({
  icon,
  title,
  description,
  value,
  onChange,
  theme,
}: any) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  }

  function pressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  }

  return (
    <Animated.View
      style={[
        styles.item,
        { transform: [{ scale }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.itemTouchable}
      >
        <View
          style={[
            styles.icon,
            { backgroundColor: theme.accentSoft },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={theme.accent}
          />
        </View>

        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              { color: theme.text },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.itemDescription,
              { color: theme.textSecondary },
            ]}
          >
            {description}
          </Text>
        </View>

        <Switch
          value={value}
          onValueChange={onChange}
          thumbColor="#FFFFFF"
          trackColor={{
            false: theme.border,
            true: theme.accent,
          }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

function Divider({ theme }: any) {
  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: theme.borderInput },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 19,
  },

  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    marginTop: 3,
  },

  card: {
    borderRadius: 23,
    paddingHorizontal: 15,
    elevation: 3,
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  item: {
    minHeight: 78,
  },

  itemTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  itemContent: {
    flex: 1,
    paddingRight: 8,
  },

  itemTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },

  itemDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 54,
  },

  infoCard: {
    marginTop: 15,
    borderRadius: 19,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
  },

  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  resetButton: {
    minHeight: 55,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 15,
    elevation: 2,
  },

  resetText: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    marginLeft: 9,
  },
});
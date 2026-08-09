import FeedbackModal from '@/components/FeedbackModal';
import { useTheme } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Animated,
  Easing,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

type PontoMapa = {
  latitude: number;
  longitude: number;
  endereco: string;
};

type Localizacao = {
  usuario: PontoMapa;
  cadeirinha: PontoMapa;
  distancia: string;
  tempo: string;
};

type InformacaoModal = {
  visible: boolean;
  title: string;
  message: string;
};

const LOCAIS: Localizacao[] = [
  {
    usuario: {
      latitude: -23.5361,
      longitude: -46.5623,
      endereco: 'Av. Conselheiro Carrão, São Paulo - SP',
    },
    cadeirinha: {
      latitude: -23.5382,
      longitude: -46.5655,
      endereco: 'Vila Carrão, São Paulo - SP',
    },
    distancia: '350 metros',
    tempo: '5 min',
  },
  {
    usuario: {
      latitude: -23.5409,
      longitude: -46.5764,
      endereco: 'Rua Antônio de Barros, Tatuapé - SP',
    },
    cadeirinha: {
      latitude: -23.5426,
      longitude: -46.5791,
      endereco: 'Próximo ao Tatuapé, São Paulo - SP',
    },
    distancia: '290 metros',
    tempo: '4 min',
  },
  {
    usuario: {
      latitude: -23.55052,
      longitude: -46.633308,
      endereco: 'Praça da Sé, São Paulo - SP',
    },
    cadeirinha: {
      latitude: -23.55185,
      longitude: -46.6351,
      endereco: 'Rua Boa Vista, São Paulo - SP',
    },
    distancia: '180 metros',
    tempo: '3 min',
  },
];

export default function LocalizacaoCadeirinha() {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const pageAnim = useRef(new Animated.Value(0)).current;
  const refreshAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pageAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [pageAnim]);

  const pageStyle = {
    opacity: pageAnim,
    transform: [{ translateY: pageAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  };

  const [localAtual, setLocalAtual] = useState(LOCAIS[0]);
  const [loading, setLoading] = useState(false);
  const [modalRota, setModalRota] = useState(false);

  const [informacao, setInformacao] = useState<InformacaoModal>({
    visible: false,
    title: '',
    message: '',
  });

  const horizontalPadding = width < 370 ? 16 : 24;
  const mapHeight = Math.min(Math.max(height * 0.46, 330), 440);
  const contentWidth = Math.min(width - horizontalPadding * 2, 720);

  const region = useMemo(
    () => ({
      latitude:
        (localAtual.usuario.latitude +
          localAtual.cadeirinha.latitude) /
        2,
      longitude:
        (localAtual.usuario.longitude +
          localAtual.cadeirinha.longitude) /
        2,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }),
    [localAtual],
  );

  const rota = useMemo(
    () => [
      {
        latitude: localAtual.usuario.latitude,
        longitude: localAtual.usuario.longitude,
      },
      {
        latitude: localAtual.cadeirinha.latitude,
        longitude: localAtual.cadeirinha.longitude,
      },
    ],
    [localAtual],
  );

  function voltar() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/perfil');
  }

  function mostrarLocalUsuario() {
    setInformacao({
      visible: true,
      title: 'Sua localização',
      message: localAtual.usuario.endereco,
    });
  }

  function mostrarLocalCadeirinha() {
    setInformacao({
      visible: true,
      title: 'Localização da cadeirinha',
      message: localAtual.cadeirinha.endereco,
    });
  }

  function recarregarLocalizacao() {
    setLoading(true);
    Animated.timing(refreshAnim, { toValue: 1, duration: 650, easing: Easing.linear, useNativeDriver: true }).start();

    setTimeout(() => {
      const locaisDiferentes = LOCAIS.filter(
        (item) =>
          item.cadeirinha.latitude !==
          localAtual.cadeirinha.latitude,
      );

      const novaLocalizacao =
        locaisDiferentes[
          Math.floor(Math.random() * locaisDiferentes.length)
        ] ?? LOCAIS[0];

      setLocalAtual(novaLocalizacao);
      setLoading(false);
      refreshAnim.setValue(0);

      setInformacao({
        visible: true,
        title: 'Localização atualizada',
        message:
          'A posição mais recente da cadeirinha foi carregada com sucesso.',
      });
    }, 1800);
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
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <View style={[styles.content, { maxWidth: contentWidth }]}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={voltar}
              style={[
                styles.headerButton,
                { backgroundColor: theme.backgroundCard },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={theme.text}
              />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={[styles.title, { color: theme.text }]}>
                Localização
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                Acompanhe a cadeirinha em tempo real
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={recarregarLocalizacao}
              style={[
                styles.headerButton,
                { backgroundColor: theme.backgroundCard },
              ]}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: refreshAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons
                  name="refresh"
                  size={21}
                  color="#7B4DFF"
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.mapCard,
              pageStyle,
              {
                height: mapHeight,
                backgroundColor: theme.backgroundCard,
              },
            ]}
          >
            <MapView
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFill}
              region={region}
              zoomEnabled
              scrollEnabled
              rotateEnabled
              pitchEnabled
              showsCompass
              toolbarEnabled={false}
            >
              <Marker
                coordinate={localAtual.usuario}
                title="Sua localização"
                description={localAtual.usuario.endereco}
                onPress={mostrarLocalUsuario}
              >
                <View style={styles.userMarkerOuter}>
                  <View style={styles.userMarker}>
                    <Ionicons
                      name="person"
                      size={17}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
              </Marker>

              <Marker
                coordinate={localAtual.cadeirinha}
                title="Cadeirinha"
                description={localAtual.cadeirinha.endereco}
                onPress={mostrarLocalCadeirinha}
              >
                <View style={styles.seatMarkerOuter}>
                  <View style={styles.seatMarker}>
                    <Text style={styles.seatEmoji}>💺</Text>
                  </View>
                </View>
              </Marker>

              <Polyline
                coordinates={rota}
                strokeColor="#7B4DFF"
                strokeWidth={5}
                lineDashPattern={[12, 9]}
                lineCap="round"
                lineJoin="round"
              />
            </MapView>

            <View
              style={[
                styles.mapInformation,
                {
                  backgroundColor: theme.backgroundCard,
                },
              ]}
            >
              <View style={styles.distanceArea}>
                <Text
                  style={[
                    styles.distanceLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Você está a
                </Text>

                <Text
                  style={[
                    styles.distanceValue,
                    { color: theme.text },
                  ]}
                >
                  {localAtual.distancia}
                </Text>

                <Text
                  style={[
                    styles.distanceLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  da cadeirinha
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.routeButton}
                onPress={() => setModalRota(true)}
              >
                <Ionicons
                  name="navigate-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.routeButtonText}>
                  Ver rota
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.statusCard,
              pageStyle,
              { backgroundColor: theme.backgroundCard },
            ]}
          >
            <InfoItem
              icon="person-outline"
              label="Sua localização"
              value={localAtual.usuario.endereco}
              theme={theme}
              onPress={mostrarLocalUsuario}
            />

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.borderInput },
              ]}
            />

            <InfoItem
              icon="location-outline"
              label="Cadeirinha"
              value={localAtual.cadeirinha.endereco}
              theme={theme}
              onPress={mostrarLocalCadeirinha}
            />

            <View
              style={[
                styles.divider,
                { backgroundColor: theme.borderInput },
              ]}
            />

            <InfoItem
              icon="time-outline"
              label="Tempo estimado"
              value={localAtual.tempo}
              theme={theme}
            />
          </Animated.View>
        </View>
      </ScrollView>

      <FeedbackModal
        visible={informacao.visible}
        title={informacao.title}
        message={informacao.message}
        type="location"
        confirmText="Entendi"
        theme={theme}
        onConfirm={() =>
          setInformacao((current) => ({
            ...current,
            visible: false,
          }))
        }
      />

      <Modal
        visible={loading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <View
            style={[
              styles.loadingCard,
              { backgroundColor: theme.backgroundCard },
            ]}
          >
            <View style={styles.loadingIllustration}>
              <View style={styles.loadingPulse}>
                <Ionicons
                  name="location"
                  size={31}
                  color="#7B4DFF"
                />
              </View>

              <View style={styles.loadingSeat}>
                <Text style={styles.loadingEmoji}>💺</Text>
              </View>
            </View>

            <Text
              style={[
                styles.loadingTitle,
                { color: theme.text },
              ]}
            >
              Localizando a cadeirinha
            </Text>

            <Text
              style={[
                styles.loadingDescription,
                { color: theme.textSecondary },
              ]}
            >
              Estamos buscando a posição mais recente do dispositivo.
            </Text>

            <ActivityIndicator
              size="small"
              color="#7B4DFF"
              style={styles.activityIndicator}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalRota}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setModalRota(false)}
      >
        <View style={styles.routeOverlay}>
          <View
            style={[
              styles.routeModal,
              {
                backgroundColor: theme.backgroundCard,
                maxHeight: height * 0.9,
              },
            ]}
          >
            <View style={styles.dragIndicator} />

            <View style={styles.routeHeader}>
              <View>
                <Text
                  style={[
                    styles.routeTitle,
                    { color: theme.text },
                  ]}
                >
                  Rota até a cadeirinha
                </Text>

                <Text
                  style={[
                    styles.routeSubtitle,
                    { color: theme.textSecondary },
                  ]}
                >
                  Aproximadamente {localAtual.tempo}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setModalRota(false)}
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.backgroundSoft },
                ]}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.routeScroll}
            >
              <View style={styles.routeMapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={StyleSheet.absoluteFill}
                  region={region}
                  zoomEnabled
                  scrollEnabled
                  rotateEnabled
                  pitchEnabled
                  toolbarEnabled={false}
                >
                  <Marker coordinate={localAtual.usuario}>
                    <View style={styles.smallUserMarker}>
                      <Ionicons
                        name="person"
                        size={15}
                        color="#FFFFFF"
                      />
                    </View>
                  </Marker>

                  <Marker coordinate={localAtual.cadeirinha}>
                    <View style={styles.smallSeatMarker}>
                      <Text style={styles.smallSeatEmoji}>
                        💺
                      </Text>
                    </View>
                  </Marker>

                  <Polyline
                    coordinates={rota}
                    strokeColor="#7B4DFF"
                    strokeWidth={5}
                    lineDashPattern={[12, 9]}
                  />
                </MapView>
              </View>

              <View
                style={[
                  styles.destinationCard,
                  { backgroundColor: theme.backgroundSoft },
                ]}
              >
                <View style={styles.destinationIcon}>
                  <Ionicons
                    name="location"
                    size={20}
                    color="#7B4DFF"
                  />
                </View>

                <View style={styles.destinationText}>
                  <Text
                    style={[
                      styles.destinationLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Destino
                  </Text>

                  <Text
                    style={[
                      styles.destinationValue,
                      { color: theme.text },
                    ]}
                  >
                    {localAtual.cadeirinha.endereco}
                  </Text>
                </View>
              </View>

              <RouteStep
                number="1"
                icon="walk-outline"
                text="Siga em frente a partir da sua localização."
                theme={theme}
              />

              <RouteStep
                number="2"
                icon="arrow-redo-outline"
                text="Vire à direita na próxima rua."
                theme={theme}
              />

              <RouteStep
                number="3"
                icon="navigate-outline"
                text="Continue seguindo a rota indicada no mapa."
                theme={theme}
              />

              <RouteStep
                number="4"
                icon="location-outline"
                text="A cadeirinha estará no marcador roxo."
                theme={theme}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.startRouteButton}
                onPress={() => {
                  setModalRota(false);

                  setInformacao({
                    visible: true,
                    title: 'Rota iniciada',
                    message:
                      'A navegação até a cadeirinha foi iniciada.',
                  });
                }}
              >
                <Ionicons
                  name="navigate"
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.startRouteText}>
                  Iniciar rota
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
  theme,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      style={styles.infoItem}
    >
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color="#7B4DFF" />
      </View>

      <View style={styles.infoContent}>
        <Text
          style={[
            styles.infoLabel,
            { color: theme.textSecondary },
          ]}
        >
          {label}
        </Text>

        <Text
          style={[styles.infoValue, { color: theme.text }]}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>

      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

function RouteStep({
  number,
  icon,
  text,
  theme,
}: any) {
  return (
    <View
      style={[
        styles.stepCard,
        { backgroundColor: theme.backgroundSoft },
      ]}
    >
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>

      <View style={styles.stepIcon}>
        <Ionicons name={icon} size={19} color="#7B4DFF" />
      </View>

      <Text style={[styles.stepText, { color: theme.text }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 54,
    paddingBottom: 36,
    alignItems: 'center',
  },

  content: {
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerButton: {
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
    paddingHorizontal: 8,
  },

  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 19,
    textAlign: 'center',
  },

  headerSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  mapCard: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 4,
  },

  userMarkerOuter: {
    padding: 5,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.20)',
  },

  userMarker: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  seatMarkerOuter: {
    padding: 5,
    borderRadius: 38,
    backgroundColor: 'rgba(123, 77, 255, 0.22)',
  },

  seatMarker: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#7B4DFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  seatEmoji: {
    fontSize: 26,
  },

  mapInformation: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    minHeight: 92,
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    shadowColor: '#21164D',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.14,
    shadowRadius: 14,

    elevation: 8,
  },

  distanceArea: {
    flexShrink: 1,
  },

  distanceLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
  },

  distanceValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 19,
    marginVertical: 1,
  },

  routeButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#7B4DFF',
    paddingHorizontal: 17,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  routeButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },

  statusCard: {
    width: '100%',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginTop: 18,
    elevation: 2,
  },

  infoItem: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
    paddingRight: 8,
  },

  infoLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
  },

  infoValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 49,
  },

  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 22, 68, 0.50)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 27,
    paddingVertical: 30,
    elevation: 12,
  },

  loadingIllustration: {
    width: 118,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  loadingPulse: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#F3EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingSeat: {
    position: 'absolute',
    right: 4,
    bottom: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  loadingEmoji: {
    fontSize: 27,
  },

  loadingTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    textAlign: 'center',
  },

  loadingDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  activityIndicator: {
    marginTop: 16,
  },

  routeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 22, 68, 0.45)',
    justifyContent: 'flex-end',
  },

  routeModal: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  dragIndicator: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D8D3E7',
    alignSelf: 'center',
    marginBottom: 13,
  },

  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  routeTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },

  routeSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    marginTop: 2,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  routeScroll: {
    paddingBottom: 28,
  },

  routeMapContainer: {
    width: '100%',
    height: 230,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
  },

  smallUserMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallSeatMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7B4DFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallSeatEmoji: {
    fontSize: 22,
  },

  destinationCard: {
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  destinationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  destinationText: {
    flex: 1,
  },

  destinationLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
  },

  destinationValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  stepCard: {
    minHeight: 61,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  stepNumber: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#7B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepNumberText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },

  stepIcon: {
    width: 34,
    alignItems: 'center',
  },

  stepText: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    lineHeight: 17,
  },

  startRouteButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#7B4DFF',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  startRouteText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
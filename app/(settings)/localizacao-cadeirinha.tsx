// app/(settings)/localizacao-cadeirinha.tsx
//
// Localização REAL, com a origem de cada dado explícita:
//  - Cadeirinha: o ESP32 do InfasCare NÃO tem GPS, então a posição da cadeirinha é
//    "indisponível". Nenhuma coordenada é inventada.
//  - Celular: posição obtida pelo próprio celular (expo-location), mostrada como
//    "localização do celular", nunca como se fosse a da cadeirinha.
// Nada é gravado no servidor (coleta mínima): a posição existe só nesta tela.

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '@/hooks/use-theme-color';
import { useDispositivoPrincipal } from '@/hooks/useDispositivoPrincipal';

type PosicaoCelular = {
  latitude: number;
  longitude: number;
  precisaoM: number | null;
  quando: number;
};

type Estado =
  | { tipo: 'inicial' }
  | { tipo: 'carregando' }
  | { tipo: 'ok'; posicao: PosicaoCelular }
  | { tipo: 'permissao-negada'; podePerguntar: boolean }
  | { tipo: 'servico-desligado' }
  | { tipo: 'sem-sinal' };

function formatarHora(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function LocalizacaoCadeirinha() {
  const theme = useTheme();
  const { dispositivo } = useDispositivoPrincipal();
  const [estado, setEstado] = useState<Estado>({ tipo: 'inicial' });

  const obterPosicao = useCallback(async () => {
    setEstado({ tipo: 'carregando' });
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== 'granted') perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setEstado({ tipo: 'permissao-negada', podePerguntar: perm.canAskAgain });
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        setEstado({ tipo: 'servico-desligado' });
        return;
      }
      const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setEstado({
        tipo: 'ok',
        posicao: {
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          precisaoM: p.coords.accuracy ?? null,
          quando: p.timestamp,
        },
      });
    } catch (error) {
      console.warn('Falha ao obter localização do celular:', error);
      setEstado({ tipo: 'sem-sinal' });
    }
  }, []);

  useEffect(() => {
    obterPosicao();
  }, [obterPosicao]);

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }

  const posicao = estado.tipo === 'ok' ? estado.posicao : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundSoft }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={[styles.backButton, { backgroundColor: theme.backgroundCard }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>Localização</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Cada informação mostra de onde ela vem.
          </Text>
        </View>
      </View>

      {/* ── Cadeirinha ── */}
      <View style={[styles.card, { backgroundColor: theme.backgroundCard }]}>
        <View style={styles.cardHead}>
          <Ionicons name="hardware-chip-outline" size={20} color="#7B4DFF" />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Cadeirinha (ESP32)</Text>
        </View>
        <Text style={[styles.big, { color: theme.text }]}>Localização indisponível</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Este dispositivo não tem GPS, então o InfasCare não sabe onde a cadeirinha está e não
          inventa uma posição.
        </Text>
        {dispositivo?.lastSeenAt != null && (
          <Text style={[styles.meta, { color: theme.textMuted }]}>
            Última comunicação com a cadeirinha: {formatarHora(dispositivo.lastSeenAt)}
          </Text>
        )}
      </View>

      {/* ── Celular ── */}
      <View style={[styles.card, { backgroundColor: theme.backgroundCard }]}>
        <View style={styles.cardHead}>
          <Ionicons name="phone-portrait-outline" size={20} color="#7B4DFF" />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Seu celular</Text>
        </View>
        <Text style={[styles.tag, { color: '#7B4DFF', backgroundColor: theme.accentSoft }]}>
          Esta é a localização do celular, não da cadeirinha
        </Text>

        {estado.tipo === 'carregando' && <ActivityIndicator style={{ marginVertical: 20 }} />}

        {posicao && (
          <>
            <View style={styles.mapBox}>
              <MapView
                style={StyleSheet.absoluteFill}
                region={{
                  latitude: posicao.latitude,
                  longitude: posicao.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker coordinate={posicao} title="Seu celular" />
              </MapView>
            </View>
            <Text style={[styles.body, { color: theme.text }]}>
              Latitude {posicao.latitude.toFixed(5)} · Longitude {posicao.longitude.toFixed(5)}
            </Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              Precisão: {posicao.precisaoM != null ? `± ${Math.round(posicao.precisaoM)} m` : 'não informada'} ·
              Atualizado às {formatarHora(posicao.quando)}
            </Text>
          </>
        )}

        {estado.tipo === 'permissao-negada' && (
          <>
            <Text style={[styles.body, { color: theme.textSecondary }]}>
              A permissão de localização foi negada. Sem ela não dá para mostrar a posição do celular.
            </Text>
            {!estado.podePerguntar && (
              <TouchableOpacity onPress={() => Linking.openSettings()} style={styles.linkBtn}>
                <Text style={styles.linkText}>Abrir ajustes do aparelho</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        {estado.tipo === 'servico-desligado' && (
          <Text style={[styles.body, { color: theme.textSecondary }]}>
            O serviço de localização do aparelho está desligado. Ative o GPS e tente de novo.
          </Text>
        )}
        {estado.tipo === 'sem-sinal' && (
          <Text style={[styles.body, { color: theme.textSecondary }]}>
            Não foi possível obter uma posição agora (sem sinal de GPS). Tente em local aberto.
          </Text>
        )}

        <TouchableOpacity
          onPress={obterPosicao}
          disabled={estado.tipo === 'carregando'}
          accessibilityRole="button"
          style={[styles.button, { opacity: estado.tipo === 'carregando' ? 0.6 : 1 }]}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.buttonText}>Atualizar posição do celular</Text>
        </TouchableOpacity>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          A posição fica só nesta tela: não é enviada nem guardada nos nossos servidores.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 58 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontFamily: 'Poppins-SemiBold' },
  subtitle: { fontSize: 13, fontFamily: 'Poppins-Regular' },
  card: { borderRadius: 20, padding: 18, marginBottom: 16, gap: 8 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
  big: { fontSize: 18, fontFamily: 'Poppins-SemiBold', marginTop: 4 },
  body: { fontSize: 14, fontFamily: 'Poppins-Regular', lineHeight: 21 },
  meta: { fontSize: 12, fontFamily: 'Poppins-Regular', lineHeight: 18 },
  tag: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mapBox: { height: 180, borderRadius: 16, overflow: 'hidden', marginVertical: 8 },
  button: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7B4DFF',
    borderRadius: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  buttonText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-SemiBold' },
  linkBtn: { paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  linkText: { color: '#7B4DFF', fontSize: 14, fontFamily: 'Poppins-SemiBold' },
});

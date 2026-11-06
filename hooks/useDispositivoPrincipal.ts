// hooks/useDispositivoPrincipal.ts
//
// Entrega, em tempo real, a cadeirinha que o app deve mostrar (Início e
// Monitoramento). Escolha do dispositivo:
//  1) entre os que já enviaram telemetria de verdade (ESP32), o principal
//     ou, se nenhum for principal, o que enviou por último;
//  2) se não houver nenhum real, o principal/primeiro (dispositivo simulado).
//
// "online" é recalculado a cada 5 s, porque um ESP32 desligado simplesmente
// para de escrever no Firestore e nenhum snapshot novo chega.

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ouvirDispositivos,
  estaOnline,
  estadoPresenca,
  type EstadoPresenca,
  type DispositivoFirestore,
} from '@/services/dispositivos';

export type DispositivoAoVivo = DispositivoFirestore & {
  online: boolean;
  /** Fonte única do estado de presença (use isto em vez de ler `presence`). */
  estadoPresenca: EstadoPresenca;
  /** ms desde a última telemetria (null se o dispositivo nunca enviou) */
  msDesdeUltimaLeitura: number | null;
};

export function useDispositivoPrincipal() {
  const { user } = useAuth();
  const [lista, setLista] = useState<DispositivoFirestore[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [daCache, setDaCache] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!user) {
      setLista([]);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    const cancelar = ouvirDispositivos(
      user.uid,
      (dispositivos, deCache) => {
        setLista(dispositivos);
        setDaCache(deCache);
        setCarregando(false);
      },
      () => setCarregando(false),
    );
    return cancelar;
  }, [user]);

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  const dispositivo: DispositivoAoVivo | null = useMemo(() => {
    if (lista.length === 0) return null;

    const reais = lista.filter((d) => d.lastSeenAt != null);
    const candidatos = reais.length > 0 ? reais : lista;

    const escolhido =
      candidatos.find((d) => d.isMain) ??
      [...candidatos].sort((a, b) => (b.lastSeenAt ?? 0) - (a.lastSeenAt ?? 0))[0];

    return {
      ...escolhido,
      online: estaOnline(escolhido, agora),
      estadoPresenca: estadoPresenca(escolhido, agora, daCache),
      msDesdeUltimaLeitura: escolhido.lastSeenAt != null ? agora - escolhido.lastSeenAt : null,
    };
  }, [lista, agora, daCache]);

  return { dispositivo, carregando };
}

// services/dispositivos.ts
//
// CRUD da coleção "dispositivos" no Firestore. Cada documento representa
// uma cadeirinha/dispositivo pareado, vinculado ao responsável logado
// (campo responsavelId = uid). As regras de segurança do Firestore
// garantem que cada responsável só enxerga e altera os próprios
// dispositivos.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export type DeviceStatus = 'conectado' | 'desconectado' | 'pareando';

export type DispositivoFirestore = {
  id: string;
  name: string;
  model: string;
  status: DeviceStatus;
  battery: number | null;      // null = o hardware não mede bateria
  signal: number;
  temperature: number | null;  // null = sem leitura do DHT11
  lastSeen: string;
  firmware: string;
  macAddress: string;
  isMain: boolean;
  presence: boolean | null;    // FSR: criança na cadeirinha (null = sem dado)
  lastSeenAt: number | null;   // ms desde 1970, gravado pelo ESP32 (hora do servidor)
  presencaDesde: number | null; // ms desde 1970 da ÚLTIMA MUDANÇA de presença (hora do servidor)
};

type NovoDispositivo = Omit<DispositivoFirestore, 'id' | 'presence' | 'lastSeenAt' | 'presencaDesde'>;

/**
 * Sem telemetria há mais que isso => dispositivo considerado offline.
 * O ESP32 envia a cada 30 s; 75 s = 2 envios perdidos. É o ÚNICO limite usado
 * em todo o app, para nenhuma tela mostrar um estado antigo como atual.
 */
export const OFFLINE_AFTER_MS = 75_000;

/**
 * Estado de presença exibido em TODAS as telas (fonte única).
 * - presente / ausente: leitura recente do ESP32
 * - offline: ESP32 sem comunicação (NÃO significa criança ausente)
 * - desconhecido: sem dado confiável (nunca enviou telemetria, campo ausente
 *   ou o app só tem dados em cache, sem confirmar com o servidor)
 */
export type EstadoPresenca = 'presente' | 'ausente' | 'offline' | 'desconhecido';

export function estadoPresenca(
  d: Pick<DispositivoFirestore, 'lastSeenAt' | 'presence'> | null | undefined,
  agora: number = Date.now(),
  daCache = false,
): EstadoPresenca {
  if (!d || d.lastSeenAt == null) return 'desconhecido';
  if (agora - d.lastSeenAt >= OFFLINE_AFTER_MS) return 'offline';
  if (daCache || d.presence == null) return 'desconhecido';
  return d.presence ? 'presente' : 'ausente';
}

/**
 * Online de verdade = o ESP32 enviou telemetria recentemente.
 * Dispositivos simulados (sem lastSeenAt) mantêm o status gravado.
 */
export function estaOnline(d: Pick<DispositivoFirestore, 'lastSeenAt' | 'status'>, agora: number = Date.now()): boolean {
  if (d.lastSeenAt != null) return agora - d.lastSeenAt < OFFLINE_AFTER_MS;
  return d.status === 'conectado';
}

/** "12 s", "3 min", "2 h", "1 d" — unidades iguais em qualquer idioma. */
export function formatarDuracao(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

const COLECAO = 'dispositivos';

/**
 * Escuta em tempo real os dispositivos pareados pelo responsável logado.
 * Retorna a função de unsubscribe — chame no cleanup do useEffect.
 */
export function ouvirDispositivos(
  responsavelId: string,
  callback: (dispositivos: DispositivoFirestore[], daCache: boolean) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const q = query(collection(db, COLECAO), where('responsavelId', '==', responsavelId));

  return onSnapshot(
    q,
    (snapshot) => {
      const lista: DispositivoFirestore[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          model: data.model,
          status: data.status,
          battery: typeof data.battery === 'number' ? data.battery : null,
          signal: typeof data.signal === 'number' ? data.signal : 0,
          temperature: typeof data.temperature === 'number' ? data.temperature : null,
          lastSeen: data.lastSeen ?? '',
          firmware: data.firmware ?? '',
          macAddress: data.macAddress ?? '',
          isMain: !!data.isMain,
          presence: typeof data.presence === 'boolean' ? data.presence : null,
          lastSeenAt: typeof data.lastSeenAt?.toMillis === 'function' ? data.lastSeenAt.toMillis() : null,
          presencaDesde: typeof data.presenceChangedAt?.toMillis === 'function' ? data.presenceChangedAt.toMillis() : null,
        };
      });
      // fromCache = o app está sem confirmação do servidor: não é um dado "ao vivo"
      callback(lista, snapshot.metadata.fromCache);
    },
    (error) => {
      console.error('Erro ao ouvir dispositivos (Firestore):', error);
      onError?.(error);
    },
  );
}

/**
 * Registra um dispositivo recém-pareado, vinculado ao responsável logado.
 * O Firestore gera um ID único para o documento (evita colisão entre
 * usuários diferentes "encontrando" o mesmo dispositivo simulado no scan).
 */
export async function adicionarDispositivo(
  responsavelId: string,
  dados: NovoDispositivo,
): Promise<string> {
  const docRef = await addDoc(collection(db, COLECAO), {
    ...dados,
    responsavelId,
    criadoEm: serverTimestamp(),
  });
  return docRef.id;
}

/** Atualiza campos de um dispositivo existente (nome, status, telemetria...). */
export async function atualizarDispositivo(
  id: string,
  alteracoes: Partial<NovoDispositivo>,
): Promise<void> {
  await updateDoc(doc(db, COLECAO, id), alteracoes);
}

/** Remove um dispositivo pareado. */
export async function removerDispositivo(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECAO, id));
}

/**
 * Define um dispositivo como principal, garantindo que nenhum outro
 * dispositivo do mesmo responsável continue marcado como principal
 * (operação atômica via batch write).
 */
export async function definirDispositivoPrincipal(
  responsavelId: string,
  idSelecionado: string,
  todosOsIds: string[],
): Promise<void> {
  const batch = writeBatch(db);
  for (const id of todosOsIds) {
    batch.update(doc(db, COLECAO, id), { isMain: id === idSelecionado });
  }
  await batch.commit();
}

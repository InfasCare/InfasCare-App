// services/eventos.ts
//
// Histórico de eventos de presença gravados pelo ESP32 na coleção "eventos".
// Cada documento é imutável (criado pelo firmware, nunca editado) e vinculado
// ao responsável dono do dispositivo (responsavelId = uid).
//
// Obs.: a consulta (responsavelId + criadoEm desc) exige um índice composto no
// Firestore. Na primeira execução o erro traz um link para criá-lo com 1 clique.

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export type TipoEventoPresenca = 'presenca' | 'ausencia';

export type EventoPresenca = {
  id: string;
  tipo: TipoEventoPresenca;
  deviceId: string;
  fsrRaw: number | null;
  /** ms desde 1970 (hora do servidor); null enquanto o servidor não confirmou */
  quando: number | null;
};

export function ouvirEventosPresenca(
  responsavelId: string,
  callback: (eventos: EventoPresenca[]) => void,
  onError?: (error: unknown) => void,
  limite = 200,
): Unsubscribe {
  const q = query(
    collection(db, 'eventos'),
    where('responsavelId', '==', responsavelId),
    orderBy('criadoEm', 'desc'),
    limit(limite),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const lista: EventoPresenca[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          if (data.tipo !== 'presenca' && data.tipo !== 'ausencia') return null;
          return {
            id: docSnap.id,
            tipo: data.tipo as TipoEventoPresenca,
            deviceId: typeof data.deviceId === 'string' ? data.deviceId : '',
            fsrRaw: typeof data.fsrRaw === 'number' ? data.fsrRaw : null,
            quando: typeof data.criadoEm?.toMillis === 'function' ? data.criadoEm.toMillis() : null,
          };
        })
        .filter((e): e is EventoPresenca => e !== null);
      callback(lista);
    },
    (error) => {
      console.error('Erro ao ouvir eventos (Firestore):', error);
      onError?.(error);
    },
  );
}

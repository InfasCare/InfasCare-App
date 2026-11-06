// services/alertas.ts
//
// CRUD da coleção "alertas" no Firestore. Representa os alertas gerados
// pelo sistema (risco detectado, temperatura alta, bateria fraca, etc.),
// vinculados ao responsável logado (campo responsavelId = uid). Em
// produção, esses documentos seriam criados por uma Cloud Function ao
// processar a telemetria do ESP32 — por enquanto, `criarAlerta` também
// serve para testar o fluxo manualmente pelo próprio app.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export type AlertType =
  | 'critico'
  | 'temperatura'
  | 'informativo'
  | 'sucesso'
  | 'bateria'
  | 'conexao'
  | 'localizacao';

export type Alerta = {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

type NovoAlerta = {
  type: AlertType;
  title: string;
  description: string;
};

const COLECAO = 'alertas';

/** Formata a hora/data de um alerta para exibição, a partir de um Timestamp do Firestore. */
function formatarHora(timestamp: any): string {
  const data: Date = timestamp?.toDate ? timestamp.toDate() : new Date();
  const hoje = new Date();
  const mesmoDia = data.toDateString() === hoje.toDateString();

  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (mesmoDia) return hora;

  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  if (data.toDateString() === ontem.toDateString()) return `Ontem ${hora}`;

  const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' });
  return `${diaSemana} ${hora}`;
}

/**
 * Escuta em tempo real os alertas do responsável logado, do mais recente
 * para o mais antigo. Retorna a função de unsubscribe.
 */
export function ouvirAlertas(
  responsavelId: string,
  callback: (alertas: Alerta[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLECAO),
    where('responsavelId', '==', responsavelId),
    orderBy('criadoEm', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const lista: Alerta[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          type: data.type,
          title: data.title,
          description: data.description,
          time: formatarHora(data.criadoEm),
          read: !!data.read,
        };
      });
      callback(lista);
    },
    (error) => {
      console.error('Erro ao ouvir alertas (Firestore):', error);
      onError?.(error);
    },
  );
}

/** Cria um novo alerta vinculado ao responsável logado. */
export async function criarAlerta(responsavelId: string, dados: NovoAlerta): Promise<string> {
  const docRef = await addDoc(collection(db, COLECAO), {
    ...dados,
    read: false,
    responsavelId,
    criadoEm: serverTimestamp(),
  });
  return docRef.id;
}

/** Marca um alerta como lido. */
export async function marcarAlertaComoLido(id: string): Promise<void> {
  await updateDoc(doc(db, COLECAO, id), { read: true });
}

/** Remove um alerta. */
export async function removerAlerta(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECAO, id));
}

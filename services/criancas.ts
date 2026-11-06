// services/criancas.ts
//
// CRUD da coleção "criancas" no Firestore. Cada documento pertence a um
// responsável (campo responsavelId = uid do usuário logado), e as regras
// de segurança do Firestore garantem que cada responsável só enxerga e
// altera as próprias crianças cadastradas.

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export type Crianca = {
  id: string;
  nome: string;
  idade: string;
  nascimento: string;
  sexo: string;
  foto: string;
};

type NovaCrianca = Omit<Crianca, 'id'>;

const COLECAO = 'criancas';

/**
 * Escuta em tempo real as crianças cadastradas pelo responsável logado.
 * Chama `callback` sempre que a lista mudar (adição, edição, remoção),
 * inclusive uma vez imediatamente com o estado atual.
 * Retorna a função de unsubscribe — chame no cleanup do useEffect.
 */
export function ouvirCriancas(
  responsavelId: string,
  callback: (criancas: Crianca[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const q = query(collection(db, COLECAO), where('responsavelId', '==', responsavelId));

  return onSnapshot(
    q,
    (snapshot) => {
      const lista: Crianca[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          nome: data.nome,
          idade: data.idade,
          nascimento: data.nascimento,
          sexo: data.sexo,
          foto: data.foto,
        };
      });
      callback(lista);
    },
    (error) => {
      console.error('Erro ao ouvir crianças (Firestore):', error);
      onError?.(error);
    },
  );
}

/** Cadastra uma nova criança vinculada ao responsável logado. */
export async function adicionarCrianca(responsavelId: string, dados: NovaCrianca): Promise<string> {
  const docRef = await addDoc(collection(db, COLECAO), {
    ...dados,
    responsavelId,
    criadoEm: serverTimestamp(),
  });
  return docRef.id;
}

/** Remove uma criança cadastrada (o próprio Firestore rejeita se não for do dono). */
export async function removerCrianca(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECAO, id));
}

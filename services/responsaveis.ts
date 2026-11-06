// services/responsaveis.ts
//
// CRUD da coleção "responsaveis" no Firestore. Representa os familiares/
// cuidadores convidados por um responsável (dono da conta) para
// acompanhar as crianças. Cada documento é vinculado ao uid de quem
// convidou (campo donoId), e as regras do Firestore garantem que só o
// dono da conta vê e altera esses convites.

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
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

/** Quais alertas este responsável quer receber. */
export type PreferenciasAlerta = {
  /** alertas críticos e de temperatura alta */
  criticos: boolean;
  /** criança colocada/retirada da cadeirinha (informativos) */
  presenca: boolean;
};

export type Responsavel = {
  id: string;
  emoji: string;
  nome: string;
  parentesco: string;
  permissao: string;
  conectado: boolean;
  telefone: string;
  /** Telefone normalizado (E.164, ex.: +5511999990000). Vazio em cadastros antigos. */
  telefoneE164: string;
  /** E-mail da conta do responsável no InfasCare: é por ele que os alertas chegam. */
  email: string;
  localizacao: string;
  /** O responsável concordou em receber comunicações do InfasCare? */
  consentimento: boolean;
  alertas: PreferenciasAlerta;
};

type NovoResponsavel = Omit<Responsavel, 'id'>;

export const ALERTAS_PADRAO: PreferenciasAlerta = { criticos: true, presenca: true };

/** E-mail com formato válido (validação simples; a conta real é checada no envio). */
export function emailValido(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
}

/**
 * Normaliza um telefone brasileiro para E.164 (+55 + DDD + número).
 * Aceita "(11) 99999-0000", "11999990000", "+55 11 99999-0000".
 * Retorna null se não for um número válido (DDD + 8 ou 9 dígitos).
 */
export function normalizarTelefoneBR(valor: string): string | null {
  let d = valor.replace(/\D/g, '');
  if (valor.trim().startsWith('+') && !d.startsWith('55')) return null; // outro país: não suportado aqui
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;
  if (d.length === 11 && d[2] !== '9') return null; // celular com 9 dígitos começa com 9
  return `+55${d}`;
}

const COLECAO = 'responsaveis';

/**
 * Escuta em tempo real os responsáveis convidados pelo dono da conta logado.
 * Retorna a função de unsubscribe — chame no cleanup do useEffect.
 */
export function ouvirResponsaveis(
  donoId: string,
  callback: (responsaveis: Responsavel[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const q = query(collection(db, COLECAO), where('donoId', '==', donoId));

  return onSnapshot(
    q,
    (snapshot) => {
      const lista: Responsavel[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          emoji: data.emoji,
          nome: data.nome,
          parentesco: data.parentesco,
          permissao: data.permissao,
          conectado: !!data.conectado,
          telefone: data.telefone ?? '',
          telefoneE164: data.telefoneE164 ?? '',
          email: data.email ?? '',
          localizacao: data.localizacao ?? '',
          consentimento: data.consentimento === true,
          alertas: {
            criticos: data.alertas?.criticos !== false,
            presenca: data.alertas?.presenca !== false,
          },
        };
      });
      callback(lista);
    },
    (error) => {
      console.error('Erro ao ouvir responsáveis (Firestore):', error);
      onError?.(error);
    },
  );
}

/** Convida/cadastra um novo responsável vinculado ao dono da conta logado. */
export async function adicionarResponsavel(donoId: string, dados: NovoResponsavel): Promise<string> {
  if (!dados.consentimento) {
    throw new Error('É necessário registrar o consentimento do responsável.');
  }
  const docRef = await addDoc(collection(db, COLECAO), {
    ...dados,
    donoId,
    criadoEm: serverTimestamp(),
    consentimentoEm: serverTimestamp(),
  });
  return docRef.id;
}

/** Atualiza campos de um responsável (permissão, status de conexão, etc). */
export async function atualizarResponsavel(id: string, alteracoes: Partial<NovoResponsavel>): Promise<void> {
  await updateDoc(doc(db, COLECAO, id), alteracoes);
}

/** Remove um responsável cadastrado. */
export async function removerResponsavel(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECAO, id));
}

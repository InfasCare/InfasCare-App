// services/push.ts
//
// Registro do token de notificações push deste aparelho para o usuário logado.
// O token fica em usuarios/{uid}/tokensPush/{token}; a Cloud Function de alertas
// (functions/src/index.ts) lê esses tokens para entregar as notificações.
//
// Requisitos reais (não dá para contornar):
//  - development build ou app publicado (NÃO funciona no Expo Go);
//  - projectId do EAS em app.json -> extra.eas.projectId;
//  - o usuário precisa aceitar a permissão de notificações no aparelho.

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export type ResultadoPush =
  | 'registrado'
  | 'indisponivel-expo-go'
  | 'indisponivel-web'
  | 'permissao-negada'
  | 'sem-project-id'
  | 'erro';

function projectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? (Constants as any).easConfig?.projectId;
}

async function obterToken(pedirPermissao: boolean): Promise<{ token?: string; resultado: ResultadoPush }> {
  if (Platform.OS === 'web') return { resultado: 'indisponivel-web' };
  if (Constants.appOwnership === 'expo') return { resultado: 'indisponivel-expo-go' };

  const id = projectId();
  if (!id) return { resultado: 'sem-project-id' };

  const Notifications = await import('expo-notifications');
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted' && pedirPermissao) {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return { resultado: 'permissao-negada' };

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId: id });
  return { token: data, resultado: 'registrado' };
}

/** Salva o token deste aparelho para o usuário (idempotente). */
export async function registrarTokenPush(uid: string): Promise<ResultadoPush> {
  try {
    const { token, resultado } = await obterToken(true);
    if (!token) return resultado;
    await setDoc(
      doc(db, 'usuarios', uid, 'tokensPush', token),
      { plataforma: Platform.OS, atualizadoEm: serverTimestamp() },
      { merge: true },
    );
    return 'registrado';
  } catch (error) {
    console.warn('Falha ao registrar token push:', error);
    return 'erro';
  }
}

/** Remove o token deste aparelho (usuário desligou as notificações ou saiu da conta). */
export async function removerTokenPush(uid: string): Promise<void> {
  try {
    const { token } = await obterToken(false);
    if (token) await deleteDoc(doc(db, 'usuarios', uid, 'tokensPush', token));
  } catch (error) {
    console.warn('Falha ao remover token push:', error);
  }
}

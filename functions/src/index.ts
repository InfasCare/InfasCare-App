// functions/src/index.ts
//
// Envio REAL de notificações push dos alertas do InfasCare.
//
// Fluxo:
//  1) O ESP32 cria um documento em "alertas" (responsavelId = uid do dono).
//  2) onAlertaCriado resolve os destinatários:
//       - o próprio dono (sempre);
//       - responsáveis cadastrados pelo dono (coleção "responsaveis") que deram
//         consentimento e querem aquele tipo de alerta. O vínculo é feito pelo
//         e-mail: se existir uma conta do InfasCare com esse e-mail, usamos os
//         tokens push dessa conta. Sem conta => registramos "falhou" (motivo claro).
//  3) Para cada destinatário grava notificacoes/{alertaId}_{uid} (id determinístico
//     => sem duplicidade, mesmo se a função rodar duas vezes) e envia via serviço
//     de push da Expo (que entrega por FCM no Android e APNs no iOS).
//  4) Estados: pendente -> enviado (o provedor aceitou) -> entregue (recibo confirmou)
//     ou falhou. "enviado" NÃO significa que chegou no aparelho.
//  5) verificarRecibos consulta os recibos do provedor e promove enviado -> entregue/falhou.
//
// NÃO há SMS nem WhatsApp aqui: exigem um provedor de mensageria contratado.

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

initializeApp();
const db = getFirestore();
const EXPO_SEND = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS = 'https://exp.host/--/api/v2/push/getReceipts';

type Categoria = 'criticos' | 'presenca' | null;

function categoria(tipo: string): Categoria {
  if (tipo === 'critico' || tipo === 'temperatura') return 'criticos';
  if (tipo === 'informativo') return 'presenca';
  return null; // outros tipos: só o dono
}

type Destinatario = { uid: string | null; nome: string; motivoFalha?: string };

async function resolverDestinatarios(donoUid: string, cat: Categoria): Promise<Destinatario[]> {
  const lista: Destinatario[] = [{ uid: donoUid, nome: 'dono' }];
  if (!cat) return lista;

  const snap = await db.collection('responsaveis').where('donoId', '==', donoUid).get();
  for (const d of snap.docs) {
    const r = d.data();
    if (r.consentimento !== true) continue;           // sem consentimento: nunca notificar
    if (r.alertas?.[cat] === false) continue;         // preferência desligada
    const nome = String(r.nome ?? 'responsável');
    const email = String(r.email ?? '').trim().toLowerCase();
    if (!email) { lista.push({ uid: null, nome, motivoFalha: 'responsável sem e-mail cadastrado' }); continue; }
    try {
      const u = await getAuth().getUserByEmail(email);
      if (u.uid !== donoUid) lista.push({ uid: u.uid, nome });
    } catch {
      lista.push({ uid: null, nome, motivoFalha: 'este e-mail ainda não tem conta no InfasCare' });
    }
  }
  return lista;
}

async function tokensDe(uid: string): Promise<string[]> {
  const snap = await db.collection('usuarios').doc(uid).collection('tokensPush').get();
  return snap.docs.map((d) => d.id);
}

export const onAlertaCriado = onDocumentCreated('alertas/{alertaId}', async (event) => {
  const alerta = event.data?.data();
  if (!alerta) return;
  const alertaId = event.params.alertaId;
  const donoUid = String(alerta.responsavelId ?? '');
  if (!donoUid) return;

  const critico = alerta.type === 'critico';
  const destinatarios = await resolverDestinatarios(donoUid, categoria(String(alerta.type)));

  for (const dest of destinatarios) {
    const chave = dest.uid ?? `sem-conta-${dest.nome}`.replace(/[^A-Za-z0-9_-]/g, '_');
    const ref = db.collection('notificacoes').doc(`${alertaId}_${chave}`);
    const base = {
      alertaId,
      donoId: donoUid,
      destinatarioUid: dest.uid,
      destinatarioNome: dest.nome,
      titulo: String(alerta.title ?? ''),
      canal: 'push',
      criadoEm: FieldValue.serverTimestamp(),
    };

    try {
      await ref.create({ ...base, estado: 'pendente' }); // falha se já existir => sem duplicidade
    } catch {
      logger.info('notificação já registrada, ignorando duplicata', { id: ref.id });
      continue;
    }

    if (!dest.uid) { await ref.update({ estado: 'falhou', erro: dest.motivoFalha }); continue; }
    const tokens = await tokensDe(dest.uid);
    if (tokens.length === 0) {
      await ref.update({ estado: 'falhou', erro: 'nenhum aparelho com notificações ativadas' });
      continue;
    }

    try {
      const resp = await fetch(EXPO_SEND, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(tokens.map((to) => ({
          to,
          title: String(alerta.title ?? 'InfasCare'),
          body: String(alerta.description ?? ''),
          sound: 'default',
          priority: critico ? 'high' : 'default',
          channelId: critico ? 'infantcare-critical' : 'infantcare-default',
          data: { alertaId, tipo: alerta.type },
        }))),
      });
      const json = (await resp.json()) as { data?: { status: string; id?: string; message?: string }[] };
      const tickets = json.data ?? [];
      const ok = tickets.filter((t) => t.status === 'ok' && t.id);
      if (ok.length > 0) {
        await ref.update({ estado: 'enviado', enviadoEm: FieldValue.serverTimestamp(), ticketIds: ok.map((t) => t.id) });
      } else {
        await ref.update({ estado: 'falhou', erro: tickets[0]?.message ?? `HTTP ${resp.status}` });
      }
    } catch (e) {
      await ref.update({ estado: 'falhou', erro: String((e as Error).message ?? e) });
    }
  }
});

// A cada 15 min confirma, nos recibos do provedor, o que foi mesmo entregue.
export const verificarRecibos = onSchedule('every 15 minutes', async () => {
  const snap = await db.collection('notificacoes').where('estado', '==', 'enviado').limit(200).get();
  for (const d of snap.docs) {
    const ids: string[] = d.data().ticketIds ?? [];
    if (ids.length === 0) continue;
    try {
      const resp = await fetch(EXPO_RECEIPTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const json = (await resp.json()) as { data?: Record<string, { status: string; message?: string }> };
      const recibos = Object.values(json.data ?? {});
      if (recibos.length === 0) continue; // recibo ainda não disponível
      if (recibos.some((r) => r.status === 'ok')) {
        await d.ref.update({ estado: 'entregue', entregueEm: FieldValue.serverTimestamp() });
      } else {
        await d.ref.update({ estado: 'falhou', erro: recibos[0]?.message ?? 'provedor reportou erro' });
      }
    } catch (e) {
      logger.warn('falha ao consultar recibos', { erro: String(e) });
    }
  }
});

// hooks/usePushRegistration.ts
//
// Mantém o token push deste aparelho em sincronia com a escolha do usuário:
// notificações LIGADAS nas configurações => registra; DESLIGADAS => remove.

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { registrarTokenPush, removerTokenPush } from '@/services/push';

export function usePushRegistration() {
  const { user } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    if (!user) return;
    if (settings.notificationsEnabled) registrarTokenPush(user.uid);
    else removerTokenPush(user.uid);
  }, [user, settings.notificationsEnabled]);
}

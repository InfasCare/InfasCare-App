// config/firebase.ts
//
// Configuração central do Firebase para o InfasCare.
//
// COMO OBTER SUAS CHAVES:
// 1. Acesse https://console.firebase.google.com e crie/abra seu projeto.
// 2. Vá em "Configurações do projeto" (ícone de engrenagem) > aba "Geral".
// 3. Em "Seus aplicativos", registre um app Web (ícone </>) caso ainda não exista.
// 4. Copie o objeto de configuração exibido e substitua os valores abaixo.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Chaves do projeto "infascare" no Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCpVxkMqtS0Qyhxhw_lcTcSW7gty0CYj1k",
  authDomain: "infascare.firebaseapp.com",
  projectId: "infascare",
  storageBucket: "infascare.firebasestorage.app",
  messagingSenderId: "283584429551",
  appId: "1:283584429551:web:226d4cba27419d2b4f0a1a"
};

// Evita reinicializar o app em Fast Refresh / múltiplos imports
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// No mobile (Android/iOS) usamos AsyncStorage para persistir a sessão do usuário
// entre aberturas do app. No Web, o próprio SDK já persiste via IndexedDB/localStorage.
let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // initializeAuth já foi chamado antes (comum durante Fast Refresh no Expo Go)
    auth = getAuth(app);
  }
}

const db: Firestore = getFirestore(app);

export { app, auth, db };

// contexts/AuthContext.tsx
//
// Contexto global de autenticação do InfasCare.
// Envolve o Firebase Authentication e cria/lê o perfil do responsável
// na coleção "usuarios" do Firestore.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

type RegisterData = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (data: RegisterData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Traduz os códigos de erro do Firebase Auth para mensagens amigáveis em
 * português, para exibir nos alertas de erro das telas de login/cadastro.
 */
export function traduzErroFirebase(codigo?: string): string {
  const mensagens: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/weak-password': 'A senha deve ter no mínimo 6 caracteres.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
    'auth/operation-not-allowed': 'Login por e-mail/senha não está ativado no Firebase. Ative em Authentication > Sign-in method.',
    'auth/invalid-api-key': 'Chave de API do Firebase inválida. Confira config/firebase.ts.',
    'auth/configuration-not-found': 'Provedor de e-mail/senha não configurado no Firebase Console.',
  };
  return mensagens[codigo ?? ''] || 'Ocorreu um erro. Tente novamente.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observa mudanças no estado de login (login, logout, sessão restaurada)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signUp({ name, email, password, cpf, phone }: RegisterData) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(credential.user, { displayName: name });

    // Cria o documento do responsável na coleção "usuarios", usando o
    // próprio uid do Auth como id do documento (facilita consultas futuras)
    await setDoc(doc(db, 'usuarios', credential.user.uid), {
      nome: name,
      email,
      cpf,
      telefone: phone,
      criadoEm: serverTimestamp(),
    });
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>');
  }
  return context;
}

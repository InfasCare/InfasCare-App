// app/index.tsx
//
// O redirecionamento real (para "(auth)" ou "(tabs)", dependendo do estado
// de login) é feito pelo AuthGate em app/_layout.tsx assim que ele sabe se
// há um usuário autenticado. Esta tela fica em branco por uma fração de
// segundo enquanto isso é decidido.
export default function Index() {
  return null;
}
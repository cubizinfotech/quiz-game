import { AuthProvider } from './context/AuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <AppRouter />
      </UserAuthProvider>
    </AuthProvider>
  );
}

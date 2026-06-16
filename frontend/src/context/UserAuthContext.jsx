import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Guard against double-invocation in React StrictMode
  const guestCreating = useRef(false);

  const initGuest = useCallback(async () => {
    if (guestCreating.current || localStorage.getItem('user_token')) return;
    guestCreating.current = true;
    try {
      const res = await api.post('/users/guest');
      const { token, user: guestUser } = res.data.data;
      localStorage.setItem('user_token', token);
      setUser(guestUser);
    } catch {
      // Backend unavailable — app still works, attempts just won't be linked to a user
    } finally {
      guestCreating.current = false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (token) {
      api.get('/users/me')
        .then((res) => { setUser(res.data.data); setLoading(false); })
        .catch(() => {
          localStorage.removeItem('user_token');
          initGuest().finally(() => setLoading(false));
        });
    } else {
      initGuest().finally(() => setLoading(false));
    }
  }, [initGuest]);

  const login = async (email, password) => {
    const res = await api.post('/users/login', { email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('user_token', token);
    setUser(userData);
    return userData;
  };

  // Signup converts current guest session → registered account (quiz history preserved)
  const signup = async (username, email, password) => {
    const res = await api.post('/users/register', { username, email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('user_token', token);
    setUser(userData);
    return userData;
  };

  const logout = useCallback(async () => {
    localStorage.removeItem('user_token');
    setUser(null);
    await initGuest();
  }, [initGuest]);

  // Called after a successful coin claim to keep the navbar balance in sync
  const updateCoins = useCallback((newBalance) => {
    setUser((prev) => prev ? { ...prev, coins: newBalance } : prev);
  }, []);

  const isGuest = !user || user.isGuest === true;
  const isAuthenticated = !!user && !user.isGuest;

  return (
    <UserAuthContext.Provider value={{ user, loading, isGuest, isAuthenticated, login, signup, logout, updateCoins }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
};

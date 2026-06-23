import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Guard against double-invocation in React StrictMode
  const guestCreating = useRef(false);

  const initGuest = useCallback(async () => {
    if (guestCreating.current || localStorage.getItem('user_token') || sessionStorage.getItem('user_token')) return;
    guestCreating.current = true;
    try {
      const res = await api.post('/users/guest');
      const { token, user: guestUser } = res.data.data;
      sessionStorage.setItem('user_token', token); // clears when tab closes
      setUser(guestUser);
    } catch {
      // Backend unavailable — app still works, attempts just won't be linked to a user
    } finally {
      guestCreating.current = false;
    }
  }, []);

  useEffect(() => {
    const localToken = localStorage.getItem('user_token');
    const sessionToken = sessionStorage.getItem('user_token');

    if (localToken) {
      // Validate — only real (non-guest) users should persist across tabs
      api.get('/users/me')
        .then((res) => {
          const userData = res.data.data;
          if (userData.isGuest) {
            // Guest token must not survive tab closes — clear and start fresh
            localStorage.removeItem('user_token');
            initGuest().finally(() => setLoading(false));
          } else {
            setUser(userData);
            setLoading(false);
          }
        })
        .catch(() => {
          localStorage.removeItem('user_token');
          initGuest().finally(() => setLoading(false));
        });
    } else if (sessionToken) {
      // Restore current tab's guest session (persists while the tab is open)
      api.get('/users/me')
        .then((res) => { setUser(res.data.data); setLoading(false); })
        .catch(() => {
          sessionStorage.removeItem('user_token');
          initGuest().finally(() => setLoading(false));
        });
    } else {
      // No token at all — new tab or tab was closed → fresh guest
      initGuest().finally(() => setLoading(false));
    }
  }, [initGuest]);

  const login = async (email, password) => {
    const res = await api.post('/users/login', { email, password });
    const { token, user: userData } = res.data.data;
    sessionStorage.removeItem('user_token'); // drop the guest session
    localStorage.setItem('user_token', token); // persist real user across tabs
    setUser(userData);
    return userData;
  };

  // Signup converts current guest session → registered account (quiz history preserved)
  const signup = async (username, email, password) => {
    const res = await api.post('/users/register', { username, email, password });
    const { token, user: userData } = res.data.data;
    sessionStorage.removeItem('user_token'); // drop the guest session
    localStorage.setItem('user_token', token); // persist real user across tabs
    setUser(userData);
    return userData;
  };

  const logout = useCallback(async () => {
    localStorage.removeItem('user_token');
    sessionStorage.removeItem('user_token');
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

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, ApiError, clearAuthToken, setAuthToken, type User } from '../api/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .me()
      .then(({ user: current }) => {
        if (!cancelled) setUser(current);
      })
      .catch((err: unknown) => {
        if (!cancelled && !(err instanceof ApiError && err.status === 401)) {
          console.error(err);
        }
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            clearAuthToken();
          }
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (input: { name: string; email: string; password: string }) => {
    const { user: created, token } = await api.signup(input);
    setAuthToken(token);
    setUser(created);
  }, []);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const { user: current, token } = await api.login(input);
    setAuthToken(token);
    setUser(current);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    clearAuthToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signup, login, logout, setUser }),
    [user, loading, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as api from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const storedToken = localStorage.getItem('token');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(storedToken);
  const [loading, setLoading] = useState(Boolean(storedToken));

  useEffect(() => {
    if (token) {
      api.setAuthToken(token);
      api.getProfile()
        .then(response => {
          const userData = response.data.user;
          if (userData.role !== 'admin') {
            // Redirect non-admin users
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          } else {
            setUser(userData);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    const userData = response.data.user;

    if (userData.role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }

    setToken(response.data.token);
    setUser(userData);
    localStorage.setItem('token', response.data.token);
    api.setAuthToken(response.data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    api.setAuthToken('');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

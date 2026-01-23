import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiBaseUrl } from './utils/api';



export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean; // ⬅️ TAMBAH
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ⬅️ TAMBAH

  // Saat refresh Cek Session

  // 🔥 CEK SESSION SAAT REFRESH
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        console.error('Session check failed', e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // 

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 🔥 WAJIB UNTUK SESSION
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) return false;

      const data = await res.json();
      setUser(data.user);
      return true;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  };

  const logout = async () => {
    await fetch(`${getApiBaseUrl()}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        // isAdmin
        // edit 20260123
         isAdmin: user?.role === 'admin',
         loading
      }}
    >
    {!loading && children} {/* ⬅️ PENTING */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
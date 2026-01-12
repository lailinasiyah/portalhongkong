
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Definisi User Lists berdasarkan permintaan
const ADMIN_USERS = ['alivia', 'rani', 'lailin'];
const VISITOR_USERS = ['agency', 'victor', 'wesley', 'daia', 'dewe', 'elis', 'atik', 'indah'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mss_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulasi delay keamanan
    await new Promise(r => setTimeout(r, 800));
    
    const lowerUsername = username.toLowerCase();
    
    // Validasi Password Spesifik: password harus sama dengan username + '123'
    if (password !== lowerUsername + '123') return false;

    let role: 'admin' | 'user' | null = null;

    if (ADMIN_USERS.includes(lowerUsername)) {
      role = 'admin';
    } else if (VISITOR_USERS.includes(lowerUsername)) {
      role = 'user';
    }

    if (role) {
      const newUser: User = { username: lowerUsername, role };
      setUser(newUser);
      localStorage.setItem('mss_auth_user', JSON.stringify(newUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mss_auth_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

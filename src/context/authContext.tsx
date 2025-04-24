'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
  photo?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <- Adicionado
  const router = useRouter();

  useEffect(() => {
    const savedToken = Cookies.get('auth_token');
    const savedUserRaw = localStorage.getItem('user');

    if (savedToken && savedUserRaw) {
      try {
        const parsedUser = JSON.parse(savedUserRaw);
        if (parsedUser?.id && parsedUser?.email) {
          setToken(savedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          Cookies.remove('auth_token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Erro ao fazer parse do usuário:', error);
        Cookies.remove('auth_token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false); // <- Finaliza o carregamento
  }, []);

  const login = (userData: User, token: string) => {
    Cookies.set('auth_token', token, {
      expires: 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(token);
    setIsAuthenticated(true);
    router.push('/');
  };

  const logout = () => {
    Cookies.remove('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

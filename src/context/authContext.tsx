'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface Course {
  id: string | number;
  name: string;
  code: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: number;
  avatar?: string;
  created_at?: string;
  course?: Course;
  course_id?: string | number;
  approval_status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUserData: (newData: Partial<User>) => void; 
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    Cookies.set('auth_token', token, {
      expires: 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
    // Os IDs já vêm como strings do interceptor axios, mas garantimos aqui também
    const userWithStringIds = {
      ...userData,
      id: String(userData.id),
      course_id: userData.course_id ? String(userData.course_id) : undefined,
      course: userData.course ? {
        ...userData.course,
        id: String(userData.course.id)
      } : undefined
    };
    
    localStorage.setItem('user', JSON.stringify(userWithStringIds));
    setUser(userWithStringIds);
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

  const updateUserData = (newData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...newData };
      
      // Garantir que IDs sejam strings para evitar perda de precisão
      const userWithStringIds = {
        ...updatedUser,
        id: String(updatedUser.id),
        course_id: updatedUser.course_id ? String(updatedUser.course_id) : undefined,
        course: updatedUser.course ? {
          ...updatedUser.course,
          id: String(updatedUser.course.id)
        } : undefined
      };
      
      setUser(userWithStringIds);
      localStorage.setItem('user', JSON.stringify(userWithStringIds));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUserData, isAuthenticated, isLoading }}
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

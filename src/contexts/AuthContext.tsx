import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and auto-login for development
    setTimeout(() => {
      // Auto-login for development - remove this in production
      const mockUser: User = {
        uid: 'demo-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: undefined,
      };
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        uid: 'demo-user-id',
        email: email,
        displayName: email.split('@')[0],
        photoURL: undefined,
      };
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Mock registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        uid: 'demo-user-id',
        email: email,
        displayName: displayName,
        photoURL: undefined,
      };
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Hesap oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Mock Google sign in
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        uid: 'demo-user-id',
        email: 'demo@gmail.com',
        displayName: 'Demo User',
        photoURL: undefined,
      };
      
      setUser(mockUser);
    } catch (error) {
      throw new Error('Google ile giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};